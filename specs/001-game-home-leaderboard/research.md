# Research & Design Decisions: Game Home Page with Leaderboards

**Feature**: Game Home Page with Leaderboards  
**Date**: November 7, 2025  
**Phase**: 0 - Research and Architecture Decisions

## Overview

This document captures key design decisions made during the research phase for implementing the game home page with leaderboards feature. Each decision includes rationale, alternatives considered, and implementation implications.

---

## Decision 1: Game Data Structure

### Decision

Create a separate `games` table independent from the existing `levels` table.

### Rationale

While the existing `levels` table contains game difficulty and scoring configuration, it's designed for gameplay mechanics rather than user-facing presentation. The home page requires additional display-oriented metadata:

- **Visual assets**: Icon/image paths for visual representation (FR-002)
- **Marketing copy**: User-facing descriptions distinct from internal level metadata
- **Categorization**: Grouping games by learning focus (vocabulary, grammar, pronunciation)
- **Presentation order**: Explicit ordering for home page display
- **Activation control**: Ability to hide games from home page without affecting gameplay data

**Architectural benefit**: Separates presentation concerns (what users see on home page) from gameplay concerns (how levels function in-game). This follows the Single Responsibility Principle from the constitution.

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Extend `levels` table** | Mixes presentation logic with gameplay mechanics; levels and games may have different lifecycles (multiple levels could belong to one "game" concept) |
| **Generate games dynamically from levels** | Requires hardcoding display metadata in code rather than database; less flexible for content updates |
| **Store metadata in Redis** | Loses data persistence guarantees; inappropriate for content that changes infrequently |

### Implementation Implications

- **Migration**: Create `002_create_games.up.sql` with schema for games table
- **Relationship**: `games.game_id` will be added as foreign key to `game_sessions` table (requires migration to update existing sessions)
- **Data seeding**: Create `0003_seed_games.up.sql` to populate initial games
- **Backward compatibility**: Existing `level_id` in `game_sessions` remains; games and levels have a many-to-one relationship (one game can contain multiple levels)

