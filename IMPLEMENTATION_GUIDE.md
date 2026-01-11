# 🚀 Implementation Guide: Option 2 + Option 3

## ✅ สิ่งที่ได้สร้างขึ้น

### **Option 3: RBAC Middleware** 🛡️
ไฟล์: `/internal/middleware/rbac.go`

**ฟังก์ชันหลัก:**
1. ✅ `RequireRole(allowedRoles ...string)` - ตรวจสอบ Role
2. ✅ `RequireTrainer()` - Trainer เท่านั้น
3. ✅ `RequireTrainee()` - Trainee เท่านั้น
4. ✅ `AllowAll()` - ทั้ง Trainer และ Trainee
5. ✅ `CheckResourceOwnership(paramKey)` - ตรวจสอบเจ้าของข้อมูล

---

### **Option 2: Critical APIs (5 Endpoints)** 🔥

#### **1. GET /api/v1/trainee/schedules/upcoming**
- 📅 **ฟังก์ชัน**: ดึงนัดหมาย 7 วันข้างหน้า
- 📂 **ไฟล์**:
  - Repository: `/internal/repository/trainee_repository.go` → `GetUpcomingSchedules()`
  - Handler: `/internal/handler/trainee_handler.go` → `GetUpcomingSchedules()`
- 📝 **Response**:
  ```json
  {
    "success": true,
    "data": {
      "upcomingSessions": [
        {
          "id": 1,
          "date": "2026-01-10",
          "time": "14:00",
          "duration": 60,
          "title": "Strength Training",
          "status": "confirmed",
          "trainer": {
            "id": 1,
            "name": "โค้ชบเนศ",
            "profileImage": "..."
          },
          "location": {
            "name": "ห้องฟิตเนส A"
          }
        }
      ],
      "calendar": [
        {
          "date": "2026-01-10",
          "dayName": "วันศุกร์",
          "isToday": true,
          "hasSession": true,
          "sessionCount": 1
        }
      ]
    }
  }
  ```

---

#### **2. GET /api/v1/trainee/schedules/:id**
- 📄 **ฟังก์ชัน**: ดึงรายละเอียดนัดหมายทีละรายการ
- 📂 **ไฟล์**:
  - Repository: `/internal/repository/trainee_repository.go` → `GetScheduleByID()`
  - Handler: `/internal/handler/trainee_handler.go` → `GetScheduleByID()`
- 📝 **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "date": "2026-01-10",
      "time": "14:00",
      "duration": 60,
      "title": "Strength Training",
      "description": "เน้นกล้ามเนื้อส่วนบน",
      "status": "confirmed",
      "trainer": {
        "id": 1,
        "name": "โค้ชบเนศ",
        "email": "coach@example.com",
        "phoneNumber": "081-234-5678",
        "profileImage": "...",
        "specialization": ["Strength Training"]
      },
      "location": {
        "name": "ห้องฟิตเนส A",
        "address": "123 ถนนสุขุมวิท"
      },
      "sessionType": "personal_training",
      "plannedExercises": ["Bench Press", "Squat"],
      "notes": "อย่าลืมนำผ้าเช็ดตัว",
      "createdAt": "2026-01-03T10:00:00Z"
    }
  }
  ```

---

#### **3. GET /api/v1/trainee/programs/current**
- 🎯 **ฟังก์ชัน**: ดึงโปรแกรมปัจจุบันของ Trainee
- 📂 **ไฟล์**:
  - Repository: `/internal/repository/trainee_repository.go` → `GetCurrentProgram()`
  - Handler: `/internal/handler/trainee_handler.go` → `GetCurrentProgram()`
- 📝 **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "Full Body Strength",
      "description": "โปรแกรมเน้นเพิ่มความแข็งแรง",
      "duration": "12 สัปดาห์",
      "currentWeek": 4,
      "totalWeeks": 12,
      "progressPercentage": 33.3,
      "startDate": "2024-11-18",
      "endDate": "2025-02-10",
      "status": "active",
      "trainer": {
        "id": 1,
        "name": "โค้ชบเนศ",
        "email": "coach@example.com"
      },
      "sessionsCompleted": 24,
      "totalSessions": 72,
      "sessionCompletionRate": 33.3,
      "goals": [
        "เพิ่มความแข็งแรง",
        "พัฒนารูปร่าง"
      ]
    }
  }
  ```

