# Tasks: Homepage Redesign with Leaderboard Separation

**Input**: Design documents from `/specs/002-homepage-redesign/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**NO TESTING POLICY**: This project does NOT require automated tests per Constitution Principle VI. Do NOT create unit tests, integration tests, or e2e tests. Manual verification and production monitoring suffice.

**Organization**: Tasks are grouped by user story to enable independent implementation and manual verification of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/src/` for frontend components
- **Backend**: No changes required (existing API endpoints are sufficient)
- Paths shown below assume web application structure from plan.md

---

## Phase 1: Setup (Project Verification)

**Purpose**: Verify project structure and dependencies are ready for implementation

- [x] T001 Verify frontend project structure exists at `frontend/src/components/`
- [x] T002 Verify existing shadcn UI components are available in `frontend/src/components/ui/`
- [x] T003 Verify React Router is configured in `frontend/src/App.tsx`
- [x] T004 Verify API functions exist in `frontend/src/lib/api.ts` (fetchGames, fetchLeaderboard, isAuthenticated)

**Checkpoint**: Project structure verified - ready for foundational work

---

## Phase 2: Foundational (Layout Components)

**Purpose**: Create reusable Header and Footer components that are required by US1 and US2. These components MUST be complete before user story implementation can begin.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create `frontend/src/components/layout/` directory
- [x] T006 [P] Create Header component in `frontend/src/components/layout/Header.tsx` with title, subtitle, and navigation structure
- [x] T007 [P] Implement authentication-aware navigation logic in `frontend/src/components/layout/Header.tsx` (conditionally show Login/Register vs Dashboard/Logout)
- [x] T008 [P] Create Footer component in `frontend/src/components/layout/Footer.tsx` with copyright information
- [x] T009 [P] Add responsive styling to Header component in `frontend/src/components/layout/Header.tsx` (mobile, tablet, desktop)
- [x] T010 [P] Add responsive styling to Footer component in `frontend/src/components/layout/Footer.tsx` (mobile, tablet, desktop)
- [x] T011 Manual verification: Header and Footer components render correctly with navigation links

**Checkpoint**: Foundation ready - Header and Footer components complete. User story implementation can now begin.

---

## Phase 3: User Story 1 - View Enhanced Homepage with Game Listing (Priority: P1) 🎯 MVP

**Goal**: Users can visit the homepage and see a well-structured page with header, footer, and game cards (without leaderboard information). Game cards display name, icon, description, category, and a Play button.

**Manual Verification**: Navigate to `http://localhost:5173/` and verify: (1) header is visible at top with title, subtitle, and navigation, (2) game cards display in responsive grid without leaderboard sections, (3) footer is visible at bottom, (4) page loads within 2 seconds, (5) clicking game card or Play button navigates to game (authenticated) or login (unauthenticated).

### Implementation for User Story 1

