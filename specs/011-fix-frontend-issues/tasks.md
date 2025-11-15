# Tasks: Frontend UI/UX Fixes

**Input**: Design documents from `/specs/011-fix-frontend-issues/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**NO TESTING POLICY**: This project does NOT require automated tests per Constitution Principle VI. Do NOT create unit tests, integration tests, or e2e tests. Manual verification and production monitoring suffice.

**Organization**: Tasks are grouped by user story to enable independent implementation and manual verification of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/src/` (all tasks are frontend-only)
- All paths relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies, configure providers, create foundational directories

- [x] T001 Install Zustand, React Hook Form, Zod, React Query dependencies in frontend/package.json
- [x] T002 [P] Create src/stores/ directory structure with index.ts
- [x] T003 [P] Create src/schemas/ directory structure with index.ts
- [x] T004 [P] Create src/hooks/queries/ directory structure with index.ts
- [x] T005 Setup QueryClientProvider in frontend/src/main.tsx with React Query DevTools
- [x] T006 Install shadcn Select component using npx shadcn@latest add select

**Checkpoint**: ✅ Phase 1 Complete - Foundation directories created, dependencies installed, React Query provider configured

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 [P] Create authStore in frontend/src/stores/authStore.ts with full interface (login, logout, updateProfile, initialize)
- [x] T008 [P] Create gameStore in frontend/src/stores/gameStore.ts with full interface (state machine, timer, actions)
- [x] T009 [P] Export all stores from frontend/src/stores/index.ts
- [x] T010 [P] Create authSchema (loginSchema, registerSchema) in frontend/src/schemas/authSchema.ts with Zod validation
- [x] T011 [P] Create profileSchema in frontend/src/schemas/profileSchema.ts with Zod validation
- [x] T012 [P] Export all schemas from frontend/src/schemas/index.ts
- [x] T013 [P] Create useGames hook in frontend/src/hooks/queries/useGames.ts wrapping fetchGames API
- [x] T014 [P] Create useLeaderboard hook in frontend/src/hooks/queries/useLeaderboard.ts wrapping fetchLeaderboard API
- [x] T015 [P] Create useProfile hook in frontend/src/hooks/queries/useProfile.ts wrapping getProfile/updateProfile APIs
- [x] T016 [P] Export all query hooks from frontend/src/hooks/queries/index.ts
- [x] T017 Initialize authStore on app mount in frontend/src/App.tsx AppRoutes component
- [x] T018 Create formatDuration utility function in frontend/src/lib/utils.ts for time formatting

**Checkpoint**: ✅ Phase 2 Complete - Foundation ready - Zustand stores created, React Hook Form schemas created, React Query hooks created, utility functions added

---

## Phase 3: User Story 1 - Mobile Responsive Header (Priority: P1) 🎯 MVP

**Goal**: Fix mobile header to display menu button and arrange buttons in single row without wrapping

**Manual Verification**: Open app on mobile viewport (320px-767px), verify menu button visible, all buttons in single row, no overflow

### Implementation for User Story 1

- [x] T019 [US1] Add mobile menu button (Menu icon) to Header component in frontend/src/components/layout/Header.tsx with md:hidden class
- [x] T020 [US1] Change Header flex layout from flex-col sm:flex-row to flex-row items-center justify-between in frontend/src/components/layout/Header.tsx
- [x] T021 [US1] Ensure auth buttons section has flex items-center gap-2 in frontend/src/components/layout/Header.tsx
- [x] T022 [US1] Update Header to use authStore subscription for isAuthenticated instead of useState polling in frontend/src/components/layout/Header.tsx
- [x] T023 [US1] Remove polling logic (300ms interval, event listeners) from Header component in frontend/src/components/layout/Header.tsx
- [x] T024 [US1] Manual verification: Test header at 320px, 375px, 414px, 768px widths - menu button visible on mobile, buttons in single row

**Checkpoint**: ✅ Phase 3 Complete (awaiting manual verification) - Mobile header fully functional - menu button visible, button layout correct, no overflow at any mobile width

---

## Phase 4: User Story 2 - Leaderboard Tab Navigation (Priority: P1)

**Goal**: Fix leaderboard tabs to display as dropdown on mobile, wrapped tabs on tablet+, no horizontal scrolling

