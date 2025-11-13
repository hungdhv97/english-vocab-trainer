# Implementation Plan: User Profile Completion Flow

**Branch**: `009-profile-completion` | **Date**: 2024-12-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-profile-completion/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature implements a user profile completion flow that guides new users through optional profile setup after registration and provides a non-intrusive banner for existing users with incomplete profiles. The implementation includes:

- **Backend**: Profile CRUD operations, file upload handling for avatars, profile completion status checking
- **Frontend**: Profile page component (adapts for onboarding vs. regular management), profile completion banner, user indicator in header, file upload UI
- **Integration**: Automatic redirect after registration, session storage for banner dismissal, profile completion status API

The technical approach uses existing Go/Gin backend patterns with PostgreSQL for storage, React/TypeScript frontend with shadcn UI components, and browser session storage for banner state management.

## Technical Context

**Language/Version**: Go 1.24+, TypeScript 5+, React 19+  
**Primary Dependencies**: Gin (HTTP routing), pgx (PostgreSQL driver), React Router, shadcn UI, react-hot-toast  
**Storage**: PostgreSQL 15+ (user_profiles table), file system (avatar images), browser sessionStorage (banner dismissal state)  
**Testing**: Manual verification only (per constitution)  
**Target Platform**: Web application (browser-based, responsive design)  
**Project Type**: Web application (backend + frontend)  
**Performance Goals**: Profile page loads <2s, banner appears <1s, file uploads <5s for 2MB images  
**Constraints**: Avatar files max 2MB, JPEG/PNG only, display name max 50 chars, bio max 500 chars  
**Scale/Scope**: All authenticated users, profile completion optional, banner shown to users with incomplete profiles

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Clean Code**: Feature maintains readable, self-documenting code with clear naming and single responsibility. Profile operations follow existing service/handler patterns.
- [x] **Simple and Responsive UX**: UI prioritizes performance (<2s load, <100ms interaction), mobile-responsiveness, and accessibility. Profile page uses shadcn UI components for consistent, accessible design.
- [x] **Latest shadcn UI Components**: All frontend UI components sourced from shadcn UI using latest version. Profile form, banner, and file upload will use shadcn components (Input, Button, Card, Alert, etc.).
- [x] **Minimal Dependencies**: No new dependencies required. Uses existing stack (Gin, pgx, React, shadcn UI). File upload handled via standard multipart/form-data.
- [x] **Clear Architecture Boundaries**: Design respects layer separation (Models → Services → Handlers) with no circular dependencies. Profile module follows existing user module structure.
- [x] **No Testing Required**: Confirmed - no unit, integration, or e2e tests will be created (manual verification only).
- [x] **Technology Stack Compliance**: Feature uses only approved technologies (Go, Gin, PostgreSQL, React, Vite, TypeScript, Tailwind, shadcn UI).
- [x] **Architecture Structure**: Implementation follows prescribed backend (`internal/modules/user/`) and frontend (`src/components/profile/`) structure.

## Project Structure

### Documentation (this feature)

```text
specs/009-profile-completion/
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
│   ├── modules/
│   │   └── user/
│   │       ├── model/
│   │       │   └── user.go          # Existing User model
│   │       │   └── profile.go       # NEW: UserProfile model
│   │       ├── service/
│   │       │   └── service.go        # Extend: Add profile operations
│   │       ├── handler/
│   │       │   └── http.go           # Extend: Add profile endpoints
│   │       ├── dto/
│   │       │   └── auth.go           # Existing auth DTOs
│   │       │   └── profile.go        # NEW: Profile DTOs
│   │       └── wiring.go             # Extend: Register profile routes
│   └── platform/
│       └── server/
│           └── router.go             # Existing router (no changes)
└── migrations/
    └── schema/
        └── 001_combined_schema.up.sql # Already contains user_profiles table

frontend/
├── src/
│   ├── components/
│   │   ├── profile/
│   │   │   ├── ProfilePage.tsx      # NEW: Main profile page (onboarding + regular)
│   │   │   ├── ProfileForm.tsx      # NEW: Profile form component
│   │   │   ├── AvatarUpload.tsx     # NEW: Avatar file upload component
│   │   │   └── ProfileBanner.tsx    # NEW: Profile completion banner
│   │   ├── layout/
│   │   │   └── Header.tsx            # Extend: Add user indicator
│   │   └── auth/
│   │       ├── Login.tsx             # Extend: Redirect to profile after login if incomplete
│   │       └── Register.tsx          # Extend: Redirect to profile after registration
│   ├── lib/
│   │   └── api.ts                    # Extend: Add profile API functions
│   └── types/
│       └── index.ts                   # Extend: Add profile types
```

**Structure Decision**: Web application structure with backend (Go/Gin) and frontend (React/TypeScript). Profile functionality extends existing user module in backend and adds new profile components in frontend. File uploads stored in backend file system with paths stored in database.

## Complexity Tracking

> **No violations identified - all requirements align with constitution principles**

## Phase Completion Status

### Phase 0: Research ✅ Complete

**Output**: `research.md`

All research questions resolved:
- File upload handling (Gin multipart/form-data)
- File storage location (file system)
- Profile completion status calculation (SQL CASE)
- Banner dismissal state (browser sessionStorage)
- User indicator display logic (conditional React rendering)
- Profile page context adaptation (URL query parameter)
- Redirect after registration/login (response flag)

### Phase 1: Design & Contracts ✅ Complete

**Outputs**:
- `data-model.md` - UserProfile entity, relationships, validation rules, query patterns
- `contracts/openapi.yaml` - API endpoints for profile operations
- `quickstart.md` - Implementation guide with code examples

**Key Design Decisions**:
- Profile model extends existing user module
- File uploads stored in `backend/uploads/avatars/`
- Profile completion calculated on-demand via SQL
- Banner state managed client-side with sessionStorage
- Single profile page component adapts for onboarding context

### Phase 2: Task Breakdown

**Status**: Ready for `/speckit.tasks` command

Next step: Generate detailed implementation tasks from this plan.
