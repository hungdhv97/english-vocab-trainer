# Tasks: User Profile Completion Flow

**Input**: Design documents from `/specs/009-profile-completion/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**NO TESTING POLICY**: This project does NOT require automated tests per Constitution Principle V. Do NOT create unit tests, integration tests, or e2e tests. Manual verification and production monitoring suffice.

**Organization**: Tasks are grouped by user story to enable independent implementation and manual verification of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/`, `frontend/` at repository root
- Backend: `backend/internal/modules/user/`
- Frontend: `frontend/src/components/profile/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and file upload infrastructure

- [x] T001 Create uploads directory structure at backend/uploads/avatars/
- [x] T002 [P] Add static file serving for uploads in backend/internal/platform/server/router.go
- [x] T003 [P] Verify user_profiles table exists in backend/migrations/schema/001_combined_schema.up.sql

**Checkpoint**: File upload infrastructure ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core profile infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Create UserProfile model in backend/internal/modules/user/model/profile.go
- [x] T005 [P] Create profile DTOs in backend/internal/modules/user/dto/profile.go
- [x] T006 [US1] [US2] [US3] Implement GetProfile service method in backend/internal/modules/user/service/service.go
- [x] T007 [US1] [US2] [US3] Implement UpdateProfile service method in backend/internal/modules/user/service/service.go
- [x] T008 [US1] [US2] [US3] Implement IsProfileComplete service method in backend/internal/modules/user/service/service.go
- [x] T009 [US1] [US2] [US3] Implement GetProfile handler in backend/internal/modules/user/handler/http.go
- [x] T010 [US1] [US2] [US3] Implement UpdateProfile handler in backend/internal/modules/user/handler/http.go
- [x] T011 [US1] [US2] [US3] Implement CheckProfileCompletion handler in backend/internal/modules/user/handler/http.go
- [x] T012 [US1] [US2] [US3] Register profile routes in backend/internal/modules/user/wiring.go
- [x] T013 [P] Add UserProfile and ProfileCompletionStatus types in frontend/src/types/index.ts
- [x] T014 [P] Add getProfile API function in frontend/src/lib/api.ts
- [x] T015 [P] Add updateProfile API function in frontend/src/lib/api.ts
- [x] T016 [P] Add checkProfileCompletion API function in frontend/src/lib/api.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - New User Registration with Profile Setup (Priority: P1) 🎯 MVP

**Goal**: New users are automatically redirected to profile page after registration where they can optionally complete their profile or skip to proceed.

**Manual Verification**: Register a new account, observe automatic redirect to profile page with onboarding context, complete profile or skip, verify redirect to home page and no repeated prompts during session.

### Implementation for User Story 1

- [x] T017 [US1] Extend Register service to check profile completion in backend/internal/modules/user/service/service.go
- [x] T018 [US1] Add profile_incomplete flag to Register response in backend/internal/modules/user/handler/http.go
- [x] T019 [US1] Create ProfilePage component in frontend/src/components/profile/ProfilePage.tsx
- [x] T020 [US1] Create ProfileForm component in frontend/src/components/profile/ProfileForm.tsx
- [x] T021 [US1] Create AvatarUpload component in frontend/src/components/profile/AvatarUpload.tsx
- [x] T022 [US1] Add profile route in frontend/src/App.tsx
- [x] T023 [US1] Update Register component to redirect to profile on profile_incomplete in frontend/src/components/auth/Register.tsx
- [x] T024 [US1] Implement file upload handling in UpdateProfile service method (from T007)
- [x] T025 [US1] Implement avatar file validation (size, type) in backend/internal/modules/user/service/service.go
- [x] T026 [US1] Implement avatar file storage in backend/internal/modules/user/service/service.go
- [x] T027 [US1] Add skip button logic in ProfilePage component for onboarding context
- [x] T028 [US1] Implement profile form validation (display name 50 chars, bio 500 chars) in frontend/src/components/profile/ProfileForm.tsx
- [x] T029 [US1] Add success feedback after profile save in frontend/src/components/profile/ProfilePage.tsx
- [x] T030 [US1] Manual verification: Register new user, complete profile, verify redirect and persistence

**Checkpoint**: At this point, User Story 1 should be fully functional and manually verified

---

## Phase 4: User Story 2 - Existing User Login with Incomplete Profile (Priority: P1)

**Goal**: Existing users with incomplete profiles see a non-intrusive banner above the header prompting them to complete their profile, with a skip button that dismisses it for the browser session.

**Manual Verification**: Login with incomplete profile account, observe banner above header on all pages, click skip and verify dismissal persists across page refreshes, close tab and reopen to verify banner reappears.

### Implementation for User Story 2

- [x] T031 [US2] Extend Login service to check profile completion in backend/internal/modules/user/service/service.go
- [x] T032 [US2] Add profile_incomplete flag to Login response in backend/internal/modules/user/handler/http.go
- [x] T033 [US2] Create ProfileBanner component in frontend/src/components/profile/ProfileBanner.tsx
- [x] T034 [US2] Implement banner visibility logic using sessionStorage in frontend/src/components/profile/ProfileBanner.tsx
- [x] T035 [US2] Add ProfileBanner to Layout component in frontend/src/components/layout/Layout.tsx
- [x] T036 [US2] Update Login component to redirect to profile on profile_incomplete in frontend/src/components/auth/Login.tsx
- [x] T037 [US2] Implement skip button with sessionStorage dismissal in frontend/src/components/profile/ProfileBanner.tsx
- [x] T038 [US2] Add Complete Profile link/button in ProfileBanner component
- [x] T039 [US2] Implement banner auto-dismiss when profile becomes complete in frontend/src/components/profile/ProfileBanner.tsx
- [x] T040 [US2] Manual verification: Login with incomplete profile, verify banner appears, skip and refresh, verify dismissal persists

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently and be manually verified

---

## Phase 5: User Story 3 - Profile Page Management (Priority: P2)

**Goal**: Users can access and manage their profile information at any time through a dedicated profile page, viewing and editing display name, avatar, and bio.

**Manual Verification**: Navigate to profile page, view current profile information, edit and save changes, verify persistence and success message, verify banner dismissed if profile now complete.

### Implementation for User Story 3

- [x] T041 [US3] Enhance ProfilePage to support regular management context (not just onboarding) in frontend/src/components/profile/ProfilePage.tsx
- [x] T042 [US3] Add profile loading state in ProfilePage component
- [x] T043 [US3] Add profile error handling in ProfilePage component
- [x] T044 [US3] Implement avatar preview before upload in frontend/src/components/profile/AvatarUpload.tsx
- [x] T045 [US3] Implement old avatar deletion when new one uploaded in backend/internal/modules/user/service/service.go
- [x] T046 [US3] Add profile update success toast notification in frontend/src/components/profile/ProfilePage.tsx
- [x] T047 [US3] Add profile route authentication check in frontend/src/App.tsx
- [x] T048 [US3] Manual verification: Access profile page, edit all fields, save, verify changes persist and banner dismissed if complete

**Checkpoint**: All user stories should now be independently functional and manually verified

---

## Phase 6: User Story 4 - User Indicator in Header (Priority: P2)

**Goal**: Header displays user indicator showing display name (if available) or username, along with avatar image (if uploaded) after login or registration.

**Manual Verification**: Login or register, observe header shows display name or username, upload avatar and verify it appears in header, verify fallback to username when display name not set.

### Implementation for User Story 4

- [x] T049 [US4] Fetch user profile in Header component on mount in frontend/src/components/layout/Header.tsx
- [x] T050 [US4] Display display name or username fallback in Header component
- [x] T051 [US4] Display avatar image if available in Header component
- [x] T052 [US4] Use shadcn UI Avatar component for user indicator in frontend/src/components/layout/Header.tsx
- [x] T053 [US4] Add loading state for profile fetch in Header component
- [x] T054 [US4] Update header after profile changes (refresh profile data) in frontend/src/components/layout/Header.tsx
- [x] T055 [US4] Manual verification: Login, verify header shows username, complete profile with display name and avatar, verify header updates

**Checkpoint**: User indicator should display correctly after login/registration and update when profile changes

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T056 [P] Add error handling for file upload failures in backend/internal/modules/user/handler/http.go
- [x] T057 [P] Add error handling for network errors in frontend profile components
- [x] T058 [P] Add loading states for all profile operations in frontend components
- [x] T059 [P] Implement avatar file cleanup on profile deletion in backend/internal/modules/user/service/service.go
- [x] T060 [P] Add input validation error messages in frontend/src/components/profile/ProfileForm.tsx
- [x] T061 [P] Add file size and type validation error messages in frontend/src/components/profile/AvatarUpload.tsx
- [x] T062 [P] Update OpenAPI documentation in backend/docs/openapi.yaml
- [x] T063 [P] Add profile completion status to auth responses (already done in T017, T031)
- [x] T064 [P] Run quickstart.md validation checklist
- [x] T065 Manual end-to-end verification: Register → Complete profile → Login → Banner → Update profile → User indicator

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3 → US4)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Uses profile completion check from US1 but independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Extends ProfilePage from US1 but independently testable
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Uses profile data but independently testable

### Within Each User Story

- Models/DTOs before services
- Services before handlers
- Backend before frontend (for API-dependent features)
- Core implementation before integration
- Manual verification before story completion
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks (T001-T003) can run in parallel
- Foundational model/DTO tasks (T004-T005, T013) can run in parallel
- Foundational API function tasks (T014-T016) can run in parallel
- Once Foundational phase completes, US1, US2, US3, US4 can start in parallel (if team capacity allows)
- Polish tasks (T056-T064) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch backend and frontend work in parallel:
# Backend:
Task: "Extend Register service to check profile completion"
Task: "Add profile_incomplete flag to Register response"

# Frontend (can start after T013-T016 complete):
Task: "Create ProfilePage component"
Task: "Create ProfileForm component"
Task: "Create AvatarUpload component"

# After implementation, manual verification:
Task: "Manual verification: Register new user, complete profile, verify redirect and persistence"
```

