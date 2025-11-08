# Tasks: Fix Session Tag Missing Error in Vocab Quiz

**Input**: Design documents from `/specs/005-fix-session-tag/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**NO TESTING POLICY**: This project does NOT require automated tests per Constitution Principle VI. Do NOT create unit tests, integration tests, or e2e tests. Manual verification and production monitoring suffice.

**Organization**: Tasks are organized by user story to enable independent implementation and manual verification.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/internal/modules/play/handler/http.go`
- **Frontend**: `frontend/src/components/game/Game.tsx`, `frontend/src/components/game/AnswerInput.tsx`

## Phase 1: Setup (Environment Verification)

**Purpose**: Verify development environment is ready for bug fix implementation

- [x] T001 Verify backend server is running on `http://localhost:8180`
- [x] T002 Verify frontend dev server is running on `http://localhost:5173`
- [x] T003 Verify database is running and migrations are applied
- [x] T004 Verify user authentication is working (can log in)
- [x] T005 Verify vocab quiz game is accessible at `/games/vocab-quiz`

**Checkpoint**: Development environment is ready for bug fix implementation

---

## Phase 2: Foundational (No Changes Required)

**Purpose**: This is a bug fix - no foundational infrastructure changes needed

**⚠️ NOTE**: Existing infrastructure (session creation endpoint, answer submission endpoint, cookie handling, CORS) is already in place. This phase has no tasks.

**Checkpoint**: Foundation verified - bug fix implementation can begin

---

## Phase 3: User Story 1 - Answer Questions in Vocab Quiz (Priority: P1) 🎯 MVP

**Goal**: Fix the "missing session_tag" error so users can successfully answer questions in the vocab quiz game without errors.

**Manual Verification**: 
1. Start the vocab quiz game
2. Select a level
3. Answer a question
4. Verify that the answer is accepted and feedback is shown without any "missing session_tag" error
5. Answer multiple questions in sequence - all should succeed
6. Verify session creation completes before first answer submission

### Implementation for User Story 1

#### Backend: Cookie Configuration Fix

- [x] T006 [US1] Add environment detection function `isDevelopmentMode()` in `backend/internal/modules/play/handler/http.go` to check `APP_ENV` environment variable
- [x] T007 [US1] Modify `Session` handler in `backend/internal/modules/play/handler/http.go` to set cookie attributes based on environment:
  - Development: `SameSite=Lax, Secure=false` (using Vite proxy for same-origin requests)
  - Production: `SameSite=None, Secure=true` (for HTTPS cross-site cookies)
- [x] T008 [US1] Add comments in `backend/internal/modules/play/handler/http.go` explaining cookie configuration rationale for development vs production

#### Frontend: Development Proxy Configuration

- [x] T034 [US1] Add Vite proxy configuration in `frontend/vite.config.ts` to proxy `/api` requests to `http://localhost:8180` for same-origin cookie support
- [x] T035 [US1] Update `API_BASE_URL` in `frontend/src/lib/api.ts` to use relative path `/api/v1` in development (proxied) and full URL in production

#### Backend: Session Creation Fix (game_id)

- [x] T033 [US1] Fix `CreateSession` function in `backend/internal/modules/play/service/service.go` to query `game_levels` table to get `game_id` from `level_id` and include it in the INSERT statement

#### Frontend: Session Readiness State Management

- [x] T009 [US1] Add `sessionReady` state variable in `frontend/src/components/game/Game.tsx` to track when session is created
- [x] T010 [US1] Add `sessionError` state variable in `frontend/src/components/game/Game.tsx` to track session creation errors
- [x] T011 [US1] Modify `useEffect` hook in `frontend/src/components/game/Game.tsx` to await `createSession` promise before setting `sessionReady = true`
- [x] T012 [US1] Add error handling in `frontend/src/components/game/Game.tsx` to catch session creation failures and set `sessionError` state
- [x] T013 [US1] Modify `handleSubmit` function in `frontend/src/components/game/Game.tsx` to check `sessionReady` before allowing answer submissions
- [x] T014 [US1] Add loading state UI in `frontend/src/components/game/Game.tsx` to display "Loading..." while session is being created
- [x] T015 [US1] Add error state UI in `frontend/src/components/game/Game.tsx` to display error message and "Go Back" button when session creation fails
- [x] T016 [US1] Modify `handleReset` function in `frontend/src/components/game/Game.tsx` to reset `sessionReady` and `sessionError` states

