#!/bin/bash

# Mission Control V4 - Dashboard Fixes Testing Script
# Tests all fixes D1-D7

echo "======================================================================"
echo "Mission Control V4 - Dashboard Fixes Test Suite (D1-D7)"
echo "======================================================================"
echo ""

API_BASE="http://localhost:3001"
FRONTEND_BASE="http://localhost:3000"

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

passed=0
failed=0

# Test function
test_api() {
    local name=$1
    local url=$2
    local expected_key=$3
    
    echo -n "Testing: $name... "
    response=$(curl -s "$url")
    
    if [ -z "$response" ]; then
        echo -e "${RED}FAILED${NC} - No response"
        ((failed++))
        return 1
    fi
    
    if echo "$response" | grep -q "$expected_key"; then
        echo -e "${GREEN}PASSED${NC}"
        ((passed++))
        return 0
    else
        echo -e "${RED}FAILED${NC} - Expected key '$expected_key' not found"
        echo "Response: $response"
        ((failed++))
        return 1
    fi
}

echo -e "${BLUE}[D2] Workshop Data Sync Test${NC}"
echo "----------------------------------------------------------------------"
test_api "Workshop Stats API" \
    "$API_BASE/api/dashboard/stats" \
    "total_tasks"

test_api "Workshop Tasks Endpoint" \
    "$API_BASE/api/workshop/tasks" \
    "queued"
echo ""

echo -e "${BLUE}[D5] Recent Commits Test${NC}"
echo "----------------------------------------------------------------------"
test_api "Commits API" \
    "$API_BASE/api/dashboard/commits?limit=5" \
    "commits"
echo ""

echo -e "${BLUE}[D6] Activity Feed Test${NC}"
echo "----------------------------------------------------------------------"
test_api "Activity Feed API" \
    "$API_BASE/api/dashboard/activity?limit=5" \
    "activities"
echo ""

echo -e "${BLUE}[D3] Agents Data Test${NC}"
echo "----------------------------------------------------------------------"
test_api "Agents API" \
    "$API_BASE/api/agents" \
    "agent"
echo ""

echo ""
echo "======================================================================"
echo "Backend API Tests Summary"
echo "======================================================================"
echo -e "Passed: ${GREEN}$passed${NC}"
echo -e "Failed: ${RED}$failed${NC}"
echo ""

# Test Workshop Data Consistency
echo -e "${BLUE}[D2] Data Consistency Verification${NC}"
echo "----------------------------------------------------------------------"
echo "Checking if Dashboard stats match Workshop stats..."

dashboard_stats=$(curl -s "$API_BASE/api/dashboard/stats")
workshop_stats=$(curl -s "$API_BASE/api/workshop/tasks")

dashboard_total=$(echo "$dashboard_stats" | jq -r '.total_tasks')
workshop_total=$(echo "$workshop_stats" | jq -r '.stats.total')

echo "Dashboard total tasks: $dashboard_total"
echo "Workshop total tasks: $workshop_total"

if [ "$dashboard_total" == "$workshop_total" ]; then
    echo -e "${GREEN}✓ PASSED${NC} - Data is synchronized"
    ((passed++))
else
    echo -e "${RED}✗ FAILED${NC} - Data mismatch detected"
    ((failed++))
fi
echo ""

# Frontend File Checks
echo -e "${BLUE}Frontend File Checks${NC}"
echo "----------------------------------------------------------------------"

files_to_check=(
    "src/js/dashboard-logic.js"
    "src/pages/Dashboard.html"
    "src/styles/components.css"
)

for file in "${files_to_check[@]}"; do
    echo -n "Checking $file... "
    if [ -f "$file" ]; then
        echo -e "${GREEN}EXISTS${NC}"
        ((passed++))
    else
        echo -e "${RED}MISSING${NC}"
        ((failed++))
    fi
done
echo ""

# Check for key implementations
echo -e "${BLUE}Code Implementation Checks${NC}"
echo "----------------------------------------------------------------------"

echo -n "D1: Status Modal implementation... "
if grep -q "setupStatusDetailsModal" "src/js/dashboard-logic.js"; then
    echo -e "${GREEN}FOUND${NC}"
    ((passed++))
else
    echo -e "${RED}NOT FOUND${NC}"
    ((failed++))
fi

echo -n "D5: GitHub link configuration... "
if grep -q "github.com/dreteneller429/mission-control" "src/js/dashboard-logic.js"; then
    echo -e "${GREEN}FOUND${NC}"
    ((passed++))
else
    echo -e "${RED}NOT FOUND${NC}"
    ((failed++))
fi

echo -n "D7: Quick Links handlers... "
if grep -q "setupQuickLinksHandlers" "src/js/dashboard-logic.js"; then
    echo -e "${GREEN}FOUND${NC}"
    ((passed++))
else
    echo -e "${RED}NOT FOUND${NC}"
    ((failed++))
fi

echo -n "Status Badge CSS (online/idle/working)... "
if grep -q "\.status-badge\.working" "src/styles/components.css"; then
    echo -e "${GREEN}FOUND${NC}"
    ((passed++))
else
    echo -e "${RED}NOT FOUND${NC}"
    ((failed++))
fi

echo ""
echo "======================================================================"
echo "FINAL TEST RESULTS"
echo "======================================================================"
total=$((passed + failed))
percentage=$((passed * 100 / total))

echo -e "Total Tests: $total"
echo -e "Passed: ${GREEN}$passed${NC}"
echo -e "Failed: ${RED}$failed${NC}"
echo -e "Success Rate: ${BLUE}${percentage}%${NC}"
echo ""

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}✓✓✓ ALL TESTS PASSED ✓✓✓${NC}"
    echo ""
    echo "Dashboard is ready for validation!"
    exit 0
else
    echo -e "${RED}✗✗✗ SOME TESTS FAILED ✗✗✗${NC}"
    echo ""
    echo "Please review failed tests above."
    exit 1
fi
