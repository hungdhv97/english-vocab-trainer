# Implementation Plan: Session Statistics Page

**Branch**: `008-session-statistics-page` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-session-statistics-page/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Create a dedicated session statistics page that displays comprehensive game session data with visual charts, detailed questions/answers list, and navigation to word detail pages. The page will replace the current modal/popup statistics view with a full-page implementation using shadcn UI components. The feature includes three charts (accuracy breakdown, time analysis, performance over time), skeleton loading states, and clickable words that navigate to word detail pages.

**Technical Approach**: 
- **Frontend**: Create new route `/session/:sessionId/statistics` using React Router, build statistics page component with shadcn UI components (Card, Chart, Skeleton, Table/Badge, Button, Breadcrumb), use Recharts (via shadcn chart component) for visualizations, implement skeleton loading states
- **Backend**: Create new API endpoint `GET /api/v1/vocab-quiz/session/:sessionId/details` with optional query parameters to return full session data including statistics, questions with answers, word information, and performance metrics
- **Word Detail Page**: Create new route `/word/:wordId` with word detail component displaying mandatory fields (word text, translations, difficulty) and optional fields if available

## Technical Context

**Language/Version**: 
- Frontend: TypeScript 5.8+, React 19+
- Backend: Go 1.24+

**Primary Dependencies**: 
- Frontend: shadcn UI components (Card, Chart, Skeleton, Table, Badge, Button, Breadcrumb, Separator), Recharts (via shadcn chart), React Router 7+, existing API functions
- Backend: Gin, PostgreSQL 15+, existing vocab_quiz service layer

**Storage**: PostgreSQL (existing vocab_game_sessions, vocab_game_session_questions, vocab_game_session_answers tables)

**Testing**: Manual verification only (no automated tests per constitution)

**Target Platform**: Web browsers (desktop and mobile responsive)

**Project Type**: Web application (full-stack: frontend page + backend API endpoint)

**Performance Goals**: 
- Statistics page loads and displays all data in under 3 seconds for sessions with up to 20 questions
- Navigation to statistics page from completion screen in under 2 seconds
- Word detail pages load in under 2 seconds for 95% of requests
- Charts render correctly for 100% of session statistics pages

**Constraints**: 
- Must use shadcn UI components exclusively for frontend UI (no custom components when shadcn equivalent exists)
- Must maintain backward compatibility with existing session statistics endpoint
- Must ensure session statistics pages are only accessible to the user who created the session (authorization)
- Must handle edge cases gracefully (missing data, empty sessions, invalid sessions)
- Must support direct URL access, page refresh, and shared URLs
- Mobile-responsive design required

**Scale/Scope**: 
- Single new frontend page component (`SessionStatisticsPage.tsx`)
- Single new backend API endpoint with optional query parameters
- Word detail page component (basic implementation)
- Three chart visualizations (accuracy breakdown, time analysis, performance over time)
- Questions/answers list display (supports up to 50 questions without pagination)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Clean Code**: Does this feature maintain readable, self-documenting code with clear naming and single responsibility?
  - Yes. Component structure will separate concerns: statistics page component, chart components, questions list component, word detail component. Backend service layer will handle data retrieval and transformation.
- [x] **Simple and Responsive UX**: Does the UI prioritize performance (<2s load, <100ms interaction), mobile-responsiveness, and accessibility (WCAG 2.1 AA)?
  - Yes. shadcn UI components provide accessible, keyboard-navigable interfaces. Performance targets: <3s page load, <2s navigation. Skeleton loading states provide visual feedback. Mobile-responsive design using Tailwind CSS.
- [x] **Latest shadcn UI Components**: Are all frontend UI components sourced from shadcn UI using the latest version? Have we checked for existing shadcn components before building custom ones?
  - Yes. Will use shadcn UI components: Card (statistics display), Chart (recharts via shadcn), Skeleton (loading states), Table or Card-based list (questions/answers), Badge (correct/incorrect indicators), Button (navigation, actions), Breadcrumb (navigation), Separator (visual separation). All components will be added via `npx shadcn@latest add [component]`. No custom components when shadcn equivalents exist.
- [x] **Minimal Dependencies**: Are all new dependencies justified by significant value? Have we verified the need and audit status?
  - Yes. Recharts is already installed (used via shadcn chart component). No new dependencies required. shadcn UI components are standard, well-maintained, and already in use. Backend uses existing dependencies (Gin, PostgreSQL driver).
- [x] **Clear Architecture Boundaries**: Does the design respect layer separation (Models → Services → Handlers) with no circular dependencies?
  - Yes. Backend: Handler → Service → Model → DB. Frontend: Component → API layer → Backend. No architecture boundary violations. New endpoint follows existing patterns.
- [x] **No Testing Required**: Confirmed - no unit, integration, or e2e tests will be created for this feature (manual verification only)
  - Confirmed. Manual verification only per constitution.
