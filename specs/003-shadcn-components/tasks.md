# Tasks: Update Frontend to Use shadcn Components

**Input**: Design documents from `/specs/003-shadcn-components/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**NO TESTING POLICY**: This project does NOT require automated tests per Constitution Principle VI. Do NOT create unit tests, integration tests, or e2e tests. Manual verification and production monitoring suffice.

**Organization**: Tasks are grouped by user story to enable independent implementation and manual verification of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/src/components/`, `frontend/src/components/ui/`
- **shadcn UI components**: `frontend/src/components/ui/`
- **Application components**: `frontend/src/components/{auth,game,home,leaderboard,layout}/`

---

## Phase 1: Setup (Component Library Preparation)

**Purpose**: Add missing shadcn components and verify configuration

- [x] T001 Verify shadcn UI is properly configured by checking `frontend/components.json` exists and is valid
- [x] T002 Add shadcn Alert component using latest version: `cd frontend && npx shadcn@latest add alert`
- [x] T003 Verify Alert component was added at `frontend/src/components/ui/alert.tsx`

**Checkpoint**: Alert component is available for use in application components

---

## Phase 2: Foundational (Update All shadcn Components to Latest Version)

**Purpose**: Update all existing shadcn components to latest versions - BLOCKS all user story work

**⚠️ CRITICAL**: No user story work can begin until this phase is complete. All components must be updated to latest versions first.

- [x] T004 [P] Update shadcn Button component to latest version: `cd frontend && npx shadcn@latest add button --overwrite`
- [x] T005 [P] Update shadcn Card component to latest version: `cd frontend && npx shadcn@latest add card --overwrite`
- [x] T006 [P] Update shadcn Input component to latest version: `cd frontend && npx shadcn@latest add input --overwrite`
- [x] T007 [P] Update shadcn Skeleton component to latest version: `cd frontend && npx shadcn@latest add skeleton --overwrite`
- [x] T008 [P] Update shadcn Tooltip component to latest version: `cd frontend && npx shadcn@latest add tooltip --overwrite`
- [x] T009 [P] Update shadcn DropdownMenu component to latest version: `cd frontend && npx shadcn@latest add dropdown-menu --overwrite`
- [x] T010 [P] Update shadcn Separator component to latest version: `cd frontend && npx shadcn@latest add separator --overwrite`
- [x] T011 [P] Update shadcn Sheet component to latest version: `cd frontend && npx shadcn@latest add sheet --overwrite`
- [x] T012 [P] Update shadcn Sidebar component to latest version: `cd frontend && npx shadcn@latest add sidebar --overwrite`
- [x] T013 [P] Update shadcn Chart component to latest version: `cd frontend && npx shadcn@latest add chart --overwrite`
- [x] T014 Verify all updated components work by starting dev server: `cd frontend && npm run dev` and checking for errors
- [x] T015 Verify existing pages still render correctly after component updates (HomePage, LeaderboardPage, Login, Register, Game)

**Checkpoint**: Foundation ready - all shadcn components updated to latest versions, user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Consistent Error Messages (Priority: P1) 🎯 MVP

**Goal**: Replace all custom error message displays with shadcn Alert components, ensuring consistent and accessible error messaging throughout the application.

**Manual Verification**: Trigger error conditions (e.g., disable network, break API endpoints) on HomePage and LeaderboardPage. Verify all error messages display using shadcn Alert component with destructive variant. Verify error messages maintain accessibility attributes and consistent appearance. Verify "Try again" buttons use shadcn Button component.

### Implementation for User Story 1

- [x] T016 [US1] Import Alert components in `frontend/src/components/home/HomePage.tsx`: `import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';`
- [x] T017 [US1] Import Button component in `frontend/src/components/home/HomePage.tsx` if not already imported: `import { Button } from '@/components/ui/button';`
- [x] T018 [US1] Replace custom error div with Alert component in `frontend/src/components/home/HomePage.tsx` (error loading games) - use `variant="destructive"` with AlertTitle and AlertDescription
- [x] T019 [US1] Replace raw HTML button with shadcn Button component in HomePage error message (Try again button) - use appropriate variant
- [x] T020 [US1] Import Alert components in `frontend/src/components/leaderboard/LeaderboardPage.tsx`: `import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';`
- [x] T021 [US1] Import Button component in `frontend/src/components/leaderboard/LeaderboardPage.tsx` if not already imported: `import { Button } from '@/components/ui/button';`
- [x] T022 [US1] Replace custom error div with Alert component in `frontend/src/components/leaderboard/LeaderboardPage.tsx` (global error loading games) - use `variant="destructive"` with AlertTitle and AlertDescription
- [x] T023 [US1] Replace custom warning div with Alert component in `frontend/src/components/leaderboard/LeaderboardPage.tsx` (game-specific error loading leaderboard) - use default variant with AlertTitle and AlertDescription
- [x] T024 [US1] Replace raw HTML button with shadcn Button component in LeaderboardPage error message (Try again button) - use appropriate variant
- [x] T025 [US1] Search for other components with custom error messages: `cd frontend && grep -r "bg-red-" src/components --include="*.tsx" | grep -v "node_modules"`
- [x] T026 [US1] Replace any additional custom error/warning divs found with Alert components in other component files
- [x] T027 [US1] Manual verification: Start dev server, navigate to HomePage, trigger error (disable network), verify Alert component displays with destructive variant
- [x] T028 [US1] Manual verification: Navigate to LeaderboardPage, trigger error, verify Alert components display correctly for global and game-specific errors
- [x] T029 [US1] Manual verification: Verify all error messages maintain accessibility (keyboard navigation, screen reader support, ARIA attributes)
- [x] T030 [US1] Manual verification: Verify error messages display correctly in both light and dark themes
- [x] T031 [US1] Manual verification: Verify "Try again" buttons work correctly and use shadcn Button component

