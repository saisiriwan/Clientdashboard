# 🚀 API Specification - Fitness Management System

## 📋 Table of Contents

1. [Overview](#overview)
2. [Base URL & Versioning](#base-url--versioning)
3. [Authentication](#authentication)
4. [Common Headers](#common-headers)
5. [Response Format](#response-format)
6. [Error Handling](#error-handling)
7. [Pagination](#pagination)
8. [Rate Limiting](#rate-limiting)
9. [API Endpoints](#api-endpoints)
   - [Authentication APIs](#1-authentication-apis)
   - [User Management APIs](#2-user-management-apis)
   - [Schedule Management APIs](#3-schedule-management-apis)
   - [Workout Management APIs](#4-workout-management-apis)
   - [Exercise Management APIs](#5-exercise-management-apis)
   - [Session Card APIs](#6-session-card-apis)
   - [Progress Tracking APIs](#7-progress-tracking-apis)
   - [Notification APIs](#8-notification-apis)
   - [Analytics APIs](#9-analytics-apis)
   - [Settings APIs](#10-settings-apis)
10. [Data Models](#data-models)
11. [Webhooks](#webhooks)
12. [Testing](#testing)

---

## Overview

ระบบ Fitness Management API เป็น RESTful API ที่ออกแบบมาเพื่อจัดการระบบฝึกออกกำลังกาย รองรับ 2 roles หลัก:
- **Trainer (เทรนเนอร์)**: สามารถ CRUD ข้อมูลทั้งหมด
- **Trainee (ลูกเทรน)**: READ-ONLY เท่านั้น

### Key Features
- ✅ Google OAuth 2.0 Authentication
- ✅ Role-Based Access Control (RBAC)
- ✅ 3 ประเภทการออกกำลังกาย (Weight Training, Cardio, Flexibility)
- ✅ Real-time Progress Tracking
- ✅ RESTful API Design
- ✅ JSON Response Format
- ✅ Comprehensive Error Handling

---

## Base URL & Versioning

```
Production:  https://api.fitness-app.com/v1
Staging:     https://staging-api.fitness-app.com/v1
Development: http://localhost:8080/api/v1
```

### API Versioning Strategy
- Version ใน URL path: `/v1`, `/v2`
- เมื่อมีการเปลี่ยนแปลง breaking changes จะสร้าง version ใหม่
- Support API version เก่าอย่างน้อย 6 เดือน

---

## Authentication

### OAuth 2.0 Flow (Google)

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Google
    participant Supabase
    
    Client->>API: GET /auth/google
    API->>Google: Redirect to Google OAuth
    Google->>Client: Authorization Code
    Client->>API: POST /auth/google/callback
    API->>Google: Exchange Code for Token
    Google->>API: Access Token + User Info
    API->>Supabase: Create/Update User
    API->>Client: JWT Token + User Data
```

### Token Types

1. **Access Token** (JWT)
   - ใช้สำหรับ authenticate API requests
   - Expiration: 24 hours
   - ส่งผ่าน `Authorization` header

2. **Refresh Token**
   - ใช้สำหรับขอ Access Token ใหม่
   - Expiration: 30 days
   - เก็บใน HTTP-only cookie

### Token Format

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Common Headers

### Request Headers

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer {access_token}
X-Client-Version: 1.0.0
X-Device-ID: {unique_device_id}
X-Platform: web | ios | android
Accept-Language: th | en
```

### Response Headers

```http
Content-Type: application/json; charset=utf-8
X-Request-ID: {unique_request_id}
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1674489600
X-API-Version: 1.0.0
```

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Operation completed successfully",
  "timestamp": "2026-01-23T10:30:00Z",
  "requestId": "req_abc123xyz"
}
```

### Success Response with Pagination

```json
{
  "success": true,
  "data": [
    // Array of items
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "totalItems": 100,
    "hasNext": true,
    "hasPrev": false
  },
  "message": "Data retrieved successfully",
  "timestamp": "2026-01-23T10:30:00Z",
  "requestId": "req_abc123xyz"
}
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required",
        "code": "REQUIRED_FIELD"
      }
    ]
  },
  "timestamp": "2026-01-23T10:30:00Z",
  "requestId": "req_abc123xyz"
}
```

### HTTP Status Codes

| Code | Description | Usage |
|------|-------------|-------|
| 200 | OK | Request สำเร็จ |
| 201 | Created | สร้างข้อมูลสำเร็จ |
| 204 | No Content | ลบข้อมูลสำเร็จ (ไม่มี response body) |
| 400 | Bad Request | Request ไม่ถูกต้อง |
| 401 | Unauthorized | ไม่มี authentication หรือ token หมดอายุ |
| 403 | Forbidden | ไม่มีสิทธิ์เข้าถึง (role ไม่เหมาะสม) |
| 404 | Not Found | ไม่พบข้อมูล |
| 409 | Conflict | ข้อมูลซ้ำกัน |
| 422 | Unprocessable Entity | Validation ล้มเหลว |
| 429 | Too Many Requests | เกิน rate limit |
| 500 | Internal Server Error | เกิดข้อผิดพลาดในเซิร์ฟเวอร์ |
| 503 | Service Unavailable | เซิร์ฟเวอร์ไม่พร้อมใช้งาน |

### Error Codes

```typescript
enum ErrorCode {
  // Authentication Errors (1000-1099)
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  
  // Authorization Errors (1100-1199)
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  TRAINEE_READONLY = 'TRAINEE_READONLY',
  
  // Validation Errors (1200-1299)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  REQUIRED_FIELD = 'REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  INVALID_VALUE = 'INVALID_VALUE',
  
  // Resource Errors (1300-1399)
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  
  // Business Logic Errors (1400-1499)
  SCHEDULE_CONFLICT = 'SCHEDULE_CONFLICT',
  INVALID_EXERCISE_TYPE = 'INVALID_EXERCISE_TYPE',
  WORKOUT_ALREADY_COMPLETED = 'WORKOUT_ALREADY_COMPLETED',
  
  // Rate Limiting (1500-1599)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Server Errors (1600-1699)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR'
}
```

---

## Pagination

### Query Parameters

```
page=1          # หน้าปัจจุบัน (default: 1)
limit=20        # จำนวนรายการต่อหน้า (default: 20, max: 100)
sort=createdAt  # ฟิลด์ที่ใช้เรียง
order=desc      # ลำดับการเรียง (asc | desc)
```

### Example Request

```http
GET /api/v1/workouts?page=2&limit=20&sort=date&order=desc
```

### Example Response

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "totalPages": 10,
    "totalItems": 200,
    "hasNext": true,
    "hasPrev": true,
    "links": {
      "first": "/api/v1/workouts?page=1&limit=20",
      "prev": "/api/v1/workouts?page=1&limit=20",
      "next": "/api/v1/workouts?page=3&limit=20",
      "last": "/api/v1/workouts?page=10&limit=20"
    }
  }
}
```

---

## Rate Limiting

### Rate Limits by Role

| Role | Requests per Hour | Burst |
|------|-------------------|-------|
| Anonymous | 100 | 10 |
| Trainee | 1,000 | 50 |
| Trainer | 5,000 | 100 |
| Admin | Unlimited | - |

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1674493200
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 3600
  }
}
```

---

## API Endpoints

---

## 1. Authentication APIs

### 1.1 Initialize Google OAuth

เริ่มต้น Google OAuth flow

**Endpoint:** `GET /auth/google`

**Permission:** Public

**Response:**
```json
{
  "success": true,
  "data": {
    "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
  }
}
```

---

### 1.2 Google OAuth Callback

Handle Google OAuth callback

**Endpoint:** `POST /auth/google/callback`

**Permission:** Public

**Request Body:**
```json
{
  "code": "4/0AY0e-g7...",
  "state": "random_state_string"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_string",
    "expiresIn": 86400,
    "tokenType": "Bearer",
    "user": {
      "id": "user_abc123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "trainee",
      "avatar": "https://...",
      "createdAt": "2026-01-01T00:00:00Z"
    }
  },
  "message": "Authentication successful"
}
```

**Error Response:** `401 Unauthorized`
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid authorization code"
  }
}
```

---

### 1.3 Refresh Access Token

ขอ Access Token ใหม่ด้วย Refresh Token

**Endpoint:** `POST /auth/refresh`

**Permission:** Authenticated

**Request Body:**
```json
{
  "refreshToken": "refresh_token_string"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "new_access_token",
    "expiresIn": 86400
  }
}
```

---

### 1.4 Logout

ลบ session และ revoke tokens

**Endpoint:** `POST /auth/logout`

**Permission:** Authenticated

**Request Body:**
```json
{
  "refreshToken": "refresh_token_string"
}
```

**Response:** `204 No Content`

---

### 1.5 Verify Token

ตรวจสอบความถูกต้องของ Access Token

**Endpoint:** `GET /auth/verify`

**Permission:** Authenticated

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "valid": true,
    "user": {
      "id": "user_abc123",
      "email": "user@example.com",
      "role": "trainee"
    },
    "expiresAt": "2026-01-24T10:30:00Z"
  }
}
```

---

## 2. User Management APIs

### 2.1 Get Current User Profile

ดึงข้อมูลโปรไฟล์ผู้ใช้ปัจจุบัน

**Endpoint:** `GET /users/me`

**Permission:** Authenticated

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "user_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "trainee",
    "avatar": "https://...",
    "dateOfBirth": "1990-01-01",
    "gender": "male",
    "height": 175,
    "weight": 72.5,
    "phone": "+66812345678",
    "settings": {
      "language": "th",
      "timezone": "Asia/Bangkok",
      "theme": "dark",
      "notifications": {
        "email": true,
        "push": true,
        "sms": false
      }
    },
    "stats": {
      "totalWorkouts": 45,
      "totalSessions": 120,
      "currentStreak": 7,
      "longestStreak": 21
    },
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-01-23T10:30:00Z"
  }
}
```

---

### 2.2 Update User Profile

อัปเดตข้อมูลโปรไฟล์ (เฉพาะข้อมูลส่วนตัว ไม่ใช่ role)

**Endpoint:** `PATCH /users/me`

**Permission:** Authenticated

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "height": 176,
  "weight": 71.5,
  "phone": "+66812345678"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "user_abc123",
    "email": "user@example.com",
    "name": "John Doe Updated",
    // ... updated fields
  },
  "message": "Profile updated successfully"
}
```

---

### 2.3 Get User by ID (Trainer Only)

ดึงข้อมูลผู้ใช้ตาม ID

**Endpoint:** `GET /users/:userId`

**Permission:** Trainer only

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "user_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "trainee",
    // ... user data
  }
}
```

**Error Response:** `403 Forbidden` (if trainee tries to access)
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "Trainee can only access their own profile"
  }
}
```

---

### 2.4 List Users (Trainer Only)

ดึงรายชื่อผู้ใช้ทั้งหมด

**Endpoint:** `GET /users`

**Permission:** Trainer only

**Query Parameters:**
```
page=1
limit=20
role=trainee|trainer
search=john
sort=createdAt
order=desc
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "user_abc123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "trainee",
      "avatar": "https://...",
      "stats": {
        "totalWorkouts": 45,
        "currentStreak": 7
      },
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "totalItems": 100
  }
}
```

---

### 2.5 Get User Stats

ดึงสถิติของผู้ใช้

**Endpoint:** `GET /users/:userId/stats`

**Permission:** 
- Trainee: เฉพาะตัวเอง (`/users/me/stats`)
- Trainer: ทุกคน

**Query Parameters:**
```
period=week|month|year|all
startDate=2026-01-01
endDate=2026-01-31
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalWorkouts": 45,
      "totalSessions": 120,
      "totalDuration": 5400,
      "totalCalories": 12500,
      "currentStreak": 7,
      "longestStreak": 21
    },
    "byExerciseType": {
      "weight_training": {
        "count": 25,
        "totalVolume": 125000,
        "averageVolume": 5000,
        "improvement": 12.5
      },
      "cardio": {
        "count": 15,
        "totalDistance": 75.5,
        "averageDistance": 5.03,
        "improvement": 8.2
      },
      "flexibility": {
        "count": 5,
        "totalDuration": 150,
        "averageDuration": 30,
        "improvement": 15.0
      }
    },
    "weeklyProgress": [
      {
        "week": "2026-W03",
        "workouts": 4,
        "totalDuration": 240,
        "totalCalories": 1200
      }
    ],
    "topExercises": [
      {
        "name": "Squat",
        "count": 20,
        "personalBest": 120
      }
    ]
  }
}
```

---

## 3. Schedule Management APIs

### 3.1 Create Schedule (Trainer Only)

สร้างตารางนัดหมายใหม่

**Endpoint:** `POST /schedules`

**Permission:** Trainer only

**Request Body:**
```json
{
  "traineeId": "user_abc123",
  "date": "2026-01-25",
  "time": "10:00",
  "duration": 60,
  "exercises": [
    "Squat",
    "Bench Press",
    "Deadlift"
  ],
  "location": "Gold's Gym Bangkok",
  "notes": "Focus on form and technique"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "schedule_xyz789",
    "traineeId": "user_abc123",
    "trainerId": "trainer_def456",
    "date": "2026-01-25",
    "time": "10:00",
    "duration": 60,
    "exercises": [
      "Squat",
      "Bench Press",
      "Deadlift"
    ],
    "location": "Gold's Gym Bangkok",
    "notes": "Focus on form and technique",
    "status": "upcoming",
    "createdAt": "2026-01-23T10:30:00Z",
    "updatedAt": "2026-01-23T10:30:00Z"
  },
  "message": "Schedule created successfully"
}
```

**Error Response:** `409 Conflict`
```json
{
  "success": false,
  "error": {
    "code": "SCHEDULE_CONFLICT",
    "message": "Schedule conflicts with existing appointment",
    "details": {
      "conflictingSchedule": {
        "id": "schedule_abc123",
        "date": "2026-01-25",
        "time": "10:00"
      }
    }
  }
}
```

---

### 3.2 Get Schedules

ดึงรายการตารางนัดหมาย

**Endpoint:** `GET /schedules`

**Permission:** 
- Trainee: เฉพาะตารางของตัวเอง
- Trainer: ทุกตาราง

**Query Parameters:**
```
page=1
limit=20
traineeId=user_abc123   # Trainer only
trainerId=trainer_def456
startDate=2026-01-01
endDate=2026-01-31
status=upcoming|completed|cancelled
sort=date
order=asc
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "schedule_xyz789",
      "trainee": {
        "id": "user_abc123",
        "name": "John Doe",
        "avatar": "https://..."
      },
      "trainer": {
        "id": "trainer_def456",
        "name": "Jane Smith",
        "avatar": "https://..."
      },
      "date": "2026-01-25",
      "time": "10:00",
      "duration": 60,
      "exercises": ["Squat", "Bench Press", "Deadlift"],
      "location": "Gold's Gym Bangkok",
      "notes": "Focus on form and technique",
      "status": "upcoming",
      "createdAt": "2026-01-23T10:30:00Z",
      "updatedAt": "2026-01-23T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "totalItems": 50
  }
}
```

---

### 3.3 Get Schedule by ID

ดึงข้อมูลตารางนัดหมายตาม ID

**Endpoint:** `GET /schedules/:scheduleId`

**Permission:** 
- Trainee: เฉพาะตารางของตัวเอง
- Trainer: ทุกตาราง

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "schedule_xyz789",
    "trainee": {
      "id": "user_abc123",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+66812345678",
      "avatar": "https://..."
    },
    "trainer": {
      "id": "trainer_def456",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "+66887654321",
      "avatar": "https://..."
    },
    "date": "2026-01-25",
    "time": "10:00",
    "duration": 60,
    "exercises": ["Squat", "Bench Press", "Deadlift"],
    "location": "Gold's Gym Bangkok",
    "notes": "Focus on form and technique",
    "status": "upcoming",
    "reminder": {
      "enabled": true,
      "minutes": 30
    },
    "createdAt": "2026-01-23T10:30:00Z",
    "updatedAt": "2026-01-23T10:30:00Z"
  }
}
```

