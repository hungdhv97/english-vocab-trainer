# Tasks: Header Redesign

**Input**: Design documents from `/specs/010-redesign-header/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**NO TESTING POLICY**: This project does NOT require automated tests per Constitution Principle V. Do NOT create unit tests, integration tests, or e2e tests. Manual verification and production monitoring suffice.

**Organization**: Tasks are grouped by user story to enable independent implementation and manual verification of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/src/` for frontend components
- All paths shown below use frontend structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Review existing infrastructure and prepare for header redesign

- [x] T001 Review existing Header component structure in `frontend/src/components/layout/Header.tsx`
- [x] T002 Verify shadcn UI dropdown-menu component exists in `frontend/src/components/ui/dropdown-menu.tsx`
- [x] T003 Verify lucide-react icons are available for menu items (BarChart3, User, LogOut)
- [x] T004 Verify logo.png exists in `frontend/public/logo.png` or prepare text fallback

**Checkpoint**: Infrastructure review complete - ready to begin header redesign

---

## Phase 2: User Story 1 - Navigate Header Before Login (Priority: P1) 🎯 MVP

**Goal**: Unauthenticated users can navigate the application using header navigation elements (Logo, Games, Leaderboard, Login, Sign Up with Sign Up highlighted as primary button).

**Manual Verification**: Visit application while logged out, observe all header elements are visible and correctly positioned (Logo left, Games/Leaderboard middle, Login/Sign Up right), click each navigation element to confirm correct routing, verify Sign Up is visually highlighted compared to other links.

### Implementation for User Story 1

- [x] T005 [US1] Restructure Header component layout in `frontend/src/components/layout/Header.tsx` to have three sections: Logo (left), Navigation (middle), Auth (right)
- [x] T006 [US1] Implement Logo component section in `frontend/src/components/layout/Header.tsx` that displays logo image from `/logo.png` or "English Coach" text fallback, routes to `/` when clicked
- [x] T007 [US1] Implement Navigation section in `frontend/src/components/layout/Header.tsx` with Games link (routes to `/`) and Leaderboard link (routes to `/leaderboard`) in middle section
- [x] T008 [US1] Implement Auth section in `frontend/src/components/layout/Header.tsx` that displays Login and Sign Up links on right side when user is not authenticated
- [x] T009 [US1] Style Sign Up link as primary button (variant="default") in `frontend/src/components/layout/Header.tsx` using Button component from `@/components/ui/button`
- [x] T010 [US1] Add responsive design classes in `frontend/src/components/layout/Header.tsx` using Tailwind CSS (flex-col sm:flex-row for mobile stacking, gap-2 sm:gap-4 for spacing)
- [x] T011 [US1] Ensure Logo routes to Home (`/`) when clicked in `frontend/src/components/layout/Header.tsx`
- [x] T012 [US1] Ensure Games link routes to Home (`/`) when clicked in `frontend/src/components/layout/Header.tsx`
- [x] T013 [US1] Ensure Leaderboard link routes to `/leaderboard` when clicked in `frontend/src/components/layout/Header.tsx`
- [x] T014 [US1] Ensure Login link routes to `/login` when clicked in `frontend/src/components/layout/Header.tsx`
- [x] T015 [US1] Ensure Sign Up link routes to `/register` when clicked in `frontend/src/components/layout/Header.tsx`
- [x] T016 [US1] Manual verification: Test header navigation while logged out - verify all elements visible, positioned correctly, routing works, Sign Up is highlighted

**Checkpoint**: At this point, User Story 1 should be fully functional and manually verified. Unauthenticated users can navigate using the redesigned header.

---

## Phase 3: User Story 2 - Navigate Header After Login (Priority: P1)

**Goal**: Authenticated users can navigate using header elements (Logo, Games, Leaderboard) and see Avatar indicator that opens user menu when clicked.

**Manual Verification**: Log into application, observe header elements are visible and correctly positioned (Logo, Games, Leaderboard, Avatar indicator), click each navigation element to confirm correct routing, click Avatar indicator to verify user menu appears with Display Name, My Progress, Profile, Logout options.

### Implementation for User Story 2