**Checkpoint**: At this point, User Story 1 should be fully functional and manually verified. All error messages use shadcn Alert components.

---

## Phase 4: User Story 2 - Consistent Button Components (Priority: P1)

**Goal**: Replace all raw HTML button elements with shadcn Button components, ensuring consistent and accessible button interactions throughout the application.

**Manual Verification**: Navigate through all pages (HomePage, LeaderboardPage, Login, Register, Game, Header). Verify all interactive buttons use shadcn Button component with appropriate variants, sizes, and accessibility attributes. Verify buttons in error states, empty states, and navigation elements all use shadcn Button. Verify keyboard navigation works (Tab, Enter, Space keys).

### Implementation for User Story 2

- [x] T032 [US2] Search for raw HTML button elements: `cd frontend && grep -r "<button" src/components --include="*.tsx" | grep -v "node_modules"`
- [x] T033 [US2] Replace raw HTML button in `frontend/src/components/home/HomePage.tsx` (empty state "Refresh Page" button) with shadcn Button component - use `variant="default"`
- [x] T034 [US2] Replace raw HTML button in `frontend/src/components/leaderboard/LeaderboardPage.tsx` (empty state "Refresh Page" button) with shadcn Button component - use `variant="default"`
- [x] T035 [US2] Verify Header.tsx already uses shadcn Button component for Logout button (if not, replace with Button component)
- [x] T036 [US2] Check all other components for raw HTML buttons and replace with shadcn Button component where found
- [x] T037 [US2] Verify all Button components use appropriate variants:
  - Error recovery buttons: `variant="outline"` or `variant="default"`
  - Empty state buttons: `variant="default"`
  - Navigation/logout buttons: `variant="outline"` or `variant="ghost"` (as appropriate)
- [x] T038 [US2] Verify all Button components maintain existing onClick handlers and functionality
- [x] T039 [US2] Verify all Button components have proper sizing (use `size` prop if needed: `sm`, `lg`, `icon`)
- [x] T040 [US2] Manual verification: Navigate to HomePage empty state, verify "Refresh Page" button uses shadcn Button
- [x] T041 [US2] Manual verification: Navigate to LeaderboardPage empty state, verify "Refresh Page" button uses shadcn Button
- [x] T042 [US2] Manual verification: Verify all buttons work correctly (onClick handlers fire, navigation works)
- [x] T043 [US2] Manual verification: Verify keyboard navigation works (Tab to focus, Enter/Space to activate)
- [x] T044 [US2] Manual verification: Verify buttons display correctly in both light and dark themes
- [x] T045 [US2] Manual verification: Verify button styling is consistent across all pages

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently and be manually verified. All buttons use shadcn Button components.

---

## Phase 5: User Story 3 - Navigation Components Consistency (Priority: P2)

**Goal**: Ensure navigation links follow shadcn design patterns, either using Button components as links or ensuring links use shadcn design tokens for consistent styling.

**Manual Verification**: Navigate through all pages and verify header navigation links either use shadcn Button components as links (with `asChild` prop) or use Tailwind classes that match shadcn design tokens. Verify active state styling is clear and consistent with shadcn design patterns. Verify keyboard navigation works for all navigation links.

### Implementation for User Story 3

- [x] T046 [US3] Review current Header navigation implementation in `frontend/src/components/layout/Header.tsx`
- [x] T047 [US3] Evaluate navigation link styling - check if links use shadcn design tokens (colors, spacing, typography)
- [x] T048 [US3] Option A: Convert navigation links to Button components with `asChild` prop and React Router Link:
  - Import Button: `import { Button } from '@/components/ui/button';`
  - Wrap Link with Button: `<Button variant="ghost" asChild><Link to="/">Home</Link></Button>`
