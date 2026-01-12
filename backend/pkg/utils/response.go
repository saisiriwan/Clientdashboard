package utils

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// APIResponse represents a standard API response
type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Message string      `json:"message,omitempty"`
	Error   *APIError   `json:"error,omitempty"`
}

// APIError represents an API error
type APIError struct {
	Code    string      `json:"code"`
	Message string      `json:"message"`
	Details interface{} `json:"details,omitempty"`
}

// SuccessResponse sends a success response
func SuccessResponse(c *gin.Context, statusCode int, data interface{}, message string) {
	c.JSON(statusCode, APIResponse{
		Success: true,
		Data:    data,
		Message: message,
	})
}

// ErrorResponse sends an error response
func ErrorResponse(c *gin.Context, statusCode int, code, message string, details interface{}) {
	c.JSON(statusCode, APIResponse{
		Success: false,
		Error: &APIError{
			Code:    code,
			Message: message,
			Details: details,
		},
	})
}

// Success shortcuts
func OK(c *gin.Context, data interface{}) {
	SuccessResponse(c, http.StatusOK, data, "Success")
}

func Created(c *gin.Context, data interface{}) {
	SuccessResponse(c, http.StatusCreated, data, "Created successfully")
}

func NoContent(c *gin.Context) {
	c.Status(http.StatusNoContent)
}

// Error shortcuts
func BadRequest(c *gin.Context, message string) {
	ErrorResponse(c, http.StatusBadRequest, "INVALID_INPUT", message, nil)
}

func Unauthorized(c *gin.Context, message string) {
	ErrorResponse(c, http.StatusUnauthorized, "UNAUTHORIZED", message, nil)
}

func Forbidden(c *gin.Context, message string) {
	ErrorResponse(c, http.StatusForbidden, "FORBIDDEN", message, nil)
}

func NotFound(c *gin.Context, message string) {
	ErrorResponse(c, http.StatusNotFound, "NOT_FOUND", message, nil)
}

func Conflict(c *gin.Context, message string) {
	ErrorResponse(c, http.StatusConflict, "CONFLICT", message, nil)
}

func InternalError(c *gin.Context, message string) {
	ErrorResponse(c, http.StatusInternalServerError, "INTERNAL_ERROR", message, nil)
}

func ValidationError(c *gin.Context, details interface{}) {
	ErrorResponse(c, http.StatusUnprocessableEntity, "VALIDATION_ERROR", "Validation failed", details)
}
