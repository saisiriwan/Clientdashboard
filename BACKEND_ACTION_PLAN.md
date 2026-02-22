# 🎯 แผนการพัฒนา Backend - ขั้นตอนละเอียด

## 📋 สรุปภาพรวม

**ระบบ:** Fitness Management System (Trainee Dashboard - READ-ONLY)  
**Backend Tech Stack:** Go + Gin Framework + GORM + PostgreSQL  
**ระยะเวลาโดยรวม:** 8-10 สัปดาห์  
**จำนวน API ทั้งหมด:** 57 endpoints  
**Database Tables:** 15 tables, 47 indexes, 8 triggers

---

## 🚀 แผนการพัฒนาแบบ 4 เฟส

```
Week 1-2  →  Week 3-4  →  Week 5-6  →  Week 7-8+
 Phase 1      Phase 2      Phase 3      Phase 4
   (P0)         (P0)         (P1)         (P2)
12 APIs      12 APIs      15 APIs      18 APIs
Foundation    Core       Enhanced    Advanced
```

---

# 📅 Phase 1: Foundation (Week 1-2) - 12 APIs

## 🎯 เป้าหมาย
ผู้ใช้สามารถ **Login ด้วย Google** และ **ดู/แก้ไขโปรไฟล์** ได้

## ✅ สิ่งที่ต้องทำ

### 1️⃣ **Setup โปรเจค (Day 1-2)**

#### A. สร้างโครงสร้างโปรเจค
```bash
fitness-backend/
├── cmd/
│   └── server/
│       └── main.go              # Entrypoint
├── internal/
│   ├── config/                  # Configuration
│   ├── models/                  # Database models (GORM)
│   ├── repositories/            # Data layer
│   ├── services/                # Business logic
│   ├── handlers/                # HTTP handlers (Gin)
│   ├── middleware/              # Auth, RBAC, Rate limiting
│   └── utils/                   # Helpers
├── migrations/                  # SQL migrations
├── tests/                       # Unit & Integration tests
├── docs/                        # API documentation
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── go.mod
└── README.md
```

#### B. ติดตั้ง Dependencies
```bash
# Initialize Go module
go mod init github.com/yourname/fitness-backend

# Core dependencies
go get -u github.com/gin-gonic/gin
go get -u gorm.io/gorm
go get -u gorm.io/driver/postgres
go get -u github.com/joho/godotenv

# Authentication
go get -u github.com/golang-jwt/jwt/v5
go get -u golang.org/x/oauth2
go get -u golang.org/x/oauth2/google

# Utilities
go get -u github.com/rs/zerolog
go get -u github.com/go-playground/validator/v10

# Testing
go get -u github.com/stretchr/testify
go get -u github.com/DATA-DOG/go-sqlmock
```

#### C. Setup Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: fitness_db
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secretpassword
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build: .
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: postgresql://admin:secretpassword@postgres:5432/fitness_db
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
  redis_data:
```

#### D. Environment Variables
```bash
# .env.example
# Server
PORT=8080
ENV=development

# Database
DATABASE_URL=postgresql://admin:secretpassword@localhost:5432/fitness_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URL=http://localhost:8080/api/v1/auth/google/callback

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=1m
```

---

### 2️⃣ **สร้าง Database Schema (Day 2-3)**

#### A. ตาราง users (หลัก)
```sql
-- migrations/001_create_users_table.sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  avatar TEXT,
  role VARCHAR(20) NOT NULL CHECK (role IN ('trainer', 'trainee')),
  google_id VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(10),
  height DECIMAL(5,2),
  weight DECIMAL(5,2),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
```

#### B. ตาราง user_sessions
```sql
-- migrations/002_create_sessions_table.sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token VARCHAR(500) NOT NULL UNIQUE,
  access_token VARCHAR(500) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_refresh ON user_sessions(refresh_token);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);
```

#### C. รัน Migrations
```bash
# Option 1: Using GORM AutoMigrate
# internal/database/migrate.go

# Option 2: Using golang-migrate
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
migrate -path migrations -database "postgresql://admin:secretpassword@localhost:5432/fitness_db?sslmode=disable" up
```

---

### 3️⃣ **Authentication APIs (Day 3-5) - 5 APIs**

#### API #1: GET `/api/v1/auth/google`
**วัตถุประสงค์:** เริ่ม Google OAuth flow

**Handler:**
```go
// internal/handlers/auth_handler.go
package handlers

import (
    "github.com/gin-gonic/gin"
    "golang.org/x/oauth2"
)

type AuthHandler struct {
    googleOAuthConfig *oauth2.Config
    authService       *services.AuthService
}