---

#### **4. GET /api/v1/trainee/stats**
- 📊 **ฟังก์ชัน**: ดึงสถิติสรุปของ Trainee
- 📂 **ไฟล์**:
  - Repository: `/internal/repository/trainee_repository.go` → `GetTraineeStats()`
  - Handler: `/internal/handler/trainee_handler.go` → `GetTraineeStats()`
- 📝 **Response**:
  ```json
  {
    "success": true,
    "data": {
      "totalSessions": 124,
      "completedSessions": 98,
      "upcomingSessions": 6,
      "cancelledSessions": 20,
      "currentStreak": 5,
      "longestStreak": 21,
      "totalWorkoutHours": 147.5,
      "averageSessionsPerWeek": 3.2,
      "currentProgram": {
        "id": 1,
        "name": "Full Body Strength",
        "progressPercentage": 33.3,
        "currentWeek": 4,
        "totalWeeks": 12
      },
      "recentAchievements": [
        {
          "id": 1,
          "title": "ทำ PR ใหม่ใน Bench Press",
          "date": "2026-01-09",
          "badge": "🏆"
        }
      ]
    }
  }
  ```

---

#### **5. GET /api/v1/trainee/notifications**
- 🔔 **ฟังก์ชัน**: ดึงการแจ้งเตือนทั้งหมด
- 📂 **ไฟล์**:
  - Repository: `/internal/repository/notification_repository.go` → `GetNotifications()`
  - Handler: `/internal/handler/notification_handler.go` → `GetNotifications()`
- 📝 **Query Parameters**:
  - `limit` (default: 20) - จำนวนรายการต่อหน้า
  - `page` (default: 1) - หน้าที่ต้องการ
  - `unreadOnly` (default: false) - แสดงเฉพาะที่ยังไม่อ่าน
  - `type` - กรองตามประเภท (schedule, progress, achievement, system)
- 📝 **Response**:
  ```json
  {
    "success": true,
    "data": {
      "notifications": [
        {
          "id": 1,
          "type": "schedule",
          "title": "อย่าลืม! เซสชันการฝึกวันนี้",
          "message": "คุณมีนัดฝึกกับโค้ชบเนศ วันนี้เวลา 14:00 น.",
          "relatedId": 1,
          "relatedType": "schedule",
          "actionUrl": "/trainee/schedules/1",
          "priority": "high",
          "isRead": false,
          "createdAt": "2026-01-10T08:00:00Z"
        }
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 3,
        "totalItems": 42,
        "itemsPerPage": 20
      },
      "unreadCount": 15
    }
  }
  ```

---

#### **BONUS: PUT /api/v1/trainee/notifications/:id/read**
- ✅ **ฟังก์ชัน**: Mark notification as read
- 📂 **ไฟล์**:
  - Repository: `/internal/repository/notification_repository.go` → `MarkAsRead()`
  - Handler: `/internal/handler/notification_handler.go` → `MarkAsRead()`
- 📝 **Response**:
  ```json
  {
    "success": true,
    "message": "อ่านการแจ้งเตือนแล้ว"
  }
  ```

---

#### **BONUS: PUT /api/v1/trainee/notifications/read-all**
- ✅ **ฟังก์ชัน**: Mark all notifications as read
- 📂 **ไฟล์**:
  - Repository: `/internal/repository/notification_repository.go` → `MarkAllAsRead()`
  - Handler: `/internal/handler/notification_handler.go` → `MarkAllAsRead()`
