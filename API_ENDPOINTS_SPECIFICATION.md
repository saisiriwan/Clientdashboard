# 🚀 API Endpoints Specification - Fitness Management System

## 📋 Overview

**Base URL:** `https://api.fitness.com/api/v1`  
**Authentication:** JWT Bearer Token  
**Content-Type:** `application/json`  
**Total Endpoints:** 57 APIs  
**API Version:** v1.0.0

---

## 📊 API Summary

| Category | Count | Auth Required | Trainer Only |
|----------|-------|---------------|--------------|
| 🔐 Authentication | 5 | Partial | No |
| 👤 User Management | 5 | Yes | Partial |
| 📅 Schedule Management | 6 | Yes | Partial |
| 💪 Workout Management | 6 | Yes | Partial |
| 🏋️ Exercise Management | 6 | Yes | Partial |
| 📝 Session Cards | 5 | Yes | Partial |
| 📈 Progress Tracking | 4 | Yes | No |
| 🔔 Notifications | 6 | Yes | No |
| 📊 Analytics | 3 | Yes | Yes (Trainer) |
| ⚙️ Settings | 2 | Yes | No |
| 🧪 Health Check | 2 | No | No |
| 🔗 Webhooks | 7 | Yes | Yes (Trainer) |
| **TOTAL** | **57** | - | - |

---

## 🔐 Authentication APIs (5 Endpoints)

### 1. **GET** `/auth/google`
**Purpose:** Initiate Google OAuth 2.0 flow  
**Auth:** None (Public)  
**RBAC:** Public

**Response:**
```json
{
  "success": true,
  "data": {
    "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?client_id=..."
  }
}
```

---

### 2. **POST** `/auth/google/callback`
**Purpose:** Handle Google OAuth callback and issue JWT  
**Auth:** None (Public)  
**RBAC:** Public

**Request Body:**
```json
{
  "code": "4/0AY0e-g7...",
  "state": "random_state_string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "trainee",
      "avatar": "https://..."
    }
  }
}
```

---

### 3. **POST** `/auth/refresh`
**Purpose:** Refresh access token  
**Auth:** Refresh Token (Header or Cookie)  
**RBAC:** Authenticated

**Request Headers:**
```
X-Refresh-Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

---

### 4. **POST** `/auth/logout`
**Purpose:** Logout user and invalidate session  
**Auth:** Required (Bearer Token)  
**RBAC:** Authenticated

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 5. **GET** `/auth/verify`
**Purpose:** Verify access token validity  
**Auth:** Required (Bearer Token)  
**RBAC:** Authenticated

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "trainee"
    }
  }
}
```

---

## 👤 User Management APIs (5 Endpoints)

### 6. **GET** `/users/me`
**Purpose:** Get current user profile  
**Auth:** Required  
**RBAC:** Authenticated (Trainee + Trainer)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "trainee@example.com",
    "name": "Jane Doe",
    "avatar": "https://...",
    "role": "trainee",
    "phone": "+66812345678",
    "dateOfBirth": "1995-05-15",
    "gender": "female",
    "height": 165.5,
    "weight": 58.5,
    "isActive": true,
    "lastLogin": "2026-01-24T10:30:00Z",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

---

### 7. **PATCH** `/users/me`
**Purpose:** Update current user profile  
**Auth:** Required  
**RBAC:** Authenticated (ยกเว้น Trainee ไม่สามารถแก้ไข role, email)

**Request Body:**
```json
{
  "name": "Jane Smith",
  "phone": "+66812345678",
  "avatar": "https://...",
  "dateOfBirth": "1995-05-15",
  "gender": "female",
  "height": 165.5,
  "weight": 58.5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "trainee@example.com",
    "name": "Jane Smith",
    "updatedAt": "2026-01-24T10:35:00Z"
  }
}
```

**Validation:**
- Trainee **CANNOT** update: `role`, `email`, `isActive`
- Name: min 2, max 255 characters
- Phone: E.164 format (+66...)
- Height: 0-300 cm
- Weight: 0-500 kg

---

### 8. **GET** `/users/:userId`
**Purpose:** Get specific user profile  
**Auth:** Required  
**RBAC:** **Trainer Only** (or self)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "trainee@example.com",
    "name": "Jane Doe",
    "role": "trainee",
    "avatar": "https://...",
    "stats": {
      "totalWorkouts": 45,
      "totalSessions": 30,
      "avgRating": 4.5
    }
  }
}
```

---

### 9. **GET** `/users`
**Purpose:** List all users (with filters)  
**Auth:** Required  
**RBAC:** **Trainer Only**

**Query Parameters:**
- `role` (string): Filter by role (trainee/trainer)
- `page` (int): Page number (default: 1)
- `limit` (int): Items per page (default: 20, max: 100)
- `search` (string): Search by name or email
- `isActive` (boolean): Filter by active status

**Request:**
```
GET /users?role=trainee&page=1&limit=20&search=jane&isActive=true
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "trainee@example.com",
        "name": "Jane Doe",
        "role": "trainee",
        "avatar": "https://...",
        "isActive": true,
        "lastLogin": "2026-01-24T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

---