#### Frontend: Answer Input Disabled State

- [x] T017 [US1] Add `disabled` prop to `AnswerInputProps` interface in `frontend/src/components/game/AnswerInput.tsx`
- [x] T018 [US1] Add `disabled` parameter with default value `false` to `AnswerInput` component in `frontend/src/components/game/AnswerInput.tsx`
- [x] T019 [US1] Pass `disabled` prop to `Input` component in `frontend/src/components/game/AnswerInput.tsx`
- [x] T020 [US1] Update `Game.tsx` to pass `disabled={!sessionReady}` to `AnswerInput` component

#### Manual Verification

- [x] T021 [US1] Manual verification: Start vocab quiz game, select level, verify session is created and cookie is set before answers can be submitted
- [x] T022 [US1] Manual verification: Submit multiple answers in sequence, verify all succeed without "missing session_tag" errors
- [x] T023 [US1] Manual verification: Test error handling by stopping backend server, verify error message is displayed and user can retry
- [x] T024 [US1] Manual verification: Verify cookie attributes in browser dev tools (SameSite=None, Secure=false in development)
- [x] T025 [US1] Manual verification: Test session reset functionality - go back and select level again, verify new session is created

**Checkpoint**: At this point, User Story 1 should be fully functional and manually verified. Users can answer questions in vocab quiz without "missing session_tag" errors.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and documentation updates

- [x] T026 [P] Verify all acceptance scenarios from spec.md are working:
  - Scenario 1: User selects level and answers first question successfully
  - Scenario 2: User answers multiple questions in sequence without session errors
  - Scenario 3: System correctly associates answers with session and updates scores
- [x] T027 [P] Verify edge cases from spec.md are handled:
  - Session creation failure shows appropriate error message
  - Rapid successive answer submissions are processed in order
  - Network interruptions during session creation allow retry
- [x] T028 [P] Verify success criteria from spec.md:
  - SC-001: 100% of answer submissions succeed without "missing session_tag" errors
  - SC-002: Users can complete full quiz session without session-related interruptions
  - SC-003: Session creation completes before first answer submission in 100% of quiz sessions
  - SC-004: System works correctly in both development (localhost HTTP) and production (HTTPS) environments
- [x] T029 [P] Run quickstart.md validation: Execute all 6 test scenarios from quickstart.md
- [x] T030 [P] Manual end-to-end verification: Complete full quiz session from start to finish, verify all functionality works correctly
- [x] T031 [P] Verify code follows constitution principles:
  - Clean Code: Clear naming, single responsibility
  - Simple UX: Loading states, error messages
  - No new dependencies added
  - Architecture boundaries respected
- [x] T032 [P] Update documentation if needed (no changes expected - bug fix only)

**Checkpoint**: All polish tasks complete - bug fix is ready for deployment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: No tasks - infrastructure already exists
- **User Story 1 (Phase 3)**: Can start after Setup completion
- **Polish (Phase 4)**: Depends on User Story 1 completion

### User Story 1 Task Dependencies

**Backend Tasks** (can be done in parallel):
- T006 → T007 → T008 (sequential within backend)

**Frontend Tasks** (some dependencies):
- T009, T010 (can be parallel - state variables)
- T011, T012 (depends on T009, T010 - use state in useEffect)
- T013 (depends on T009 - use sessionReady in handleSubmit)
- T014, T015 (depends on T009, T010 - use state in UI)
- T016 (depends on T009, T010 - reset state)
- T017, T018, T019 (can be parallel - AnswerInput component)
- T020 (depends on T009, T017 - use sessionReady and disabled prop)

**Manual Verification**:
- T021-T025 (depends on all implementation tasks)

### Parallel Opportunities

**Within User Story 1**:
- T006 (backend environment detection) can run in parallel with T009-T010 (frontend state)
- T017-T019 (AnswerInput component) can run in parallel with T009-T016 (Game component)
- T014-T015 (UI updates) can run in parallel after state is added

