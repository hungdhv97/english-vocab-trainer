# Implementation Plan: Fix Session Tag Missing Error in Vocab Quiz

**Branch**: `005-fix-session-tag` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-fix-session-tag/spec.md`

## Summary

Fix the "missing session_tag" error that occurs when users attempt to answer questions in the vocab quiz game. The root causes are:
1. Frontend not awaiting session creation before submitting answers
2. Backend cookie settings incompatible with development environment (HTTP)

**Technical Approach**:
- Frontend: Add session readiness state and await session creation before allowing answer submissions
- Backend: Make cookie settings environment-aware (SameSite=None with Secure=false for development, Secure=true for production)
- Error handling: Add user-friendly error messages for session creation failures

## Technical Context

**Language/Version**: Go 1.25+, TypeScript 5+, React 19+  
**Primary Dependencies**: Gin (HTTP framework), React (frontend), shadcn UI (components)  
**Storage**: PostgreSQL (session data), HTTP cookies (session_tag)  
**Testing**: Manual verification only (no automated tests per constitution)  
**Target Platform**: Web application (development: localhost HTTP, production: HTTPS)  
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: Session creation <100ms, answer submission <200ms  
**Constraints**: Must work in both development (HTTP) and production (HTTPS) environments  
**Scale/Scope**: Bug fix affecting single game feature (vocab quiz)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Clean Code**: Code maintains readable structure with clear naming (sessionReady, isDevelopmentMode). Single responsibility: session creation, cookie configuration, error handling are separated.
- [x] **Simple and Responsive UX**: Loading states and error messages provide clear feedback. No performance degradation (session creation is async, non-blocking).
- [x] **Latest shadcn UI Components**: Uses existing shadcn UI components (Card, Button, Input). No new components added.
- [x] **Minimal Dependencies**: No new dependencies added. Uses existing Go standard library (os, net/http) and React hooks.
- [x] **Clear Architecture Boundaries**: Respects existing layer separation:
  - Frontend: Component → API service → HTTP request
  - Backend: Handler → Service → Database
  - No layer skipping or circular dependencies
- [x] **No Testing Required**: Confirmed - no unit, integration, or e2e tests (manual verification only per constitution)
- [x] **Technology Stack Compliance**: Uses only approved technologies:
  - Backend: Go, Gin, PostgreSQL
  - Frontend: React, TypeScript, Tailwind, shadcn UI
  - No new technologies introduced
- [x] **Architecture Structure**: Follows prescribed structure:
  - Backend: `internal/modules/play/handler/http.go`
  - Frontend: `src/components/game/Game.tsx`

## Project Structure

### Documentation (this feature)

```text
specs/005-fix-session-tag/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── internal/
│   └── modules/
│       └── play/
│           ├── handler/
│           │   └── http.go          # Modified: Cookie settings, environment detection
│           ├── service/
│           │   └── service.go       # No changes
│           ├── model/
│           │   └── play.go          # No changes
│           └── dto/
│               └── play.go          # No changes

frontend/
├── src/
│   ├── components/
│   │   └── game/
│   │       ├── Game.tsx             # Modified: Session readiness state, error handling
│   │       └── AnswerInput.tsx      # Modified: Added disabled prop
│   └── lib/
│       └── api.ts                   # No changes (createSession already exists)
```

**Structure Decision**: This is a bug fix within the existing web application structure. Changes are limited to:
- Backend handler for cookie configuration
- Frontend game component for session management
- Frontend answer input component for disabled state

No new modules, services, or architectural changes required.

## Complexity Tracking

> **No violations - all principles satisfied**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

## Phase 0: Outline & Research

### Research Tasks

1. **Cookie SameSite behavior in development vs production**
   - Research: How do browsers handle SameSite=None cookies with/without Secure flag
   - Decision needed: Cookie configuration for localhost (HTTP) vs production (HTTPS)

2. **Session creation timing and race conditions**
   - Research: Best practices for ensuring session creation completes before dependent operations
   - Decision needed: Frontend state management approach for session readiness

### Research Findings

See `research.md` for detailed findings on:
- Cookie SameSite attribute behavior across browsers
- Development vs production cookie configuration strategies
- Frontend async session management patterns

## Phase 1: Design & Contracts

### Data Model

**No new data model changes required**. Existing entities remain unchanged:
- `GameSession`: Already exists with `session_tag` field
- `Play`: Already exists with `session_tag` foreign key

See `data-model.md` for entity relationship documentation.

### API Contracts

**No API contract changes required**. Existing endpoints:
- `POST /api/v1/session`: Creates session and sets cookie (behavior unchanged, cookie settings updated)
- `POST /api/v1/answer`: Requires session_tag cookie (no changes)

See `contracts/openapi.yaml` for API documentation updates.

### Quickstart

See `quickstart.md` for:
- Manual testing steps
- Development environment setup
- Verification procedures
