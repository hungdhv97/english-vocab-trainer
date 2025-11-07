# Tasks: Game Home Page with Leaderboards

**Feature Branch**: `001-game-home-leaderboard`  
**Input**: Design documents from `/specs/001-game-home-leaderboard/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/openapi.yaml ✅

**NO TESTING POLICY**: This project does NOT require automated tests per Constitution Principle V. Do NOT create unit tests, integration tests, or e2e tests. Manual verification and production monitoring suffice.

**Organization**: Tasks are grouped by user story to enable independent implementation and manual verification of each story. Each phase represents a complete, independently deployable increment.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

This is a **web application** with:
- Backend: `backend/internal/modules/`, `backend/migrations/`
- Frontend: `frontend/src/components/`, `frontend/src/lib/`, `frontend/src/types/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database migrations and static asset setup

- [x] T001 Create database migration file `backend/migrations/schema/002_create_games.up.sql` for `games` and `game_levels` tables
- [x] T002 [P] Create database migration file `backend/migrations/schema/002_create_games.down.sql` for rollback
- [x] T003 Create database migration file `backend/migrations/schema/003_add_game_id_to_sessions.up.sql` to add `game_id` column to `game_sessions` table with backfill logic
- [x] T004 [P] Create database migration file `backend/migrations/schema/003_add_game_id_to_sessions.down.sql` for rollback
- [x] T005 Create data migration file `backend/migrations/data/0003_seed_games.up.sql` with initial game data (3-5 games with icon paths, descriptions, categories)
- [x] T006 [P] Create data migration file `backend/migrations/data/0003_seed_games.down.sql` for rollback
- [x] T007 [P] Create placeholder game icon files in `frontend/public/games/` directory (word-scramble.svg, vocab-quiz.svg, spelling-challenge.svg) or copy existing icons

**Checkpoint**: Database schema and seed data ready; run migrations before proceeding

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend module structure and type definitions that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Create backend model `backend/internal/modules/game/model/game.go` with `Game` struct (see data-model.md for fields)
- [x] T009 [P] Create backend model `backend/internal/modules/game/model/leaderboard.go` with `LeaderboardEntry` struct
- [x] T010 [P] Create frontend types in `frontend/src/types/index.ts` - add `Game`, `LeaderboardEntry`, and `GameWithLeaderboard` interfaces
- [x] T011 Create backend service struct in `backend/internal/modules/game/service/service.go` with constructor (accepts db pool and Redis client)
- [x] T012 [P] Create backend handler struct in `backend/internal/modules/game/handler/http.go` with constructor (accepts service)
- [x] T013 Create wiring file `backend/internal/modules/game/wiring.go` for dependency injection setup (NewService, NewHandler functions)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Browse Available Games (Priority: P1) 🎯 MVP

**Goal**: Visitors can view all active games on home page with names, descriptions, icons, and categories without authentication

**Manual Verification**: Open `http://localhost:5173` without logging in and see games displayed in grid format with icons and descriptions

### Backend Implementation for User Story 1

- [x] T014 [US1] Implement `ListActiveGames(ctx context.Context) ([]model.Game, error)` method in `backend/internal/modules/game/service/service.go` - query games WHERE is_active=TRUE ORDER BY display_order, name
- [x] T015 [US1] Implement `ListGames(c *gin.Context)` handler in `backend/internal/modules/game/handler/http.go` - calls service, returns JSON response with games array
- [x] T016 [US1] Register route `GET /api/v1/games` in `backend/cmd/api/main.go` - wire up game module and add route (public endpoint, no auth middleware)

### Frontend Implementation for User Story 1

- [x] T017 [P] [US1] Create `fetchGames()` function in `frontend/src/lib/api.ts` - calls GET /api/v1/games, returns Promise<Game[]>
- [x] T018 [P] [US1] Create `GameCard.tsx` component in `frontend/src/components/home/GameCard.tsx` - displays single game with icon, name, description, category
- [x] T019 [P] [US1] Create `GameGrid.tsx` component in `frontend/src/components/home/GameGrid.tsx` - renders grid layout of GameCard components with responsive breakpoints
- [x] T020 [US1] Create `HomePage.tsx` component in `frontend/src/components/home/HomePage.tsx` - fetches games on mount, renders GameGrid, handles loading and error states
- [x] T021 [US1] Add home route in `frontend/src/main.tsx` or router file - map path "/" to HomePage component

