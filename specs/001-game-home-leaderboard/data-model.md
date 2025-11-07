# Data Model: Game Home Page with Leaderboards

**Feature**: Game Home Page with Leaderboards  
**Date**: November 7, 2025  
**Phase**: 1 - Data Models and Entity Definitions

## Overview

This document defines the data entities, their attributes, relationships, and validation rules for the game home page feature. All entities are technology-agnostic but include implementation notes for PostgreSQL database and Go/TypeScript type definitions.

---

## Entity Definitions

### 1. Game

**Description**: Represents a vocabulary learning game displayed on the home page. Games are user-facing collections of learning activities that may span multiple difficulty levels.

**Attributes**:

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `game_id` | Integer | PRIMARY KEY, AUTO INCREMENT | Unique identifier for the game |
| `code` | String (50) | UNIQUE, NOT NULL, LOWERCASE | Machine-readable identifier (e.g., "word-scramble", "vocab-quiz") |
| `name` | String (100) | NOT NULL | User-facing game title (e.g., "Word Scramble", "Vocabulary Quiz") |
| `description` | Text | NOT NULL | Brief explanation of game mechanics and learning objectives (2-3 sentences) |
| `icon_path` | String (255) | NULLABLE, PATTERN: `^/games/[a-z0-9-]+\.(svg\|png\|jpg\|webp)$` | Relative path to game icon in public assets (e.g., "/games/word-scramble.svg") |
| `category` | String (50) | NULLABLE, ENUM-like: "vocabulary", "grammar", "pronunciation", "mixed" | Learning category for grouping games |
| `display_order` | Integer | NOT NULL, DEFAULT 0 | Determines sort order on home page (lower number = displayed first) |
| `is_active` | Boolean | NOT NULL, DEFAULT TRUE | Controls visibility on home page (soft delete flag) |
| `created_at` | Timestamp | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| `updated_at` | Timestamp | NOT NULL, DEFAULT NOW() | Record last update timestamp |

**Validation Rules**:
- `code` must be URL-safe (alphanumeric + hyphens only)
- `name` cannot be empty or only whitespace
- `description` must be between 10 and 500 characters
- `icon_path`, if provided, must point to existing file in public directory
- `category` values restricted to predefined set (enforced at application layer)
- `display_order` must be non-negative

**Relationships**:
- One-to-Many with `game_levels` (a game can have multiple levels)
- One-to-Many with `game_sessions` (a game can have multiple play sessions)

**Business Rules**:
- Games cannot be hard-deleted if associated with any `game_sessions`
- Deactivating a game (`is_active = FALSE`) hides it from home page but preserves historical leaderboard data
- `display_order` ties are resolved alphabetically by `name`

---

### 2. LeaderboardEntry

**Description**: Represents a single entry in a game's leaderboard, aggregated from user performance data. This is a derived entity (not stored directly in database) generated from queries across `game_sessions` and `users` tables.

**Attributes**:

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `rank` | Integer | NOT NULL, > 0 | Player's position in leaderboard (1 = highest score) |
| `user_id` | Integer | NOT NULL | Unique identifier of the player (references `users.user_id`) |
| `username` | String (50) | NOT NULL | Player's display name |
| `score` | Integer | NOT NULL, >= 0 | Player's best score for this game |
| `achieved_at` | Timestamp | NOT NULL | Timestamp when best score was achieved |

**Validation Rules**:
- `rank` must be between 1 and 10 (per requirement: top 10 players)
- `score` must be non-negative
- `username` must correspond to active user (`users.is_active = TRUE`)

**Relationships**:
- Many-to-One with `User` (via `user_id`)
- Conceptually linked to `Game` (though not stored relationally)

**Business Rules**:
- Leaderboard entries are computed in real-time (or cached) from `game_sessions` data
- Each user appears at most once per game leaderboard (best score only)
- Ties in score are broken by earliest achievement (`achieved_at ASC`)
- Only completed sessions (`game_sessions.finished_at IS NOT NULL`) contribute to leaderboard
- Inactive users (`users.is_active = FALSE`) are excluded from leaderboard

**Aggregation Logic**:
```text
FOR each game:
  1. Find all completed game_sessions for that game
  2. Group by user_id, take MAX(total_score) as best_score
  3. Rank by best_score DESC, achieved_at ASC
  4. Select top 10 ranked users
  5. Join with users table to get username
```

---

### 3. GameLevel (Junction Entity)

**Description**: Represents the many-to-many relationship between games and levels. Allows a single game to contain multiple difficulty levels, or a single level to be reused across multiple game types.

