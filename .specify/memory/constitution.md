<!--
================================================================================
SYNC IMPACT REPORT
================================================================================
Version Change: 1.0.0 → 1.1.0

Modified Principles:
  - Principle numbering updated: IV → V (Minimal Dependencies), V → VI (No Testing Required)

Added Sections:
  - III. Latest shadcn UI Components (NEW PRINCIPLE)

Removed Sections: N/A

Templates Requiring Updates:
  ✅ plan-template.md - Technology Stack Compliance updated to reference shadcn UI
  ✅ spec-template.md - No changes required
  ✅ tasks-template.md - No changes required
  ✅ agent-file-template.md - No changes required
  ✅ checklist-template.md - No changes required

Follow-up TODOs: N/A

Rationale for Version 1.1.0:
  Added new principle (III) mandating use of latest shadcn UI components for
  all frontend UI development. Updated Technology Stack section to emphasize
  shadcn UI over generic Radix UI reference. Renumbered subsequent principles
  accordingly. This is a MINOR version bump as it adds new guidance without
  removing or breaking existing principles.
================================================================================
-->

# English Vocabulary Trainer Constitution

## Core Principles

### I. Clean Code (NON-NEGOTIABLE)

Code MUST be readable, maintainable, and self-documenting. All implementations must follow these rules:

- **Clear naming**: Variables, functions, and types use descriptive names that reveal intent
- **Single responsibility**: Each function, struct, or component does one thing well
- **No magic numbers**: Constants are named and declared explicitly
- **Documentation**: Complex logic includes explanatory comments; public APIs have godoc/JSDoc
- **Error handling**: Errors are handled explicitly; no silent failures
- **DRY principle**: Duplication is eliminated through abstraction when appropriate

**Rationale**: Clean code reduces cognitive load, accelerates onboarding, and minimizes bugs. In a multi-language stack (Go + TypeScript), consistency in style is critical for maintainability.

### II. Simple and Responsive UX (NON-NEGOTIABLE)

User interfaces MUST prioritize simplicity, speed, and accessibility:

- **Performance first**: Pages load in <2s; interactions respond in <100ms
- **Mobile-responsive**: All UI components adapt seamlessly to mobile, tablet, and desktop
- **Accessibility**: WCAG 2.1 AA compliance (semantic HTML, keyboard navigation, ARIA labels)
- **Progressive enhancement**: Core functionality works without JavaScript where possible
- **Minimal cognitive load**: Clear visual hierarchy, consistent patterns, no unnecessary complexity
- **Dark mode support**: All interfaces support light and dark themes

**Rationale**: Users abandon slow or confusing applications. Responsive design ensures accessibility across devices. Our spaced-repetition learning system demands a friction-free experience to maintain engagement.

### III. Latest shadcn UI Components (NON-NEGOTIABLE)

Frontend UI components MUST use shadcn UI as the primary component library:

- **Use shadcn UI components**: All UI components MUST be sourced from shadcn UI (`npx shadcn@latest add [component]`)
- **Keep components updated**: When adding new components, always use the latest version (`shadcn@latest`)
- **Prefer shadcn over custom**: Do not build custom components when a shadcn equivalent exists
- **Stay current**: Regularly update existing shadcn components to latest versions for bug fixes and improvements
- **Component customization**: shadcn components can be customized via Tailwind classes and component props, but core structure should remain shadcn-based
- **No direct Radix imports**: Use shadcn components (which wrap Radix primitives) rather than importing Radix UI directly

**Rationale**: shadcn UI provides accessible, well-designed, and maintainable React components built on Radix UI primitives. Using the latest versions ensures we benefit from security updates, bug fixes, and new features. This reduces development time, ensures consistency, and maintains high accessibility standards without requiring custom component development.

### IV. Minimal Dependencies (NON-NEGOTIABLE)

Dependencies MUST be justified by significant value vs. maintenance cost:

- **Evaluate before adding**: Each dependency must solve a non-trivial problem
- **Prefer standard library**: Use Go standard library and browser APIs when sufficient
- **Audit regularly**: Review dependencies quarterly for security, maintenance status, and continued need
- **No trivial utilities**: Do not add dependencies for simple operations (e.g., lodash for one function)
- **Lock versions**: Use exact version pinning (go.mod, package-lock.json) to ensure reproducibility