### Manual Verification for User Story 1

- [x] T022 [US1] Run backend migrations: `migrate -path backend/migrations/schema -database "<connection_string>" up`
- [x] T023 [US1] Run data migrations: `migrate -path backend/migrations/data -database "<connection_string>" up`
- [x] T024 [US1] Start backend server: verify `GET /api/v1/games` returns array of games with correct JSON structure
- [x] T025 [US1] Start frontend server: navigate to home page, verify games display in grid with icons, names, descriptions, categories
- [x] T026 [US1] Test responsive layout: resize browser to mobile width (320px, 768px, 1024px), verify grid adapts appropriately
- [x] T027 [US1] Test accessibility: navigate with keyboard (Tab key), verify focus indicators on game cards, check ARIA labels with screen reader

**Checkpoint**: User Story 1 complete and independently functional - users can browse games without authentication

---

## Phase 4: User Story 2 - View Game-Specific Leaderboards (Priority: P2)

**Goal**: Each game displays top 10 players with rankings, usernames, and scores on the home page (or "Be the first to play!" if empty)

**Manual Verification**: View home page and confirm each game shows leaderboard with top 10 players (or empty state message)

### Backend Implementation for User Story 2

- [x] T028 [US2] Implement `GetLeaderboard(ctx context.Context, gameID int64) ([]model.LeaderboardEntry, error)` method in `backend/internal/modules/game/service/service.go` - use window function query from research.md (CTE with ROW_NUMBER, top 10, tie-breaking by timestamp)
- [x] T029 [US2] Add Redis caching to `GetLeaderboard` method - check cache first (key: "leaderboard:{game_id}"), 5-minute TTL, cache miss queries DB and stores result
- [x] T030 [US2] Implement `GetLeaderboard(c *gin.Context)` handler in `backend/internal/modules/game/handler/http.go` - extract gameID from path param, call service, return JSON with game_id, game_name, leaderboard array
- [x] T031 [US2] Register route `GET /api/v1/games/:id/leaderboard` in `backend/cmd/api/main.go` - public endpoint, no auth middleware (already done in T016)

### Frontend Implementation for User Story 2

- [x] T032 [P] [US2] Create `fetchLeaderboard(gameId: number)` function in `frontend/src/lib/api.ts` - calls GET /api/v1/games/{id}/leaderboard, returns Promise<LeaderboardEntry[]> (already done in T017)
- [x] T033 [P] [US2] Create `Leaderboard.tsx` component in `frontend/src/components/home/Leaderboard.tsx` - accepts leaderboard entries as prop, renders table with rank, username, score, timestamp; shows "Be the first to play!" if entries empty
- [x] T034 [US2] Update `HomePage.tsx` in `frontend/src/components/home/HomePage.tsx` - for each game, fetch leaderboard and attach to game object, pass to GameGrid as GameWithLeaderboard[]
- [x] T035 [US2] Update `GameCard.tsx` in `frontend/src/components/home/GameCard.tsx` - render embedded Leaderboard component below game info

### Manual Verification for User Story 2

- [x] T036 [US2] Create test data: insert test game_sessions with varying scores for multiple users in at least 2 games using SQL (see quickstart.md for test data SQL)
- [x] T037 [US2] Test backend API: call `GET /api/v1/games/1/leaderboard`, verify response has top 10 players ranked correctly by score, ties broken by timestamp
- [x] T038 [US2] Test empty leaderboard: call API for game with no sessions, verify returns HTTP 200 with empty leaderboard array
- [x] T039 [US2] Test frontend display: reload home page, verify each game shows leaderboard with correct rankings, usernames, scores
- [x] T040 [US2] Test empty state: verify game with no players shows "Be the first to play!" message
- [x] T041 [US2] Test caching: check Redis for cached leaderboard (key: "leaderboard:1"), verify TTL is set to 5 minutes
- [x] T042 [US2] Test accessibility: verify leaderboard table has proper table semantics (th, td, caption), test with screen reader