- 📝 **Response**:
  ```json
  {
    "success": true,
    "message": "อ่านการแจ้งเตือนทั้งหมดแล้ว",
    "data": {
      "markedCount": 15
    }
  }
  ```

---

## 📁 โครงสร้างไฟล์ที่สร้าง

```
users/
├── internal/
│   ├── middleware/
│   │   └── rbac.go                    ✅ NEW
│   ├── handler/
│   │   ├── trainee_handler.go         ✅ NEW (4 handlers)
│   │   └── notification_handler.go    ✅ NEW (3 handlers)
│   └── repository/
│       ├── trainee_repository.go      ✅ NEW (4 methods)
│       └── notification_repository.go ✅ NEW (4 methods)
├── main_updated.go                    ✅ UPDATED (with RBAC)
└── IMPLEMENTATION_GUIDE.md            ✅ NEW (this file)
```

---

## 🔧 วิธีใช้งาน

### **1. รัน Migration SQL ก่อน**
```bash
psql -U your_username -d your_database -f migration.sql
```

### **2. แทนที่ main.go ด้วย main_updated.go**
```bash
mv main.go main_old.go
mv main_updated.go main.go
```

### **3. รันเซิร์ฟเวอร์**
```bash
go run main.go
```

### **4. ทดสอบ APIs**

#### **Login เป็น Trainee:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "somchai",
    "password": "your_password"
  }' \
  -c cookies.txt
```

#### **ดึงนัดหมาย 7 วันข้างหน้า:**
```bash
curl -X GET http://localhost:8080/api/v1/trainee/schedules/upcoming \
  -b cookies.txt
```

#### **ดึงสถิติสรุป:**
```bash
curl -X GET http://localhost:8080/api/v1/trainee/stats \
  -b cookies.txt
```

#### **ดึงการแจ้งเตือน:**
```bash
curl -X GET "http://localhost:8080/api/v1/trainee/notifications?unreadOnly=true" \
  -b cookies.txt
```

#### **Mark notification as read:**
```bash
curl -X PUT http://localhost:8080/api/v1/trainee/notifications/1/read \
  -b cookies.txt