**Attributes**:

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `game_id` | Integer | NOT NULL, FOREIGN KEY → `games.game_id` | Reference to game |
| `level_id` | Integer | NOT NULL, FOREIGN KEY → `levels.level_id` | Reference to level |

**Primary Key**: Composite key `(game_id, level_id)`

**Validation Rules**:
- Both `game_id` and `level_id` must reference existing records
- Duplicate mappings are prevented by primary key constraint

**Relationships**:
- Many-to-One with `Game`
- Many-to-One with `Level`

**Business Rules**:
- A game must have at least one associated level (enforced at application layer during game creation)
- Removing a game_level mapping is only allowed if the game has other levels remaining
- When a user starts a game, the system selects the appropriate level based on user progression (business logic, not data model concern)

---

## Extended Entities (Updates to Existing Models)

### 4. GameSession (Updated)

**Description**: Existing entity representing a single gameplay session. Updated to include reference to `Game` entity.

**New Attributes**:

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `game_id` | Integer | NULLABLE (for backward compatibility), FOREIGN KEY → `games.game_id` | Reference to parent game |

**Migration Strategy**:
- Add `game_id` column as NULLABLE
- Backfill existing sessions by joining `game_sessions.level_id` with `game_levels` to derive `game_id`
- Set `game_id` to NOT NULL after backfill completes
- Add index on `game_id` for leaderboard query performance

**Updated Relationships**:
- Many-to-One with `Game` (via `game_id`)
- Many-to-One with `Level` (via `level_id`) - existing relationship maintained

---

## Database Schema (PostgreSQL)

### Table: `games`

```sql
CREATE TABLE games (
  game_id       SERIAL        PRIMARY KEY,
  code          VARCHAR(50)   NOT NULL UNIQUE CHECK (code ~ '^[a-z0-9-]+$'),
  name          VARCHAR(100)  NOT NULL CHECK (LENGTH(TRIM(name)) >= 1),
  description   TEXT          NOT NULL CHECK (LENGTH(description) BETWEEN 10 AND 500),
  icon_path     VARCHAR(255)  CHECK (icon_path IS NULL OR icon_path ~ '^/games/[a-z0-9-]+\.(svg|png|jpg|webp)$'),
  category      VARCHAR(50),
  display_order INT           NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_games_active_order ON games(is_active, display_order) WHERE is_active = TRUE;
CREATE INDEX idx_games_category ON games(category) WHERE category IS NOT NULL;
```

### Table: `game_levels`

```sql
CREATE TABLE game_levels (
  game_id INT NOT NULL REFERENCES games(game_id) ON DELETE RESTRICT,
  level_id INT NOT NULL REFERENCES levels(level_id) ON DELETE RESTRICT,
  PRIMARY KEY (game_id, level_id)
);

-- Indexes
CREATE INDEX idx_game_levels_game ON game_levels(game_id);
CREATE INDEX idx_game_levels_level ON game_levels(level_id);
```

### Table: `game_sessions` (Migration - Add Column)

```sql
-- Migration Up
ALTER TABLE game_sessions 
  ADD COLUMN game_id INT REFERENCES games(game_id) ON DELETE RESTRICT;

-- Backfill game_id from level_id via game_levels junction table
UPDATE game_sessions gs
SET game_id = gl.game_id
FROM game_levels gl
WHERE gs.level_id = gl.level_id;

-- Make game_id NOT NULL after backfill
ALTER TABLE game_sessions 
  ALTER COLUMN game_id SET NOT NULL;

-- Add index for leaderboard queries
CREATE INDEX idx_game_sessions_game_finished_score 
  ON game_sessions(game_id, finished_at, total_score) 
  WHERE finished_at IS NOT NULL;
```

---

## Type Definitions

### Backend (Go)

```go
// backend/internal/modules/game/model/game.go
package model

import "time"

type Game struct {
    GameID       int64     `json:"game_id" db:"game_id"`
    Code         string    `json:"code" db:"code"`
    Name         string    `json:"name" db:"name"`
    Description  string    `json:"description" db:"description"`
    IconPath     *string   `json:"icon_path" db:"icon_path"` // Nullable
    Category     *string   `json:"category" db:"category"`   // Nullable
    DisplayOrder int       `json:"display_order" db:"display_order"`
    IsActive     bool      `json:"is_active" db:"is_active"`
    CreatedAt    time.Time `json:"created_at" db:"created_at"`
    UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

type LeaderboardEntry struct {
    Rank       int       `json:"rank"`
    UserID     int64     `json:"user_id"`
    Username   string    `json:"username"`
    Score      int       `json:"score"`
    AchievedAt time.Time `json:"achieved_at"`
}

type GameLevel struct {
    GameID  int64 `json:"game_id" db:"game_id"`
    LevelID int64 `json:"level_id" db:"level_id"`
}
```