- [x] T017 [US2] Update Header component in `frontend/src/components/layout/Header.tsx` to conditionally show Avatar indicator instead of Login/Sign Up when user is authenticated
- [x] T018 [US2] Implement Avatar indicator component in `frontend/src/components/layout/Header.tsx` that displays user avatar image from `profile.avatar_url` or user initials fallback
- [x] T019 [US2] Create getInitials helper function in `frontend/src/components/layout/Header.tsx` that returns first letter of display_name or username (uppercase)
- [x] T020 [US2] Implement user menu dropdown structure in `frontend/src/components/layout/Header.tsx` using DropdownMenu components from `@/components/ui/dropdown-menu`
- [x] T021 [US2] Add DropdownMenuTrigger wrapping Avatar indicator in `frontend/src/components/layout/Header.tsx` to open menu on click
- [x] T022 [US2] Add DropdownMenuContent in `frontend/src/components/layout/Header.tsx` positioned below Avatar (align="end") with Display Name, My Progress, Profile, Logout items
- [x] T023 [US2] Display user Display Name as non-clickable text at top of user menu in `frontend/src/components/layout/Header.tsx` with fallback to username or "User"
- [x] T024 [US2] Ensure Logo routes to Home (`/`) when clicked (authenticated state) in `frontend/src/components/layout/Header.tsx`
- [x] T025 [US2] Ensure Games link routes to Home (`/`) when clicked (authenticated state) in `frontend/src/components/layout/Header.tsx`
- [x] T026 [US2] Ensure Leaderboard link routes to `/leaderboard` when clicked (authenticated state) in `frontend/src/components/layout/Header.tsx`
- [x] T027 [US2] Manual verification: Test header navigation while logged in - verify all elements visible, Avatar indicator works, user menu appears with Display Name

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently and be manually verified. Both authenticated and unauthenticated navigation flows are functional.

---

## Phase 4: User Story 3 - Access User Menu Features (Priority: P2)

**Goal**: Authenticated users can access account features through user menu (My Progress, Profile, Logout) with icons, and menu stays open after clicking items until user clicks outside.

**Manual Verification**: Log in, open user menu, verify Display Name is shown, click My Progress to navigate to progress page, click Profile to navigate to profile page, click Logout to successfully log out, verify menu stays open after clicking menu items until clicking outside.

### Implementation for User Story 3

- [x] T028 [US3] Add My Progress menu item in `frontend/src/components/layout/Header.tsx` with BarChart3 icon from lucide-react, routes to `/my-progress`
- [x] T029 [US3] Add Profile menu item in `frontend/src/components/layout/Header.tsx` with User icon from lucide-react, routes to `/profile`
- [x] T030 [US3] Add Logout menu item in `frontend/src/components/layout/Header.tsx` with LogOut icon from lucide-react, calls handleLogout function
- [x] T031 [US3] Import BarChart3, User, LogOut icons from lucide-react in `frontend/src/components/layout/Header.tsx`
- [x] T032 [US3] Style menu items with icons using className="mr-2 h-4 w-4" in `frontend/src/components/layout/Header.tsx`
- [x] T033 [US3] Add DropdownMenuSeparator components in `frontend/src/components/layout/Header.tsx` between Display Name and menu items, and before Logout
- [x] T034 [US3] Configure DropdownMenu in `frontend/src/components/layout/Header.tsx` to stay open after menu item clicks (menu closes only when clicking outside or clicking Avatar again)
- [x] T035 [US3] Ensure My Progress menu item routes to `/my-progress` when clicked in `frontend/src/components/layout/Header.tsx`
- [x] T036 [US3] Ensure Profile menu item routes to `/profile` when clicked in `frontend/src/components/layout/Header.tsx`
- [x] T037 [US3] Ensure Logout menu item calls handleLogout function and routes to Home (`/`) in `frontend/src/components/layout/Header.tsx`
- [x] T038 [US3] Update handleLogout function in `frontend/src/components/layout/Header.tsx` to dispatch auth-state-changed event and navigate to Home
- [ ] T039 [US3] Manual verification: Test user menu features - verify icons display, routing works, logout works, menu stays open after clicks

**Checkpoint**: All user stories should now be independently functional and manually verified. Complete header redesign is functional for both authenticated and unauthenticated users.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and edge cases