**Schema Design** (to be detailed in data-model.md):
```sql
CREATE TABLE games (
  game_id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon_path VARCHAR(255),
  category VARCHAR(50),
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Decision 2: Leaderboard Aggregation Strategy

### Decision

Use PostgreSQL window functions (`ROW_NUMBER()`) with a CTE (Common Table Expression) to generate ranked leaderboards, querying the top score per user per game from `game_sessions`.

### Rationale

**Performance**: Window functions are optimized in PostgreSQL 15+ and allow ranking in a single query pass without subqueries for each row.

**Accuracy**: Ranking by `MAX(total_score)` ensures each user appears once with their best performance, avoiding duplicate entries for users with multiple sessions.

**Maintainability**: Query logic is centralized in the service layer, making it easy to adjust ranking criteria (e.g., tie-breaking by timestamp) without touching multiple codebases.

### Query Pattern

```sql
WITH user_best_scores AS (
  SELECT 
    gs.game_id,
    gs.user_id,
    MAX(gs.total_score) as best_score,
    MAX(gs.finished_at) as last_played
  FROM game_sessions gs
  WHERE gs.game_id = $1 
    AND gs.finished_at IS NOT NULL  -- Only completed sessions
  GROUP BY gs.game_id, gs.user_id
),
ranked_scores AS (
  SELECT
    ubs.user_id,
    u.username,
    ubs.best_score,
    ubs.last_played,
    ROW_NUMBER() OVER (ORDER BY ubs.best_score DESC, ubs.last_played ASC) as rank
  FROM user_best_scores ubs
  JOIN users u ON ubs.user_id = u.user_id
  WHERE u.is_active = TRUE
)
SELECT * FROM ranked_scores WHERE rank <= 10;
```

**Tie-breaking**: Users with identical scores are ranked by earliest achievement (`last_played ASC`), rewarding faster learners.

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Subquery for each row** | O(n²) complexity; significantly slower for large datasets |
| **Application-side ranking** | Transfers more data from DB to app; breaks single source of truth principle |
| **Materialized view** | Over-engineering for current scale; adds complexity for real-time updates |
| **Rank by total plays** | Less meaningful than best score; doesn't reflect skill progression |

### Implementation Implications

- **Service layer**: `GameService.GetLeaderboard(gameID)` encapsulates query logic
- **Caching strategy**: Redis cache leaderboard results with 5-minute TTL to reduce DB load (invalidate on new session completion)
- **Empty handling**: Query returns empty array for games with no completed sessions; handler returns 200 with empty array (UI displays "Be the first to play!")
- **Index requirement**: Add composite index on `(game_id, finished_at, total_score)` for optimal query performance

---

## Decision 3: Game Selection Redirect Mechanism

### Decision

Use URL query parameter (`redirect_to`) for persisting game selection through authentication flow, encoded as `/game/{gameId}`.

### Rationale

**Stateless**: No server-side session storage required; aligns with REST principles and simplifies horizontal scaling.

**Bookmarkable**: Users can bookmark direct links like `/login?redirect_to=/game/puzzle-master`, improving UX for returning visitors.

**Simple**: No Redis key management, expiration logic, or cross-tab synchronization needed.

**Transparent**: User can see intended destination in URL, improving trust and predictability.

### Flow

1. User clicks game on home page → Navigate to `/game/{gameId}`
2. Frontend detects unauthenticated state → Redirect to `/login?redirect_to=/game/{gameId}`
3. User completes login/register → Backend returns JWT + validates `redirect_to` parameter
4. Frontend stores JWT → Navigates to `redirect_to` path
5. User lands on game page with authentication

**Security**: Backend validates `redirect_to` parameter against allowlist pattern (`^/game/[a-z0-9-]+$`) to prevent open redirect vulnerabilities.

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Redis session storage** | Adds state management complexity; requires expiration logic; fails if user switches devices mid-flow |
| **LocalStorage** | Not accessible to backend; requires frontend to append to every request; cross-origin issues |
| **Cookies** | More complex than query params for this use case; requires cookie management and CSRF consideration |
| **Implicit redirect to last game** | Poor UX if user wants to try different game; requires tracking "last viewed game" |

### Implementation Implications

- **Backend**: Update `POST /api/v1/auth/login` and `POST /api/v1/auth/register` to accept optional `redirect_to` query parameter
- **Validation**: Add middleware function `ValidateRedirectURL(url string) bool` to check against allowlist pattern
- **Frontend auth components**: Update `Login.tsx` and `Register.tsx` to:
  1. Extract `redirect_to` from URL query params
  2. Pass as query param in API calls
  3. Navigate to `redirect_to` on successful auth (default to `/dashboard` if not provided)
- **Frontend routing**: Add route protection on `/game/:id` to check authentication (redirect to login with `redirect_to` if unauthenticated)

---

## Decision 4: Icon/Image Storage Strategy

### Decision

Store game icons as static files in `frontend/public/games/` directory, with paths stored in database as `/games/{icon-filename}.svg` or `/games/{icon-filename}.png`.

### Rationale

**Performance**: Static files served directly by CDN/web server without application processing; optimal for immutable assets.

**Simplicity**: No BLOB storage, base64 encoding, or external CDN integration needed; follows constitution's Minimal Dependencies principle.

**Developer experience**: Designers can update icons by dropping files in public directory without database migrations.

**Caching**: Browser caches static assets automatically with standard HTTP cache headers.

### File Organization

```text
frontend/public/games/
├── word-scramble.svg
├── vocabulary-quiz.svg
├── spelling-challenge.svg
└── pronunciation-practice.svg
```

**Database storage**: `games.icon_path` stores relative path (e.g., `/games/word-scramble.svg`)

**Frontend rendering**: `<img src={game.icon_path} alt={game.name} />`

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Database BLOB storage** | Increases DB size; slower retrieval; requires base64 encoding for web display; violates Minimal Dependencies |
| **External CDN (S3, Cloudinary)** | Adds external dependency; requires API keys and upload process; over-engineering for ~10-20 icons |
| **Inline SVG in DB** | Mixes content with presentation; harder to update icons; database backups bloated with SVG code |
| **Dynamic image generation** | Extreme over-engineering; no requirement for dynamic icons |

### Implementation Implications

- **Migration**: Seed data includes icon paths (e.g., `icon_path = '/games/word-scramble.svg'`)
- **Fallback**: Frontend displays default icon if `icon_path` is null or file not found
- **Validation**: Backend validation ensures `icon_path` matches pattern `^/games/[a-z0-9-]+\.(svg|png|jpg|webp)$`
- **Asset pipeline**: Icons committed to git repository; no separate deployment step needed

---

## Decision 5: Empty Leaderboard Handling

### Decision

Return HTTP 200 with empty array `[]` from leaderboard API when no players exist; frontend displays placeholder message "Be the first to play!".

### Rationale

**Semantic correctness**: Empty leaderboard is not an error condition (404/500); it's valid data representing "no players yet" state.

**Consistent API contract**: Same response structure (`{ leaderboard: LeaderboardEntry[] }`) whether data exists or not; simplifies frontend parsing.

**User experience**: Placeholder message motivates action (encourages user to be the first player) rather than confusing users with error states.

### Response Examples

**Game with players:**
```json
{
  "game_id": 1,
  "game_name": "Word Scramble",
  "leaderboard": [
    { "rank": 1, "user_id": 42, "username": "vocab_master", "score": 9500, "timestamp": "2025-11-06T10:30:00Z" },
    { "rank": 2, "user_id": 17, "username": "quick_learner", "score": 8700, "timestamp": "2025-11-05T14:20:00Z" }
  ]
}
```

**Game with no players:**
```json
{
  "game_id": 5,
  "game_name": "Pronunciation Practice",
  "leaderboard": []
}
```

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Return 404 Not Found** | Semantically incorrect; game exists, just no leaderboard data yet |
| **Return null instead of []** | Requires additional null checks in frontend; inconsistent with array-based rendering |
| **Omit leaderboard field** | Breaks API contract consistency; harder to document |
| **Return 204 No Content** | Frontend cannot distinguish from network error; no body for metadata like game_name |

### Implementation Implications

- **Backend**: Service layer returns empty slice `[]LeaderboardEntry{}` when query returns no rows
- **Frontend**: Conditional rendering:
  ```tsx
  {leaderboard.length === 0 ? (
    <EmptyState message="Be the first to play!" />
  ) : (
    <LeaderboardTable entries={leaderboard} />
  )}
  ```
- **Accessibility**: Empty state includes ARIA role and descriptive text for screen readers

---

## Decision 6: Game-Level Relationship Model

### Decision

Establish many-to-many relationship between games and levels: a game can contain multiple levels (difficulty progression), and a level can belong to multiple games (e.g., "Hard" level used in multiple game types).

### Rationale

**Flexibility**: Supports future game expansion where one game type (e.g., "Vocabulary Quiz") has Easy/Medium/Hard levels.

**Leaderboard aggregation**: Leaderboard aggregates scores across all levels within a game, showing overall game mastery rather than level-specific performance.

**Backward compatibility**: Existing `game_sessions.level_id` remains functional; we add `game_id` as a supplementary field derived from level during session creation.

### Schema Relationship

```text
games (1) ←→ (M) game_levels ←→ (M) levels
                     ↓
              game_sessions (stores both game_id and level_id)