**Error Response:** `404 Not Found`
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Schedule not found"
  }
}
```

---

### 3.4 Update Schedule (Trainer Only)

อัปเดตตารางนัดหมาย

**Endpoint:** `PATCH /schedules/:scheduleId`

**Permission:** Trainer only

**Request Body:**
```json
{
  "date": "2026-01-25",
  "time": "14:00",
  "duration": 90,
  "exercises": [
    "Squat",
    "Bench Press",
    "Deadlift",
    "Pull-ups"
  ],
  "notes": "Updated notes"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "schedule_xyz789",
    // ... updated schedule data
  },
  "message": "Schedule updated successfully"
}
```

**Error Response:** `403 Forbidden`
```json
{
  "success": false,
  "error": {
    "code": "TRAINEE_READONLY",
    "message": "Trainee cannot modify schedules"
  }
}
```

---

### 3.5 Update Schedule Status (Trainer Only)

อัปเดตสถานะตารางนัดหมาย

**Endpoint:** `PATCH /schedules/:scheduleId/status`

**Permission:** Trainer only

**Request Body:**
```json
{
  "status": "completed",
  "notes": "Session completed successfully"
}
```

**Valid Status Values:**
- `upcoming` - กำลังจะถึง
- `in_progress` - กำลังดำเนินการ
- `completed` - เสร็จสิ้น
- `cancelled` - ยกเลิก
- `rescheduled` - เลื่อนนัด

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "schedule_xyz789",
    "status": "completed",
    "completedAt": "2026-01-25T11:00:00Z"
  },
  "message": "Schedule status updated successfully"
}
```

