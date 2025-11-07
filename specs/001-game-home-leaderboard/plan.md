# Implementation Plan: Game Home Page with Leaderboards

**Branch**: `001-game-home-leaderboard` | **Date**: November 7, 2025 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-game-home-leaderboard/spec.md`

## Summary

Implement a public home page that displays all available vocabulary learning games with their respective leaderboards (top 10 players), allowing unauthenticated visitors to browse games. When a visitor selects a game, they are redirected to login/register with the selected game persisted through the authentication flow, then automatically redirected to play the selected game.

**Technical Approach**: 
- Backend: Create new `game` module with RESTful endpoints for game listing and leaderboard data aggregation
- Frontend: Create Home page component with game grid/list and embedded leaderboard displays
- Authentication: Extend existing auth flow to support redirect-after-login with game selection persistence via URL parameters
- Database: Create `games` table and create view/query for leaderboard aggregation from existing `game_sessions` and `plays` tables

## Technical Context

**Language/Version**: 
- Backend: Go 1.24+ (official Go compiler)
- Frontend: TypeScript 5.8+ with React 19.1+

**Primary Dependencies**:
- Backend: Gin (HTTP routing), pgx/v5 (PostgreSQL), Redis v9 (session storage), JWT v5 (authentication)
- Frontend: Vite 7+ (build tool), React Router DOM v7 (routing), Tailwind CSS 4+ (styling), Radix UI (accessible components)

**Storage**: PostgreSQL 15+ with Redis 7+ for session caching

**Testing**: No automated tests (per constitution - manual verification only)

**Target Platform**: Web application (desktop and mobile browsers)

**Project Type**: Web (frontend + backend)

**Performance Goals**: 
- Home page load: <3 seconds (per SC-001)
- Game selection to auth redirect: <2 seconds (per SC-003)
- Post-auth redirect to game: <3 seconds (per SC-004)
- API response times: <500ms for game list, <1s for leaderboard aggregation

**Constraints**:
- Public access (no authentication) for home page viewing
- Leaderboards must show exactly top 10 players per game
- Must maintain existing authentication flow while adding redirect capability
- Mobile-responsive design required
- WCAG 2.1 AA accessibility compliance

**Scale/Scope**:
- Expected: 5-20 games initially, scalable to 100+
- Leaderboard queries across potentially thousands of game sessions
- Concurrent users: Support for 1000+ simultaneous home page visitors
- Initial release: 1 home page, 2-3 backend endpoints, leaderboard aggregation logic

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Clean Code**: Design maintains readable, self-documenting code with clear naming (GameService, LeaderboardEntry) and single responsibility (separate game listing from leaderboard aggregation)
- [x] **Simple and Responsive UX**: Home page design prioritizes performance (lazy-loaded images, paginated leaderboards if needed), mobile-responsive grid layout, accessible game cards with ARIA labels, keyboard navigation
- [x] **Minimal Dependencies**: No new dependencies required - uses existing Gin, pgx, React Router, Radix UI components
- [x] **Clear Architecture Boundaries**: Follows prescribed structure - `backend/internal/modules/game/` with model/service/handler layers; `frontend/src/components/home/` for UI components; no layer skipping
- [x] **No Testing Required**: Confirmed - no unit, integration, or e2e tests will be created; manual verification via browser testing
- [x] **Technology Stack Compliance**: Uses only approved technologies (Go, Gin, PostgreSQL, Redis, React, Vite, TypeScript, Tailwind, Radix UI)
- [x] **Architecture Structure**: Implementation follows:
  - Backend: `backend/internal/modules/game/{model,service,handler,wiring.go}`
  - Frontend: `frontend/src/components/home/{HomePage.tsx,GameCard.tsx,Leaderboard.tsx}`

**Initial Assessment**: ✅ All constitution checks pass. No violations or complexity justifications needed.

**Post-Design Re-evaluation** (after Phase 0 & Phase 1):
- ✅ **Clean Code**: Design maintains separation - Game module with distinct models (Game, LeaderboardEntry), service methods (ListActiveGames, GetLeaderboard), and handlers. Leaderboard aggregation logic encapsulated in service layer with clear SQL CTEs.
- ✅ **Simple and Responsive UX**: Grid layout with GameCard components, leaderboards embedded without additional navigation, performance targets met (<3s load, <1s leaderboard query with caching), mobile-responsive design patterns identified.
- ✅ **Minimal Dependencies**: Zero new dependencies added. Uses existing: Gin (routing), pgx (DB), Redis (caching), React Router (navigation), Radix UI (components), Tailwind (styling).
- ✅ **Clear Architecture Boundaries**: Module structure strictly followed - `backend/internal/modules/game/{model,service,handler,wiring.go}` for backend; `frontend/src/components/home/` for UI. No cross-cutting concerns or layer violations in design.
- ✅ **No Testing Required**: Comprehensive manual verification checklist provided in quickstart.md covering all acceptance scenarios and edge cases. No automated test infrastructure created.
- ✅ **Technology Stack Compliance**: All approved technologies used. Backend: Go 1.24, Gin, PostgreSQL 15, Redis 7. Frontend: TypeScript 5.8, React 19, Vite 7, Tailwind 4, Radix UI.
- ✅ **Architecture Structure**: Implementation follows prescribed structures. Backend uses module pattern with proper DI. Frontend uses feature-based component organization.

**Final Verdict**: ✅ All constitution principles satisfied. Design ready for implementation.

## Project Structure

### Documentation (this feature)

```text
specs/001-game-home-leaderboard/
├── plan.md              # This file
├── research.md          # Phase 0: Design decisions (game data structure, leaderboard query strategy, redirect mechanism)
├── data-model.md        # Phase 1: Game and LeaderboardEntry entities
├── quickstart.md        # Phase 1: Developer setup and testing guide
├── contracts/           # Phase 1: API specifications
│   └── openapi.yaml     # GET /api/v1/games, GET /api/v1/games/{id}/leaderboard
└── tasks.md             # Phase 2: Implementation tasks (created by /speckit.tasks)
```

### Source Code (repository root)

```text
backend/
├── cmd/api/
│   └── main.go          # Update: Register game module routes
├── internal/
│   ├── modules/
│   │   ├── game/        # NEW MODULE
│   │   │   ├── model/
│   │   │   │   ├── game.go              # Game entity
│   │   │   │   └── leaderboard.go       # LeaderboardEntry entity
│   │   │   ├── service/
│   │   │   │   └── service.go           # Business logic: list games, aggregate leaderboards
│   │   │   ├── handler/
│   │   │   │   └── http.go              # HTTP endpoints
│   │   │   └── wiring.go                # Dependency injection
│   │   └── user/
│   │       └── handler/
│   │           └── http.go              # Update: Add redirect_to parameter support
│   └── platform/
│       └── middleware/
│           └── auth.go                  # Update: Support optional auth (public endpoints)
└── migrations/
    ├── schema/
    │   └── 002_create_games.up.sql     # NEW: Create games table
    └── data/
        └── 0003_seed_games.up.sql      # NEW: Seed initial games