### 10. **GET** `/users/:userId/stats`
**Purpose:** Get user statistics  
**Auth:** Required  
**RBAC:** Trainee (self only), Trainer (all)

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "totalWorkouts": 45,
    "totalSessions": 30,
    "avgRating": 4.5,
    "totalDuration": 2700,
    "weightLifted": 25000,
    "distanceRun": 156.5,
    "currentStreak": 7,
    "longestStreak": 21,
    "achievements": [
      {
        "id": "first_workout",
        "title": "First Workout",
        "unlockedAt": "2025-01-05T00:00:00Z"
      }
    ]
  }
}
```

---

## 📅 Schedule Management APIs (6 Endpoints)

### 11. **POST** `/schedules`
**Purpose:** Create new schedule  
**Auth:** Required  
**RBAC:** **Trainer Only**

**Request Body:**
```json
{
  "traineeId": "uuid",
  "title": "Strength Training Session",
  "date": "2026-01-28",
  "startTime": "14:00",
  "endTime": "15:00",
  "location": "Gym Room A",
  "notes": "Focus on upper body"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "traineeId": "uuid",
    "trainerId": "uuid",
    "title": "Strength Training Session",
    "date": "2026-01-28",
    "startTime": "14:00",
    "endTime": "15:00",
    "duration": 60,
    "location": "Gym Room A",
    "status": "pending",
    "notes": "Focus on upper body",
    "createdAt": "2026-01-24T10:40:00Z"
  }
}
```

**Validation:**
- `traineeId`: Must be valid trainee UUID
- `title`: 3-255 characters
- `date`: YYYY-MM-DD format, cannot be in the past
- `startTime`, `endTime`: HH:mm format
- `endTime` must be after `startTime`

---

### 12. **GET** `/schedules`
**Purpose:** List schedules (filtered by role)  
**Auth:** Required  
**RBAC:** Trainee (own only), Trainer (all or by traineeId)

**Query Parameters:**
- `traineeId` (uuid): Filter by trainee (Trainer only)
- `status` (string): pending, confirmed, completed, cancelled
- `startDate` (date): Filter from date
- `endDate` (date): Filter to date
- `page` (int): Page number
- `limit` (int): Items per page

**Request (Trainee):**
```
GET /schedules?status=confirmed&startDate=2026-01-24&endDate=2026-01-31
```

**Request (Trainer):**
```
GET /schedules?traineeId=uuid&status=confirmed&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "schedules": [
      {
        "id": "uuid",
        "traineeId": "uuid",
        "trainerId": "uuid",
        "traineeName": "Jane Doe",
        "trainerName": "Coach John",
        "title": "Strength Training",
        "date": "2026-01-28",
        "startTime": "14:00",
        "endTime": "15:00",
        "duration": 60,
        "location": "Gym Room A",
        "status": "confirmed",
        "createdAt": "2026-01-24T10:40:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 30,
      "totalPages": 2
    }
  }
}
```

---

### 13. **GET** `/schedules/:id`
**Purpose:** Get schedule details  
**Auth:** Required  
**RBAC:** Trainee (own only), Trainer (all)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "trainee": {
      "id": "uuid",
      "name": "Jane Doe",
      "email": "trainee@example.com",
      "phone": "+66812345678"
    },
    "trainer": {
      "id": "uuid",
      "name": "Coach John",
      "email": "trainer@example.com",
      "phone": "+66898765432"
    },
    "title": "Strength Training",
    "date": "2026-01-28",
    "startTime": "14:00",
    "endTime": "15:00",
    "duration": 60,
    "location": "Gym Room A",
    "status": "confirmed",
    "notes": "Focus on upper body",
    "reminderSent": false,
    "createdAt": "2026-01-24T10:40:00Z",
    "updatedAt": "2026-01-24T10:40:00Z"
  }
}
```

---

### 14. **PATCH** `/schedules/:id`
**Purpose:** Update schedule  
**Auth:** Required  
**RBAC:** **Trainer Only**

**Request Body:**
```json
{
  "title": "Advanced Strength Training",
  "date": "2026-01-29",
  "startTime": "15:00",
  "endTime": "16:30",
  "location": "Gym Room B",
  "notes": "Updated session plan"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Advanced Strength Training",
    "date": "2026-01-29",
    "startTime": "15:00",
    "endTime": "16:30",
    "duration": 90,
    "updatedAt": "2026-01-24T11:00:00Z"
  }
}
```

---