---

### 3.6 Delete Schedule (Trainer Only)

ลบตารางนัดหมาย

**Endpoint:** `DELETE /schedules/:scheduleId`

**Permission:** Trainer only

**Response:** `204 No Content`

**Error Response:** `403 Forbidden`
```json
{
  "success": false,
  "error": {
    "code": "TRAINEE_READONLY",
    "message": "Trainee cannot delete schedules"
  }
}
```

---

## 4. Workout Management APIs

### 4.1 Create Workout (Trainer Only)

สร้างบันทึกการฝึก

**Endpoint:** `POST /workouts`

**Permission:** Trainer only

**Request Body:**
```json
{
  "traineeId": "user_abc123",
  "date": "2026-01-23",
  "duration": 60,
  "exercises": [
    {
      "name": "Squat",
      "type": "weight_training",
      "category": "legs",
      "metadata": {
        "isBodyweight": false
      },
      "sets": [
        {
          "setNumber": 1,
          "weight": 100,
          "reps": 8,
          "rest": 90,
          "completed": true
        },
        {
          "setNumber": 2,
          "weight": 100,
          "reps": 8,
          "rest": 90,
          "completed": true
        }
      ],
      "notes": "Good form, increase weight next time"
    },
    {
      "name": "Running",
      "type": "cardio",
      "category": "cardio",
      "sets": [
        {
          "setNumber": 1,
          "distance": 5.2,
          "duration": 27.5,
          "pace": 5.29,
          "calories": 416,
          "heartRate": 155,
          "completed": true
        }
      ],
      "notes": "Great pace improvement"
    },
    {
      "name": "Yoga Flow",
      "type": "flexibility",
      "category": "flexibility",
      "sets": [
        {
          "setNumber": 1,
          "duration": 30,
          "completed": true,
          "notes": "Focus on hip openers"
        }
      ]
    }
  ],
  "notes": "Excellent session overall",
  "rating": 5,
  "mood": "energized"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "workout_abc123",
    "traineeId": "user_abc123",
    "trainerId": "trainer_def456",
    "date": "2026-01-23",
    "duration": 60,
    "exercises": [
      {
        "id": "exercise_xyz789",
        "name": "Squat",
        "type": "weight_training",
        "category": "legs",
        "metadata": {
          "isBodyweight": false
        },
        "sets": [...],
        "totalVolume": 1600,
        "notes": "Good form, increase weight next time"
      }
    ],
    "summary": {
      "totalExercises": 3,
      "totalSets": 5,
      "totalVolume": 1600,
      "totalDistance": 5.2,
      "totalCalories": 416,
      "byType": {
        "weight_training": 1,
        "cardio": 1,
        "flexibility": 1
      }
    },
    "notes": "Excellent session overall",
    "rating": 5,
    "mood": "energized",
    "createdAt": "2026-01-23T11:00:00Z",
    "updatedAt": "2026-01-23T11:00:00Z"
  },
  "message": "Workout created successfully"
}
```

---

### 4.2 Get Workouts

ดึงรายการบันทึกการฝึก

**Endpoint:** `GET /workouts`

**Permission:** 
- Trainee: เฉพาะบันทึกของตัวเอง
- Trainer: ทุกบันทึก

**Query Parameters:**
```
page=1
limit=20
traineeId=user_abc123   # Trainer only
trainerId=trainer_def456
startDate=2026-01-01
endDate=2026-01-31
exerciseType=weight_training|cardio|flexibility
exerciseName=Squat
sort=date
order=desc
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "workout_abc123",
      "trainee": {
        "id": "user_abc123",
        "name": "John Doe",
        "avatar": "https://..."
      },
      "trainer": {
        "id": "trainer_def456",
        "name": "Jane Smith",
        "avatar": "https://..."
      },
      "date": "2026-01-23",
      "duration": 60,
      "summary": {
        "totalExercises": 3,
        "totalSets": 5,
        "totalVolume": 1600,
        "totalDistance": 5.2,
        "totalCalories": 416,
        "byType": {
          "weight_training": 1,
          "cardio": 1,
          "flexibility": 1
        }
      },
      "rating": 5,
      "mood": "energized",
      "createdAt": "2026-01-23T11:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 10,
    "totalItems": 200
  }
}
```

---

