# Implementation Plan: Homepage Redesign with Leaderboard Separation

**Branch**: `002-homepage-redesign` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-homepage-redesign/spec.md`

**Additional User Context**: The homepage combines home and games list screens into one. It includes a simple header with title and subtitle, a responsive grid of game cards (name, icon, short description, and Play button), and a small footer.

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature redesigns the homepage to create a cleaner, more focused user experience by:
1. **Homepage Enhancement**: Modifying the homepage with a structured header (title, subtitle, navigation), responsive game card grid, and footer. Game cards display name, icon, short description, and a Play button (removing leaderboard information).
2. **Leaderboard Separation**: Creating a dedicated leaderboard page accessible via navigation, moving leaderboard functionality from individual game cards to a centralized page.
3. **Navigation Structure**: Implementing consistent header/footer navigation across pages with authentication-aware navigation links.

**Technical Approach**: 
- Frontend modifications using existing React 19 + TypeScript + Vite stack
- Reuse existing shadcn UI components for header, footer, and navigation
- Create new LeaderboardPage component and route
- Modify HomePage component to remove leaderboard sections from game cards
- No backend API changes required (existing `/api/v1/games` and `/api/v1/games/:id/leaderboard` endpoints are sufficient)

## Technical Context

**Language/Version**: 
- Backend: Go 1.24
- Frontend: TypeScript 5.8.3, React 19.1.0

**Primary Dependencies**: 
- Backend: Gin (HTTP framework), PostgreSQL 15+ (database), Redis 7+ (cache)
- Frontend: Vite 7.0.4 (build tool), React Router DOM 7.8.1 (routing), Tailwind CSS 4.1.11 (styling), shadcn UI (component library)

**Storage**: PostgreSQL 15+ (primary data store for games and leaderboard data), Redis 7+ (session storage and caching)

**Testing**: Manual verification only (per Constitution Principle VI - No Testing Required)

**Target Platform**: Web application (responsive design for mobile, tablet, desktop browsers)

**Project Type**: Web application (backend + frontend separation)

**Performance Goals**: 
- Homepage loads with header, game listing, and footer within 2 seconds (SC-001)
- Navigation between pages responds within 1 second (SC-002)
- Leaderboard page loads and displays data within 2 seconds (SC-004)
- UI interactions respond within 100ms (Constitution Principle II)

**Constraints**: 
- Must maintain WCAG 2.1 AA accessibility standards
- Must support responsive design (mobile 320px+, tablet 768px+, desktop 1024px+)
- Must support dark mode (existing theme system)
- Must maintain existing authentication flow (redirect unauthenticated users to login)
- No new backend API endpoints required

**Scale/Scope**: 
- Single page modification (HomePage component)
- Single new page creation (LeaderboardPage component)
- Reusable component creation (Header, Footer components)
- Route configuration updates (new `/leaderboard` route)
- No database schema changes
- No backend API changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Clean Code**: Does this feature maintain readable, self-documenting code with clear naming and single responsibility?
  - ✅ **Status**: Compliant. Components follow single responsibility (Header, Footer, HomePage, LeaderboardPage are separate concerns). Clear naming conventions (GameCard, GameGrid, etc.). Existing codebase demonstrates clean code patterns.

- [x] **Simple and Responsive UX**: Does the UI prioritize performance (<2s load, <100ms interaction), mobile-responsiveness, and accessibility (WCAG 2.1 AA)?
  - ✅ **Status**: Compliant. Success criteria require <2s page loads (SC-001, SC-004) and <1s navigation (SC-002). Responsive design requirement (SC-007) covers mobile 320px+, tablet 768px+, desktop 1024px+. Existing shadcn UI components provide WCAG 2.1 AA accessibility by default.

- [x] **Latest shadcn UI Components**: Are all frontend UI components sourced from shadcn UI using the latest version? Have we checked for existing shadcn components before building custom ones?
  - ✅ **Status**: Compliant. Plan specifies using existing shadcn UI components. Existing components (Button, Card, etc.) are already shadcn-based. New Header/Footer components will use shadcn UI primitives. No custom components needed beyond composition of shadcn components.

- [x] **Minimal Dependencies**: Are all new dependencies justified by significant value? Have we verified the need and audit status?
  - ✅ **Status**: Compliant. No new dependencies required. Feature uses existing stack (React, React Router, Tailwind, shadcn UI). All dependencies already in use and approved.

- [x] **Clear Architecture Boundaries**: Does the design respect layer separation (Models → Services → Handlers) with no circular dependencies?
  - ✅ **Status**: Compliant. Frontend-only changes maintain component → API service → backend handler separation. No backend changes means no architecture boundary violations. Component structure follows existing patterns (`src/components/` organization).

- [x] **No Testing Required**: Confirmed - no unit, integration, or e2e tests will be created for this feature (manual verification only)
  - ✅ **Status**: Compliant. Manual verification only per Constitution Principle VI. User stories include manual verification steps. Success criteria are manually verifiable.

- [x] **Technology Stack Compliance**: Does this feature use only approved technologies (Go, Gin, PostgreSQL, Redis, React, Vite, TypeScript, Tailwind, shadcn UI)?
  - ✅ **Status**: Compliant. Frontend-only feature uses approved stack: React 19, TypeScript 5, Vite 7, Tailwind CSS 4, shadcn UI. No backend changes. No new technologies introduced.

- [x] **Architecture Structure**: Does the implementation follow the prescribed backend (`internal/modules/`) or frontend (`src/components/`) structure?
  - ✅ **Status**: Compliant. Feature modifies `frontend/src/components/home/HomePage.tsx` and creates `frontend/src/components/leaderboard/LeaderboardPage.tsx`. Follows existing component organization patterns. No backend structure changes.

## Project Structure

### Documentation (this feature)

```text
specs/002-homepage-redesign/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── openapi.yaml     # API contract documentation
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── internal/
│   ├── modules/
│   │   └── game/        # Game module (no changes required)
│   │       ├── handler/
│   │       │   └── http.go  # Existing /api/v1/games and /api/v1/games/:id/leaderboard endpoints
│   │       ├── model/
│   │       ├── service/
│   │       └── wiring.go
│   └── platform/        # Shared infrastructure (no changes)
└── migrations/          # Database migrations (no changes)

