# Implementation Plan: Update Frontend to Use shadcn Components

**Branch**: `003-shadcn-components` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-shadcn-components/spec.md`

**Additional User Context**: Use shadcn UI latest version for all components. Ensure all existing shadcn components are updated to latest versions and all non-shadcn UI elements are migrated to shadcn equivalents.

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature migrates the frontend application to use shadcn UI components exclusively, ensuring:
1. **Component Migration**: Replace all custom error messages, raw HTML buttons, and non-shadcn UI elements with shadcn components (Alert, Button, etc.)
2. **Latest Version**: Update all existing shadcn components to latest versions using `npx shadcn@latest add [component] --overwrite`
3. **Component Addition**: Add missing shadcn components (Alert component) if not already present
4. **Dependency Cleanup**: Remove direct Radix UI imports from application code (keeping only in shadcn UI wrapper components)
5. **Consistency**: Ensure navigation links follow shadcn design patterns

**Technical Approach**:
- Frontend-only modifications using existing React 19 + TypeScript + Vite stack
- Use `npx shadcn@latest add [component]` for all component additions and updates
- Migrate error messages to shadcn Alert component
- Replace raw HTML buttons with shadcn Button components
- Update existing shadcn components to latest versions
- No backend API changes required
- Maintain existing functionality and accessibility standards

## Technical Context

**Language/Version**: 
- Frontend: TypeScript 5.8.3, React 19.1.0
- Backend: Go 1.24 (no changes required)

**Primary Dependencies**: 
- Frontend: Vite 7.0.4 (build tool), React Router DOM 7.8.1 (routing), Tailwind CSS 4.1.11 (styling), shadcn UI latest version (component library)
- Backend: Gin (HTTP framework), PostgreSQL 15+ (database), Redis 7+ (cache) - no changes

**Storage**: N/A (frontend-only UI component migration, no data model changes)

**Testing**: Manual verification only (per Constitution Principle VI - No Testing Required)

**Target Platform**: Web application (responsive design for mobile, tablet, desktop browsers)

**Project Type**: Web application (frontend-only changes)

**Performance Goals**: 
- Component migration maintains existing performance (<2s page load, <100ms interactions)
- No performance degradation from component updates
- All pages maintain existing functionality after migration

**Constraints**: 
- Must maintain WCAG 2.1 AA accessibility standards (shadcn components provide this by default)
- Must support responsive design (mobile 320px+, tablet 768px+, desktop 1024px+)
- Must support dark mode (existing theme system, shadcn components support this)
- Must preserve all existing functionality (no regressions)
- Must use shadcn UI latest version for all components
- Must not break any existing user workflows

**Scale/Scope**: 
- Multiple component files to update (HomePage, LeaderboardPage, and other components with custom UI elements)
- Add shadcn Alert component if missing
- Update existing shadcn components to latest versions
- Replace custom error/warning message displays with shadcn Alert
- Replace raw HTML buttons with shadcn Button components
- Ensure navigation links follow shadcn design patterns
- Remove direct Radix UI imports from application code
- No database schema changes
- No backend API changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Clean Code**: Does this feature maintain readable, self-documenting code with clear naming and single responsibility?
  - ✅ **Status**: Compliant. Component migration maintains existing code structure. shadcn components follow clean code principles. Migration replaces custom code with well-designed shadcn components, improving code quality.

- [x] **Simple and Responsive UX**: Does the UI prioritize performance (<2s load, <100ms interaction), mobile-responsiveness, and accessibility (WCAG 2.1 AA)?
  - ✅ **Status**: Compliant. shadcn components are designed for performance and accessibility. WCAG 2.1 AA compliance is built into shadcn components. Migration maintains existing performance targets. Responsive design is preserved through shadcn's responsive utilities.

- [x] **Latest shadcn UI Components**: Are all frontend UI components sourced from shadcn UI using the latest version? Have we checked for existing shadcn components before building custom ones?
  - ✅ **Status**: Compliant. Feature explicitly requires using shadcn UI latest version. Plan includes updating existing shadcn components to latest versions using `npx shadcn@latest add [component] --overwrite`. All custom UI elements are being replaced with shadcn equivalents. This directly aligns with Constitution Principle III.

- [x] **Minimal Dependencies**: Are all new dependencies justified by significant value? Have we verified the need and audit status?
  - ✅ **Status**: Compliant. No new dependencies required. Feature uses existing shadcn UI (already in use). Updating to latest version maintains existing dependency footprint. Removing direct Radix UI imports from application code reduces coupling.

- [x] **Clear Architecture Boundaries**: Does the design respect layer separation (Models → Services → Handlers) with no circular dependencies?
  - ✅ **Status**: Compliant. Frontend-only changes maintain component → API service → backend handler separation. No backend changes means no architecture boundary violations. Component structure follows existing patterns (`src/components/` organization).

- [x] **No Testing Required**: Confirmed - no unit, integration, or e2e tests will be created for this feature (manual verification only)
  - ✅ **Status**: Compliant. Manual verification only per Constitution Principle VI. User stories include manual verification steps. Success criteria are manually verifiable (100% component coverage, accessibility checks, functionality preservation).

- [x] **Technology Stack Compliance**: Does this feature use only approved technologies (Go, Gin, PostgreSQL, Redis, React, Vite, TypeScript, Tailwind, shadcn UI)?
  - ✅ **Status**: Compliant. Frontend-only feature uses approved stack: React 19, TypeScript 5, Vite 7, Tailwind CSS 4, shadcn UI latest version. No backend changes. No new technologies introduced. Updating shadcn to latest version is explicitly required by Constitution Principle III.

- [x] **Architecture Structure**: Does the implementation follow the prescribed backend (`internal/modules/`) or frontend (`src/components/`) structure?
  - ✅ **Status**: Compliant. Feature modifies existing frontend components in `frontend/src/components/`. Adds shadcn Alert component to `frontend/src/components/ui/`. Follows existing component organization patterns. No backend structure changes.

## Project Structure

### Documentation (this feature)

```text
specs/003-shadcn-components/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command - N/A for UI-only changes)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command - N/A for UI-only changes)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── Login.tsx              # Uses shadcn Button, Card, Input (verify latest)
│   │   │   └── Register.tsx           # Uses shadcn Button, Card, Input (verify latest)
│   │   ├── game/
│   │   │   ├── Game.tsx               # Uses shadcn Button, Card (verify latest)
│   │   │   ├── LevelSelector.tsx      # Uses shadcn Button, Card, Tooltip (verify latest)
│   │   │   └── [other game components]
│   │   ├── home/
│   │   │   ├── HomePage.tsx           # NEEDS: Replace custom error divs with shadcn Alert
│   │   │   ├── GameCard.tsx           # Uses shadcn Card (verify latest)
│   │   │   └── [other home components]
│   │   ├── leaderboard/
│   │   │   └── LeaderboardPage.tsx    # NEEDS: Replace custom error/warning divs with shadcn Alert
│   │   ├── layout/
│   │   │   ├── Header.tsx             # Uses shadcn Button (verify latest, check navigation links)
│   │   │   └── [other layout components]
│   │   └── ui/                        # shadcn UI components directory
│   │       ├── alert.tsx              # NEEDS: Add shadcn Alert component (latest version)
│   │       ├── button.tsx             # NEEDS: Update to latest version
│   │       ├── card.tsx               # NEEDS: Update to latest version
│   │       ├── input.tsx              # NEEDS: Update to latest version
│   │       ├── skeleton.tsx           # NEEDS: Update to latest version
│   │       ├── tooltip.tsx            # NEEDS: Update to latest version
│   │       └── [other ui components]  # NEEDS: Update all to latest versions
│   ├── lib/
│   │   └── api.ts                     # No changes (verify no Radix imports)
│   └── [other frontend files]
└── components.json                    # shadcn configuration (verify latest format)

