package service

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"

	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/user/model"
)

// Service provides user-related operations.
type Service struct {
	db *pgxpool.Pool
}

// New creates a new user service.
func New(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

// Register registers a new user with hashed password.
func (s *Service) Register(username, password string) (model.User, error) {
	if strings.TrimSpace(username) == "" {
		return model.User{}, errors.New("username cannot be empty")
	}
	if strings.TrimSpace(password) == "" {
		return model.User{}, errors.New("password cannot be empty")
	}
	hashBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return model.User{}, err
	}
	ctx := context.Background()
	var user model.User
	err = s.db.QueryRow(ctx, `INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, password_hash, is_active, created_at`, username, string(hashBytes)).Scan(&user.ID, &user.Username, &user.PasswordHash, &user.IsActive, &user.CreatedAt)
	if err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "duplicate") || strings.Contains(err.Error(), "unique") {
			return model.User{}, errors.New("username already exists")
		}
		return model.User{}, err
	}
	return user, nil
}

// RegisterWithProfileCheck registers a new user and checks if profile is complete.
// Returns the user and a boolean indicating if profile is incomplete.
func (s *Service) RegisterWithProfileCheck(username, password string) (model.User, bool, error) {
	user, err := s.Register(username, password)
	if err != nil {
		return model.User{}, false, err
	}
	// New users always have incomplete profiles
	return user, true, nil
}

// Authenticate verifies user credentials.
func (s *Service) Authenticate(username, password string) (model.User, error) {
	ctx := context.Background()
	var user model.User
	err := s.db.QueryRow(ctx, `SELECT id, username, password_hash, is_active, created_at FROM users WHERE username=$1`, username).Scan(&user.ID, &user.Username, &user.PasswordHash, &user.IsActive, &user.CreatedAt)
	if err != nil {
		return model.User{}, errors.New("user not found")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return model.User{}, errors.New("invalid credentials")
	}
	if !user.IsActive {
		return model.User{}, errors.New("account is inactive")
	}
	return user, nil
}

// AuthenticateWithProfileCheck verifies user credentials and checks if profile is complete.
// Returns the user and a boolean indicating if profile is incomplete.
func (s *Service) AuthenticateWithProfileCheck(username, password string) (model.User, bool, error) {
	user, err := s.Authenticate(username, password)
	if err != nil {
		return model.User{}, false, err
	}
	isComplete, err := s.IsProfileComplete(user.ID)
	if err != nil {
		return model.User{}, false, err
	}
	return user, !isComplete, nil
}

// ValidateRedirectURL validates a redirect URL for security purposes.
// T052 [US4]: Validates against pattern `^/game/[a-z0-9-]+$`
// Rejects: absolute URLs, protocol-relative URLs, JavaScript URLs
// Logs rejected attempts for security monitoring
func (s *Service) ValidateRedirectURL(url, clientIP string) bool {
	// Empty URL is invalid
	if strings.TrimSpace(url) == "" {
		return false
	}

	// Security checks: reject dangerous patterns
	urlLower := strings.ToLower(url)

	// Reject absolute URLs (http://, https://, ftp://, etc.)
	if strings.Contains(urlLower, "://") {
		log.Printf("[SECURITY] Rejected absolute URL redirect attempt from %s: %s", clientIP, url)
		return false
	}

	// Reject protocol-relative URLs (//example.com)
	if strings.HasPrefix(url, "//") {
		log.Printf("[SECURITY] Rejected protocol-relative URL redirect attempt from %s: %s", clientIP, url)
		return false
	}

	// Reject javascript: URLs
	if strings.HasPrefix(urlLower, "javascript:") {
		log.Printf("[SECURITY] Rejected JavaScript URL redirect attempt from %s: %s", clientIP, url)
		return false
	}

	// Reject data: URLs
	if strings.HasPrefix(urlLower, "data:") {
		log.Printf("[SECURITY] Rejected data URL redirect attempt from %s: %s", clientIP, url)
		return false
	}

	// Valid pattern: /game/{game-code} where game-code is lowercase alphanumeric with hyphens
	validPattern := regexp.MustCompile(`^/game/[a-z0-9-]+$`)
	if !validPattern.MatchString(url) {
		log.Printf("[SECURITY] Rejected invalid redirect URL pattern from %s: %s", clientIP, url)
		return false
	}

	return true
}

// GetProfile retrieves user profile by user ID.
func (s *Service) GetProfile(userID int64) (model.UserProfile, error) {
	ctx := context.Background()
	var profile model.UserProfile
	err := s.db.QueryRow(ctx, `
		SELECT user_id, display_name, avatar_url, bio, created_at, updated_at
		FROM user_profiles
		WHERE user_id = $1
	`, userID).Scan(
		&profile.UserID,
		&profile.DisplayName,
		&profile.AvatarURL,
		&profile.Bio,
		&profile.CreatedAt,
		&profile.UpdatedAt,
	)
	if err != nil {
		// Profile doesn't exist yet - return empty profile
		return model.UserProfile{UserID: userID}, nil
	}
	return profile, nil
}

