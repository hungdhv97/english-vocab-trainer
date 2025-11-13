package model

import "time"

// UserProfile represents additional user information beyond basic authentication.
type UserProfile struct {
	UserID      int64     `json:"user_id" db:"user_id"`
	DisplayName *string   `json:"display_name" db:"display_name"`
	AvatarURL   *string   `json:"avatar_url" db:"avatar_url"`
	Bio         *string   `json:"bio" db:"bio"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

// IsComplete checks if the profile is considered complete.
// A profile is complete if at least one optional field (display_name, avatar_url, or bio) is populated.
func (p *UserProfile) IsComplete() bool {
	hasDisplayName := p.DisplayName != nil && *p.DisplayName != ""
	hasAvatar := p.AvatarURL != nil && *p.AvatarURL != ""
	hasBio := p.Bio != nil && *p.Bio != ""
	return hasDisplayName || hasAvatar || hasBio
}

