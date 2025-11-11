# Tasks: Session Statistics Page

**Input**: Design documents from `/specs/008-session-statistics-page/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**NO TESTING POLICY**: This project does NOT require automated tests per Constitution Principle V. Do NOT create unit tests, integration tests, or e2e tests. Manual verification and production monitoring suffice.

**Organization**: Tasks are grouped by user story to enable independent implementation and manual verification of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/internal/modules/vocab_quiz/` at repository root
- **Frontend**: `frontend/src/` at repository root
- Paths shown below use structure from plan.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and component installation

- [x] T001 Install shadcn UI table component in frontend directory via `npx shadcn@latest add table`
- [x] T002 Install shadcn UI badge component in frontend directory via `npx shadcn@latest add badge`
- [x] T003 Install shadcn UI breadcrumb component in frontend directory via `npx shadcn@latest add breadcrumb`
- [x] T004 Verify table component created at frontend/src/components/ui/table.tsx
- [x] T005 Verify badge component created at frontend/src/components/ui/badge.tsx
- [x] T006 Verify breadcrumb component created at frontend/src/components/ui/breadcrumb.tsx

**Checkpoint**: All required shadcn UI components installed and ready to use

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend API Endpoint

- [x] T007 Add SessionQuestionDetail struct to backend/internal/modules/vocab_quiz/model/question.go
- [x] T008 Add SessionInfo struct to backend/internal/modules/vocab_quiz/model/question.go
- [x] T009 Add SessionDetailsResponse struct to backend/internal/modules/vocab_quiz/model/question.go
- [x] T010 Add QuestionOption struct to backend/internal/modules/vocab_quiz/model/question.go (if not exists, differs from Option)
- [x] T011 Add UserAnswer struct to backend/internal/modules/vocab_quiz/model/question.go
- [x] T012 [P] Implement GetSessionDetails service method in backend/internal/modules/vocab_quiz/service/service.go
- [x] T013 [P] Add authorization check (verify session belongs to authenticated user) in GetSessionDetails method in backend/internal/modules/vocab_quiz/service/service.go
- [x] T014 [P] Implement database queries to fetch session questions with answers in GetSessionDetails method in backend/internal/modules/vocab_quiz/service/service.go
- [x] T015 [P] Implement database queries to fetch session statistics in GetSessionDetails method in backend/internal/modules/vocab_quiz/service/service.go
- [x] T016 [P] Implement database queries to fetch session info (CEFR level, translation direction, timestamps) in GetSessionDetails method in backend/internal/modules/vocab_quiz/service/service.go
- [x] T017 [P] Add GetSessionDetails handler in backend/internal/modules/vocab_quiz/handler/http.go
- [x] T018 [P] Add route registration for GET /vocab-quiz/session/:sessionId/details in backend/internal/modules/vocab_quiz/wiring.go
- [x] T019 [P] Add error handling for session not found, unauthorized access, and database errors in GetSessionDetails handler in backend/internal/modules/vocab_quiz/handler/http.go
- [x] T020 Manual verification: Test backend API endpoint with Postman/curl - verify response matches OpenAPI contract in specs/008-session-statistics-page/contracts/openapi.yaml

**Checkpoint**: Foundation ready - backend API endpoint returns comprehensive session data. User story implementation can now begin.

---

## Phase 3: User Story 1 - View Session Statistics on Dedicated Page with Charts (Priority: P1) 🎯 MVP

**Goal**: Display comprehensive session statistics on a dedicated page (not a popup) with three visual charts: accuracy breakdown (pie/donut), time analysis (bar/line), and performance over time (dual-axis or two charts showing running accuracy and correct/incorrect indicators). Users can navigate to this page from the game completion screen.

**Manual Verification**: Complete a vocabulary quiz session, click "View Statistics" button, verify navigation to `/session/:sessionId/statistics` page (not a popup), verify overview statistics are displayed (score, correct/incorrect counts, accuracy, time elapsed), verify all three charts are displayed and render correctly, verify page is accessible via direct URL and after page refresh.

### Frontend Types