- [x] T049 [US3] Option B: Keep Link components but ensure Tailwind classes use shadcn design tokens:
  - Use shadcn color variables (e.g., `text-primary`, `hover:bg-accent`)
  - Use shadcn spacing tokens
  - Match shadcn typography
- [x] T050 [US3] Implement chosen approach (Option A or B) in `frontend/src/components/layout/Header.tsx`
- [x] T051 [US3] Ensure active state styling is consistent with shadcn design patterns (use `isActive` function to apply active styles)
- [x] T052 [US3] Verify navigation links maintain proper accessibility (keyboard navigation, ARIA labels if needed)
- [x] T053 [US3] Manual verification: Navigate through all pages, verify navigation links have consistent styling
- [x] T054 [US3] Manual verification: Click on navigation links, verify active state is clearly visible
- [x] T055 [US3] Manual verification: Verify keyboard navigation works (Tab to focus, Enter to activate)
- [x] T056 [US3] Manual verification: Verify navigation links display correctly in both light and dark themes
- [x] T057 [US3] Manual verification: Verify navigation works correctly (client-side routing works)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently and be manually verified. Navigation links follow shadcn design patterns.

---

## Phase 6: User Story 4 - Remove Direct Radix UI Dependencies (Priority: P2)

**Goal**: Verify and ensure no direct Radix UI imports exist in application code (excluding shadcn UI component files in `components/ui/`).

**Manual Verification**: Search all application component files (excluding `components/ui/`) for `@radix-ui/` imports. Verify no direct Radix UI imports are found. Verify all UI functionality (dialog, dropdown, tooltip, etc.) uses shadcn component wrappers from `components/ui/` instead of direct Radix imports.

### Implementation for User Story 4

- [x] T058 [US4] Search for direct Radix UI imports in application code: `cd frontend && grep -r "@radix-ui" src/components --include="*.tsx" | grep -v "src/components/ui" | grep -v "node_modules"`
- [x] T059 [US4] Verify no Radix imports found in `frontend/src/components/auth/` directory
- [x] T060 [US4] Verify no Radix imports found in `frontend/src/components/game/` directory
- [x] T061 [US4] Verify no Radix imports found in `frontend/src/components/home/` directory
- [x] T062 [US4] Verify no Radix imports found in `frontend/src/components/leaderboard/` directory
- [x] T063 [US4] Verify no Radix imports found in `frontend/src/components/layout/` directory
- [x] T064 [US4] Verify no Radix imports found in `frontend/src/lib/` directory
- [x] T065 [US4] If any direct Radix imports are found, identify the functionality needed and replace with shadcn component wrapper:
  - Dialog → use shadcn Sheet or Dialog component
  - Dropdown → use shadcn DropdownMenu component
  - Tooltip → use shadcn Tooltip component
  - Other Radix primitives → find corresponding shadcn component
- [x] T066 [US4] Verify shadcn UI component files in `frontend/src/components/ui/` are allowed to import Radix (they are wrappers) - these should remain unchanged
- [x] T067 [US4] Manual verification: Run grep command again to confirm no Radix imports in application code
- [x] T068 [US4] Manual verification: Verify all UI functionality still works correctly (dialogs, dropdowns, tooltips, etc.)
- [x] T069 [US4] Manual verification: Verify application builds without errors: `cd frontend && npm run build`

**Checkpoint**: At this point, all user stories should be complete. No direct Radix UI imports exist in application code.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, cleanup, and documentation

- [x] T070 [P] Verify all pages maintain existing functionality after component migration (no regressions)
- [x] T071 [P] Verify all replaced components maintain WCAG 2.1 AA accessibility compliance (keyboard navigation, screen readers, ARIA attributes)
- [x] T072 [P] Verify all replaced components maintain consistent visual appearance and behavior across light and dark themes
- [x] T073 [P] Verify all interactive elements (buttons, links) maintain proper keyboard navigation (Tab, Enter, Space keys work as expected)
- [x] T074 [P] Run quickstart.md validation checklist to verify all migration steps were completed
- [x] T075 [P] Verify success criteria are met:
  - SC-001: 100% of error messages use shadcn Alert components ✓
  - SC-002: 100% of button elements use shadcn Button components ✓
  - SC-003: Zero direct Radix UI imports in application code ✓
  - SC-004: All pages maintain existing functionality ✓
  - SC-005: WCAG 2.1 AA accessibility compliance maintained ✓
  - SC-006: Consistent visual appearance in light and dark themes ✓
  - SC-007: No broken user flows or functionality ✓
  - SC-008: Proper keyboard navigation for all interactive elements ✓
