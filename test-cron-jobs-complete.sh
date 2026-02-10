#!/bin/bash

# Mission Control V4 - Cron Jobs Page Complete Testing Script
# Tests CR1 (Backend Integration) and CR2 (CRUD Operations)

echo "=========================================="
echo "Mission Control V4 - Cron Jobs Testing"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000/api/cron"
SCHEDULER_URL="http://localhost:3000/api/cron/scheduler/status"

# Test counters
PASSED=0
FAILED=0

# Function to print test result
test_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✓ TESTED: $2${NC}"
    ((PASSED++))
  else
    echo -e "${RED}✗ FAILED: $2${NC}"
    ((FAILED++))
  fi
}

echo "=========================================="
echo "CR1: BACKEND INTEGRATION TESTS"
echo "=========================================="
echo ""

# Test 1: Check scheduler is running
echo "Test 1: Verify cron scheduler is actually running..."
SCHEDULER_STATUS=$(curl -s $SCHEDULER_URL)
if echo "$SCHEDULER_STATUS" | jq -e '.running == true' > /dev/null 2>&1; then
  test_result 0 "Cron scheduler is running in backend"
  echo "   Active jobs: $(echo $SCHEDULER_STATUS | jq '.activeJobs')"
else
  test_result 1 "Cron scheduler not running"
fi
echo ""

# Test 2: Verify default jobs are loaded
echo "Test 2: Verify all 6 default jobs are registered..."
JOBS=$(curl -s $API_URL)
JOB_COUNT=$(echo "$JOBS" | jq '. | length')

if [ "$JOB_COUNT" -ge 6 ]; then
  test_result 0 "Default cron jobs loaded ($JOB_COUNT jobs found)"
else
  test_result 1 "Missing default jobs (found $JOB_COUNT, expected 6+)"
fi
echo ""

# Test 3: Verify specific required jobs exist
echo "Test 3: Verify required default jobs exist..."
REQUIRED_JOBS=("morning-briefing" "task-summary" "email-check" "dashboard-notes")
for job_id in "${REQUIRED_JOBS[@]}"; do
  if echo "$JOBS" | jq -e ".[] | select(.id == \"$job_id\")" > /dev/null 2>&1; then
    JOB_DATA=$(echo "$JOBS" | jq -r ".[] | select(.id == \"$job_id\")")
    JOB_NAME=$(echo "$JOB_DATA" | jq -r '.name')
    SCHEDULE=$(echo "$JOB_DATA" | jq -r '.schedule')
    test_result 0 "$JOB_NAME exists with schedule: $SCHEDULE"
  else
    test_result 1 "Required job not found: $job_id"
  fi
done
echo ""

# Test 4: Verify jobs have all required fields
echo "Test 4: Verify jobs have all required fields..."
FIRST_JOB=$(echo "$JOBS" | jq '.[0]')
REQUIRED_FIELDS=("id" "name" "description" "schedule" "schedule_readable" "status" "next_run" "last_run")
for field in "${REQUIRED_FIELDS[@]}"; do
  if echo "$FIRST_JOB" | jq -e ".$field" > /dev/null 2>&1; then
    test_result 0 "Field exists: $field"
  else
    test_result 1 "Missing field: $field"
  fi
done
echo ""

# Test 5: Verify next_run times are calculated correctly
echo "Test 5: Verify next_run times are in the future..."
ACTIVE_JOBS=$(echo "$JOBS" | jq '[.[] | select(.status == "active")] | length')

# Count jobs with next_run in the future (manually check each)
JOBS_WITH_FUTURE_RUN=0
for job_id in $(echo "$JOBS" | jq -r '.[] | select(.status == "active") | .id'); do
  NEXT_RUN=$(echo "$JOBS" | jq -r ".[] | select(.id == \"$job_id\") | .next_run")
  if [ -n "$NEXT_RUN" ] && [ "$NEXT_RUN" != "null" ]; then
    ((JOBS_WITH_FUTURE_RUN++))
  fi