- [x] T012 [US1] Modify HomePage component in `frontend/src/components/home/HomePage.tsx` to import and use Header component
- [x] T013 [US1] Modify HomePage component in `frontend/src/components/home/HomePage.tsx` to import and use Footer component
- [x] T014 [US1] Modify HomePage component in `frontend/src/components/home/HomePage.tsx` to remove leaderboard fetching logic (no longer needed on homepage)
- [x] T015 [US1] Modify GameCard component in `frontend/src/components/home/GameCard.tsx` to remove Leaderboard component import and usage
- [x] T016 [US1] Modify GameCard component in `frontend/src/components/home/GameCard.tsx` to remove leaderboard section from card layout (remove the div with leaderboard)
- [x] T017 [US1] Modify GameCard component in `frontend/src/components/home/GameCard.tsx` to add Play button using shadcn Button component from `frontend/src/components/ui/button.tsx`
- [x] T018 [US1] Modify GameCard component in `frontend/src/components/home/GameCard.tsx` to ensure Play button triggers game navigation (authenticated → `/game/:code`, unauthenticated → `/login?redirect_to=/game/:code`)
- [x] T019 [US1] Update GameCard props interface in `frontend/src/components/home/GameCard.tsx` to remove leaderboard-related props (GameWithLeaderboard type no longer needed, use Game type)
- [x] T020 [US1] Modify HomePage component in `frontend/src/components/home/HomePage.tsx` to update GameGrid props to use Game type instead of GameWithLeaderboard
- [x] T021 [US1] Verify GameGrid component in `frontend/src/components/home/GameGrid.tsx` still works correctly with updated props (may need minor adjustments)
- [x] T022 [US1] Ensure responsive design works correctly in `frontend/src/components/home/HomePage.tsx` (mobile 320px+, tablet 768px+, desktop 1024px+)
- [x] T023 [US1] Add proper error handling in `frontend/src/components/home/HomePage.tsx` for game data loading failures
- [x] T024 [US1] Ensure empty state handling works in `frontend/src/components/home/HomePage.tsx` when no games are available
- [x] T024a [US1] Add View History button below Play button in GameCard component in `frontend/src/components/home/GameCard.tsx` (only show if authenticated)
- [x] T024b [US1] Update HomePage to get userId from localStorage and pass to GameGrid
- [x] T024c [US1] Update GameGrid to accept userId prop and pass to GameCard
- [x] T024d [US1] Update GameCard to accept userId prop and show View History button when authenticated
- [x] T025 [US1] Manual verification: Homepage loads with header, game listing (without leaderboards), and footer within 2 seconds

**Checkpoint**: At this point, User Story 1 should be fully functional and manually verified. Homepage displays correctly with header, footer, and game cards without leaderboard information.

---

## Phase 4: User Story 2 - Navigate to Leaderboard Page (Priority: P1)

**Goal**: Users can navigate to a dedicated leaderboard page that displays rankings for all available games. The page maintains consistent header and footer structure.

**Manual Verification**: Navigate to `http://localhost:5173/leaderboard` (or click Leaderboard link in header) and verify: (1) page displays leaderboard information for games, (2) rankings, scores, and usernames are visible, (3) page loads within 2 seconds, (4) navigation from homepage to leaderboard works, (5) empty leaderboard states show appropriate messages.

### Implementation for User Story 2

- [x] T026 Create `frontend/src/components/leaderboard/` directory
- [x] T027 [US2] Create LeaderboardPage component in `frontend/src/components/leaderboard/LeaderboardPage.tsx` with Header and Footer imports
- [x] T028 [US2] Implement games fetching logic in `frontend/src/components/leaderboard/LeaderboardPage.tsx` using fetchGames from `frontend/src/lib/api.ts`
- [x] T029 [US2] Implement leaderboard fetching logic in `frontend/src/components/leaderboard/LeaderboardPage.tsx` to fetch leaderboards for all games using fetchLeaderboard from `frontend/src/lib/api.ts`
- [x] T030 [US2] Implement parallel leaderboard fetching in `frontend/src/components/leaderboard/LeaderboardPage.tsx` (fetch all leaderboards in parallel for performance)
- [x] T031 [US2] Reuse existing Leaderboard component from `frontend/src/components/home/Leaderboard.tsx` in LeaderboardPage to display leaderboard entries
- [x] T032 [US2] Implement game sections in `frontend/src/components/leaderboard/LeaderboardPage.tsx` to display each game with its leaderboard
- [x] T033 [US2] Add loading state handling in `frontend/src/components/leaderboard/LeaderboardPage.tsx` (show loading skeleton while fetching)
- [x] T034 [US2] Add error state handling in `frontend/src/components/leaderboard/LeaderboardPage.tsx` (show error message with retry option on API failures)
- [x] T035 [US2] Implement empty leaderboard state handling in `frontend/src/components/leaderboard/LeaderboardPage.tsx` (show "Be the first to play!" message when no entries)
- [x] T036 [US2] Ensure responsive design works correctly in `frontend/src/components/leaderboard/LeaderboardPage.tsx` (mobile, tablet, desktop)
- [x] T037 [US2] Add `/leaderboard` route to App.tsx in `frontend/src/App.tsx` using React Router
- [x] T038 [US2] Ensure Leaderboard navigation link in Header component works correctly (navigates to `/leaderboard` route)
- [x] T039 [US2] Manual verification: Leaderboard page loads and displays leaderboard data for all games within 2 seconds

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently and be manually verified. Users can view homepage and navigate to leaderboard page.