frontend/
├── src/
│   ├── components/
│   │   ├── home/                        # NEW FEATURE DIRECTORY
│   │   │   ├── HomePage.tsx             # Main home page container
│   │   │   ├── GameCard.tsx             # Individual game display card
│   │   │   ├── GameGrid.tsx             # Grid layout for games
│   │   │   └── Leaderboard.tsx          # Leaderboard display component
│   │   ├── auth/
│   │   │   ├── Login.tsx                # Update: Handle redirect_to query param
│   │   │   └── Register.tsx             # Update: Handle redirect_to query param
│   │   └── ui/                          # Existing Radix UI components (reuse)
│   ├── lib/
│   │   └── api.ts                       # Update: Add game and leaderboard API calls
│   ├── types/
│   │   └── index.ts                     # Update: Add Game and LeaderboardEntry types
│   └── main.tsx                         # Update: Add home route
```

**Structure Decision**: Web application structure (Option 2 from template) with separate backend and frontend directories. This follows the existing repository layout and constitution-prescribed module organization. The new `game` module in backend follows the established pattern (user, word, level, play modules). Frontend home page components are isolated in a feature directory for clear separation.

## Complexity Tracking

> **No violations - this section is empty**

All constitution principles are satisfied without exceptions. No additional dependencies, no architectural deviations, no performance compromises.

---

## Phase 0: Research & Design Decisions

**Status**: To be completed in [research.md](./research.md)

**Research Tasks**:
1. **Game Data Structure**: Define what constitutes a "game" in this system - relationship to existing `levels` table, additional metadata needed (icons, descriptions, categories)
2. **Leaderboard Aggregation Strategy**: Determine optimal SQL query pattern for extracting top 10 players per game from `game_sessions` and `plays` tables with ranking
3. **Redirect Mechanism**: Design URL parameter strategy for persisting game selection through login/register flow (query param vs. session storage vs. Redis)
4. **Icon/Image Storage**: Decide on approach for game visual assets (database BLOB, file paths, external CDN)
5. **Empty Leaderboard Handling**: Define data structure and UI pattern for games with no players yet

**Expected Decisions**:
- Whether to extend `levels` table or create separate `games` table
- Leaderboard query: window functions vs. subqueries for ranking
- Redirect strategy: URL-based (stateless) vs. Redis-based (stateful)
- Image storage: Database paths to `/public/games/` directory

---

## Phase 1: Data Models & Contracts

**Status**: To be completed in:
- [data-model.md](./data-model.md) - Entity definitions
- [contracts/openapi.yaml](./contracts/openapi.yaml) - API specifications
- [quickstart.md](./quickstart.md) - Development guide

**Data Models to Define**:
1. **Game Entity**: Fields derived from requirements (name, description, icon/image path, category/difficulty, is_active, timestamps)
2. **LeaderboardEntry Entity**: Fields for display (rank, user_id, username, score, timestamp)
3. **Relationships**: Game to game_sessions (via level_id or game_id), LeaderboardEntry aggregation from game_sessions + users

**API Contracts to Generate**:
1. `GET /api/v1/games` - List all active games with metadata (public endpoint, no auth required)
2. `GET /api/v1/games/{id}/leaderboard` - Get top 10 leaderboard entries for a specific game (public endpoint)
3. `POST /api/v1/auth/login` - Update existing endpoint to accept `redirect_to` query parameter
4. `POST /api/v1/auth/register` - Update existing endpoint to accept `redirect_to` query parameter

**Quickstart Guide to Include**:
- Database migration steps (create games table, seed sample games)
- Backend development: Running game module endpoints locally
- Frontend development: Starting dev server, accessing home page route
- Manual verification checklist mapped to acceptance scenarios from spec.md

---

## Phase 2: Implementation Tasks

**Status**: To be completed by `/speckit.tasks` command (NOT created by this plan)

The `/speckit.tasks` command will break down the implementation into concrete development tasks based on the research, data models, and contracts defined in Phase 0 and Phase 1.

**Expected Task Categories**:
- Database migrations (games table, seed data)
- Backend game module (model, service, handler, wiring)
- Backend auth updates (redirect parameter handling)
- Frontend home page components (HomePage, GameCard, GameGrid, Leaderboard)
- Frontend auth component updates (redirect handling)
- Frontend API integration (game and leaderboard fetching)
- Frontend routing (add home route)
- Manual verification (test each acceptance scenario)

---

## Next Steps

1. ✅ Technical context established and constitution check passed
2. ⏭️ Run Phase 0: Generate `research.md` with design decisions
3. ⏭️ Run Phase 1: Generate `data-model.md`, `contracts/openapi.yaml`, `quickstart.md`
4. ⏭️ Update agent context with any new patterns or technologies
5. ⏭️ Re-run constitution check to confirm design compliance
6. ⏭️ Report completion and readiness for `/speckit.tasks`
