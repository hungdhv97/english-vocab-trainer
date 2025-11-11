# Implementation Plan: Leaderboard Page Redesign with Game Tabs

**Branch**: `007-leaderboard-game-tabs` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-leaderboard-game-tabs/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Redesign the leaderboard page to display game tabs at the top, allowing users to select a specific game and view only that game's leaderboard. The page will automatically select the first game by display order on load. Special game leaderboards (like vocab-quiz with CEFR level and translation direction selectors) will be preserved and displayed when their respective tabs are selected.

**Technical Approach**: Use shadcn UI Tabs component for game selection, refactor LeaderboardPage to manage selected game state, and conditionally render leaderboard content based on the selected tab. Maintain existing API calls and special leaderboard components.

## Technical Context

**Language/Version**: TypeScript 5.8+, React 19+  
**Primary Dependencies**: shadcn UI (tabs component), React Router 7+, existing API functions  
**Storage**: N/A (frontend-only feature, uses existing backend APIs)  
**Testing**: Manual verification only (no automated tests per constitution)  
**Target Platform**: Web browsers (desktop and mobile responsive)  
**Project Type**: Web application (frontend-only changes)  
**Performance Goals**: Leaderboard tab selection responds within 100ms, page loads within 2 seconds  
**Constraints**: Must maintain backward compatibility with existing leaderboard API endpoints, preserve special leaderboard functionality (vocab-quiz), mobile-responsive design  
**Scale/Scope**: Single page component refactor, supports all active games in the system

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Clean Code**: Does this feature maintain readable, self-documenting code with clear naming and single responsibility?
  - Yes. Component will be refactored to separate concerns: tab selection state, leaderboard fetching, and conditional rendering.
- [x] **Simple and Responsive UX**: Does the UI prioritize performance (<2s load, <100ms interaction), mobile-responsiveness, and accessibility (WCAG 2.1 AA)?
  - Yes. shadcn UI Tabs component provides accessible, keyboard-navigable tabs. Performance targets: <2s initial load, <100ms tab switching.
- [x] **Latest shadcn UI Components**: Are all frontend UI components sourced from shadcn UI using the latest version? Have we checked for existing shadcn components before building custom ones?
  - Yes. Will use shadcn UI Tabs component (confirmed available). No custom tab implementation needed.
- [x] **Minimal Dependencies**: Are all new dependencies justified by significant value? Have we verified the need and audit status?
  - Yes. Only adding shadcn UI tabs component (via `npx shadcn@latest add tabs`). This is a standard, well-maintained component library already in use.
- [x] **Clear Architecture Boundaries**: Does the design respect layer separation (Models → Services → Handlers) with no circular dependencies?
  - Yes. Frontend-only change. Component → API layer → Backend. No architecture boundary violations.
- [x] **No Testing Required**: Confirmed - no unit, integration, or e2e tests will be created for this feature (manual verification only)
  - Confirmed. Manual verification only per constitution.
- [x] **Technology Stack Compliance**: Does this feature use only approved technologies (Go, Gin, PostgreSQL, Redis, React, Vite, TypeScript, Tailwind, shadcn UI)?
  - Yes. Uses React, TypeScript, Tailwind CSS, and shadcn UI - all approved technologies.
- [x] **Architecture Structure**: Does the implementation follow the prescribed backend (`internal/modules/`) or frontend (`src/components/`) structure?
  - Yes. Changes will be in `frontend/src/components/leaderboard/LeaderboardPage.tsx` following existing frontend structure.

## Project Structure

### Documentation (this feature)

```text
specs/007-leaderboard-game-tabs/
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
│   │   ├── leaderboard/
│   │   │   └── LeaderboardPage.tsx    # Main component to be refactored
│   │   ├── game/
│   │   │   └── VocabQuizLeaderboard.tsx  # Special leaderboard (preserved)
│   │   ├── home/
│   │   │   └── Leaderboard.tsx         # Standard leaderboard component (preserved)
│   │   └── ui/
│   │       └── tabs.tsx                # NEW: shadcn UI tabs component
│   ├── lib/
│   │   └── api.ts                      # Existing API functions (no changes)
│   └── types/
│       └── index.ts                   # TypeScript types (no changes)
```

**Structure Decision**: Frontend-only refactor. No backend changes required. The existing API endpoints (`GET /api/v1/games`, `GET /api/v1/games/:id/leaderboard`, `GET /api/v1/vocab-quiz/leaderboard`) remain unchanged. The component structure follows the existing pattern with leaderboard-specific components in `components/leaderboard/` and game-specific components in `components/game/`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. All constitution checks pass.

## Phase 1 Completion

**Status**: ✅ Complete

**Generated Artifacts**:
- ✅ `research.md` - Research findings and decisions
- ✅ `data-model.md` - Frontend entity definitions and state management
- ✅ `contracts/openapi.yaml` - API contract documentation (existing endpoints)
- ✅ `quickstart.md` - Implementation guide and manual verification steps
- ✅ Agent context updated (`.cursor/rules/specify-rules.mdc`)

**Constitution Check (Post-Phase 1)**: ✅ All checks pass
- Clean Code: Maintained through component refactoring
- Simple and Responsive UX: shadcn UI Tabs provides accessibility and performance
- Latest shadcn UI Components: Using shadcn UI Tabs component
- Minimal Dependencies: Only adding shadcn UI tabs (already approved)
- Clear Architecture Boundaries: Frontend-only, no boundary violations
- No Testing Required: Manual verification only
- Technology Stack Compliance: All technologies approved
- Architecture Structure: Follows existing frontend structure

**Next Steps**: Ready for `/speckit.tasks` to generate implementation tasks
