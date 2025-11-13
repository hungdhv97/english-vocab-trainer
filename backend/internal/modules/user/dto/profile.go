package dto

// ProfileResponse represents a user profile response.
type ProfileResponse struct {
	UserID      int64  `json:"user_id"`
	DisplayName string `json:"display_name,omitempty"`
	AvatarURL   string `json:"avatar_url,omitempty"`
	Bio         string `json:"bio,omitempty"`
	IsComplete  bool   `json:"is_complete"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}

// ProfileCompletionResponse represents profile completion status.
type ProfileCompletionResponse struct {
	IsComplete     bool `json:"is_complete"`
	HasDisplayName bool `json:"has_display_name"`
	HasAvatar      bool `json:"has_avatar"`
	HasBio         bool `json:"has_bio"`
}