// IsProfileComplete checks if user profile is complete.
func (s *Service) IsProfileComplete(userID int64) (bool, error) {
	ctx := context.Background()
	var isComplete *bool
	err := s.db.QueryRow(ctx, `
		SELECT 
			CASE 
				WHEN (display_name IS NOT NULL AND display_name != '') 
					OR (avatar_url IS NOT NULL AND avatar_url != '') 
					OR (bio IS NOT NULL AND bio != '') 
				THEN true 
				ELSE false 
			END AS is_complete
		FROM user_profiles
		WHERE user_id = $1
	`, userID).Scan(&isComplete)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			// Profile doesn't exist - not complete
			return false, nil
		}
		return false, err
	}
	if isComplete == nil {
		return false, nil
	}
	return *isComplete, nil
}

// UpdateProfile creates or updates user profile.
func (s *Service) UpdateProfile(userID int64, displayName, bio *string, avatarFile *multipart.FileHeader) (model.UserProfile, error) {
	ctx := context.Background()

	// Validate display name length
	if displayName != nil && len(strings.TrimSpace(*displayName)) > 50 {
		return model.UserProfile{}, errors.New("display name exceeds 50 characters")
	}

	// Validate bio length
	if bio != nil && len(strings.TrimSpace(*bio)) > 500 {
		return model.UserProfile{}, errors.New("bio exceeds 500 characters")
	}

	var avatarURL *string

	// Handle avatar file upload if provided
	if avatarFile != nil {
		// Validate file size (max 2MB)
		if avatarFile.Size > 2*1024*1024 {
			return model.UserProfile{}, errors.New("avatar file exceeds 2MB limit")
		}

		// Validate file type (JPEG or PNG)
		ext := strings.ToLower(filepath.Ext(avatarFile.Filename))
		validExts := []string{".jpg", ".jpeg", ".png"}
		isValidExt := false
		for _, validExt := range validExts {
			if ext == validExt {
				isValidExt = true
				break
			}
		}
		if !isValidExt {
			return model.UserProfile{}, errors.New("avatar must be JPEG or PNG format")
		}

		// Get existing profile to delete old avatar if exists
		existingProfile, _ := s.GetProfile(userID)
		if existingProfile.AvatarURL != nil && *existingProfile.AvatarURL != "" {
			// Delete old avatar file
			oldPath := filepath.Join("uploads", "avatars", filepath.Base(*existingProfile.AvatarURL))
			os.Remove(oldPath)
		}

		// Generate unique filename (ext already defined above)
		filename := fmt.Sprintf("%d_%d%s", userID, time.Now().Unix(), ext)
		uploadPath := filepath.Join("uploads", "avatars", filename)

		// Create uploads/avatars directory if it doesn't exist
		os.MkdirAll(filepath.Dir(uploadPath), 0755)

		// Save file
		src, err := avatarFile.Open()
		if err != nil {
			return model.UserProfile{}, fmt.Errorf("failed to open uploaded file: %w", err)
		}
		defer src.Close()

		dst, err := os.Create(uploadPath)
		if err != nil {
			return model.UserProfile{}, fmt.Errorf("failed to create file: %w", err)
		}
		defer dst.Close()

		if _, err := io.Copy(dst, src); err != nil {
			return model.UserProfile{}, fmt.Errorf("failed to save file: %w", err)
		}

		// Store relative path in database
		relativePath := fmt.Sprintf("/uploads/avatars/%s", filename)
		avatarURL = &relativePath
	}

	// Trim whitespace from display name and bio
	var trimmedDisplayName *string
	if displayName != nil {
		trimmed := strings.TrimSpace(*displayName)
		if trimmed == "" {
			trimmedDisplayName = nil
		} else {
			trimmedDisplayName = &trimmed
		}
	}

	var trimmedBio *string
	if bio != nil {
		trimmed := strings.TrimSpace(*bio)
		if trimmed == "" {
			trimmedBio = nil
		} else {
			trimmedBio = &trimmed
		}
	}

	// Upsert profile
	var profile model.UserProfile
	err := s.db.QueryRow(ctx, `
		INSERT INTO user_profiles (user_id, display_name, avatar_url, bio, created_at, updated_at)
		VALUES ($1, $2, $3, $4, NOW(), NOW())
		ON CONFLICT (user_id) 
		DO UPDATE SET 
			display_name = EXCLUDED.display_name,
			avatar_url = COALESCE(EXCLUDED.avatar_url, user_profiles.avatar_url),
			bio = EXCLUDED.bio,
			updated_at = NOW()
		RETURNING user_id, display_name, avatar_url, bio, created_at, updated_at
	`, userID, trimmedDisplayName, avatarURL, trimmedBio).Scan(
		&profile.UserID,
		&profile.DisplayName,
		&profile.AvatarURL,
		&profile.Bio,
		&profile.CreatedAt,
		&profile.UpdatedAt,
	)
	if err != nil {
		return model.UserProfile{}, fmt.Errorf("failed to save profile: %w", err)
	}

	return profile, nil
}
