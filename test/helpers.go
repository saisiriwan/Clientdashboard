package test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"

	"github.com/gin-gonic/gin"
)

// SetupTestRouter - สร้าง Gin Router สำหรับ testing
func SetupTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	return gin.Default()
}

// MakeRequest - ส่ง HTTP Request และรับ Response กลับมา
func MakeRequest(method, url string, body interface{}, router *gin.Engine) *httptest.ResponseRecorder {
	var req *http.Request

	if body != nil {
		jsonBody, _ := json.Marshal(body)
		req, _ = http.NewRequest(method, url, bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
	} else {
		req, _ = http.NewRequest(method, url, nil)
	}

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	return w
}

// MakeRequestWithContext - ส่ง Request พร้อมกับ set context values (สำหรับทดสอบ authenticated requests)
func MakeRequestWithContext(method, url string, body interface{}, router *gin.Engine, contextValues map[string]interface{}) *httptest.ResponseRecorder {
	var req *http.Request

	if body != nil {
		jsonBody, _ := json.Marshal(body)
		req, _ = http.NewRequest(method, url, bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
	} else {
		req, _ = http.NewRequest(method, url, nil)
	}

	w := httptest.NewRecorder()

	// Create a custom Gin context to set values
	c, _ := gin.CreateTestContext(w)
	c.Request = req

	// Set context values
	for key, value := range contextValues {
		c.Set(key, value)
	}

	router.ServeHTTP(w, req)

	return w
}

// ParseResponse - แปลง JSON Response เป็น map
func ParseResponse(w *httptest.ResponseRecorder) map[string]interface{} {
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	return response
}

// MockAuthMiddleware - Mock JWT Auth Middleware สำหรับ testing
func MockAuthMiddleware(userID int, role string, clientID int) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set("userID", userID)
		c.Set("role", role)
		if role == "trainee" {
			c.Set("clientID", clientID)
		}
		c.Next()
	}
}