frontend/
├── src/
│   ├── components/
│   │   ├── home/
│   │   │   ├── HomePage.tsx      # MODIFY: Remove leaderboard from game cards, enhance header/footer
│   │   │   ├── GameCard.tsx      # MODIFY: Remove leaderboard section, add Play button
│   │   │   ├── GameGrid.tsx      # No changes (or minor adjustments)
│   │   │   └── Leaderboard.tsx   # Keep for use in LeaderboardPage
│   │   ├── leaderboard/          # NEW: Create leaderboard page directory
│   │   │   └── LeaderboardPage.tsx  # NEW: Dedicated leaderboard page component
│   │   ├── layout/               # NEW: Create layout components directory
│   │   │   ├── Header.tsx        # NEW: Reusable header component with navigation
│   │   │   └── Footer.tsx        # NEW: Reusable footer component
│   │   ├── ui/                   # Existing shadcn UI components (no changes)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   └── ...
│   ├── lib/
│   │   └── api.ts                # No changes (existing fetchGames, fetchLeaderboard functions)
│   ├── types/
│   │   └── index.ts              # No changes (existing Game, LeaderboardEntry types)
│   └── App.tsx                   # MODIFY: Add /leaderboard route
└── public/                       # Static assets (no changes)
```

**Structure Decision**: Web application structure (Option 2). This is a frontend-only feature that modifies existing React components and adds new components. No backend changes required. The structure follows existing patterns:
- Components organized by feature (`home/`, `leaderboard/`, `layout/`)
- Reusable UI components in `ui/` (shadcn UI)
- API functions in `lib/api.ts`
- Route configuration in `App.tsx`

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - All Constitution principles are satisfied. No complexity justification required.

## Phase Completion Status

### Phase 0: Outline & Research ✅ COMPLETE

- [x] Technical Context filled (no NEEDS CLARIFICATION items)
- [x] Constitution Check completed (all items pass)
- [x] Research document generated (`research.md`)
- [x] Design decisions documented
- [x] Component availability confirmed

### Phase 1: Design & Contracts ✅ COMPLETE

- [x] Data model documented (`data-model.md`)
- [x] API contracts generated (`contracts/openapi.yaml`)
- [x] Quick start guide created (`quickstart.md`)
- [x] Agent context updated (Cursor IDE)

### Phase 2: Implementation Planning

**Status**: Ready for `/speckit.tasks` command to generate implementation tasks

## Summary

This implementation plan is complete and ready for Phase 2 (task generation). All design artifacts have been created:

1. **Research** (`research.md`): Design decisions and component availability confirmed
2. **Data Model** (`data-model.md`): Entities and data flow documented
3. **API Contracts** (`contracts/openapi.yaml`): Existing endpoints documented
4. **Quick Start** (`quickstart.md`): Development setup and verification steps

**Next Steps**: 
- Run `/speckit.tasks` to generate implementation tasks
- Begin implementation following the tasks and design artifacts
- Manual verification per Constitution Principle VI (No Testing Required)
