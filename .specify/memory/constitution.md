<!--
Sync Impact Report
Version: (template) → 1.0.0
Modified Principles:
- [PRINCIPLE_1_NAME] → 1. Code Quality & Consistency
- [PRINCIPLE_2_NAME] → 2. Type Safety
- [PRINCIPLE_3_NAME] → 3. Error Handling & Observability
- [PRINCIPLE_4_NAME] → 4. API Design & Separation of Concerns
- [PRINCIPLE_5_NAME] → 5. Security
Added Principles:
- 6. Performance & Scalability
- 7. Manual Testing Discipline
- 8. Documentation & Spec Discipline
- 9. UX & UI Consistency
Added Sections:
- Lifecycle Workflow
- Quality Gates & Reviews
Removed Sections:
- Placeholder instructions from template
Templates requiring updates:
- ✅ .specify/templates/plan-template.md
- ✅ .specify/templates/spec-template.md
- ✅ .specify/templates/tasks-template.md
Follow-up TODOs:
- TODO(COMMAND_TEMPLATES): `.specify/templates/commands/` directory missing; create command docs to keep references actionable.
-->

# English Vocab Trainer Constitution

## Core Principles

### 1. Code Quality & Consistency
- All code MUST pass the shared ESLint + Prettier configuration and compile cleanly before merge; no lint or build errors may remain in a commit.
- Variable, function, and class names MUST be descriptive—abbreviations or unclear names are rejected during review.
- Replace every magic value with a named constant that communicates intent; store shared constants in dedicated modules.
- Keep functions and modules small with shallow control flow; extract helpers instead of allowing deeply nested logic.
- Enforce clean architecture boundaries: domain logic, application/services, and infrastructure/access layers cannot mix responsibilities.

### 2. Type Safety
- Both frontend and backend MUST use strict TypeScript configurations; any `any` requires a code comment explaining why it is unavoidable and must be ticketed for removal.
- Data models and API contracts MUST have explicit types that are shared across FE/BE packages when feasible to avoid drift.
- Update type definitions before implementing model or API changes; do not ship code that diverges from declared types.
- CI fails fast on type errors; local workflows MUST run `tsc --noEmit` (or equivalent) pre-push.

### 3. Error Handling & Observability
- Every API error response MUST follow `{ code: string; message: string; details?: Record<string, unknown> }`.
- All thrown errors funnel through the centralized handler; uncaught exceptions in controllers or jobs are unacceptable.
- Logging MUST capture context (route, input summary, user/session, request ID when available) and include stack traces for errors.
- Critical flows—login, payments, and any core data mutations—require structured logs and, when monitoring is available, minimal metrics counters.

### 4. API Design & Separation of Concerns
- All endpoints originate from an approved OpenAPI/REST spec; specs are updated before implementation starts.
- Controllers/route handlers only orchestrate: validate input, call services, map responses. Business logic stays in services/use cases; persistence lives in infrastructure adapters.
- API naming, status codes, and error payloads remain consistent across the surface area; deviations must be justified in writing.

### 5. Security
- All sensitive communication occurs over HTTPS; never log or transmit secrets over insecure channels.
- Authentication standardizes on JWT tokens with refresh rotation; no ad-hoc auth schemes.
- Authorization follows RBAC driven by centralized policy configs; never hard-code permissions in scattered modules.
- Validate every body, query, and param with Zod (or equivalent schema) before entering business logic.
- Apply defenses for XSS, SQL injection, and CSRF where relevant, and enforce rate limiting on sensitive endpoints (auth, payments, high-value data).
- Secrets (API keys, DB passwords) stay in environment variables or secret managers—never in the repository.

### 6. Performance & Scalability
- Frontend code uses lazy loading/code splitting for non-critical bundles and avoids shipping unused dependencies.
- Enable browser/server caching for static assets with sensible cache-control headers or CDN rules.
- Backend services stay stateless whenever feasible to enable horizontal scaling.
- Large result sets use pagination, cursoring, or streaming APIs; never return unbounded datasets.
- Ensure primary database queries have supporting indexes and avoid N+1 patterns via joins or batching.

### 7. Manual Testing Discipline
- Automated tests are optional, but manual testing is mandatory before any release; cover each happy path plus representative error scenarios.
- Critical flows (login, registration, payments, CRUD for core data) require smoke-test evidence before deployment.
- Every discovered bug MUST include reproduction steps, expected vs. actual results, and is tracked on the shared board.
- Do not release while known blocking bugs exist on principle-critical flows.

### 8. Documentation & Spec Discipline
- Every feature starts with a written spec capturing requirements, behaviors, and use cases—never “code first.”
- Update specs, data models, and API docs immediately when behaviors change; documentation cannot lag behind implementation.
- README/onboarding docs remain accurate enough for a new contributor to understand architecture and run the project.
- Important decisions are logged with context, options considered, and rationale to avoid tribal knowledge.

### 9. UX & UI Consistency
- Follow the shared design system for color, typography, spacing, and approved components.
- Reuse existing components before building variants; if a new variant is justified, document why.
- Every important user action exposes clear loading, success, and error states, and UI controls meet baseline accessibility (contrast, focus, labels).
- Avoid abrupt UI shifts; keep flows predictable and consistent across the app.

## Lifecycle Workflow
- **Spec → Plan → Build**: Begin with `/speckit.spec` to capture user stories, edge cases, and acceptance tests, then `/speckit.plan` to define architecture choices and Constitution Check gates before writing code.
- **Implementation cadence**: Follow the plan’s project structure, implement domain/services/infrastructure layers separately, and keep PRs scoped to a single user story whenever possible.
- **Validation loop**: Each increment documents manual test runs (Principle 7), captures logs/metrics setup (Principle 3), and updates specs/docs (Principle 8) prior to release.
- **Release readiness**: A feature ships only after Constitution gates, manual smoke tests, lint/type checks, and documentation updates are complete with evidence recorded in the relevant spec/plan/tasks files.

## Quality Gates & Reviews
- Code reviews verify adherence to every principle: lint/type cleanliness, architectural boundaries, security validation, API specs, and manual test notes.
- “Constitution Check” sections in plans must list any applicable principles and note required artifacts (e.g., Zod schemas, manual test scripts, logging plan); reviewers block merges if unchecked.
- Before merging, authors attach manual test notes covering primary/error scenarios for the affected flows plus any new logs/metrics instrumentation.
- Releases include a quick audit of cached assets, RBAC changes, and doc updates to ensure nothing drifts from this constitution.

## Governance
- This constitution supersedes conflicting process docs; teams may add stricter rules but never weaker ones.
- Amendments require: (1) proposed diff, (2) rationale + impact analysis, (3) updated specs/templates, and (4) recorded approval from engineering + product leads.
- Versioning follows semantic rules—MAJOR for breaking/removing principles, MINOR for new principles or substantial additions, PATCH for clarifications.
- Compliance reviews happen at least once per quarter or before major releases; findings and remediation owners are documented.
- Runtime guidance (README, onboarding, ops docs) must reference this constitution so new contributors understand enforcement.

**Version**: 1.0.0 | **Ratified**: 2025-11-28 | **Last Amended**: 2025-11-28