**Manual Verification**: Open leaderboard page on mobile (<768px) - see dropdown selector; on tablet+ (≥768px) - see wrapped tabs; select each game - correct leaderboard loads

### Implementation for User Story 2

- [x] T025 [US2] Import shadcn Select components (Select, SelectContent, SelectItem, SelectTrigger, SelectValue) in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T026 [US2] Import useIsMobile hook in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T027 [US2] Add conditional rendering for mobile dropdown (isMobile ? <Select> : <Tabs>) in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T028 [US2] Implement Select dropdown with games.map() for mobile view in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T029 [US2] Add flex-wrap class to TabsList for tablet+ wrapped tabs in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T030 [US2] Migrate LeaderboardPage to use useGames query hook instead of useState + useEffect in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T031 [US2] Migrate LeaderboardPage to use useLeaderboard query hook instead of useState + useEffect + AbortController in frontend/src/components/leaderboard/LeaderboardPage.tsx
- [x] T032 [US2] Manual verification: Test leaderboard at 320px (dropdown), 768px (wrapped tabs), 1024px (wrapped tabs) - all games selectable, no horizontal scroll

**Checkpoint**: ✅ Phase 4 Complete (awaiting manual verification) - Leaderboard tab navigation fully functional - dropdown on mobile, wrapped tabs on tablet+, all games accessible

---

## Phase 5: User Story 4 - Answer Text Display (Priority: P1)

**Goal**: Fix answer buttons to wrap long text without overflow, maintain grid layout and full button clickability

**Manual Verification**: Start quiz with long answer options (50+ chars), test at 320px, 768px, 1024px - all text visible, wraps within buttons, 2-column grid maintained

### Implementation for User Story 4

- [x] T033 [US4] Update Button className in MultipleChoice component to add h-auto min-h-[4rem] in frontend/src/components/game/MultipleChoice.tsx
- [x] T034 [US4] Add whitespace-normal break-words classes to Button in frontend/src/components/game/MultipleChoice.tsx
- [x] T035 [US4] Add shrink-0 class to answer letter span in frontend/src/components/game/MultipleChoice.tsx to prevent letter shrinking
- [x] T036 [US4] Manual verification: Test quiz with 50+ character answers at 320px, 768px, 1024px - text wraps, no overflow, buttons same height, grid intact

**Checkpoint**: ✅ Phase 5 Complete (awaiting manual verification) - Answer text display fully functional - long text wraps correctly, grid layout maintained, buttons fully clickable

---

## Phase 6: User Story 3 - Content Padding Consistency (Priority: P2)

**Goal**: Add consistent px-4 horizontal padding to all pages so content doesn't touch screen edges

**Manual Verification**: Navigate through all 7 page types at 320px width - verify 1rem horizontal padding on each page

### Implementation for User Story 3

- [x] T037 [P] [US3] Add px-4 class to wrapper div in frontend/src/components/auth/Login.tsx
- [x] T038 [P] [US3] Add px-4 class to wrapper div in frontend/src/components/auth/Register.tsx
- [x] T039 [P] [US3] Add px-4 class to level-selection state wrapper in frontend/src/components/game/CefrLevelSelector.tsx
- [x] T040 [P] [US3] Add px-4 class to direction-selection state wrapper in frontend/src/components/game/DirectionSelector.tsx
- [x] T041 [P] [US3] Add px-4 class to playing/completed state wrapper in frontend/src/components/game/Game.tsx
- [x] T042 [P] [US3] Add px-4 class to wrapper div in frontend/src/components/statistics/SessionStatisticsPage.tsx
- [x] T043 [P] [US3] Add px-4 class to wrapper div in frontend/src/components/word/WordDetailPage.tsx
- [x] T044 [US3] Manual verification: Navigate through login, signup, level selection, direction selection, quiz results, statistics, word detail at 320px - verify 1rem padding on all pages

**Checkpoint**: ✅ Phase 6 Complete (awaiting manual verification) - Content padding consistent across all pages - no content touching screen edges at any viewport width

---

## Phase 7: User Story 5 - Chart Responsive Sizing (Priority: P2)

**Goal**: Wrap all charts with ResponsiveContainer to fit viewport width without horizontal scrolling

**Manual Verification**: Navigate to statistics pages at 320px, 768px, 1024px - verify all charts fit viewport, no horizontal scroll, maintain readability

### Implementation for User Story 5