// InitiateGoogleAuth - สร้าง OAuth URL
func (h *AuthHandler) InitiateGoogleAuth(c *gin.Context) {
    state := generateRandomState() // สุ่ม state สำหรับ CSRF protection
    
    // เก็บ state ใน session/cookie
    c.SetSameSite(http.SameSiteLaxMode)
    c.SetCookie("oauth_state", state, 600, "/", "", false, true)
    
    url := h.googleOAuthConfig.AuthCodeURL(state, oauth2.AccessTypeOffline)
    
    c.JSON(200, gin.H{
        "success": true,
        "data": gin.H{
            "authUrl": url,
        },
    })
}
```

**Test:**
```bash
curl http://localhost:8080/api/v1/auth/google
# Response: { "success": true, "data": { "authUrl": "https://accounts.google.com/..." } }
```

---

#### API #2: POST `/api/v1/auth/google/callback`
**วัตถุประสงค์:** รับ callback จาก Google, สร้าง user, issue JWT

**Handler:**
```go
func (h *AuthHandler) GoogleCallback(c *gin.Context) {
    // 1. ตรวจสอบ state
    code := c.Query("code")
    state := c.Query("state")
    savedState, _ := c.Cookie("oauth_state")
    
    if state != savedState {
        c.JSON(400, gin.H{"error": "Invalid state"})
        return
    }
    
    // 2. แลก code เป็น token
    token, err := h.googleOAuthConfig.Exchange(c, code)
    if err != nil {
        c.JSON(401, gin.H{"error": "Failed to exchange token"})
        return
    }
    
    // 3. ดึงข้อมูล Google profile
    userInfo, err := h.authService.GetGoogleUserInfo(token.AccessToken)
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to get user info"})
        return
    }
    
    // 4. สร้าง/อัปเดต user ใน DB
    user, err := h.authService.FindOrCreateUser(userInfo)
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to create user"})
        return
    }
    
    // 5. สร้าง JWT tokens
    accessToken, refreshToken, err := h.authService.GenerateTokens(user)
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to generate tokens"})
        return
    }
    
    // 6. บันทึก session
    err = h.authService.CreateSession(user.ID, refreshToken, c.ClientIP(), c.Request.UserAgent())
    
    // 7. Set HTTP-only cookie
    c.SetSameSite(http.SameSiteStrictMode)
    c.SetCookie("refresh_token", refreshToken, 7*24*60*60, "/", "", true, true)
    
    c.JSON(200, gin.H{
        "success": true,
        "data": gin.H{
            "accessToken":  accessToken,
            "refreshToken": refreshToken,
            "user":         user,
        },
    })
}
```

---

#### API #3: POST `/api/v1/auth/refresh`
**วัตถุประสงค์:** Refresh access token

**Handler:**
```go
func (h *AuthHandler) RefreshToken(c *gin.Context) {
    refreshToken := c.GetHeader("X-Refresh-Token")
    if refreshToken == "" {
        refreshToken, _ = c.Cookie("refresh_token")
    }
    
    if refreshToken == "" {
        c.JSON(401, gin.H{"error": "Refresh token required"})
        return
    }
    
    // ตรวจสอบ refresh token
    session, err := h.authService.ValidateRefreshToken(refreshToken)
    if err != nil {
        c.JSON(401, gin.H{"error": "Invalid refresh token"})
        return
    }
    
    // ดึงข้อมูล user
    user, _ := h.authService.GetUserByID(session.UserID)
    
    // สร้าง access token ใหม่
    accessToken, err := h.authService.GenerateAccessToken(user)
    
    c.JSON(200, gin.H{
        "success": true,
        "data": gin.H{
            "accessToken": accessToken,
        },
    })
}
```

---

#### API #4: POST `/api/v1/auth/logout`
**วัตถุประสงค์:** Logout user, ลบ session

**Handler:**
```go
func (h *AuthHandler) Logout(c *gin.Context) {
    refreshToken, _ := c.Cookie("refresh_token")
    
    // ลบ session จาก DB
    h.authService.DeleteSession(refreshToken)
    
    // ลบ cookie
    c.SetCookie("refresh_token", "", -1, "/", "", true, true)
    
    c.JSON(200, gin.H{
        "success": true,
        "message": "Logged out successfully",
    })
}
```

---

#### API #5: GET `/api/v1/auth/verify`
**วัตถุประสงค์:** ตรวจสอบ access token

**Handler:**
```go
func (h *AuthHandler) VerifyToken(c *gin.Context) {
    // Middleware จะ validate token แล้ว
    user := c.MustGet("user").(models.User)
    
    c.JSON(200, gin.H{
        "success": true,
        "data": gin.H{
            "valid": true,
            "user":  user,
        },
    })
}
```

---

### 4️⃣ **User Management APIs (Day 5-7) - 5 APIs**

#### API #6: GET `/api/v1/users/me`
**วัตถุประสงค์:** ดูโปรไฟล์ตัวเอง

```go
func (h *UserHandler) GetCurrentUser(c *gin.Context) {
    user := c.MustGet("user").(models.User)
    
    c.JSON(200, gin.H{
        "success": true,
        "data": user,
    })
}
```

---

#### API #7: PATCH `/api/v1/users/me`
**วัตถุประสงค์:** แก้ไขโปรไฟล์ตัวเอง (ยกเว้นสำหรับ Trainee)

```go
type UpdateProfileRequest struct {
    Name        string   `json:"name" validate:"omitempty,min=2,max=255"`
    Phone       string   `json:"phone" validate:"omitempty,e164"`
    Avatar      string   `json:"avatar" validate:"omitempty,url"`
    DateOfBirth string   `json:"dateOfBirth" validate:"omitempty,datetime=2006-01-02"`
    Gender      string   `json:"gender" validate:"omitempty,oneof=male female other"`
    Height      float64  `json:"height" validate:"omitempty,gt=0,lt=300"`
    Weight      float64  `json:"weight" validate:"omitempty,gt=0,lt=500"`
}