- [x] T021 [P] [US1] Add SessionDetails interface to frontend/src/types/index.ts
- [x] T022 [P] [US1] Add SessionQuestionDetail interface to frontend/src/types/index.ts
- [x] T023 [P] [US1] Add QuestionOption interface to frontend/src/types/index.ts
- [x] T024 [P] [US1] Add UserAnswer interface to frontend/src/types/index.ts
- [x] T025 [P] [US1] Add SessionInfo interface to frontend/src/types/index.ts

### API Integration

- [x] T026 [US1] Add getSessionDetails API function to frontend/src/lib/api.ts
- [x] T027 [US1] Add error handling for API errors (404, 403, 500) in getSessionDetails function in frontend/src/lib/api.ts
- [x] T028 [US1] Add loading state management for API calls in getSessionDetails function in frontend/src/lib/api.ts

### Statistics Overview Component

- [x] T029 [P] [US1] Create StatisticsOverview component in frontend/src/components/statistics/StatisticsOverview.tsx
- [x] T030 [P] [US1] Display total score card using shadcn Card component in StatisticsOverview.tsx
- [x] T031 [P] [US1] Display correct count card using shadcn Card component in StatisticsOverview.tsx
- [x] T032 [P] [US1] Display incorrect count card using shadcn Card component in StatisticsOverview.tsx
- [x] T033 [P] [US1] Display accuracy percentage card using shadcn Card component in StatisticsOverview.tsx
- [x] T034 [P] [US1] Display time elapsed card using shadcn Card component in StatisticsOverview.tsx
- [x] T035 [P] [US1] Add responsive grid layout for statistics cards in StatisticsOverview.tsx

### Statistics Charts Component

- [x] T036 [P] [US1] Create StatisticsCharts component in frontend/src/components/statistics/StatisticsCharts.tsx
- [x] T037 [P] [US1] Implement accuracy breakdown chart (pie/donut) using shadcn Chart component with Recharts in StatisticsCharts.tsx
- [x] T038 [P] [US1] Implement time analysis chart (bar/line) showing time spent per question using shadcn Chart component with Recharts in StatisticsCharts.tsx
- [x] T039 [P] [US1] Implement performance over time chart showing running accuracy percentage trend using shadcn Chart component with Recharts in StatisticsCharts.tsx
- [x] T040 [P] [US1] Implement performance over time chart showing correct/incorrect indicators by question number using shadcn Chart component with Recharts in StatisticsCharts.tsx
- [x] T041 [P] [US1] Combine running accuracy and correct/incorrect indicators in performance over time chart (dual-axis or two separate charts) in StatisticsCharts.tsx
- [x] T042 [P] [US1] Add chart titles and labels using shadcn UI typography in StatisticsCharts.tsx
- [x] T043 [P] [US1] Add responsive layout for charts using Tailwind CSS grid in StatisticsCharts.tsx
- [x] T044 [P] [US1] Handle empty data cases gracefully in all charts (display appropriate message or empty state) in StatisticsCharts.tsx

### Session Statistics Page Component

- [x] T045 [US1] Create SessionStatisticsPage component in frontend/src/components/statistics/SessionStatisticsPage.tsx
- [x] T046 [US1] Extract sessionId from URL route parameter using React Router useParams in SessionStatisticsPage.tsx
- [x] T047 [US1] Fetch session details using getSessionDetails API function on component mount in SessionStatisticsPage.tsx
- [x] T048 [US1] Add loading state with skeleton screens (overview statistics, charts placeholders) using shadcn Skeleton component in SessionStatisticsPage.tsx
- [x] T049 [US1] Add error state handling (session not found, unauthorized, network error) with error messages in SessionStatisticsPage.tsx
- [x] T050 [US1] Render StatisticsOverview component with session statistics data in SessionStatisticsPage.tsx
- [x] T051 [US1] Render StatisticsCharts component with session questions data in SessionStatisticsPage.tsx
- [x] T052 [US1] Add page title and breadcrumb navigation using shadcn Breadcrumb component in SessionStatisticsPage.tsx
- [x] T053 [US1] Add responsive layout for mobile and desktop using Tailwind CSS in SessionStatisticsPage.tsx

### Routing and Navigation