---

## Parallel Example: User Story 2

```bash
# Launch backend and frontend work in parallel:
# Backend:
Task: "Extend Login service to check profile completion"
Task: "Add profile_incomplete flag to Login response"

# Frontend:
Task: "Create ProfileBanner component"
Task: "Implement banner visibility logic using sessionStorage"
Task: "Add ProfileBanner to Layout component"

# After implementation, manual verification:
Task: "Manual verification: Login with incomplete profile, verify banner appears, skip and refresh"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T016) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T017-T030)
4. **STOP and VALIDATE**: Manually verify User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Manually verify independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Manually verify independently → Deploy/Demo
4. Add User Story 3 → Manually verify independently → Deploy/Demo
5. Add User Story 4 → Manually verify independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Registration flow)
   - Developer B: User Story 2 (Banner flow)
   - Developer C: User Story 3 (Profile management)
   - Developer D: User Story 4 (Header indicator)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and manually verifiable
- NO AUTOMATED TESTS: Manual verification only (per Constitution Principle V)
- Commit after each task or logical group
- Stop at any checkpoint to manually validate story independently
- File uploads stored in backend/uploads/avatars/ with naming: {user_id}_{timestamp}.{ext}
- Banner dismissal uses browser sessionStorage (persists across refreshes, clears on tab close)
- Profile completion calculated on-demand via SQL CASE expression
- Profile page adapts context via URL query parameter (?onboarding=true)