### 15. **PATCH** `/schedules/:id/status`
**Purpose:** Update schedule status  
**Auth:** Required  
**RBAC:** **Trainer Only**

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "confirmed",
    "updatedAt": "2026-01-24T11:05:00Z"
  }
}
```

**Valid Status Transitions:**
- `pending` → `confirmed`, `cancelled`
- `confirmed` → `completed`, `cancelled`

---

### 16. **DELETE** `/schedules/:id`
**Purpose:** Delete schedule  
**Auth:** Required  
**RBAC:** **Trainer Only**

**Response:**
```json
{
  "success": true,
  "message": "Schedule deleted successfully"
}
```

---

## 💪 Workout Management APIs (6 Endpoints)

### 17. **POST** `/workouts`
**Purpose:** Log workout session  
**Auth:** Required  
**RBAC:** **Trainer Only**

**Request Body:**
```json
{
  "traineeId": "uuid",
  "scheduleId": "uuid",
  "date": "2026-01-24",
  "duration": 60,
  "exercises": [
    {
      "name": "Squat",
      "type": "weight_training",
      "isBodyweight": false,
      "sets": [
        {
          "setNumber": 1,
          "weight": 100,
          "reps": 8,
          "rest": 90
        },
        {
          "setNumber": 2,
          "weight": 100,
          "reps": 8,
          "rest": 90
        }
      ]
    },
    {
      "name": "Running",
      "type": "cardio",
      "sets": [
        {
          "setNumber": 1,
          "distance": 5.2,
          "duration": 27.5,
          "pace": 5.29,
          "calories": 416
        }
      ]
    },
    {
      "name": "Yoga Flow",
      "type": "flexibility",
      "sets": [
        {
          "setNumber": 1,
          "duration": 30,
          "holdTime": 60
        }
      ]
    }
  ],
  "notes": "Great session, good form on squats",
  "rating": 5,
  "mood": "energetic"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "traineeId": "uuid",
    "trainerId": "uuid",
    "scheduleId": "uuid",
    "date": "2026-01-24",
    "duration": 60,
    "exercises": [...],
    "summary": {
      "totalSets": 4,
      "totalReps": 16,
      "totalWeight": 1600,
      "totalDistance": 5.2,
      "totalDuration": 57.5,
      "totalCalories": 416,
      "exerciseCount": 3,
      "typeBreakdown": {
        "weight_training": 1,
        "cardio": 1,
        "flexibility": 1
      }
    },
    "notes": "Great session, good form on squats",
    "rating": 5,
    "mood": "energetic",
    "createdAt": "2026-01-24T15:00:00Z"
  }
}
```

**Validation:**
- `exercises`: Array with at least 1 exercise
- `type`: Must be `weight_training`, `cardio`, or `flexibility`
- Weight Training: Requires `weight` (if not bodyweight) and `reps`
- Cardio: Requires `distance` or `duration`
- Flexibility: Requires `duration`

---

### 18. **GET** `/workouts`
**Purpose:** List workouts  
**Auth:** Required  
**RBAC:** Trainee (own only), Trainer (all or by traineeId)

**Query Parameters:**
- `traineeId` (uuid): Filter by trainee (Trainer only)
- `startDate` (date): Filter from date
- `endDate` (date): Filter to date
- `page` (int): Page number
- `limit` (int): Items per page
- `sortBy` (string): date, rating (default: date)
- `sortOrder` (string): asc, desc (default: desc)

**Request:**
```
GET /workouts?startDate=2026-01-01&endDate=2026-01-31&sortBy=date&sortOrder=desc
```

**Response:**
```json
{
  "success": true,
  "data": {
    "workouts": [
      {
        "id": "uuid",
        "traineeId": "uuid",
        "trainerId": "uuid",
        "traineeName": "Jane Doe",
        "date": "2026-01-24",
        "duration": 60,
        "summary": {
          "totalSets": 4,
          "totalReps": 16,
          "exerciseCount": 3
        },
        "rating": 5,
        "createdAt": "2026-01-24T15:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

---

### 19. **GET** `/workouts/:id`
**Purpose:** Get workout details  
**Auth:** Required  
**RBAC:** Trainee (own only), Trainer (all)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "trainee": {
      "id": "uuid",
      "name": "Jane Doe"
    },
    "trainer": {
      "id": "uuid",
      "name": "Coach John"
    },
    "date": "2026-01-24",
    "duration": 60,
    "exercises": [
      {
        "name": "Squat",
        "type": "weight_training",
        "isBodyweight": false,
        "sets": [
          {
            "setNumber": 1,
            "weight": 100,
            "reps": 8,
            "rest": 90
          }
        ]
      }
    ],
    "summary": {
      "totalSets": 4,
      "totalReps": 16,
      "totalWeight": 1600,
      "exerciseCount": 3
    },
    "notes": "Great session",
    "rating": 5,
    "mood": "energetic",
    "createdAt": "2026-01-24T15:00:00Z"
  }
}
```

---

### 20. **PATCH** `/workouts/:id`
**Purpose:** Update workout  
**Auth:** Required  
**RBAC:** **Trainer Only**

**Request Body:**
```json
{
  "duration": 65,
  "notes": "Updated notes",
  "rating": 4
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "duration": 65,
    "notes": "Updated notes",
    "rating": 4,
    "updatedAt": "2026-01-24T16:00:00Z"
  }
}
```

---

### 21. **DELETE** `/workouts/:id`
**Purpose:** Delete workout  
**Auth:** Required  
**RBAC:** **Trainer Only**

**Response:**
```json
{
  "success": true,
  "message": "Workout deleted successfully"
}
```

---

### 22. **GET** `/workouts/summary`
**Purpose:** Get workout summary statistics  
**Auth:** Required  
**RBAC:** Trainee (own only), Trainer (all or by traineeId)

**Query Parameters:**
- `traineeId` (uuid): Filter by trainee (Trainer only)
- `startDate` (date): Filter from date
- `endDate` (date): Filter to date

**Request:**
```
GET /workouts/summary?startDate=2026-01-01&endDate=2026-01-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalWorkouts": 45,
    "totalDuration": 2700,
    "avgRating": 4.5,
    "totalSets": 180,
    "totalReps": 1440,
    "totalWeightLifted": 72000,
    "totalDistanceRun": 156.5,
    "exerciseBreakdown": {
      "weight_training": 30,
      "cardio": 10,
      "flexibility": 5
    },
    "topExercises": [
      {
        "name": "Squat",
        "count": 20,
        "avgWeight": 95
      }
    ]
  }
}
```

---

## 🏋️ Exercise Management APIs (6 Endpoints)

### 23. **POST** `/exercises`
**Purpose:** Create new exercise  
**Auth:** Required  
**RBAC:** **Trainer Only**

**Request Body:**
```json
{
  "name": "Barbell Squat",
  "type": "weight_training",
  "category": "Legs",
  "description": "Compound lower body exercise",
  "muscleGroups": ["quadriceps", "glutes", "hamstrings"],
  "equipment": ["barbell", "squat rack"],
  "difficulty": "intermediate",
  "instructions": [
    "Set up barbell at shoulder height",
    "Position bar on upper back",
    "Descend until thighs parallel to ground",
    "Drive through heels to stand"
  ],
  "tips": [
    "Keep chest up",
    "Maintain neutral spine"
  ],
  "warnings": [
    "Do not round lower back"
  ],
  "videoUrl": "https://...",
  "thumbnailUrl": "https://...",
  "metadata": {
    "defaultSets": 4,
    "defaultReps": 8,
    "restTime": 90
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Barbell Squat",
    "type": "weight_training",
    "category": "Legs",
    "createdBy": "uuid",
    "isActive": true,
    "usageCount": 0,
    "createdAt": "2026-01-24T16:30:00Z"
  }
}
```

---

### 24. **GET** `/exercises`
**Purpose:** List exercises  
**Auth:** Required  
**RBAC:** Authenticated (Trainee + Trainer)

**Query Parameters:**
- `type` (string): weight_training, cardio, flexibility
- `category` (string): Filter by category
- `difficulty` (string): beginner, intermediate, advanced
- `search` (string): Search by name
- `isActive` (boolean): Filter by active status
- `page` (int): Page number
- `limit` (int): Items per page

**Request:**
```
GET /exercises?type=weight_training&category=Legs&difficulty=intermediate&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "exercises": [
      {
        "id": "uuid",
        "name": "Barbell Squat",
        "type": "weight_training",
        "category": "Legs",
        "difficulty": "intermediate",
        "muscleGroups": ["quadriceps", "glutes"],
        "thumbnailUrl": "https://...",
        "usageCount": 125
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 250,
      "totalPages": 13
    }
  }
}
```

---

### 25. **GET** `/exercises/:id`
**Purpose:** Get exercise details  
**Auth:** Required  
**RBAC:** Authenticated (Trainee + Trainer)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Barbell Squat",
    "type": "weight_training",
    "category": "Legs",
    "description": "Compound lower body exercise",
    "muscleGroups": ["quadriceps", "glutes", "hamstrings"],
    "equipment": ["barbell", "squat rack"],
    "difficulty": "intermediate",
    "instructions": [...],
    "tips": [...],
    "warnings": [...],
    "videoUrl": "https://...",
    "thumbnailUrl": "https://...",
    "metadata": {
      "defaultSets": 4,
      "defaultReps": 8,
      "restTime": 90
    },
    "usageCount": 125,
    "createdBy": {
      "id": "uuid",
      "name": "Coach John"
    },
    "createdAt": "2026-01-24T16:30:00Z"
  }
}
```