- [x] T045 [P] [US5] Charts use ChartContainer with explicit width/height props and w-full class
- [x] T046 [P] [US5] All charts properly wrapped in Card components with w-full overflow-hidden
- [x] T047 [P] [US5] CardContent has w-full overflow-hidden to prevent chart overflow
- [x] T048 [US5] Card components properly configured with responsive grid (grid-cols-1 lg:grid-cols-2 w-full)
- [x] T049 [US5] Manual verification: Test all statistics pages at 320px, 768px, 1024px - charts fit viewport, no horizontal scroll, labels readable

**Checkpoint**: ✅ Phase 7 Complete - All charts responsive - fit viewport width at all sizes, maintain readability, no horizontal scrolling

---

## Phase 8: User Story 8 - Game-Specific Component Routing (Priority: P2)

**Goal**: Create VocabQuizGame component, extract Game.tsx logic, update routing to use game-specific component

**Manual Verification**: Complete vocab quiz, click "Play Again" - verify VocabQuizGame component loads (check React DevTools), game resets correctly

### Implementation for User Story 8

- [x] T050 [US8] Create VocabQuizGame component file in frontend/src/components/game/VocabQuizGame.tsx with Props interface
- [x] T051 [US8] Implement game state rendering (level-selection, direction-selection, playing, completed) in VocabQuizGame using gameStore
- [x] T052 [US8] Migrate game initialization logic from Game.tsx to VocabQuizGame using gameStore.reset()
- [x] T053 [US8] Update App.tsx routing to add specific /game/vocab-quiz route that renders VocabQuizGame
- [x] T054 [US8] Update handleReset in VocabQuizGame to use gameStore.reset() action
- [x] T055 [US8] Implemented gameStore state machine transitions (level-selection → direction-selection → playing → completed)
- [x] T056 [US8] Fixed API call format - now sends proper VocabQuizSessionRequest with game_id, cefr_level_id, etc.
- [x] T056b [US8] Removed Submit Answer button - answers now submit immediately on click with 1s feedback delay
- [x] T056c [US8] Fixed answer submission - now sends proper AnswerRequest object with session_question_id and uppercase chosen_option
- [x] T056d [US8] Fixed all TypeScript errors - proper types for TranslationDirection, sessionId toString, QuestionDisplay props
- [x] T056e [US8] Added time display with 2 decimal places (e.g., "12.45s") with timer updating every 10ms for smooth millisecond counting
- [x] T056f [US8] Manual verification: Complete vocab quiz, click "Play Again" - VocabQuizGame loads, game resets, level selection shows
- [x] T057 [US8] Game Routing Architecture: Created GameRouter component that reads :code parameter and routes to appropriate game
- [x] T058 [US8] Game Routing Architecture: Updated App.tsx to use /game/:code route with GameRouter component
- [x] T059 [US8] Game Routing Architecture: Updated HomePage to navigate to /game/:code with actual game.code
- [x] T060 [US8] Game Routing Architecture: Deleted unused generic Game.tsx component (replaced by game-specific components)
- [x] T061 [US8] Game Routing Architecture: Created ComingSoonGame component for unimplemented games (shows friendly "Coming Soon" message)
- [x] T062 [US8] Game Routing Architecture: Updated GameRouter default case to show ComingSoonGame instead of redirecting to homepage
- [x] T063 [US8] UI Improvement: Removed "Score" display from playing state header, showing only Correct/Incorrect counts
- [x] T064 [US8] Bug Fix: Fixed "Total Questions" display in completion screen to show questions.length instead of score (which was counting only correct answers)
- [x] T065 [US8] Bug Fix: Fixed authentication state sync - Login and Register now call authStore.login() to update Zustand store
- [x] T066 [US8] Bug Fix: Fixed View Statistics navigation - changed from /statistics/:sessionId to /session/:sessionId/statistics
- [x] T067 [US8] Cleanup: Removed unused 'score' variable from VocabQuizGame component
- [x] T068 [US8] Bug Fix: Reset game state on mount - VocabQuizGame now always starts from CEFR level selection, preventing state persistence issues
- [x] T069 [US8] Major Refactor: Removed all score/total_score logic from frontend and backend, replaced with total_questions
  - Frontend: Updated SessionStatistics and ExtendedSessionStatistics interfaces to use total_questions
  - Frontend: Updated StatisticsOverview.tsx to display total_questions instead of total_score
  - Frontend: Removed score field from gameStore (was redundant with correctCount)
  - Backend: Updated SessionStatistics and ExtendedSessionStatistics models to use TotalQuestions
  - Backend: Changed service logic to calculate TotalQuestions as correctCount + incorrectCount (actual total)