```

---

## ⚠️ สิ่งที่ต้องแก้ไขเพิ่มเติม

### **1. JWT Claims ต้องมี `clientID`**
ในไฟล์ `/internal/middleware/jwt.go` หรือที่สร้าง JWT Token:

```go
// เพิ่ม clientID ใน claims
claims := jwt.MapClaims{
    "userID":   user.ID,
    "role":     user.Role,
    "clientID": client.ID,  // ← เพิ่มบรรทัดนี้ (ถ้าเป็น trainee)
    "exp":      time.Now().Add(time.Hour * 24).Unix(),
}
```

### **2. ใน JWTCookieAuth Middleware**
```go
// Set clientID to context (สำหรับ trainee)
if role == "trainee" {
    if clientID, ok := claims["clientID"].(float64); ok {
        c.Set("clientID", int(clientID))
    }
}
```

### **3. Repository ที่ต้องเพิ่มเติม**
- ✅ Parse PostgreSQL Arrays (`planned_exercises`, `goals`, `specialization`)
- ✅ ดึง `NextSession` จาก schedules table
- ✅ ดึง `ProgressNotes` จาก program_progress_notes table
- ✅ คำนวณ `currentStreak` และ `longestStreak`
- ✅ ดึง `RecentAchievements` จาก achievements table

---

## 🎯 Routes Summary

### **Trainee Routes (Read-Only)** 📋
| Method | Endpoint | ฟังก์ชัน |
|--------|----------|---------|
| GET | `/api/v1/trainee/schedules/upcoming` | นัดหมาย 7 วันข้างหน้า |
| GET | `/api/v1/trainee/schedules/:id` | รายละเอียดนัดหมาย |
| GET | `/api/v1/trainee/programs/current` | โปรแกรมปัจจุบัน |
| GET | `/api/v1/trainee/stats` | สถิติสรุป |
| GET | `/api/v1/trainee/notifications` | การแจ้งเตือน |
| PUT | `/api/v1/trainee/notifications/:id/read` | Mark as Read |
| PUT | `/api/v1/trainee/notifications/read-all` | Mark All as Read |
| GET | `/api/v1/trainee/me` | โปรไฟล์ของฉัน |
| GET | `/api/v1/trainee/schedules` | ตารางนัดหมายทั้งหมด |
| GET | `/api/v1/trainee/sessions` | Session Cards |
| GET | `/api/v1/trainee/sessions/:id` | รายละเอียด Session |
| GET | `/api/v1/trainee/metrics` | ข้อมูลการวัดผล |
| GET | `/api/v1/trainee/programs` | รายการโปรแกรม |
| GET | `/api/v1/trainee/programs/:id` | รายละเอียดโปรแกรม |

**รวม: 14 endpoints สำหรับ Trainee (Read-Only)**

### **Trainer Routes (Full CRUD)** 👨‍🏫
- เดิมทั้งหมดย้ายไปอยู่ที่ `/api/v1/trainer/*`
- มี RBAC Middleware ป้องกัน Trainee เข้าถึง

---

## 🔐 Security Features

### **1. Role-Based Access Control (RBAC)**
✅ Trainee ไม่สามารถเข้าถึง Trainer Routes ได้
✅ Trainer ไม่สามารถเข้าถึง Trainee Routes ได้ (แต่สามารถใช้ Shared Routes)

### **2. Resource Ownership Check**
✅ Trainee เข้าถึงได้เฉพาะข้อมูลของตัวเอง
✅ ตรวจสอบ `clientID` จาก JWT claims vs. resource ID

### **3. Error Handling**
✅ Response Format มาตรฐาน (success, error.code, error.message)
✅ HTTP Status Codes ถูกต้อง (401, 403, 404, 500)

---

## ✅ Checklist

- [x] **Option 3**: สร้าง RBAC Middleware
- [x] **Option 2**: สร้าง 5 Critical APIs
  - [x] GET /trainee/schedules/upcoming
  - [x] GET /trainee/schedules/:id
  - [x] GET /trainee/programs/current
  - [x] GET /trainee/stats
  - [x] GET /trainee/notifications
- [x] สร้าง Repository Layer (2 ไฟล์)
- [x] สร้าง Handler Layer (2 ไฟล์)
- [x] อัพเดท main.go ด้วย Routes ใหม่
- [x] เพิ่ม PUT notifications/:id/read
- [x] เพิ่ม PUT notifications/read-all
- [ ] แก้ไข JWT Claims ให้มี clientID (ต้องทำเอง)
- [ ] ทดสอบ APIs ทั้งหมด
- [ ] เพิ่ม Unit Tests

---

## 📚 Next Steps

### **Phase 1: ทดสอบ (1-2 วัน)**
1. ทดสอบ Login Trainee
2. ทดสอบ 5 Critical APIs
3. ทดสอบ RBAC (Trainee ไม่สามารถเข้าถึง Trainer Routes)

### **Phase 2: เพิ่ม Features (3-5 วัน)**
4. เพิ่ม Trainers Info APIs (GET /trainers, GET /trainers/:id)
5. เพิ่ม Session Cards Search (GET /session-cards/search)
6. เพิ่ม Session Cards Statistics (GET /session-cards/statistics)
7. เพิ่ม Refresh Token (POST /auth/refresh)

### **Phase 3: Optimization (1 สัปดาห์)**
8. เพิ่ม Database Indexes
9. เพิ่ม Caching (Redis)
10. เพิ่ม Rate Limiting
11. เพิ่ม Unit Tests & Integration Tests

---

**Last Updated**: 2026-01-10
**Status**: ✅ Ready for Testing
