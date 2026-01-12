package repository

import (
	"fitness-training-backend/internal/models"

	"gorm.io/gorm"
)

// UserRepository handles user data access
type UserRepository interface {
	Create(user *models.User) error
	FindByID(id uint) (*models.User, error)
	FindByEmail(email string) (*models.User, error)
	FindByOAuth(provider, oauthID string) (*models.User, error)
	Update(user *models.User) error
	Delete(id uint) error
	UpdateLastLogin(id uint) error
	
	// Preload relationships
	FindByIDWithRelations(id uint) (*models.User, error)
}

type userRepository struct {
	db *gorm.DB
}

// NewUserRepository creates a new user repository
func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}

// Create creates a new user
func (r *userRepository) Create(user *models.User) error {
	return r.db.Create(user).Error
}

// FindByID finds user by ID
func (r *userRepository) FindByID(id uint) (*models.User, error) {
	var user models.User
	err := r.db.First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// FindByEmail finds user by email
func (r *userRepository) FindByEmail(email string) (*models.User, error) {
	var user models.User
	err := r.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// FindByOAuth finds user by OAuth provider and ID
func (r *userRepository) FindByOAuth(provider, oauthID string) (*models.User, error) {
	var user models.User
	err := r.db.Where("oauth_provider = ? AND oauth_id = ?", provider, oauthID).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// Update updates user
func (r *userRepository) Update(user *models.User) error {
	return r.db.Save(user).Error
}

// Delete soft deletes user
func (r *userRepository) Delete(id uint) error {
	return r.db.Delete(&models.User{}, id).Error
}

// UpdateLastLogin updates last login timestamp
func (r *userRepository) UpdateLastLogin(id uint) error {
	return r.db.Model(&models.User{}).Where("id = ?", id).Update("last_login_at", gorm.Expr("NOW()")).Error
}

// FindByIDWithRelations finds user with trainer/trainee relations
func (r *userRepository) FindByIDWithRelations(id uint) (*models.User, error) {
	var user models.User
	err := r.db.Preload("Trainer").Preload("Trainee").First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}