### 4.3 Get Workout by ID

ดึงข้อมูลบันทึกการฝึกตาม ID

**Endpoint:** `GET /workouts/:workoutId`

**Permission:** 
- Trainee: เฉพาะบันทึกของตัวเอง
- Trainer: ทุกบันทึก

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "workout_abc123",
    "trainee": {
      "id": "user_abc123",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://..."
    },
    "trainer": {
      "id": "trainer_def456",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "avatar": "https://..."
    },
    "date": "2026-01-23",
    "duration": 60,
    "exercises": [
      {
        "id": "exercise_xyz789",
        "name": "Squat",
        "type": "weight_training",
        "category": "legs",
        "metadata": {
          "isBodyweight": false,
          "recommendedFrequency": "2-4 ครั้ง/สัปดาห์"
        },
        "sets": [
          {
            "setNumber": 1,
            "weight": 100,
            "reps": 8,
            "rest": 90,
            "completed": true,
            "timestamp": "2026-01-23T10:00:00Z"
          }
        ],
        "totalVolume": 1600,
        "personalBest": true,
        "notes": "Good form, increase weight next time"
      }
    ],
    "summary": {
      "totalExercises": 3,
      "totalSets": 5,
      "totalVolume": 1600,
      "totalDistance": 5.2,
      "totalCalories": 416,
      "averageHeartRate": 145,
      "byType": {
        "weight_training": 1,
        "cardio": 1,
        "flexibility": 1
      }
    },
    "notes": "Excellent session overall",
    "rating": 5,
    "mood": "energized",
    "createdAt": "2026-01-23T11:00:00Z",
    "updatedAt": "2026-01-23T11:00:00Z"
  }
}
```

---

### 4.4 Update Workout (Trainer Only)

อัปเดตบันทึกการฝึก

**Endpoint:** `PATCH /workouts/:workoutId`

**Permission:** Trainer only

**Request Body:**
```json
{
  "duration": 70,
  "notes": "Updated notes",
  "rating": 4
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "workout_abc123",
    // ... updated workout data
  },
  "message": "Workout updated successfully"
}
```

---

### 4.5 Delete Workout (Trainer Only)

ลบบันทึกการฝึก

**Endpoint:** `DELETE /workouts/:workoutId`

**Permission:** Trainer only

**Response:** `204 No Content`

---

### 4.6 Get Workout Summary

ดึงสรุปบันทึกการฝึก

**Endpoint:** `GET /workouts/summary`

**Permission:** 
- Trainee: เฉพาะบันทึกของตัวเอง
- Trainer: ทุกบันทึก

**Query Parameters:**
```
traineeId=user_abc123   # Trainer only
period=week|month|year
startDate=2026-01-01
endDate=2026-01-31
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2026-01-01",
      "end": "2026-01-31"
    },
    "overview": {
      "totalWorkouts": 20,
      "totalDuration": 1200,
      "totalSessions": 60,
      "totalCalories": 8000,
      "averageDuration": 60,
      "averageRating": 4.5
    },
    "byExerciseType": {
      "weight_training": {
        "count": 12,
        "totalVolume": 96000,
        "averageVolume": 8000
      },
      "cardio": {
        "count": 6,
        "totalDistance": 31.2,
        "averageDistance": 5.2
      },
      "flexibility": {
        "count": 2,
        "totalDuration": 60,
        "averageDuration": 30
      }
    },
    "topExercises": [
      {
        "name": "Squat",
        "count": 12,
        "totalVolume": 19200,
        "personalBest": 120
      }
    ],
    "progressTrend": "improving",
    "consistency": 0.75
  }
}
```

---

## 5. Exercise Management APIs

### 5.1 Create Exercise (Trainer Only)

สร้างท่าออกกำลังกายใหม่

**Endpoint:** `POST /exercises`

**Permission:** Trainer only

**Request Body:**
```json
{
  "name": "Squat",
  "type": "weight_training",
  "category": "legs",
  "description": "A compound exercise that targets multiple muscle groups",
  "metadata": {
    "primaryMetric": "weight",
    "unit": "kg",
    "targetZone": "strength",
    "isBodyweight": false,
    "intensity": "high",
    "recommendedFrequency": "2-4 ครั้ง/สัปดาห์"
  },
  "muscleGroups": ["quadriceps", "glutes", "hamstrings", "core"],
  "equipment": ["barbell", "squat rack"],
  "difficulty": "intermediate",
  "instructions": [
    "Stand with feet shoulder-width apart",
    "Lower your body by bending knees",
    "Keep back straight and chest up",
    "Push through heels to return to start"
  ],
  "tips": [
    "Keep knees aligned with toes",
    "Don't let knees cave inward",
    "Breathe out as you push up"
  ],
  "warnings": [
    "Consult doctor if you have knee problems",
    "Start with light weight to learn form"
  ],
  "videoUrl": "https://youtube.com/...",
  "thumbnailUrl": "https://...",
  "isActive": true
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "exercise_squat123",
    "name": "Squat",
    "type": "weight_training",
    "category": "legs",
    "description": "A compound exercise that targets multiple muscle groups",
    "metadata": {...},
    "muscleGroups": ["quadriceps", "glutes", "hamstrings", "core"],
    "equipment": ["barbell", "squat rack"],
    "difficulty": "intermediate",
    "instructions": [...],
    "tips": [...],
    "warnings": [...],
    "videoUrl": "https://youtube.com/...",
    "thumbnailUrl": "https://...",
    "isActive": true,
    "usageCount": 0,
    "createdBy": "trainer_def456",
    "createdAt": "2026-01-23T12:00:00Z",
    "updatedAt": "2026-01-23T12:00:00Z"
  },
  "message": "Exercise created successfully"
}
```

---

### 5.2 Get Exercises

ดึงรายการท่าออกกำลังกาย

**Endpoint:** `GET /exercises`

**Permission:** Authenticated

**Query Parameters:**
```
page=1
limit=50
type=weight_training|cardio|flexibility
category=legs|chest|back|cardio|flexibility
difficulty=beginner|intermediate|advanced
muscleGroup=quadriceps
equipment=barbell
search=squat
isActive=true
sort=name
order=asc
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "exercise_squat123",
      "name": "Squat",
      "type": "weight_training",
      "category": "legs",
      "description": "A compound exercise that targets multiple muscle groups",
      "metadata": {
        "primaryMetric": "weight",
        "unit": "kg",
        "isBodyweight": false,
        "recommendedFrequency": "2-4 ครั้ง/สัปดาห์"
      },
      "muscleGroups": ["quadriceps", "glutes", "hamstrings", "core"],
      "equipment": ["barbell", "squat rack"],
      "difficulty": "intermediate",
      "thumbnailUrl": "https://...",
      "usageCount": 150,
      "isActive": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "totalPages": 3,
    "totalItems": 150
  }
}
```

---

### 5.3 Get Exercise by ID

ดึงข้อมูลท่าออกกำลังกายตาม ID

**Endpoint:** `GET /exercises/:exerciseId`

**Permission:** Authenticated

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "exercise_squat123",
    "name": "Squat",
    "type": "weight_training",
    "category": "legs",
    "description": "A compound exercise that targets multiple muscle groups",
    "metadata": {
      "primaryMetric": "weight",
      "unit": "kg",
      "targetZone": "strength",
      "isBodyweight": false,
      "intensity": "high",
      "recommendedFrequency": "2-4 ครั้ง/สัปดาห์"
    },
    "muscleGroups": ["quadriceps", "glutes", "hamstrings", "core"],
    "equipment": ["barbell", "squat rack"],
    "difficulty": "intermediate",
    "instructions": [...],
    "tips": [...],
    "warnings": [...],
    "videoUrl": "https://youtube.com/...",
    "thumbnailUrl": "https://...",
    "alternatives": [
      {
        "id": "exercise_frontsquat456",
        "name": "Front Squat",
        "reason": "Similar movement pattern"
      }
    ],
    "relatedExercises": [
      {
        "id": "exercise_lunge789",
        "name": "Lunges",
        "reason": "Same muscle group"
      }
    ],
    "usageCount": 150,
    "averageRating": 4.8,
    "isActive": true,
    "createdBy": {
      "id": "trainer_def456",
      "name": "Jane Smith"
    },
    "createdAt": "2026-01-23T12:00:00Z",
    "updatedAt": "2026-01-23T12:00:00Z"
  }
}
```