---

### 26. **PATCH** `/exercises/:id`
**Purpose:** Update exercise  
**Auth:** Required  
**RBAC:** **Trainer Only** (creator or admin)

**Request Body:**
```json
{
  "description": "Updated description",
  "difficulty": "advanced",
  "instructions": [...]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "description": "Updated description",
    "difficulty": "advanced",
    "updatedAt": "2026-01-24T17:00:00Z"
  }
}
```

---

### 27. **DELETE** `/exercises/:id`
**Purpose:** Delete exercise (soft delete)  
**Auth:** Required  
**RBAC:** **Trainer Only** (creator or admin)

**Response:**
```json
{
  "success": true,
  "message": "Exercise deleted successfully"
}
```

---

### 28. **GET** `/exercises/categories`
**Purpose:** Get exercise categories and counts  
**Auth:** Required  
**RBAC:** Authenticated (Trainee + Trainer)

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "name": "Legs",
        "count": 45,
        "types": {
          "weight_training": 40,
          "cardio": 5,
          "flexibility": 0
        }
      },
      {
        "name": "Chest",
        "count": 30,
        "types": {
          "weight_training": 30,
          "cardio": 0,
          "flexibility": 0
        }
      }
    ],
    "totalExercises": 250
  }
}
```

---

## 📝 Session Cards APIs (5 Endpoints)

### 29. **POST** `/session-cards`
**Purpose:** Create session feedback card  
**Auth:** Required  
**RBAC:** **Trainer Only**

**Request Body:**
```json
{
  "traineeId": "uuid",
  "workoutId": "uuid",
  "date": "2026-01-24",
  "summary": "Excellent progress on squats today",
  "achievements": [
    "Hit new PR on squat (100kg)",
    "Maintained good form throughout"
  ],
  "areasForImprovement": [
    "Work on mobility in ankles",
    "Increase core stability"
  ],
  "nextSessionGoals": [
    "Increase squat to 105kg",
    "Add more stretching"
  ],
  "trainerNotes": "Consider adding more warm-up time",
  "rating": 5,
  "tags": ["strength", "lower-body", "personal-record"],
  "media": {
    "images": ["https://..."],
    "videos": []
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "traineeId": "uuid",
    "trainerId": "uuid",
    "workoutId": "uuid",
    "date": "2026-01-24",
    "summary": "Excellent progress on squats today",
    "achievements": [...],
    "areasForImprovement": [...],
    "nextSessionGoals": [...],
    "rating": 5,
    "tags": [...],
    "createdAt": "2026-01-24T17:30:00Z"
  }
}
```

---

### 30. **GET** `/session-cards`
**Purpose:** List session cards  
**Auth:** Required  
**RBAC:** Trainee (own only), Trainer (all or by traineeId)

**Query Parameters:**
- `traineeId` (uuid): Filter by trainee (Trainer only)
- `startDate` (date): Filter from date
- `endDate` (date): Filter to date
- `rating` (int): Filter by rating
- `tags` (string): Filter by tags (comma-separated)
- `page` (int): Page number
- `limit` (int): Items per page

**Request:**
```
GET /session-cards?startDate=2026-01-01&rating=5&tags=strength,personal-record
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionCards": [
      {
        "id": "uuid",
        "traineeId": "uuid",
        "trainerId": "uuid",
        "traineeName": "Jane Doe",
        "date": "2026-01-24",
        "summary": "Excellent progress on squats today",
        "achievements": [...],
        "rating": 5,
        "tags": ["strength", "lower-body"],
        "createdAt": "2026-01-24T17:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 30,
      "totalPages": 2
    }
  }
}
```

---

### 31. **GET** `/session-cards/:id`
**Purpose:** Get session card details  
**Auth:** Required  
**RBAC:** Trainee (own only), Trainer (all)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "trainee": {
      "id": "uuid",
      "name": "Jane Doe"
    },
    "trainer": {
      "id": "uuid",
      "name": "Coach John"
    },
    "workout": {
      "id": "uuid",
      "date": "2026-01-24",
      "duration": 60
    },
    "date": "2026-01-24",
    "summary": "Excellent progress on squats today",
    "achievements": [...],
    "areasForImprovement": [...],
    "nextSessionGoals": [...],
    "trainerNotes": "Consider adding more warm-up time",
    "rating": 5,
    "tags": [...],
    "media": {
      "images": [...],
      "videos": []
    },
    "createdAt": "2026-01-24T17:30:00Z"
  }
}
```

