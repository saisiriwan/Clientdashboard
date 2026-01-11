# 📊 API Comparison: Design vs Implementation

## 🎯 สถานะระบบปัจจุบัน
- ✅ **Backend (main.go)**: เป็น API สำหรับ **Trainer** (มี CRUD ครบ)
- ⚠️ **API สำหรับ Trainee (Read-Only)**: **ยังขาดหลายส่วน**

---

## 📋 ตารางเปรียบเทียบ API Endpoints

### **1️⃣ Authentication APIs**

| API Endpoint (ตาม Design) | Current Implementation | สถานะ | หมายเหตุ |
|---------------------------|------------------------|-------|----------|
| `POST /api/auth/login` | `POST /api/v1/auth/login` | ✅ มี | Google OAuth + Username/Password |
| `POST /api/auth/logout` | `POST /api/v1/auth/logout` | ✅ มี | - |
| `POST /api/auth/refresh` | ❌ **ไม่มี** | ❌ ขาด | **ต้องเพิ่ม**: Refresh JWT Token |
| `GET /api/auth/me` | `GET /api/v1/auth/me` | ✅ มี | - |
| `GET /api/auth/google/login` | `GET /api/v1/auth/google/login` | ✅ มี | - |
| `GET /api/auth/google/callback` | `GET /api/v1/auth/google/callback` | ✅ มี | - |

**สรุป Authentication**: ✅ ครบ 5/6 (83%) - ขาดแค่ Refresh Token

---

### **2️⃣ Trainee Profile APIs**

| API Endpoint (ตาม Design) | Current Implementation | สถานะ | หมายเหตุ |
|---------------------------|------------------------|-------|----------|
| `GET /api/trainee/profile` | `GET /api/v1/trainees/me` | ✅ มี | ใช้ endpoint ต่างกัน แต่ฟังก์ชันเดียวกัน |
| `GET /api/trainee/stats` | ❌ **ไม่มี** | ❌ ขาด | **ต้องเพิ่ม**: สถิติสรุป (Total Sessions, Streak, Achievements) |

**สรุป Trainee Profile**: ⚠️ ครบ 1/2 (50%)

---

### **3️⃣ Schedule APIs (ตารางนัดหมาย)**

| API Endpoint (ตาม Design) | Current Implementation | สถานะ | หมายเหตุ |
|---------------------------|------------------------|-------|----------|
| `GET /api/schedules` | `GET /api/v1/schedules` | ⚠️ มีแต่ไม่ filter | ต้องเพิ่ม query params: `?from=...&to=...&status=...` |
| `GET /api/schedules/:id` | ❌ **ไม่มี** | ❌ ขาด | **ต้องเพิ่ม**: ดูรายละเอียดนัดหมายทีละรายการ |
| `GET /api/schedules/upcoming` | ❌ **ไม่มี** | ❌ ขาด | **ต้องเพิ่ม**: นัดหมาย 7 วันข้างหน้า (สำคัญมาก!) |
| `POST /api/schedules` | `POST /api/v1/schedules` | ⛔ **ไม่ควรมี** | Trainee ไม่ควรสร้างได้ (Read-Only) |
| `PUT /api/schedules/:id` | `PUT /api/v1/schedules/:id` | ⛔ **ไม่ควรมี** | Trainee ไม่ควรแก้ไขได้ |
| `DELETE /api/schedules/:id` | `DELETE /api/v1/schedules/:id` | ⛔ **ไม่ควรมี** | Trainee ไม่ควรลบได้ |

**สรุป Schedules**: ⚠️ ครบ 1/3 Read APIs (33%) + มี Write APIs ที่ไม่ควรมี

---

### **4️⃣ Progress APIs (ความก้าวหน้า)**

| API Endpoint (ตาม Design) | Current Implementation | สถานะ | หมายเหตุ |
|---------------------------|------------------------|-------|----------|
| `GET /api/progress/metrics` | `GET /api/v1/clients/:id/metrics` | ✅ มี | - |
| `GET /api/progress/history` | `GET /api/v1/clients/:id/metrics` | ⚠️ ใช้ endpoint เดียวกัน | ควรแยก หรือใช้ query params |
| `GET /api/programs/current` | ❌ **ไม่มี** | ❌ ขาด | **ต้องเพิ่ม**: โปรแกรมปัจจุบันของ Trainee |
| `GET /api/programs/:id` | `GET /api/v1/programs/:id` | ✅ มี | - |
| `GET /api/programs` | `GET /api/v1/programs` | ⚠️ มีแต่ไม่ filter | ต้องเพิ่ม filter สำหรับ Trainee เท่านั้น |
| `POST /api/clients/:id/metrics` | `POST /api/v1/clients/:id/metrics` | ⛔ **ไม่ควรมี** | Trainee ไม่ควรบันทึกเอง (Trainer บันทึกให้) |

