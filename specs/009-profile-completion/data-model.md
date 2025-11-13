# Data Model: User Profile Completion Flow

**Feature**: 009-profile-completion  
**Date**: 2024-12-19

## Entities

### UserProfile

Represents additional user information beyond basic authentication.

**Table**: `user_profiles` (already exists in schema)

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `user_id` | INTEGER | PRIMARY KEY, FK to `users(id)` ON DELETE CASCADE | References the user account |
| `display_name` | VARCHAR(100) | NULL, max 50 chars (application-level) | Optional display name for user |
| `avatar_url` | VARCHAR(255) | NULL | Optional path/URL to uploaded avatar image |
| `bio` | TEXT | NULL, max 500 chars (application-level) | Optional biographical text |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Timestamp when profile was created |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Timestamp when profile was last updated |

**Relationships**:
- One-to-one with `users` table via `user_id` (CASCADE delete)

**Validation Rules** (application-level):
- `display_name`: Maximum 50 characters (trimmed)
- `avatar_url`: Must be valid file path if provided, file must exist
- `bio`: Maximum 500 characters (trimmed)
- Profile completion: At least one of (`display_name`, `avatar_url`, `bio`) must be non-null and non-empty

**State Transitions**:
- **Created**: Profile row created (all fields NULL) when user registers
- **Partial**: At least one field populated
- **Complete**: At least one field populated (same as Partial, but used for banner logic)

**Derived State**:
- `is_complete`: Calculated as `(display_name IS NOT NULL AND display_name != '') OR (avatar_url IS NOT NULL AND avatar_url != '') OR (bio IS NOT NULL AND bio != '')`

### User (Extended)

The existing `users` table is extended with profile relationship.

**Table**: `users` (already exists)

**New Relationships**:
- One-to-one with `user_profiles` via `user_id`

**Profile-related Queries**:
- Check profile completion status
- Fetch profile data with user data (JOIN)

## Data Flow

### Profile Creation

1. **On User Registration**:
   - User row created in `users` table (existing flow)
   - Profile row NOT automatically created (lazy creation)
   - Profile row created on first profile update

2. **On First Profile Update**:
   - INSERT INTO `user_profiles` (user_id, display_name, avatar_url, bio, created_at, updated_at)
   - If avatar uploaded: file saved to `backend/uploads/avatars/{user_id}_{timestamp}.{ext}`
   - `avatar_url` set to `/uploads/avatars/{filename}`

### Profile Updates

1. **Update Existing Profile**:
   - UPDATE `user_profiles` SET display_name=?, avatar_url=?, bio=?, updated_at=NOW() WHERE user_id=?
   - If new avatar uploaded: old file deleted (if exists), new file saved
   - `updated_at` automatically updated

2. **Avatar File Management**:
   - Old avatar file deleted when new one uploaded
   - Avatar file deleted if user removes avatar (sets avatar_url to NULL)

### Profile Completion Check

**Query**:
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

**Usage**:
- Called on login/registration to determine if banner should show
- Called after profile update to determine if banner should be dismissed
- Cached in session/JWT if needed for performance

## File Storage

### Avatar Images

**Storage Location**: `backend/uploads/avatars/`

**Naming Convention**: `{user_id}_{timestamp}.{ext}`

**Example**: `123_1703001234.jpg`

**File Constraints**:
- Maximum size: 2MB
- Allowed formats: JPEG (.jpg, .jpeg), PNG (.png)
- MIME types: `image/jpeg`, `image/png`

**File Operations**:
- **Upload**: Save to `uploads/avatars/` directory
- **Delete**: Remove file when user updates avatar or removes it
- **Serve**: Static file handler at `/uploads/avatars/{filename}`

**Database Storage**:
- Only path stored: `/uploads/avatars/{filename}`
- Full URL: `http://localhost:8180/uploads/avatars/{filename}` (frontend constructs)

## Indexes

**Existing Indexes** (from schema):
- `user_profiles.user_id` (PRIMARY KEY, automatically indexed)

**No additional indexes required** - primary key lookup sufficient for profile queries.

## Data Migration

**No data migration required** - `user_profiles` table already exists in schema.

**Initial State**:
- Existing users: No profile rows (NULL = incomplete profile)
- New users: No profile rows until first profile update

## Constraints

### Database Constraints

- `user_id` PRIMARY KEY ensures one profile per user
- `user_id` FOREIGN KEY ensures referential integrity
- `ON DELETE CASCADE` ensures profile deleted when user deleted

### Application Constraints

- `display_name`: Max 50 characters (trimmed)
- `bio`: Max 500 characters (trimmed)
- `avatar_url`: Valid file path, file must exist
- Avatar file: Max 2MB, JPEG/PNG only
- Profile completion: At least one field must be populated

## Query Patterns

### Fetch User Profile

```sql
SELECT user_id, display_name, avatar_url, bio, created_at, updated_at
FROM user_profiles
WHERE user_id = $1;
```

### Check Profile Completion

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

### Update Profile

```sql
UPDATE user_profiles
SET display_name = $2, avatar_url = $3, bio = $4, updated_at = NOW()
WHERE user_id = $1
RETURNING user_id, display_name, avatar_url, bio, created_at, updated_at;
```

### Upsert Profile (Create or Update)

```sql
INSERT INTO user_profiles (user_id, display_name, avatar_url, bio, created_at, updated_at)
VALUES ($1, $2, $3, $4, NOW(), NOW())
ON CONFLICT (user_id) 
DO UPDATE SET 
  display_name = EXCLUDED.display_name,
  avatar_url = EXCLUDED.avatar_url,
  bio = EXCLUDED.bio,
  updated_at = NOW()
RETURNING user_id, display_name, avatar_url, bio, created_at, updated_at;
```

## Data Volume Estimates

**Assumptions**:
- 10,000 users
- 50% complete profiles (5,000 profiles)
- 50% upload avatars (2,500 avatars)
- Average avatar size: 500KB

**Storage**:
- Database: ~5,000 profile rows × ~200 bytes = ~1MB
- Files: 2,500 avatars × 500KB = ~1.25GB

**Scaling Considerations**:
- File storage can be moved to object storage (S3) if needed
- Database storage remains minimal (text fields only)
- Avatar serving can be CDN-backed if needed

