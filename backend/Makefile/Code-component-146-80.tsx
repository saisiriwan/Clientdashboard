.PHONY: help build run test clean docker-up docker-down migrate-up migrate-down

# Default target
help:
	@echo "Available commands:"
	@echo "  make build         - Build the application"
	@echo "  make run           - Run the application"
	@echo "  make test          - Run tests"
	@echo "  make test-coverage - Run tests with coverage"
	@echo "  make clean         - Clean build artifacts"
	@echo "  make docker-up     - Start Docker services"
	@echo "  make docker-down   - Stop Docker services"
	@echo "  make docker-logs   - View Docker logs"
	@echo "  make migrate-up    - Run database migrations"
	@echo "  make migrate-down  - Rollback database migrations"
	@echo "  make seed          - Seed database with sample data"
	@echo "  make lint          - Run linter"
	@echo "  make fmt           - Format code"

# Build the application
build:
	@echo "🔨 Building application..."
	@go build -o bin/api cmd/api/main.go
	@echo "✅ Build complete: bin/api"

# Run the application
run:
	@echo "🚀 Starting application..."
	@go run cmd/api/main.go

# Run tests
test:
	@echo "🧪 Running tests..."
	@go test -v ./...

# Run tests with coverage
test-coverage:
	@echo "🧪 Running tests with coverage..."
	@go test -v -cover -coverprofile=coverage.out ./...
	@go tool cover -html=coverage.out -o coverage.html
	@echo "✅ Coverage report: coverage.html"

# Clean build artifacts
clean:
	@echo "🧹 Cleaning..."
	@rm -rf bin/
	@rm -f coverage.out coverage.html
	@echo "✅ Clean complete"

# Docker commands
docker-up:
	@echo "🐳 Starting Docker services..."
	@docker-compose up -d
	@echo "✅ Docker services started"

docker-down:
	@echo "🐳 Stopping Docker services..."
	@docker-compose down
	@echo "✅ Docker services stopped"

docker-logs:
	@docker-compose logs -f

docker-rebuild:
	@echo "🐳 Rebuilding Docker services..."
	@docker-compose up -d --build
	@echo "✅ Docker services rebuilt"

# Database migrations (using golang-migrate)
migrate-up:
	@echo "📊 Running migrations..."
	@migrate -path migrations -database "postgresql://postgres:postgres@localhost:5432/fitness_training?sslmode=disable" up
	@echo "✅ Migrations complete"

migrate-down:
	@echo "📊 Rolling back migrations..."
	@migrate -path migrations -database "postgresql://postgres:postgres@localhost:5432/fitness_training?sslmode=disable" down 1
	@echo "✅ Rollback complete"

migrate-create:
	@echo "📊 Creating migration..."
	@migrate create -ext sql -dir migrations -seq $(name)
	@echo "✅ Migration created"

# Seed database
seed:
	@echo "🌱 Seeding database..."
	@psql -U postgres -d fitness_training -f scripts/seed.sql
	@echo "✅ Database seeded"

# Code quality
lint:
	@echo "🔍 Running linter..."
	@golangci-lint run
	@echo "✅ Lint complete"

fmt:
	@echo "✨ Formatting code..."
	@go fmt ./...
	@echo "✅ Format complete"

# Install dependencies
deps:
	@echo "📦 Installing dependencies..."
	@go mod download
	@go mod tidy
	@echo "✅ Dependencies installed"

# Development workflow
dev: docker-up
	@sleep 3
	@make run

# Full setup
setup: deps docker-up
	@sleep 5
	@make migrate-up
	@echo "✅ Setup complete! Run 'make run' to start the server"
