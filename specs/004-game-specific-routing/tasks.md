# Tasks: Game-Specific Routing with Coming Soon Page

**Input**: Design documents from `/specs/004-game-specific-routing/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**NO TESTING POLICY**: This project does NOT require automated tests per Constitution Principle VI. Do NOT create unit tests, integration tests, or e2e tests. Manual verification and production monitoring suffice.

**Organization**: Tasks are grouped by user story to enable independent implementation and manual verification of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/src/` for frontend components
- **Backend**: `backend/internal/modules/` for backend modules
- Paths shown below assume web application structure from plan.md

---

## Phase 1: Setup (Project Verification)

**Purpose**: Verify project structure and dependencies are ready for implementation

- [x] T001 Verify frontend project structure exists at `frontend/src/components/`
- [x] T002 Verify existing shadcn UI components are available in `frontend/src/components/ui/`
- [x] T003 Verify React Router is configured in `frontend/src/App.tsx`
- [x] T004 Verify API functions exist in `frontend/src/lib/api.ts` (fetchGames, isAuthenticated)
- [x] T005 Verify backend game module exists at `backend/internal/modules/game/`
- [x] T006 Verify games table exists in database with `code` field (unique constraint)
- [x] T007 Verify existing Game component exists at `frontend/src/components/game/Game.tsx`

**Checkpoint**: Project structure verified - ready for foundational work

---

## Phase 2: Foundational (Backend API Endpoint)

**Purpose**: Create backend endpoint to fetch game by code. This is required for both US1 (validation) and US2 (Coming Soon page display).

**⚠️ CRITICAL**: Backend endpoint must be complete before frontend implementation can fully proceed

- [x] T008 [P] Add GetGameByCode service method in `backend/internal/modules/game/service/service.go` to query games table by code field
- [x] T009 [P] Add GetGameByCode handler method in `backend/internal/modules/game/handler/http.go` to handle GET /api/v1/games/code/:code requests
- [x] T010 [P] Add route registration in `backend/internal/modules/game/wiring.go` for GET /api/v1/games/code/:code endpoint
- [x] T011 [P] Implement error handling in GetGameByCode handler for 404 (game not found) and 500 (server error) cases
- [x] T012 Manual verification: Test backend endpoint `GET /api/v1/games/code/vocab-quiz` returns game information
- [x] T013 Manual verification: Test backend endpoint `GET /api/v1/games/code/invalid-game` returns 404 error

**Checkpoint**: Backend endpoint complete - game lookup by code is available. Frontend implementation can now proceed.

---

## Phase 3: User Story 1 - Play Vocabulary Quiz Game (Priority: P1) 🎯 MVP

**Goal**: Users can access the Vocabulary Quiz game via `/game/vocab-quiz` URL. The existing Vocabulary Quiz functionality must remain fully operational with proper game-specific routing.

**Manual Verification**: Navigate to homepage, click Vocabulary Quiz game card, verify: (1) if authenticated, routed to `/game/vocab-quiz`, (2) if not authenticated, redirected to login then to Vocabulary Quiz, (3) Vocabulary Quiz game interface displays with level selection, (4) game functionality works as before, (5) URL contains `/game/vocab-quiz`.

### Implementation for User Story 1

- [x] T014 Create game constants file at `frontend/src/constants/games.ts` with IMPLEMENTED_GAMES constant array containing `['vocab-quiz']`
- [x] T015 Add isGameImplemented helper function in `frontend/src/constants/games.ts` to check if game code is in IMPLEMENTED_GAMES list
- [x] T016 [US1] Modify Game component in `frontend/src/components/game/Game.tsx` to import useParams from react-router-dom
- [x] T017 [US1] Modify Game component in `frontend/src/components/game/Game.tsx` to extract game code from URL using useParams hook
- [x] T018 [US1] Modify Game component in `frontend/src/components/game/Game.tsx` to import isGameImplemented from `frontend/src/constants/games.ts`
- [x] T019 [US1] Modify Game component in `frontend/src/components/game/Game.tsx` to check if game code is 'vocab-quiz' and render Vocabulary Quiz interface if true
- [x] T020 [US1] Modify Game component in `frontend/src/components/game/Game.tsx` to ensure Vocabulary Quiz functionality remains unchanged (level selection, gameplay, scoring)
- [x] T021 [US1] Verify App.tsx route handler in `frontend/src/App.tsx` correctly handles `/game/:code` route with authentication checks
- [x] T022 [US1] Ensure authentication redirect preserves game code in redirect parameter (e.g., `/login?redirect_to=/game/vocab-quiz`)
- [x] T023 [US1] Manual verification: Access `/game/vocab-quiz` directly when authenticated, verify Vocabulary Quiz game displays correctly
- [x] T024 [US1] Manual verification: Access `/game/vocab-quiz` when unauthenticated, verify redirect to login then to Vocabulary Quiz after authentication
- [x] T025 [US1] Manual verification: Click Vocabulary Quiz game card from homepage, verify routing to `/game/vocab-quiz` works correctly

