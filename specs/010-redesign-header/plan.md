# Implementation Plan: Header Redesign

**Branch**: `010-redesign-header` | **Date**: 2025-11-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-redesign-header/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Redesign the application header component to provide improved navigation and user experience. The header will display different elements based on authentication state: unauthenticated users see Logo, Games, Leaderboard, Login, and Sign Up (with Sign Up highlighted as primary button). Authenticated users see Logo, Games, Leaderboard, and an Avatar indicator that opens a dropdown menu with user options (Display Name, My Progress, Profile, Logout). The implementation will use existing shadcn UI components (dropdown-menu) and React Router for navigation. No backend changes are required as this is a frontend-only UI enhancement.

## Technical Context

**Language/Version**: TypeScript 5.8.3, React 19.1.0  
**Primary Dependencies**: React Router DOM 7.8.1, shadcn UI (dropdown-menu component), lucide-react 0.536.0 (icons), Tailwind CSS 4.1.11  
**Storage**: N/A (frontend-only feature, uses existing localStorage for auth state)  
**Testing**: No testing required (manual verification only per constitution)  
**Target Platform**: Web browsers (desktop and mobile responsive)  
**Project Type**: Web application (frontend component)  
**Performance Goals**: Header navigation responds in <100ms, menu opens/closes within 200ms, page navigation completes in <2s  
**Constraints**: Must be responsive (mobile, tablet, desktop), WCAG 2.1 AA accessible, dark mode compatible, no new dependencies unless absolutely necessary  
**Scale/Scope**: Single component redesign affecting header navigation across all pages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Clean Code**: Does this feature maintain readable, self-documenting code with clear naming and single responsibility?
  - Header component will be refactored with clear separation: Logo, Navigation, AuthButtons, UserMenu sub-components
- [x] **Simple and Responsive UX**: Does the UI prioritize performance (<2s load, <100ms interaction), mobile-responsiveness, and accessibility (WCAG 2.1 AA)?
  - Uses existing shadcn dropdown-menu (accessible by default), responsive Tailwind classes, performance targets met (<200ms menu open/close)
- [x] **Latest shadcn UI Components**: Are all frontend UI components sourced from shadcn UI using the latest version? Have we checked for existing shadcn components before building custom ones?
  - Will use existing `dropdown-menu` component from shadcn UI, no custom dropdown needed
- [x] **Minimal Dependencies**: Are all new dependencies justified by significant value? Have we verified the need and audit status?
  - No new dependencies required - uses existing React Router, shadcn UI, lucide-react icons
- [x] **Clear Architecture Boundaries**: Does the design respect layer separation (Models → Services → Handlers) with no circular dependencies?
  - Frontend-only feature, follows existing component structure, uses existing API utilities
- [x] **No Testing Required**: Confirmed - no unit, integration, or e2e tests will be created for this feature (manual verification only)
  - Manual verification only per constitution
- [x] **Technology Stack Compliance**: Does this feature use only approved technologies (Go, Gin, PostgreSQL, Redis, React, Vite, TypeScript, Tailwind, shadcn UI)?
  - Uses React, TypeScript, Tailwind CSS, shadcn UI - all approved technologies
- [x] **Architecture Structure**: Does the implementation follow the prescribed backend (`internal/modules/`) or frontend (`src/components/`) structure?
  - Will update existing `frontend/src/components/layout/Header.tsx` following frontend structure

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   └── Header.tsx          # Main header component (to be redesigned)
│   │   └── ui/
│   │       ├── dropdown-menu.tsx   # Existing shadcn UI component (will be used)
│   │       ├── button.tsx          # Existing shadcn UI component (for Sign Up button)
│   │       └── ...
│   ├── lib/
│   │   └── api.ts                  # Existing API utilities (auth state, profile)
│   ├── types/
│   │   └── index.ts                # TypeScript types (UserProfile, etc.)
│   └── App.tsx                     # Main app with routing
└── public/
    └── logo.png                    # Logo image asset (if available)
```

**Structure Decision**: Web application structure. This is a frontend-only feature that modifies the existing Header component at `frontend/src/components/layout/Header.tsx`. No backend changes required. The component will use existing shadcn UI components (dropdown-menu) and React Router for navigation.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - all constitution principles are satisfied.