---

## Phase 5: User Story 3 - Homepage Header Navigation (Priority: P2)

**Goal**: Users can easily navigate between different sections using header navigation. Navigation is authentication-aware (shows Login/Register for unauthenticated users, Dashboard/Logout for authenticated users).

**Manual Verification**: Verify header navigation on all pages: (1) Home and Leaderboard links are always visible, (2) Login/Register links appear when not authenticated, (3) Dashboard/Logout links appear when authenticated, (4) all navigation links function correctly and route to intended pages.

**Note**: Most of this user story is already implemented in Phase 2 (Header component). This phase focuses on ensuring navigation works correctly across all pages and testing authentication-aware behavior.

### Implementation for User Story 3

- [x] T040 [US3] Verify Header component in `frontend/src/components/layout/Header.tsx` displays Home and Leaderboard links for all users
- [x] T041 [US3] Verify Header component in `frontend/src/components/layout/Header.tsx` conditionally displays Login/Register links when user is not authenticated
- [x] T042 [US3] Verify Header component in `frontend/src/components/layout/Header.tsx` conditionally displays Logout button when user is authenticated (Dashboard removed)
- [x] T043 [US3] Implement logout functionality in Header component in `frontend/src/components/layout/Header.tsx` (clear localStorage, navigate to home)
- [x] T044 [US3] Ensure Header component in `frontend/src/components/layout/Header.tsx` updates navigation state when authentication status changes (user logs in/out)
- [x] T045 [US3] Add active route highlighting in Header component in `frontend/src/components/layout/Header.tsx` (highlight current page in navigation)
- [x] T046 [US3] Verify navigation links work correctly from homepage (Home, Leaderboard, Login/Register or Logout)
- [x] T047 [US3] Verify navigation links work correctly from leaderboard page (Home, Leaderboard, Login/Register or Logout)
- [x] T048 [US3] Remove Dashboard route from App.tsx and update all Dashboard references to navigate to home page
- [x] T048a [US3] Update Login component to redirect to home (/) if no redirect_to, or to game if redirect_to exists
- [x] T048b [US3] Update Register component to redirect to home (/) if no redirect_to, or to game if redirect_to exists
- [x] T048c [US3] Update History component to navigate to home (/) instead of Dashboard
- [x] T048d [US3] Update LevelSelector component to navigate to home (/) instead of Dashboard
- [x] T048e [US3] Delete Dashboard.tsx component file
- [x] T048f [US3] Test authentication state changes: Log in → Verify Logout button appears, Log out → Verify Login/Register links appear
- [x] T049 [US3] Manual verification: All navigation links function correctly (100% success rate per SC-005), navigation responds within 1 second per SC-002

**Checkpoint**: At this point, all user stories should be independently functional and manually verified. Header navigation works correctly across all pages with authentication-aware behavior.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements, accessibility, performance optimization, and end-to-end verification

