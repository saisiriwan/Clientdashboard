package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func setupTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	return gin.New()
}

// TestRequireRole_Success - ทดสอบว่า user ที่มี role ถูกต้องสามารถเข้าถึงได้
func TestRequireRole_Success(t *testing.T) {
	router := setupTestRouter()

	// Setup route with RequireRole middleware
	router.GET("/test", func(c *gin.Context) {
		c.Set("role", "trainer")
		c.Next()
	}, RequireRole("trainer"), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "success"})
	})

	// Make request
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	router.ServeHTTP(w, req)

	// Assertions
	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), "success")
}

// TestRequireRole_Forbidden - ทดสอบว่า user ที่มี role ไม่ถูกต้องถูกปฏิเสธ
func TestRequireRole_Forbidden(t *testing.T) {
	router := setupTestRouter()

	// Setup route - require "trainer" but user is "trainee"
	router.GET("/test", func(c *gin.Context) {
		c.Set("role", "trainee")
		c.Next()
	}, RequireRole("trainer"), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "success"})
	})

	// Make request
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	router.ServeHTTP(w, req)

	// Assertions
	assert.Equal(t, http.StatusForbidden, w.Code)
	assert.Contains(t, w.Body.String(), "FORBIDDEN")
	assert.Contains(t, w.Body.String(), "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้")
}

// TestRequireRole_Unauthorized - ทดสอบว่า user ที่ไม่มี role ถูกปฏิเสธ
func TestRequireRole_Unauthorized(t *testing.T) {
	router := setupTestRouter()

	// Setup route - no role set in context
	router.GET("/test", RequireRole("trainer"), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "success"})
	})

	// Make request
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	router.ServeHTTP(w, req)

	// Assertions
	assert.Equal(t, http.StatusUnauthorized, w.Code)
	assert.Contains(t, w.Body.String(), "UNAUTHORIZED")
}

// TestRequireRole_MultipleRoles - ทดสอบว่ารองรับหลาย roles
func TestRequireRole_MultipleRoles(t *testing.T) {
	router := setupTestRouter()

	// Setup route - allow both trainer and trainee
	router.GET("/test", func(c *gin.Context) {
		c.Set("role", "trainee")
		c.Next()
	}, RequireRole("trainer", "trainee"), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "success"})
	})

	// Make request
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	router.ServeHTTP(w, req)

	// Assertions
	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), "success")
}

// TestRequireTrainer_Success
func TestRequireTrainer_Success(t *testing.T) {
	router := setupTestRouter()

	router.GET("/test", func(c *gin.Context) {
		c.Set("role", "trainer")
		c.Next()
	}, RequireTrainer(), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "success"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

// TestRequireTrainer_Forbidden
func TestRequireTrainer_Forbidden(t *testing.T) {
	router := setupTestRouter()

	router.GET("/test", func(c *gin.Context) {
		c.Set("role", "trainee")
		c.Next()
	}, RequireTrainer(), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "success"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusForbidden, w.Code)
}

// TestRequireTrainee_Success
func TestRequireTrainee_Success(t *testing.T) {
	router := setupTestRouter()

	router.GET("/test", func(c *gin.Context) {
		c.Set("role", "trainee")
		c.Next()
	}, RequireTrainee(), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "success"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

// TestRequireTrainee_Forbidden
func TestRequireTrainee_Forbidden(t *testing.T) {
	router := setupTestRouter()

	router.GET("/test", func(c *gin.Context) {
		c.Set("role", "trainer")
		c.Next()
	}, RequireTrainee(), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "success"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusForbidden, w.Code)
}

// TestAllowAll_TrainerSuccess
func TestAllowAll_TrainerSuccess(t *testing.T) {
	router := setupTestRouter()

	router.GET("/test", func(c *gin.Context) {
		c.Set("role", "trainer")
		c.Next()
	}, AllowAll(), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "success"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

// TestAllowAll_TraineeSuccess
func TestAllowAll_TraineeSuccess(t *testing.T) {
	router := setupTestRouter()

	router.GET("/test", func(c *gin.Context) {
		c.Set("role", "trainee")
		c.Next()
	}, AllowAll(), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "success"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

// TestAllowAll_UnknownRoleForbidden
func TestAllowAll_UnknownRoleForbidden(t *testing.T) {
	router := setupTestRouter()

	router.GET("/test", func(c *gin.Context) {
		c.Set("role", "admin") // Unknown role
		c.Next()
	}, AllowAll(), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "success"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusForbidden, w.Code)
}

// TestCheckResourceOwnership_TrainerCanAccessAll
func TestCheckResourceOwnership_TrainerCanAccessAll(t *testing.T) {
	router := setupTestRouter()

	router.GET("/clients/:id/sessions", func(c *gin.Context) {
		c.Set("role", "trainer")
		c.Set("userID", 1)
		c.Next()
	}, CheckResourceOwnership("id"), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "success"})
	})

	// Trainer accessing client ID 5 (not their own)
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/clients/5/sessions", nil)
	router.ServeHTTP(w, req)

	// Trainer should be able to access any client
	assert.Equal(t, http.StatusOK, w.Code)
}

// TestCheckResourceOwnership_TraineeCanAccessOwnOnly
func TestCheckResourceOwnership_TraineeCanAccessOwnOnly(t *testing.T) {
	router := setupTestRouter()

	router.GET("/clients/:id/sessions", func(c *gin.Context) {
		c.Set("role", "trainee")
		c.Set("userID", "5") // Trainee user ID 5
		c.Next()
	}, CheckResourceOwnership("id"), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "success"})
	})

	// Trainee accessing their own data (client ID 5)
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/clients/5/sessions", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

// TestCheckResourceOwnership_TraineeForbiddenOthers
func TestCheckResourceOwnership_TraineeForbiddenOthers(t *testing.T) {
	router := setupTestRouter()

	router.GET("/clients/:id/sessions", func(c *gin.Context) {
		c.Set("role", "trainee")
		c.Set("userID", "5") // Trainee user ID 5
		c.Next()
	}, CheckResourceOwnership("id"), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "success"})
	})

	// Trainee trying to access someone else's data (client ID 10)
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/clients/10/sessions", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusForbidden, w.Code)
	assert.Contains(t, w.Body.String(), "คุณไม่สามารถเข้าถึงข้อมูลของผู้อื่นได้")
}
