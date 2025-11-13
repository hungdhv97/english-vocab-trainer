# Research: User Profile Completion Flow

**Feature**: 009-profile-completion  
**Date**: 2024-12-19

## Research Questions & Findings

### 1. File Upload Handling in Go/Gin

**Question**: How to handle multipart file uploads in Gin for avatar images?

**Decision**: Use Gin's `c.FormFile()` for single file uploads with multipart/form-data encoding.

**Rationale**: 
- Gin provides built-in support for multipart file uploads via `c.FormFile()`
- Standard HTTP multipart/form-data encoding is well-supported
- No additional dependencies required (aligns with minimal dependencies principle)
- File validation (size, type) can be done server-side before storage

**Alternatives considered**:
- Base64 encoding in JSON: Rejected - increases payload size by ~33%, less efficient for binary data
- Third-party upload libraries: Rejected - violates minimal dependencies principle, Gin's built-in support is sufficient

**Implementation approach**:
- Accept `multipart/form-data` in profile update endpoint
- Validate file size (max 2MB) and MIME type (image/jpeg, image/png) server-side
- Generate unique filename (e.g., `{user_id}_{timestamp}.{ext}`) to avoid conflicts
- Store files in `backend/uploads/avatars/` directory (create if not exists)
- Store relative path in database (`/uploads/avatars/{filename}`)
- Serve static files via Gin static file handler at `/uploads/`

### 2. File Storage Location

**Question**: Where to store uploaded avatar images?

**Decision**: Store in `backend/uploads/avatars/` directory, served as static files.

**Rationale**:
- Simple file system storage sufficient for current scale
- No need for object storage (S3, etc.) until scale requires it
- Can be served directly by Gin static file handler
- Easy to backup and migrate
- Aligns with minimal dependencies principle

**Alternatives considered**:
- Database BLOB storage: Rejected - inefficient for large files, increases database size
- Cloud object storage (S3): Rejected - adds dependency and complexity, not needed at current scale
- Separate upload service: Rejected - over-engineering for current requirements

**Implementation approach**:
- Create `backend/uploads/avatars/` directory structure
- Store files with user_id prefix to prevent conflicts
- Serve via Gin: `r.Static("/uploads", "./uploads")`
- Frontend references: `http://localhost:8180/uploads/avatars/{filename}`

### 3. Profile Completion Status Calculation

**Question**: How to efficiently determine if a user profile is complete?

**Decision**: Check if at least one of (display_name, avatar_url, bio) is non-null and non-empty in single database query.

**Rationale**:
- Simple SQL query: `SELECT CASE WHEN (display_name IS NOT NULL AND display_name != '') OR (avatar_url IS NOT NULL AND avatar_url != '') OR (bio IS NOT NULL AND bio != '') THEN true ELSE false END`
- Can be computed on-demand or cached in user session
- No need for separate completion_status field (derived state)
- Efficient single-query check

**Alternatives considered**:
- Separate `is_complete` boolean field: Rejected - adds redundancy, requires triggers or application logic to keep in sync
- Client-side calculation: Rejected - requires fetching all profile data, less efficient

**Implementation approach**:
- Add `IsProfileComplete(userID int64) (bool, error)` method to user service
- Use SQL CASE expression for efficient calculation
- Cache result in user session/JWT if needed for performance
- Call on login and profile update to determine banner visibility

### 4. Banner Dismissal State Management

**Question**: How to persist banner dismissal across page refreshes using browser session storage?

**Decision**: Use `sessionStorage.setItem('profile_banner_dismissed', 'true')` on skip, check on page load.

**Rationale**:
- Browser sessionStorage automatically cleared when tab/window closes (matches requirement)
- Persists across page refreshes (matches requirement)
- No backend state needed (client-side only)
- Simple implementation with standard Web API

**Alternatives considered**:
- localStorage: Rejected - persists too long (until explicit clear), doesn't match requirement
- Backend state: Rejected - unnecessary complexity, client-side state sufficient
- Cookie: Rejected - sent with every request, unnecessary overhead