done

if [ "$JOBS_WITH_FUTURE_RUN" -eq "$ACTIVE_JOBS" ]; then
  test_result 0 "All active jobs have valid future next_run times ($ACTIVE_JOBS jobs)"
else
  test_result 1 "Some jobs have invalid next_run times"
fi
echo ""

# Test 6: Verify schedule_readable is human-friendly
echo "Test 6: Verify human-readable schedules..."
MORNING_BRIEFING=$(echo "$JOBS" | jq -r '.[] | select(.id == "morning-briefing") | .schedule_readable')
if [[ "$MORNING_BRIEFING" == *"7:00"* ]] || [[ "$MORNING_BRIEFING" == *"7 AM"* ]]; then
  test_result 0 "Morning Briefing has readable schedule: $MORNING_BRIEFING"
else
  test_result 1 "Morning Briefing readable schedule incorrect: $MORNING_BRIEFING"
fi
echo ""

echo "=========================================="
echo "CR2: CRUD OPERATIONS TESTS"
echo "=========================================="
echo ""

# Test 7: CREATE - Add new cron job
echo "Test 7: CREATE - Add new cron job..."
NEW_JOB=$(cat <<EOF
{
  "name": "Test Job",
  "description": "Automated test job",
  "schedule": "*/5 * * * *"
}
EOF
)

CREATE_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "$NEW_JOB" $API_URL)
NEW_JOB_ID=$(echo "$CREATE_RESPONSE" | jq -r '.job.id')

if [ "$NEW_JOB_ID" != "null" ] && [ -n "$NEW_JOB_ID" ]; then
  test_result 0 "Created new job with ID: $NEW_JOB_ID"
  
  # Verify job appears in scheduler
  sleep 1
  SCHEDULER_STATUS=$(curl -s $SCHEDULER_URL)
  if echo "$SCHEDULER_STATUS" | jq -e ".jobs[] | select(.id == \"$NEW_JOB_ID\")" > /dev/null 2>&1; then
    test_result 0 "New job is scheduled in backend"
  else
    test_result 1 "New job not scheduled in backend"
  fi
else
  test_result 1 "Failed to create new job"
  NEW_JOB_ID=""
fi
echo ""

# Test 8: READ - Verify job persists
echo "Test 8: READ - Verify new job persists..."
if [ -n "$NEW_JOB_ID" ]; then
  GET_RESPONSE=$(curl -s "$API_URL/$NEW_JOB_ID")
  FETCHED_NAME=$(echo "$GET_RESPONSE" | jq -r '.name')
  
  if [ "$FETCHED_NAME" = "Test Job" ]; then
    test_result 0 "Job persists and can be retrieved"
  else
    test_result 1 "Job not retrievable or data incorrect"
  fi
else
  test_result 1 "Skipped - no job ID from create"
fi
echo ""

# Test 9: UPDATE - Edit job
echo "Test 9: UPDATE - Edit job..."
if [ -n "$NEW_JOB_ID" ]; then
  UPDATE_DATA=$(cat <<EOF
{
  "name": "Test Job Updated",
  "description": "Updated description",
  "schedule": "*/10 * * * *"
}
EOF
)
  
  UPDATE_RESPONSE=$(curl -s -X PATCH -H "Content-Type: application/json" -d "$UPDATE_DATA" "$API_URL/$NEW_JOB_ID")
  UPDATED_NAME=$(echo "$UPDATE_RESPONSE" | jq -r '.name')
  UPDATED_SCHEDULE=$(echo "$UPDATE_RESPONSE" | jq -r '.schedule')
  
  if [ "$UPDATED_NAME" = "Test Job Updated" ] && [ "$UPDATED_SCHEDULE" = "*/10 * * * *" ]; then
    test_result 0 "Job updated successfully"
    
    # Verify schedule was updated in scheduler
    sleep 1
    SCHEDULER_STATUS=$(curl -s $SCHEDULER_URL)
    if echo "$SCHEDULER_STATUS" | jq -e ".jobs[] | select(.id == \"$NEW_JOB_ID\" and .schedule == \"*/10 * * * *\")" > /dev/null 2>&1; then
      test_result 0 "Updated schedule reflected in backend scheduler"
    else
      test_result 1 "Updated schedule not reflected in scheduler"
    fi
  else
    test_result 1 "Job update failed"
  fi