**Checkpoint**: User Stories 1 AND 2 complete - home page displays games with leaderboards, both independently functional

---

## Phase 5: User Story 3 - Select and Initiate Game Play (Priority: P1)

**Goal**: Users can click a game to start playing; unauthenticated users are redirected to login with game selection persisted via URL parameter

**Manual Verification**: Click a game while logged out, verify redirect to /login?redirect_to=/game/{code}, complete login, verify automatic navigation to selected game

### Frontend Implementation for User Story 3

- [x] T043 [US3] Update `GameCard.tsx` in `frontend/src/components/home/GameCard.tsx` - add onClick handler that checks authentication status (JWT in localStorage)
- [x] T044 [US3] Implement navigation logic in GameCard onClick: if authenticated → navigate to `/game/{game.code}`; if not authenticated → navigate to `/login?redirect_to=/game/{game.code}`
- [x] T045 [US3] Create or update authentication check utility in `frontend/src/lib/api.ts` - function `isAuthenticated(): boolean` that checks for valid JWT token in localStorage
- [x] T046 [US3] Add cursor pointer and hover styles to GameCard in `frontend/src/components/home/GameCard.tsx` - visual affordance that cards are clickable

### Manual Verification for User Story 3

- [x] T047 [US3] Test unauthenticated click: clear localStorage, click game card, verify redirect to `/login?redirect_to=/game/{code}` with correct game code in URL
- [x] T048 [US3] Test authenticated click: login and get JWT, navigate to home page, click game card, verify direct navigation to `/game/{code}` without login redirect
- [x] T049 [US3] Test multiple game selections: click different games, verify each redirects with correct game code in redirect_to parameter
- [x] T050 [US3] Test keyboard navigation: use Tab to focus game card, press Enter, verify same behavior as mouse click
- [x] T051 [US3] Test edge case: close browser after clicking game (before login redirect completes), reopen and verify no issues (expected: redirect lost, acceptable behavior)

**Checkpoint**: User Stories 1, 2, AND 3 complete - users can browse games, view leaderboards, and initiate game selection with proper authentication flow

---

## Phase 6: User Story 4 - Authentication for Game Access (Priority: P1)

**Goal**: Login and register pages accept redirect_to query parameter, validate it, and redirect to selected game after successful authentication

**Manual Verification**: Complete full flow: click game → login/register with redirect_to → automatically navigate to selected game

### Backend Implementation for User Story 4

- [x] T052 [US4] Create `ValidateRedirectURL(url string) bool` helper function in `backend/internal/modules/user/service/service.go` - validates against pattern `^/game/[a-z0-9-]+$`, rejects absolute URLs, protocol-relative URLs, JavaScript URLs
- [x] T053 [US4] Update `Login` handler in `backend/internal/modules/user/handler/http.go` - extract optional `redirect_to` query parameter, validate using ValidateRedirectURL, include validated redirect_to in response JSON (null if invalid)
- [x] T054 [US4] Update `Register` handler in `backend/internal/modules/user/handler/http.go` - extract optional `redirect_to` query parameter, validate using ValidateRedirectURL, include validated redirect_to in response JSON (null if invalid)
- [x] T055 [US4] Add security logging in ValidateRedirectURL - log rejected redirect attempts with client IP for security monitoring

### Frontend Implementation for User Story 4

- [x] T056 [P] [US4] Update `Login.tsx` in `frontend/src/components/auth/Login.tsx` - extract `redirect_to` from URL query params on component mount using `useSearchParams()` or similar
- [x] T057 [P] [US4] Update `Register.tsx` in `frontend/src/components/auth/Register.tsx` - extract `redirect_to` from URL query params on component mount
- [x] T058 [US4] Update login API call in `Login.tsx` - append `redirect_to` as query parameter to `POST /api/v1/auth/login?redirect_to={value}`
- [x] T059 [US4] Update register API call in `Register.tsx` - append `redirect_to` as query parameter to `POST /api/v1/auth/register?redirect_to={value}`
- [x] T060 [US4] Update success handler in `Login.tsx` - after receiving JWT, check if response contains validated `redirect_to`; if present, navigate to redirect_to path; otherwise navigate to default dashboard
- [x] T061 [US4] Update success handler in `Register.tsx` - after receiving JWT, check if response contains validated `redirect_to`; if present, navigate to redirect_to path; otherwise navigate to default dashboard