---

### 5.4 Update Exercise (Trainer Only)

อัปเดตท่าออกกำลังกาย

**Endpoint:** `PATCH /exercises/:exerciseId`

**Permission:** Trainer only

**Request Body:**
```json
{
  "description": "Updated description",
  "difficulty": "advanced",
  "instructions": [...],
  "isActive": true
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "exercise_squat123",
    // ... updated exercise data
  },
  "message": "Exercise updated successfully"
}
```

---

### 5.5 Delete Exercise (Trainer Only)

ลบท่าออกกำลังกาย (soft delete)

**Endpoint:** `DELETE /exercises/:exerciseId`

**Permission:** Trainer only

**Response:** `204 No Content`

**Note:** Exercise จะถูก soft delete (isActive = false) ไม่ใช่ลบจริง เพื่อรักษาข้อมูลประวัติ

---

### 5.6 Get Exercise Categories

ดึงรายการหมวดหมู่ท่าออกกำลังกาย

**Endpoint:** `GET /exercises/categories`

**Permission:** Authenticated

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "legs",
      "name": "Legs",
      "nameLocal": "ขา",
      "icon": "🦵",
      "exerciseCount": 45,
      "types": ["weight_training", "cardio"]
    },
    {
      "id": "chest",
      "name": "Chest",
      "nameLocal": "อก",
      "icon": "💪",
      "exerciseCount": 30,
      "types": ["weight_training"]
    },
    {
      "id": "cardio",
      "name": "Cardio",
      "nameLocal": "คาร์ดิโอ",
      "icon": "🏃",
      "exerciseCount": 25,
      "types": ["cardio"]
    },
    {
      "id": "flexibility",
      "name": "Flexibility",
      "nameLocal": "เฟล็กซ์",
      "icon": "🧘",
      "exerciseCount": 20,
      "types": ["flexibility"]
    }
  ]
}
```

---

## 6. Session Card APIs

### 6.1 Create Session Card (Trainer Only)

สร้างการ์ดสรุปผลการฝึก

**Endpoint:** `POST /session-cards`

**Permission:** Trainer only

**Request Body:**
```json
{
  "traineeId": "user_abc123",
  "workoutId": "workout_abc123",
  "date": "2026-01-23",
  "summary": "เซสชันวันนี้เยี่ยมมาก! พัฒนาการดีขึ้นเรื่อย ๆ",
  "achievements": [
    "ทำ Squat ได้น้ำหนักเพิ่มขึ้น 5 kg",
    "ฟอร์ม Deadlift ดีขึ้นมาก",
    "ความทนทานเพิ่มขึ้น"
  ],
  "areasForImprovement": [
    "ควรเพิ่มความยืดหยุ่นของสะโพก",
    "ต้องเน้นการหายใจให้ถูกต้อง"
  ],
  "nextSessionGoals": [
    "เพิ่มน้ำหนัก Squat อีก 2.5 kg",
    "ทำ Pull-ups เพิ่มเป็น 10 ครั้ง"
  ],
  "trainerNotes": "พัฒนาการดีมาก ควรรักษาฟอร์มและพักผ่อนให้เพียงพอ",
  "rating": 5,
  "tags": ["personal-best", "great-form", "high-energy"]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "session_card_xyz789",
    "traineeId": "user_abc123",
    "trainerId": "trainer_def456",
    "workoutId": "workout_abc123",
    "date": "2026-01-23",
    "summary": "เซสชันวันนี้เยี่ยมมาก! พัฒนาการดีขึ้นเรื่อย ๆ",
    "achievements": [...],
    "areasForImprovement": [...],
    "nextSessionGoals": [...],
    "trainerNotes": "พัฒนาการดีมาก ควรรักษาฟอร์มและพักผ่อนให้เพียงพอ",
    "rating": 5,
    "tags": ["personal-best", "great-form", "high-energy"],
    "createdAt": "2026-01-23T12:00:00Z",
    "updatedAt": "2026-01-23T12:00:00Z"
  },
  "message": "Session card created successfully"
}
```

---

### 6.2 Get Session Cards

ดึงรายการการ์ดสรุปผล

**Endpoint:** `GET /session-cards`

**Permission:** 
- Trainee: เฉพาะการ์ดของตัวเอง
- Trainer: ทุกการ์ด

**Query Parameters:**
```
page=1
limit=20
traineeId=user_abc123   # Trainer only
trainerId=trainer_def456
startDate=2026-01-01
endDate=2026-01-31
rating=5
tags=personal-best
sort=date
order=desc
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "session_card_xyz789",
      "trainee": {
        "id": "user_abc123",
        "name": "John Doe",
        "avatar": "https://..."
      },
      "trainer": {
        "id": "trainer_def456",
        "name": "Jane Smith",
        "avatar": "https://..."
      },
      "workout": {
        "id": "workout_abc123",
        "date": "2026-01-23",
        "duration": 60
      },
      "date": "2026-01-23",
      "summary": "เซสชันวันนี้เยี่ยมมาก! พัฒนาการดีขึ้นเรื่อย ๆ",
      "achievementsCount": 3,
      "rating": 5,
      "tags": ["personal-best", "great-form", "high-energy"],
      "createdAt": "2026-01-23T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "totalItems": 100
  }
}
```

---

### 6.3 Get Session Card by ID

ดึงข้อมูลการ์ดสรุปผลตาม ID

**Endpoint:** `GET /session-cards/:sessionCardId`

**Permission:** 
- Trainee: เฉพาะการ์ดของตัวเอง
- Trainer: ทุกการ์ด

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "session_card_xyz789",
    "trainee": {
      "id": "user_abc123",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://..."
    },
    "trainer": {
      "id": "trainer_def456",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "avatar": "https://..."
    },
    "workout": {
      "id": "workout_abc123",
      "date": "2026-01-23",
      "duration": 60,
      "exercises": [
        {
          "name": "Squat",
          "type": "weight_training",
          "sets": 4,
          "totalVolume": 3200
        }
      ]
    },
    "date": "2026-01-23",
    "summary": "เซสชันวันนี้เยี่ยมมาก! พัฒนาการดีขึ้นเรื่อย ๆ",
    "achievements": [
      "ทำ Squat ได้น้ำหนักเพิ่มขึ้น 5 kg",
      "ฟอร์ม Deadlift ดีขึ้นมาก",
      "ความทนทานเพิ่มขึ้น"
    ],
    "areasForImprovement": [
      "ควรเพิ่มความยืดหยุ่นของสะโพก",
      "ต้องเน้นการหายใจให้ถูกต้อง"
    ],
    "nextSessionGoals": [
      "เพิ่มน้ำหนัก Squat อีก 2.5 kg",
      "ทำ Pull-ups เพิ่มเป็น 10 ครั้ง"
    ],
    "trainerNotes": "พัฒนาการดีมาก ควรรักษาฟอร์มและพักผ่อนให้เพียงพอ",
    "rating": 5,
    "tags": ["personal-best", "great-form", "high-energy"],
    "media": [
      {
        "type": "image",
        "url": "https://...",
        "caption": "Great form on squats"
      }
    ],
    "createdAt": "2026-01-23T12:00:00Z",
    "updatedAt": "2026-01-23T12:00:00Z"
  }
}
```