**Implementation approach**:
- On banner skip: `sessionStorage.setItem('profile_banner_dismissed', 'true')`
- On page load: Check `sessionStorage.getItem('profile_banner_dismissed')` and profile completion status
- Show banner only if: profile incomplete AND banner not dismissed in sessionStorage
- Clear on logout (optional, sessionStorage clears on tab close anyway)

### 5. User Indicator Display Logic

**Question**: How to implement display name or username fallback with avatar in header?

**Decision**: Fetch user profile on header mount, display display_name if available, otherwise username. Show avatar if avatar_url exists.

**Rationale**:
- Simple conditional rendering in React
- Profile data can be fetched once and cached in component state
- Fallback logic: `displayName || username` for text, conditional avatar rendering
- Aligns with existing header component patterns

**Alternatives considered**:
- Always fetch profile on every page: Rejected - unnecessary API calls, can cache in component state
- Store in global state (Context/Zustand): Considered but rejected - header is simple enough for local state

**Implementation approach**:
- Add `fetchUserProfile(userId: number)` API function
- Fetch profile in Header component on mount (if authenticated)
- Display: `{profile?.display_name || username}` for text
- Display: `<img src={profile?.avatar_url} />` conditionally if avatar_url exists
- Handle loading and error states gracefully

### 6. Profile Page Context Adaptation

**Question**: How to make single profile page adapt for onboarding vs. regular management?

**Decision**: Use URL query parameter or route state to indicate onboarding context, show/hide skip button accordingly.

**Rationale**:
- Single component reduces code duplication
- Query parameter `?onboarding=true` or route state can indicate context
- Conditional rendering for skip button and messaging
- Maintains single source of truth for profile form

**Alternatives considered**:
- Separate components: Rejected - violates DRY principle, duplicate form logic
- Route-based (`/profile/complete` vs `/profile`): Considered but rejected - query param simpler, same route

**Implementation approach**:
- Profile page checks `searchParams.get('onboarding')` or route state
- If onboarding: Show "Skip" button, different heading/messaging
- If regular: Hide skip button, show standard "Save" button
- Same form submission logic for both contexts

### 7. Redirect After Registration/Login

**Question**: How to redirect to profile page after registration/login if profile incomplete?

**Decision**: Modify Register/Login handlers to check profile completion status and include redirect hint in response.

**Rationale**:
- Backend already returns user data on registration/login
- Can add `profile_incomplete: true` flag to response
- Frontend can check flag and redirect accordingly
- Maintains existing response structure, minimal changes

**Alternatives considered**:
- Always redirect to profile: Rejected - users with complete profiles shouldn't be redirected
- Separate endpoint to check completion: Rejected - extra API call, can be included in auth response

**Implementation approach**:
- Extend Register/Login service methods to check profile completion
- Add `profile_incomplete: bool` to response JSON
- Frontend checks flag: if `true` and no `redirect_to`, navigate to `/profile?onboarding=true`
- If `redirect_to` exists and valid, use that instead (preserve existing redirect logic)

## Technology Decisions Summary

| Decision | Technology/Approach | Rationale |
|----------|-------------------|-----------|
| File Upload | Gin `c.FormFile()` with multipart/form-data | Built-in support, no dependencies |
| File Storage | File system (`backend/uploads/avatars/`) | Simple, sufficient for scale |
| Banner State | Browser sessionStorage | Matches requirement, client-side only |
| Profile Status | SQL CASE expression | Efficient, no redundant fields |
| User Indicator | Conditional React rendering | Simple, follows existing patterns |
| Page Context | URL query parameter | Single component, DRY principle |
| Redirect Logic | Response flag + frontend check | Minimal changes, preserves existing flow |

## Dependencies

**No new dependencies required** - all functionality can be implemented using:
- Existing: Gin, pgx, React, React Router, shadcn UI
- Standard libraries: Go `os`, `path/filepath`, `mime` packages
- Browser APIs: `sessionStorage`, `FileReader` (for image preview)

## Open Questions Resolved

All research questions resolved. No remaining ambiguities blocking implementation.

