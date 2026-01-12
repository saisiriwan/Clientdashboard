# 🎯 API Design Specification
## ระบบจัดการการฝึกออกกำลังกาย (Fitness Training Management System)

**Version:** 2.0  
**Date:** 2026-01-11  
**Status:** Complete Design

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Authentication APIs](#authentication-apis)
4. [Trainee APIs (Read-Only)](#trainee-apis-read-only)
5. [Trainer APIs (Full CRUD)](#trainer-apis-full-crud)
6. [Shared/Common APIs](#shared-common-apis)
7. [Data Models](#data-models)
8. [Error Codes](#error-codes)
9. [API Summary](#api-summary)

---

## 🎯 Overview

### **System Requirements:**
- 🔐 Google OAuth Authentication
- 👥 Role-Based Access Control (RBAC)
  - **Trainee:** Read-Only access
  - **Trainer:** Full CRUD access
- 📱 Responsive (Mobile + Web)
- 🌓 Light/Dark Mode
- 🔔 Real-time Notifications

### **Core Features:**
1. ตารางนัดหมายการฝึก (Schedules)
2. โปรแกรมการฝึก (Training Programs)
3. กราฟความก้าวหน้า (Progress Charts)
4. ประวัติท่าออกกำลังกาย (Exercise History)
5. การ์ดสรุปผลการฝึก (Session Summary Cards)
6. การแจ้งเตือน (Notifications)
7. ข้อมูลส่วนตัว (Profile)

---

## 🏗️ Architecture

### **Base URL:**
```
Production:  https://api.fitnesstraining.com/api/v1
Development: http://localhost:8080/api/v1
```

### **Authentication:**
- **Method:** JWT Tokens (HTTP-only Cookies)
- **Header:** `Authorization: Bearer {token}` (optional, ใช้ Cookie เป็นหลัก)
- **Cookie Name:** `auth_token`

### **Request/Response Format:**
```json
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}

// Error Response
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": { ... }
  }
}
```

---

## 🔐 Authentication APIs

### **1. POST /auth/register**
สมัครสมาชิกใหม่

**Request Body:**
```json
{
  "name": "สมชาย ใจดี",
  "email": "somchai@example.com",
  "password": "Password123!",
  "phoneNumber": "0812345678",
  "role": "trainee"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "สมชาย ใจดี",
      "email": "somchai@example.com",
      "role": "trainee",
      "profileImage": null,
      "createdAt": "2026-01-11T10:00:00Z"
    }
  },
  "message": "Registration successful"
}
```

**Validation:**
- ✅ Email format
- ✅ Password strength (min 8 chars, 1 uppercase, 1 number)
- ✅ Unique email
- ✅ Role: "trainee" or "trainer"

---

### **2. POST /auth/login**
เข้าสู่ระบบด้วย Email/Password

**Request Body:**
```json
{
  "email": "somchai@example.com",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "สมชาย ใจดี",
      "email": "somchai@example.com",
      "role": "trainee",
      "profileImage": "https://...",
      "phoneNumber": "0812345678"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..." // Optional: ถ้าไม่ใช้ Cookie
  },
  "message": "Login successful"
}
```

**Notes:**
- ✅ Set HTTP-only Cookie: `auth_token`
- ✅ Cookie Expiry: 7 days
- ✅ CSRF Protection

---

### **3. POST /auth/logout**
ออกจากระบบ

**Auth Required:** ✅ Yes

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Notes:**
- ✅ Clear `auth_token` Cookie
- ✅ Invalidate token (add to blacklist)

---

### **4. GET /auth/me**
ดึงข้อมูลผู้ใช้ปัจจุบัน

**Auth Required:** ✅ Yes

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "สมชาย ใจดี",
    "email": "somchai@example.com",
    "role": "trainee",
    "profileImage": "https://...",
    "phoneNumber": "0812345678",
    "createdAt": "2026-01-11T10:00:00Z",
    "trainerInfo": {
      "trainerId": 5,
      "trainerName": "โค้ชเบน",
      "assignedDate": "2026-01-01"
    }
  }
}
```

---

### **5. GET /auth/google/login**
เริ่มต้น Google OAuth Flow (Redirect)

**Response:** Redirect to Google OAuth Consent Screen

---

### **6. GET /auth/google/callback**
Google OAuth Callback Endpoint

**Query Params:**
- `code`: Authorization code from Google
- `state`: CSRF token

**Response:** Redirect to Frontend with auth token or error

---

### **7. POST /auth/refresh**
Refresh Access Token

**Auth Required:** ✅ Yes (Refresh Token in Cookie)

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "new_access_token"
  }
}
```

---

## 👤 Trainee APIs (Read-Only)

**Base Path:** `/trainee/*`  
**Auth Required:** ✅ Yes  
**Role Required:** `trainee` or `trainer`

---

### **📅 Schedules (ตารางนัดหมาย)**

#### **1. GET /trainee/schedules/upcoming**
ดึงนัดหมาย N วันข้างหน้า (สำหรับ Calendar View)

**Query Params:**
- `days` (optional): จำนวนวันข้างหน้า (default: 7, max: 30)

**Response:**
```json
{
  "success": true,
  "data": {
    "upcomingSessions": [
      {
        "id": 1,
        "date": "2026-01-12",
        "time": "14:00",
        "duration": 60,
        "title": "Strength Training Session",
        "status": "confirmed",
        "trainer": {
          "id": 5,
          "name": "โค้ชเบน",
          "profileImage": "https://...",
          "phoneNumber": "0899999999"
        },
        "location": {
          "id": 1,
          "name": "สาขาสยาม",
          "address": "ชั้น 5 สยามพารากอน",
          "floor": "5",
          "building": "สยามพารากอน",
          "mapUrl": "https://maps.google.com/..."
        }
      }
    ],
    "calendar": [
      {
        "date": "2026-01-11",
        "dayName": "วันเสาร์",
        "isToday": true,
        "hasSession": false,
        "sessionCount": 0
      },
      {
        "date": "2026-01-12",
        "dayName": "วันอาทิตย์",
        "isToday": false,
        "hasSession": true,
        "sessionCount": 1
      }
    ]
  }
}
```

**Use Case:** หน้า Dashboard + Schedule Calendar

---

#### **2. GET /trainee/schedules**
ดึงตารางนัดหมายทั้งหมด (with filters)

**Query Params:**
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD
- `status` (optional): scheduled, confirmed, completed, cancelled
- `page` (optional): หน้าที่ต้องการ (default: 1)
- `limit` (optional): จำนวนต่อหน้า (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "schedules": [
      {
        "id": 1,
        "date": "2026-01-12",
        "time": "14:00",
        "duration": 60,
        "title": "Strength Training",
        "status": "confirmed",
        "trainer": {
          "id": 5,
          "name": "โค้ชเบน"
        },
        "location": {
          "name": "สาขาสยาม"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "itemsPerPage": 20
    }
  }
}
```

**Use Case:** หน้า Schedules (List View)

---

#### **3. GET /trainee/schedules/:id**
ดึงรายละเอียดนัดหมายทีละรายการ

**Path Params:**
- `id`: Schedule ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "date": "2026-01-12",
    "time": "14:00",
    "duration": 60,
    "title": "Strength Training Session",
    "description": "โปรแกรมเน้นเพิ่มกล้ามเนื้อขา และหลัง",
    "status": "confirmed",
    "trainer": {
      "id": 5,
      "name": "โค้ชเบน",
      "profileImage": "https://...",
      "email": "coach.ben@example.com",
      "phoneNumber": "0899999999",
      "specialization": ["Strength", "Bodybuilding"]
    },
    "location": {
      "id": 1,
      "name": "สาขาสยาม",
      "address": "ชั้น 5 สยามพารากอน กรุงเทพฯ 10330",
      "floor": "5",
      "building": "สยามพารากอน",
      "mapUrl": "https://maps.google.com/..."
    },
    "sessionType": "Strength Training",
    "plannedExercises": [
      "Squat 4x8",
      "Deadlift 3x6",
      "Bench Press 4x10"
    ],
    "notes": "อย่าลืมนำเข็มขัด Lifting Belt มาด้วย",
    "relatedSessionCard": 15,
    "createdAt": "2026-01-01T10:00:00Z",
    "updatedAt": "2026-01-10T15:30:00Z"
  }
}
```

**Use Case:** หน้า Schedule Detail (Modal/Page)

---

### **📚 Programs (โปรแกรมการฝึก)**

#### **4. GET /trainee/programs/current**
ดึงโปรแกรมปัจจุบันของ Trainee

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "name": "12-Week Muscle Building Program",
    "description": "โปรแกรมเน้นสร้างมวลกล้ามเนื้อ ระยะเวลา 12 สัปดาห์",
    "duration": "12 weeks",
    "currentWeek": 5,
    "totalWeeks": 12,
    "progressPercentage": 41.67,
    "startDate": "2025-12-01",
    "endDate": "2026-02-21",
    "status": "active",
    "trainer": {
      "id": 5,
      "name": "โค้ชเบน",
      "profileImage": "https://..."
    },
    "sessionsCompleted": 18,
    "totalSessions": 36,
    "sessionCompletionRate": 50.0,
    "nextSession": {
      "id": 25,
      "date": "2026-01-12",
      "time": "14:00",
      "title": "Week 5 - Lower Body",
      "exercises": ["Squat", "Leg Press", "Romanian Deadlift"]
    },
    "goals": [
      "เพิ่มน้ำหนัก Squat ให้ถึง 120kg",
      "เพิ่มมวลกล้ามเนื้อ 3-5 kg",
      "ลดไขมัน 2-3%"
    ],
    "weeklySchedule": [
      {
        "day": "Monday",
        "focus": "Upper Body - Push",
        "duration": 60
      },
      {
        "day": "Wednesday",
        "focus": "Lower Body",
        "duration": 60
      },
      {
        "day": "Friday",
        "focus": "Upper Body - Pull",
        "duration": 60
      }
    ],
    "progressNotes": [
      {
        "week": 4,
        "date": "2026-01-05",
        "note": "ความก้าวหน้าดีมาก Squat เพิ่มขึ้น 5kg",
        "recordedBy": "โค้ชเบน"
      }
    ],
    "createdAt": "2025-12-01T10:00:00Z",
    "updatedAt": "2026-01-10T15:00:00Z"
  }
}
```

**Use Case:** หน้า Dashboard + Program Detail

---

#### **5. GET /trainee/programs**
ดึงรายการโปรแกรมทั้งหมด (Past + Present)

**Query Params:**
- `status` (optional): active, completed, paused
- `page` (optional)
- `limit` (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "programs": [
      {
        "id": 10,
        "name": "12-Week Muscle Building Program",
        "duration": "12 weeks",
        "currentWeek": 5,
        "totalWeeks": 12,
        "progressPercentage": 41.67,
        "status": "active",
        "startDate": "2025-12-01",
        "endDate": "2026-02-21",
        "trainer": {
          "id": 5,
          "name": "โค้ชเบน"
        }
      },
      {
        "id": 8,
        "name": "8-Week Fat Loss Program",
        "duration": "8 weeks",
        "currentWeek": 8,
        "totalWeeks": 8,
        "progressPercentage": 100,
        "status": "completed",
        "startDate": "2025-09-01",
        "endDate": "2025-10-26"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 3,
      "itemsPerPage": 20
    }
  }
}
```

**Use Case:** หน้า Programs List

---

#### **6. GET /trainee/programs/:id**
ดึงรายละเอียดโปรแกรม

**Path Params:**
- `id`: Program ID

**Response:** เหมือนกับ `/trainee/programs/current`

---

### **📊 Stats (สถิติสรุป)**

#### **7. GET /trainee/stats**
ดึงสถิติสรุปของ Trainee (สำหรับ Dashboard)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSessions": 124,
    "completedSessions": 118,
    "upcomingSessions": 6,
    "cancelledSessions": 0,
    "currentStreak": 5,
    "longestStreak": 12,
    "totalWorkoutHours": 148.5,
    "averageSessionsPerWeek": 3.2,
    "currentProgram": {
      "id": 10,
      "name": "12-Week Muscle Building Program",
      "progressPercentage": 41.67,
      "currentWeek": 5,
      "totalWeeks": 12
    },
    "recentAchievements": [
      {
        "id": 1,
        "title": "5 Sessions Streak! 🔥",
        "date": "2026-01-10",
        "badge": "🔥"
      },
      {
        "id": 2,
        "title": "Completed 100 Sessions",
        "date": "2026-01-05",
        "badge": "💯"
      }
    ]
  }
}
```

**Use Case:** หน้า Dashboard

---

### **🔔 Notifications (การแจ้งเตือน)**

#### **8. GET /trainee/notifications**
ดึงการแจ้งเตือนทั้งหมด

**Query Params:**
- `limit` (optional): default 20, max 100
- `page` (optional): default 1
- `unreadOnly` (optional): true/false (default: false)
- `type` (optional): schedule, progress, achievement, system

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 1,
        "type": "schedule",
        "title": "เซสชั่นพรุ่งนี้",
        "message": "คุณมีนัดฝึกกับโค้ชเบน พรุ่งนี้ 14:00 น. ที่สาขาสยาม",
        "relatedId": 25,
        "relatedType": "schedule",
        "actionUrl": "/schedules/25",
        "priority": "high",
        "isRead": false,
        "createdAt": "2026-01-11T10:00:00Z"
      },
      {
        "id": 2,
        "type": "progress",
        "title": "คุณเพิ่ม PR ใหม่! 🎉",
        "message": "Squat: 105kg (+5kg) - ยอดเยี่ยม!",
        "relatedId": 15,
        "relatedType": "session_card",
        "actionUrl": "/sessions/15",
        "priority": "medium",
        "isRead": false,
        "createdAt": "2026-01-10T16:30:00Z"
      },
      {
        "id": 3,
        "type": "achievement",
        "title": "Achievement Unlocked! 🏆",
        "message": "คุณฝึกติดต่อกัน 5 วันแล้ว!",
        "relatedId": null,
        "relatedType": null,
        "actionUrl": null,
        "priority": "low",
        "isRead": true,
        "createdAt": "2026-01-10T09:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 85,
      "itemsPerPage": 20
    },
    "unreadCount": 12
  }
}
```

**Use Case:** หน้า Notifications + Badge Count

---

#### **9. PUT /trainee/notifications/:id/read**
Mark notification as read

**Path Params:**
- `id`: Notification ID

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

#### **10. PUT /trainee/notifications/read-all**
Mark all notifications as read

**Response:**
```json
{
  "success": true,
  "data": {
    "markedCount": 12
  },
  "message": "All notifications marked as read"
}
```

---

### **📝 Session Cards (การ์ดสรุปผลการฝึก)**

#### **11. GET /trainee/sessions**
ดึง Session Cards ทั้งหมด (ประวัติการฝึก)

**Query Params:**
- `clientId` (optional): สำหรับ Trainer ดู Client (Trainee ไม่ต้องส่ง)
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD
- `page` (optional)
- `limit` (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": 15,
        "scheduleId": 25,
        "date": "2026-01-10",
        "title": "Week 5 - Lower Body",
        "duration": 60,
        "trainer": {
          "id": 5,
          "name": "โค้ชเบน",
          "profileImage": "https://..."
        },
        "exercises": [
          {
            "id": 1,
            "name": "Squat",
            "category": "Legs",
            "sets": [
              {
                "setNumber": 1,
                "reps": 8,
                "weight": 100,
                "rest": 120,
                "completed": true
              },
              {
                "setNumber": 2,
                "reps": 8,
                "weight": 105,
                "rest": 120,
                "completed": true
              }
            ],
            "notes": "Form ดีมาก! PR ใหม่ 105kg 🎉"
          }
        ],
        "overallFeedback": "เซสชั่นที่ยอดเยี่ยม! ความก้าวหน้าเด่นชัด",
        "nextSessionGoals": [
          "เพิ่มน้ำหนัก Squat เป็น 110kg",
          "ฝึก Core Stability"
        ],
        "createdAt": "2026-01-10T16:00:00Z",
        "updatedAt": "2026-01-10T16:15:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 118,
      "itemsPerPage": 20
    }
  }
}
```

**Use Case:** หน้า Session History (List View)

---

#### **12. GET /trainee/sessions/:id**
ดึงรายละเอียด Session Card ทีละรายการ

**Path Params:**
- `id`: Session Card ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "scheduleId": 25,
    "date": "2026-01-10",
    "title": "Week 5 - Lower Body",
    "duration": 60,
    "trainer": {
      "id": 5,
      "name": "โค้ชเบน",
      "profileImage": "https://...",
      "email": "coach.ben@example.com"
    },
    "exercises": [
      {
        "id": 1,
        "name": "Squat",
        "category": "Legs",
        "sets": [
          {
            "setNumber": 1,
            "reps": 8,
            "weight": 100,
            "duration": null,
            "rest": 120,
            "completed": true
          },
          {
            "setNumber": 2,
            "reps": 8,
            "weight": 105,
            "duration": null,
            "rest": 120,
            "completed": true
          },
          {
            "setNumber": 3,
            "reps": 6,
            "weight": 105,
            "duration": null,
            "rest": 180,
            "completed": true
          }
        ],
        "notes": "Form ดีมาก! PR ใหม่ 105kg 🎉 แต่เซตสุดท้ายทำได้แค่ 6 reps"
      },
      {
        "id": 2,
        "name": "Leg Press",
        "category": "Legs",
        "sets": [
          {
            "setNumber": 1,
            "reps": 12,
            "weight": 180,
            "rest": 90,
            "completed": true
          },
          {
            "setNumber": 2,
            "reps": 12,
            "weight": 180,
            "rest": 90,
            "completed": true
          },
          {
            "setNumber": 3,
            "reps": 10,
            "weight": 180,
            "rest": 90,
            "completed": true
          }
        ],
        "notes": "ควบคุม Range of Motion ได้ดี"
      }
    ],
    "overallFeedback": "เซสชั่นที่ยอดเยี่ยม! นัทธกรมีความก้าวหน้าเด่นชัดในการยก Squat พุ่งไปถึง 105kg แล้ว ควรเน้นการฝึกความแข็งแรงแกนกลางต่อไป เพื่อรองรับน้ำหนักที่เพิ่มขึ้น Form ดีมาก มีความลึกที่พอดี และเข่าไม่เกินปลายเท้า",
    "nextSessionGoals": [
      "เพิ่มน้ำหนัก Squat เป็น 110kg",
      "ฝึก Core Stability (Plank 3x60s)",
      "ปรับ Leg Press form ให้ลึกขึ้น"
    ],
    "createdAt": "2026-01-10T16:00:00Z",
    "updatedAt": "2026-01-10T16:15:00Z"
  }
}
```