- [x] T040 [P] Handle edge case: Display Name null/empty fallback in `frontend/src/components/layout/Header.tsx` (use username or "User")
- [x] T041 [P] Handle edge case: Avatar image fails to load in `frontend/src/components/layout/Header.tsx` (display user initials)
- [x] T042 [P] Ensure user menu closes when clicking outside menu area in `frontend/src/components/layout/Header.tsx` (default DropdownMenu behavior)
- [x] T043 [P] Ensure user menu closes when clicking Avatar indicator while menu is open in `frontend/src/components/layout/Header.tsx` (default DropdownMenu behavior)
- [x] T044 [P] Verify header updates immediately on authentication state changes in `frontend/src/components/layout/Header.tsx` (existing auth-state-changed event listener)
- [x] T045 [P] Add responsive design improvements for mobile devices in `frontend/src/components/layout/Header.tsx` (ensure navigation elements remain accessible)
- [x] T046 [P] Verify dark mode compatibility in `frontend/src/components/layout/Header.tsx` (shadcn UI components support dark mode by default)
- [x] T047 [P] Verify accessibility: keyboard navigation works for all header elements in `frontend/src/components/layout/Header.tsx`
- [x] T048 [P] Verify accessibility: screen reader announces menu items correctly in `frontend/src/components/layout/Header.tsx` (shadcn UI components are accessible by default)
- [x] T049 [P] Verify performance: menu opens/closes within 200ms in `frontend/src/components/layout/Header.tsx` (shadcn UI animations)
- [x] T050 [P] Verify performance: navigation routing completes in under 2 seconds in `frontend/src/components/layout/Header.tsx`
- [ ] T051 Manual end-to-end verification: Test complete user journey (login → navigate → use menu → logout) in browser
- [ ] T052 Run quickstart.md validation checklist from `specs/010-redesign-header/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **User Story 1 (Phase 2)**: Can start after Setup completion - No dependencies on other stories
- **User Story 2 (Phase 3)**: Can start after Setup completion - Depends on User Story 1 for layout structure
- **User Story 3 (Phase 4)**: Can start after User Story 2 completion - Depends on User Story 2 for user menu structure
- **Polish (Phase 5)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Setup - No dependencies on other stories. This is the MVP.
- **User Story 2 (P1)**: Can start after Setup - Depends on User Story 1 for basic header layout structure, but can be implemented incrementally
- **User Story 3 (P2)**: Can start after User Story 2 - Depends on User Story 2 for user menu dropdown structure

### Within Each User Story

- Layout structure before individual elements
- Core navigation before styling
- Basic functionality before edge cases
- Manual verification before story completion
- Story complete before moving to next priority

### Parallel Opportunities

- Setup tasks (T001-T004) can be reviewed in parallel
- Edge case handling in Polish phase (T040-T050) can be worked on in parallel
- Different aspects of responsive design and accessibility can be verified in parallel

---

## Parallel Example: User Story 1

```bash
# After reviewing infrastructure, implement header sections:
Task: "Restructure Header component layout" (T005)
Task: "Implement Logo component section" (T006)
Task: "Implement Navigation section" (T007)
Task: "Implement Auth section" (T008)

# These can be done incrementally in the same file, but each section is independent
# After implementation, manual verification:
Task: "Manual verification: Test header navigation while logged out" (T016)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (review existing infrastructure)
2. Complete Phase 2: User Story 1 (unauthenticated header navigation)
3. **STOP and VALIDATE**: Manually verify User Story 1 independently
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup → Infrastructure ready
2. Add User Story 1 → Manually verify independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Manually verify independently → Deploy/Demo
4. Add User Story 3 → Manually verify independently → Deploy/Demo
5. Add Polish phase → Final verification → Deploy/Demo
6. Each story adds value without breaking previous stories

### Single Developer Strategy

With a single developer:

1. Complete Setup phase (quick review)
2. Implement User Story 1 (MVP) → Verify → Deploy
3. Implement User Story 2 → Verify → Deploy
4. Implement User Story 3 → Verify → Deploy
5. Complete Polish phase → Final verification → Deploy

---

## Notes

- [P] tasks = different aspects, can be worked on independently
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and manually verifiable
- NO AUTOMATED TESTS: Manual verification only (per Constitution Principle V)
- Commit after each task or logical group
- Stop at any checkpoint to manually validate story independently
- All tasks modify the same file (`frontend/src/components/layout/Header.tsx`) but are organized by user story for clarity
- The `/my-progress` route is marked as TODO in spec and needs separate implementation (not part of this feature)