**Checkpoint**: At this point, User Story 1 should be fully functional and manually verified. Vocabulary Quiz game routes correctly via `/game/vocab-quiz` URL and maintains all existing functionality.

---

## Phase 4: User Story 2 - View Coming Soon Page for Unimplemented Games (Priority: P1)

**Goal**: Users can access unimplemented games (any game other than Vocabulary Quiz) and see a "Coming Soon" page that displays the game name, description, icon, and indicates the game is under development.

**Manual Verification**: Navigate to homepage, click any non-Vocabulary Quiz game card (e.g., Word Scramble), verify: (1) if authenticated, routed to `/game/word-scramble`, (2) if not authenticated, redirected to login then to Coming Soon page, (3) Coming Soon page displays game name, description, icon, (4) "Back to Home" button works, (5) URL contains correct game code.

### Implementation for User Story 2

- [x] T026 [US2] Add fetchGameByCode API function in `frontend/src/lib/api.ts` to call GET /api/v1/games/code/:code endpoint
- [x] T027 [US2] Create ComingSoon component directory at `frontend/src/components/game/ComingSoon.tsx`
- [x] T028 [US2] Create ComingSoon component in `frontend/src/components/game/ComingSoon.tsx` with props interface accepting gameCode: string
- [x] T029 [US2] Implement game information fetching in ComingSoon component in `frontend/src/components/game/ComingSoon.tsx` using fetchGameByCode API function
- [x] T030 [US2] Implement loading state in ComingSoon component in `frontend/src/components/game/ComingSoon.tsx` while fetching game information
- [x] T031 [US2] Implement error handling in ComingSoon component in `frontend/src/components/game/ComingSoon.tsx` for 404 errors (game not found) - redirect to homepage
- [x] T032 [US2] Implement error handling in ComingSoon component in `frontend/src/components/game/ComingSoon.tsx` for other API errors - show error message with retry option
- [x] T033 [US2] Add game name display in ComingSoon component in `frontend/src/components/game/ComingSoon.tsx` using shadcn Card component
- [x] T034 [US2] Add game description display in ComingSoon component in `frontend/src/components/game/ComingSoon.tsx`
- [x] T035 [US2] Add game icon display in ComingSoon component in `frontend/src/components/game/ComingSoon.tsx` (if icon_path is available)
- [x] T036 [US2] Add "Coming Soon" message in ComingSoon component in `frontend/src/components/game/ComingSoon.tsx` indicating game is under development
- [x] T037 [US2] Add "Back to Home" button in ComingSoon component in `frontend/src/components/game/ComingSoon.tsx` using shadcn Button component
- [x] T038 [US2] Implement navigation logic in ComingSoon component in `frontend/src/components/game/ComingSoon.tsx` for "Back to Home" button to navigate to homepage
- [x] T039 [US2] Add responsive styling to ComingSoon component in `frontend/src/components/game/ComingSoon.tsx` (mobile, tablet, desktop)
- [x] T040 [US2] Add dark mode support to ComingSoon component in `frontend/src/components/game/ComingSoon.tsx` using existing theme system
- [x] T041 [US2] Modify Game component in `frontend/src/components/game/Game.tsx` to check if game code is NOT 'vocab-quiz' and render ComingSoon component
- [x] T042 [US2] Modify Game component in `frontend/src/components/game/Game.tsx` to pass gameCode prop to ComingSoon component
- [x] T043 [US2] Ensure Game component in `frontend/src/components/game/Game.tsx` handles routing logic: if vocab-quiz → Vocabulary Quiz, else → Coming Soon
- [x] T044 [US2] Manual verification: Access `/game/word-scramble` when authenticated, verify Coming Soon page displays with correct game information
- [x] T045 [US2] Manual verification: Access `/game/word-scramble` when unauthenticated, verify redirect to login then to Coming Soon page after authentication
- [x] T046 [US2] Manual verification: Click Word Scramble game card from homepage, verify routing to `/game/word-scramble` and Coming Soon page displays
- [x] T047 [US2] Manual verification: Test multiple unimplemented games (e.g., spelling-challenge, pronunciation-practice), verify each displays correct Coming Soon page
- [x] T048 [US2] Manual verification: Click "Back to Home" button on Coming Soon page, verify navigation to homepage works correctly