**Use Case:** หน้า Session Detail (Modal/Page) - การ์ดสรุปผลการฝึกแบบละเอียด

---

### **📈 Metrics (ข้อมูลการวัดผล)**

#### **13. GET /trainee/metrics**
ดึงข้อมูลการวัดผล (น้ำหนัก, ไขมัน, กล้ามเนื้อ)

**Query Params:**
- `type` (optional): weight, body_fat, muscle_mass, measurement
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD

**Response:**
```json
{
  "success": true,
  "data": {
    "metrics": [
      {
        "id": 1,
        "date": "2026-01-10",
        "type": "weight",
        "value": 75.5,
        "unit": "kg",
        "notes": "หลังอาหารเช้า"
      },
      {
        "id": 2,
        "date": "2026-01-10",
        "type": "body_fat",
        "value": 18.5,
        "unit": "%",
        "notes": null
      },
      {
        "id": 3,
        "date": "2026-01-10",
        "type": "muscle_mass",
        "value": 58.2,
        "unit": "kg",
        "notes": null
      }
    ]
  }
}
```

**Use Case:** กราฟความก้าวหน้า (Weight, Body Fat, Muscle Mass Charts)

---

### **👤 Profile (ข้อมูลส่วนตัว)**

#### **14. GET /trainee/me**
ดึงโปรไฟล์ของฉัน (Trainee)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 100,
    "name": "สมชาย ใจดี",
    "email": "somchai@example.com",
    "phoneNumber": "0812345678",
    "profileImage": "https://...",
    "dateOfBirth": "1995-05-15",
    "gender": "male",
    "height": 175,
    "weight": 75.5,
    "joinDate": "2025-09-01",
    "currentProgram": {
      "id": 10,
      "name": "12-Week Muscle Building Program"
    },
    "assignedTrainer": {
      "id": 5,
      "name": "โค้ชเบน",
      "profileImage": "https://...",
      "phoneNumber": "0899999999",
      "email": "coach.ben@example.com"
    },
    "goals": [
      "เพิ่มมวลกล้ามเนื้อ 5kg",
      "ลดไขมัน 3%",
      "Squat 120kg"
    ],
    "medicalNotes": "ไม่มีโรคประจำตัว",
    "emergencyContact": {
      "name": "สมหญิง ใจดี",
      "relationship": "ภรรยา",
      "phoneNumber": "0823456789"
    },
    "totalSessions": 124,
    "lastSessionDate": "2026-01-10",
    "status": "active",
    "createdAt": "2025-09-01T10:00:00Z",
    "updatedAt": "2026-01-10T16:30:00Z"
  }
}
```

**Use Case:** หน้า Profile

---

### **🔍 Search & Filters**

#### **15. GET /trainee/sessions/search**
ค้นหา Session Cards ด้วย keyword

**Query Params:**
- `q`: Search keyword (exercise name, trainer name, feedback)
- `page` (optional)
- `limit` (optional)

**Response:** เหมือน `/trainee/sessions`

**Use Case:** Search bar ในหน้า Session History

---

---

## 👨‍🏫 Trainer APIs (Full CRUD)

**Base Path:** `/trainer/*`  
**Auth Required:** ✅ Yes  
**Role Required:** `trainer`

---

### **📊 Dashboard**

#### **1. GET /trainer/dashboard/stats**
ดึงสถิติสรุปของ Trainer (สำหรับ Trainer Dashboard)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalClients": 15,
    "activeClients": 12,
    "inactiveClients": 3,
    "activePrograms": 10,
    "todaySessions": 3,
    "weekSessions": 18,
    "monthSessions": 72,
    "completionRate": 95.5,
    "upcomingSchedules": [
      {
        "id": 25,
        "date": "2026-01-12",
        "time": "14:00",
        "duration": 60,
        "title": "Strength Training",
        "client": {
          "id": 1,
          "name": "สมชาย ใจดี",
          "profileImage": "https://..."
        },
        "location": {
          "name": "สาขาสยาม"
        }
      }
    ],
    "recentActivities": [
      {
        "id": 1,
        "type": "session_completed",
        "message": "Completed session with สมชาย ใจดี",
        "timestamp": "2026-01-10T16:00:00Z"
      }
    ]
  }
}
```

---

### **👥 Clients Management**

#### **2. GET /trainer/clients**
ดึงรายชื่อลูกศิษย์ทั้งหมด

**Query Params:**
- `status` (optional): active, inactive
- `search` (optional): ค้นหาชื่อ/email
- `page`, `limit`

**Response:**
```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "id": 1,
        "userId": 100,
        "name": "สมชาย ใจดี",
        "email": "somchai@example.com",
        "phoneNumber": "0812345678",
        "profileImage": "https://...",
        "joinDate": "2025-09-01",
        "currentProgram": "12-Week Muscle Building Program",
        "totalSessions": 124,
        "lastSessionDate": "2026-01-10",
        "status": "active"
      }
    ],
    "pagination": { ... }
  }
}
```

---

#### **3. GET /trainer/clients/:id**
ดึงรายละเอียดลูกศิษย์

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "สมชาย ใจดี",
    "email": "somchai@example.com",
    "profileImage": "https://...",
    "currentProgram": {
      "id": 10,
      "name": "12-Week Muscle Building Program",
      "currentWeek": 5,
      "progressPercentage": 41.67
    },
    "stats": {
      "totalSessions": 124,
      "completedSessions": 118,
      "currentStreak": 5
    },
    "recentSessions": [
      {
        "id": 15,
        "date": "2026-01-10",
        "title": "Lower Body"
      }
    ]
  }
}
```

---

#### **4. POST /trainer/clients**
เพิ่มลูกศิษย์ใหม่ (Assign existing user หรือ invite)

**Request Body:**
```json
{
  "email": "newclient@example.com",
  "name": "ลูกค้าใหม่",
  "phoneNumber": "0811111111",
  "inviteMessage": "ยินดีต้อนรับ!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clientId": 20,
    "invitationSent": true
  }
}
```

---

#### **5. PATCH /trainer/clients/:id**
แก้ไขข้อมูลลูกศิษย์

**Request Body:**
```json
{
  "phoneNumber": "0811111111",
  "goals": ["เพิ่มกล้ามเนื้อ", "ลดไขมัน"],
  "medicalNotes": "โรคหัวใจ"
}
```

---

#### **6. DELETE /trainer/clients/:id**
ลบ/ยกเลิก Assignment ลูกศิษย์

**Response:**
```json
{
  "success": true,
  "message": "Client removed successfully"
}
```

---

#### **7. GET /trainer/clients/:id/metrics**
ดึงข้อมูลการวัดผลของลูกศิษย์

**Response:** เหมือน `/trainee/metrics`

---

#### **8. GET /trainer/clients/:id/sessions**
ดึง Session History ของลูกศิษย์

**Response:** เหมือน `/trainee/sessions`

---

### **📅 Schedules Management**

#### **9. GET /trainer/schedules**
ดึงตารางนัดหมายทั้งหมดของ Trainer

**Query Params:**
- `startDate`, `endDate`, `status`
- `clientId` (optional): filter by client

**Response:**
```json
{
  "success": true,
  "data": {
    "schedules": [
      {
        "id": 25,
        "date": "2026-01-12",
        "time": "14:00",
        "duration": 60,
        "title": "Strength Training",
        "status": "confirmed",
        "client": {
          "id": 1,
          "name": "สมชาย ใจดี",
          "profileImage": "https://..."
        },
        "location": {
          "name": "สาขาสยาม"
        }
      }
    ],
    "pagination": { ... }
  }
}
```

---

#### **10. GET /trainer/schedules/:id**
ดึงรายละเอียดนัดหมาย

---

#### **11. POST /trainer/schedules**
สร้างนัดหมายใหม่

**Request Body:**
```json
{
  "clientId": 1,
  "date": "2026-01-15",
  "time": "14:00",
  "duration": 60,
  "title": "Upper Body Training",
  "description": "เน้นหลัง + ไหล่",
  "locationId": 1,
  "sessionType": "Strength Training",
  "plannedExercises": ["Deadlift", "Pull-ups", "Shoulder Press"],
  "notes": "นำเข็มขัด Lifting มาด้วย"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "scheduleId": 30
  },
  "message": "Schedule created successfully"
}
```

---

#### **12. PATCH /trainer/schedules/:id**
แก้ไขนัดหมาย

**Request Body:**
```json
{
  "time": "15:00",
  "status": "confirmed",
  "notes": "เปลี่ยนเวลาเป็น 15:00"
}
```

---

#### **13. DELETE /trainer/schedules/:id**
ยกเลิกนัดหมาย

**Request Body:**
```json
{
  "reason": "ลูกค้าติดธุระ",
  "notifyClient": true
}
```

---

### **📝 Session Cards Management**

#### **14. GET /trainer/sessions**
ดึง Session Cards ของ Trainer (ทุก Client)

---

#### **15. GET /trainer/sessions/:id**
ดึงรายละเอียด Session Card

---

#### **16. POST /trainer/sessions**
สร้าง Session Card ใหม่ (บันทึกผลการฝึก)

**Request Body:**
```json
{
  "scheduleId": 25,
  "clientId": 1,
  "date": "2026-01-10",
  "title": "Week 5 - Lower Body",
  "duration": 60,
  "exercises": [
    {
      "name": "Squat",
      "category": "Legs",
      "sets": [
        {
          "setNumber": 1,
          "reps": 8,
          "weight": 100,
          "rest": 120,
          "completed": true
        },
        {
          "setNumber": 2,
          "reps": 8,
          "weight": 105,
          "rest": 120,
          "completed": true
        }
      ],
      "notes": "Form ดีมาก! PR ใหม่ 105kg"
    }
  ],
  "overallFeedback": "เซสชั่นที่ยอดเยี่ยม!",
  "nextSessionGoals": [
    "เพิ่มน้ำหนัก Squat เป็น 110kg",
    "ฝึก Core Stability"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": 20
  },
  "message": "Session card created successfully"
}
```

---

#### **17. PATCH /trainer/sessions/:id**
แก้ไข Session Card

---

#### **18. DELETE /trainer/sessions/:id**
ลบ Session Card

---

### **📚 Programs Management**

#### **19. GET /trainer/programs**
ดึงรายการโปรแกรมทั้งหมดที่สร้างไว้

---

#### **20. GET /trainer/programs/:id**
ดึงรายละเอียดโปรแกรม

---

#### **21. POST /trainer/programs**
สร้างโปรแกรมใหม่

**Request Body:**
```json
{
  "name": "12-Week Muscle Building Program",
  "description": "โปรแกรมเน้นสร้างมวลกล้ามเนื้อ",
  "totalWeeks": 12,
  "sessionsPerWeek": 3,
  "goals": [
    "เพิ่มมวลกล้ามเนื้อ 3-5kg",
    "เพิ่มแรง 20%"
  ],
  "weeklySchedule": [
    {
      "day": "Monday",
      "focus": "Upper Body - Push",
      "duration": 60
    }
  ]
}
```

---

#### **22. PATCH /trainer/programs/:id**
แก้ไขโปรแกรม

---

#### **23. DELETE /trainer/programs/:id**
ลบโปรแกรม

---

#### **24. POST /trainer/programs/:id/assign**
มอบหมายโปรแกรมให้ Client

**Request Body:**
```json
{
  "clientId": 1,
  "startDate": "2026-01-15"
}
```

---

### **💪 Exercises Management**

#### **25. GET /trainer/exercises**
ดึงรายการท่าออกกำลังกายทั้งหมด

**Query Params:**
- `category` (optional): Legs, Chest, Back, Shoulders, Arms, Core, Cardio
- `search` (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "exercises": [
      {
        "id": 1,
        "name": "Squat",
        "category": "Legs",
        "description": "ท่ายอมแบบ Barbell",
        "muscleGroups": ["Quadriceps", "Glutes", "Hamstrings"],
        "equipment": ["Barbell", "Squat Rack"],
        "difficulty": "intermediate",
        "videoUrl": "https://...",
        "instructions": [
          "วางบาร์บนหลัง",
          "ยืนกว้างเท่าไหล่",
          "ย่อลงจนต้นขาขนานพื้น"
        ]
      }
    ]
  }
}
```

---

#### **26. POST /trainer/exercises**
เพิ่มท่าออกกำลังกายใหม่

---

#### **27. PATCH /trainer/exercises/:id**
แก้ไขท่าออกกำลังกาย

---

#### **28. DELETE /trainer/exercises/:id**
ลบท่าออกกำลังกาย

---

### **📊 Analytics & Reports**

#### **29. GET /trainer/analytics/overview**
ภาพรวม Analytics

**Query Params:**
- `startDate`, `endDate`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalClients": 15,
    "totalSessions": 320,
    "averageRating": 4.8,
    "clientRetentionRate": 92.5,
    "sessionsGrowth": 15.2,
    "topPerformingClients": [
      {
        "id": 1,
        "name": "สมชาย ใจดี",
        "sessionsCompleted": 124,
        "completionRate": 98.5
      }
    ]
  }
}
```

---

#### **30. GET /trainer/analytics/clients/:id**
Analytics ของ Client แต่ละคน

**Response:**
```json
{
  "success": true,
  "data": {
    "clientId": 1,
    "clientName": "สมชาย ใจดี",
    "totalSessions": 124,
    "completionRate": 95.2,
    "progressMetrics": {
      "weightChange": -2.5,
      "bodyFatChange": -3.2,
      "strengthGains": {
        "Squat": 25,
        "Deadlift": 30,
        "Bench Press": 15
      }
    },
    "sessionsPerWeek": 3.2,
    "averageSessionDuration": 58
  }
}
```

---

---

## 🌐 Shared/Common APIs

**Base Path:** `/common/*` หรือ `/shared/*`  
**Auth Required:** ✅ Yes (Some endpoints may be public)

---

### **1. GET /locations**
ดึงรายการสาขา/สถานที่ฝึก

**Response:**
```json
{
  "success": true,
  "data": {
    "locations": [
      {
        "id": 1,
        "name": "สาขาสยาม",
        "address": "ชั้น 5 สยามพารากอน กรุงเทพฯ 10330",
        "floor": "5",
        "building": "สยามพารากอน",
        "openingHours": "06:00-22:00",
        "phoneNumber": "021234567",
        "mapUrl": "https://maps.google.com/...",
        "facilities": ["Cardio Zone", "Free Weights", "Locker Room"],
        "images": ["https://..."]
      }
    ]
  }
}
```

---

### **2. GET /locations/:id**
ดึงรายละเอียดสาขา

---

### **3. GET /trainers**
ดึงรายชื่อเทรนเนอร์ทั้งหมด (สำหรับ Browse/Search)

**Query Params:**
- `specialization` (optional): Strength, Cardio, Yoga, etc.
- `availability` (optional): available, busy
- `search` (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "trainers": [
      {
        "id": 5,
        "name": "โค้ชเบน",
        "profileImage": "https://...",
        "specialization": ["Strength Training", "Bodybuilding"],
        "experience": "5 years",
        "rating": 4.9,
        "totalClients": 15,
        "bio": "ผม...",
        "certifications": ["NASM-CPT", "ACE"],
        "availability": "available"
      }
    ]
  }
}
```

---

### **4. GET /trainers/:id**
ดึงรายละเอียดเทรนเนอร์

---

### **5. GET /exercises/categories**
ดึงหมวดหมู่ท่าออกกำลังกาย

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Legs",
        "displayName": "ขา",
        "icon": "🦵",
        "exerciseCount": 45
      },
      {
        "id": 2,
        "name": "Chest",
        "displayName": "หน้าอก",
        "icon": "💪",
        "exerciseCount": 30
      }
    ]
  }
}
```

---

---

## 📊 Data Models

### **User**
```typescript
{
  id: number;
  name: string;
  email: string;
  role: 'trainer' | 'trainee';
  profileImage?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}
```

### **Schedule**
```typescript
{
  id: number;
  trainerId: number;
  clientId: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // minutes
  title: string;
  description?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  locationId: number;
  sessionType: string;
  plannedExercises?: string[];
  notes?: string;
  relatedSessionCard?: number;
  createdAt: string;
  updatedAt: string;
}
```

### **Program**
```typescript
{
  id: number;
  name: string;
  description?: string;
  trainerId: number;
  totalWeeks: number;
  sessionsPerWeek: number;
  goals?: string[];
  weeklySchedule?: WeeklySchedule[];
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}
```

### **ProgramAssignment**
```typescript
{
  id: number;
  programId: number;
  clientId: number;
  startDate: string;
  endDate: string;
  currentWeek: number;
  status: 'active' | 'completed' | 'paused';
  progressPercentage: number;
  createdAt: string;
}
```

### **SessionCard**
```typescript
{
  id: number;
  scheduleId: number;
  trainerId: number;
  clientId: number;
  date: string;
  title: string;
  duration: number;
  exercises: Exercise[];
  overallFeedback?: string;
  nextSessionGoals?: string[];
  createdAt: string;
  updatedAt: string;
}
```

### **Exercise (in Session)**
```typescript
{
  id: number;
  name: string;
  category: string;
  sets: ExerciseSet[];
  notes?: string;
}
```

### **ExerciseSet**
```typescript
{
  setNumber: number;
  reps?: number;
  weight?: number; // kg
  duration?: number; // seconds (สำหรับ Cardio)
  rest?: number; // seconds
  completed: boolean;
}
```

### **Metric**
```typescript
{
  id: number;
  clientId: number;
  date: string;
  type: 'weight' | 'body_fat' | 'muscle_mass' | 'measurement';
  value: number;
  unit: string;
  notes?: string;
  createdAt: string;
}
```

### **Notification**
```typescript
{
  id: number;
  userId: number;
  type: 'schedule' | 'progress' | 'achievement' | 'system';
  title: string;
  message: string;
  relatedId?: number;
  relatedType?: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: string;
}
```

---

## ⚠️ Error Codes

```typescript
enum ErrorCode {
  // Authentication
  UNAUTHORIZED = 'UNAUTHORIZED',              // 401
  FORBIDDEN = 'FORBIDDEN',                    // 403
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS', // 401
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',            // 401
  
  // Validation
  INVALID_INPUT = 'INVALID_INPUT',            // 422
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD', // 422
  INVALID_FORMAT = 'INVALID_FORMAT',          // 422
  
  // Resources
  NOT_FOUND = 'NOT_FOUND',                    // 404
  ALREADY_EXISTS = 'ALREADY_EXISTS',          // 409
  CONFLICT = 'CONFLICT',                      // 409
  
  // Business Logic
  SCHEDULE_CONFLICT = 'SCHEDULE_CONFLICT',    // 409
  PROGRAM_NOT_ACTIVE = 'PROGRAM_NOT_ACTIVE',  // 400
  CLIENT_NOT_ASSIGNED = 'CLIENT_NOT_ASSIGNED', // 403
  
  // Server
  INTERNAL_ERROR = 'INTERNAL_ERROR',          // 500
  DATABASE_ERROR = 'DATABASE_ERROR',          // 500
  NETWORK_ERROR = 'NETWORK_ERROR',            // 503
}
```

---

## 📊 API Summary

### **Total APIs: 45**

| Category | Endpoints | Trainee | Trainer | Shared |
|----------|-----------|---------|---------|--------|
| **Authentication** | 7 | ✅ | ✅ | ✅ |
| **Schedules** | 8 | 3 (Read) | 5 (CRUD) | - |
| **Programs** | 8 | 3 (Read) | 5 (CRUD) | - |
| **Session Cards** | 7 | 3 (Read) | 4 (CRUD) | - |
| **Clients** | 7 | - | 7 (CRUD) | - |
| **Stats & Analytics** | 4 | 1 | 3 | - |
| **Notifications** | 3 | 3 (Read/Update) | - | - |
| **Metrics** | 2 | 1 (Read) | 1 (Read) | - |
| **Exercises** | 4 | - | 4 (CRUD) | - |
| **Locations** | 2 | - | - | 2 (Read) |
| **Trainers** | 2 | - | - | 2 (Read) |
| **Profile** | 1 | 1 (Read) | - | - |

---

### **Trainee APIs: 15 endpoints (Read-Only)**
```
✅ GET  /trainee/schedules/upcoming
✅ GET  /trainee/schedules
✅ GET  /trainee/schedules/:id
✅ GET  /trainee/programs/current
✅ GET  /trainee/programs
✅ GET  /trainee/programs/:id
✅ GET  /trainee/stats
✅ GET  /trainee/notifications
✅ PUT  /trainee/notifications/:id/read
✅ PUT  /trainee/notifications/read-all
✅ GET  /trainee/sessions
✅ GET  /trainee/sessions/:id
✅ GET  /trainee/sessions/search
✅ GET  /trainee/metrics
✅ GET  /trainee/me
```

---

### **Trainer APIs: 30 endpoints (Full CRUD)**
```
Dashboard:
✅ GET  /trainer/dashboard/stats

Clients:
✅ GET    /trainer/clients
✅ GET    /trainer/clients/:id
✅ POST   /trainer/clients
✅ PATCH  /trainer/clients/:id
✅ DELETE /trainer/clients/:id
✅ GET    /trainer/clients/:id/metrics
✅ GET    /trainer/clients/:id/sessions

Schedules:
✅ GET    /trainer/schedules
✅ GET    /trainer/schedules/:id
✅ POST   /trainer/schedules
✅ PATCH  /trainer/schedules/:id
✅ DELETE /trainer/schedules/:id

Session Cards:
✅ GET    /trainer/sessions
✅ GET    /trainer/sessions/:id
✅ POST   /trainer/sessions
✅ PATCH  /trainer/sessions/:id
✅ DELETE /trainer/sessions/:id

Programs:
✅ GET    /trainer/programs
✅ GET    /trainer/programs/:id
✅ POST   /trainer/programs
✅ PATCH  /trainer/programs/:id
✅ DELETE /trainer/programs/:id
✅ POST   /trainer/programs/:id/assign

Exercises:
✅ GET    /trainer/exercises
✅ POST   /trainer/exercises
✅ PATCH  /trainer/exercises/:id
✅ DELETE /trainer/exercises/:id

Analytics:
✅ GET    /trainer/analytics/overview
✅ GET    /trainer/analytics/clients/:id
```

---

### **Shared APIs: 7 endpoints**
```
Authentication:
✅ POST /auth/register
✅ POST /auth/login
✅ POST /auth/logout
✅ GET  /auth/me
✅ GET  /auth/google/login
✅ GET  /auth/google/callback
✅ POST /auth/refresh

Common:
✅ GET  /locations
✅ GET  /locations/:id
✅ GET  /trainers
✅ GET  /trainers/:id
✅ GET  /exercises/categories
```

---

## 🎯 Implementation Priority

### **Phase 1: MVP (Week 1-2) - 18 APIs**
```
✅ Authentication (7 APIs)
✅ Trainee Core (6 APIs)
   - Schedules (3)
   - Current Program (1)
   - Stats (1)
   - Profile (1)
✅ Trainer Dashboard (1 API)
✅ Locations (2 APIs)
✅ Trainers List (2 APIs)
```

### **Phase 2: Core Features (Week 3-4) - 15 APIs**
```
✅ Session Cards (7 APIs)
✅ Notifications (3 APIs)
✅ Programs (5 APIs)
```

### **Phase 3: Full CRUD (Week 5-6) - 12 APIs**
```
✅ Client Management (7 APIs)
✅ Exercises (4 APIs)
✅ Metrics (1 API)
```

---

## 🔒 Security Considerations

### **1. Authentication:**
- ✅ JWT tokens in HTTP-only cookies
- ✅ CSRF protection
- ✅ Token expiry (7 days)
- ✅ Refresh token rotation

### **2. Authorization:**
- ✅ RBAC Middleware
- ✅ Resource ownership validation
- ✅ Role-based endpoint access

### **3. Input Validation:**
- ✅ Request body validation
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ Rate limiting

### **4. Data Privacy:**
- ✅ Client data accessible only by assigned trainer
- ✅ Trainee can only see own data
- ✅ Sensitive data (password) hashed

---

## 📝 Notes

### **API Versioning:**
- Current: `/api/v1/*`
- Future: `/api/v2/*` (if breaking changes)

### **Pagination:**
- Default limit: 20
- Max limit: 100
- Response includes pagination metadata

### **Date/Time Format:**
- ISO 8601: `2026-01-11T10:00:00Z`
- Date only: `YYYY-MM-DD`
- Time only: `HH:MM` (24-hour format)

### **File Upload:**
- Profile images: Max 5MB, PNG/JPG
- Exercise videos: Max 50MB, MP4

---

**Created**: 2026-01-11  
**Version**: 2.0  
**Status**: ✅ Complete Design Ready for Implementation

---

## 🚀 Next Steps

1. ✅ Review & approve API design
2. ✅ Setup Database schema
3. ✅ Implement Backend APIs (Go + Gin)
4. ✅ Write Unit Tests (Coverage > 80%)
5. ✅ Update Frontend API Client
6. ✅ Integration Testing
7. ✅ Deploy to Staging
8. ✅ User Acceptance Testing (UAT)
9. ✅ Production Deployment

---

**Need help implementing these APIs? Let me know! 🎯**