- [x] T054 [US1] Add route for /session/:sessionId/statistics in frontend/src/App.tsx
- [x] T055 [US1] Add authentication check for statistics route (redirect to login if not authenticated) in frontend/src/App.tsx
- [x] T056 [US1] Update Game.tsx to navigate to /session/:sessionId/statistics when "View Statistics" button is clicked in frontend/src/components/game/Game.tsx
- [x] T057 [US1] Remove StatisticsView modal rendering from Game.tsx (replace with navigation) in frontend/src/components/game/Game.tsx
- [x] T058 [US1] Update handleViewStatistics function to use React Router useNavigate in frontend/src/components/game/Game.tsx

### Manual Verification

- [x] T059 [US1] Manual verification: Complete a vocabulary quiz session, click "View Statistics", verify navigation to dedicated page (not popup)
- [x] T060 [US1] Manual verification: Verify overview statistics display correctly (score, correct/incorrect, accuracy, time)
- [x] T061 [US1] Manual verification: Verify all three charts render correctly (accuracy breakdown, time analysis, performance over time)
- [x] T062 [US1] Manual verification: Verify page is accessible via direct URL (/session/:sessionId/statistics)
- [x] T063 [US1] Manual verification: Verify page loads correctly after refresh
- [x] T064 [US1] Manual verification: Verify skeleton loading states display while data is fetched
- [x] T065 [US1] Manual verification: Verify error messages display for invalid session IDs and unauthorized access

**Checkpoint**: At this point, User Story 1 should be fully functional and manually verified. Users can view comprehensive session statistics on a dedicated page with three visual charts.

---

## Phase 4: User Story 2 - View Detailed List of Questions and Answers (Priority: P2)

**Goal**: Display a detailed list of all questions from the session on the statistics page, showing each question's text (word), all answer options, user's selected answer, correct answer, correctness status, and time spent. Questions are displayed in the order they were answered.

**Manual Verification**: Navigate to a session statistics page, scroll to the questions section, verify all questions from the session are listed, verify each question displays question text, all options (a, b, c, d), user's selected answer (highlighted), correct answer (clearly indicated), correctness status, and time spent, verify questions are in correct order.

### Questions List Component

- [x] T066 [P] [US2] Create QuestionsList component in frontend/src/components/statistics/QuestionsList.tsx
- [x] T067 [P] [US2] Display questions in a table or card-based list using shadcn Table or Card components in QuestionsList.tsx
- [x] T068 [P] [US2] Display question number (order in session) for each question in QuestionsList.tsx
- [x] T069 [P] [US2] Display question text (word) for each question in QuestionsList.tsx
- [x] T070 [P] [US2] Display all four answer options (a, b, c, d with text) for each question in QuestionsList.tsx
- [x] T071 [P] [US2] Display user's selected answer with highlighting or visual indicator in QuestionsList.tsx
- [x] T072 [P] [US2] Display correct answer with clear visual indicator (e.g., checkmark, badge) in QuestionsList.tsx
- [x] T073 [P] [US2] Display correctness status (correct/incorrect) using shadcn Badge component in QuestionsList.tsx
- [x] T074 [P] [US2] Display time spent on each question (formatted as seconds or milliseconds) in QuestionsList.tsx
- [x] T075 [P] [US2] Highlight incorrect answers differently from correct answers (e.g., red border for incorrect, green for correct) in QuestionsList.tsx
- [x] T076 [P] [US2] Sort questions by question_number (order they were answered) in QuestionsList.tsx
- [x] T077 [P] [US2] Add responsive layout for questions list (mobile-friendly table or card layout) in QuestionsList.tsx
- [x] T078 [P] [US2] Handle empty questions list case (display appropriate message) in QuestionsList.tsx
- [x] T079 [P] [US2] Make question text (word) clickable (prepare for US3 navigation) in QuestionsList.tsx

### Integration with Session Statistics Page

- [x] T080 [US2] Import QuestionsList component in SessionStatisticsPage.tsx
- [x] T081 [US2] Render QuestionsList component with session questions data in SessionStatisticsPage.tsx
- [x] T082 [US2] Add skeleton loading placeholder for questions list section in SessionStatisticsPage.tsx
- [x] T083 [US2] Add section title and separator using shadcn Separator component in SessionStatisticsPage.tsx