- [x] **Technology Stack Compliance**: Does this feature use only approved technologies (Go, Gin, PostgreSQL, Redis, React, Vite, TypeScript, Tailwind, shadcn UI)?
  - Yes. Backend: Go, Gin, PostgreSQL. Frontend: React, TypeScript, Tailwind CSS, shadcn UI, Recharts (via shadcn). All approved technologies.
- [x] **Architecture Structure**: Does the implementation follow the prescribed backend (`internal/modules/`) or frontend (`src/components/`) structure?
  - Yes. Backend changes in `backend/internal/modules/vocab_quiz/` (handler, service, model). Frontend changes in `frontend/src/components/statistics/` and `frontend/src/components/word/`. Routing in `frontend/src/App.tsx`.

## Project Structure

### Documentation (this feature)

```text
specs/008-session-statistics-page/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── openapi.yaml     # API contract for new endpoint
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── internal/
│   ├── modules/
│   │   └── vocab_quiz/
│   │       ├── handler/
│   │       │   └── http.go                    # NEW: GetSessionDetails handler
│   │       ├── service/
│   │       │   └── service.go                 # NEW: GetSessionDetails method
│   │       ├── model/
│   │       │   └── question.go                # NEW: SessionDetailsResponse model
│   │       └── wiring.go                      # NEW: Register new endpoint route
│   └── platform/
│       └── (existing infrastructure)

frontend/
├── src/
│   ├── components/
│   │   ├── statistics/
│   │   │   ├── SessionStatisticsPage.tsx      # NEW: Main statistics page
│   │   │   ├── StatisticsOverview.tsx         # NEW: Overview statistics cards
│   │   │   ├── StatisticsCharts.tsx           # NEW: Chart visualizations
│   │   │   └── QuestionsList.tsx              # NEW: Questions/answers list
│   │   ├── word/
│   │   │   └── WordDetailPage.tsx             # NEW: Word detail page
│   │   ├── ui/
│   │   │   ├── card.tsx                       # EXISTING: shadcn UI
│   │   │   ├── chart.tsx                      # EXISTING: shadcn UI (Recharts)
│   │   │   ├── skeleton.tsx                   # EXISTING: shadcn UI
│   │   │   ├── table.tsx                      # NEW: shadcn UI (add via npx shadcn@latest add table)
│   │   │   ├── badge.tsx                      # NEW: shadcn UI (add via npx shadcn@latest add badge)
│   │   │   ├── breadcrumb.tsx                 # NEW: shadcn UI (add via npx shadcn@latest add breadcrumb)
│   │   │   ├── separator.tsx                  # EXISTING: shadcn UI
│   │   │   └── button.tsx                     # EXISTING: shadcn UI
│   │   └── game/
│   │       └── Game.tsx                       # MODIFY: Update "View Statistics" button to navigate to new page
│   ├── lib/
│   │   └── api.ts                             # MODIFY: Add getSessionDetails API function
│   ├── types/
│   │   └── index.ts                           # MODIFY: Add SessionDetails, SessionQuestionDetail types
│   └── App.tsx                                # MODIFY: Add new routes for statistics and word detail pages
```

**Structure Decision**: Full-stack implementation following existing patterns. Backend extends vocab_quiz module with new endpoint. Frontend creates new statistics and word feature directories. Uses shadcn UI components exclusively for UI elements. Recharts (via shadcn chart component) for visualizations. Existing database schema supports the feature (no migrations required).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. All constitution checks pass.

## Phase 1 Completion

**Status**: ✅ Complete

**Generated Artifacts**:
- ✅ `research.md` - Research findings and decisions (shadcn UI components, Recharts charts, skeleton loading)
- ✅ `data-model.md` - Frontend and backend entity definitions (SessionDetails, SessionQuestionDetail, WordDetail)
- ✅ `contracts/openapi.yaml` - API contract documentation (GET /vocab-quiz/session/:sessionId/details endpoint)
- ✅ `quickstart.md` - Implementation guide and manual verification steps
- ✅ Agent context updated (`.cursor/rules/specify-rules.mdc`)

**Constitution Check (Post-Phase 1)**: ✅ All checks pass
- Clean Code: Component structure separates concerns, service layer handles data retrieval
- Simple and Responsive UX: shadcn UI components provide accessible, responsive interfaces. Performance targets defined.
- Latest shadcn UI Components: All UI components use shadcn UI (Card, Chart, Skeleton, Table, Badge, Button, Breadcrumb, Separator)
- Minimal Dependencies: No new dependencies required. Recharts already installed, shadcn UI components standard.
- Clear Architecture Boundaries: Backend Handler → Service → Model → DB. Frontend Component → API → Backend.
- No Testing Required: Confirmed - manual verification only
- Technology Stack Compliance: Uses only approved technologies (Go, Gin, PostgreSQL, React, TypeScript, Tailwind, shadcn UI, Recharts)
- Architecture Structure: Follows prescribed backend (`internal/modules/vocab_quiz/`) and frontend (`src/components/statistics/`, `src/components/word/`) structure