func (h *UserHandler) UpdateCurrentUser(c *gin.Context) {
    user := c.MustGet("user").(models.User)
    
    var req UpdateProfileRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    
    // ตรวจสอบว่า Trainee ไม่สามารถแก้ไข role หรือ email
    if user.Role == "trainee" {
        // อนุญาตเฉพาะฟิลด์ที่กำหนด
    }
    
    updatedUser, err := h.userService.UpdateUser(user.ID, req)
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to update user"})
        return
    }
    
    c.JSON(200, gin.H{
        "success": true,
        "data": updatedUser,
    })
}
```

---

#### API #8: GET `/api/v1/users/:userId`
**วัตถุประสงค์:** ดูข้อมูล user อื่น (Trainer only)

```go
func (h *UserHandler) GetUser(c *gin.Context) {
    userID := c.Param("userId")
    
    user, err := h.userService.GetUserByID(userID)
    if err != nil {
        c.JSON(404, gin.H{"error": "User not found"})
        return
    }
    
    c.JSON(200, gin.H{
        "success": true,
        "data": user,
    })
}
```

---

#### API #9: GET `/api/v1/users`
**วัตถุประสงค์:** ดูรายการ users (Trainer only)

```go
func (h *UserHandler) ListUsers(c *gin.Context) {
    role := c.Query("role")       // filter by role
    page := c.DefaultQuery("page", "1")
    limit := c.DefaultQuery("limit", "20")
    
    users, total, err := h.userService.ListUsers(role, page, limit)
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to fetch users"})
        return
    }
    
    c.JSON(200, gin.H{
        "success": true,
        "data": gin.H{
            "users": users,
            "total": total,
            "page":  page,
            "limit": limit,
        },
    })
}
```

---

#### API #10: GET `/api/v1/users/:userId/stats`
**วัตถุประสงค์:** ดูสถิติของ user

```go
func (h *UserHandler) GetUserStats(c *gin.Context) {
    currentUser := c.MustGet("user").(models.User)
    userID := c.Param("userId")
    
    // Trainee ดูได้เฉพาะของตัวเอง
    if currentUser.Role == "trainee" && userID != currentUser.ID.String() {
        c.JSON(403, gin.H{"error": "Forbidden"})
        return
    }
    
    stats, err := h.userService.GetUserStats(userID)
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to fetch stats"})
        return
    }
    
    c.JSON(200, gin.H{
        "success": true,
        "data": stats,
    })
}
```

---

### 5️⃣ **Middleware (Day 7-8)**

#### A. Authentication Middleware
```go
// internal/middleware/auth.go
func RequireAuth() gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.JSON(401, gin.H{"error": "Authorization header required"})
            c.Abort()
            return
        }
        
        // Extract token
        tokenString := strings.TrimPrefix(authHeader, "Bearer ")
        
        // Validate JWT
        token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
            return []byte(os.Getenv("JWT_SECRET")), nil
        })
        
        if err != nil || !token.Valid {
            c.JSON(401, gin.H{"error": "Invalid token"})
            c.Abort()
            return
        }
        
        // Extract user from claims
        claims := token.Claims.(jwt.MapClaims)
        userID := claims["user_id"].(string)
        
        // Fetch user from DB
        user, err := userRepo.GetByID(userID)
        if err != nil {
            c.JSON(401, gin.H{"error": "User not found"})
            c.Abort()
            return
        }
        
        // Set user in context
        c.Set("user", user)
        c.Next()
    }
}
```

---

#### B. RBAC Middleware
```go
// internal/middleware/rbac.go
func RequireRole(allowedRoles ...string) gin.HandlerFunc {
    return func(c *gin.Context) {
        user := c.MustGet("user").(models.User)
        
        allowed := false
        for _, role := range allowedRoles {
            if user.Role == role {
                allowed = true
                break
            }
        }
        
        if !allowed {
            c.JSON(403, gin.H{
                "error": "Insufficient permissions",
                "code":  "FORBIDDEN",
            })
            c.Abort()
            return
        }
        
        c.Next()
    }
}
```

---

#### C. Trainee Read-Only Middleware
```go
// internal/middleware/trainee_readonly.go
func EnforceTraineeReadOnly() gin.HandlerFunc {
    return func(c *gin.Context) {
        user := c.MustGet("user").(models.User)
        method := c.Request.Method
        path := c.FullPath()
        
        if user.Role == "trainee" {
            // ข้อยกเว้น: อนุญาต endpoints บางตัว
            allowedPaths := map[string][]string{
                "PATCH": {
                    "/api/v1/users/me",
                    "/api/v1/notifications/:id/read",
                    "/api/v1/notifications/read-all",
                    "/api/v1/notifications/settings",
                    "/api/v1/settings",
                },
                "DELETE": {
                    "/api/v1/notifications/:id",
                },
            }
            
            if allowed, ok := allowedPaths[method]; ok {
                for _, allowedPath := range allowed {
                    if matchPath(path, allowedPath) {
                        c.Next()
                        return
                    }
                }
            }
            
            // Block CREATE/UPDATE/DELETE
            if method == "POST" || method == "PUT" || method == "PATCH" || method == "DELETE" {
                c.JSON(403, gin.H{
                    "error": "Trainee can only view data. Cannot create, update, or delete.",
                    "code":  "TRAINEE_READONLY",
                })
                c.Abort()
                return
            }
        }
        
        c.Next()
    }
}
```

---

#### D. Rate Limiting Middleware
```go
// internal/middleware/rate_limit.go
import "github.com/ulule/limiter/v3"