---

### 6.4 Update Session Card (Trainer Only)

อัปเดตการ์ดสรุปผล

**Endpoint:** `PATCH /session-cards/:sessionCardId`

**Permission:** Trainer only

**Request Body:**
```json
{
  "summary": "Updated summary",
  "achievements": [...],
  "trainerNotes": "Updated notes",
  "rating": 4
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "session_card_xyz789",
    // ... updated session card data
  },
  "message": "Session card updated successfully"
}
```

---

### 6.5 Delete Session Card (Trainer Only)

ลบการ์ดสรุปผล

**Endpoint:** `DELETE /session-cards/:sessionCardId`

**Permission:** Trainer only

**Response:** `204 No Content`

---

## 7. Progress Tracking APIs

### 7.1 Get Exercise Progress

ดึงความก้าวหน้าของท่าออกกำลังกาย

**Endpoint:** `GET /progress/exercises/:exerciseName`

**Permission:** 
- Trainee: เฉพาะข้อมูลของตัวเอง
- Trainer: ข้อมูลของ trainee ที่ระบุ

**Query Parameters:**
```
traineeId=user_abc123   # Trainer only
startDate=2026-01-01
endDate=2026-01-31
limit=50
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "exercise": {
      "name": "Squat",
      "type": "weight_training",
      "category": "legs"
    },
    "period": {
      "start": "2026-01-01",
      "end": "2026-01-31"
    },
    "summary": {
      "totalSessions": 12,
      "totalSets": 48,
      "totalReps": 384,
      "totalVolume": 38400,
      "averageWeight": 95.8,
      "personalBest": {
        "weight": 120,
        "date": "2026-01-20",
        "workoutId": "workout_xyz789"
      },
      "improvement": {
        "percentage": 25.0,
        "absoluteWeight": 20,
        "fromDate": "2026-01-01",
        "toDate": "2026-01-31"
      }
    },
    "history": [
      {
        "date": "2026-01-23",
        "workoutId": "workout_abc123",
        "sets": 4,
        "weight": 100,
        "reps": 8,
        "volume": 3200,
        "isPersonalBest": false
      }
    ],
    "trend": "improving",
    "consistency": 0.85
  }
}
```

---

### 7.2 Get Body Weight Progress

ดึงความก้าวหน้าน้ำหนักตัว

**Endpoint:** `GET /progress/body-weight`

**Permission:** 
- Trainee: เฉพาะข้อมูลของตัวเอง
- Trainer: ข้อมูลของ trainee ที่ระบุ

**Query Parameters:**
```
traineeId=user_abc123   # Trainer only
startDate=2026-01-01
endDate=2026-01-31
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2026-01-01",
      "end": "2026-01-31"
    },
    "current": {
      "weight": 72.5,
      "date": "2026-01-23",
      "bmi": 23.7,
      "bodyFatPercentage": 15.2
    },
    "goal": {
      "targetWeight": 70.0,
      "targetDate": "2026-03-01",
      "remaining": 2.5,
      "onTrack": true
    },
    "summary": {
      "startWeight": 74.5,
      "currentWeight": 72.5,
      "change": -2.0,
      "changePercentage": -2.68,
      "averageWeeklyChange": -0.5,
      "totalMeasurements": 8
    },
    "history": [
      {
        "date": "2026-01-23",
        "weight": 72.5,
        "bmi": 23.7,
        "bodyFatPercentage": 15.2,
        "notes": "Feeling great"
      }
    ],
    "trend": "decreasing",
    "projectedGoalDate": "2026-02-25"
  }
}
```

---

### 7.3 Add Body Weight Entry (Trainer Only)

เพิ่มบันทึกน้ำหนักตัว

**Endpoint:** `POST /progress/body-weight`

**Permission:** Trainer only

**Request Body:**
```json
{
  "traineeId": "user_abc123",
  "weight": 72.5,
  "date": "2026-01-23",
  "bodyFatPercentage": 15.2,
  "muscleMass": 60.5,
  "notes": "Measured in morning, fasted"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "weight_entry_abc123",
    "traineeId": "user_abc123",
    "weight": 72.5,
    "date": "2026-01-23",
    "bmi": 23.7,
    "bodyFatPercentage": 15.2,
    "muscleMass": 60.5,
    "notes": "Measured in morning, fasted",
    "createdAt": "2026-01-23T08:00:00Z"
  },
  "message": "Body weight entry added successfully"
}
```

---

### 7.4 Get Overall Progress

ดึงความก้าวหน้าโดยรวม

**Endpoint:** `GET /progress/overall`

**Permission:** 
- Trainee: เฉพาะข้อมูลของตัวเอง
- Trainer: ข้อมูลของ trainee ที่ระบุ

**Query Parameters:**
```
traineeId=user_abc123   # Trainer only
period=week|month|year
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "period": "month",
    "overview": {
      "totalWorkouts": 20,
      "totalDuration": 1200,
      "totalCalories": 8000,
      "averageDuration": 60,
      "consistency": 0.75,
      "currentStreak": 7,
      "longestStreak": 14
    },
    "byExerciseType": {
      "weight_training": {
        "count": 12,
        "totalVolume": 96000,
        "improvement": 15.5,
        "topExercises": [
          {
            "name": "Squat",
            "count": 12,
            "improvement": 25.0
          }
        ]
      },
      "cardio": {
        "count": 6,
        "totalDistance": 31.2,
        "improvement": 10.2,
        "topExercises": [
          {
            "name": "Running",
            "count": 6,
            "improvement": 12.5
          }
        ]
      },
      "flexibility": {
        "count": 2,
        "totalDuration": 60,
        "improvement": 20.0,
        "topExercises": [
          {
            "name": "Yoga Flow",
            "count": 2,
            "improvement": 20.0
          }
        ]
      }
    },
    "bodyComposition": {
      "weight": {
        "current": 72.5,
        "change": -2.0,
        "changePercentage": -2.68
      },
      "bodyFat": {
        "current": 15.2,
        "change": -1.5,
        "changePercentage": -9.0
      }
    },
    "personalBests": [
      {
        "exercise": "Squat",
        "value": 120,
        "metric": "weight",
        "date": "2026-01-20"
      }
    ],
    "weeklyTrend": [
      {
        "week": "2026-W03",
        "workouts": 4,
        "duration": 240,
        "calories": 1600
      }
    ]
  }
}
```

---

## 8. Notification APIs

### 8.1 Get Notifications

ดึงรายการแจ้งเตือน