### Manual Verification for User Story 4

- [x] T062 [US4] Test full registration flow: from home page, click game "Word Scramble" → redirected to `/login?redirect_to=/game/word-scramble` → switch to Register tab → complete registration → verify automatic navigation to `/game/word-scramble`
- [x] T063 [US4] Test full login flow: logout, click game "Vocab Quiz" → redirected to login with redirect_to → enter valid credentials → verify automatic navigation to `/game/vocab-quiz`
- [x] T064 [US4] Test invalid credentials: attempt login with wrong password → verify error message displayed, redirect_to parameter preserved in URL, can retry
- [x] T065 [US4] Test redirect validation: manually navigate to `/login?redirect_to=https://evil.com` → complete login → verify redirect to default dashboard (not evil.com), check backend logs for rejected redirect
- [x] T066 [US4] Test no redirect parameter: directly navigate to `/login` without redirect_to → complete login → verify navigation to default dashboard
- [x] T067 [US4] Test login/register page UI: verify both login and registration options visible on auth page (tabs or forms)
- [x] T068 [US4] Test back navigation: start auth flow for game A, navigate back to home, click game B → verify redirect_to updated to game B

**Checkpoint**: All 4 user stories complete and independently functional - full home page with games, leaderboards, game selection, and authentication flow working end-to-end

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Performance optimization, accessibility improvements, error handling, and final validation

- [x] T069 [P] Add loading skeletons in `GameGrid.tsx` - display skeleton cards while games are loading for better perceived performance
- [x] T070 [P] Add error boundary in `HomePage.tsx` - catch and display user-friendly error messages if API calls fail
- [x] T071 [P] Optimize game icon loading - add lazy loading attribute to img tags in GameCard component
- [x] T072 [P] Add empty state handling in `HomePage.tsx` - if no games exist in system, display "No games available" message with appropriate styling
- [x] T073 [P] Add tooltip to game cards in `GameCard.tsx` - show full description on hover if truncated (using Radix UI Tooltip component)
- [x] T074 Verify mobile responsiveness - test on physical devices or browser emulation at 320px (iPhone SE), 768px (iPad), 1024px (iPad Pro)
- [ ] T075 Run Lighthouse audit on home page - target Performance score >80, Accessibility score >90, verify Core Web Vitals (FCP <2s, LCP <3s)
  - **Note**: Current Performance score: 50 (below target of >80). Needs optimization.
- [ ] T076 [P] Add API response time logging in backend - log all /api/v1/games and /api/v1/games/:id/leaderboard requests with duration, set up Prometheus metrics if available
- [x] T077 [P] Test leaderboard cache invalidation - complete a game session, verify leaderboard updates within 5 minutes (cache TTL)
- [x] T078 Verify all acceptance scenarios from spec.md - run through complete checklist in quickstart.md (27 manual verification steps)
- [x] T079 Test edge cases from spec.md - verify handling of: very long game names/descriptions, empty leaderboards, unavailable games, concurrent leaderboard updates
- [x] T080 Run gofmt and golangci-lint on backend code - ensure all backend files pass linting
- [x] T081 Run ESLint on frontend code - ensure all frontend files pass linting
- [x] T082 Final end-to-end manual test - complete full user journey from landing on home page to playing a game, verify all success criteria from spec.md met

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (T001-T007 done, migrations run) - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase (T008-T013 complete)
- **User Story 2 (Phase 4)**: Depends on Foundational phase AND User Story 1 backend (T014-T016) - needs games API endpoint and frontend structure
- **User Story 3 (Phase 5)**: Depends on Foundational phase AND User Story 1 frontend (T017-T021) - needs GameCard component and home page
- **User Story 4 (Phase 6)**: Depends on User Story 3 (T043-T046) - needs game selection flow with redirect_to parameter
- **Polish (Phase 7)**: Depends on all 4 user stories being complete