**Checkpoint**: At this point, User Story 2 should be fully functional and manually verified. Unimplemented games route correctly to Coming Soon pages with game information displayed.

---

## Phase 5: User Story 3 - Handle Invalid or Unknown Game Codes (Priority: P2)

**Goal**: Users who access invalid or unknown game codes are handled gracefully with redirect to homepage and appropriate error messaging.

**Manual Verification**: Access invalid game URL (e.g., `/game/invalid-game`), verify: (1) system handles error gracefully, (2) user is redirected to homepage, (3) error message or toast notification is displayed (optional), (4) no application errors occur, (5) user can continue using application normally.

### Implementation for User Story 3

- [x] T049 [US3] Modify ComingSoon component in `frontend/src/components/game/ComingSoon.tsx` to handle 404 errors from fetchGameByCode API call
- [x] T050 [US3] Implement redirect logic in ComingSoon component in `frontend/src/components/game/ComingSoon.tsx` for 404 errors - redirect to homepage using React Router navigate
- [x] T051 [US3] Add error toast notification in ComingSoon component in `frontend/src/components/game/ComingSoon.tsx` when game code is invalid (optional - using react-hot-toast)
- [x] T052 [US3] Modify Game component in `frontend/src/components/game/Game.tsx` to handle edge case where game code is empty or undefined - redirect to homepage
- [x] T053 [US3] Ensure App.tsx route handler in `frontend/src/App.tsx` handles malformed game URLs gracefully (e.g., `/game/` without code)
- [x] T054 [US3] Add error boundary or error handling in Game component in `frontend/src/components/game/Game.tsx` for unexpected errors during routing
- [x] T055 [US3] Manual verification: Access `/game/invalid-game` when authenticated, verify redirect to homepage with error message
- [x] T056 [US3] Manual verification: Access `/game/nonexistent` when authenticated, verify redirect to homepage with error message
- [x] T057 [US3] Manual verification: Access `/game/` (malformed URL) when authenticated, verify redirect to homepage or appropriate error handling
- [x] T058 [US3] Manual verification: After redirect from invalid game code, verify user can continue browsing games normally on homepage

**Checkpoint**: At this point, User Story 3 should be fully functional and manually verified. Invalid game codes are handled gracefully with appropriate error handling and user feedback.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final polish, edge cases, and cross-cutting concerns that apply to all user stories.

### Edge Cases & Error Handling

- [x] T059 Verify authentication expiration handling: if user's authentication expires while on game page, redirect to login with proper redirect parameter
- [x] T060 Verify browser navigation: test browser back/forward buttons work correctly when navigating between game pages and homepage
- [x] T061 Verify bookmarked URLs: test that bookmarked game URLs (e.g., `/game/vocab-quiz`, `/game/word-scramble`) work correctly when user returns later
- [x] T062 Verify inactive games: if a game is marked as inactive in database, verify Coming Soon page still displays (or handle appropriately)
- [x] T063 Verify game code case sensitivity: ensure game code matching is case-sensitive or case-insensitive as per requirements (likely case-sensitive based on database constraints)
- [x] T064 Add loading states: ensure all API calls show appropriate loading indicators (Vocabulary Quiz, Coming Soon page)
- [x] T065 Add error states: ensure all error scenarios show appropriate error messages to users

### Performance & Accessibility

- [x] T066 Verify page load times: ensure Vocabulary Quiz game loads within 2 seconds (SC-001)
- [x] T067 Verify page load times: ensure Coming Soon pages load within 2 seconds (SC-002)
- [x] T068 Verify navigation response: ensure navigation between pages responds within 1 second (SC-005)
- [x] T069 Verify accessibility: ensure Coming Soon page meets WCAG 2.1 AA standards (use shadcn UI components which provide accessibility by default)
- [x] T070 Verify responsive design: ensure Coming Soon page works correctly on mobile (320px+), tablet (768px+), and desktop (1024px+) screens
- [x] T071 Verify dark mode: ensure Coming Soon page supports dark mode using existing theme system

### Documentation & Code Quality

- [x] T072 Add JSDoc comments to ComingSoon component in `frontend/src/components/game/ComingSoon.tsx` explaining component purpose and props
- [x] T073 Add JSDoc comments to fetchGameByCode function in `frontend/src/lib/api.ts` explaining function purpose and parameters
- [x] T074 Add inline comments to Game component in `frontend/src/components/game/Game.tsx` explaining routing logic for game codes
- [x] T075 Verify code follows clean code principles: clear naming, single responsibility, no magic numbers
- [x] T076 Verify no console errors: test all scenarios and ensure no unhandled errors appear in browser console
- [x] T077 Verify no TypeScript errors: ensure all TypeScript types are correct and no type errors exist

