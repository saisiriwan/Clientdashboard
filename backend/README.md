# 🏋️ Fitness Training Management System - Backend

**Tech Stack:**
- **Language:** Go 1.21+
- **Framework:** Gin (HTTP Router)
- **ORM:** GORM
- **Database:** PostgreSQL 15+
- **Authentication:** JWT (Cookies + Bearer Token)
- **OAuth:** Google OAuth 2.0

---

## 📁 Project Structure

```
backend/
├── cmd/
│   └── api/
│       └── main.go                 # Application entry point
├── internal/
│   ├── config/
│   │   └── config.go               # Configuration management
│   ├── database/
│   │   ├── database.go             # Database connection
│   │   └── migration.go            # Auto-migrations
│   ├── models/                     # GORM Models (15 tables)
│   │   ├── user.go
│   │   ├── trainer.go
│   │   ├── trainee.go
│   │   ├── schedule.go
│   │   ├── program.go
│   │   ├── session_card.go
│   │   ├── notification.go
│   │   └── ...
│   ├── repository/                 # Data Access Layer
│   │   ├── user_repository.go
│   │   ├── trainee_repository.go
│   │   ├── trainer_repository.go
│   │   └── ...
│   ├── service/                    # Business Logic Layer
│   │   ├── auth_service.go
│   │   ├── trainee_service.go
│   │   ├── trainer_service.go
│   │   └── ...
│   ├── handler/                    # HTTP Handlers (Controllers)
│   │   ├── auth_handler.go
│   │   ├── trainee_handler.go
│   │   ├── trainer_handler.go
│   │   └── ...
│   ├── middleware/                 # HTTP Middleware
│   │   ├── auth.go                 # JWT Authentication
│   │   ├── rbac.go                 # Role-Based Access Control
│   │   ├── cors.go                 # CORS
│   │   ├── logger.go               # Request Logging
│   │   └── error.go                # Error Handler
│   ├── dto/                        # Data Transfer Objects
│   │   ├── auth_dto.go
│   │   ├── trainee_dto.go
│   │   └── ...
│   └── routes/
│       └── routes.go               # Routes registration
├── pkg/
│   ├── utils/
│   │   ├── jwt.go                  # JWT utilities
│   │   ├── password.go             # Password hashing
│   │   ├── validator.go            # Input validation
│   │   └── response.go             # Standard response
│   └── errors/
│       └── errors.go               # Custom errors
├── migrations/                     # SQL Migrations
│   ├── 000001_initial_schema.up.sql
│   ├── 000001_initial_schema.down.sql
│   └── ...
├── scripts/
│   └── seed.sql                    # Sample data
├── docker-compose.yml              # Docker services
├── Dockerfile                      # Docker image
├── .env.example                    # Environment variables template
├── go.mod                          # Go dependencies
├── go.sum
├── Makefile                        # Build commands
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites:
- Go 1.21+
- PostgreSQL 15+
- Docker & Docker Compose (optional)

### 1. Clone & Install:
```bash
cd backend
go mod download
```

### 2. Setup Environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Run with Docker:
```bash
docker-compose up -d
```

### 4. Run Migrations:
```bash
make migrate-up
```

### 5. Run Server:
```bash
make run
# or
go run cmd/api/main.go
```

Server will start at: `http://localhost:8080`

---

## 📊 API Endpoints

### Authentication:
- `POST /api/v1/auth/register` - Register
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get current user
- `GET /api/v1/auth/google/login` - Google OAuth
- `GET /api/v1/auth/google/callback` - OAuth callback
- `POST /api/v1/auth/refresh` - Refresh token

### Trainee APIs (Read-Only):
- `GET /api/v1/trainee/schedules/upcoming` - Upcoming schedules
- `GET /api/v1/trainee/schedules` - All schedules
- `GET /api/v1/trainee/schedules/:id` - Schedule detail
- `GET /api/v1/trainee/programs/current` - Current program
- `GET /api/v1/trainee/programs` - All programs
- `GET /api/v1/trainee/programs/:id` - Program detail
- `GET /api/v1/trainee/stats` - Stats summary
- `GET /api/v1/trainee/notifications` - Notifications
- `PUT /api/v1/trainee/notifications/:id/read` - Mark as read
- `PUT /api/v1/trainee/notifications/read-all` - Mark all as read
- `GET /api/v1/trainee/sessions` - Session cards
- `GET /api/v1/trainee/sessions/:id` - Session detail
- `GET /api/v1/trainee/metrics` - Metrics
- `GET /api/v1/trainee/me` - Profile

### Trainer APIs (Full CRUD):
- `GET /api/v1/trainer/dashboard/stats` - Dashboard
- `GET /api/v1/trainer/clients` - All clients
- `GET /api/v1/trainer/clients/:id` - Client detail
- `POST /api/v1/trainer/clients` - Add client
- `PATCH /api/v1/trainer/clients/:id` - Update client
- `DELETE /api/v1/trainer/clients/:id` - Remove client
- ... (30+ endpoints)

---

## 🧪 Testing

```bash
# Run all tests
make test

# Run with coverage
make test-coverage

# Run specific test
go test ./internal/service -v
```

---

## 📦 Database Migrations

```bash
# Create new migration
make migrate-create name=add_new_table

# Run migrations
make migrate-up

# Rollback
make migrate-down

# Reset database
make migrate-reset
```

---

## 🔒 Security

- ✅ JWT Authentication (HTTP-only cookies)
- ✅ Password hashing (bcrypt)
- ✅ RBAC Middleware
- ✅ CORS protection
- ✅ SQL injection prevention (GORM)
- ✅ XSS protection
- ✅ Rate limiting

---

## 📈 Performance

- ✅ Database connection pooling
- ✅ Query optimization with indexes
- ✅ Caching strategies
- ✅ Lazy loading relationships

---

## 📝 Environment Variables

See `.env.example` for all configuration options.

---

**Version:** 2.0  
**Last Updated:** 2026-01-11
