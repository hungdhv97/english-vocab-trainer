# Quick Start: User Profile Completion Flow

**Feature**: 009-profile-completion  
**Date**: 2024-12-19

## Overview

This guide provides a quick reference for implementing the user profile completion flow. It covers the essential steps to get the feature working end-to-end.

## Backend Implementation

### 1. Create Profile Model

**File**: `backend/internal/modules/user/model/profile.go`

```go
package model

import "time"

type UserProfile struct {
    UserID      int64     `json:"user_id" db:"user_id"`
    DisplayName *string   `json:"display_name" db:"display_name"`
    AvatarURL   *string   `json:"avatar_url" db:"avatar_url"`
    Bio         *string   `json:"bio" db:"bio"`
    CreatedAt   time.Time `json:"created_at" db:"created_at"`
    UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

func (p *UserProfile) IsComplete() bool {
    hasDisplayName := p.DisplayName != nil && *p.DisplayName != ""
    hasAvatar := p.AvatarURL != nil && *p.AvatarURL != ""
    hasBio := p.Bio != nil && *p.Bio != ""
    return hasDisplayName || hasAvatar || hasBio
}
```

### 2. Extend User Service

**File**: `backend/internal/modules/user/service/service.go`

Add methods:

```go
// GetProfile retrieves user profile by user ID
func (s *Service) GetProfile(userID int64) (model.UserProfile, error)

// UpdateProfile creates or updates user profile
func (s *Service) UpdateProfile(userID int64, displayName, bio *string, avatarFile *multipart.FileHeader) (model.UserProfile, error)

// IsProfileComplete checks if user profile is complete
func (s *Service) IsProfileComplete(userID int64) (bool, error)
```

### 3. Add Profile Handler

**File**: `backend/internal/modules/user/handler/http.go`

Add handlers:

```go
// GetProfile handles GET /api/v1/profile
func (h *Handler) GetProfile(c *gin.Context)

// UpdateProfile handles POST /api/v1/profile (multipart/form-data)
func (h *Handler) UpdateProfile(c *gin.Context)

// CheckProfileCompletion handles GET /api/v1/profile/complete
func (h *Handler) CheckProfileCompletion(c *gin.Context)
```

### 4. Register Routes

**File**: `backend/internal/modules/user/wiring.go`

```go
func RegisterRoutes(r *gin.RouterGroup, d *deps.Deps) {
    // ... existing routes ...
    
    // Profile routes (require authentication)
    profileGroup := r.Group("/profile")
    profileGroup.Use(middleware.JWTAuth()) // Add JWT middleware
    {
        profileGroup.GET("", h.GetProfile)
        profileGroup.POST("", h.UpdateProfile)
        profileGroup.GET("/complete", h.CheckProfileCompletion)
    }
}
```

### 5. Add Static File Serving

**File**: `backend/internal/platform/server/router.go`

```go
// Serve uploaded files
r.Static("/uploads", "./uploads")
```

### 6. Create Uploads Directory

```bash
mkdir -p backend/uploads/avatars
```

## Frontend Implementation

### 1. Add Profile Types

**File**: `frontend/src/types/index.ts`

```typescript
export interface UserProfile {
  user_id: number;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
  is_complete: boolean;
}

export interface ProfileCompletionStatus {
  is_complete: boolean;
  has_display_name: boolean;
  has_avatar: boolean;
  has_bio: boolean;
}
```

### 2. Add Profile API Functions

**File**: `frontend/src/lib/api.ts`

```typescript
export async function getProfile(): Promise<UserProfile>
export async function updateProfile(data: FormData): Promise<UserProfile>
export async function checkProfileCompletion(): Promise<ProfileCompletionStatus>
```

### 3. Create Profile Components

**File**: `frontend/src/components/profile/ProfilePage.tsx`

- Main profile page component
- Adapts for onboarding vs. regular management
- Uses `useSearchParams()` to detect onboarding context

**File**: `frontend/src/components/profile/ProfileForm.tsx`

- Form component with display name, bio fields
- Integrates AvatarUpload component
- Validation and error handling

**File**: `frontend/src/components/profile/AvatarUpload.tsx`

- File input with preview
- Image validation (size, type)
- Uses shadcn UI components

**File**: `frontend/src/components/profile/ProfileBanner.tsx`

- Banner component for incomplete profiles
- Skip button with sessionStorage
- Links to profile page

### 4. Update Header Component

**File**: `frontend/src/components/layout/Header.tsx`

- Fetch user profile on mount
- Display: `{profile?.display_name || username}`
- Show avatar if `avatar_url` exists
- Use shadcn UI Avatar component

### 5. Update Auth Components

**File**: `frontend/src/components/auth/Register.tsx`

- After registration, check `profile_incomplete` flag in response
- If true and no `redirect_to`, navigate to `/profile?onboarding=true`

**File**: `frontend/src/components/auth/Login.tsx`

- After login, check `profile_incomplete` flag in response
- If true and no `redirect_to`, navigate to `/profile?onboarding=true`

### 6. Add Profile Route

**File**: `frontend/src/App.tsx`

```typescript
<Route
  path="/profile"
  element={
    userId !== null ? (
      <ProfilePage />
    ) : (
      <Navigate to={`/login?redirect_to=${encodeURIComponent('/profile')}`} />
    )
  }
/>
```

## Key Implementation Details

### File Upload Handling

1. **Frontend**: Use `<input type="file" accept="image/jpeg,image/png">` with FormData
2. **Backend**: Use `c.FormFile("avatar")` to get file
3. **Validation**: Check file size (max 2MB) and MIME type (image/jpeg, image/png)
4. **Storage**: Save to `backend/uploads/avatars/{user_id}_{timestamp}.{ext}`
5. **Database**: Store path `/uploads/avatars/{filename}`

### Profile Completion Check

```sql
SELECT 
  CASE 
    WHEN (display_name IS NOT NULL AND display_name != '') 
      OR (avatar_url IS NOT NULL AND avatar_url != '') 
      OR (bio IS NOT NULL AND bio != '') 
    THEN true 
    ELSE false 
  END AS is_complete
FROM user_profiles
WHERE user_id = $1;
```

### Banner Dismissal

```typescript
// On skip
sessionStorage.setItem('profile_banner_dismissed', 'true');

// On page load
const dismissed = sessionStorage.getItem('profile_banner_dismissed');
const isComplete = profile?.is_complete;
const showBanner = !isComplete && !dismissed;
```

### User Indicator

```typescript
// Fetch profile
const profile = await getProfile();

// Display
<div>
  {profile?.avatar_url && (
    <img src={`${API_BASE_URL}${profile.avatar_url}`} alt="Avatar" />
  )}
  <span>{profile?.display_name || username}</span>
</div>
```

## Testing Checklist

- [ ] Register new user → redirects to profile page with onboarding context
- [ ] Complete profile → banner disappears, user indicator shows
- [ ] Skip profile → banner dismissed for session, reappears on new tab
- [ ] Login with incomplete profile → banner appears
- [ ] Update profile → changes persist, banner dismissed if now complete
- [ ] Upload avatar → file saved, path stored, image displays
- [ ] Invalid avatar → validation error shown
- [ ] Profile page without auth → redirects to login

## Next Steps

After implementing this quick start:

1. Add error handling and loading states
2. Add image preview before upload
3. Add avatar deletion functionality
4. Add profile completion progress indicator
5. Update OpenAPI documentation