### Frontend (TypeScript)

```typescript
// frontend/src/types/index.ts

export interface Game {
  game_id: number;
  code: string;
  name: string;
  description: string;
  icon_path: string | null;
  category: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string; // ISO 8601 timestamp
  updated_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  score: number;
  achieved_at: string; // ISO 8601 timestamp
}

export interface GameWithLeaderboard extends Game {
  leaderboard: LeaderboardEntry[];
}
```

---

## Data Flow

### 1. Home Page Load

```text
Frontend Request:
  GET /api/v1/games

Backend Processing:
  1. Query games WHERE is_active = TRUE ORDER BY display_order, name
  2. For each game:
     a. Query top 10 leaderboard entries (see aggregation logic)
     b. Attach leaderboard to game object
  3. Return array of GameWithLeaderboard

Frontend Rendering:
  - Display games in grid layout (GameGrid component)
  - Each game shows GameCard with embedded Leaderboard component
```

### 2. Game Selection Flow

```text
User Action:
  Click on game card

Frontend Processing:
  1. Check authentication status (JWT in localStorage)
  2. If authenticated:
     → Navigate to /game/{game.code}
  3. If not authenticated:
     → Navigate to /login?redirect_to=/game/{game.code}

Backend Processing (after login):
  1. Validate redirect_to parameter against allowlist
  2. Return JWT token
  3. Frontend redirects to /game/{game.code}
```

### 3. Leaderboard Update (Future Consideration)

```text
Event:
  User completes game session

Backend Processing:
  1. Save game_session with total_score
  2. Invalidate Redis cache for game's leaderboard (key: "leaderboard:{game_id}")
  3. Next leaderboard query will recompute and cache

Frontend:
  - Displays cached leaderboard (5-minute TTL)
  - User's new score may not appear immediately (eventual consistency acceptable)
```

---

## Validation Summary

| Entity | Required Validations | Application Layer | Database Layer |
|--------|---------------------|-------------------|----------------|
| **Game** | code format, name non-empty, description length | Go validator tags | CHECK constraints, UNIQUE index |
| **LeaderboardEntry** | rank 1-10, score non-negative | Service layer during aggregation | N/A (derived entity) |
| **GameLevel** | foreign key validity | ORM relationships | FOREIGN KEY constraints |
| **GameSession** | game_id references valid game | Service layer | FOREIGN KEY constraint |

---

## Migration Order

1. **002_create_games_table.up.sql**: Create `games` and `game_levels` tables
2. **003_add_game_id_to_sessions.up.sql**: Add `game_id` column to `game_sessions`, backfill, add NOT NULL constraint
3. **0003_seed_games.up.sql**: Insert initial game data and game_levels mappings

---

## Example Data

### Games Table

| game_id | code | name | description | icon_path | category | display_order | is_active |
|---------|------|------|-------------|-----------|----------|---------------|-----------|
| 1 | word-scramble | Word Scramble | Unscramble letters to form correct English words. Test your spelling skills! | /games/word-scramble.svg | vocabulary | 1 | TRUE |
| 2 | vocab-quiz | Vocabulary Quiz | Match words with their definitions. Expand your vocabulary knowledge! | /games/vocab-quiz.svg | vocabulary | 2 | TRUE |
| 3 | spelling-challenge | Spelling Challenge | Listen and spell words correctly. Perfect your English spelling! | /games/spelling-challenge.svg | mixed | 3 | TRUE |

### LeaderboardEntry (for game_id = 1)

| rank | user_id | username | score | achieved_at |
|------|---------|----------|-------|-------------|
| 1 | 42 | vocab_master | 9500 | 2025-11-06T10:30:00Z |
| 2 | 17 | quick_learner | 8700 | 2025-11-05T14:20:00Z |
| 3 | 89 | word_wizard | 8200 | 2025-11-07T08:15:00Z |

---

## Next Steps

1. ✅ Data models defined with attributes, relationships, and validation rules
2. ⏭️ Generate OpenAPI contracts based on these models
3. ⏭️ Create quickstart guide referencing these schemas
4. ⏭️ Implement migrations in backend/migrations/
5. ⏭️ Implement model structs in backend/internal/modules/game/model/
6. ⏭️ Implement TypeScript types in frontend/src/types/

