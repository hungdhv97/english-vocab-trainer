# Quickstart Guide: Game Home Page with Leaderboards

**Feature**: Game Home Page with Leaderboards  
**Branch**: `001-game-home-leaderboard`  
**Date**: November 7, 2025

## Overview

This guide walks developers through setting up, developing, and manually verifying the Game Home Page with Leaderboards feature. Follow these steps sequentially for the smoothest development experience.

---

## Prerequisites

Ensure your development environment has:

- **Go**: 1.24+ installed
- **Node.js**: 20+ with npm/yarn
- **Docker**: 24+ with Docker Compose
- **PostgreSQL**: 15+ (or use Docker Compose)
- **Redis**: 7+ (or use Docker Compose)
- **Git**: Latest version
- **IDE**: VS Code, GoLand, or similar with Go and TypeScript support

---

## Setup Instructions

### 1. Database Migrations

Navigate to the backend directory and run migrations:

```bash
cd backend

# Start PostgreSQL and Redis (if using Docker Compose)
docker compose up -d postgres redis

# Run schema migrations
migrate -path migrations/schema -database "postgresql://user:password@localhost:5432/english_vocab?sslmode=disable" up

# Expected output:
# 001/u create_tables (successful)
# 002/u create_games_table (successful)
# 003/u add_game_id_to_sessions (successful)

# Run data migrations (seed data)
migrate -path migrations/data -database "postgresql://user:password@localhost:5432/english_vocab?sslmode=disable" up

# Expected output:
# 0001/u seed_minimal (successful)
# 0002/u fill_universe_index (successful)
# 0003/u seed_games (successful)
```

**Verify migrations succeeded:**

```bash
# Connect to PostgreSQL
psql postgresql://user:password@localhost:5432/english_vocab

# Check games table exists and has data
SELECT game_id, code, name FROM games WHERE is_active = TRUE;

# Expected output: 3-5 games listed
# game_id | code           | name
# --------|----------------|------------------
#       1 | word-scramble  | Word Scramble
#       2 | vocab-quiz     | Vocabulary Quiz
#       3 | spelling-challenge | Spelling Challenge

# Check game_levels junction table
SELECT * FROM game_levels LIMIT 5;

# Exit psql
\q
```

### 2. Backend Development Setup

```bash
# Still in backend/ directory

# Install dependencies (if not already done)
go mod download

# Build the backend
go build -o bin/api ./cmd/api

# Run backend server
./bin/api
# OR with hot-reload (requires air or similar):
# air

# Server should start on http://localhost:8080
# Expected console output:
# [GIN-debug] Listening and serving HTTP on :8080
```

**Verify backend is running:**

```bash
# In a new terminal, test the games endpoint
curl http://localhost:8080/api/v1/games

# Expected response (JSON):
{
  "games": [
    {
      "game_id": 1,
      "code": "word-scramble",
      "name": "Word Scramble",
      "description": "Unscramble letters...",
      "icon_path": "/games/word-scramble.svg",
      "category": "vocabulary",
      "display_order": 1,
      "is_active": true,
      "created_at": "2025-11-01T00:00:00Z",
      "updated_at": "2025-11-01T00:00:00Z"
    }
    // ... more games
  ]
}
```

### 3. Frontend Development Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev

# Server should start on http://localhost:5173
# Expected console output:
# VITE v7.0.4  ready in 523 ms
# ➜  Local:   http://localhost:5173/
```

**Verify frontend is running:**

Open browser to `http://localhost:5173` - you should see the existing app (dashboard or login page depending on auth state).

### 4. Place Game Icons

Ensure game icon files exist in the public directory:

```bash
# Still in frontend/ directory

# Create games directory if it doesn't exist
mkdir -p public/games

# Verify icon files exist (or add placeholder icons)
ls public/games/

# Expected output:
# word-scramble.svg
# vocab-quiz.svg
# spelling-challenge.svg

# If icons are missing, you can create placeholder SVGs:
cat > public/games/placeholder.svg << 'EOF'
<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" fill="#4A90E2"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="12">GAME</text>
</svg>
EOF

# Copy placeholder for each game if needed
cp public/games/placeholder.svg public/games/word-scramble.svg
cp public/games/placeholder.svg public/games/vocab-quiz.svg
```

---

## Development Workflow

### Backend Development