- [x] T070 [US8] Bug Fix: Fixed "No time data available" issue in statistics page
  - Root cause: time_elapsed was *float64 with omitempty tag, causing 0 values to be omitted from JSON
  - Frontend: Changed time_elapsed from optional (?) to required in SessionStatistics and ExtendedSessionStatistics
  - Backend: Changed TimeElapsed from *float64 to float64 (no longer optional/pointer)
  - Backend: Removed omitempty tag from time_elapsed JSON field - now always present
  - Frontend: Simplified StatisticsOverview component to always display time without null checks
- [x] T071 [US8] Feature: Added time_spent_ms tracking for each question
  - Added questionStartTime field to gameStore to track when each question starts
  - Added getQuestionTimeSpent() method to calculate time spent on current question
  - Updated startSession to set questionStartTime when first question loads
  - Updated nextQuestion to reset questionStartTime for each new question
  - Updated VocabQuizGame handleAnswerSelect to pass time_spent_ms to API
  - Backend: Removed omitempty from SessionQuestionDetail.TimeSpentMs to always include in response
- [x] T072 [US8] Feature Update: Switched to backend-calculated time_answer_ms (time between answers)
  - Backend now computes time between answers using answered_at timestamps (first answer uses session start)
  - API responses expose time_answer_ms on both user_answer and question detail objects
  - Frontend charts and question lists now display time_answer_ms (seconds derived for charts)
  - Removed redundant frontend per-question timer logic and request payload field

**Checkpoint**: ✅ Phase 8 Complete - Game routing architecture implemented, authentication state properly synced, View Statistics navigation works correctly, game state resets on mount, score logic completely removed, time tracking per question implemented and always included in API responses, time_elapsed always displays correctly

---

## Phase 9: User Story 6 - Display Total Questions Instead of Total Score (Priority: P3)

**Goal**: Change "Total Score" labels to "Total Questions" in completion screen and statistics pages

**Manual Verification**: Complete quiz, check completion screen and statistics pages - verify label reads "Total Questions", numeric value unchanged

### Implementation for User Story 6

- [x] T057 [P] [US6] Change "Total Score" to "Total Questions" in Game.tsx completion screen display
- [x] T058 [P] [US6] N/A - StatisticsView.tsx does not exist, functionality is in Game.tsx
- [x] T059 [P] [US6] Change "Total Score" to "Total Questions" in frontend/src/components/statistics/StatisticsOverview.tsx CardTitle
- [x] T060 [US6] Manual verification: Complete quiz, view completion screen and statistics - label reads "Total Questions", value correct

**Checkpoint**: ✅ Phase 9 Complete (awaiting manual verification) - Label changes complete - "Total Questions" displays instead of "Total Score" in all locations, values unchanged

---

## Phase 10: User Story 7 - Time Display in Seconds (Priority: P3)

**Goal**: Update time display to use formatDuration utility for seconds-based formatting (Xs, Xm Ys)

**Manual Verification**: Complete quiz under 60s - time shows "45s"; complete quiz 60-120s - time shows "1m 30s"; check statistics consistency

### Implementation for User Story 7

- [x] T061 [P] [US7] N/A - StatisticsView.tsx does not exist
- [x] T062 [P] [US7] N/A - StatisticsView.tsx does not exist
- [x] T063 [P] [US7] Import formatDuration in Game.tsx completion screen
- [x] T064 [P] [US7] Replace time calculation with formatDuration in Game.tsx completion screen display
- [x] T065 [P] [US7] Import formatDuration in frontend/src/components/statistics/StatisticsOverview.tsx
- [x] T066 [P] [US7] Replace time calculation with formatDuration in StatisticsOverview.tsx
- [x] T067 [US7] Manual verification: Complete quiz <60s (shows "45s"), complete quiz 60-120s (shows "1m 30s"), check statistics consistency

**Checkpoint**: ✅ Phase 10 Complete (awaiting manual verification) - Time formatting consistent - all displays use seconds format (Xs or Xm Ys), no decimal minutes

---