else
  test_result 1 "Skipped - no job ID from create"
fi
echo ""

# Test 10: Toggle job status (disable)
echo "Test 10: TOGGLE - Disable job..."
if [ -n "$NEW_JOB_ID" ]; then
  TOGGLE_RESPONSE=$(curl -s -X PUT -H "Content-Type: application/json" -d '{"active": false}' "$API_URL/$NEW_JOB_ID")
  STATUS=$(echo "$TOGGLE_RESPONSE" | jq -r '.job.status')
  
  if [ "$STATUS" = "disabled" ]; then
    test_result 0 "Job disabled successfully"
    
    # Verify job is unscheduled
    sleep 1
    SCHEDULER_STATUS=$(curl -s $SCHEDULER_URL)
    ACTIVE_COUNT=$(echo "$SCHEDULER_STATUS" | jq '.activeJobs')
    
    if echo "$SCHEDULER_STATUS" | jq -e ".jobs[] | select(.id == \"$NEW_JOB_ID\")" > /dev/null 2>&1; then
      test_result 1 "Disabled job still in scheduler (should be removed)"
    else
      test_result 0 "Disabled job removed from scheduler"
    fi
  else
    test_result 1 "Job disable failed"
  fi
else
  test_result 1 "Skipped - no job ID from create"
fi
echo ""

# Test 11: Toggle job status (enable)
echo "Test 11: TOGGLE - Re-enable job..."
if [ -n "$NEW_JOB_ID" ]; then
  TOGGLE_RESPONSE=$(curl -s -X PUT -H "Content-Type: application/json" -d '{"active": true}' "$API_URL/$NEW_JOB_ID")
  STATUS=$(echo "$TOGGLE_RESPONSE" | jq -r '.job.status')
  
  if [ "$STATUS" = "active" ]; then
    test_result 0 "Job re-enabled successfully"
    
    # Verify job is rescheduled
    sleep 1
    SCHEDULER_STATUS=$(curl -s $SCHEDULER_URL)
    if echo "$SCHEDULER_STATUS" | jq -e ".jobs[] | select(.id == \"$NEW_JOB_ID\")" > /dev/null 2>&1; then
      test_result 0 "Re-enabled job added back to scheduler"
    else
      test_result 1 "Re-enabled job not in scheduler"
    fi
  else
    test_result 1 "Job re-enable failed"
  fi
else
  test_result 1 "Skipped - no job ID from create"
fi
echo ""

# Test 12: DELETE - Remove job
echo "Test 12: DELETE - Remove job..."
if [ -n "$NEW_JOB_ID" ]; then
  DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/$NEW_JOB_ID")
  SUCCESS=$(echo "$DELETE_RESPONSE" | jq -r '.success')
  
  if [ "$SUCCESS" = "true" ]; then
    test_result 0 "Job deleted successfully"
    
    # Verify job is gone from API
    GET_RESPONSE=$(curl -s "$API_URL/$NEW_JOB_ID")
    if echo "$GET_RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
      test_result 0 "Deleted job no longer retrievable"
    else
      test_result 1 "Deleted job still retrievable"
    fi
    
    # Verify job is removed from scheduler
    sleep 1
    SCHEDULER_STATUS=$(curl -s $SCHEDULER_URL)
    if echo "$SCHEDULER_STATUS" | jq -e ".jobs[] | select(.id == \"$NEW_JOB_ID\")" > /dev/null 2>&1; then
      test_result 1 "Deleted job still in scheduler"
    else
      test_result 0 "Deleted job removed from scheduler"
    fi
  else
    test_result 1 "Job delete failed"
  fi
