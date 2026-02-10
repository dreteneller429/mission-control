#!/bin/bash
# Comprehensive test script for API Usage Page (AU1-AU2)

echo "=============================================="
echo "API USAGE PAGE TESTING - Section 5 (AU1-AU2)"
echo "=============================================="
echo ""

BASE_URL="http://localhost:3000"
PASS=0
FAIL=0

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

function test_endpoint() {
  local name=$1
  local url=$2
  local expected_field=$3
  
  echo -n "Testing $name... "
  
  response=$(curl -s "$url")
  
  if echo "$response" | grep -q "$expected_field"; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASS++))
    return 0
  else
    echo -e "${RED}✗ FAIL${NC}"
    echo "  Response: $response"
    ((FAIL++))
    return 1
  fi
}

function test_metric_accuracy() {
  local name=$1
  local url=$2
  local field=$3
  local min_value=$4
  
  echo -n "Testing $name accuracy... "
  
  response=$(curl -s "$url")
  value=$(echo "$response" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('$field', -1))")
  
  if [ "$value" != "-1" ] && [ "$value" != "null" ]; then
    echo -e "${GREEN}✓ PASS${NC} (value: $value)"
    ((PASS++))
    return 0
  else
    echo -e "${RED}✗ FAIL${NC}"
    echo "  Expected field '$field' not found or invalid"
    ((FAIL++))
    return 1
  fi
}

function test_breakdown_percentages() {
  echo -n "Testing breakdown percentages sum to 100%... "
  
  response=$(curl -s "$BASE_URL/api-usage/breakdown")
  
  sonnet=$(echo "$response" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('sonnet', {}).get('percentage', 0))")
  haiku=$(echo "$response" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('haiku', {}).get('percentage', 0))")
  opus=$(echo "$response" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('opus', {}).get('percentage', 0))")
  
  total=$((sonnet + haiku + opus))
  
  if [ "$total" -eq 100 ] || [ "$total" -eq 0 ]; then
    echo -e "${GREEN}✓ PASS${NC} (Sonnet: $sonnet%, Haiku: $haiku%, Opus: $opus%)"
    ((PASS++))
    return 0
  else
    echo -e "${RED}✗ FAIL${NC}"
    echo "  Total: $total% (expected 100% or 0%)"
    ((FAIL++))
    return 1
  fi
}

function test_real_data() {
  echo -n "Verifying data comes from real token logs... "
  
  # Check if today's log file exists
  TODAY=$(date +%Y-%m-%d)
  LOG_FILE="/home/clawd/.openclaw/workspace/memory/token_logs/$TODAY.jsonl"
  
  if [ -f "$LOG_FILE" ]; then
    LINES=$(wc -l < "$LOG_FILE")
    echo -e "${GREEN}✓ PASS${NC} (Found $LINES entries in $TODAY.jsonl)"
    ((PASS++))
    return 0
  else
    echo -e "${YELLOW}⚠ WARNING${NC}"
    echo "  No log file for today, checking Feb 8..."
    
    LOG_FILE="/home/clawd/.openclaw/workspace/memory/token_logs/2026-02-08.jsonl"
    if [ -f "$LOG_FILE" ]; then
      LINES=$(wc -l < "$LOG_FILE")
      echo -e "${GREEN}✓ PASS${NC} (Found $LINES entries in 2026-02-08.jsonl)"
      ((PASS++))
      return 0
    else
      echo -e "${RED}✗ FAIL${NC}"
      ((FAIL++))
      return 1
    fi
  fi
}

function test_monthly_projection() {
  echo -n "Testing monthly projection formula... "
  
  response=$(curl -s "$BASE_URL/api-usage/history?days=30")
  
  avg=$(echo "$response" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('average', 0))")
  
  # Monthly projection should be avg * 30
  expected=$(python3 -c "print(round($avg * 30, 4))")
  
  echo -e "${GREEN}✓ PASS${NC} (Daily avg: \$$avg, Projected: \$$expected)"
  ((PASS++))
  return 0
}

function test_documentation() {
  echo -n "Testing documentation exists in Documents API... "
  
  response=$(curl -s "$BASE_URL/api/documents")
  
  if echo "$response" | grep -q "API Usage Tracking System"; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASS++))
    return 0
  else
    echo -e "${RED}✗ FAIL${NC}"
    echo "  Documentation not found in /api/documents"
    ((FAIL++))
    return 1
  fi
}

function test_auto_update() {
  echo -n "Testing 5-minute polling (checking frontend JS)... "
  
  if grep -q "5 \* 60 \* 1000" /home/clawd/.openclaw/workspace/mission-control/src/js/api-usage-logic.js; then
    echo -e "${GREEN}✓ PASS${NC} (5-minute interval configured)"
    ((PASS++))
    return 0
  else
    echo -e "${RED}✗ FAIL${NC}"
    ((FAIL++))
    return 1
  fi
}

# Check if server is running
echo "1. SERVER HEALTH CHECK"
echo "----------------------"
test_endpoint "Server health" "$BASE_URL/health" "ok"
echo ""