**Rationale**: Every dependency is a liability—security vulnerabilities, breaking changes, abandonment risk. Minimal dependencies reduce attack surface, build times, and maintenance burden.

### V. Clear Architecture Boundaries (NON-NEGOTIABLE)

System architecture MUST enforce separation of concerns with explicit boundaries:

- **Layer separation**: Models → Services → Handlers (backend); Components → Services → API (frontend)
- **No layer skipping**: Handlers do not access models directly; components do not call DB
- **Interface-driven**: Services define interfaces; implementations are swappable
- **Module independence**: Each module (user, word, level, play) is self-contained with clear public API
- **Data flow clarity**: Request → Middleware → Handler → Service → DB; Response reverses the flow
- **No circular dependencies**: Module dependency graph is acyclic

**Rationale**: Clear boundaries enable parallel development, isolated testing, and easier refactoring. Our modular backend structure (user, word, level, play) exemplifies this principle.

### VI. No Testing Required

This project does NOT require automated tests. Development proceeds without:

- No unit tests
- No integration tests
- No end-to-end tests
- No test-driven development (TDD)
- No test coverage requirements
- No testing infrastructure or frameworks

**Rationale**: This principle supersedes all other testing guidance. Development velocity and simplicity take priority. Manual verification and production monitoring (Grafana, Prometheus) provide sufficient quality assurance.

## Technology Stack & Architecture

### Approved Technologies (MANDATORY)

This project uses the following technology stack exclusively:

**Backend**:
- **Language**: Go 1.24+ (official Go compiler only)
- **Framework**: Gin (HTTP routing and middleware)
- **Database**: PostgreSQL 15+ (primary data store)
- **Cache**: Redis 7+ (session storage, caching layer)
- **Migrations**: golang-migrate (schema and data migrations)

**Frontend**:
- **Build Tool**: Vite 5+ (development and production builds)
- **Framework**: React 19+ with TypeScript 5+
- **Styling**: Tailwind CSS 3+ (utility-first CSS)
- **UI Components**: shadcn UI (latest version, accessible components built on Radix UI primitives)
- **State Management**: React Context API or Zustand (if needed)

**Infrastructure**:
- **Containerization**: Docker 24+ and Docker Compose (all environments)
- **Monitoring**: Prometheus (metrics collection) + Grafana (visualization)
- **Logging**: Structured logging (Go: slog; Frontend: console with levels)
- **CI/CD**: GitHub Actions (automated builds, linting, deployment)

**Development Tools**:
- **Backend Linting**: gofmt, golangci-lint (enforce Go standards)
- **Frontend Linting**: ESLint (enforce TypeScript standards)
- **API Documentation**: OpenAPI 3.0 (backend/docs/openapi.yaml)

### Architecture Constraints

**Backend Structure**:
```
backend/
├── cmd/api/          # Application entry point
├── internal/
│   ├── modules/      # Domain modules (user, word, level, play)
│   │   └── [module]/
│   │       ├── model/     # Data models
│   │       ├── service/   # Business logic
│   │       ├── handler/   # HTTP handlers
│   │       ├── dto/       # Data transfer objects (optional)
│   │       └── wiring.go  # Dependency injection
│   └── platform/     # Shared infrastructure
│       ├── config/   # Configuration loading
│       ├── db/       # Database connections
│       ├── middleware/ # HTTP middleware
│       └── server/   # HTTP server setup
└── migrations/       # Database migrations
```

**Frontend Structure**:
```
frontend/
├── src/
│   ├── components/   # React components (organized by feature)
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utility functions (api.ts, utils.ts)
│   ├── types/        # TypeScript type definitions
│   └── main.tsx      # Application entry point
└── public/           # Static assets
```

**Database**:
- Use separate migration tables: `schema_migrations` (structure) and `data_migrations` (seeds)
- All schema changes via migrations (no manual ALTER TABLE in production)
- Foreign keys enforced at database level
- Indexes on frequently queried columns

**API Design**:
- RESTful endpoints: `/api/v1/{resource}`
- JSON request/response bodies
- HTTP status codes: 2xx (success), 4xx (client error), 5xx (server error)
- JWT authentication via Authorization header

## Development Workflow & Quality

### Code Quality Gates