**File locations:**
```
backend/internal/modules/game/
├── model/
│   ├── game.go           # Game and LeaderboardEntry structs
│   └── leaderboard.go    # (optional separate file)
├── service/
│   └── service.go        # Business logic: ListGames, GetLeaderboard
├── handler/
│   └── http.go           # HTTP handlers: GET /games, GET /games/:id/leaderboard
└── wiring.go             # Dependency injection setup
```

**Development steps:**

1. **Implement models** (`model/game.go`):
   ```go
   type Game struct {
       GameID       int64     `json:"game_id" db:"game_id"`
       Code         string    `json:"code" db:"code"`
       Name         string    `json:"name" db:"name"`
       // ... (see data-model.md for full definition)
   }
   ```

2. **Implement service** (`service/service.go`):
   ```go
   func (s *Service) ListActiveGames(ctx context.Context) ([]model.Game, error)
   func (s *Service) GetLeaderboard(ctx context.Context, gameID int64) ([]model.LeaderboardEntry, error)
   ```

3. **Implement handlers** (`handler/http.go`):
   ```go
   func (h *Handler) ListGames(c *gin.Context)
   func (h *Handler) GetLeaderboard(c *gin.Context)
   ```

4. **Wire up routes** (`cmd/api/main.go`):
   ```go
   v1.GET("/games", gameHandler.ListGames)
   v1.GET("/games/:id/leaderboard", gameHandler.GetLeaderboard)
   ```

5. **Test endpoints** with curl or Postman:
   ```bash
   curl http://localhost:8080/api/v1/games
   curl http://localhost:8080/api/v1/games/1/leaderboard
   ```

### Frontend Development

**File locations:**
```
frontend/src/components/home/
├── HomePage.tsx          # Main home page container
├── GameCard.tsx          # Individual game display card
├── GameGrid.tsx          # Grid layout for games
└── Leaderboard.tsx       # Leaderboard display component
```

**Development steps:**

1. **Add TypeScript types** (`types/index.ts`):
   ```typescript
   export interface Game { /* ... */ }
   export interface LeaderboardEntry { /* ... */ }
   export interface GameWithLeaderboard extends Game { /* ... */ }
   ```

2. **Add API functions** (`lib/api.ts`):
   ```typescript
   export async function fetchGames(): Promise<Game[]> { /* ... */ }
   export async function fetchLeaderboard(gameId: number): Promise<LeaderboardEntry[]> { /* ... */ }
   ```

3. **Create components**:
   - Start with `GameCard.tsx` (display single game)
   - Then `Leaderboard.tsx` (display leaderboard entries)
   - Then `GameGrid.tsx` (layout multiple GameCards)
   - Finally `HomePage.tsx` (fetch data, compose components)

4. **Add route** (`main.tsx` or routing file):
   ```typescript
   <Route path="/" element={<HomePage />} />
   ```

5. **Update auth components** to handle `redirect_to`:
   - Extract `redirect_to` from URL query params
   - Pass to API on login/register
   - Navigate to `redirect_to` on success

6. **Test in browser**:
   - Navigate to `http://localhost:5173`
   - Verify games display
   - Click game (should redirect to login with `redirect_to` param)
   - Complete login (should redirect to selected game)

---

## Manual Verification Checklist

Use this checklist to verify all acceptance scenarios from [spec.md](./spec.md):

### User Story 1: Browse Available Games (P1)

- [ ] **AS-1.1**: Open home page → All games displayed with names and descriptions
- [ ] **AS-1.2**: Multiple games → Displayed in organized grid/list format
- [ ] **AS-1.3**: Games with icons → Icons displayed correctly (check `/games/*.svg` loads)
- [ ] **AS-1.4**: Game entries → Show name, description, difficulty/category

**Manual test:**
1. Open `http://localhost:5173`
2. Verify games appear without login
3. Count games (should match database: `SELECT COUNT(*) FROM games WHERE is_active = TRUE`)
4. Check layout on mobile (responsive breakpoints at 640px, 768px, 1024px)

### User Story 2: View Game-Specific Leaderboards (P2)

- [ ] **AS-2.1**: Game with players → Leaderboard shows top players
- [ ] **AS-2.2**: Leaderboard → Shows rankings, usernames, scores
- [ ] **AS-2.3**: Multiple games → Each game shows independent leaderboard
- [ ] **AS-2.4**: Game with no players → Shows "Be the first to play!" message
- [ ] **AS-2.5**: Leaderboard → Shows exactly top 10 players (or fewer if <10 players)