- [x] T050 [P] Verify WCAG 2.1 AA accessibility compliance for Header component in `frontend/src/components/layout/Header.tsx` (semantic HTML, ARIA labels, keyboard navigation)
- [x] T051 [P] Verify WCAG 2.1 AA accessibility compliance for Footer component in `frontend/src/components/layout/Footer.tsx`
- [x] T052 [P] Verify WCAG 2.1 AA accessibility compliance for GameCard component in `frontend/src/components/home/GameCard.tsx` (Play button accessibility, keyboard navigation)
- [x] T053 [P] Verify WCAG 2.1 AA accessibility compliance for LeaderboardPage component in `frontend/src/components/leaderboard/LeaderboardPage.tsx`
- [x] T054 [P] Optimize performance: Verify homepage loads within 2 seconds (SC-001) - check Network tab in browser DevTools
- [x] T055 [P] Optimize performance: Verify leaderboard page loads within 2 seconds (SC-004) - check Network tab in browser DevTools
- [x] T056 [P] Optimize performance: Verify navigation responds within 1 second (SC-002) - test navigation link clicks
- [x] T057 [P] Verify responsive design: Test homepage on mobile (320px+), tablet (768px+), and desktop (1024px+) viewports (SC-007)
- [x] T058 [P] Verify responsive design: Test leaderboard page on mobile (320px+), tablet (768px+), and desktop (1024px+) viewports (SC-007)
- [x] T059 [P] Verify dark mode support: Test Header, Footer, HomePage, and LeaderboardPage components in dark mode
- [x] T060 [P] Verify error handling: Test homepage with backend server stopped (should show error message with retry option)
- [x] T061 [P] Verify error handling: Test leaderboard page with backend server stopped (should show error message with retry option)
- [x] T062 [P] Verify empty states: Test homepage when no games are available (should show appropriate empty state message)
- [x] T063 [P] Verify empty states: Test leaderboard page when no leaderboard data exists (should show "Be the first to play!" message)
- [x] T064 [P] Verify game card truncation: Test with very long game names and descriptions (should truncate or wrap appropriately)
- [x] T065 [P] Run quickstart.md validation: Follow manual verification steps from `specs/002-homepage-redesign/quickstart.md`
- [x] T066 Manual end-to-end verification: Complete user journey from homepage → game selection → leaderboard page → navigation back to homepage
- [x] T067 Verify all success criteria are met: SC-001 through SC-008 from spec.md

**Checkpoint**: All polish tasks complete, feature ready for deployment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (Phase 3): Can start after Phase 2 - No dependencies on other stories
  - User Story 2 (Phase 4): Can start after Phase 2 - No dependencies on other stories (LeaderboardPage is independent)
  - User Story 3 (Phase 5): Can start after Phase 2 - Most work is in Phase 2, this phase is verification
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Requires Header and Footer components
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Requires Header and Footer components, independent of US1
- **User Story 3 (P2)**: Mostly implemented in Phase 2 (Header component) - This phase focuses on verification and polish

### Within Each User Story

- Components before integration
- Core implementation before error handling
- Error handling before empty states
- Manual verification before story completion
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: All setup tasks can run in parallel (T001-T004)
- **Phase 2**: All foundational tasks marked [P] can run in parallel (T006-T010 are independent files)
- **Phase 3 (US1)**: T012-T014 can run in parallel (different parts of HomePage), T015-T019 can run in parallel (GameCard modifications)
- **Phase 4 (US2)**: T027-T032 can run in parallel (different parts of LeaderboardPage implementation)
- **Phase 5 (US3)**: T040-T044 can run in parallel (different aspects of Header verification)
- **Phase 6**: All polish tasks marked [P] can run in parallel (different components and concerns)

### Cross-Story Parallelization

- **US1 and US2**: Can be implemented in parallel after Phase 2 (both require Header/Footer, but are otherwise independent)
- **US3**: Can be verified in parallel with US1/US2 (mostly verification of Phase 2 work)

---

## Parallel Example: User Story 1

```bash
# Launch parallel tasks for User Story 1:
# Task T012: Modify HomePage to add Header
# Task T013: Modify HomePage to add Footer  
# Task T014: Remove leaderboard fetching from HomePage
# (These can be done together as they modify different parts of the same file)

# Then launch GameCard modifications in parallel:
# Task T015: Remove Leaderboard import from GameCard
# Task T016: Remove leaderboard section from GameCard layout
# Task T017: Add Play button to GameCard
# (These can be done together as they modify different parts of the same file)

# After implementation, manual verification:
# Task T025: Manual verification - Test complete homepage functionality
```

---

## Parallel Example: User Story 2

