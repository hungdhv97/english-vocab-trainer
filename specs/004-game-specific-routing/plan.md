# Implementation Plan: Game-Specific Routing with Coming Soon Page

**Branch**: `004-game-specific-routing` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-game-specific-routing/spec.md`

**Additional User Context**: Modify frontend to match the requirement and modify backend and database if needed. Remind that every game will be separated.

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature implements game-specific routing to ensure each game has its own dedicated route and page. The implementation:

1. **Game-Specific Routing**: Modifies frontend routing to extract game code from URL and route to appropriate page based on game implementation status.
2. **Vocabulary Quiz Game**: Maintains existing Vocabulary Quiz functionality with proper routing to `/game/vocab-quiz`.
3. **Coming Soon Pages**: Creates a reusable "Coming Soon" component that displays for unimplemented games, showing game name and development status.
4. **Backend Game Lookup**: Adds backend endpoint to fetch game information by code (for validation and Coming Soon page display).
5. **Future-Proof Architecture**: Designs routing system to be easily extensible when new games are implemented, supporting the requirement that "every game will be separated".

**Technical Approach**: 
- Frontend: Modify Game component to check game code from URL parameters, route to Vocabulary Quiz for `vocab-quiz`, show Coming Soon page for other games
- Frontend: Create ComingSoon component for unimplemented games
- Frontend: Update routing logic in App.tsx to handle game codes properly
- Backend: Add endpoint to get game by code (`GET /api/v1/games/code/:code`) for validation and game information
- Database: No schema changes required (games table already has `code` field with unique constraint)
- Architecture: Design routing logic to be easily extensible for future game implementations

## Technical Context

**Language/Version**: 
- Backend: Go 1.24
- Frontend: TypeScript 5.8.3, React 19.1.0

**Primary Dependencies**: 
- Backend: Gin (HTTP framework), PostgreSQL 15+ (database), Redis 7+ (cache)
- Frontend: Vite 7.0.4 (build tool), React Router DOM 7.8.1 (routing), Tailwind CSS 4.1.11 (styling), shadcn UI (component library)

**Storage**: PostgreSQL 15+ (primary data store for games table - no schema changes needed), Redis 7+ (session storage and caching)

**Testing**: Manual verification only (per Constitution Principle VI - No Testing Required)

**Target Platform**: Web application (responsive design for mobile, tablet, desktop browsers)

**Project Type**: Web application (backend + frontend separation)

**Performance Goals**: 
- Game pages load within 2 seconds of clicking game card (SC-001, SC-002)
- Coming Soon pages load within 2 seconds (SC-002)
- Navigation responses within 1 second (SC-005)
- Invalid game URLs handled within 2 seconds (SC-006)
- Bookmarked game URLs work correctly within 2 seconds (SC-007)
- UI interactions respond within 100ms (Constitution Principle II)

**Constraints**: 
- Must maintain WCAG 2.1 AA accessibility standards
- Must support responsive design (mobile 320px+, tablet 768px+, desktop 1024px+)
- Must support dark mode (existing theme system)
- Must maintain existing authentication flow (redirect unauthenticated users to login)
- Routing logic must be easily extensible for future game implementations
- Vocabulary Quiz game functionality must remain unchanged
- Each game will have its own separate implementation (architectural requirement)

**Scale/Scope**: 
- Frontend: Modify Game component, create ComingSoon component, update App.tsx routing
- Backend: Add one new endpoint (`GET /api/v1/games/code/:code`)
- Backend: Add service method to get game by code
- Database: No schema changes (games table already exists with code field)
- Route configuration: Update existing `/game/:code` route handling

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Clean Code**: Does this feature maintain readable, self-documenting code with clear naming and single responsibility?
  - ✅ **Status**: Compliant. Components follow single responsibility (Game component handles Vocabulary Quiz, ComingSoon component handles unimplemented games). Clear naming conventions (ComingSoon, game-specific routing). Routing logic will be clearly separated and documented.

- [x] **Simple and Responsive UX**: Does the UI prioritize performance (<2s load, <100ms interaction), mobile-responsiveness, and accessibility (WCAG 2.1 AA)?
  - ✅ **Status**: Compliant. Success criteria require <2s page loads (SC-001, SC-002) and <1s navigation (SC-005). Coming Soon page will use existing shadcn UI components that provide WCAG 2.1 AA accessibility by default. Responsive design will follow existing patterns.

- [x] **Latest shadcn UI Components**: Are all frontend UI components sourced from shadcn UI using the latest version? Have we checked for existing shadcn components before building custom ones?
  - ✅ **Status**: Compliant. Coming Soon page will use existing shadcn UI components (Card, Button, etc.). No custom components needed beyond composition of shadcn components. Existing Game component already uses shadcn UI components.

- [x] **Minimal Dependencies**: Are all new dependencies justified by significant value? Have we verified the need and audit status?
  - ✅ **Status**: Compliant. No new dependencies required. Feature uses existing stack (React, React Router, Tailwind, shadcn UI). Backend adds one new endpoint using existing Gin framework. All dependencies already in use and approved.

- [x] **Clear Architecture Boundaries**: Does the design respect layer separation (Models → Services → Handlers) with no circular dependencies?
  - ✅ **Status**: Compliant. Backend follows existing patterns: Handler → Service → Model → Database. Frontend maintains component → API service → backend handler separation. New endpoint follows existing game module structure. No circular dependencies introduced.

- [x] **No Testing Required**: Confirmed - no unit, integration, or e2e tests will be created for this feature (manual verification only)
  - ✅ **Status**: Compliant. Manual verification only per Constitution Principle VI. User stories include manual verification steps. Success criteria are manually verifiable.

- [x] **Technology Stack Compliance**: Does this feature use only approved technologies (Go, Gin, PostgreSQL, Redis, React, Vite, TypeScript, Tailwind, shadcn UI)?
  - ✅ **Status**: Compliant. Feature uses approved stack: Backend (Go 1.24, Gin, PostgreSQL, Redis), Frontend (React 19, TypeScript 5, Vite 7, Tailwind CSS 4, shadcn UI). No new technologies introduced.

- [x] **Architecture Structure**: Does the implementation follow the prescribed backend (`internal/modules/`) or frontend (`src/components/`) structure?
  - ✅ **Status**: Compliant. Backend changes in `backend/internal/modules/game/` (handler, service). Frontend changes in `frontend/src/components/game/` (Game component, ComingSoon component). Follows existing structure patterns.

## Project Structure

### Documentation (this feature)

```text
specs/004-game-specific-routing/
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
│   │   └── game/        # Game module
│   │       ├── handler/
│   │       │   └── http.go  # MODIFY: Add GetGameByCode handler
│   │       ├── model/
│   │       │   └── game.go  # No changes (Game model already has Code field)
│   │       ├── service/
│   │       │   └── service.go  # MODIFY: Add GetGameByCode service method
│   │       └── wiring.go  # MODIFY: Add route for GET /api/v1/games/code/:code
│   └── platform/        # Shared infrastructure (no changes)
└── migrations/          # Database migrations (no changes - games table already has code field)