### User Story Dependencies

```text
Setup (Phase 1)
    ↓
Foundational (Phase 2)
    ↓
    ├─→ User Story 1 (Phase 3) - Browse Games [P1]
    │       ↓
    │       ├─→ User Story 2 (Phase 4) - Leaderboards [P2]
    │       └─→ User Story 3 (Phase 5) - Game Selection [P1]
    │               ↓
    │               └─→ User Story 4 (Phase 6) - Auth Redirect [P1]
    ↓
Polish (Phase 7)
```

**Critical Path**: Setup → Foundational → US1 → US3 → US4 → Polish  
**Parallel Opportunity**: US2 (Leaderboards) can be developed in parallel with US3 after US1 completes

### Within Each User Story

- Backend models before backend services
- Backend services before backend handlers
- Backend handlers before frontend API calls
- Frontend API functions before frontend components
- Core components before container components
- Implementation before manual verification
- Story complete before moving to next priority

### Parallel Opportunities

**Within Setup (Phase 1)**:
- T002, T004, T006, T007 can run in parallel (different files)

**Within Foundational (Phase 2)**:
- T009, T010, T012 can run in parallel after T008, T011 complete (different files, no dependencies)

**Within User Story 1 (Phase 3)**:
- Frontend tasks T017, T018, T019 can run in parallel (different components)

**Within User Story 2 (Phase 4)**:
- T032, T033 can run in parallel (API function and component)

**Within User Story 4 (Phase 6)**:
- T056, T057 can run in parallel (updating different auth components)

**Across User Stories** (if team has multiple developers):
- After US1 backend completes (T014-T016), one developer can work on US2 while another works on US3

**Within Polish (Phase 7)**:
- Most polish tasks (T069-T073, T076, T077, T080, T081) can run in parallel (different files and concerns)

---

## Parallel Example: User Story 1 Frontend

```bash
# After backend API is ready (T014-T016 complete), launch all frontend components in parallel:

# Developer A or AI Agent 1:
Task T017: Create fetchGames() in frontend/src/lib/api.ts

# Developer B or AI Agent 2:
Task T018: Create GameCard.tsx in frontend/src/components/home/GameCard.tsx

# Developer C or AI Agent 3:
Task T019: Create GameGrid.tsx in frontend/src/components/home/GameGrid.tsx

# These three tasks have no dependencies on each other (different files)
# After all three complete, proceed to:

Task T020: Create HomePage.tsx (depends on T017, T018, T019 - imports them)
Task T021: Add home route (depends on T020)
```

---

## Implementation Strategy

### Recommended: MVP First (User Story 1 + User Story 3 + User Story 4)

This strategy delivers a **minimum viable product** that provides end-to-end value:

1. **Phase 1**: Setup (T001-T007) - 30 minutes
2. **Phase 2**: Foundational (T008-T013) - 1 hour
3. **Phase 3**: User Story 1 (T014-T027) - 3-4 hours
4. **Phase 5**: User Story 3 (T043-T051) - 1-2 hours
5. **Phase 6**: User Story 4 (T052-T068) - 2-3 hours
6. **STOP and VALIDATE**: Manually verify MVP independently
   - Users can browse games ✅
   - Users can click to select a game ✅
   - Authentication flow works with redirect ✅
   - Users land on selected game after auth ✅

**Total MVP time**: ~8-12 hours

**Defer User Story 2 (Leaderboards)** to Phase 2 since it's P2 priority and not blocking for core game selection flow.

### Alternative: Sequential by Priority

1. Complete Phase 1: Setup → Foundation ready
2. Complete Phase 2: Foundational → Core infrastructure ready
3. Complete Phase 3: User Story 1 (P1) → Browse games functional
4. Complete Phase 5: User Story 3 (P1) → Game selection functional
5. Complete Phase 6: User Story 4 (P1) → Auth redirect functional
6. Complete Phase 4: User Story 2 (P2) → Leaderboards functional
7. Complete Phase 7: Polish → Production ready