```bash
# Launch parallel tasks for User Story 2:
# Task T027: Create LeaderboardPage component structure
# Task T028: Implement games fetching logic
# Task T029: Implement leaderboard fetching logic
# (These can be done together as they're different parts of the same component)

# Then launch display logic in parallel:
# Task T031: Reuse Leaderboard component
# Task T032: Implement game sections display
# Task T033: Add loading state handling
# Task T034: Add error state handling
# (These can be done together as they're different aspects of the same component)

# After implementation, manual verification:
# Task T039: Manual verification - Test complete leaderboard page functionality
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (verify project structure)
2. Complete Phase 2: Foundational (create Header and Footer components) - **CRITICAL - blocks all stories**
3. Complete Phase 3: User Story 1 (homepage enhancement)
4. **STOP and VALIDATE**: Manually verify User Story 1 independently
5. Deploy/demo if ready

**MVP Deliverable**: Enhanced homepage with header, footer, and game cards (without leaderboards) - fully functional and manually verified.

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (Header and Footer components)
2. Add User Story 1 → Manually verify independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Manually verify independently → Deploy/Demo (Leaderboard page available)
4. Add User Story 3 → Manually verify independently → Deploy/Demo (Navigation polish)
5. Complete Polish phase → Final verification → Production ready

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together** (Phase 1-2)
2. **Once Foundational is done**:
   - Developer A: User Story 1 (Homepage enhancement)
   - Developer B: User Story 2 (Leaderboard page) - Can start in parallel with US1
   - Developer C: User Story 3 (Navigation verification) - Can start after Header is complete
3. Stories complete and integrate independently
4. **Team completes Polish phase together** (Phase 6)

---

## Task Summary

### Total Task Count: 67 tasks

### Task Count per Phase:
- **Phase 1 (Setup)**: 4 tasks
- **Phase 2 (Foundational)**: 7 tasks
- **Phase 3 (US1 - Homepage)**: 14 tasks
- **Phase 4 (US2 - Leaderboard)**: 14 tasks
- **Phase 5 (US3 - Navigation)**: 10 tasks
- **Phase 6 (Polish)**: 18 tasks

### Task Count per User Story:
- **User Story 1**: 14 tasks (T012-T025)
- **User Story 2**: 14 tasks (T026-T039)
- **User Story 3**: 10 tasks (T040-T049)

### Parallel Opportunities Identified:
- **Phase 2**: 5 tasks can run in parallel (T006-T010)
- **Phase 3**: Multiple tasks can run in parallel within HomePage and GameCard modifications
- **Phase 4**: Multiple tasks can run in parallel within LeaderboardPage implementation
- **Phase 5**: Multiple tasks can run in parallel (verification tasks)
- **Phase 6**: 18 tasks can run in parallel (different components and concerns)
- **Cross-Story**: US1 and US2 can be implemented in parallel after Phase 2

### Independent Test Criteria for Each Story:

- **User Story 1**: Navigate to homepage → Verify header, game cards (no leaderboards), footer → Click game card/Play button → Verify navigation works
- **User Story 2**: Navigate to leaderboard page → Verify leaderboards display for all games → Verify navigation works → Verify empty states
- **User Story 3**: Test header navigation on all pages → Verify authentication-aware links → Verify all links function correctly

### Suggested MVP Scope:

**MVP = Phase 1 + Phase 2 + Phase 3 (User Story 1 only)**
- Enhanced homepage with header, footer, and game cards
- No leaderboard information on game cards
- Play button on game cards
- Fully functional and manually verified

**Total MVP Tasks**: 25 tasks (T001-T025)

---

## Notes

- **[P] tasks** = different files or different parts of same file, no dependencies
- **[Story] label** maps task to specific user story for traceability (US1, US2, US3)
- Each user story should be independently completable and manually verifiable
- **NO AUTOMATED TESTS**: Manual verification only (per Constitution Principle VI)
- Commit after each task or logical group
- Stop at any checkpoint to manually validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All file paths are relative to repository root (e.g., `frontend/src/components/...`)
- Backend changes are NOT required (existing API endpoints are sufficient)