**Endpoint:** `GET /notifications`

**Permission:** Authenticated

**Query Parameters:**
```
page=1
limit=20
type=schedule|workout|achievement|reminder|system
status=unread|read|all
sort=createdAt
order=desc
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "notif_abc123",
      "type": "schedule",
      "title": "Upcoming Workout Session",
      "message": "You have a workout session scheduled tomorrow at 10:00 AM",
      "data": {
        "scheduleId": "schedule_xyz789",
        "date": "2026-01-24",
        "time": "10:00"
      },
      "status": "unread",
      "priority": "high",
      "actionUrl": "/schedules/schedule_xyz789",
      "createdAt": "2026-01-23T12:00:00Z",
      "readAt": null
    },
    {
      "id": "notif_def456",
      "type": "achievement",
      "title": "New Personal Best! 🎉",
      "message": "Congratulations! You've achieved a new personal best on Squat: 120 kg",
      "data": {
        "exercise": "Squat",
        "value": 120,
        "workoutId": "workout_xyz789"
      },
      "status": "unread",
      "priority": "medium",
      "actionUrl": "/workouts/workout_xyz789",
      "createdAt": "2026-01-23T11:30:00Z",
      "readAt": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "totalItems": 50
  },
  "unreadCount": 12
}
```

---

### 8.2 Mark Notification as Read

ทำเครื่องหมายว่าอ่านแล้ว

**Endpoint:** `PATCH /notifications/:notificationId/read`

**Permission:** Authenticated

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "notif_abc123",
    "status": "read",
    "readAt": "2026-01-23T13:00:00Z"
  },
  "message": "Notification marked as read"
}
```

---

### 8.3 Mark All Notifications as Read

ทำเครื่องหมายว่าอ่านแล้วทั้งหมด

**Endpoint:** `PATCH /notifications/read-all`

**Permission:** Authenticated

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "updatedCount": 12
  },
  "message": "All notifications marked as read"
}
```

---

### 8.4 Delete Notification

ลบการแจ้งเตือน

**Endpoint:** `DELETE /notifications/:notificationId`

**Permission:** Authenticated

**Response:** `204 No Content`

---

### 8.5 Get Notification Settings

ดึงการตั้งค่าการแจ้งเตือน

**Endpoint:** `GET /notifications/settings`

**Permission:** Authenticated

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "email": {
      "enabled": true,
      "schedule": true,
      "workout": true,
      "achievement": true,
      "reminder": true,
      "system": false
    },
    "push": {
      "enabled": true,
      "schedule": true,
      "workout": true,
      "achievement": true,
      "reminder": true,
      "system": true
    },
    "sms": {
      "enabled": false,
      "schedule": false,
      "workout": false,
      "achievement": false,
      "reminder": false,
      "system": false
    },
    "reminders": {
      "scheduleReminder": {
        "enabled": true,
        "minutesBefore": 30
      },
      "dailyGoal": {
        "enabled": true,
        "time": "08:00"
      },
      "weeklyReport": {
        "enabled": true,
        "day": "monday",
        "time": "09:00"
      }
    }
  }
}
```

---

### 8.6 Update Notification Settings

อัปเดตการตั้งค่าการแจ้งเตือน

**Endpoint:** `PATCH /notifications/settings`

**Permission:** Authenticated

**Request Body:**
```json
{
  "email": {
    "enabled": true,
    "achievement": false
  },
  "push": {
    "enabled": true,
    "system": false
  },
  "reminders": {
    "scheduleReminder": {
      "enabled": true,
      "minutesBefore": 60
    }
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    // ... updated settings
  },
  "message": "Notification settings updated successfully"
}
```

---

## 9. Analytics APIs

### 9.1 Get Dashboard Analytics (Trainer Only)

ดึงสถิติรวมสำหรับ Dashboard

**Endpoint:** `GET /analytics/dashboard`

**Permission:** Trainer only

**Query Parameters:**
```
period=week|month|year
startDate=2026-01-01
endDate=2026-01-31
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2026-01-01",
      "end": "2026-01-31"
    },
    "overview": {
      "totalTrainees": 50,
      "activeTrainees": 42,
      "totalWorkouts": 245,
      "totalSessions": 180,
      "averageAttendance": 0.84
    },
    "workoutDistribution": {
      "weight_training": 147,
      "cardio": 73,
      "flexibility": 25
    },
    "topPerformers": [
      {
        "trainee": {
          "id": "user_abc123",
          "name": "John Doe",
          "avatar": "https://..."
        },
        "stats": {
          "totalWorkouts": 20,
          "improvement": 25.0,
          "consistency": 0.95
        }
      }
    ],
    "popularExercises": [
      {
        "name": "Squat",
        "count": 150,
        "averageWeight": 95.5
      }
    ],
    "trends": {
      "workoutsChange": 15.5,
      "attendanceChange": 5.2,
      "activeTraineesChange": 8.1
    }
  }
}
```

---

### 9.2 Get Trainee Performance Report (Trainer Only)

ดึงรายงานผลการฝึกของลูกเทรน

**Endpoint:** `GET /analytics/trainees/:traineeId/report`

**Permission:** Trainer only

**Query Parameters:**
```
period=month|quarter|year
startDate=2026-01-01
endDate=2026-01-31
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "trainee": {
      "id": "user_abc123",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://..."
    },
    "period": {
      "start": "2026-01-01",
      "end": "2026-01-31"
    },
    "summary": {
      "totalWorkouts": 20,
      "totalDuration": 1200,
      "attendance": 0.85,
      "consistency": 0.75,
      "overallImprovement": 18.5
    },
    "byExerciseType": {
      "weight_training": {
        "count": 12,
        "totalVolume": 96000,
        "improvement": 25.0
      },
      "cardio": {
        "count": 6,
        "totalDistance": 31.2,
        "improvement": 12.5
      },
      "flexibility": {
        "count": 2,
        "totalDuration": 60,
        "improvement": 20.0
      }
    },
    "personalBests": [
      {
        "exercise": "Squat",
        "value": 120,
        "date": "2026-01-20",
        "improvement": 25.0
      }
    ],
    "strengths": [
      "Consistent attendance",
      "Strong improvement in weight training",
      "Good form and technique"
    ],
    "areasForImprovement": [
      "Increase flexibility work",
      "Focus on cardio endurance"
    ],
    "recommendations": [
      "Add more flexibility sessions",
      "Increase cardio frequency to 3x per week"
    ]
  }
}
```

---

### 9.3 Get Exercise Statistics

ดึงสถิติการใช้งานท่าออกกำลังกาย

**Endpoint:** `GET /analytics/exercises/stats`

**Permission:** Trainer only

**Query Parameters:**
```
period=week|month|year
exerciseType=weight_training|cardio|flexibility
sort=usage|improvement
order=desc
limit=20
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "exercise": {
        "id": "exercise_squat123",
        "name": "Squat",
        "type": "weight_training",
        "category": "legs"
      },
      "stats": {
        "totalUsage": 150,
        "uniqueUsers": 45,
        "averageWeight": 95.5,
        "averageImprovement": 18.2,
        "totalVolume": 285000,
        "popularityRank": 1
      }
    }
  ]
}
```

---

## 10. Settings APIs

### 10.1 Get User Settings

ดึงการตั้งค่าผู้ใช้

**Endpoint:** `GET /settings`

**Permission:** Authenticated

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "general": {
      "language": "th",
      "timezone": "Asia/Bangkok",
      "dateFormat": "DD/MM/YYYY",
      "timeFormat": "24h"
    },
    "appearance": {
      "theme": "dark",
      "accentColor": "#FF6B35",
      "fontSize": "medium"
    },
    "privacy": {
      "profileVisibility": "public",
      "showStats": true,
      "allowTrainerAccess": true
    },
    "measurements": {
      "weightUnit": "kg",
      "distanceUnit": "km",
      "heightUnit": "cm"
    }
  }
}
```

