package errors

import "errors"

var (
	// Authentication errors
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrEmailAlreadyExists = errors.New("email already exists")
	ErrUserNotFound       = errors.New("user not found")
	ErrUnauthorized       = errors.New("unauthorized")
	ErrForbidden          = errors.New("forbidden")
	ErrInvalidToken       = errors.New("invalid token")
	ErrExpiredToken       = errors.New("token has expired")
	
	// Validation errors
	ErrWeakPassword      = errors.New("password must be at least 8 characters and contain uppercase, lowercase, and number")
	ErrInvalidEmail      = errors.New("invalid email format")
	ErrInvalidInput      = errors.New("invalid input")
	ErrMissingField      = errors.New("required field is missing")
	
	// Resource errors
	ErrNotFound          = errors.New("resource not found")
	ErrAlreadyExists     = errors.New("resource already exists")
	ErrConflict          = errors.New("conflict")
	
	// Business logic errors
	ErrScheduleConflict  = errors.New("schedule conflict")
	ErrProgramNotActive  = errors.New("program is not active")
	ErrClientNotAssigned = errors.New("client is not assigned to this trainer")
	ErrNoActiveProgram   = errors.New("no active program found")
	
	// Database errors
	ErrDatabaseError = errors.New("database error")
	
	// Internal errors
	ErrInternalServer = errors.New("internal server error")
)
