#!/bin/bash

# Mission Control V4 API Test Suite
# This script tests all endpoints to ensure they're working correctly

BASE_URL="http://localhost:3000"
echo "=== Mission Control V4 API - Endpoint Test Suite ==="
echo "Time: $(date)"
echo "Base URL: $BASE_URL"
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

test_endpoint() {
  local method=$1
  local endpoint=$2
  local data=$3
  local desc=$4
  local expect_status=${5:-200}
  
  ((TOTAL_TESTS++))
  
  if [ -z "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" -H "Content-Type: application/json")
  else
    response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" -H "Content-Type: application/json" -d "$data")
  fi
  
  http_code=$(echo "$response" | tail -1)
  body=$(echo "$response" | head -n-1)
  
  if [ "$http_code" = "$expect_status" ] || [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    if echo "$body" | jq . >/dev/null 2>&1; then
      echo -e "${GREEN}✓${NC} [$http_code] $method $endpoint - $desc"
      ((TESTS_PASSED++))
      return 0
    else
      echo -e "${RED}✗${NC} [$http_code] $method $endpoint - Invalid JSON: $desc"
      ((TESTS_FAILED++))
      return 1
    fi
  else
    echo -e "${RED}✗${NC} [$http_code] $method $endpoint - Expected $expect_status: $desc"
    ((TESTS_FAILED++))
    return 1
  fi
}

echo -e "${BLUE}=== System Health ===${NC}"
test_endpoint GET "/health" "" "Server health check"
echo ""

echo -e "${BLUE}=== Workshop Tasks Management ===${NC}"
test_endpoint GET "/api/workshop/tasks" "" "List all tasks"
TASK_DATA='{"title":"Complete API Backend","description":"Finish implementing all endpoints","tags":["api","backend"],"priority":"high"}'
test_endpoint POST "/api/workshop/tasks" "$TASK_DATA" "Create new task" 201
test_endpoint GET "/api/workshop/tasks" "" "List tasks after creation"
echo ""

echo -e "${BLUE}=== Intelligence Reports ===${NC}"
test_endpoint GET "/api/intelligence" "" "List intelligence reports"
INTEL_DATA='{"title":"Market Analysis Report","category":"strategic","content":"Detailed market trends","impact_summary":"10x growth potential","strategy_summary":"Execute expansion plan"}'
test_endpoint POST "/api/intelligence" "$INTEL_DATA" "Create intelligence report" 201
test_endpoint GET "/api/intelligence" "" "List reports after creation"
echo ""

echo -e "${BLUE}=== Cron Job Management ===${NC}"
test_endpoint GET "/api/cron" "" "List cron jobs"
CRON_DATA='{"name":"Daily Backup","description":"Run daily backup job","schedule":"0 2 * * *"}'
test_endpoint POST "/api/cron" "$CRON_DATA" "Create cron job" 201
test_endpoint GET "/api/cron" "" "List jobs after creation"
echo ""

echo -e "${BLUE}=== Agents ===${NC}"
test_endpoint GET "/api/agents" "" "List all agents"
echo ""

echo -e "${BLUE}=== Communications ===${NC}"
test_endpoint GET "/api/comms/messages" "" "Get message history"
MSG_DATA='{"sender_id":"main-agent","sender_name":"Main Agent","message_text":"API testing in progress","avatar":"🤖"}'
test_endpoint POST "/api/comms/messages" "$MSG_DATA" "Send message" 201
test_endpoint GET "/api/comms/messages?limit=5" "" "Get recent messages (limit 5)"
echo ""

echo -e "${BLUE}=== Documents ===${NC}"
test_endpoint GET "/api/documents" "" "List documents"
DOC_DATA='{"title":"API Documentation","category":"technical","content":"Complete API reference guide"}'
test_endpoint POST "/api/documents" "$DOC_DATA" "Create document" 201
test_endpoint GET "/api/documents" "" "List documents after creation"
echo ""

echo -e "${BLUE}=== Clients ===${NC}"
test_endpoint GET "/api/clients" "" "List clients"
CLIENT_DATA='{"name":"Acme Industries","company":"Acme","status":"active","mrr":5000,"next_action":"Schedule review"}'
test_endpoint POST "/api/clients" "$CLIENT_DATA" "Create client" 201
test_endpoint GET "/api/clients" "" "List clients after creation"
echo ""

echo -e "${BLUE}=== API Usage Tracking ===${NC}"
test_endpoint GET "/api-usage/today" "" "Get today's API spend"
test_endpoint GET "/api-usage/history" "" "Get 30-day history"
test_endpoint GET "/api-usage/breakdown" "" "Get breakdown by service"
test_endpoint GET "/api-usage/metrics" "" "Get comprehensive metrics"
test_endpoint GET "/api-usage/recent?limit=5" "" "Get recent API calls"
echo ""

echo -e "${BLUE}=== Journal ===${NC}"
JOURNAL_DATA='{"entry":"Completed API backend implementation successfully","tags":["api","completed"]}'
test_endpoint POST "/api/journal/2026-02-08" "$JOURNAL_DATA" "Add journal entry" 201
test_endpoint GET "/api/journal/2026-02-08" "" "Get journal entry for 2026-02-08"
echo ""

echo -e "${BLUE}=== Weekly Recaps ===${NC}"
RECAP_DATA='{"week":"2026-W06","start_date":"2026-02-02","end_date":"2026-02-08","summary":"Completed Mission Control V4 backend API"}'
test_endpoint POST "/api/weekly-recaps" "$RECAP_DATA" "Create weekly recap" 201
test_endpoint GET "/api/weekly-recaps" "" "List all recaps"
echo ""

echo -e "${BLUE}=== Dashboard ===${NC}"
test_endpoint GET "/api/dashboard/stats" "" "Get dashboard statistics"
test_endpoint GET "/api/dashboard/activity?limit=10" "" "Get activity feed (limit 10)"
test_endpoint GET "/api/dashboard/commits?limit=5" "" "Get recent commits (limit 5)"
echo ""

echo -e "${BLUE}=========================================${NC}"
echo -e "Tests Passed:  ${GREEN}${TESTS_PASSED}${NC}"
echo -e "Tests Failed:  ${RED}${TESTS_FAILED}${NC}"
echo -e "Total Tests:   $TOTAL_TESTS"
echo -e "${BLUE}=========================================${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ $TESTS_FAILED test(s) failed${NC}"
  exit 1
fi