frontend/
├── src/
│   ├── components/
│   │   ├── game/
│   │   │   ├── Game.tsx          # MODIFY: Check game code from URL, route to Vocabulary Quiz or Coming Soon
│   │   │   ├── ComingSoon.tsx    # NEW: Coming Soon page component for unimplemented games
│   │   │   ├── LevelSelector.tsx # No changes (used by Vocabulary Quiz)
│   │   │   ├── WordDisplay.tsx   # No changes (used by Vocabulary Quiz)
│   │   │   ├── AnswerInput.tsx   # No changes (used by Vocabulary Quiz)
│   │   │   └── Feedback.tsx      # No changes (used by Vocabulary Quiz)
│   │   ├── ui/                   # Existing shadcn UI components (no changes)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   └── ...
│   ├── lib/
│   │   └── api.ts                # MODIFY: Add fetchGameByCode function
│   ├── types/
│   │   └── index.ts              # No changes (Game type already exists)
│   └── App.tsx                   # MODIFY: Update /game/:code route to handle game code properly
└── public/                       # Static assets (no changes)
```

**Structure Decision**: Web application structure (Option 2). This feature modifies both backend and frontend:

- **Backend**: Adds one new endpoint in existing game module following Handler → Service → Model pattern
- **Frontend**: Modifies Game component and creates ComingSoon component, following existing component organization patterns
- **Database**: No changes required (games table already has `code` field with unique constraint)
- **Architecture**: Routing logic designed to be extensible for future game implementations, supporting the requirement that "every game will be separated"

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - all constitution checks pass.
