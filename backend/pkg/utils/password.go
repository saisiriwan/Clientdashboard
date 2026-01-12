package utils

import (
	"fitness-training-backend/pkg/errors"
	"golang.org/x/crypto/bcrypt"
)

const (
	// MinPasswordLength is the minimum password length
	MinPasswordLength = 8
	// BcryptCost is the cost factor for bcrypt hashing
	BcryptCost = 12
)

// HashPassword hashes a password using bcrypt
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), BcryptCost)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

// CheckPassword compares a password with a hash
func CheckPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// ValidatePassword validates password strength
func ValidatePassword(password string) error {
	if len(password) < MinPasswordLength {
		return errors.ErrWeakPassword
	}
	
	// Check for at least one uppercase letter
	hasUpper := false
	hasLower := false
	hasNumber := false
	
	for _, char := range password {
		switch {
		case char >= 'A' && char <= 'Z':
			hasUpper = true
		case char >= 'a' && char <= 'z':
			hasLower = true
		case char >= '0' && char <= '9':
			hasNumber = true
		}
	}
	
	if !hasUpper || !hasLower || !hasNumber {
		return errors.ErrWeakPassword
	}
	
	return nil
}