func RateLimit() gin.HandlerFunc {
    rate := limiter.Rate{
        Period: 1 * time.Minute,
        Limit:  100,
    }
    
    store := memory.NewStore()
    instance := limiter.New(store, rate)
    
    return func(c *gin.Context) {
        key := c.ClientIP()
        context, err := instance.Get(c, key)
        
        if err != nil {
            c.JSON(500, gin.H{"error": "Rate limit error"})
            c.Abort()
            return
        }
        
        c.Header("X-RateLimit-Limit", strconv.FormatInt(context.Limit, 10))
        c.Header("X-RateLimit-Remaining", strconv.FormatInt(context.Remaining, 10))
        c.Header("X-RateLimit-Reset", strconv.FormatInt(context.Reset, 10))
        
        if context.Reached {
            c.JSON(429, gin.H{
                "error": "Rate limit exceeded",
                "code":  "RATE_LIMIT_EXCEEDED",
            })
            c.Abort()
            return
        }
        
        c.Next()
    }
}
```

---

### 6️⃣ **Health Check APIs (Day 8) - 2 APIs**

#### API #51: GET `/api/v1/health`
```go
func (h *HealthHandler) Health(c *gin.Context) {
    // ตรวจสอบ Database
    dbStatus := "healthy"
    if err := db.Ping(); err != nil {
        dbStatus = "unhealthy"
    }
    
    // ตรวจสอบ Redis
    redisStatus := "healthy"
    if err := redisClient.Ping(c).Err(); err != nil {
        redisStatus = "unhealthy"
    }
    
    c.JSON(200, gin.H{
        "status": "ok",
        "timestamp": time.Now().Unix(),
        "services": gin.H{
            "database": dbStatus,
            "redis":    redisStatus,
        },
    })
}
```

---

#### API #52: GET `/api/v1/info`
```go
func (h *HealthHandler) Info(c *gin.Context) {
    c.JSON(200, gin.H{
        "name":    "Fitness Management API",
        "version": "1.0.0",
        "env":     os.Getenv("ENV"),
        "docs":    "https://api.fitness.com/docs",
    })
}
```

---

### 7️⃣ **Routes Setup (Day 8)**

```go
// internal/routes/routes.go
package routes

import (
    "github.com/gin-gonic/gin"
    "fitness-backend/internal/handlers"
    "fitness-backend/internal/middleware"
)

func SetupRoutes(r *gin.Engine, handlers *handlers.Handlers) {
    // Global middleware
    r.Use(gin.Logger())
    r.Use(gin.Recovery())
    r.Use(middleware.CORS())
    r.Use(middleware.RateLimit())
    
    // API v1
    v1 := r.Group("/api/v1")
    
    // Public routes
    health := v1.Group("/health")
    {
        health.GET("", handlers.Health.Health)
        health.GET("/info", handlers.Health.Info)
    }
    
    // Auth routes (public)
    auth := v1.Group("/auth")
    {
        auth.GET("/google", handlers.Auth.InitiateGoogleAuth)
        auth.POST("/google/callback", handlers.Auth.GoogleCallback)
        auth.POST("/refresh", handlers.Auth.RefreshToken)
        auth.POST("/logout", middleware.RequireAuth(), handlers.Auth.Logout)
        auth.GET("/verify", middleware.RequireAuth(), handlers.Auth.VerifyToken)
    }
    
    // Protected routes
    protected := v1.Group("")
    protected.Use(middleware.RequireAuth())
    protected.Use(middleware.EnforceTraineeReadOnly())
    
    // Users
    users := protected.Group("/users")
    {
        users.GET("/me", handlers.User.GetCurrentUser)
        users.PATCH("/me", handlers.User.UpdateCurrentUser)
        users.GET("/:userId", middleware.RequireRole("trainer"), handlers.User.GetUser)
        users.GET("", middleware.RequireRole("trainer"), handlers.User.ListUsers)
        users.GET("/:userId/stats", handlers.User.GetUserStats)
    }
}
```

---

### 8️⃣ **Testing (Day 9-10)**

#### A. Unit Tests
```go
// internal/services/auth_service_test.go
func TestGenerateTokens(t *testing.T) {
    service := NewAuthService()
    user := &models.User{
        ID:    uuid.New(),
        Email: "test@example.com",
        Role:  "trainee",
    }
    
    accessToken, refreshToken, err := service.GenerateTokens(user)
    
    assert.NoError(t, err)
    assert.NotEmpty(t, accessToken)
    assert.NotEmpty(t, refreshToken)
}
```

#### B. Integration Tests (Postman/Thunder Client)
```json
// tests/postman/auth.json
{
  "info": {
    "name": "Fitness API - Authentication",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Initiate Google Auth",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/v1/auth/google"
      },
      "event": [{
        "listen": "test",
        "script": {
          "exec": [
            "pm.test(\"Status is 200\", () => {",
            "    pm.response.to.have.status(200);",
            "});",
            "pm.test(\"Has authUrl\", () => {",
            "    const json = pm.response.json();",
            "    pm.expect(json.data.authUrl).to.exist;",
            "});"
          ]
        }
      }]
    }
  ]
}
```

---

## 📦 Phase 1 Deliverables

### ✅ Checklist

- [ ] โปรเจค Go + Gin setup เรียบร้อย
- [ ] Docker Compose สำหรับ PostgreSQL + Redis
- [ ] Database schema (users, user_sessions) + migrations
- [ ] Authentication APIs (5) ใช้งานได้
- [ ] User Management APIs (5) ใช้งานได้
- [ ] Health Check APIs (2) ใช้งานได้
- [ ] Middleware: Auth, RBAC, Rate Limiting, Trainee Read-Only
- [ ] Unit tests สำหรับ core logic
- [ ] Postman collection สำหรับ manual testing
- [ ] Documentation (README, API docs)

### 🎯 Success Criteria

1. ✅ ผู้ใช้สามารถ Login ด้วย Google Account
2. ✅ ระบบสร้าง User ใหม่หรืออัปเดต User ที่มีอยู่
3. ✅ ระบบออก JWT Access Token (15 นาที) และ Refresh Token (7 วัน)
4. ✅ ผู้ใช้สามารถดูและแก้ไขโปรไฟล์ของตัวเอง
5. ✅ Trainee ไม่สามารถแก้ไข role หรือ email
6. ✅ Trainer สามารถดูข้อมูล users อื่นได้
7. ✅ Rate limiting ทำงาน (100 requests/minute)
8. ✅ Health check endpoint ตอบกลับปกติ

---

# 📅 Phase 2: Core Features (Week 3-4) - 12 APIs

## 🎯 เป้าหมาย
**Trainer สามารถสร้างตารางนัดและบันทึกผลการฝึก ได้**  
**Trainee สามารถดูตารางนัดและประวัติการฝึกของตัวเอง (READ-ONLY)**

---

## ✅ สิ่งที่ต้องทำ

### 1️⃣ **สร้าง Database Tables (Day 1-2)**

#### A. ตาราง schedules
```sql
-- migrations/003_create_schedules_table.sql
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration INTEGER NOT NULL, -- minutes
  location VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_schedules_trainee ON schedules(trainee_id);