---

### 32. **PATCH** `/session-cards/:id`
**Purpose:** Update session card  
**Auth:** Required  
**RBAC:** **Trainer Only**

**Request Body:**
```json
{
  "summary": "Updated summary",
  "rating": 4,
  "tags": ["strength", "lower-body", "mobility"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "summary": "Updated summary",
    "rating": 4,
    "updatedAt": "2026-01-24T18:00:00Z"
  }
}
```

---

### 33. **DELETE** `/session-cards/:id`
**Purpose:** Delete session card  
**Auth:** Required  
**RBAC:** **Trainer Only**

**Response:**
```json
{
  "success": true,
  "message": "Session card deleted successfully"
}
```

---

## 📈 Progress Tracking APIs (4 Endpoints)

### 34. **GET** `/progress/exercises/:name`
**Purpose:** Get progress for specific exercise  
**Auth:** Required  
**RBAC:** Trainee (own only), Trainer (with traineeId)

**Query Parameters:**
- `traineeId` (uuid): Trainee ID (Trainer only)
- `startDate` (date): Filter from date
- `endDate` (date): Filter to date
- `limit` (int): Max data points (default: 50)

**Request:**
```
GET /progress/exercises/Squat?startDate=2025-11-01&endDate=2026-01-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "exercise": "Squat",
    "type": "weight_training",
    "isBodyweight": false,
    "history": [
      {
        "date": "2025-11-18",
        "weight": 70,
        "reps": 8,
        "sets": 5,
        "volume": 2800
      },
      {
        "date": "2025-11-25",
        "weight": 75,
        "reps": 8,
        "sets": 5,
        "volume": 3000
      },
      {
        "date": "2025-12-02",
        "weight": 80,
        "reps": 8,
        "sets": 5,
        "volume": 3200
      }
    ],
    "stats": {
      "currentWeight": 100,
      "startWeight": 70,
      "improvement": 42.86,
      "bestSet": {
        "weight": 100,
        "reps": 8,
        "date": "2026-01-24"
      },
      "totalVolume": 25000,
      "totalSessions": 15
    }
  }
}
```

---

### 35. **GET** `/progress/body-weight`
**Purpose:** Get body weight progress  
**Auth:** Required  
**RBAC:** Trainee (own only), Trainer (with traineeId)