Before merging any pull request:

1. **Linting passes**: `gofmt`, `golangci-lint` (backend); ESLint (frontend)
2. **Code review**: At least one approval from a team member
3. **Build succeeds**: Docker images build without errors
4. **No console errors**: Frontend runs without unhandled errors in browser console
5. **Manual verification**: Deployer manually tests affected functionality

### Git Workflow

- **Branch naming**: `feature/###-feature-name`, `fix/###-bug-name`
- **Commits**: Conventional Commits format (`feat:`, `fix:`, `docs:`, `refactor:`, etc.)
- **Pull requests**: Reference issue number; include screenshots for UI changes
- **Main branch protection**: Direct commits forbidden; PRs required

### Configuration Management

- **Environment separation**: Development (`config/dev/.env`) and Production (`config/prod/.env`)
- **Secrets**: Never commit secrets; use environment variables
- **Environment variables**: Prefixed with `APP_` (e.g., `APP_JWT_SECRET`, `APP_POSTGRES_HOST`)
- **Docker Compose**: Separate files (`docker-compose.dev.yml`, `docker-compose.prod.yml`)

### Monitoring & Observability

- **Metrics**: Prometheus scrapes backend `/metrics` endpoint (HTTP request counts, latencies, errors)
- **Dashboards**: Grafana dashboards for system health, database performance, user activity
- **Logging**: Structured logs with levels (DEBUG in dev, INFO in prod)
- **Alerting**: Prometheus Alertmanager for critical failures (database down, high error rate)

### Deployment

- **CI/CD**: GitHub Actions pipeline (on push to main):
  1. Lint backend and frontend code
  2. Build Docker images
  3. Push images to registry (if configured)
  4. Deploy to production (manual approval gate)

- **Manual deployment**: `docker compose -f docker-compose.prod.yml up -d`
- **Database migrations**: Run manually before deployment (`migrate up`)
- **Rollback**: Use `docker compose down` + redeploy previous image version

## Governance

### Constitution Authority

This constitution is the highest authority for all project decisions. In any conflict between this document and other guidance (README, code comments, external tutorials), the constitution prevails.

### Amendment Procedure

1. **Proposal**: Document proposed change with rationale in GitHub issue
2. **Discussion**: Team reviews impact, alternatives, migration cost
3. **Approval**: Unanimous agreement from core team required
4. **Version bump**:
   - **MAJOR** (X.0.0): Principle removal, incompatible governance change
   - **MINOR** (x.Y.0): New principle added, material guidance expansion
   - **PATCH** (x.y.Z): Clarifications, wording fixes, non-semantic changes
5. **Sync**: Update `.specify/templates/` and dependent docs
6. **Ratification date**: Update `LAST_AMENDED_DATE` in this file

### Compliance Review

- **Pull requests**: Reviewers MUST verify alignment with Core Principles
- **Quarterly audit**: Review codebase for principle violations (especially dependencies)
- **Architecture decisions**: Document deviations with explicit justification in ADR format

### Complexity Justification

Any deviation from these principles MUST be justified in writing:

- **What principle is violated**: Explicitly name the principle
- **Why deviation is necessary**: Concrete problem that cannot be solved within constraints
- **Simpler alternative rejected**: Why the obvious solution is insufficient
- **Mitigation**: How to minimize impact of the violation

Example: Adding a heavy dependency (violates Principle III) requires demonstrating that implementing the functionality in-house would cost >2 weeks of development time vs. 1 day of integration.

### Runtime Guidance

For day-to-day development decisions not covered by this constitution:

- Consult `.specify/templates/` for command workflows (plan, spec, tasks)
- Refer to `README.md` for quick start and deployment instructions
- Use `backend/docs/openapi.yaml` for API contract reference
- Follow language idioms: [Effective Go](https://go.dev/doc/effective_go) (backend), [React docs](https://react.dev) (frontend)

### Enforcement

Violations of NON-NEGOTIABLE principles will result in:

1. **PR rejection**: Pull requests violating principles are not merged
2. **Refactoring required**: Existing violations discovered during audits must be fixed
3. **Escalation**: Persistent violations escalate to project lead for resolution

---

**Version**: 1.1.0 | **Ratified**: 2025-11-06 | **Last Amended**: 2025-11-08