### Integration & End-to-End Verification

- [x] T078 Manual verification: Complete end-to-end flow - homepage → click game card → game page → back to homepage
- [x] T079 Manual verification: Complete authentication flow - unauthenticated → click game → login → game page
- [x] T080 Manual verification: Test all game codes from database - verify each routes correctly (Vocabulary Quiz or Coming Soon)
- [x] T081 Manual verification: Verify Vocabulary Quiz game functionality is completely unchanged from before this feature
- [x] T082 Manual verification: Verify homepage game listing still works correctly and displays all games
- [x] T083 Manual verification: Verify game card clicks from homepage route to correct pages (Vocabulary Quiz or Coming Soon)

**Checkpoint**: All polish tasks complete. Feature is ready for final review and deployment.

---

## Dependencies

### User Story Completion Order

1. **Phase 2 (Foundational)**: Backend API endpoint MUST be completed before US1 and US2 can fully proceed (needed for game code validation and Coming Soon page)
2. **Phase 3 (US1)**: Can be partially implemented in parallel with Phase 2, but requires backend endpoint for full validation. Vocabulary Quiz routing can be implemented independently.
3. **Phase 4 (US2)**: Requires Phase 2 (backend endpoint) and Phase 3 (routing logic) to be complete. Coming Soon page depends on game code routing and API endpoint.
4. **Phase 5 (US3)**: Requires Phase 4 (Coming Soon component) to be complete. Error handling builds on existing components.
5. **Phase 6 (Polish)**: Requires all user stories to be complete. Polish tasks apply to entire feature.

### Parallel Execution Opportunities

**Within Phase 2 (Backend)**:
- T008, T009, T010 can be worked on in parallel (different files, clear interfaces)

**Within Phase 3 (US1)**:
- T014, T015 can be done in parallel (constants file)
- T016-T020 can be done sequentially (modifying same component)

**Within Phase 4 (US2)**:
- T026 (API function) can be done independently
- T027-T040 (ComingSoon component) can be done in parallel with T041-T043 (Game component modifications) after API function is complete
- T033-T038 (ComingSoon UI elements) can be done in parallel

**Within Phase 5 (US3)**:
- T049-T054 can be done in parallel (different error handling scenarios)

**Within Phase 6 (Polish)**:
- Most polish tasks can be done in parallel (different aspects of the feature)

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

**MVP includes**: Phase 2 (Backend API) + Phase 3 (US1 - Vocabulary Quiz routing)

**MVP delivers**: 
- Backend endpoint for game lookup by code
- Vocabulary Quiz game routes correctly via `/game/vocab-quiz`
- Game code constants and routing infrastructure
- Foundation for Coming Soon pages

**MVP excludes**: 
- Coming Soon pages (US2)
- Invalid game code handling (US3)
- Advanced error handling and polish

### Incremental Delivery

1. **Sprint 1**: Phase 1 (Setup) + Phase 2 (Backend API) + Phase 3 (US1 - Vocabulary Quiz)
   - Deliverable: Vocabulary Quiz routes correctly via game code URL

2. **Sprint 2**: Phase 4 (US2 - Coming Soon Pages)
   - Deliverable: Unimplemented games show Coming Soon pages

3. **Sprint 3**: Phase 5 (US3 - Error Handling) + Phase 6 (Polish)
   - Deliverable: Complete feature with error handling and polish

### Success Criteria Tracking

- **SC-001**: Vocabulary Quiz access time < 2 seconds (T066)
- **SC-002**: Coming Soon page access time < 2 seconds (T067)
- **SC-003**: 100% correct routing (T083)
- **SC-004**: Authentication redirect time < 5 seconds (T079)
- **SC-005**: Navigation response time < 1 second (T068)
- **SC-006**: Invalid URL handling < 2 seconds (T055-T058)
- **SC-007**: Bookmarked URLs work correctly (T061)
- **SC-008**: Vocabulary Quiz functionality unchanged (T081)

## Notes

- All tasks should be completed in order within each phase, but parallel execution is possible where marked with [P]
- Manual verification tasks are critical - ensure each user story is independently verifiable
- No automated tests required per Constitution Principle VI
- Focus on maintaining existing Vocabulary Quiz functionality while adding new routing capabilities
- Design routing system to be easily extensible for future game implementations (as per requirement: "every game will be separated")

