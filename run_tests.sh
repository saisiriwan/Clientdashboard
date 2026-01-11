#!/bin/bash

# ==========================================
# Test Runner Script
# ==========================================

echo "🧪 Running Unit Tests for Fitness Training System"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Install dependencies
echo "📦 Installing test dependencies..."
go get github.com/stretchr/testify
go get github.com/DATA-DOG/go-sqlmock
echo ""

# Run all tests with coverage
echo "🏃 Running all tests with coverage..."
echo "--------------------------------------"
go test -v -cover ./internal/middleware/... ./internal/handler/... ./internal/repository/... ./test/...

# Check if tests passed
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ All tests passed!${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Some tests failed!${NC}"
    echo ""
    exit 1
fi

# Generate coverage report
echo "📊 Generating coverage report..."
echo "--------------------------------------"
go test -coverprofile=coverage.out ./internal/middleware/... ./internal/handler/... ./internal/repository/...
go tool cover -html=coverage.out -o coverage.html

echo ""
echo -e "${GREEN}✅ Coverage report generated: coverage.html${NC}"
echo ""

# Show coverage summary
echo "📈 Coverage Summary:"
echo "--------------------------------------"
go tool cover -func=coverage.out | grep total

echo ""
echo "=================================================="
echo -e "${GREEN}🎉 Testing complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Open coverage.html in browser to see detailed coverage"
echo "  2. Review any failed tests above"
echo "  3. Fix failing tests and run again"
echo ""