**Manual test:**
1. Open home page
2. For each game, verify leaderboard section visible
3. Check one game with players: should show rankings 1-10 (or fewer), usernames, scores
4. Check one game without players: should show empty state message
5. Verify leaderboards are different across games (not identical data)

**Database setup for testing:**
```sql
-- Create test users and sessions for game_id = 1
INSERT INTO users (username, password_hash) VALUES 
  ('test_player1', 'hash1'),
  ('test_player2', 'hash2');

INSERT INTO game_sessions (user_id, game_id, level_id, total_score, finished_at) VALUES
  (1, 1, 1, 9500, NOW()),
  (2, 1, 1, 8700, NOW());

-- Verify leaderboard query works
SELECT 
  ROW_NUMBER() OVER (ORDER BY MAX(gs.total_score) DESC) as rank,
  u.username,
  MAX(gs.total_score) as score
FROM game_sessions gs
JOIN users u ON gs.user_id = u.user_id
WHERE gs.game_id = 1 AND gs.finished_at IS NOT NULL
GROUP BY u.user_id, u.username
ORDER BY rank
LIMIT 10;
```

### User Story 3: Select and Initiate Game Play (P1)

- [ ] **AS-3.1**: Click game → System checks authentication status
- [ ] **AS-3.2**: Click game (not authenticated) → Redirected to login/register page
- [ ] **AS-3.3**: Redirect to auth → Game selection remembered (check URL: `/login?redirect_to=/game/{code}`)
- [ ] **AS-3.4**: Complete login/register → Redirected to selected game automatically

**Manual test:**
1. Clear cookies/localStorage to simulate logged-out state
2. Click any game card
3. Verify redirect to `/login?redirect_to=/game/word-scramble` (or similar)
4. Note the `redirect_to` parameter in URL
5. Complete login
6. Verify automatic navigation to `/game/word-scramble` (not to dashboard)

### User Story 4: Authentication for Game Access (P1)

- [ ] **AS-4.1**: Login/register page → Shows both login and registration options
- [ ] **AS-4.2**: New user registers → Account created and authenticated
- [ ] **AS-4.3**: Existing user logs in → Authenticated and redirected to selected game
- [ ] **AS-4.4**: Invalid credentials → Error message displayed, can retry
- [ ] **AS-4.5**: Successful auth → Directed to originally selected game (not home page)

**Manual test:**
1. From home page, click a game (e.g., "Vocab Quiz")
2. On login/register page, verify both tabs/options visible
3. Try registering new user → Should succeed, redirect to `/game/vocab-quiz`
4. Log out, go back to home
5. Click different game (e.g., "Word Scramble")
6. Log in with existing user → Should redirect to `/game/word-scramble`
7. Try login with wrong password → Should show error, stay on login page

### Edge Cases

- [ ] **Edge-1**: Game with no leaderboard data → "Be the first to play!" displayed
- [ ] **Edge-2**: User closes browser after clicking game → Redirect lost (expected behavior, not a bug)
- [ ] **Edge-3**: Game removed while viewing home page → Old data shown until refresh (acceptable)
- [ ] **Edge-4**: User already authenticated clicks game → Immediately navigate to game (no login redirect)
- [ ] **Edge-5**: Leaderboard updating during view → Old cached data shown for up to 5 minutes (acceptable)
- [ ] **Edge-6**: Very long game name/description → Text truncated with ellipsis in UI
- [ ] **Edge-7**: Login/register fails (500 error) → Error message displayed, can retry
- [ ] **Edge-8**: User navigates back to home after starting auth → Home page still works, can select different game

**Manual test for Edge-4:**
1. Log in and stay authenticated
2. Navigate to home page (`/`)
3. Click any game
4. Should immediately navigate to game page without login redirect

**Manual test for Edge-6:**
```sql
-- Temporarily update a game with very long text
UPDATE games SET description = 'This is an extremely long description that goes on and on and on and should be truncated in the UI with ellipsis to prevent layout issues...' WHERE game_id = 1;
```
Verify UI truncates or wraps text appropriately (no overflow).

### Success Criteria Verification