**สรุป Progress**: ⚠️ ครบ 3/5 Read APIs (60%) + มี Write APIs ที่ไม่ควรมี

---

### **5️⃣ Session Cards APIs (สรุปผลการฝึก)**

| API Endpoint (ตาม Design) | Current Implementation | สถานะ | หมายเหตุ |
|---------------------------|------------------------|-------|----------|
| `GET /api/session-cards` | `GET /api/v1/clients/:id/sessions` | ⚠️ ต้องระบุ client_id | ควรมี endpoint ที่ดึงของตัวเองโดยอัตโนมัติ |
| `GET /api/session-cards/:id` | `GET /api/v1/sessions/:id` | ✅ มี | - |
| `GET /api/session-cards/search` | ❌ **ไม่มี** | ❌ ขาด | **ต้องเพิ่ม**: ค้นหา Session Cards |
| `GET /api/session-cards/statistics` | ❌ **ไม่มี** | ❌ ขาด | **ต้องเพิ่ม**: สถิติ Session (Total PRs, Volume, etc.) |
| `POST /api/sessions` | `POST /api/v1/sessions` | ⛔ **ไม่ควรมี** | Trainer สร้าง |
| `PUT /api/sessions/:id` | `PUT /api/v1/sessions/:id` | ⛔ **ไม่ควรมี** | Trainer แก้ไข |
| `DELETE /api/sessions/:id` | `DELETE /api/v1/sessions/:id` | ⛔ **ไม่ควรมี** | Trainer ลบ |

**สรุป Session Cards**: ⚠️ ครบ 2/4 Read APIs (50%) + มี Write APIs ที่ไม่ควรมี

---

### **6️⃣ Trainer APIs**

| API Endpoint (ตาม Design) | Current Implementation | สถานะ | หมายเหตุ |
|---------------------------|------------------------|-------|----------|
| `GET /api/trainers` | ❌ **ไม่มี** | ❌ ขาด | **ต้องเพิ่ม**: ดูรายชื่อ Trainers |
| `GET /api/trainers/:id` | `GET /api/v1/users/:id` | ⚠️ ใช้ users แทน | ควรแยก endpoint เฉพาะ Trainers |

**สรุป Trainers**: ❌ ขาดทั้งหมด 0/2 (0%)

---

### **7️⃣ Notification APIs**

| API Endpoint (ตาม Design) | Current Implementation | สถานะ | หมายเหตุ |
|---------------------------|------------------------|-------|----------|
| `GET /api/notifications` | ❌ **ไม่มี** | ❌ ขาด | **ต้องเพิ่ม**: ดูการแจ้งเตือน |
| `PUT /api/notifications/:id/read` | ❌ **ไม่มี** | ❌ ขาด | **ต้องเพิ่ม**: Mark as Read |
| `PUT /api/notifications/read-all` | ❌ **ไม่มี** | ❌ ขาด | **ต้องเพิ่ม**: Mark All as Read |

**สรุป Notifications**: ❌ ขาดทั้งหมด 0/3 (0%)

---

### **8️⃣ APIs ที่มีใน main.go แต่ไม่เกี่ยวกับ Trainee (Trainer-only)**

| API Endpoint | สถานะ | หมายเหตุ |
|--------------|-------|----------|
| `POST /api/v1/clients` | ⛔ Trainer Only | สร้างลูกเทรน |
| `PUT /api/v1/clients/:id` | ⛔ Trainer Only | แก้ไขข้อมูลลูกเทรน |
| `DELETE /api/v1/clients/:id` | ⛔ Trainer Only | ลบลูกเทรน |
| `POST /api/v1/clients/:id/notes` | ⛔ Trainer Only | เขียนโน้ต |
| `POST /api/v1/assignments` | ⛔ Trainer Only | มอบหมายงาน |
| `PUT /api/v1/assignments/:id` | ⛔ Trainer Only | แก้ไขงาน |
| `DELETE /api/v1/assignments/:id` | ⛔ Trainer Only | ลบงาน |
| `POST /api/v1/programs` | ⛔ Trainer Only | สร้างโปรแกรม |
| `PUT /api/v1/programs/:id` | ⛔ Trainer Only | แก้ไขโปรแกรม |
| `DELETE /api/v1/programs/:id` | ⛔ Trainer Only | ลบโปรแกรม |
| `POST /api/v1/exercises` | ⛔ Trainer Only | เพิ่มท่าฝึก |
| `PUT /api/v1/exercises/:id` | ⛔ Trainer Only | แก้ไขท่าฝึก |
| `DELETE /api/v1/exercises/:id` | ⛔ Trainer Only | ลบท่าฝึก |
| `GET /api/v1/dashboard/stats` | ⛔ Trainer Only | Dashboard Trainer |
| `POST /api/v1/calendar/notes` | ⛔ Trainer Only | เขียนโน้ตปฏิทิน |