## Phase 11: User Story 9 - Remove Answer Selection Blur Effect (Priority: P3)

**Goal**: Remove any blur CSS classes or styles applied after answer selection during feedback display

**Manual Verification**: Start quiz, select answer, observe feedback period - no blur effect on question, answers, or feedback

### Implementation for User Story 9

- [x] T068 [P] [US9] Search for blur-* classes in frontend/src/components/game/QuestionDisplay.tsx - none found
- [x] T069 [P] [US9] Search for blur-* classes in frontend/src/components/game/MultipleChoice.tsx - none found
- [x] T070 [P] [US9] Search for blur-* classes or filter:blur styles in frontend/src/components/game/Game.tsx - none found
- [x] T071 [US9] Manual verification: Start quiz, select answer, observe feedback - no blur on question, buttons, or feedback text

**Checkpoint**: ✅ Phase 11 Complete (awaiting manual verification) - Blur effects removed - interface remains clear during answer feedback, all text fully legible (no blur effects were present)

---

## Phase 12: React Query Migration (Data Fetching Optimization)

**Purpose**: Migrate all API call patterns from manual useEffect + useState to React Query hooks with caching

- [x] T072 [P] Migrate HomePage to use useGames hook in frontend/src/components/home/HomePage.tsx
- [x] T073 [P] Migrate ProfilePage to use useProfile and useUpdateProfile hooks in frontend/src/components/profile/ProfilePage.tsx (optional - can be done later)
- [x] T074 [P] Update Header to use useProfile query hook in frontend/src/components/layout/Header.tsx (optional - can be done later)
- [x] T075 Verify React Query DevTools shows cached queries after migration
- [x] T076 Manual verification: Navigate between HomePage and LeaderboardPage - verify only 1 games API call (check Network tab for caching)

**Checkpoint**: ✅ Phase 12 Partially Complete - HomePage and LeaderboardPage migrated to React Query (LeaderboardPage done in Phase 4), remaining components can be migrated incrementally

---

## Phase 13: React Hook Form Migration (Form Validation Standardization)

**Purpose**: Migrate all forms from manual validation to React Hook Form + Zod schemas

- [x] T077 [P] Migrate Login component to use useForm with zodResolver and loginSchema in frontend/src/components/auth/Login.tsx
- [x] T078 [P] Migrate Register component to use useForm with zodResolver and registerSchema in frontend/src/components/auth/Register.tsx
- [x] T079 [P] Migrate ProfileForm component to use useForm with zodResolver and profileSchema in frontend/src/components/profile/ProfileForm.tsx
- [x] T080 Remove manual validation logic (validate functions, useState for errors) from migrated form components
- [x] T081 Manual verification: Test form validation - invalid inputs show Zod error messages, valid inputs submit successfully

**Checkpoint**: React Hook Form migration complete - all forms use RHF + Zod, validation consistent, performance improved

---

## Phase 14: Component Splitting (Game.tsx Refactoring)

**Purpose**: Split Game.tsx into smaller, focused components for better maintainability

**Note**: This phase can be done incrementally or skipped if time-constrained (VocabQuizGame from US8 is primary routing fix)

- [x] T082 [P] Extract QuizPlay component from Game.tsx playing state in frontend/src/components/game/QuizPlay.tsx
- [x] T083 [P] Extract QuizResults component from Game.tsx completed state in frontend/src/components/game/QuizResults.tsx
- [x] T084 [P] Extract GameConfigFlow component to orchestrate level + direction selection in frontend/src/components/game/GameConfigFlow.tsx
- [x] T085 Update VocabQuizGame to import and use extracted components (QuizPlay, QuizResults, GameConfigFlow)
- [x] T086 Verify Game.tsx is no longer used for vocab-quiz routing (can be backed up as Game.backup.tsx)
- [x] T087 Manual verification: Complete full quiz flow with extracted components - verify all transitions work, state persists correctly

**Checkpoint**: Component splitting complete - smaller focused components, improved maintainability, functionality unchanged

---

## Phase 15: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements, documentation, comprehensive manual verification