**Query Parameters:**
- `traineeId` (uuid): Trainee ID (Trainer only)
- `startDate` (date): Filter from date
- `endDate` (date): Filter to date

**Request:**
```
GET /progress/body-weight?startDate=2025-11-01&endDate=2026-01-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "date": "2025-11-01",
        "weight": 74.5,
        "bmi": 24.8,
        "bodyFatPercentage": 22.5
      },
      {
        "date": "2025-11-15",
        "weight": 73.8,
        "bmi": 24.6,
        "bodyFatPercentage": 21.8
      },
      {
        "date": "2026-01-24",
        "weight": 72.5,
        "bmi": 24.2,
        "bodyFatPercentage": 20.5
      }
    ],
    "stats": {
      "currentWeight": 72.5,
      "startWeight": 74.5,
      "totalChange": -2.0,
      "percentChange": -2.68,
      "avgWeeklyChange": -0.2,
      "trend": "decreasing"
    }
  }
}
```

---

### 36. **POST** `/progress/body-weight`
**Purpose:** Add body weight entry  
**Auth:** Required  
**RBAC:** **Trainer Only**

**Request Body:**
```json
{
  "traineeId": "uuid",
  "weight": 72.5,
  "date": "2026-01-24",
  "bmi": 24.2,
  "bodyFatPercentage": 20.5,
  "muscleMass": 52.0,
  "notes": "Feeling good, lean"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "traineeId": "uuid",
    "weight": 72.5,
    "date": "2026-01-24",
    "bmi": 24.2,
    "bodyFatPercentage": 20.5,
    "muscleMass": 52.0,
    "notes": "Feeling good, lean",
    "createdAt": "2026-01-24T18:30:00Z"
  }
}
```

---

### 37. **GET** `/progress/overall`
**Purpose:** Get overall progress summary  
**Auth:** Required  
**RBAC:** Trainee (own only), Trainer (with traineeId)

**Query Parameters:**
- `traineeId` (uuid): Trainee ID (Trainer only)
- `period` (string): 7d, 30d, 90d, 1y, all (default: 30d)

**Request:**
```
GET /progress/overall?period=30d
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "30d",
    "workouts": {
      "total": 12,
      "avgDuration": 62,
      "totalDuration": 744,
      "avgRating": 4.5
    },
    "strength": {
      "totalVolume": 25000,
      "topExercise": "Squat",
      "bestPR": {
        "exercise": "Squat",
        "weight": 100,
        "date": "2026-01-24"
      }
    },
    "cardio": {
      "totalDistance": 52.5,
      "totalCalories": 4200,
      "avgPace": 5.3
    },
    "bodyWeight": {
      "current": 72.5,
      "change": -0.8,
      "percentChange": -1.09
    },
    "consistency": {
      "currentStreak": 7,
      "longestStreak": 15,
      "workoutFrequency": 3
    }
  }
}
```

---

## 🔔 Notification APIs (6 Endpoints)

### 38. **GET** `/notifications`
**Purpose:** List notifications  
**Auth:** Required  
**RBAC:** Authenticated (own only)

**Query Parameters:**
- `type` (string): Filter by type
- `isRead` (boolean): Filter by read status
- `page` (int): Page number
- `limit` (int): Items per page

**Request:**
```
GET /notifications?isRead=false&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "schedule_created",
        "title": "นัดหมายใหม่",
        "message": "คุณมีนัดฝึกใหม่: Strength Training วันที่ 2026-01-28",
        "resourceType": "schedules",
        "resourceId": "uuid",
        "isRead": false,
        "createdAt": "2026-01-24T10:40:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    },
    "unreadCount": 5
  }
}
```

---