backend/
└── [no changes required]
```

**Structure Decision**: Web application structure (frontend + backend). This feature only modifies frontend components in `frontend/src/components/`. All shadcn UI components are stored in `frontend/src/components/ui/`. Application components import from `@/components/ui` using the path alias configured in `components.json`. No backend changes are required.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified. This feature is fully compliant with all Constitution principles.

## Phase Completion Status

### Phase 0: Outline & Research ✅ COMPLETE

**Completed**: 2025-01-27

**Artifacts Generated**:
- `research.md` - Component migration strategy, shadcn UI latest version requirements, Alert component usage, update commands

**Key Decisions**:
- Use shadcn Alert component for all error/warning messages
- Update all existing shadcn components to latest versions using `--overwrite` flag
- Migrate components incrementally (error messages → buttons → navigation)
- Remove direct Radix UI imports from application code
- Ensure navigation links follow shadcn design patterns

### Phase 1: Design & Contracts ✅ COMPLETE

**Completed**: 2025-01-27

**Artifacts Generated**:
- `data-model.md` - Documented as N/A (frontend-only UI migration, no data model changes)
- `contracts/README.md` - Documented as N/A (no API changes, frontend-only migration)
- `quickstart.md` - Step-by-step migration guide with verification steps
- Agent context updated - Cursor IDE context file updated with feature information

**Key Deliverables**:
- Migration steps for adding Alert component
- Update commands for all existing shadcn components
- Component migration patterns (error messages, buttons, navigation)
- Manual verification checklist
- Troubleshooting guide

### Phase 2: Implementation Planning

**Status**: Ready for `/speckit.tasks` command

**Next Steps**:
- Run `/speckit.tasks` to generate implementation tasks
- Begin implementation following the tasks and design artifacts
- Manual verification per Constitution Principle VI (No Testing Required)