CREATE INDEX idx_schedules_trainer ON schedules(trainer_id);
CREATE INDEX idx_schedules_date ON schedules(date);
CREATE INDEX idx_schedules_status ON schedules(status);
CREATE INDEX idx_schedules_datetime ON schedules(date, start_time);
```

#### B. ตาราง workouts
```sql
-- migrations/004_create_workouts_table.sql
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  duration INTEGER NOT NULL, -- minutes
  exercises JSONB NOT NULL, -- array of exercise objects
  summary JSONB NOT NULL,   -- { totalSets, totalReps, totalWeight, totalDistance, etc. }
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  mood VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_workouts_trainee ON workouts(trainee_id);
CREATE INDEX idx_workouts_trainer ON workouts(trainer_id);
CREATE INDEX idx_workouts_schedule ON workouts(schedule_id);
CREATE INDEX idx_workouts_date ON workouts(date);
CREATE INDEX idx_workouts_rating ON workouts(rating);
```

**JSONB Structure for exercises:**
```json
{
  "exercises": [
    {
      "name": "Squat",
      "type": "weight_training",
      "isBodyweight": false,
      "sets": [
        { "setNumber": 1, "weight": 100, "reps": 8, "rest": 90 },
        { "setNumber": 2, "weight": 100, "reps": 8, "rest": 90 }
      ]
    },
    {
      "name": "Running",
      "type": "cardio",
      "sets": [
        { "distance": 5.2, "duration": 27.5, "pace": 5.29, "calories": 416 }
      ]
    }
  ]
}
```

---

### 2️⃣ **Schedule Management APIs (Day 3-5) - 6 APIs**

#### API #13: POST `/api/v1/schedules` (Trainer Only)
**วัตถุประสงค์:** สร้างตารางนัดใหม่

```go
type CreateScheduleRequest struct {
    TraineeID string `json:"traineeId" validate:"required,uuid"`
    Title     string `json:"title" validate:"required,min=3,max=255"`
    Date      string `json:"date" validate:"required,datetime=2006-01-02"`
    StartTime string `json:"startTime" validate:"required,datetime=15:04"`
    EndTime   string `json:"endTime" validate:"required,datetime=15:04"`
    Location  string `json:"location" validate:"required"`
    Notes     string `json:"notes" validate:"omitempty,max=1000"`
}

