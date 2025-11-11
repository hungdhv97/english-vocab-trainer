# Tasks: Leaderboard Page Redesign with Game Tabs

**Input**: Design documents from `/specs/007-leaderboard-game-tabs/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**NO TESTING POLICY**: This project does NOT require automated tests per Constitution Principle V. Do NOT create unit tests, integration tests, or e2e tests. Manual verification and production monitoring suffice.

**Organization**: Tasks are grouped by user story to enable independent implementation and manual verification of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/src/` at repository root
- Paths shown below use frontend structure from plan.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and component installation

- [x] T001 Install shadcn UI tabs component in frontend directory
- [x] T002 Verify tabs component created at frontend/src/components/ui/tabs.tsx

**Checkpoint**: shadcn UI tabs component installed and ready to use

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Add state management imports (useState, useEffect, useRef) to frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T004 Add state variables for games list, selected game, and CEFR levels in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T005 Add state variables for leaderboard data, loading states, and error states in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T006 Add AbortController ref for request cancellation in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T007 Import Tabs components (Tabs, TabsList, TabsTrigger, TabsContent) from shadcn UI in frontend/src/components/leaderboard/LeaderboardPage.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Leaderboard by Game Selection (Priority: P1) 🎯 MVP

**Goal**: Display game tabs at the top of the leaderboard page and allow users to select a game to view its leaderboard. This is the core functionality that transforms the page from showing all games at once to a focused, game-specific view.

**Manual Verification**: Navigate to `/leaderboard`, observe game tabs displayed at the top, click a tab, and confirm only that game's leaderboard is displayed. The tab should be visually highlighted as active.

### Implementation for User Story 1

- [x] T008 [US1] Fetch games list on component mount using fetchGames() in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T009 [US1] Filter and sort games by is_active and display_order in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T010 [US1] Render Tabs component with TabsList containing TabsTrigger for each active game in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T011 [US1] Add click handler to update selectedGameId state when tab is clicked in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T012 [US1] Add visual styling to highlight active tab using TabsTrigger variant prop in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T013 [US1] Implement useEffect to fetch leaderboard when selectedGameId changes in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T014 [US1] Use fetchLeaderboard(gameId) API call for standard games in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T015 [US1] Store leaderboard data in state Map keyed by gameId in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T016 [US1] Conditionally render Leaderboard component with entries for selected game in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T017 [US1] Add loading state display (Skeleton component) while fetching leaderboard in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T018 [US1] Add error state display (Alert component) if leaderboard fetch fails in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T019 [US1] Add empty state display when leaderboard has no entries in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T020 [US1] Implement AbortController to cancel previous request when switching tabs in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T021 [US1] Manual verification: Navigate to /leaderboard, click different game tabs, verify only selected game's leaderboard displays

**Checkpoint**: At this point, User Story 1 should be fully functional and manually verified. Users can see game tabs and switch between them to view different leaderboards.

---

## Phase 4: User Story 2 - Default Game Selection on Page Load (Priority: P2)

**Goal**: Automatically select the first game (by display order) when the page loads and display its leaderboard immediately, so users see content without needing to click a tab first.

**Manual Verification**: Navigate to `/leaderboard` and verify that the first game tab is pre-selected and its leaderboard is displayed automatically without user interaction.

### Implementation for User Story 2

- [x] T022 [US2] Set default selectedGameId to first game's ID (by display_order) after games are fetched in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T023 [US2] Fetch leaderboard for default selected game on initial page load in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T024 [US2] Ensure Tabs component's value prop is controlled by selectedGameId state in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T025 [US2] Handle empty games list case - show empty state message instead of tabs in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T026 [US2] Manual verification: Navigate to /leaderboard, verify first game tab is selected and leaderboard displays automatically

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently and be manually verified. The page loads with a default game selected and its leaderboard displayed.

---

## Phase 5: User Story 3 - Handle Special Game Leaderboards (Priority: P2)

**Goal**: Preserve existing special leaderboard functionality for vocab-quiz game, which requires CEFR level and translation direction selectors. When vocab-quiz tab is selected, display the VocabQuizLeaderboard component with all its filtering controls.

**Manual Verification**: Select the vocab-quiz game tab and verify that the VocabQuizLeaderboard component is displayed with CEFR level and translation direction selectors. Verify that selecting a regular game tab shows the standard Leaderboard component.

### Implementation for User Story 3

