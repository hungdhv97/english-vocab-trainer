package handler

import (
	"fmt"
	"mime/multipart"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"

	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/user/dto"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/user/service"
)

// Handler provides HTTP handlers for user endpoints.
type Handler struct {
	svc      *service.Service
	validate *validator.Validate
}

// New creates a new user handler.
func New(s *service.Service) *Handler {
	return &Handler{svc: s, validate: validator.New()}
}

// Register handles user registration.
// T054 [US4]: Accepts optional redirect_to query parameter and validates it
func (h *Handler) Register(c *gin.Context) {
	var req dto.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.validate.Struct(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	user, profileIncomplete, err := h.svc.RegisterWithProfileCheck(req.Username, req.Password)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Extract and validate redirect_to query parameter
	redirectTo := c.Query("redirect_to")
	var validatedRedirect *string
	if redirectTo != "" {
		clientIP := c.ClientIP()
		if h.svc.ValidateRedirectURL(redirectTo, clientIP) {
			validatedRedirect = &redirectTo
		}
		// If invalid, validatedRedirect remains nil (not included in response)
	}

	// Return user with optional redirect_to and profile_incomplete flag
	response := gin.H{
		"user_id":   user.ID,
		"username":  user.Username,
		"is_active": user.IsActive,
	}
	if validatedRedirect != nil {
		response["redirect_to"] = *validatedRedirect
	}
	// Only include profile_incomplete if true (new users always have incomplete profiles)
	if profileIncomplete {
		response["profile_incomplete"] = true
	}
	c.JSON(http.StatusOK, response)
}

// Login handles user authentication.
// T053 [US4]: Accepts optional redirect_to query parameter and validates it
func (h *Handler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.validate.Struct(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	user, profileIncomplete, err := h.svc.AuthenticateWithProfileCheck(req.Username, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Extract and validate redirect_to query parameter
	redirectTo := c.Query("redirect_to")
	var validatedRedirect *string
	if redirectTo != "" {
		clientIP := c.ClientIP()
		if h.svc.ValidateRedirectURL(redirectTo, clientIP) {
			validatedRedirect = &redirectTo
		}
		// If invalid, validatedRedirect remains nil (not included in response)
	}

	// Return user with optional redirect_to and profile_incomplete flag
	response := gin.H{
		"user_id":   user.ID,
		"username":  user.Username,
		"is_active": user.IsActive,
	}
	if validatedRedirect != nil {
		response["redirect_to"] = *validatedRedirect
	}
	// Only include profile_incomplete if true
	if profileIncomplete {
		response["profile_incomplete"] = true
	}
	c.JSON(http.StatusOK, response)
}

// GetProfile handles GET /api/v1/profile
func (h *Handler) GetProfile(c *gin.Context) {
	// Get user_id from query parameter (will be replaced with JWT token extraction later)
	userIDStr := c.Query("user_id")
	if userIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}

	var userID int64
	if _, err := fmt.Sscanf(userIDStr, "%d", &userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user_id"})
		return
	}

	profile, err := h.svc.GetProfile(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert to response DTO
	response := dto.ProfileResponse{
		UserID:     profile.UserID,
		IsComplete: profile.IsComplete(),
		CreatedAt:  profile.CreatedAt.Format(time.RFC3339),
		UpdatedAt:  profile.UpdatedAt.Format(time.RFC3339),
	}
	if profile.DisplayName != nil {
		response.DisplayName = *profile.DisplayName
	}
	if profile.AvatarURL != nil {
		response.AvatarURL = *profile.AvatarURL
	}
	if profile.Bio != nil {
		response.Bio = *profile.Bio
	}

	c.JSON(http.StatusOK, response)
}

// UpdateProfile handles POST /api/v1/profile (multipart/form-data)
func (h *Handler) UpdateProfile(c *gin.Context) {
	// Get user_id from form or query parameter
	userIDStr := c.PostForm("user_id")
	if userIDStr == "" {
		userIDStr = c.Query("user_id")
	}
	if userIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}

	var userID int64
	if _, err := fmt.Sscanf(userIDStr, "%d", &userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user_id"})
		return
	}

	// Get form values
	var displayName, bio *string
	if dn := c.PostForm("display_name"); dn != "" {
		displayName = &dn
	}
	if b := c.PostForm("bio"); b != "" {
		bio = &b
	}

	// Get avatar file if uploaded
	var avatarFile *multipart.FileHeader
	file, err := c.FormFile("avatar")
	if err == nil {
		avatarFile = file
	}

	profile, err := h.svc.UpdateProfile(userID, displayName, bio, avatarFile)
	if err != nil {
		// Check for specific error types
		if strings.Contains(err.Error(), "exceeds") || strings.Contains(err.Error(), "format") {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		} else if strings.Contains(err.Error(), "2MB") {
			c.JSON(http.StatusRequestEntityTooLarge, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile: " + err.Error()})
		}
		return
	}

	// Convert to response DTO
	response := dto.ProfileResponse{
		UserID:     profile.UserID,
		IsComplete: profile.IsComplete(),
		CreatedAt:  profile.CreatedAt.Format(time.RFC3339),
		UpdatedAt:  profile.UpdatedAt.Format(time.RFC3339),
	}
	if profile.DisplayName != nil {
		response.DisplayName = *profile.DisplayName
	}
	if profile.AvatarURL != nil {
		response.AvatarURL = *profile.AvatarURL
	}
	if profile.Bio != nil {
		response.Bio = *profile.Bio
	}

	c.JSON(http.StatusOK, response)
}

// CheckProfileCompletion handles GET /api/v1/profile/complete
func (h *Handler) CheckProfileCompletion(c *gin.Context) {
	// Get user_id from query parameter
	userIDStr := c.Query("user_id")
	if userIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}

	var userID int64
	if _, err := fmt.Sscanf(userIDStr, "%d", &userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user_id"})
		return
	}

	isComplete, err := h.svc.IsProfileComplete(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Get profile to check individual fields
	profile, _ := h.svc.GetProfile(userID)
	response := dto.ProfileCompletionResponse{
		IsComplete:     isComplete,
		HasDisplayName: profile.DisplayName != nil && *profile.DisplayName != "",
		HasAvatar:      profile.AvatarURL != nil && *profile.AvatarURL != "",
		HasBio:         profile.Bio != nil && *profile.Bio != "",
	}

	c.JSON(http.StatusOK, response)
}