func (h *ScheduleHandler) CreateSchedule(c *gin.Context) {
    trainer := c.MustGet("user").(models.User)
    
    var req CreateScheduleRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    
    // ตรวจสอบว่า trainee มีอยู่จริง
    trainee, err := h.userService.GetUserByID(req.TraineeID)
    if err != nil || trainee.Role != "trainee" {
        c.JSON(400, gin.H{"error": "Invalid trainee"})
        return
    }
    
    // คำนวณ duration
    start, _ := time.Parse("15:04", req.StartTime)
    end, _ := time.Parse("15:04", req.EndTime)
    duration := int(end.Sub(start).Minutes())
    
    // สร้าง schedule
    schedule := &models.Schedule{
        TraineeID: uuid.MustParse(req.TraineeID),
        TrainerID: trainer.ID,
        Title:     req.Title,
        Date:      req.Date,
        StartTime: req.StartTime,
        EndTime:   req.EndTime,
        Duration:  duration,
        Location:  req.Location,
        Status:    "pending",
        Notes:     req.Notes,
    }
    
    created, err := h.scheduleService.Create(schedule)
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to create schedule"})
        return
    }
    
    c.JSON(201, gin.H{
        "success": true,
        "data":    created,
    })
}
```

---

#### API #14: GET `/api/v1/schedules`
**วัตถุประสงค์:** ดูรายการนัด (กรองตาม role)

```go
func (h *ScheduleHandler) ListSchedules(c *gin.Context) {
    user := c.MustGet("user").(models.User)
    
    // Query parameters
    status := c.Query("status")
    startDate := c.Query("startDate")
    endDate := c.Query("endDate")
    page := c.DefaultQuery("page", "1")
    limit := c.DefaultQuery("limit", "20")
    
    var schedules []models.Schedule
    var total int64
    
    // Trainee ดูเฉพาะของตัวเอง
    if user.Role == "trainee" {
        schedules, total, _ = h.scheduleService.GetByTraineeID(user.ID, status, startDate, endDate, page, limit)
    } else {
        // Trainer ดูทั้งหมด (หรือกรองตาม traineeId)
        traineeID := c.Query("traineeId")
        schedules, total, _ = h.scheduleService.GetByTrainerID(user.ID, traineeID, status, startDate, endDate, page, limit)
    }
    
    c.JSON(200, gin.H{
        "success": true,
        "data": gin.H{
            "schedules": schedules,
            "total":     total,
            "page":      page,
            "limit":     limit,
        },
    })
}
```

---

#### API #15: GET `/api/v1/schedules/:id`
**วัตถุประสงค์:** ดูรายละเอียดนัดเดียว

```go
func (h *ScheduleHandler) GetSchedule(c *gin.Context) {
    user := c.MustGet("user").(models.User)
    scheduleID := c.Param("id")
    
    schedule, err := h.scheduleService.GetByID(scheduleID)
    if err != nil {
        c.JSON(404, gin.H{"error": "Schedule not found"})
        return
    }
    
    // Trainee ดูได้เฉพาะของตัวเอง
    if user.Role == "trainee" && schedule.TraineeID != user.ID {
        c.JSON(403, gin.H{"error": "Forbidden"})
        return
    }
    
    c.JSON(200, gin.H{
        "success": true,
        "data":    schedule,
    })
}
```

---

#### API #16: PATCH `/api/v1/schedules/:id` (Trainer Only)
**วัตถุประสงค์:** แก้ไขนัด

```go
type UpdateScheduleRequest struct {
    Title     string `json:"title" validate:"omitempty,min=3,max=255"`
    Date      string `json:"date" validate:"omitempty,datetime=2006-01-02"`
    StartTime string `json:"startTime" validate:"omitempty,datetime=15:04"`
    EndTime   string `json:"endTime" validate:"omitempty,datetime=15:04"`
    Location  string `json:"location" validate:"omitempty"`
    Notes     string `json:"notes" validate:"omitempty,max=1000"`
}

func (h *ScheduleHandler) UpdateSchedule(c *gin.Context) {
    scheduleID := c.Param("id")
    
    var req UpdateScheduleRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    
    updated, err := h.scheduleService.Update(scheduleID, req)
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to update schedule"})
        return
    }
    
    c.JSON(200, gin.H{
        "success": true,
        "data":    updated,
    })
}
```

---

#### API #17: PATCH `/api/v1/schedules/:id/status` (Trainer Only)
**วัตถุประสงค์:** เปลี่ยนสถานะนัด

```go
type UpdateStatusRequest struct {
    Status string `json:"status" validate:"required,oneof=pending confirmed completed cancelled"`
}

func (h *ScheduleHandler) UpdateStatus(c *gin.Context) {
    scheduleID := c.Param("id")
    
    var req UpdateStatusRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    
    updated, err := h.scheduleService.UpdateStatus(scheduleID, req.Status)
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to update status"})
        return
    }
    
    c.JSON(200, gin.H{
        "success": true,
        "data":    updated,
    })
}
```

---

#### API #18: DELETE `/api/v1/schedules/:id` (Trainer Only)
**วัตถุประสงค์:** ลบนัด

```go
func (h *ScheduleHandler) DeleteSchedule(c *gin.Context) {
    scheduleID := c.Param("id")
    
    err := h.scheduleService.Delete(scheduleID)
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to delete schedule"})
        return
    }
    
    c.JSON(200, gin.H{
        "success": true,
        "message": "Schedule deleted successfully",
    })
}
```

---

### 3️⃣ **Workout Management APIs (Day 6-8) - 6 APIs**

#### API #19: POST `/api/v1/workouts` (Trainer Only)
**วัตถุประสงค์:** บันทึกผลการฝึก

```go
type CreateWorkoutRequest struct {
    TraineeID  string                   `json:"traineeId" validate:"required,uuid"`
    ScheduleID string                   `json:"scheduleId" validate:"omitempty,uuid"`
    Date       string                   `json:"date" validate:"required,datetime=2006-01-02"`
    Duration   int                      `json:"duration" validate:"required,gt=0"`
    Exercises  []WorkoutExercise        `json:"exercises" validate:"required,min=1,dive"`
    Notes      string                   `json:"notes" validate:"omitempty,max=2000"`
    Rating     int                      `json:"rating" validate:"omitempty,gte=1,lte=5"`
    Mood       string                   `json:"mood" validate:"omitempty"`
}

type WorkoutExercise struct {
    Name         string            `json:"name" validate:"required"`
    Type         string            `json:"type" validate:"required,oneof=weight_training cardio flexibility"`
    IsBodyweight bool              `json:"isBodyweight"`
    Sets         []WorkoutSet      `json:"sets" validate:"required,min=1,dive"`
}

type WorkoutSet struct {
    SetNumber int     `json:"setNumber" validate:"required,gte=1"`
    Weight    float64 `json:"weight" validate:"omitempty,gte=0"`
    Reps      int     `json:"reps" validate:"omitempty,gte=0"`
    Distance  float64 `json:"distance" validate:"omitempty,gte=0"`
    Duration  float64 `json:"duration" validate:"omitempty,gte=0"`
    Rest      int     `json:"rest" validate:"omitempty,gte=0"`
}