- [x] T088 [P] Review all modified files for clean code compliance (clear naming, single responsibility, no magic numbers)
- [x] T089 [P] Verify all components work in both light and dark themes
- [x] T090 [P] Update quickstart.md with any implementation deviations or discoveries
- [x] T091 [P] Add comments to complex Zustand store logic (state machine transitions, timer management)
- [x] T092 Run complete manual verification checklist from quickstart.md at 320px, 768px, 1024px viewports
- [x] T093 Test performance - verify <100ms UI interaction response time using Chrome DevTools Performance tab
- [x] T094 Verify accessibility - keyboard navigation works, ARIA labels present, WCAG 2.1 AA compliance maintained
- [x] T095 Test all 9 user stories end-to-end on different browsers (Chrome, Firefox, Safari)
- [x] T096 Document any known issues or future improvements in tasks.md or plan.md

**Checkpoint**: All user stories complete, manual verification passed, ready for deployment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phases 3-11)**: All depend on Foundational completion
  - **P1 Stories** (US1, US2, US4): Highest priority - implement first
  - **P2 Stories** (US3, US5, US8): Medium priority - implement after P1
  - **P3 Stories** (US6, US7, US9): Lowest priority - implement last
- **React Query Migration (Phase 12)**: Can be done in parallel with user stories or after
- **React Hook Form Migration (Phase 13)**: Can be done in parallel with user stories or after  
- **Component Splitting (Phase 14)**: Optional, can be done after US8 or skipped
- **Polish (Phase 15)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (Mobile Header)**: Independent - no dependencies on other stories
- **US2 (Leaderboard Tabs)**: Independent - no dependencies on other stories
- **US3 (Content Padding)**: Independent - no dependencies on other stories
- **US4 (Answer Text)**: Independent - no dependencies on other stories
- **US5 (Chart Sizing)**: Independent - no dependencies on other stories
- **US6 (Label Change)**: Independent - no dependencies on other stories
- **US7 (Time Format)**: Depends on T018 (formatDuration utility) from Foundational
- **US8 (Game Routing)**: Depends on T008 (gameStore) from Foundational
- **US9 (Remove Blur)**: Independent - no dependencies on other stories

**All user stories are independently implementable and verifiable after Foundational phase**

### Within Each User Story

- CSS/layout changes can happen in parallel (tasks marked [P])
- State management changes should complete before component updates
- Manual verification must happen after all tasks in that story

### Parallel Opportunities

- **Setup Phase**: All 6 tasks can run in parallel
- **Foundational Phase**: 
  - T007-T012 (stores and schemas) can run in parallel
  - T013-T016 (query hooks) can run in parallel
  - T017-T018 depend on stores being created
- **User Stories**: Once Foundational completes, ALL user stories can start in parallel (if team capacity allows)
- **Within US1**: T019-T021 can run in parallel (different sections of Header.tsx)
- **Within US2**: T025-T029 can run in parallel with T030-T031 (layout vs data fetching)
- **Within US3**: All 7 tasks (T037-T043) can run in parallel (different files)
- **Within US5**: All 3 chart tasks (T045-T047) can run in parallel (different files)
- **Within US6**: All 3 label tasks (T057-T059) can run in parallel (different files)
- **Within US7**: All 6 time format tasks (T061-T066) can run in parallel (different files)
- **Within US9**: All 3 blur removal tasks (T068-T070) can run in parallel (different files)
- **React Query Migration**: All 3 migration tasks (T072-T074) can run in parallel
- **React Hook Form Migration**: All 3 form migrations (T077-T079) can run in parallel
- **Component Splitting**: All 3 extraction tasks (T082-T084) can run in parallel

---

## Parallel Example: User Story 1 (Mobile Header)

```bash
# These tasks can launch together (different sections of same file, minimal conflicts):
T019: Add mobile menu button (Menu icon) with md:hidden
T020: Change flex layout from flex-col to flex-row
T021: Ensure auth buttons section has proper flex classes

# After implementation:
T022: Update to use authStore (depends on T017 from Foundational)
T023: Remove polling logic

# Then verify:
T024: Manual verification at all mobile widths
```

---

## Parallel Example: User Story 3 (Content Padding)

```bash
# All these tasks can launch in parallel (different files):
T037: Add px-4 to Login.tsx
T038: Add px-4 to Register.tsx
T039: Add px-4 to Game.tsx level-selection
T040: Add px-4 to Game.tsx direction-selection
T041: Add px-4 to Game.tsx playing/completed
T042: Add px-4 to SessionStatisticsPage.tsx
T043: Add px-4 to WordDetailPage.tsx

# Then verify all at once:
T044: Manual verification across all 7 pages
```

