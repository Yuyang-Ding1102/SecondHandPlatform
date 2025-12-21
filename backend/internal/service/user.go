package service

import (
	"errors"

	"backend/internal/models"
	"backend/internal/database"
)

// CreateUser 创建新用户
func CreateUser(user *models.User) error {
	// 1. 连接数据库
	db := database.GetDB()
	if db == nil {
		return errors.New("database not initialized")
	}

	// 2. 检查用户是否已存在
	var existingUser models.User
	if err := db.Where("email = ?", user.Email).First(&existingUser).Error; err == nil {
		return errors.New("user with this email already exists")
	}

	if err := db.Where("username = ?", user.Username).First(&existingUser).Error; err == nil {
		return errors.New("user with this username already exists")
	}
	
	// 3. 创建用户
	return db.Create(user).Error
}

// GetUserByEmail 根据邮箱查找用户
func GetUserByEmail(email string) (*models.User, error) {
	db := database.GetDB()
	if db == nil {
		return nil, errors.New("database not initialized")
	}

	var user models.User
	if err := db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

// GetUserByID 根据ID查找用户
func GetUserByID(id int) (*models.User, error) {
	db := database.GetDB()
	if db == nil {
		return nil, errors.New("database not initialized")
	}

	var user models.User
	if err := db.First(&user, id).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

// GetUserByUsername 根据用户名查找用户
func GetUserByUsername(username string) (*models.User, error) {
	db := database.GetDB()
	if db == nil {
		return nil, errors.New("database not initialized")
	}

	var user models.User
	if err := db.Where("username = ?", username).First(&user).Error; err != nil {
		return nil, err
	}

	return &user, nil

}