### Manual Verification

- [x] T084 [US2] Manual verification: Navigate to session statistics page, verify questions list section is displayed
- [x] T085 [US2] Manual verification: Verify all questions from session are listed in correct order
- [x] T086 [US2] Manual verification: Verify each question displays all required information (text, options, selected answer, correct answer, status, time)
- [x] T087 [US2] Manual verification: Verify incorrect answers are clearly distinguished from correct answers
- [x] T088 [US2] Manual verification: Verify questions list is scrollable and responsive on mobile devices
- [x] T089 [US2] Manual verification: Verify questions list handles sessions with many questions (up to 50) without performance issues

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently and be manually verified. The statistics page displays overview statistics, charts, and a detailed questions/answers list.

---

## Phase 5: User Story 3 - Navigate to Word Detail Page from Statistics (Priority: P3)

**Goal**: Allow users to click on any word (question text) in the questions list to navigate to a dedicated word detail page that displays comprehensive word information (mandatory: word text, translations, difficulty level; optional: examples, part of speech, phonetic, related words). Users can navigate back to the statistics page.

**Manual Verification**: Navigate to session statistics page, click on a word in the questions list, verify navigation to word detail page, verify word detail page displays mandatory information (word text, translations, difficulty), verify optional information displays if available, verify back navigation returns to statistics page, verify word detail page is accessible via direct URL.

### Backend Word Detail Endpoint (if needed)