- [x] T076 Manual end-to-end verification: Test complete user journey (login, browse games, play game, view leaderboard, logout)
- [x] T077 Verify application builds successfully: `cd frontend && npm run build`
- [x] T078 Verify no console errors in browser when running application
- [x] T079 Verify no TypeScript errors: `cd frontend && npm run lint`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P1): Can start after Foundational - No dependencies on other stories (can be done in parallel with US1)
  - User Story 3 (P2): Can start after Foundational - No dependencies on other stories (can be done in parallel with US1/US2)
  - User Story 4 (P2): Can start after Foundational - No dependencies on other stories (can be done in parallel with others)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories (independent from US1)
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories (independent from US1/US2)
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories (independent from others)

### Within Each User Story

- Import statements before component usage
- Component replacement before verification
- Individual component updates before full page verification
- Manual verification before story completion

### Parallel Opportunities

- **Phase 2 (Foundational)**: All component update tasks (T004-T013) marked [P] can run in parallel
- **After Foundational phase completes**: All user stories (US1, US2, US3, US4) can start in parallel (if team capacity allows)
- **Within User Story 1**: Import tasks and component replacement tasks can be done in parallel for different files
- **Within User Story 2**: Button replacement tasks can be done in parallel for different files
- **Phase 7 (Polish)**: All verification tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# After Phase 2 (Foundational) is complete, can work on HomePage and LeaderboardPage in parallel:
# Developer A: HomePage error message migration
Task T016: Import Alert components in HomePage.tsx
Task T017: Import Button component in HomePage.tsx
Task T018: Replace error div with Alert in HomePage.tsx
Task T019: Replace button with Button in HomePage.tsx

# Developer B: LeaderboardPage error message migration (can be done in parallel)
Task T020: Import Alert components in LeaderboardPage.tsx
Task T021: Import Button component in LeaderboardPage.tsx
Task T022: Replace error div with Alert in LeaderboardPage.tsx
Task T023: Replace warning div with Alert in LeaderboardPage.tsx
Task T024: Replace button with Button in LeaderboardPage.tsx

# After both complete, manual verification:
Task T027-T031: Manual verification steps
```

---

## Parallel Example: User Story 2

```bash
# After Phase 2 (Foundational) is complete, can search and replace buttons in parallel:
# Developer A: HomePage button migration
Task T033: Replace button in HomePage.tsx

# Developer B: LeaderboardPage button migration (can be done in parallel)
Task T034: Replace button in LeaderboardPage.tsx

# Developer C: Other components button migration (can be done in parallel)
Task T035: Verify Header.tsx buttons
Task T036: Check other components for buttons

# After all complete, verification:
Task T040-T045: Manual verification steps
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (Add Alert component)
2. Complete Phase 2: Foundational (Update all shadcn components to latest versions) - **CRITICAL - blocks all stories**
3. Complete Phase 3: User Story 1 (Error Messages migration)
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
   - Developer A: User Story 1 (Error Messages)
   - Developer B: User Story 2 (Buttons) - can start in parallel with US1
   - Developer C: User Story 3 (Navigation) - can start in parallel
   - Developer D: User Story 4 (Radix Imports) - can start in parallel
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and manually verifiable
- NO AUTOMATED TESTS: Manual verification only (per Constitution Principle VI)
- Commit after each task or logical group
- Stop at any checkpoint to manually validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All shadcn components must be updated to latest version before user story work begins
- Component migration should preserve existing functionality (event handlers, props, styling)
- Verify accessibility and dark mode support after each migration

---

## Summary

**Total Tasks**: 79 tasks
**Tasks per User Story**:
- User Story 1 (P1): 16 tasks (T016-T031)
- User Story 2 (P1): 14 tasks (T032-T045)
- User Story 3 (P2): 12 tasks (T046-T057)
- User Story 4 (P2): 12 tasks (T058-T069)
- Setup: 3 tasks (T001-T003)
- Foundational: 12 tasks (T004-T015)
- Polish: 10 tasks (T070-T079)

**Parallel Opportunities**: 
- Phase 2: 10 component update tasks can run in parallel
- User Stories 1-4: Can all be worked on in parallel after Foundational phase
- Phase 7: Multiple verification tasks can run in parallel

**Suggested MVP Scope**: Phase 1 (Setup) + Phase 2 (Foundational) + Phase 3 (User Story 1 - Error Messages)

**Independent Test Criteria**:
- User Story 1: Trigger errors, verify Alert components display correctly
- User Story 2: Navigate pages, verify all buttons use shadcn Button
- User Story 3: Navigate pages, verify navigation links follow shadcn patterns
- User Story 4: Search codebase, verify no Radix imports in application code