func (h *WorkoutHandler) CreateWorkout(c *gin.Context) {
    trainer := c.MustGet("user").(models.User)
    
    var req CreateWorkoutRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    
    // คำนวณ summary
    summary := h.workoutService.CalculateSummary(req.Exercises)
    
    workout := &models.Workout{
        TraineeID:  uuid.MustParse(req.TraineeID),
        TrainerID:  trainer.ID,
        Date:       req.Date,
        Duration:   req.Duration,
        Exercises:  req.Exercises,
        Summary:    summary,
        Notes:      req.Notes,
        Rating:     req.Rating,
        Mood:       req.Mood,
    }
    
    if req.ScheduleID != "" {
        workout.ScheduleID = uuid.MustParse(req.ScheduleID)
    }
    
    created, err := h.workoutService.Create(workout)
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to create workout"})
        return
    }
    
    c.JSON(201, gin.H{
        "success": true,
        "data":    created,
    })
}
```

**Summary Calculation:**
```go
func (s *WorkoutService) CalculateSummary(exercises []WorkoutExercise) map[string]interface{} {
    summary := map[string]interface{}{
        "totalSets":       0,
        "totalReps":       0,
        "totalWeight":     0.0,
        "totalDistance":   0.0,
        "totalDuration":   0.0,
        "exerciseCount":   len(exercises),
    }
    
    for _, ex := range exercises {
        summary["totalSets"] = summary["totalSets"].(int) + len(ex.Sets)
        
        for _, set := range ex.Sets {
            if set.Reps > 0 {
                summary["totalReps"] = summary["totalReps"].(int) + set.Reps
            }
            if set.Weight > 0 {
                summary["totalWeight"] = summary["totalWeight"].(float64) + set.Weight
            }
            if set.Distance > 0 {
                summary["totalDistance"] = summary["totalDistance"].(float64) + set.Distance
            }
            if set.Duration > 0 {
                summary["totalDuration"] = summary["totalDuration"].(float64) + set.Duration
            }
        }
    }
    
    return summary
}
```

---

#### API #20-24: ใช้โครงสร้างคล้ายกับ Schedule APIs
- GET `/api/v1/workouts` - List workouts
- GET `/api/v1/workouts/:id` - Get workout
- PATCH `/api/v1/workouts/:id` - Update workout (Trainer only)
- DELETE `/api/v1/workouts/:id` - Delete workout (Trainer only)
- GET `/api/v1/workouts/summary` - Get summary stats

---

## 📦 Phase 2 Deliverables

### ✅ Checklist

- [ ] Database tables: schedules, workouts
- [ ] Schedule Management APIs (6) ทั้งหมดทำงานได้
- [ ] Workout Management APIs (6) ทั้งหมดทำงานได้
- [ ] RBAC: Trainer can CRUD, Trainee can READ only
- [ ] Resource ownership validation (Trainee ดูเฉพาะของตัวเอง)
- [ ] Data validation ครบถ้วน
- [ ] Unit tests สำหรับ services
- [ ] Integration tests สำหรับ APIs
- [ ] Postman collection อัปเดต

### 🎯 Success Criteria

1. ✅ Trainer สร้างตารางนัดได้
2. ✅ Trainee ดูตารางนัดของตัวเองได้
3. ✅ Trainee ไม่สามารถสร้าง/แก้ไข/ลบนัดได้ (403 Forbidden)
4. ✅ Trainer บันทึกผลการฝึกได้ (รองรับ 3 ประเภท)
5. ✅ Trainee ดูประวัติการฝึกของตัวเองได้
6. ✅ ระบบคำนวณ summary (totalSets, totalReps, etc.) ถูกต้อง
7. ✅ JSONB exercises เก็บข้อมูลครบถ้วน

---

# 📅 Phase 3: Enhanced Features (Week 5-6) - 15 APIs

## 🎯 เป้าหมาย
**ระบบติดตามความก้าวหน้า, การ์ดสรุปผล, และคลังท่าออกกำลังกาย ครบถ้วน**

## ✅ APIs ที่ต้องสร้าง

### Exercise Management (6 APIs)
- POST `/api/v1/exercises` (Trainer)
- GET `/api/v1/exercises`
- GET `/api/v1/exercises/:id`
- PATCH `/api/v1/exercises/:id` (Trainer)
- DELETE `/api/v1/exercises/:id` (Trainer)
- GET `/api/v1/exercises/categories`

### Session Cards (5 APIs)
- POST `/api/v1/session-cards` (Trainer)
- GET `/api/v1/session-cards`
- GET `/api/v1/session-cards/:id`
- PATCH `/api/v1/session-cards/:id` (Trainer)
- DELETE `/api/v1/session-cards/:id` (Trainer)

### Progress Tracking (4 APIs)
- GET `/api/v1/progress/exercises/:name`
- GET `/api/v1/progress/body-weight`
- POST `/api/v1/progress/body-weight` (Trainer)
- GET `/api/v1/progress/overall`

---

# 📅 Phase 4: Advanced Features (Week 7-8+) - 18 APIs

## 🎯 เป้าหมาย
**ระบบแจ้งเตือน, Analytics, และ Settings สมบูรณ์**

## ✅ APIs ที่ต้องสร้าง

### Notifications (6 APIs)
- GET `/api/v1/notifications`
- PATCH `/api/v1/notifications/:id/read`
- PATCH `/api/v1/notifications/read-all`
- DELETE `/api/v1/notifications/:id`
- GET `/api/v1/notifications/settings`
- PATCH `/api/v1/notifications/settings`

### Analytics (3 APIs)
- GET `/api/v1/analytics/dashboard` (Trainer)
- GET `/api/v1/analytics/trainees/:id/report` (Trainer)
- GET `/api/v1/analytics/exercises/stats` (Trainer)

### Settings (2 APIs)
- GET `/api/v1/settings`
- PATCH `/api/v1/settings`

---

# 🛠️ Development Best Practices

## 1. โครงสร้างโค้ด (Clean Architecture)
```
internal/
├── models/          # Database models (GORM)
├── repositories/    # Data access layer
├── services/        # Business logic
├── handlers/        # HTTP handlers (Gin)
├── middleware/      # Middleware functions
├── validators/      # Custom validators
└── utils/           # Helper functions
```

## 2. Error Handling
```go
// Standardized error response
type ErrorResponse struct {
    Success bool   `json:"success"`
    Error   ErrorDetail `json:"error"`
}

