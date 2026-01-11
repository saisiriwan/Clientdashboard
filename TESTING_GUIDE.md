# 🧪 Testing Guide

## 📋 สารบัญ
1. [ภาพรวม Unit Tests](#ภาพรวม-unit-tests)
2. [โครงสร้างไฟล์ Test](#โครงสร้างไฟล์-test)
3. [วิธีรัน Tests](#วิธีรัน-tests)
4. [Test Coverage](#test-coverage)
5. [รายละเอียดแต่ละ Test Suite](#รายละเอียดแต่ละ-test-suite)

---

## 🎯 ภาพรวม Unit Tests

### **สร้าง Tests สำหรับ:**
1. ✅ **RBAC Middleware** - 14 test cases
2. ✅ **Notification Handler** - 11 test cases
3. ✅ **Trainee Handler** - 12 test cases
4. ✅ **Notification Repository** - 8 test cases
5. ✅ **Trainee Repository** - 8 test cases

**รวมทั้งหมด: 53 test cases**

---

## 📁 โครงสร้างไฟล์ Test

```
users/
├── internal/
│   ├── middleware/
│   │   ├── rbac.go
│   │   └── rbac_test.go               ✅ 14 tests
│   ├── handler/
│   │   ├── trainee_handler.go
│   │   ├── trainee_handler_test.go    ✅ 12 tests
│   │   ├── notification_handler.go
│   │   └── notification_handler_test.go ✅ 11 tests
│   └── repository/
│       ├── trainee_repository.go
│       ├── trainee_repository_test.go ✅ 8 tests
│       ├── notification_repository.go
│       └── notification_repository_test.go ✅ 8 tests
├── test/
│   └── helpers.go                     ✅ Test helpers
├── run_tests.sh                       ✅ Test runner script
└── TESTING_GUIDE.md                   ✅ This file
```

---

## 🚀 วิธีรัน Tests

### **1. ติดตั้ง Dependencies:**
```bash
# ติดตั้ง testing libraries
go get github.com/stretchr/testify
go get github.com/DATA-DOG/go-sqlmock
```

### **2. รัน Tests ทั้งหมด:**
```bash
# แบบง่าย
go test ./...

# แบบละเอียด (verbose)
go test -v ./...

# แบบมี coverage
go test -v -cover ./...
```

### **3. รัน Test เฉพาะ Package:**
```bash
# RBAC Middleware tests
go test -v ./internal/middleware/

# Handler tests
go test -v ./internal/handler/

# Repository tests
go test -v ./internal/repository/
```

### **4. รัน Test เฉพาะ Function:**
```bash
# ตัวอย่าง: รันเฉพาะ TestRequireRole_Success
go test -v -run TestRequireRole_Success ./internal/middleware/

# ตัวอย่าง: รันเฉพาะ tests ที่มี "Notification" ในชื่อ
go test -v -run Notification ./internal/handler/
```

### **5. ใช้ Test Runner Script:**
```bash
# ให้สิทธิ์ execute
chmod +x run_tests.sh

# รัน script
./run_tests.sh
```

---

## 📊 Test Coverage

### **สร้าง Coverage Report:**
```bash
# สร้าง coverage profile
go test -coverprofile=coverage.out ./...

# ดู coverage summary
go tool cover -func=coverage.out

# สร้าง HTML report
go tool cover -html=coverage.out -o coverage.html

# เปิดดูใน browser
open coverage.html  # macOS
xdg-open coverage.html  # Linux
start coverage.html  # Windows
```

### **Target Coverage:**
- 🎯 **Middleware**: ≥ 90%
- 🎯 **Handlers**: ≥ 85%
- 🎯 **Repositories**: ≥ 80%

---

## 🧪 รายละเอียดแต่ละ Test Suite

### **1️⃣ RBAC Middleware Tests** (`rbac_test.go`)

#### **Test Cases (14):**

##### **RequireRole Tests:**
1. ✅ `TestRequireRole_Success` - User ที่มี role ถูกต้องสามารถเข้าถึงได้
2. ✅ `TestRequireRole_Forbidden` - User ที่มี role ไม่ถูกต้องถูกปฏิเสธ
3. ✅ `TestRequireRole_Unauthorized` - User ที่ไม่มี role ถูกปฏิเสธ
4. ✅ `TestRequireRole_MultipleRoles` - รองรับหลาย roles

##### **RequireTrainer Tests:**
5. ✅ `TestRequireTrainer_Success` - Trainer สามารถเข้าถึงได้
6. ✅ `TestRequireTrainer_Forbidden` - Trainee ถูกปฏิเสธ

##### **RequireTrainee Tests:**
7. ✅ `TestRequireTrainee_Success` - Trainee สามารถเข้าถึงได้
8. ✅ `TestRequireTrainee_Forbidden` - Trainer ถูกปฏิเสธ

##### **AllowAll Tests:**
9. ✅ `TestAllowAll_TrainerSuccess` - Trainer สามารถเข้าถึงได้
10. ✅ `TestAllowAll_TraineeSuccess` - Trainee สามารถเข้าถึงได้
11. ✅ `TestAllowAll_UnknownRoleForbidden` - Role ที่ไม่รู้จักถูกปฏิเสธ

##### **CheckResourceOwnership Tests:**
12. ✅ `TestCheckResourceOwnership_TrainerCanAccessAll` - Trainer เข้าถึงข้อมูลทุกคนได้
13. ✅ `TestCheckResourceOwnership_TraineeCanAccessOwnOnly` - Trainee เข้าถึงข้อมูลตัวเองได้
14. ✅ `TestCheckResourceOwnership_TraineeForbiddenOthers` - Trainee ไม่สามารถเข้าถึงข้อมูลผู้อื่น

**รัน:**
```bash
go test -v ./internal/middleware/
```

---

### **2️⃣ Notification Handler Tests** (`notification_handler_test.go`)

#### **Test Cases (11):**

##### **GetNotifications Tests:**
1. ✅ `TestGetNotifications_Success` - ดึงการแจ้งเตือนสำเร็จ
2. ✅ `TestGetNotifications_WithFilters` - ดึงพร้อม filters (limit, page, type, unreadOnly)
3. ✅ `TestGetNotifications_Unauthorized` - ไม่มีสิทธิ์ (ไม่มี userID)
4. ✅ `TestGetNotifications_InternalError` - Database error

##### **MarkAsRead Tests:**
5. ✅ `TestMarkAsRead_Success` - Mark notification as read สำเร็จ
6. ✅ `TestMarkAsRead_NotFound` - ไม่พบ notification
7. ✅ `TestMarkAsRead_InvalidID` - ID ไม่ถูกต้อง
8. ✅ `TestMarkAsRead_Unauthorized` - ไม่มีสิทธิ์

##### **MarkAllAsRead Tests:**
9. ✅ `TestMarkAllAsRead_Success` - Mark all สำเร็จ
10. ✅ `TestMarkAllAsRead_Unauthorized` - ไม่มีสิทธิ์
11. ✅ `TestMarkAllAsRead_InternalError` - Database error

**รัน:**
```bash
go test -v -run Notification ./internal/handler/
```

---

### **3️⃣ Trainee Handler Tests** (`trainee_handler_test.go`)

#### **Test Cases (12):**

##### **GetUpcomingSchedules Tests:**
1. ✅ `TestGetUpcomingSchedules_Success` - ดึงนัดหมาย 7 วันข้างหน้าสำเร็จ
2. ✅ `TestGetUpcomingSchedules_WithCustomDays` - ระบุจำนวนวันเอง (14 days)
3. ✅ `TestGetUpcomingSchedules_Unauthorized` - ไม่มี clientID
4. ✅ `TestGetUpcomingSchedules_InternalError` - Database error

##### **GetScheduleByID Tests:**
5. ✅ `TestGetScheduleByID_Success` - ดึงรายละเอียดนัดหมายสำเร็จ
6. ✅ `TestGetScheduleByID_NotFound` - ไม่พบนัดหมาย
7. ✅ `TestGetScheduleByID_InvalidID` - ID ไม่ถูกต้อง

##### **GetCurrentProgram Tests:**
8. ✅ `TestGetCurrentProgram_Success` - ดึงโปรแกรมปัจจุบันสำเร็จ
9. ✅ `TestGetCurrentProgram_NotFound` - ไม่พบโปรแกรม
10. ✅ `TestGetCurrentProgram_Unauthorized` - ไม่มีสิทธิ์

##### **GetTraineeStats Tests:**
11. ✅ `TestGetTraineeStats_Success` - ดึงสถิติสำเร็จ
12. ✅ `TestGetTraineeStats_Unauthorized` - ไม่มีสิทธิ์
13. ✅ `TestGetTraineeStats_InternalError` - Database error

**รัน:**
```bash
go test -v -run Trainee ./internal/handler/
```

---

### **4️⃣ Notification Repository Tests** (`notification_repository_test.go`)

#### **Test Cases (8):**

##### **GetNotifications Tests:**
1. ✅ `TestGetNotifications_Success` - ดึงข้อมูลสำเร็จ (mock SQL)
2. ✅ `TestGetNotifications_WithFilters` - ดึงพร้อม filters

##### **MarkAsRead Tests:**
3. ✅ `TestMarkAsRead_Success` - Update สำเร็จ (1 row affected)
4. ✅ `TestMarkAsRead_NotFound` - ไม่พบข้อมูล (0 rows affected)

##### **MarkAllAsRead Tests:**
5. ✅ `TestMarkAllAsRead_Success` - Update สำเร็จ (15 rows affected)
6. ✅ `TestMarkAllAsRead_NoUnreadNotifications` - ไม่มี unread (0 rows)

##### **Other Tests:**
7. ✅ `TestGetUnreadCount_Success` - นับจำนวน unread
8. ✅ `TestCreateNotification_Success` - สร้าง notification

**รัน:**
```bash
go test -v ./internal/repository/ -run Notification
```

---

### **5️⃣ Trainee Repository Tests** (`trainee_repository_test.go`)

#### **Test Cases (8):**

##### **GetUpcomingSchedules Tests:**
1. ✅ `TestGetUpcomingSchedules_Success` - ดึงข้อมูลสำเร็จ พร้อม calendar
2. ✅ `TestGetUpcomingSchedules_NoSessions` - ไม่มี sessions

##### **GetScheduleByID Tests:**
3. ✅ `TestGetScheduleByID_Success` - ดึงข้อมูล schedule สำเร็จ
4. ✅ `TestGetScheduleByID_NotFound` - ไม่พบ schedule (sql.ErrNoRows)

##### **GetCurrentProgram Tests:**
5. ✅ `TestGetCurrentProgram_Success` - ดึงโปรแกรมสำเร็จ พร้อมคำนวณ progress
6. ✅ `TestGetCurrentProgram_NotFound` - ไม่พบโปรแกรม

##### **GetTraineeStats Tests:**
7. ✅ `TestGetTraineeStats_Success` - ดึงสถิติสำเร็จ (124 sessions, 147.5 hours)
8. ✅ `TestGetTraineeStats_NoData` - ไม่มีข้อมูล (all zeros)

**รัน:**
```bash
go test -v ./internal/repository/ -run Trainee
```

---

## 🔧 Test Helpers (`test/helpers.go`)

### **Helper Functions:**

1. ✅ `SetupTestRouter()` - สร้าง Gin Router สำหรับ testing
2. ✅ `MakeRequest()` - ส่ง HTTP Request และรับ Response
3. ✅ `MakeRequestWithContext()` - ส่ง Request พร้อม context values
4. ✅ `ParseResponse()` - แปลง JSON Response เป็น map
5. ✅ `MockAuthMiddleware()` - Mock JWT Auth Middleware

**ตัวอย่างการใช้:**
```go
import "users/test"

// Setup router
router := test.SetupTestRouter()

// Mock auth
router.Use(test.MockAuthMiddleware(1, "trainee", 1))

// Make request
w := test.MakeRequest("GET", "/api/v1/trainee/stats", nil, router)

// Parse response
response := test.ParseResponse(w)
assert.Equal(t, true, response["success"])
```

---

## 📈 Coverage Report ตัวอย่าง

```bash
$ go test -cover ./...

?       users/test                              [no test files]
ok      users/internal/middleware               0.123s  coverage: 95.2% of statements
ok      users/internal/handler                  0.234s  coverage: 87.6% of statements
ok      users/internal/repository               0.345s  coverage: 81.3% of statements

PASS
coverage: 88.0% of statements
```

---

## 🎯 Best Practices

### **1. Naming Convention:**
```go
// Pattern: Test{FunctionName}_{Scenario}
func TestGetNotifications_Success(t *testing.T)
func TestGetNotifications_Unauthorized(t *testing.T)
func TestMarkAsRead_NotFound(t *testing.T)
```

### **2. AAA Pattern (Arrange-Act-Assert):**
```go
func TestExample(t *testing.T) {
    // Arrange - Setup
    mockRepo := new(MockRepository)
    handler := NewHandler(mockRepo)
    
    // Act - Execute
    result, err := handler.DoSomething()
    
    // Assert - Verify
    assert.NoError(t, err)
    assert.Equal(t, expected, result)
}
```

### **3. Table-Driven Tests (สำหรับ multiple scenarios):**
```go
func TestMultipleScenarios(t *testing.T) {
    tests := []struct {
        name     string
        input    int
        expected int
    }{
        {"positive", 5, 25},
        {"zero", 0, 0},
        {"negative", -3, 9},
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result := Square(tt.input)
            assert.Equal(t, tt.expected, result)
        })
    }
}
```

### **4. Mock Expectations:**
```go
// Setup mock
mockRepo.On("GetNotifications", 1, 20, 1, false, "").Return(expectedData, nil)

// Execute test
result, err := handler.GetNotifications(...)

// Verify mock was called correctly
mockRepo.AssertExpectations(t)
```

---

## 🐛 Debugging Tests

### **รัน Test แบบ Verbose:**
```bash
go test -v ./internal/handler/ -run TestGetNotifications_Success
```

### **Print Debug Info:**
```go
func TestSomething(t *testing.T) {
    result := DoSomething()
    
    // Debug print
    t.Logf("Result: %+v", result)
    
    assert.Equal(t, expected, result)
}
```

### **Skip Tests:**
```go
func TestSomething(t *testing.T) {
    t.Skip("Skipping this test for now")
    // ...
}
```

---

## 📊 CI/CD Integration

### **GitHub Actions Example:**
```yaml
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-go@v2
        with:
          go-version: 1.21
      
      - name: Install dependencies
        run: |
          go get github.com/stretchr/testify
          go get github.com/DATA-DOG/go-sqlmock
      
      - name: Run tests
        run: go test -v -cover ./...
      
      - name: Generate coverage
        run: go test -coverprofile=coverage.out ./...
      
      - name: Upload coverage
        uses: codecov/codecov-action@v2
        with:
          file: ./coverage.out
```

---

## 🎉 Summary

### **✅ สิ่งที่ครบแล้ว:**
- ✅ 53 test cases สำหรับ 5 modules
- ✅ Mock repositories และ handlers
- ✅ sqlmock สำหรับ database tests
- ✅ Test helpers สำหรับ HTTP testing
- ✅ Test runner script
- ✅ Documentation ครบถ้วน

### **🎯 Target Coverage:**
- Middleware: ≥ 90%
- Handlers: ≥ 85%
- Repositories: ≥ 80%

### **🚀 Next Steps:**
1. รัน tests และตรวจสอบ coverage
2. เพิ่ม tests สำหรับ edge cases
3. เพิ่ม integration tests
4. Setup CI/CD pipeline

---

**Last Updated**: 2026-01-10
**Status**: ✅ Ready for Testing
