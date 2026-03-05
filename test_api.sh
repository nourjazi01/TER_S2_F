#!/bin/bash

# Script de test de l'API Pac-Man Maze Generator
# Usage: ./test_api.sh [API_URL]

# Configuration
API_URL="${1:-http://localhost:5000}"
echo "Testing API at: $API_URL"
echo "================================"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
PASSED=0
FAILED=0

# Test 1: Health check
echo -e "${YELLOW}Test 1: Health check...${NC}"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/)
if [ $STATUS -eq 200 ]; then
    echo -e "${GREEN}✓ PASS: API is reachable (HTTP $STATUS)${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL: API returned HTTP $STATUS${NC}"
    ((FAILED++))
fi

# Test 2: Get default maze
echo -e "\n${YELLOW}Test 2: Get default maze...${NC}"
RESPONSE=$(curl -s $API_URL/api/maze)
if echo $RESPONSE | python3 -c "import sys, json; json.load(sys.stdin)" 2>/dev/null; then
    echo -e "${GREEN}✓ PASS: Received valid JSON${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL: Invalid JSON response${NC}"
    ((FAILED++))
fi

# Test 3: Generate 30x30 maze
echo -e "\n${YELLOW}Test 3: Generate 30x30 maze...${NC}"
RESPONSE=$(curl -s -X POST $API_URL/api/generate-maze \
    -H "Content-Type: application/json" \
    -d '{"width": 30, "height": 30}')

WIDTH=$(echo $RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['width'])" 2>/dev/null)
HEIGHT=$(echo $RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['height'])" 2>/dev/null)

if [ "$WIDTH" = "30" ] && [ "$HEIGHT" = "30" ]; then
    echo -e "${GREEN}✓ PASS: Dimensions are correct (30x30)${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL: Expected 30x30, got ${WIDTH}x${HEIGHT}${NC}"
    ((FAILED++))
fi

# Test 4: Generate maze with parameters
echo -e "\n${YELLOW}Test 4: Generate maze with custom parameters...${NC}"
RESPONSE=$(curl -s -X POST $API_URL/api/generate-maze \
    -H "Content-Type: application/json" \
    -d '{"width": 15, "height": 15, "playability": 0.7, "dead_end_ratio": 0.0, "cycle_intensity": 0.8}')

SUCCESS=$(echo $RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['success'])" 2>/dev/null)

if [ "$SUCCESS" = "True" ]; then
    echo -e "${GREEN}✓ PASS: Maze generated with custom parameters${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL: Failed to generate maze with parameters${NC}"
    ((FAILED++))
fi

# Test 5: Invalid dimensions should fail
echo -e "\n${YELLOW}Test 5: Invalid dimensions (should fail)...${NC}"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST $API_URL/api/generate-maze \
    -H "Content-Type: application/json" \
    -d '{"width": 100, "height": 100}')

if [ $STATUS -eq 400 ]; then
    echo -e "${GREEN}✓ PASS: Invalid dimensions rejected (HTTP $STATUS)${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL: Should have returned 400, got $STATUS${NC}"
    ((FAILED++))
fi

# Test 6: Check cell count
echo -e "\n${YELLOW}Test 6: Verify cell count (20x20 = 400 cells)...${NC}"
RESPONSE=$(curl -s -X POST $API_URL/api/generate-maze \
    -H "Content-Type: application/json" \
    -d '{"width": 20, "height": 20}')

CELL_COUNT=$(echo $RESPONSE | python3 -c "import sys, json; print(len(json.load(sys.stdin)['maze']['cells']))" 2>/dev/null)

if [ "$CELL_COUNT" = "400" ]; then
    echo -e "${GREEN}✓ PASS: Cell count is correct (400)${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL: Expected 400 cells, got $CELL_COUNT${NC}"
    ((FAILED++))
fi

# Test 7: Response time
echo -e "\n${YELLOW}Test 7: Response time check...${NC}"
START=$(date +%s%N)
curl -s -X POST $API_URL/api/generate-maze \
    -H "Content-Type: application/json" \
    -d '{"width": 15, "height": 15}' > /dev/null
END=$(date +%s%N)
ELAPSED=$(( (END - START) / 1000000 ))

if [ $ELAPSED -lt 5000 ]; then
    echo -e "${GREEN}✓ PASS: Response time OK (${ELAPSED}ms < 5000ms)${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL: Response too slow (${ELAPSED}ms)${NC}"
    ((FAILED++))
fi

# Résultats
echo ""
echo "================================"
echo -e "Results: ${GREEN}${PASSED} passed${NC}, ${RED}${FAILED} failed${NC}"
echo "================================"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed!${NC}"
    exit 1
fi