**Phase 4 (Polish)**:
- All polish tasks (T026-T032) marked [P] can run in parallel after Phase 3 completes

---

## Parallel Example: User Story 1

```bash
# Launch backend and frontend tasks in parallel:

# Backend developer:
Task T006: "Add environment detection function in http.go"
Task T007: "Modify Session handler for cookie configuration"
Task T008: "Add comments explaining cookie configuration"

# Frontend developer (in parallel):
Task T009: "Add sessionReady state in Game.tsx"
Task T010: "Add sessionError state in Game.tsx"
Task T017: "Add disabled prop to AnswerInputProps"
Task T018: "Add disabled parameter to AnswerInput component"
Task T019: "Pass disabled prop to Input component"

# After state and props are added:
Task T011: "Modify useEffect to await createSession"
Task T012: "Add error handling for session creation"
Task T013: "Modify handleSubmit to check sessionReady"
Task T014: "Add loading state UI"
Task T015: "Add error state UI"
Task T016: "Modify handleReset to reset session states"
Task T020: "Pass disabled={!sessionReady} to AnswerInput"

# Finally, manual verification:
Task T021-T025: "Manual verification steps"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (verify environment)
2. Complete Phase 2: Foundational (no tasks - infrastructure exists)
3. Complete Phase 3: User Story 1 (bug fix implementation)
4. **STOP and VALIDATE**: Manually verify User Story 1 independently
5. Complete Phase 4: Polish (final verification)
6. Deploy bug fix

### Incremental Delivery

Since this is a single-user-story bug fix:
1. Complete Setup → Environment ready
2. Complete User Story 1 → Manually verify → Bug fix complete
3. Complete Polish → Final verification → Deploy

### Parallel Team Strategy

With multiple developers:

1. **Backend Developer**:
   - T006: Environment detection
   - T007: Cookie configuration
   - T008: Comments

2. **Frontend Developer** (in parallel):
   - T009-T010: State variables
   - T011-T016: Session management logic
   - T017-T020: AnswerInput disabled state

3. **QA/Testing** (after implementation):
   - T021-T025: Manual verification
   - T026-T032: Polish and final verification

---

## Task Summary

**Total Tasks**: 35
- Phase 1 (Setup): 5 tasks
- Phase 2 (Foundational): 0 tasks (no infrastructure changes needed)
- Phase 3 (User Story 1): 23 tasks (18 implementation + 5 manual verification)
- Phase 4 (Polish): 7 tasks

**Task Count per User Story**:
- User Story 1: 23 tasks (18 implementation + 5 manual verification)

**Parallel Opportunities Identified**:
- Backend cookie configuration (T006-T008) can run in parallel with frontend state management (T009-T010, T017-T019)
- UI updates (T014-T015) can run in parallel after state is added
- All polish tasks (T026-T032) can run in parallel

**Independent Test Criteria for User Story 1**:
1. Session creation completes before answer submissions
2. Cookie is set with correct attributes for development environment
3. Answers can be submitted without "missing session_tag" errors
4. Multiple answers work in sequence
5. Error handling works for session creation failures
6. Session can be reset and recreated

**Suggested MVP Scope**: User Story 1 (P1) - This is the complete bug fix. All tasks in Phase 3 must be completed to fix the issue.

**Format Validation**: ✅ All tasks follow the checklist format:
- ✅ Checkbox: `- [ ]`
- ✅ Task ID: `T001`, `T002`, etc.
- ✅ [P] marker: Included for parallelizable tasks
- ✅ [US1] label: Included for User Story 1 tasks
- ✅ File paths: Included in all task descriptions

---

## Notes

- [P] tasks = different files, no dependencies
- [US1] label maps task to User Story 1 for traceability
- User Story 1 is independently completable and manually verifiable
- NO AUTOMATED TESTS: Manual verification only (per Constitution Principle VI)
- Commit after each task or logical group
- Stop at checkpoint to manually validate story independently
- This is a bug fix - no new features, no database changes, no new dependencies

### Important: Restart Required

After implementing the Vite proxy configuration (T034, T035):
- **Restart the Vite dev server** for the proxy to take effect
- The proxy makes API requests same-origin, enabling reliable cookie handling
- Cookie settings changed to `SameSite=Lax` in development (works with proxy)