**หมายเหตุ**: APIs เหล่านี้ถูกต้องแล้ว - เป็น Trainer APIs ที่ควรมี (ไม่ใช่สำหรับ Trainee)

---

## 📊 สรุปภาพรวม

### **API Endpoints ที่ต้องมีสำหรับ Trainee (Read-Only)**

| หมวดหมู่ | ครบ/ทั้งหมด | เปอร์เซ็นต์ | สถานะ |
|---------|-------------|------------|-------|
| **Authentication** | 5/6 | 83% | ✅ ใกล้ครบ |
| **Trainee Profile** | 1/2 | 50% | ⚠️ ขาดสถิติ |
| **Schedules** | 1/3 | 33% | ❌ ขาดหลายอย่าง |
| **Progress** | 3/5 | 60% | ⚠️ ขาดบางส่วน |
| **Session Cards** | 2/4 | 50% | ⚠️ ขาดค้นหาและสถิติ |
| **Trainers** | 0/2 | 0% | ❌ ไม่มีเลย |
| **Notifications** | 0/3 | 0% | ❌ ไม่มีเลย |
| **รวม** | **12/25** | **48%** | ⚠️ **ครบครึ่งเดียว** |

---

## 🔥 APIs ที่ขาดและต้องเพิ่มด่วน (Critical Missing APIs)

### **Priority 1: Critical (ต้องมี)**
1. ✅ `GET /api/v1/schedules/upcoming` - **นัดหมาย 7 วันข้างหน้า** (ใช้บ่อยมาก!)
2. ✅ `GET /api/v1/schedules/:id` - **รายละเอียดนัดหมาย**
3. ✅ `GET /api/v1/programs/current` - **โปรแกรมปัจจุบัน**
4. ✅ `GET /api/v1/notifications` - **การแจ้งเตือน**
5. ✅ `PUT /api/v1/notifications/:id/read` - **Mark as Read**

### **Priority 2: Important (ควรมี)**
6. ✅ `GET /api/v1/trainee/stats` - **สถิติสรุป** (Total Sessions, Streak, Achievements)
7. ✅ `GET /api/v1/session-cards/statistics` - **สถิติ Session Cards**
8. ✅ `GET /api/v1/trainers` - **รายชื่อ Trainers**
9. ✅ `GET /api/v1/trainers/:id` - **รายละเอียด Trainer**
10. ✅ `POST /api/auth/refresh` - **Refresh Token**

### **Priority 3: Nice to Have (มีดีกว่าไม่มี)**
11. ✅ `GET /api/v1/session-cards/search` - **ค้นหา Session Cards**
12. ✅ `PUT /api/v1/notifications/read-all` - **Mark All as Read**

---

## 🛡️ Authorization & Access Control ที่ต้องปรับปรุง

### **⚠️ ปัญหาปัจจุบัน:**
- ❌ **ไม่มีการแยก Role-Based Access Control (RBAC)**
- ❌ Trainee สามารถเข้าถึง Write APIs (POST, PUT, DELETE) ได้
- ❌ ไม่มีการตรวจสอบว่า Trainee เข้าถึงเฉพาะข้อมูลของตัวเองเท่านั้น

### **✅ ควรเพิ่ม Middleware:**
```go
// middleware/role.go
func RequireRole(allowedRoles ...string) gin.HandlerFunc {
    return func(c *gin.Context) {
        userRole := c.GetString("role") // จาก JWT Claims
        
        for _, role := range allowedRoles {
            if userRole == role {
                c.Next()
                return
            }
        }
        
        c.JSON(http.StatusForbidden, gin.H{
            "success": false,
            "error": gin.H{
                "code": "FORBIDDEN",
                "message": "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้",
            },
        })
        c.Abort()
    }
}
```