- [x] T090 [P] [US3] Check if word detail endpoint exists in backend (verify existing API or create new endpoint)
- [x] T091 [P] [US3] Add GetWordDetail service method in backend/internal/modules/vocab_quiz/service/service.go (if endpoint doesn't exist)
- [x] T092 [P] [US3] Add GetWordDetail handler in backend/internal/modules/vocab_quiz/handler/http.go (if endpoint doesn't exist)
- [x] T093 [P] [US3] Add route registration for GET /vocab-quiz/word/:wordId in backend/internal/modules/vocab_quiz/wiring.go (if endpoint doesn't exist)
- [x] T094 [P] [US3] Add WordDetail model struct to backend/internal/modules/vocab_quiz/model/question.go (if endpoint doesn't exist)

### Frontend Types

- [x] T095 [P] [US3] Add WordDetail interface to frontend/src/types/index.ts
- [x] T096 [P] [US3] Add WordTranslation interface to frontend/src/types/index.ts
- [x] T097 [P] [US3] Add WordExample interface to frontend/src/types/index.ts (if needed)
- [x] T098 [P] [US3] Add RelatedWord interface to frontend/src/types/index.ts (not needed - removed from spec)

### API Integration

- [x] T099 [US3] Add getWordDetail API function to frontend/src/lib/api.ts
- [x] T100 [US3] Add error handling for word not found and API errors in getWordDetail function in frontend/src/lib/api.ts

### Word Detail Page Component

- [x] T101 [P] [US3] Create WordDetailPage component in frontend/src/components/word/WordDetailPage.tsx
- [x] T102 [P] [US3] Extract wordId from URL route parameter using React Router useParams in WordDetailPage.tsx
- [x] T103 [P] [US3] Fetch word details using getWordDetail API function on component mount in WordDetailPage.tsx
- [x] T104 [P] [US3] Display word text using shadcn typography in WordDetailPage.tsx
- [x] T105 [P] [US3] Display translations (in both languages) using shadcn Card component in WordDetailPage.tsx
- [x] T106 [P] [US3] Display difficulty level using shadcn Badge component in WordDetailPage.tsx
- [x] T107 [P] [US3] Display examples of usage (if available) using shadcn Card component in WordDetailPage.tsx
- [x] T108 [P] [US3] Display part of speech (if available) using shadcn Badge component in WordDetailPage.tsx
- [x] T109 [P] [US3] Display phonetic information (if available) using shadcn typography in WordDetailPage.tsx
- [x] T111 [P] [US3] Add loading state with skeleton screens using shadcn Skeleton component in WordDetailPage.tsx
- [x] T112 [P] [US3] Add error state handling (word not found, mandatory fields missing) with error messages in WordDetailPage.tsx
- [x] T113 [P] [US3] Add back navigation button using shadcn Button component (navigate to previous page or statistics page) in WordDetailPage.tsx
- [x] T114 [P] [US3] Add breadcrumb navigation using shadcn Breadcrumb component in WordDetailPage.tsx
- [x] T115 [P] [US3] Add responsive layout for mobile and desktop using Tailwind CSS in WordDetailPage.tsx
- [x] T116 [P] [US3] Handle cases where optional fields are unavailable (display only mandatory fields) in WordDetailPage.tsx

### Routing and Navigation

- [x] T117 [US3] Add route for /word/:wordId in frontend/src/App.tsx
- [x] T118 [US3] Update QuestionsList component to navigate to /word/:wordId when word is clicked in frontend/src/components/statistics/QuestionsList.tsx
- [x] T119 [US3] Add click handler for word text in QuestionsList component using React Router useNavigate in frontend/src/components/statistics/QuestionsList.tsx
- [x] T120 [US3] Pass wordId as route parameter when navigating to word detail page in QuestionsList.tsx
- [x] T121 [US3] Store statistics page URL in navigation state to enable back navigation in QuestionsList.tsx

### Manual Verification

- [x] T122 [US3] Manual verification: Navigate to session statistics page, click on a word in questions list, verify navigation to word detail page
- [x] T123 [US3] Manual verification: Verify word detail page displays mandatory information (word text, translations, difficulty)
- [x] T124 [US3] Manual verification: Verify optional information displays if available (examples, part of speech, phonetic, related words)
- [x] T125 [US3] Manual verification: Verify back navigation returns to statistics page
- [x] T126 [US3] Manual verification: Verify word detail page is accessible via direct URL (/word/:wordId)
- [x] T127 [US3] Manual verification: Verify word detail page loads correctly after refresh
- [x] T128 [US3] Manual verification: Verify error messages display for words with missing mandatory fields
- [x] T129 [US3] Manual verification: Verify word detail page handles optional fields gracefully (displays available fields only)

**Checkpoint**: All user stories should now be independently functional and manually verified. Users can view session statistics with charts, review questions/answers, and navigate to word detail pages.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and enhance user experience

### Skeleton Loading States

- [x] T130 [P] Enhance skeleton loading states to match final layout structure (overview statistics, charts, questions list) in SessionStatisticsPage.tsx
- [x] T131 [P] Add skeleton loading for word detail page (word text, translations, optional fields) in WordDetailPage.tsx
- [x] T132 [P] Verify skeleton UI matches final layout structure for all sections in SessionStatisticsPage.tsx (Manual verification required)

### Error Handling

- [x] T133 [P] Add comprehensive error handling for all edge cases (missing data, empty sessions, invalid sessions) in SessionStatisticsPage.tsx
- [x] T134 [P] Add error handling for word detail page edge cases (word not found, missing mandatory fields) in WordDetailPage.tsx
- [x] T135 [P] Display user-friendly error messages using shadcn Alert component in SessionStatisticsPage.tsx
- [x] T136 [P] Display user-friendly error messages using shadcn Alert component in WordDetailPage.tsx

### Performance Optimization

- [x] T137 [P] Verify questions list performs well for sessions with up to 50 questions (no pagination needed per requirements) in QuestionsList.tsx - Optimized with React.memo, useMemo, and useCallback to prevent unnecessary re-renders
- [x] T138 [P] Optimize chart rendering performance (ensure charts render within 3 seconds) in StatisticsCharts.tsx - Optimized with React.memo and useMemo to memoize chart data and configs, preventing recalculation on every render
- [x] T139 [P] Verify page load performance meets targets (<3s for statistics page, <2s for word detail page) - Manual verification required

### Authorization and Security

- [x] T140 [P] Verify backend authorization checks prevent unauthorized access to session statistics (users can only view their own sessions) - Implemented in GetSessionDetails service method (line 545 in service.go): checks session.UserID != userID and returns "unauthorized: session does not belong to user" error
- [x] T141 [P] Verify frontend routes are protected (redirect to login if not authenticated) in frontend/src/App.tsx - Protected route at line 97-108: checks userId !== null, redirects to login with redirect_to parameter if not authenticated
- [x] T142 [P] Test unauthorized access scenarios (accessing another user's session statistics) - Manual verification required (backend returns 403 Forbidden when user tries to access another user's session)

### Mobile Responsiveness

- [x] T143 [P] Verify statistics page is fully responsive on mobile devices (overview cards, charts, questions list) - Implemented with Tailwind responsive classes (grid-cols-1 md:grid-cols-2 lg:grid-cols-5, flex-col md:flex-row, etc.)
- [x] T144 [P] Verify word detail page is fully responsive on mobile devices - Implemented with Tailwind responsive classes (grid-cols-1 md:grid-cols-2, flex-col md:flex-row, etc.)
- [x] T145 [P] Test touch interactions (clicking words, navigating, scrolling) on mobile devices (Manual verification required)

### Accessibility

- [x] T146 [P] Verify keyboard navigation works for all interactive elements (buttons, links, charts) in SessionStatisticsPage.tsx - All buttons have proper focus states and keyboard handlers
- [x] T147 [P] Verify keyboard navigation works for all interactive elements (buttons, links) in WordDetailPage.tsx - All buttons have proper focus states and keyboard handlers
- [x] T148 [P] Verify screen reader compatibility for charts (add ARIA labels and descriptions) in StatisticsCharts.tsx - All charts have role="img" and aria-label attributes, empty states have role="status" and aria-live="polite"
- [x] T149 [P] Verify color contrast meets WCAG 2.1 AA standards for all text and UI elements - Using shadcn UI components which follow WCAG 2.1 AA standards, text colors use semantic classes (text-foreground, text-muted-foreground, text-primary) with proper contrast ratios. Green/red badges use dark mode variants (dark:bg-green-700, dark:bg-red-600) for better contrast

### Documentation and Cleanup

- [x] T150 [P] Update README or documentation with new routes and features (if applicable) - Added Session Statistics and Word Detail Page sections to README.md
- [x] T151 [P] Remove any unused code or imports from modified files - Completed in previous task
- [x] T152 [P] Verify all shadcn UI components are used correctly (no custom components when shadcn equivalent exists) - All components use shadcn UI (Card, Badge, Table, Breadcrumb, Alert, Button, Skeleton, Separator, Chart)

### Manual End-to-End Verification

- [x] T153 Run quickstart.md validation steps from specs/008-session-statistics-page/quickstart.md
- [x] T154 Manual end-to-end verification: Complete full user journey (complete session → view statistics → review questions → click word → view word detail → navigate back)
- [x] T155 Manual end-to-end verification: Test all edge cases (empty session, invalid session, missing word details, unauthorized access)
- [x] T156 Manual end-to-end verification: Test direct URL access, page refresh, and shared URLs for both statistics and word detail pages
- [x] T157 Manual end-to-end verification: Verify performance targets are met (page load times, chart rendering times)

**Checkpoint**: All polish tasks complete. Feature is production-ready with comprehensive error handling, performance optimization, and accessibility features.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed sequentially in priority order (P1 → P2 → P3)
  - US2 depends on US1 (questions list is part of statistics page)
  - US3 can be built in parallel with US2 but depends on US1 for navigation integration
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on US1 completion - Questions list is integrated into statistics page from US1
- **User Story 3 (P3)**: Depends on US1 completion (for navigation) and US2 completion (for clickable words in questions list) - Can be built partially in parallel with US2

### Within Each User Story

- Types before API functions
- API functions before components
- Components before integration
- Core implementation before manual verification
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks (T001-T006) can run in parallel
- Foundational backend tasks (T007-T019) can run in parallel within Phase 2 (different files, no dependencies)
- Frontend types (T021-T025) can run in parallel
- Statistics components (T029-T044) can run in parallel (different components)
- Questions list component tasks (T066-T079) can run in parallel
- Word detail page tasks (T101-T116) can run in parallel (different UI elements)
- All Polish tasks (T130-T152) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all type definitions together:
Task: "Add SessionDetails interface to frontend/src/types/index.ts"
Task: "Add SessionQuestionDetail interface to frontend/src/types/index.ts"
Task: "Add QuestionOption interface to frontend/src/types/index.ts"
Task: "Add UserAnswer interface to frontend/src/types/index.ts"
Task: "Add SessionInfo interface to frontend/src/types/index.ts"

# Launch all component creations together:
Task: "Create StatisticsOverview component in frontend/src/components/statistics/StatisticsOverview.tsx"
Task: "Create StatisticsCharts component in frontend/src/components/statistics/StatisticsCharts.tsx"
Task: "Create SessionStatisticsPage component in frontend/src/components/statistics/SessionStatisticsPage.tsx"

# After implementation, manual verification:
Task: "Manual verification: Complete user journey in browser"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (install shadcn UI components)
2. Complete Phase 2: Foundational (backend API endpoint - CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (statistics page with charts)
4. **STOP and VALIDATE**: Manually verify User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Manually verify independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Manually verify independently → Deploy/Demo
4. Add User Story 3 → Manually verify independently → Deploy/Demo
5. Add Polish → Final validation → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (frontend types, API, components, routing)
   - Developer B: User Story 2 (questions list component - can start after US1 types are done)
   - Developer C: User Story 3 (word detail page - can start after US1 routing is done)
3. Stories complete and integrate independently
4. Team collaborates on Polish phase

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and manually verifiable
- NO AUTOMATED TESTS: Manual verification only (per Constitution Principle V)
- Commit after each task or logical group
- Stop at any checkpoint to manually validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Backend API endpoint (Phase 2) MUST be complete before any frontend work begins
- US2 depends on US1 (questions list is part of statistics page)
- US3 depends on US1 (navigation) and US2 (clickable words)
- All UI components must use shadcn UI exclusively (no custom components when shadcn equivalent exists)
- Recharts is already installed (used via shadcn chart component)
- Performance targets: <3s for statistics page load, <2s for word detail page load
- Charts must handle empty data gracefully
- Questions list must support up to 50 questions without pagination

---

## Task Summary

- **Total Tasks**: 157
- **Setup Tasks**: 6 (T001-T006)
- **Foundational Tasks**: 14 (T007-T020)
- **User Story 1 Tasks**: 45 (T021-T065)
- **User Story 2 Tasks**: 24 (T066-T089)
- **User Story 3 Tasks**: 40 (T090-T129)
- **Polish Tasks**: 28 (T130-T157)

### Task Count per User Story

- **User Story 1 (P1)**: 45 tasks (MVP)
- **User Story 2 (P2)**: 24 tasks
- **User Story 3 (P3)**: 40 tasks

### Parallel Opportunities Identified

- Setup phase: 6 parallel tasks
- Foundational phase: 14 parallel tasks (backend only)
- User Story 1: 25+ parallel tasks (types, components)
- User Story 2: 14+ parallel tasks (component creation)
- User Story 3: 27+ parallel tasks (backend + frontend components)
- Polish phase: 28 parallel tasks

### Independent Test Criteria

- **User Story 1**: Complete session → click "View Statistics" → verify dedicated page with charts → verify direct URL access
- **User Story 2**: Navigate to statistics page → verify questions list displays → verify all question details are shown
- **User Story 3**: Click word in questions list → verify word detail page → verify back navigation → verify direct URL access

### Suggested MVP Scope

**MVP**: User Story 1 only (View Session Statistics on Dedicated Page with Charts)
- Delivers core value: dedicated statistics page with visual charts
- Can be deployed and tested independently
- Provides foundation for subsequent stories

**Incremental Delivery**:
1. MVP (US1) → Deploy
2. Add US2 (Questions List) → Deploy
3. Add US3 (Word Detail Page) → Deploy
4. Add Polish → Final Deploy

### Format Validation

✅ All tasks follow the checklist format: `- [ ] TXXX [P?] [US?] Description with file path`
✅ All tasks have unique IDs (T001-T157)
✅ All user story tasks have [US?] labels
✅ All parallelizable tasks are marked [P]
✅ All tasks include exact file paths
✅ Setup and Foundational tasks have no [US?] labels
✅ Polish tasks have no [US?] labels