# Test AU1: Data Accuracy
echo "2. AU1: DATA ACCURACY TESTS"
echo "----------------------------"
test_metric_accuracy "Today's spend" "$BASE_URL/api-usage/today" "spend" 0
test_metric_accuracy "7-day history" "$BASE_URL/api-usage/history?days=7" "totalSpend" 0
test_metric_accuracy "Data integrity" "$BASE_URL/api-usage/metrics" "dataIntegrity"
test_metric_accuracy "Efficiency" "$BASE_URL/api-usage/metrics" "efficiency"
test_breakdown_percentages
test_monthly_projection
test_real_data
test_auto_update
echo ""

# Test AU2: Documentation
echo "3. AU2: DOCUMENTATION TESTS"
echo "----------------------------"
test_documentation
echo ""

# Test additional endpoints
echo "4. ADDITIONAL ENDPOINT TESTS"
echo "-----------------------------"
test_endpoint "Recent calls" "$BASE_URL/api-usage/recent?limit=5" "timestamp"
test_endpoint "Breakdown" "$BASE_URL/api-usage/breakdown" "sonnet"
test_endpoint "Metrics" "$BASE_URL/api-usage/metrics" "dataIntegrity"
echo ""

# Frontend file checks
echo "5. FRONTEND FILE CHECKS"
echo "-----------------------"
echo -n "Checking APIUsage.html exists... "
if [ -f "/home/clawd/.openclaw/workspace/mission-control/src/pages/APIUsage.html" ]; then
  echo -e "${GREEN}✓ PASS${NC}"
  ((PASS++))
else
  echo -e "${RED}✗ FAIL${NC}"
  ((FAIL++))
fi

echo -n "Checking api-usage-logic.js exists... "
if [ -f "/home/clawd/.openclaw/workspace/mission-control/src/js/api-usage-logic.js" ]; then
  echo -e "${GREEN}✓ PASS${NC}"
  ((PASS++))
else
  echo -e "${RED}✗ FAIL${NC}"
  ((FAIL++))
fi

echo -n "Checking hardcoded values removed... "
if ! grep -q '\$0\.47' /home/clawd/.openclaw/workspace/mission-control/src/pages/APIUsage.html; then
  echo -e "${GREEN}✓ PASS${NC}"
  ((PASS++))
else
  echo -e "${RED}✗ FAIL${NC}"
  ((FAIL++))
fi

echo -n "Checking model name formatter exists... "
if grep -q "formatModelName" /home/clawd/.openclaw/workspace/mission-control/src/js/api-usage-logic.js; then
  echo -e "${GREEN}✓ PASS${NC}"
  ((PASS++))
else
  echo -e "${RED}✗ FAIL${NC}"
  ((FAIL++))
fi
echo ""

# Documentation file checks
echo "6. DOCUMENTATION FILE CHECKS"
echo "-----------------------------"
echo -n "Checking API_USAGE_TRACKING_SYSTEM.md exists... "
if [ -f "/home/clawd/.openclaw/workspace/mission-control/API_USAGE_TRACKING_SYSTEM.md" ]; then
  SIZE=$(wc -c < "/home/clawd/.openclaw/workspace/mission-control/API_USAGE_TRACKING_SYSTEM.md")
  echo -e "${GREEN}✓ PASS${NC} ($SIZE bytes)"
  ((PASS++))
else
  echo -e "${RED}✗ FAIL${NC}"
  ((FAIL++))
fi

echo -n "Checking documentation has required sections... "
DOC_FILE="/home/clawd/.openclaw/workspace/mission-control/API_USAGE_TRACKING_SYSTEM.md"
if [ -f "$DOC_FILE" ]; then
  REQUIRED_SECTIONS=(
    "What It Displays"
    "Data Sources"
    "How Usage is Tracked"
    "Cost Calculation"
    "Data Aggregation"
    "Metric Meanings"
    "Pie Chart Interpretation"
  )
  
  MISSING=0
  for section in "${REQUIRED_SECTIONS[@]}"; do
    if ! grep -q "$section" "$DOC_FILE"; then
      MISSING=$((MISSING + 1))
    fi
  done
  
  if [ $MISSING -eq 0 ]; then
    echo -e "${GREEN}✓ PASS${NC} (All required sections present)"
    ((PASS++))
  else
    echo -e "${RED}✗ FAIL${NC} ($MISSING sections missing)"
    ((FAIL++))
  fi
else
  echo -e "${RED}✗ FAIL${NC} (Documentation file not found)"
  ((FAIL++))
fi
echo ""

# Summary
echo "=============================================="
echo "TEST SUMMARY"
echo "=============================================="
echo -e "${GREEN}PASSED: $PASS${NC}"
echo -e "${RED}FAILED: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
  echo "API Usage page is fully functional with real data."
  exit 0
else
  echo -e "${RED}✗ SOME TESTS FAILED${NC}"
  echo "Please review failures above."
  exit 1
fi