### **✅ ตัวอย่างการใช้งาน:**
```go
// Trainer Only Routes
protected.Use(middleware.RequireRole("trainer"))
{
    protected.POST("/clients", trainingHandler.CreateClient)
    protected.PUT("/clients/:id", clientHandler.UpdateClient)
    protected.DELETE("/clients/:id", clientHandler.DeleteClient)
}

// Trainee Only Routes
protected.Use(middleware.RequireRole("trainee"))
{
    protected.GET("/trainees/me", clientHandler.GetMyProfile)
    protected.GET("/schedules/upcoming", trainingHandler.GetUpcomingSchedules)
}

// Both Trainer and Trainee
protected.Use(middleware.RequireRole("trainer", "trainee"))
{
    protected.GET("/schedules", trainingHandler.GetSchedules)
    protected.GET("/sessions/:id", sessionHandler.GetSession)
}
```

---

## 📝 Recommendations (คำแนะนำ)

### **1. แยก Routes เป็น 2 Groups:**
```go
// Trainer Routes (CRUD)
trainerRoutes := protected.Group("/trainer")
trainerRoutes.Use(middleware.RequireRole("trainer"))
{
    trainerRoutes.POST("/clients", ...)
    trainerRoutes.PUT("/clients/:id", ...)
    trainerRoutes.DELETE("/clients/:id", ...)
}

// Trainee Routes (Read-Only)
traineeRoutes := protected.Group("/trainee")
traineeRoutes.Use(middleware.RequireRole("trainee"))
{
    traineeRoutes.GET("/me", ...)
    traineeRoutes.GET("/schedules/upcoming", ...)
    traineeRoutes.GET("/notifications", ...)
    traineeRoutes.GET("/session-cards", ...)
}
```

### **2. เพิ่ม Query Parameters ให้ครบ:**
```go
// ตัวอย่าง: GET /api/v1/schedules?from=2026-01-10&to=2026-01-31&status=confirmed
protected.GET("/schedules", trainingHandler.GetSchedules)

// Handler ต้องรองรับ:
// - from (วันที่เริ่มต้น)
// - to (วันที่สิ้นสุด)
// - status (confirmed, pending, cancelled)
// - trainerId (filter by trainer)
// - limit, page (pagination)
```

### **3. สร้าง Response Format มาตรฐาน:**
```go
// Success Response
{
    "success": true,
    "data": { ... },
    "pagination": { ... } // ถ้ามี
}

// Error Response
{
    "success": false,
    "error": {
        "code": "NOT_FOUND",
        "message": "ไม่พบข้อมูลที่ต้องการ"
    }
}
```

---

## 🎯 Action Items (สิ่งที่ต้องทำต่อไป)

### **Phase 1: Critical (ทำก่อน - 1-2 สัปดาห์)**
- [ ] เพิ่ม RBAC Middleware (Role-Based Access Control)
- [ ] เพิ่ม API: `GET /schedules/upcoming`
- [ ] เพิ่ม API: `GET /programs/current`
- [ ] เพิ่ม API: `GET /notifications` และ `PUT /notifications/:id/read`
- [ ] เพิ่ม API: `GET /schedules/:id`
- [ ] ปิด Write APIs สำหรับ Trainee (POST, PUT, DELETE)

### **Phase 2: Important (ทำต่อ - 2-3 สัปดาห์)**
- [ ] เพิ่ม API: `GET /trainee/stats`
- [ ] เพิ่ม API: `GET /session-cards/statistics`
- [ ] เพิ่ม API: `GET /trainers` และ `GET /trainers/:id`
- [ ] เพิ่ม API: `POST /auth/refresh`
- [ ] เพิ่ม Query Parameters ให้ครบทุก endpoint

### **Phase 3: Nice to Have (ทำเมื่อว่าง - 3-4 สัปดาห์)**
- [ ] เพิ่ม API: `GET /session-cards/search`
- [ ] เพิ่ม API: `PUT /notifications/read-all`
- [ ] สร้าง Views ใน Database (v_trainee_full_profile, v_upcoming_schedules, etc.)
- [ ] เพิ่ม Unit Tests สำหรับ APIs

---

## 📈 Progress Tracker

```
Current Implementation: ████████░░░░░░░░░░░░ 48%
Target (Trainee APIs):  ████████████████████ 100%

Missing: 13 APIs
Extra (Trainer APIs): ✅ ถูกต้องแล้ว (ไม่ต้องลบ)
```

---

**Last Updated**: 2026-01-10
**Status**: ⚠️ In Progress - ต้องเพิ่ม APIs สำหรับ Trainee อีก 13 endpoints