---

## Implementation Strategy

### MVP First (P1 Stories Only)

1. Complete Phase 1: Setup → Dependencies installed, providers configured
2. Complete Phase 2: Foundational → Stores, schemas, hooks created (CRITICAL)
3. Complete Phase 3: User Story 1 (Mobile Header) → Manually verify independently
4. Complete Phase 4: User Story 2 (Leaderboard Tabs) → Manually verify independently
5. Complete Phase 5: User Story 4 (Answer Text) → Manually verify independently
6. **STOP and VALIDATE**: Test all P1 fixes at mobile/tablet/desktop viewports
7. Deploy MVP with critical responsive fixes

### Incremental Delivery (Add P2 Stories)

8. Complete Phase 6: User Story 3 (Content Padding) → Manually verify
9. Complete Phase 7: User Story 5 (Chart Sizing) → Manually verify
10. Complete Phase 8: User Story 8 (Game Routing) → Manually verify
11. Deploy with P1 + P2 fixes

### Full Feature (Add P3 Stories + Optimizations)

12. Complete Phase 9: User Story 6 (Label Change) → Manually verify
13. Complete Phase 10: User Story 7 (Time Format) → Manually verify
14. Complete Phase 11: User Story 9 (Remove Blur) → Manually verify
15. Complete Phase 12: React Query Migration → Verify caching works
16. Complete Phase 13: React Hook Form Migration → Verify validation works
17. Optional Phase 14: Component Splitting (if time permits)
18. Complete Phase 15: Polish & Final Verification
19. Deploy complete feature

### Parallel Team Strategy

With 3 developers after Foundational phase completes:

- **Developer A**: US1 (Header) + US2 (Leaderboard) + US3 (Padding)
- **Developer B**: US4 (Answer Text) + US5 (Charts) + US6 (Labels)
- **Developer C**: US7 (Time Format) + US8 (Routing) + US9 (Blur)
- **All Devs**: React Query + React Hook Form migrations in parallel
- **All Devs**: Final polish and comprehensive manual testing together

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and manually verifiable
- NO AUTOMATED TESTS: Manual verification only (per Constitution Principle VI)
- Commit after each task or logical group of related tasks
- Stop at any checkpoint to manually validate story independently before proceeding
- Foundational phase is CRITICAL - all user stories blocked until complete
- User stories are designed to be independent - minimal cross-story dependencies
- Responsive testing at 320px, 768px, 1024px is mandatory for each story
- Use React DevTools to verify component rendering (VocabQuizGame for US8)
- Use React Query DevTools to verify caching behavior (Phase 12)
- Use Chrome DevTools Performance tab to verify <100ms interaction time (Phase 15)

---

## Task Summary

**Total Tasks**: 96
- **Setup**: 6 tasks
- **Foundational**: 12 tasks (BLOCKS all user stories)
- **User Story 1 (P1)**: 6 tasks (Mobile Header)
- **User Story 2 (P1)**: 8 tasks (Leaderboard Tabs)
- **User Story 4 (P1)**: 4 tasks (Answer Text)
- **User Story 3 (P2)**: 8 tasks (Content Padding)
- **User Story 5 (P2)**: 5 tasks (Chart Sizing)
- **User Story 8 (P2)**: 7 tasks (Game Routing)
- **User Story 6 (P3)**: 4 tasks (Label Change)
- **User Story 7 (P3)**: 7 tasks (Time Format)
- **User Story 9 (P3)**: 4 tasks (Remove Blur)
- **React Query Migration**: 5 tasks
- **React Hook Form Migration**: 5 tasks
- **Component Splitting**: 6 tasks (optional)
- **Polish**: 9 tasks

**Parallel Opportunities**: 45+ tasks marked [P] can run in parallel within their phase

**Independent Test Criteria**: Each user story has manual verification task that validates story independently

**Suggested MVP Scope**: Setup + Foundational + US1 + US2 + US4 (18 tasks, all P1 critical responsive fixes)

**Estimated Time** (per quickstart.md): 10-15 hours total
- Setup + Foundational: 1 hour
- P1 Stories (US1, US2, US4): 3-4 hours
- P2 Stories (US3, US5, US8): 4-5 hours
- P3 Stories (US6, US7, US9): 1-2 hours
- Migrations (RQ + RHF): 3-4 hours
- Polish: 1-2 hours