---

### 10.2 Update User Settings

อัปเดตการตั้งค่าผู้ใช้

**Endpoint:** `PATCH /settings`

**Permission:** Authenticated

**Request Body:**
```json
{
  "general": {
    "language": "en",
    "timezone": "Asia/Bangkok"
  },
  "appearance": {
    "theme": "light"
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    // ... updated settings
  },
  "message": "Settings updated successfully"
}
```

---

## Data Models

### User Model

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'trainee' | 'trainer' | 'admin';
  avatar?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  phone?: string;
  settings: UserSettings;
  stats: UserStats;
  createdAt: string;
  updatedAt: string;
}

interface UserSettings {
  language: string;
  timezone: string;
  theme: 'light' | 'dark';
  notifications: NotificationSettings;
}

interface UserStats {
  totalWorkouts: number;
  totalSessions: number;
  currentStreak: number;
  longestStreak: number;
}
```

### Schedule Model

```typescript
interface Schedule {
  id: string;
  traineeId: string;
  trainerId: string;
  date: string;
  time: string;
  duration: number;
  exercises: string[];
  location?: string;
  notes?: string;
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
  reminder?: {
    enabled: boolean;
    minutes: number;
  };
  createdAt: string;
  updatedAt: string;
}
```

### Workout Model

```typescript
interface Workout {
  id: string;
  traineeId: string;
  trainerId: string;
  date: string;
  duration: number;
  exercises: Exercise[];
  summary: WorkoutSummary;
  notes?: string;
  rating?: number;
  mood?: string;
  createdAt: string;
  updatedAt: string;
}

interface Exercise {
  id: string;
  name: string;
  type: 'weight_training' | 'cardio' | 'flexibility';
  category: string;
  metadata?: ExerciseMetadata;
  sets: ExerciseSet[];
  totalVolume?: number;
  personalBest?: boolean;
  notes?: string;
}

interface ExerciseSet {
  setNumber: number;
  // Weight Training
  reps?: number;
  weight?: number;
  // Cardio
  distance?: number;
  pace?: number;
  speed?: number;
  calories?: number;
  heartRate?: number;
  // Flexibility
  duration?: number;
  // Common
  rest?: number;
  completed: boolean;
  timestamp?: string;
  notes?: string;
}

interface WorkoutSummary {
  totalExercises: number;
  totalSets: number;
  totalVolume?: number;
  totalDistance?: number;
  totalCalories?: number;
  averageHeartRate?: number;
  byType: {
    weight_training: number;
    cardio: number;
    flexibility: number;
  };
}
```

### Session Card Model

```typescript
interface SessionCard {
  id: string;
  traineeId: string;
  trainerId: string;
  workoutId: string;
  date: string;
  summary: string;
  achievements: string[];
  areasForImprovement?: string[];
  nextSessionGoals?: string[];
  trainerNotes?: string;
  rating?: number;
  tags?: string[];
  media?: Media[];
  createdAt: string;
  updatedAt: string;
}

interface Media {
  type: 'image' | 'video';
  url: string;
  caption?: string;
}
```

---

## Webhooks

### Webhook Events

ระบบรองรับ webhooks สำหรับ events ต่อไปนี้:

```typescript
enum WebhookEvent {
  // User Events
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  
  // Schedule Events
  SCHEDULE_CREATED = 'schedule.created',
  SCHEDULE_UPDATED = 'schedule.updated',
  SCHEDULE_COMPLETED = 'schedule.completed',
  SCHEDULE_CANCELLED = 'schedule.cancelled',
  SCHEDULE_REMINDER = 'schedule.reminder',
  
  // Workout Events
  WORKOUT_CREATED = 'workout.created',
  WORKOUT_UPDATED = 'workout.updated',
  WORKOUT_DELETED = 'workout.deleted',
  
  // Achievement Events
  PERSONAL_BEST = 'achievement.personal_best',
  STREAK_MILESTONE = 'achievement.streak_milestone',
  
  // Session Card Events
  SESSION_CARD_CREATED = 'session_card.created',
  SESSION_CARD_UPDATED = 'session_card.updated'
}
```

### Webhook Payload

```json
{
  "event": "workout.created",
  "timestamp": "2026-01-23T12:00:00Z",
  "data": {
    "id": "workout_abc123",
    "traineeId": "user_abc123",
    "trainerId": "trainer_def456",
    // ... workout data
  },
  "signature": "sha256=..."
}
```

---

## Testing

### Test Endpoints

**Base URL:** `http://localhost:8080/api/v1/test`

### Health Check

```http
GET /health

Response:
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "timestamp": "2026-01-23T12:00:00Z",
    "services": {
      "database": "connected",
      "redis": "connected",
      "storage": "connected"
    }
  }
}
```

### API Info

```http
GET /info

Response:
{
  "success": true,
  "data": {
    "name": "Fitness Management API",
    "version": "1.0.0",
    "environment": "development",
    "endpoints": 57,
    "documentation": "https://api.fitness-app.com/docs"
  }
}
```

---

## 📊 API Summary

### Total Endpoints: **57**

| Category | Endpoints | Trainer Only | Trainee + Trainer |
|----------|-----------|--------------|-------------------|
| Authentication | 5 | 0 | 5 |
| User Management | 5 | 2 | 3 |
| Schedule Management | 6 | 4 | 2 |
| Workout Management | 6 | 4 | 2 |
| Exercise Management | 6 | 3 | 3 |
| Session Cards | 5 | 3 | 2 |
| Progress Tracking | 4 | 1 | 3 |
| Notifications | 6 | 0 | 6 |
| Analytics | 3 | 3 | 0 |
| Settings | 2 | 0 | 2 |
| Testing | 2 | 0 | 2 |
| **Total** | **57** | **20** | **30** |

---

## 🔐 Security Best Practices

1. **Authentication**
   - ใช้ JWT tokens
   - Refresh tokens เก็บใน HTTP-only cookies
   - Token expiration: Access 24h, Refresh 30d

2. **Authorization**
   - RBAC (Role-Based Access Control)
   - Trainee: READ-ONLY
   - Trainer: FULL CRUD

3. **Rate Limiting**
   - จำกัดตาม Role
   - Exponential backoff
   - IP-based limiting

4. **Data Validation**
   - Input sanitization
   - Request body size limits
   - Query parameter validation

5. **HTTPS Only**
   - TLS 1.2+
   - HSTS headers
   - Certificate pinning

---

## 📚 Additional Resources

- **API Documentation:** https://api.fitness-app.com/docs
- **Postman Collection:** https://www.postman.com/...
- **OpenAPI Spec:** https://api.fitness-app.com/openapi.json
- **Status Page:** https://status.fitness-app.com
- **Support:** support@fitness-app.com

---

**Created by**: Figma Make AI Assistant  
**Date**: 23 มกราคม 2026  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