- [x] T027 [US3] Fetch CEFR levels on component mount using fetchCefrLevels() in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T028 [US3] Add conditional check for game.code === 'vocab-quiz' when rendering leaderboard content in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T029 [US3] Render VocabQuizLeaderboard component when vocab-quiz tab is selected in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T030 [US3] Pass gameId and cefrLevels props to VocabQuizLeaderboard component in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T031 [US3] Ensure VocabQuizLeaderboard component is only rendered when vocab-quiz game is selected in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T032 [US3] Ensure standard Leaderboard component is rendered for non-vocab-quiz games in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T033 [US3] Manual verification: Select vocab-quiz tab, verify VocabQuizLeaderboard with filters displays; select other game tab, verify standard Leaderboard displays

**Checkpoint**: All user stories should now be independently functional and manually verified. Special game leaderboards work correctly alongside standard leaderboards.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and edge case handling

- [x] T034 [P] Handle case when only one game is available - still show tabs for consistency in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T035 [P] Ensure tabs remain clickable even if one game's leaderboard fails to load in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T036 [P] Add global error state handling for games list fetch failure in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T037 [P] Verify mobile responsiveness of tabs component (scrollable if needed) in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T038 [P] Verify accessibility - keyboard navigation works for tabs in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T039 [P] Test rapid tab switching - verify no race conditions occur in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T040 [P] Verify performance - tab selection responds within 100ms, page loads within 2 seconds
- [x] T041 [P] Run quickstart.md validation - verify all manual test cases pass
- [x] T042 [P] Manual end-to-end verification: Test complete user journey with all games, error cases, and edge cases

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed sequentially in priority order (P1 → P2 → P2)
  - US2 and US3 can potentially be worked on in parallel after US1 is complete
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on US1 completion - Builds on tab selection functionality
- **User Story 3 (P2)**: Depends on US1 completion - Builds on conditional rendering logic

### Within Each User Story

- State setup before rendering
- Tab rendering before leaderboard fetching
- Leaderboard fetching before display
- Error/loading states before polish
- Manual verification before story completion
- Story complete before moving to next priority

### Parallel Opportunities

- Setup tasks (T001, T002) can run sequentially (T002 depends on T001)
- Foundational tasks (T003-T007) can run in parallel (all in same file but different concerns)
- After US1 is complete, US2 and US3 can potentially be worked on in parallel (different conditional logic)
- Polish tasks (T034-T042) can run in parallel (different edge cases and concerns)

---

## Parallel Example: User Story 1

```bash
# After foundational phase, can work on US1 tasks:
# Sequential: T008 → T009 → T010 → T011 → T012 → T013 → T014 → T015 → T016 → T017 → T018 → T019 → T020
# Then manual verification: T021

# Note: Most tasks are sequential within US1 as they build on each other
# T017, T018, T019 can be done in parallel (different UI states)
```

---

## Parallel Example: User Stories 2 and 3

```bash
# After US1 is complete, US2 and US3 can be worked on in parallel:

# Developer A: User Story 2
Task: T022 - Set default selectedGameId
Task: T023 - Fetch leaderboard for default game
Task: T024 - Control Tabs value prop
Task: T025 - Handle empty games list
Task: T026 - Manual verification

# Developer B: User Story 3
Task: T027 - Fetch CEFR levels
Task: T028 - Add vocab-quiz conditional check
Task: T029 - Render VocabQuizLeaderboard
Task: T030 - Pass props to VocabQuizLeaderboard
Task: T031 - Ensure conditional rendering
Task: T032 - Ensure standard Leaderboard for other games
Task: T033 - Manual verification
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (install shadcn UI tabs)
2. Complete Phase 2: Foundational (state management setup)
3. Complete Phase 3: User Story 1 (tab selection and leaderboard display)
4. **STOP and VALIDATE**: Manually verify User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Manually verify independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Manually verify independently → Deploy/Demo
4. Add User Story 3 → Manually verify independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (core tab functionality)
3. Once User Story 1 is done:
   - Developer A: User Story 2 (default selection)
   - Developer B: User Story 3 (special leaderboards)
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different concerns, can be done in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and manually verifiable
- NO AUTOMATED TESTS: Manual verification only (per Constitution Principle V)
- Commit after each task or logical group
- Stop at any checkpoint to manually validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All tasks modify the same file (LeaderboardPage.tsx) but are organized by user story for clarity
- Tasks within a user story are mostly sequential as they build on each other