### 39. **PATCH** `/notifications/:id/read`
**Purpose:** Mark notification as read  
**Auth:** Required  
**RBAC:** Authenticated (own only)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "isRead": true,
    "readAt": "2026-01-24T19:00:00Z"
  }
}
```

---

### 40. **PATCH** `/notifications/read-all`
**Purpose:** Mark all notifications as read  
**Auth:** Required  
**RBAC:** Authenticated (own only)

**Response:**
```json
{
  "success": true,
  "data": {
    "markedAsRead": 5
  }
}
```

---

### 41. **DELETE** `/notifications/:id`
**Purpose:** Delete notification  
**Auth:** Required  
**RBAC:** Authenticated (own only)

**Response:**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

### 42. **GET** `/notifications/settings`
**Purpose:** Get notification preferences  
**Auth:** Required  
**RBAC:** Authenticated (own only)

**Response:**
```json
{
  "success": true,
  "data": {
    "email": true,
    "push": true,
    "sms": false,
    "types": {
      "schedule_created": true,
      "schedule_updated": true,
      "schedule_reminder": true,
      "workout_logged": true,
      "session_card_created": true,
      "achievement_unlocked": true
    }
  }
}
```

---

### 43. **PATCH** `/notifications/settings`
**Purpose:** Update notification preferences  
**Auth:** Required  
**RBAC:** Authenticated (own only)

**Request Body:**
```json
{
  "email": true,
  "push": false,
  "sms": false,
  "types": {
    "schedule_reminder": true,
    "workout_logged": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "email": true,
    "push": false,
    "sms": false,
    "types": {...},
    "updatedAt": "2026-01-24T19:30:00Z"
  }
}
```

---

## 📊 Analytics APIs (3 Endpoints)

### 44. **GET** `/analytics/dashboard`
**Purpose:** Get trainer dashboard analytics  
**Auth:** Required  
**RBAC:** **Trainer Only**

**Query Parameters:**
- `period` (string): 7d, 30d, 90d (default: 30d)

**Request:**
```
GET /analytics/dashboard?period=30d
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "30d",
    "overview": {
      "totalTrainees": 15,
      "activeTrainees": 12,
      "totalSessions": 45,
      "completedSessions": 40,
      "upcomingSessions": 8,
      "avgRating": 4.6
    },
    "trainees": [
      {
        "id": "uuid",
        "name": "Jane Doe",
        "totalWorkouts": 8,
        "avgRating": 4.8,
        "lastWorkout": "2026-01-24",
        "consistency": 85
      }
    ],
    "topExercises": [
      {
        "name": "Squat",
        "count": 25,
        "avgWeight": 92
      }
    ],
    "performanceTrends": {
      "totalVolume": [
        { "date": "2026-01-01", "volume": 12000 },
        { "date": "2026-01-08", "volume": 13500 }
      ]
    }
  }
}
```

---

### 45. **GET** `/analytics/trainees/:id/report`
**Purpose:** Get detailed trainee report  
**Auth:** Required  
**RBAC:** **Trainer Only**

**Query Parameters:**
- `period` (string): 30d, 90d, 1y (default: 30d)

**Request:**
```
GET /analytics/trainees/uuid/report?period=90d
```

**Response:**
```json
{
  "success": true,
  "data": {
    "trainee": {
      "id": "uuid",
      "name": "Jane Doe",
      "email": "trainee@example.com"
    },
    "period": "90d",
    "summary": {
      "totalWorkouts": 28,
      "totalDuration": 1680,
      "avgRating": 4.7,
      "consistency": 82,
      "currentStreak": 9
    },
    "strengthProgress": {
      "totalVolume": 75000,
      "avgVolume": 2678,
      "topExercises": [...]
    },
    "cardioProgress": {
      "totalDistance": 156.5,
      "totalCalories": 12500
    },
    "bodyComposition": {
      "startWeight": 74.5,
      "currentWeight": 72.5,
      "change": -2.0
    },
    "achievements": [
      {
        "title": "First PR",
        "date": "2025-12-15"
      }
    ],
    "recommendations": [
      "Increase core stability exercises",
      "Focus on mobility work"
    ]
  }
}
```

---

### 46. **GET** `/analytics/exercises/stats`
**Purpose:** Get exercise statistics  
**Auth:** Required  
**RBAC:** **Trainer Only**

**Query Parameters:**
- `period` (string): 30d, 90d, 1y, all (default: 30d)
- `type` (string): Filter by exercise type

**Request:**
```
GET /analytics/exercises/stats?period=30d&type=weight_training
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "30d",
    "totalExercises": 250,
    "mostPopular": [
      {
        "name": "Squat",
        "count": 125,
        "avgWeight": 92,
        "totalVolume": 287500
      },
      {
        "name": "Bench Press",
        "count": 98,
        "avgWeight": 72,
        "totalVolume": 176400
      }
    ],
    "byType": {
      "weight_training": 180,
      "cardio": 50,
      "flexibility": 20
    },
    "byCategory": {
      "Legs": 75,
      "Chest": 45,
      "Back": 40
    }
  }
}
```

---

## ⚙️ Settings APIs (2 Endpoints)

### 47. **GET** `/settings`
**Purpose:** Get user settings  
**Auth:** Required  
**RBAC:** Authenticated (own only)

**Response:**
```json
{
  "success": true,
  "data": {
    "theme": "dark",
    "language": "th",
    "notificationSettings": {
      "email": true,
      "push": true,
      "sms": false
    },
    "privacySettings": {
      "profileVisibility": "private",
      "showStats": false
    },
    "weightUnit": "kg",
    "distanceUnit": "km",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2026-01-24T20:00:00Z"
  }
}
```

---

### 48. **PATCH** `/settings`
**Purpose:** Update user settings  
**Auth:** Required  
**RBAC:** Authenticated (own only)

**Request Body:**
```json
{
  "theme": "dark",
  "language": "en",
  "weightUnit": "lbs",
  "distanceUnit": "miles"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "theme": "dark",
    "language": "en",
    "weightUnit": "lbs",
    "distanceUnit": "miles",
    "updatedAt": "2026-01-24T20:05:00Z"
  }
}
```

---

## 🧪 Health Check APIs (2 Endpoints)

### 49. **GET** `/health`
**Purpose:** Check API health status  
**Auth:** None (Public)  
**RBAC:** Public

**Response:**
```json
{
  "status": "ok",
  "timestamp": 1737724800,
  "services": {
    "database": "healthy",
    "redis": "healthy"
  },
  "version": "1.0.0"
}
```

---

### 50. **GET** `/info`
**Purpose:** Get API information  
**Auth:** None (Public)  
**RBAC:** Public

**Response:**
```json
{
  "name": "Fitness Management API",
  "version": "1.0.0",
  "environment": "production",
  "documentation": "https://api.fitness.com/docs",
  "support": "support@fitness.com"
}
```

---

## 🔗 Webhook APIs (7 Endpoints)

### 51. **POST** `/webhooks`
**Purpose:** Create webhook  
**Auth:** Required  
**RBAC:** **Trainer Only**

**Request Body:**
```json
{
  "url": "https://example.com/webhook",
  "events": [
    "schedule.created",
    "workout.logged",
    "session_card.created"
  ],
  "secret": "your-webhook-secret"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "url": "https://example.com/webhook",
    "events": [...],
    "isActive": true,
    "createdAt": "2026-01-24T20:30:00Z"
  }
}
```

---

### 52. **GET** `/webhooks`
**Purpose:** List webhooks  
**Auth:** Required  
**RBAC:** **Trainer Only** (own only)

**Response:**
```json
{
  "success": true,
  "data": {
    "webhooks": [
      {
        "id": "uuid",
        "url": "https://example.com/webhook",
        "events": [...],
        "isActive": true,
        "createdAt": "2026-01-24T20:30:00Z"
      }
    ]
  }
}
```

---

### 53. **GET** `/webhooks/:id`
**Purpose:** Get webhook details  
**Auth:** Required  
**RBAC:** **Trainer Only** (own only)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "url": "https://example.com/webhook",
    "events": [...],
    "isActive": true,
    "deliveryStats": {
      "totalDeliveries": 125,
      "successfulDeliveries": 120,
      "failedDeliveries": 5,
      "lastDeliveryAt": "2026-01-24T19:00:00Z"
    },
    "createdAt": "2026-01-24T20:30:00Z"
  }
}
```

