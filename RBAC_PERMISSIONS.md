# 🔐 Role-Based Access Control (RBAC) - Permissions Matrix

## 📋 Overview

ระบบ Fitness Management มีการแบ่งสิทธิ์แบบ **Role-Based Access Control (RBAC)** อย่างเข้มงวด โดยมี 2 roles หลัก:

1. **👤 Trainee (ลูกเทรน)** - READ-ONLY เท่านั้น ❌ ไม่มีสิทธิ์แก้ไข
2. **👨‍🏫 Trainer (เทรนเนอร์)** - FULL CRUD (Create, Read, Update, Delete)

---

## 🎯 Key Principle

### ⚠️ CRITICAL RULE: TRAINEE = READ-ONLY ONLY

```
┌─────────────────────────────────────────────────────────┐
│  TRAINEE (ลูกเทรน) สามารถทำได้เพียง:                   │
│                                                         │
│  ✅ ดู (READ) ข้อมูลของตัวเองเท่านั้น                   │
│  ❌ สร้าง (CREATE) - ไม่ได้                            │
│  ❌ แก้ไข (UPDATE) - ไม่ได้                            │
│  ❌ ลบ (DELETE) - ไม่ได้                               │
│                                                         │
│  ข้อยกเว้นเพียงอย่างเดียว:                              │
│  ✅ แก้ไขข้อมูลส่วนตัวของตัวเอง (Profile Only)          │
│     - ชื่อ, เบอร์โทร, รูปโปรไฟล์                       │
│     - ไม่สามารถแก้ไข Role, Email ได้                   │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Permissions Matrix - ทั้งหมด 57 APIs

### สัญลักษณ์
- ✅ = อนุญาต
- ❌ = ไม่อนุญาต
- 🔒 = ต้อง Authentication
- 👀 = อ่านได้เฉพาะข้อมูลตัวเอง
- 📝 = แก้ไขได้เฉพาะข้อมูลตัวเอง (ยกเว้น)

---

## 1. Authentication APIs (5) 🔐

| # | Endpoint | Method | Trainee | Trainer | Notes |
|---|----------|--------|---------|---------|-------|
| 1 | `/auth/google` | GET | ✅ | ✅ | Public - เริ่ม OAuth |
| 2 | `/auth/google/callback` | POST | ✅ | ✅ | Public - รับ callback |
| 3 | `/auth/refresh` | POST | ✅ 🔒 | ✅ 🔒 | Refresh token |
| 4 | `/auth/logout` | POST | ✅ 🔒 | ✅ 🔒 | Logout |
| 5 | `/auth/verify` | GET | ✅ 🔒 | ✅ 🔒 | ตรวจสอบ token |

**Summary:**
- Trainee: ✅ ทุก API (จำเป็นสำหรับ login/logout)
- Trainer: ✅ ทุก API

---

## 2. User Management APIs (5) 👤

| # | Endpoint | Method | Trainee | Trainer | Notes |
|---|----------|--------|---------|---------|-------|
| 6 | `/users/me` | GET | ✅ 👀 | ✅ | ดูโปรไฟล์ตัวเอง |
| 7 | `/users/me` | PATCH | ✅ 📝 | ✅ | **ยกเว้น**: แก้ไขโปรไฟล์ตัวเอง (ชื่อ, เบอร์, รูป) |
| 8 | `/users/:userId` | GET | ❌ | ✅ | ดูข้อมูลผู้ใช้อื่น |
| 9 | `/users` | GET | ❌ | ✅ | ดูรายชื่อทั้งหมด |
| 10 | `/users/:userId/stats` | GET | ✅ 👀 | ✅ | ดูสถิติตัวเอง |

**Summary:**
- Trainee: ✅ 3/5 APIs (เฉพาะข้อมูลตัวเอง)
  - ✅ ดูโปรไฟล์ตัวเอง
  - ✅ แก้ไขโปรไฟล์ตัวเอง (ข้อมูลส่วนตัวเท่านั้น)
  - ✅ ดูสถิติตัวเอง
  - ❌ ดูข้อมูลคนอื่น
  - ❌ ดูรายชื่อทั้งหมด
- Trainer: ✅ 5/5 APIs

**⚠️ ข้อจำกัดสำหรับ PATCH /users/me:**
```json
// Trainee สามารถแก้ไขได้เฉพาะ:
{
  "name": "ชื่อใหม่",              // ✅ ได้
  "phone": "+66812345678",        // ✅ ได้
  "avatar": "https://...",        // ✅ ได้
  "dateOfBirth": "1990-01-01",    // ✅ ได้
  "gender": "male",               // ✅ ได้
  "height": 175,                  // ✅ ได้
  "weight": 72.5                  // ✅ ได้
}

