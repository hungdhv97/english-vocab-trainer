# Data Model: Fix Session Tag Missing Error

## Overview

This bug fix does not introduce any new data model changes. The existing data model already supports session-based gameplay through the `game_sessions` and `plays` tables. The fix addresses cookie configuration and frontend session management, not data structure.

## Existing Entities

### GameSession

**Table**: `game_sessions`

**Description**: Represents an active or completed game session for a user playing a specific level.

**Fields**:
- `session_tag` (UUID, PRIMARY KEY): Unique identifier for the session, stored as HTTP cookie
- `user_id` (INTEGER, NOT NULL, FOREIGN KEY → users.user_id): User who started the session
- `level_id` (INTEGER, NOT NULL, FOREIGN KEY → levels.level_id): Level being played
- `game_id` (INTEGER, FOREIGN KEY → games.game_id): Parent game (added in previous feature)
- `started_at` (TIMESTAMP, NOT NULL, DEFAULT NOW()): When the session was created
- `finished_at` (TIMESTAMP, NULLABLE): When the session was completed (NULL = active session)
- `total_score` (INTEGER, NOT NULL, DEFAULT 0): Cumulative score for the session

**Relationships**:
- One-to-Many with `plays` (a session can have multiple answer attempts)
- Many-to-One with `users` (a user can have multiple sessions)
- Many-to-One with `levels` (a level can have multiple sessions)
- Many-to-One with `games` (a game can have multiple sessions)

**Constraints**:
- `session_tag` must be unique
- `user_id` must reference an existing user
- `level_id` must reference an existing level
- `finished_at` can be NULL (active session) or set to completion timestamp

**Indexes**:
- Primary key on `session_tag`
- Index on `user_id` for user history queries
- Index on `level_id` for level statistics
- Index on `(user_id, started_at DESC)` for ordered history
- Index on `(game_id, finished_at, total_score)` for leaderboard queries

### Play

**Table**: `plays`

**Description**: Represents a single answer attempt by a user during a game session.

**Fields**:
- `play_id` (INTEGER, PRIMARY KEY): Unique identifier for the play record
- `user_id` (INTEGER, NOT NULL, FOREIGN KEY → users.user_id): User who submitted the answer
- `word_id` (INTEGER, NOT NULL, FOREIGN KEY → words.word_id): Word being answered
- `session_tag` (UUID, NOT NULL, FOREIGN KEY → game_sessions.session_tag): Session this play belongs to
- `user_answer` (TEXT, NOT NULL): Answer submitted by the user
- `is_correct` (BOOLEAN, NOT NULL): Whether the answer was correct
- `score` (INTEGER, NOT NULL): Points earned/lost for this answer
- `target` (INTEGER, NOT NULL): Target progress change for this answer
- `played_at` (TIMESTAMP, NOT NULL, DEFAULT NOW()): When the answer was submitted

**Relationships**:
- Many-to-One with `game_sessions` (each play belongs to one session)
- Many-to-One with `users` (each play belongs to one user)
- Many-to-One with `words` (each play answers one word)

**Constraints**:
- `session_tag` must reference an existing game session
- `user_id` must match the session's user_id (enforced at application level)
- `user_answer` cannot be empty

**Indexes**:
- Primary key on `play_id`
- Foreign key index on `session_tag` for session queries
- Index on `(user_id, played_at DESC)` for user history

## Data Flow

### Session Creation Flow

1. User selects a level to play
2. Frontend calls `POST /api/v1/session` with `user_id` and `level_id`
3. Backend creates `game_sessions` record with new `session_tag` UUID
4. Backend sets `session_tag` cookie with appropriate SameSite/Secure settings
5. Frontend receives response and sets `sessionReady = true`
6. Frontend allows answer submissions

### Answer Submission Flow

1. User submits an answer
2. Frontend calls `POST /api/v1/answer` with answer data
3. Backend reads `session_tag` from HTTP cookie
4. Backend validates `session_tag` exists in `game_sessions` table
5. Backend creates `plays` record with `session_tag` foreign key
6. Backend updates `game_sessions.total_score`
7. Backend returns answer feedback (correct/incorrect, score, target)

### Session Completion Flow

1. User completes the quiz (reaches target score)
2. Frontend calls `POST /api/v1/finish`
3. Backend reads `session_tag` from HTTP cookie
4. Backend updates `game_sessions.finished_at = NOW()`
5. Session is marked as completed

## Cookie Configuration

### Development Environment (HTTP)

- `SameSite=None`: Required for cross-origin requests (frontend:5173 → backend:8180)
- `Secure=false`: Allowed by browsers for localhost
- `HttpOnly=true`: Prevents JavaScript access (security)
- `Path=/`: Cookie available for all paths

### Production Environment (HTTPS)

- `SameSite=None`: Required for cross-site cookies
- `Secure=true`: Required by browsers for SameSite=None
- `HttpOnly=true`: Prevents JavaScript access (security)
- `Path=/`: Cookie available for all paths

## Validation Rules

### Session Creation

- `user_id` must be a valid, authenticated user
- `level_id` must reference an existing level
- `session_tag` must be a valid UUID (generated by backend)

### Answer Submission

- `session_tag` cookie must be present in request
- `session_tag` must reference an existing, active session
- `user_id` in request must match session's `user_id`
- `word_id` must reference an existing word
- `user_answer` cannot be empty

### Session Completion

- `session_tag` cookie must be present in request
- `session_tag` must reference an existing session
- Session can be completed multiple times (idempotent)

## State Transitions

### GameSession States

1. **Active**: `finished_at IS NULL`
   - Can accept new plays
   - `total_score` can be updated
   - Can be finished

2. **Completed**: `finished_at IS NOT NULL`
   - Cannot accept new plays (enforced at application level)
   - `total_score` is final
   - Can appear in leaderboards

## Error Scenarios

### Missing Session Tag

- **Cause**: Cookie not set or expired
- **Detection**: Backend cannot read `session_tag` cookie
- **Response**: HTTP 400 with `{"error": "missing session_tag"}`
- **Fix**: Frontend ensures session is created before answer submissions

### Invalid Session Tag

- **Cause**: Cookie value is not a valid UUID or references non-existent session
- **Detection**: Backend cannot parse UUID or session not found in database
- **Response**: HTTP 400 with `{"error": "invalid session_tag"}`
- **Fix**: Frontend recreates session if invalid

### Session Creation Failure

- **Cause**: Database error, network error, or validation failure
- **Detection**: Backend returns error response
- **Response**: HTTP 400/500 with error message
- **Fix**: Frontend displays error message and allows retry

## No Changes Required

This bug fix does not require any database schema changes. The existing data model already supports:
- Session creation with UUID session_tag
- Cookie-based session identification
- Answer submissions linked to sessions
- Session completion tracking

The fix only addresses:
- Cookie configuration (application-level, not database)
- Frontend session management (state management, not data model)
- Error handling (application logic, not data structure)