---

### 54. **PATCH** `/webhooks/:id`
**Purpose:** Update webhook  
**Auth:** Required  
**RBAC:** **Trainer Only** (own only)

**Request Body:**
```json
{
  "url": "https://newurl.com/webhook",
  "events": ["schedule.created"],
  "isActive": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "url": "https://newurl.com/webhook",
    "isActive": false,
    "updatedAt": "2026-01-24T20:35:00Z"
  }
}
```

---

### 55. **DELETE** `/webhooks/:id`
**Purpose:** Delete webhook  
**Auth:** Required  
**RBAC:** **Trainer Only** (own only)

**Response:**
```json
{
  "success": true,
  "message": "Webhook deleted successfully"
}
```

---

### 56. **POST** `/webhooks/:id/test`
**Purpose:** Test webhook delivery  
**Auth:** Required  
**RBAC:** **Trainer Only** (own only)

**Response:**
```json
{
  "success": true,
  "data": {
    "delivered": true,
    "statusCode": 200,
    "responseTime": 125,
    "testedAt": "2026-01-24T20:40:00Z"
  }
}
```

---

### 57. **GET** `/webhooks/:id/deliveries`
**Purpose:** Get webhook delivery logs  
**Auth:** Required  
**RBAC:** **Trainer Only** (own only)

**Query Parameters:**
- `page` (int): Page number
- `limit` (int): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "deliveries": [
      {
        "id": "uuid",
        "event": "schedule.created",
        "statusCode": 200,
        "responseTime": 125,
        "success": true,
        "deliveredAt": "2026-01-24T19:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 125,
      "totalPages": 7
    }
  }
}
```

---

## 🔒 Error Responses

### Standard Error Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ],
    "statusCode": 400
  }
}
```

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |
| `TRAINEE_READONLY` | 403 | Trainee cannot modify data |

---

## 🔐 RBAC Permission Matrix

| Endpoint | Trainee | Trainer |
|----------|---------|---------|
| **Auth** | ✅ All | ✅ All |
| **Users - Read** | ✅ Self | ✅ All |
| **Users - Write** | ✅ Self (limited) | ✅ All |
| **Schedules - Read** | ✅ Self | ✅ All |
| **Schedules - Write** | ❌ | ✅ |
| **Workouts - Read** | ✅ Self | ✅ All |
| **Workouts - Write** | ❌ | ✅ |
| **Exercises - Read** | ✅ All | ✅ All |
| **Exercises - Write** | ❌ | ✅ |
| **Session Cards - Read** | ✅ Self | ✅ All |
| **Session Cards - Write** | ❌ | ✅ |
| **Progress - Read** | ✅ Self | ✅ All |
| **Progress - Write** | ❌ | ✅ (body weight) |
| **Notifications - Read** | ✅ Self | ✅ Self |
| **Notifications - Write** | ✅ Self (mark read) | ✅ Self (mark read) |
| **Analytics** | ❌ | ✅ |
| **Settings** | ✅ Self | ✅ Self |
| **Webhooks** | ❌ | ✅ Self |

---

## 📦 Postman Collection

Download: [fitness-api-postman-collection.json](./postman/fitness-api.json)

**Environment Variables:**
```json
{
  "baseUrl": "http://localhost:8080/api/v1",
  "accessToken": "",
  "refreshToken": "",
  "traineeId": "",
  "trainerId": ""
}
```

---

**Created by**: Figma Make AI Assistant  
**Date**: 24 มกราคม 2026  
**Version**: 1.0.0  
**Total APIs**: 57 endpoints