// Trainee แก้ไขไม่ได้:
{
  "email": "...",                 // ❌ ไม่ได้
  "role": "trainer"               // ❌ ไม่ได้ (Critical!)
}
```

---

## 3. Schedule Management APIs (6) 📅

| # | Endpoint | Method | Trainee | Trainer | Notes |
|---|----------|--------|---------|---------|-------|
| 13 | `/schedules` | POST | ❌ | ✅ | สร้างตารางนัด |
| 14 | `/schedules` | GET | ✅ 👀 | ✅ | ดูรายการนัด (เฉพาะตัวเอง) |
| 15 | `/schedules/:id` | GET | ✅ 👀 | ✅ | ดูนัดเดียว (เฉพาะตัวเอง) |
| 16 | `/schedules/:id` | PATCH | ❌ | ✅ | แก้ไขนัด |
| 17 | `/schedules/:id/status` | PATCH | ❌ | ✅ | เปลี่ยนสถานะ |
| 18 | `/schedules/:id` | DELETE | ❌ | ✅ | ลบนัด |

**Summary:**
- Trainee: ✅ 2/6 APIs (READ-ONLY)
  - ✅ ดูตารางนัดของตัวเอง
  - ✅ ดูรายละเอียดนัดของตัวเอง
  - ❌ สร้างนัด
  - ❌ แก้ไขนัด
  - ❌ เปลี่ยนสถานะ
  - ❌ ลบนัด
- Trainer: ✅ 6/6 APIs (FULL CRUD)

**Error Response สำหรับ Trainee:**
```json
// ถ้า Trainee พยายาม POST, PATCH, DELETE
{
  "success": false,
  "error": {
    "code": "TRAINEE_READONLY",
    "message": "Trainee can only view data. Cannot create, update, or delete schedules.",
    "statusCode": 403
  }
}
```

---

## 4. Workout Management APIs (6) 💪

| # | Endpoint | Method | Trainee | Trainer | Notes |
|---|----------|--------|---------|---------|-------|
| 19 | `/workouts` | POST | ❌ | ✅ | บันทึกการฝึก |
| 20 | `/workouts` | GET | ✅ 👀 | ✅ | ดูรายการการฝึก (เฉพาะตัวเอง) |
| 21 | `/workouts/:id` | GET | ✅ 👀 | ✅ | ดูการฝึกเดียว (เฉพาะตัวเอง) |
| 22 | `/workouts/:id` | PATCH | ❌ | ✅ | แก้ไข |
| 23 | `/workouts/:id` | DELETE | ❌ | ✅ | ลบ |
| 24 | `/workouts/summary` | GET | ✅ 👀 | ✅ | ดูสรุป (เฉพาะตัวเอง) |

**Summary:**
- Trainee: ✅ 3/6 APIs (READ-ONLY)
  - ✅ ดูประวัติการฝึกของตัวเอง
  - ✅ ดูรายละเอียดการฝึก
  - ✅ ดูสรุปการฝึก
  - ❌ บันทึกการฝึกใหม่
  - ❌ แก้ไขการฝึก
  - ❌ ลบการฝึก
- Trainer: ✅ 6/6 APIs (FULL CRUD)

---

## 5. Exercise Management APIs (6) 🏋️

| # | Endpoint | Method | Trainee | Trainer | Notes |
|---|----------|--------|---------|---------|-------|
| 25 | `/exercises` | POST | ❌ | ✅ | สร้างท่า |
| 26 | `/exercises` | GET | ✅ | ✅ | ดูรายการท่า (คลังท่า) |
| 27 | `/exercises/:id` | GET | ✅ | ✅ | ดูท่าเดียว |
| 28 | `/exercises/:id` | PATCH | ❌ | ✅ | แก้ไขท่า |
| 29 | `/exercises/:id` | DELETE | ❌ | ✅ | ลบท่า |
| 30 | `/exercises/categories` | GET | ✅ | ✅ | ดูหมวดหมู่ |

**Summary:**
- Trainee: ✅ 3/6 APIs (READ-ONLY)
  - ✅ ดูคลังท่าออกกำลังกาย
  - ✅ ดูรายละเอียดท่า
  - ✅ ดูหมวดหมู่
  - ❌ สร้างท่าใหม่
  - ❌ แก้ไขท่า
  - ❌ ลบท่า
- Trainer: ✅ 6/6 APIs (FULL CRUD)

---

## 6. Session Card APIs (5) 📝

| # | Endpoint | Method | Trainee | Trainer | Notes |
|---|----------|--------|---------|---------|-------|
| 31 | `/session-cards` | POST | ❌ | ✅ | สร้างการ์ดสรุป |
| 32 | `/session-cards` | GET | ✅ 👀 | ✅ | ดูรายการการ์ด (เฉพาะตัวเอง) |
| 33 | `/session-cards/:id` | GET | ✅ 👀 | ✅ | ดูการ์ดเดียว (เฉพาะตัวเอง) |
| 34 | `/session-cards/:id` | PATCH | ❌ | ✅ | แก้ไข |
| 35 | `/session-cards/:id` | DELETE | ❌ | ✅ | ลบ |

**Summary:**
- Trainee: ✅ 2/5 APIs (READ-ONLY)
  - ✅ ดูการ์ดสรุปผลจากเทรนเนอร์
  - ✅ ดูรายละเอียดการ์ด
  - ❌ สร้างการ์ด
  - ❌ แก้ไขการ์ด
  - ❌ ลบการ์ด
- Trainer: ✅ 5/5 APIs (FULL CRUD)

---

## 7. Progress Tracking APIs (4) 📈

| # | Endpoint | Method | Trainee | Trainer | Notes |
|---|----------|--------|---------|---------|-------|
| 36 | `/progress/exercises/:name` | GET | ✅ 👀 | ✅ | ความก้าวหน้าของท่า (เฉพาะตัวเอง) |
| 37 | `/progress/body-weight` | GET | ✅ 👀 | ✅ | ความก้าวหน้าน้ำหนัก (เฉพาะตัวเอง) |
| 38 | `/progress/body-weight` | POST | ❌ | ✅ | เพิ่มบันทึกน้ำหนัก |
| 39 | `/progress/overall` | GET | ✅ 👀 | ✅ | ความก้าวหน้ารวม (เฉพาะตัวเอง) |

**Summary:**
- Trainee: ✅ 3/4 APIs (READ-ONLY)
  - ✅ ดูความก้าวหน้าของท่า
  - ✅ ดูกราฟน้ำหนักตัว
  - ✅ ดูความก้าวหน้ารวม
  - ❌ บันทึกน้ำหนักตัว
- Trainer: ✅ 4/4 APIs (FULL CRUD)

---

## 8. Notification APIs (6) 🔔

| # | Endpoint | Method | Trainee | Trainer | Notes |
|---|----------|--------|---------|---------|-------|
| 40 | `/notifications` | GET | ✅ 👀 | ✅ | ดูการแจ้งเตือน (เฉพาะตัวเอง) |
| 41 | `/notifications/:id/read` | PATCH | ✅ 📝 | ✅ | **ยกเว้น**: ทำเครื่องหมายอ่าน |
| 42 | `/notifications/read-all` | PATCH | ✅ 📝 | ✅ | **ยกเว้น**: อ่านทั้งหมด |
| 43 | `/notifications/:id` | DELETE | ✅ 📝 | ✅ | **ยกเว้น**: ลบการแจ้งเตือน |
| 44 | `/notifications/settings` | GET | ✅ 👀 | ✅ | ดูการตั้งค่า (เฉพาะตัวเอง) |
| 45 | `/notifications/settings` | PATCH | ✅ 📝 | ✅ | **ยกเว้น**: แก้ไขการตั้งค่า |

**Summary:**
- Trainee: ✅ 6/6 APIs (ยกเว้นพิเศษ - สำหรับ UX)
  - ✅ ดูการแจ้งเตือนของตัวเอง
  - ✅ ทำเครื่องหมายอ่าน (ยกเว้น - สำหรับ UX)
  - ✅ อ่านทั้งหมด (ยกเว้น - สำหรับ UX)
  - ✅ ลบการแจ้งเตือนของตัวเอง (ยกเว้น - สำหรับ UX)
  - ✅ ดูการตั้งค่า
  - ✅ แก้ไขการตั้งค่า (ยกเว้น - สำหรับ UX)
- Trainer: ✅ 6/6 APIs

**⚠️ หมายเหตุ:**
ข้อยกเว้นนี้เป็นการอนุญาตเฉพาะ **UI/UX Operations** ไม่ใช่การแก้ไขข้อมูลหลัก เพียงแค่:
- ทำเครื่องหมายว่าอ่านแล้ว
- ลบการแจ้งเตือนของตัวเอง
- ตั้งค่าการแจ้งเตือน

---

## 9. Analytics APIs (3) 📊

| # | Endpoint | Method | Trainee | Trainer | Notes |
|---|----------|--------|---------|---------|-------|
| 46 | `/analytics/dashboard` | GET | ❌ | ✅ | Dashboard สำหรับ Trainer |
| 47 | `/analytics/trainees/:id/report` | GET | ❌ | ✅ | รายงานประสิทธิภาพ |
| 48 | `/analytics/exercises/stats` | GET | ❌ | ✅ | สถิติท่า |

**Summary:**
- Trainee: ❌ 0/3 APIs (ไม่มีสิทธิ์เลย)
  - ❌ ไม่สามารถดู Analytics Dashboard
  - ❌ ไม่สามารถดูรายงาน
  - ❌ ไม่สามารถดูสถิติท่า
- Trainer: ✅ 3/3 APIs (Trainer Only)

**⚠️ หมายเหตุ:**
Trainee ดูความก้าวหน้าของตัวเองได้ผ่าน `/progress/*` แทน

---

## 10. Settings APIs (2) ⚙️

| # | Endpoint | Method | Trainee | Trainer | Notes |
|---|----------|--------|---------|---------|-------|
| 49 | `/settings` | GET | ✅ 👀 | ✅ | ดูการตั้งค่า (เฉพาะตัวเอง) |
| 50 | `/settings` | PATCH | ✅ 📝 | ✅ | **ยกเว้น**: แก้ไขการตั้งค่า |

**Summary:**
- Trainee: ✅ 2/2 APIs (ยกเว้นพิเศษ - สำหรับ UX)
  - ✅ ดูการตั้งค่าของตัวเอง
  - ✅ แก้ไขการตั้งค่า (ธีม, ภาษา, หน่วยวัด)
- Trainer: ✅ 2/2 APIs

**⚠️ Trainee สามารถแก้ไขได้เฉพาะ:**
```json
{
  "general": {
    "language": "th",           // ✅ ได้
    "timezone": "Asia/Bangkok"  // ✅ ได้
  },
  "appearance": {
    "theme": "dark",            // ✅ ได้
    "accentColor": "#FF6B35"    // ✅ ได้
  },
  "measurements": {
    "weightUnit": "kg",         // ✅ ได้
    "distanceUnit": "km"        // ✅ ได้
  }
}
```

---

## 11. Testing/Health APIs (2) 🧪

| # | Endpoint | Method | Trainee | Trainer | Notes |
|---|----------|--------|---------|---------|-------|
| 51 | `/health` | GET | ✅ | ✅ | Public - ตรวจสอบสุขภาพ API |
| 52 | `/info` | GET | ✅ | ✅ | Public - ข้อมูล API |

**Summary:**
- Trainee: ✅ 2/2 APIs (Public)
- Trainer: ✅ 2/2 APIs (Public)

---

## 📊 Summary Statistics

### Trainee Permissions Summary

| Category | Total APIs | Trainee Access | Percentage |
|----------|-----------|----------------|------------|
| Authentication | 5 | 5 ✅ | 100% |
| User Management | 5 | 3 ✅ (2 ❌) | 60% |
| Schedules | 6 | 2 ✅ (4 ❌) | 33% |
| Workouts | 6 | 3 ✅ (3 ❌) | 50% |
| Exercises | 6 | 3 ✅ (3 ❌) | 50% |
| Session Cards | 5 | 2 ✅ (3 ❌) | 40% |
| Progress | 4 | 3 ✅ (1 ❌) | 75% |
| Notifications | 6 | 6 ✅ | 100% |
| Analytics | 3 | 0 ✅ (3 ❌) | 0% |
| Settings | 2 | 2 ✅ | 100% |
| Testing | 2 | 2 ✅ | 100% |
| **TOTAL** | **50** | **31 ✅ (19 ❌)** | **62%** |

### Operation Breakdown

| Operation | Trainee | Trainer |
|-----------|---------|---------|
| **CREATE** (POST) | ❌ 0 | ✅ 11 |
| **READ** (GET) | ✅ 29 | ✅ 30 |
| **UPDATE** (PATCH) | ⚠️ 6* | ✅ 15 |
| **DELETE** (DELETE) | ⚠️ 1* | ✅ 6 |

**\*หมายเหตุ:**
- ⚠️ 6 UPDATE = ข้อยกเว้นพิเศษ:
  - 1x PATCH /users/me (โปรไฟล์ตัวเอง)
  - 2x PATCH /notifications/* (ทำเครื่องหมายอ่าน)
  - 1x PATCH /notifications/settings (ตั้งค่าแจ้งเตือน)
  - 2x PATCH /settings (ตั้งค่า UI/UX)
  
- ⚠️ 1 DELETE = ข้อยกเว้นพิเศษ:
  - 1x DELETE /notifications/:id (ลบการแจ้งเตือนตัวเอง)

**ข้อยกเว้นเหล่านี้เป็น UI/UX Operations เท่านั้น ไม่ใช่การแก้ไขข้อมูลหลัก**

---

## 🔒 Middleware Implementation

### 1. Authentication Middleware
```go
func RequireAuth() gin.HandlerFunc {
    return func(c *gin.Context) {
        token := c.GetHeader("Authorization")
        if token == "" {
            c.JSON(401, ErrorResponse("AUTH_REQUIRED", "Authentication required"))
            c.Abort()
            return
        }
        
        user, err := validateToken(token)
        if err != nil {
            c.JSON(401, ErrorResponse("INVALID_TOKEN", "Invalid or expired token"))
            c.Abort()
            return
        }
        
        c.Set("user", user)
        c.Next()
    }
}
```

### 2. Role-Based Middleware
```go
func RequireRole(allowedRoles ...string) gin.HandlerFunc {
    return func(c *gin.Context) {
        user := c.MustGet("user").(User)
        
        allowed := false
        for _, role := range allowedRoles {
            if user.Role == role {
                allowed = true
                break
            }
        }
        
        if !allowed {
            c.JSON(403, ErrorResponse(
                "INSUFFICIENT_PERMISSIONS",
                fmt.Sprintf("This action requires role: %s. Your role: %s", 
                    strings.Join(allowedRoles, " or "), user.Role),
            ))
            c.Abort()
            return
        }
        
        c.Next()
    }
}
```

### 3. Trainee Read-Only Middleware
```go
func EnforceTraineeReadOnly() gin.HandlerFunc {
    return func(c *gin.Context) {
        user := c.MustGet("user").(User)
        method := c.Request.Method
        
        // ถ้าเป็น Trainee และพยายาม CREATE/UPDATE/DELETE
        if user.Role == "trainee" {
            // ข้อยกเว้น: อนุญาตบาง endpoints
            allowedPaths := map[string][]string{
                "PATCH": {
                    "/api/v1/users/me",                    // แก้ไขโปรไฟล์
                    "/api/v1/notifications/:id/read",      // ทำเครื่องหมายอ่าน
                    "/api/v1/notifications/read-all",      // อ่านทั้งหมด
                    "/api/v1/notifications/settings",      // ตั้งค่าแจ้งเตือน
                    "/api/v1/settings",                    // ตั้งค่า UI
                },
                "DELETE": {
                    "/api/v1/notifications/:id",           // ลบการแจ้งเตือน
                },
            }
            
            path := c.FullPath()
            if allowed, ok := allowedPaths[method]; ok {
                for _, allowedPath := range allowed {
                    if matchPath(path, allowedPath) {
                        c.Next()
                        return
                    }
                }
            }
            
            // ถ้าไม่อยู่ในรายการข้อยกเว้น ให้ block
            if method == "POST" || method == "PUT" || method == "PATCH" || method == "DELETE" {
                c.JSON(403, ErrorResponse(
                    "TRAINEE_READONLY",
                    "Trainee can only view data. Cannot create, update, or delete resources.",
                ))
                c.Abort()
                return
            }
        }
        
        c.Next()
    }
}
```

### 4. Resource Owner Middleware
```go
func RequireResourceOwner(resourceType string) gin.HandlerFunc {
    return func(c *gin.Context) {
        user := c.MustGet("user").(User)
        resourceID := c.Param("id")
        
        // Trainer สามารถเข้าถึงทุกอย่างได้
        if user.Role == "trainer" {
            c.Next()
            return
        }
        
        // Trainee ต้องเป็นเจ้าของ resource เท่านั้น
        isOwner, err := checkResourceOwnership(resourceType, resourceID, user.ID)
        if err != nil || !isOwner {
            c.JSON(403, ErrorResponse(
                "FORBIDDEN",
                "You can only access your own data",
            ))
            c.Abort()
            return
        }
        
        c.Next()
    }
}
```

---

## 🛡️ Route Protection Examples

### Example 1: Schedules (Trainee READ-ONLY)
```go
func SetupScheduleRoutes(r *gin.RouterGroup) {
    schedules := r.Group("/schedules")
    {
        // CREATE - Trainer only
        schedules.POST("", 
            middleware.RequireAuth(),
            middleware.RequireRole("trainer"),
            handler.CreateSchedule,
        )
        
        // READ - Authenticated (Trainee can view their own)
        schedules.GET("", 
            middleware.RequireAuth(),
            handler.ListSchedules,  // Auto-filter by user
        )
        
        schedules.GET("/:id", 
            middleware.RequireAuth(),
            middleware.RequireResourceOwner("schedule"),
            handler.GetSchedule,
        )
        
        // UPDATE - Trainer only
        schedules.PATCH("/:id", 
            middleware.RequireAuth(),
            middleware.RequireRole("trainer"),
            handler.UpdateSchedule,
        )
        
        // DELETE - Trainer only
        schedules.DELETE("/:id", 
            middleware.RequireAuth(),
            middleware.RequireRole("trainer"),
            handler.DeleteSchedule,
        )
    }
}
```

### Example 2: User Profile (Trainee can update their own)
```go
func SetupUserRoutes(r *gin.RouterGroup) {
    users := r.Group("/users")
    {
        // READ - Self only for Trainee
        users.GET("/me", 
            middleware.RequireAuth(),
            handler.GetCurrentUser,
        )
        
        // UPDATE - Can update own profile (with restrictions)
        users.PATCH("/me", 
            middleware.RequireAuth(),
            middleware.ValidateProfileUpdate(),  // Validate allowed fields
            handler.UpdateCurrentUser,
        )
        
        // READ - Trainer only (other users)
        users.GET("/:id", 
            middleware.RequireAuth(),
            middleware.RequireRole("trainer"),
            handler.GetUser,
        )
    }
}
```

---

## ⚠️ Critical Security Checks

### 1. Never Trust Client Input
```go
// ❌ BAD - Trainee อาจแก้ไข role ได้
func UpdateUser(req UpdateUserRequest) {
    db.Update(&User{
        Role: req.Role,  // ❌ อันตราย!
    })
}

// ✅ GOOD - กรองเฉพาะฟิลด์ที่อนุญาต
func UpdateUser(user *User, req UpdateUserRequest) {
    // Trainee แก้ไขได้เฉพาะฟิลด์เหล่านี้
    if user.Role == "trainee" {
        user.Name = req.Name
        user.Phone = req.Phone
        user.Avatar = req.Avatar
        // ไม่อนุญาตให้แก้ไข role, email
    } else if user.Role == "trainer" {
        // Trainer แก้ไขได้มากกว่า
    }
}
```

### 2. Always Filter by User ID
```go
// ❌ BAD - Trainee อาจเห็นข้อมูลคนอื่น
func ListSchedules() []Schedule {
    return db.Find(&Schedule{})  // ❌ ดูทั้งหมด!
}

// ✅ GOOD - กรองตาม user
func ListSchedules(user *User) []Schedule {
    if user.Role == "trainee" {
        return db.Where("trainee_id = ?", user.ID).Find(&Schedule{})
    } else {
        return db.Find(&Schedule{})
    }
}
```

### 3. Validate Resource Ownership
```go
// ✅ GOOD - ตรวจสอบเจ้าของก่อนอนุญาต
func GetSchedule(user *User, scheduleID string) (*Schedule, error) {
    schedule := &Schedule{}
    db.First(schedule, scheduleID)
    
    // Trainee ดูได้เฉพาะของตัวเอง
    if user.Role == "trainee" && schedule.TraineeID != user.ID {
        return nil, ErrForbidden
    }
    
    return schedule, nil
}
```

---

## 🎯 Permission Summary Table

### Quick Reference: What Trainee CAN Do

| Resource | View | Create | Update | Delete |
|----------|------|--------|--------|--------|
| **Own Profile** | ✅ | - | ✅* | ❌ |
| **Own Schedules** | ✅ | ❌ | ❌ | ❌ |
| **Own Workouts** | ✅ | ❌ | ❌ | ❌ |
| **Exercise Library** | ✅ | ❌ | ❌ | ❌ |
| **Own Session Cards** | ✅ | ❌ | ❌ | ❌ |
| **Own Progress** | ✅ | ❌ | ❌ | ❌ |
| **Own Notifications** | ✅ | - | ✅** | ✅** |
| **Own Settings** | ✅ | - | ✅** | ❌ |
| **Analytics** | ❌ | ❌ | ❌ | ❌ |
| **Other Users' Data** | ❌ | ❌ | ❌ | ❌ |

**Legend:**
- ✅ = อนุญาต
- ❌ = ไม่อนุญาต
- ✅* = อนุญาตบางฟิลด์ (name, phone, avatar)
- ✅** = อนุญาตเฉพาะ UI/UX operations (mark read, delete notification, change theme)
- `-` = ไม่เกี่ยวข้อง

---

## 🚫 Common Attack Scenarios (Prevention)

### 1. Role Escalation
```
❌ Trainee พยายามเปลี่ยน role เป็น trainer

Request:
PATCH /api/v1/users/me
{
  "role": "trainer"
}

Response:
403 Forbidden
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Cannot modify role field"
  }
}
```

### 2. Unauthorized Data Access
```
❌ Trainee พยายามดูข้อมูลคนอื่น

Request:
GET /api/v1/schedules/other-user-schedule-123

Response:
403 Forbidden
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You can only access your own data"
  }
}
```

### 3. Unauthorized Modification
```
❌ Trainee พยายามสร้างตารางนัด

Request:
POST /api/v1/schedules
{
  "traineeId": "user-123",
  "date": "2026-01-25"
}

Response:
403 Forbidden
{
  "error": {
    "code": "TRAINEE_READONLY",
    "message": "Trainee can only view data. Cannot create schedules."
  }
}
```

---

## ✅ Final Checklist: Trainee Restrictions

### ❌ Trainee CANNOT:

- [ ] สร้างตารางนัดหมาย
- [ ] แก้ไขตารางนัดหมาย
- [ ] ลบตารางนัดหมาย
- [ ] บันทึกผลการฝึก
- [ ] แก้ไขผลการฝึก
- [ ] ลบผลการฝึก
- [ ] สร้างท่าออกกำลังกาย
- [ ] แก้ไขท่าออกกำลังกาย
- [ ] ลบท่าออกกำลังกาย
- [ ] สร้างการ์ดสรุปผล
- [ ] แก้ไขการ์ดสรุปผล
- [ ] ลบการ์ดสรุปผล
- [ ] บันทึกน้ำหนักตัว
- [ ] ดู Analytics Dashboard
- [ ] ดูข้อมูลของผู้ใช้คนอื่น
- [ ] เปลี่ยน Role ของตัวเอง
- [ ] เปลี่ยน Email ของตัวเอง

### ✅ Trainee CAN:

- [x] Login/Logout
- [x] ดูโปรไฟล์ตัวเอง
- [x] แก้ไขข้อมูลส่วนตัว (name, phone, avatar, height, weight)
- [x] ดูตารางนัดหมายของตัวเอง
- [x] ดูประวัติการฝึกของตัวเอง
- [x] ดูคลังท่าออกกำลังกาย
- [x] ดูการ์ดสรุปผลจากเทรนเนอร์
- [x] ดูความก้าวหน้าของตัวเอง (กราฟ, สถิติ)
- [x] ดูการแจ้งเตือนของตัวเอง
- [x] ทำเครื่องหมายแจ้งเตือนว่าอ่านแล้ว
- [x] ลบการแจ้งเตือนของตัวเอง
- [x] แก้ไขการตั้งค่า UI (theme, language, units)
- [x] แก้ไขการตั้งค่าการแจ้งเตือน

---

## 📞 Questions?

**Q: ทำไม Trainee ถึงแก้ไขโปรไฟล์ได้?**  
A: เพื่อให้สามารถอัปเดตข้อมูลส่วนตัว (ชื่อ, เบอร์, รูป) ได้ แต่ไม่สามารถเปลี่ยน role หรือ email

**Q: ทำไม Trainee ถึงลบการแจ้งเตือนได้?**  
A: เพื่อ UX ที่ดี ให้สามารถจัดการกล่องแจ้งเตือนของตัวเองได้ (UI operation เท่านั้น)

**Q: ทำไม Trainee ถึงแก้ไข Settings ได้?**  
A: เพื่อให้เปลี่ยนธีม, ภาษา, หน่วยวัดได้ (UI preference เท่านั้น ไม่ใช่ข้อมูลหลัก)

**Q: จะป้องกัน Trainee แก้ไข role ยังไง?**  
A: ใช้ field-level validation ใน backend ไม่ยอมให้แก้ไข role และ email เด็ดขาด

**Q: ถ้า Trainee พยายาม POST/DELETE จะเกิดอะไร?**  
A: จะได้ `403 Forbidden` พร้อม error message: `"TRAINEE_READONLY"`

---

**Created by**: Figma Make AI Assistant  
**Date**: 23 มกราคม 2026  
**Version**: 1.0.0  
**Status**: ✅ Production Security Guidelines

---

## 🎯 Key Takeaway

```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║  TRAINEE = 100% READ-ONLY                                 ║
║                                                            ║
║  ข้อยกเว้นเพียง 3 อย่าง (UI/UX Operations):               ║
║  1. แก้ไขข้อมูลส่วนตัว (name, phone, avatar)               ║
║  2. จัดการการแจ้งเตือน (mark read, delete)                 ║
║  3. ตั้งค่า UI (theme, language, units)                   ║
║                                                            ║
║  ทุกอย่างนอกเหนือจากนี้ = ❌ FORBIDDEN                    ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```