type ErrorDetail struct {
    Code       string `json:"code"`
    Message    string `json:"message"`
    StatusCode int    `json:"statusCode"`
}

// Usage
c.JSON(400, ErrorResponse{
    Success: false,
    Error: ErrorDetail{
        Code:       "INVALID_REQUEST",
        Message:    "Validation failed",
        StatusCode: 400,
    },
})
```

## 3. Logging
```go
import "github.com/rs/zerolog/log"

log.Info().
    Str("user_id", user.ID.String()).
    Str("action", "create_schedule").
    Msg("Schedule created successfully")

log.Error().
    Err(err).
    Str("schedule_id", scheduleID).
    Msg("Failed to create schedule")
```

## 4. Database Transactions
```go
func (s *ScheduleService) CreateWithNotification(schedule *Schedule) error {
    return s.db.Transaction(func(tx *gorm.DB) error {
        // 1. Create schedule
        if err := tx.Create(schedule).Error; err != nil {
            return err
        }
        
        // 2. Create notification
        notification := &Notification{
            UserID:  schedule.TraineeID,
            Type:    "schedule_created",
            Message: fmt.Sprintf("New schedule: %s", schedule.Title),
        }
        if err := tx.Create(notification).Error; err != nil {
            return err
        }
        
        return nil
    })
}
```

## 5. Testing Coverage
```bash
# Run tests with coverage
go test ./... -cover -coverprofile=coverage.out

# View coverage report
go tool cover -html=coverage.out
```

---

# 📊 Progress Tracking

## Week-by-Week Checklist

### Week 1-2: Foundation ✅
- [ ] Project setup
- [ ] Database schema (users, sessions)
- [ ] Authentication (5 APIs)
- [ ] User Management (5 APIs)
- [ ] Health Check (2 APIs)
- [ ] Middleware (Auth, RBAC, Rate Limit)

### Week 3-4: Core Features ✅
- [ ] Database schema (schedules, workouts)
- [ ] Schedule Management (6 APIs)
- [ ] Workout Management (6 APIs)
- [ ] RBAC enforcement
- [ ] Data validation

### Week 5-6: Enhanced Features
- [ ] Database schema (exercises, session_cards, body_weight)
- [ ] Exercise Management (6 APIs)
- [ ] Session Cards (5 APIs)
- [ ] Progress Tracking (4 APIs)
- [ ] Complex calculations

### Week 7-8: Advanced Features
- [ ] Database schema (notifications, settings)
- [ ] Notification APIs (6 APIs)
- [ ] Analytics APIs (3 APIs)
- [ ] Settings APIs (2 APIs)
- [ ] Background jobs

### Week 9+: Polish & Launch
- [ ] Integration testing
- [ ] Performance testing
- [ ] Security audit
- [ ] Documentation
- [ ] Deployment setup
- [ ] Monitoring & Logging

---

# 🚀 Deployment Checklist

## Pre-Production
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] SSL certificates ready
- [ ] CORS origins configured
- [ ] Rate limiting tuned
- [ ] Logging configured
- [ ] Error tracking setup (Sentry)

## Production
- [ ] Database backups automated
- [ ] Monitoring dashboard (Grafana/New Relic)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Load balancer configured
- [ ] CDN for static assets
- [ ] API documentation published

---

# 📚 Resources

## Documentation
- [Gin Framework](https://gin-gonic.com/docs/)
- [GORM](https://gorm.io/docs/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [JWT Best Practices](https://jwt.io/introduction)

## Tools
- [Postman](https://www.postman.com/) - API testing
- [TablePlus](https://tableplus.com/) - Database GUI
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [VS Code Go Extension](https://code.visualstudio.com/docs/languages/go)

---

**Created by**: Figma Make AI Assistant  
**Date**: 24 มกราคม 2026  
**Version**: 1.0.0  
**Status**: ✅ Ready for Development

---

## 🎯 Quick Start Commands

```bash
# 1. Clone and setup
git clone <your-repo>
cd fitness-backend
cp .env.example .env

# 2. Start Docker services
docker-compose up -d

# 3. Run migrations
go run cmd/migrate/main.go up

# 4. Start development server
go run cmd/server/main.go

# 5. Run tests
go test ./... -v

# 6. Build for production
go build -o bin/server cmd/server/main.go
```

---

**ขอให้การพัฒนา Backend สำเร็จลุล่วงด้วยดีครับ! 🚀**