Each phase adds value without breaking previous functionality.

### Alternative: Parallel Team Strategy

With 3 developers working simultaneously:

1. **All together**: Complete Phase 1 (Setup) and Phase 2 (Foundational) - ~1.5 hours
2. **After Foundational complete**, split work:
   - **Developer A**: Phase 3 - User Story 1 (T014-T027)
   - **Developer B**: Phase 5 - User Story 3 (T043-T051) - starts after Developer A completes T017-T021
   - **Developer C**: Phase 4 - User Story 2 (T028-T042) - can start in parallel with US3
3. **Synchronization point**: All 3 stories complete, test integration
4. **Developer A or B**: Phase 6 - User Story 4 (T052-T068) - depends on US3
5. **All together**: Phase 7 - Polish and final validation

**Total team time**: ~4-6 hours with 3 developers

---

## Manual Verification Checkpoints

### After Phase 3 (User Story 1)
✅ Home page loads in <3 seconds  
✅ All games displayed with icons, names, descriptions  
✅ Grid layout responsive at 320px, 768px, 1024px  
✅ Keyboard navigation works (Tab, Enter)  
✅ Screen reader announces game information correctly

### After Phase 4 (User Story 2)
✅ Each game shows top 10 leaderboard entries  
✅ Empty games show "Be the first to play!"  
✅ Leaderboards ranked correctly by score  
✅ Ties broken by timestamp (earliest wins)  
✅ Redis caching working (5-minute TTL)

### After Phase 5 (User Story 3)
✅ Clicking game checks authentication status  
✅ Unauthenticated users redirected to login with redirect_to parameter  
✅ redirect_to includes correct game code in URL  
✅ Authenticated users navigate directly to game

### After Phase 6 (User Story 4)
✅ Login form extracts redirect_to from URL  
✅ Register form extracts redirect_to from URL  
✅ Successful auth redirects to selected game  
✅ Invalid redirect_to parameters rejected (security check)  
✅ Full flow works: home → game click → auth → game play

### After Phase 7 (Polish)
✅ All 8 success criteria from spec.md met  
✅ All edge cases handled gracefully  
✅ Performance targets achieved (Lighthouse audit)  
✅ Accessibility compliance verified (WCAG 2.1 AA)  
✅ Code passes linting (gofmt, golangci-lint, ESLint)

---

## Task Summary

| Phase | Task Count | Estimated Time | Dependencies |
|-------|------------|----------------|--------------|
| Phase 1: Setup | 7 tasks | 30 min | None |
| Phase 2: Foundational | 6 tasks | 1 hour | Phase 1 complete |
| Phase 3: User Story 1 (P1) | 14 tasks | 3-4 hours | Phase 2 complete |
| Phase 4: User Story 2 (P2) | 15 tasks | 3-4 hours | Phase 2 + US1 backend |
| Phase 5: User Story 3 (P1) | 9 tasks | 1-2 hours | Phase 2 + US1 frontend |
| Phase 6: User Story 4 (P1) | 17 tasks | 2-3 hours | US3 complete |
| Phase 7: Polish | 14 tasks | 2-3 hours | All stories complete |
| **TOTAL** | **82 tasks** | **13-18 hours** | Sequential execution |

**Parallel opportunities identified**: 15 tasks marked with [P] can run in parallel within their phases

**Suggested MVP scope**: Phases 1, 2, 3, 5, 6 (skip Phase 4 leaderboards initially) = 53 tasks, ~8-12 hours

---

## Notes

- All tasks follow constitution principles: Clean Code, Simple UX, Minimal Dependencies, Clear Architecture
- No automated tests (per Constitution Principle V) - comprehensive manual verification checklists provided
- Each user story is independently testable and deployable
- Commit after completing each task or logical group of parallel tasks
- Stop at any checkpoint to manually validate independently before proceeding
- Use quickstart.md for detailed manual verification procedures
- Reference research.md for design rationale if questions arise during implementation
- Reference data-model.md for exact schema and type definitions
- Reference contracts/openapi.yaml for API request/response formats