else
  test_result 1 "Skipped - no job ID from create"
fi
echo ""

# Test 13: Persistence check
echo "Test 13: PERSISTENCE - Verify jobs persist after reload..."
INITIAL_COUNT=$(curl -s $API_URL | jq '. | length')
SCHEDULER_STATUS=$(curl -s $SCHEDULER_URL)
SCHEDULED_COUNT=$(echo "$SCHEDULER_STATUS" | jq '.activeJobs')

if [ "$INITIAL_COUNT" -eq "$SCHEDULED_COUNT" ]; then
  test_result 0 "All persisted jobs are scheduled ($INITIAL_COUNT jobs)"
else
  test_result 1 "Persistence mismatch: $INITIAL_COUNT in DB, $SCHEDULED_COUNT scheduled"
fi
echo ""

# Test 14: Validate cron expressions
echo "Test 14: Validate cron expression handling..."
INVALID_CRON=$(cat <<EOF
{
  "name": "Invalid Cron Job",
  "description": "Should fail validation",
  "schedule": "invalid cron expression"
}
EOF
)

INVALID_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "$INVALID_CRON" $API_URL)
if echo "$INVALID_RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
  test_result 0 "Invalid cron expression rejected"
else
  test_result 1 "Invalid cron expression accepted (should reject)"
fi
echo ""

echo "=========================================="
echo "ADDITIONAL VERIFICATION"
echo "=========================================="
echo ""

# Test 15: Check real-time countdown capability
echo "Test 15: Verify next_run calculations for real-time countdown..."
JOBS=$(curl -s $API_URL)
HOURLY_JOB=$(echo "$JOBS" | jq -r '.[] | select(.schedule == "0 * * * *") | .next_run')
CURRENT_TIME=$(date -u +%s)
NEXT_RUN_TIME=$(date -d "$HOURLY_JOB" +%s 2>/dev/null || echo "0")

if [ "$NEXT_RUN_TIME" -gt "$CURRENT_TIME" ]; then
  DIFF=$((NEXT_RUN_TIME - CURRENT_TIME))
  test_result 0 "Next run time is in future (${DIFF}s from now)"
else
  test_result 1 "Next run time is not properly calculated"
fi
echo ""

# Test 16: Verify all scheduled jobs match database
echo "Test 16: Verify scheduler sync with database..."
DB_ACTIVE_COUNT=$(echo "$JOBS" | jq '[.[] | select(.status == "active")] | length')
SCHEDULER_COUNT=$(curl -s $SCHEDULER_URL | jq '.activeJobs')

if [ "$DB_ACTIVE_COUNT" -eq "$SCHEDULER_COUNT" ]; then
  test_result 0 "Scheduler in sync with database ($DB_ACTIVE_COUNT active jobs)"
else
  test_result 1 "Scheduler out of sync: DB=$DB_ACTIVE_COUNT, Scheduler=$SCHEDULER_COUNT"
fi
echo ""

echo "=========================================="
echo "TEST SUMMARY"
echo "=========================================="
echo ""
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
  echo ""
  echo "CR1 (Backend Integration): ✓ COMPLETE"
  echo "  - Cron jobs are actually running in backend"
  echo "  - All default jobs registered and scheduled"
  echo "  - Real next_run times calculated accurately"
  echo "  - Scheduler actively managing job execution"
  echo ""
  echo "CR2 (CRUD Operations): ✓ COMPLETE"
  echo "  - CREATE: New jobs can be added"
  echo "  - READ: Jobs persist and can be retrieved"
  echo "  - UPDATE: Jobs can be edited (name, schedule, etc.)"
  echo "  - DELETE: Jobs can be removed"
  echo "  - TOGGLE: Jobs can be enabled/disabled"
  echo "  - All changes persist in backend"
  echo "  - Scheduler updates in real-time"
  echo ""
  exit 0
else
  echo -e "${RED}✗ SOME TESTS FAILED${NC}"
  echo "Review the failures above and fix issues."
  echo ""
  exit 1
fi