- [ ] **SC-001**: Home page loads in <3 seconds (check Network tab in DevTools)
- [ ] **SC-002**: Leaderboards visible without additional clicks
- [ ] **SC-003**: Game selection to auth redirect happens in <2 seconds
- [ ] **SC-004**: Post-auth redirect to game in <3 seconds
- [ ] **SC-005**: 95% redirect success rate (manual testing: 10 attempts, 9-10 should succeed)
- [ ] **SC-006**: Leaderboard info clearly displayed for all games with data
- [ ] **SC-007**: Games are distinguishable (ask another person: "Can you tell these games apart?")
- [ ] **SC-008**: Auth requirement is clear (users don't try to bypass or express confusion)

---

## Troubleshooting

### Backend Issues

**Problem**: `GET /api/v1/games` returns 404

- **Solution**: Check route registration in `cmd/api/main.go`
- Verify game module is wired up: `gameHandler := game.NewHandler(gameService)`
- Restart backend server

**Problem**: Leaderboard query is slow (>1s)

- **Solution**: Check index exists: `CREATE INDEX idx_game_sessions_game_finished_score ON game_sessions(game_id, finished_at, total_score) WHERE finished_at IS NOT NULL`
- Verify Redis cache is working (check logs for cache hits/misses)

**Problem**: Empty leaderboard returns 500 error

- **Solution**: Service should return empty slice `[]model.LeaderboardEntry{}`, not nil
- Handler should return 200 with `{"leaderboard": []}`

### Frontend Issues

**Problem**: Games not displaying on home page

- **Solution**: Check API call in `HomePage.tsx` is correct: `fetchGames()`
- Open browser DevTools Network tab, verify `GET /api/v1/games` request succeeds (200)
- Check CORS headers if running frontend on different port than backend

**Problem**: Icons not loading (404 errors)

- **Solution**: Verify files exist in `public/games/*.svg`
- Check `icon_path` in database matches file names
- Ensure Vite is serving `/games/` static directory

**Problem**: Redirect after login not working

- **Solution**: Check `redirect_to` parameter is preserved through login flow
- Verify frontend extracts param: `const redirectTo = new URLSearchParams(location.search).get('redirect_to')`
- After successful login, verify navigation: `navigate(redirectTo || '/dashboard')`

### Database Issues

**Problem**: Migrations fail with "table already exists"

- **Solution**: Check migration version: `SELECT * FROM schema_migrations`
- If stuck, manually drop tables and re-run migrations (development only!)

**Problem**: No games showing in API response despite successful migration

- **Solution**: Verify data migration ran: `SELECT COUNT(*) FROM games`
- Check `is_active` flag: `SELECT * FROM games WHERE is_active = FALSE`
- Re-run data migration: `migrate -path migrations/data -database "..." up`

---

## Performance Testing

### Load Testing (Optional)

Use `ab` (Apache Bench) or `wrk` to verify performance goals:

```bash
# Test games endpoint (should handle 1000+ req/s)
ab -n 1000 -c 10 http://localhost:8080/api/v1/games

# Test leaderboard endpoint (should respond in <1s)
ab -n 100 -c 5 http://localhost:8080/api/v1/games/1/leaderboard
```

**Expected results:**
- Games endpoint: >500 requests/second, p95 latency <200ms
- Leaderboard endpoint: p95 latency <1s

### Browser Performance

Use Chrome DevTools Lighthouse:

1. Open home page
2. Run Lighthouse audit (Performance category)
3. Verify scores:
   - Performance: >80
   - First Contentful Paint: <2s
   - Time to Interactive: <3s

---

## Next Steps After Verification

Once all checklist items pass:

1. ✅ Commit changes to feature branch `001-game-home-leaderboard`
2. ⏭️ Create pull request with screenshots of manual testing
3. ⏭️ Request code review from team member
4. ⏭️ Merge to main after approval
5. ⏭️ Deploy to production environment
6. ⏭️ Monitor Prometheus metrics for API performance
7. ⏭️ Monitor Grafana dashboards for user engagement

---

## Reference Links

- **Spec**: [spec.md](./spec.md) - Full feature specification
- **Research**: [research.md](./research.md) - Design decisions and rationale
- **Data Model**: [data-model.md](./data-model.md) - Entity definitions
- **API Contracts**: [contracts/openapi.yaml](./contracts/openapi.yaml) - OpenAPI specification
- **Constitution**: [.specify/memory/constitution.md](../../.specify/memory/constitution.md) - Project principles