```

**Junction table**: `game_levels`
```sql
CREATE TABLE game_levels (
  game_id INT REFERENCES games(game_id),
  level_id INT REFERENCES levels(level_id),
  PRIMARY KEY (game_id, level_id)
);
```

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **One-to-one (game = level)** | Limits future expansion; cannot represent difficulty progression within a game |
| **Game contains levels directly** | Forces re-architecture of existing levels table; high migration risk |
| **Levels contain game_id** | Breaks existing data model; levels are reusable across game types |

### Implementation Implications

- **Migration 002**: Create `games`, `game_levels` tables
- **Migration 003**: Seed `game_levels` mapping (initially 1 game → 1 level for existing levels)
- **Session creation**: When user starts game, backend looks up associated level(s) and creates session with both `game_id` and `level_id`
- **Leaderboard query**: Aggregates `game_sessions` by `game_id` (not `level_id`), summing scores across all levels within the game

---

## Summary of Key Decisions

| Decision Area | Choice | Primary Rationale |
|---------------|--------|-------------------|
| **Game Data** | Separate `games` table | Separation of presentation from gameplay mechanics |
| **Leaderboard Query** | Window functions with CTE | Performance and maintainability for ranking |
| **Redirect Mechanism** | URL query parameter | Stateless, bookmarkable, simple |
| **Icon Storage** | Static files in `/public/games/` | Performance, simplicity, no external dependencies |
| **Empty Leaderboard** | HTTP 200 with empty array | Semantic correctness, consistent API contract |
| **Game-Level Model** | Many-to-many relationship | Flexibility for future multi-level games |

---

## Risk Mitigation

### Performance Risks

**Risk**: Leaderboard queries become slow with millions of game sessions.  
**Mitigation**: 
- Add composite index on `(game_id, finished_at, total_score)`
- Implement Redis caching with 5-minute TTL
- Monitor query performance with Prometheus metrics (queries >500ms trigger alert)

### Security Risks

**Risk**: Open redirect vulnerability via malicious `redirect_to` parameter.  
**Mitigation**: 
- Allowlist validation: only `/game/{gameId}` pattern accepted
- Reject absolute URLs, protocol-relative URLs (`//evil.com`), and JavaScript URLs (`javascript:`)
- Log rejected redirect attempts for security monitoring

### Data Integrity Risks

**Risk**: Orphaned `game_sessions` if games are deleted.  
**Mitigation**:
- `games.is_active` flag for soft deletion (never hard delete games)
- Foreign key constraint with `ON DELETE RESTRICT` prevents deletion of games with sessions
- Admin UI warns when attempting to deactivate games with active players

---

## Next Steps

1. ✅ Research and design decisions documented
2. ⏭️ Phase 1: Define detailed data models in `data-model.md`
3. ⏭️ Phase 1: Generate OpenAPI contracts in `contracts/openapi.yaml`
4. ⏭️ Phase 1: Create developer quickstart guide in `quickstart.md`
5. ⏭️ Update agent context with architectural patterns
6. ⏭️ Re-validate constitution compliance

