<!--
Sync Impact Report
- Version change: N/A → 1.0.0
- Modified principles: Established five concrete principles; added explicit "No Automated Testing" rule
- Added sections: Technology & Operational Constraints; Development Workflow & UX Standards
- Removed sections: None (template placeholders replaced with concrete content)
- Templates requiring updates:
  - .specify/templates/plan-template.md ✅ updated
  - .specify/templates/spec-template.md ✅ updated
  - .specify/templates/tasks-template.md ✅ updated
- Follow-up TODOs:
  - TODO(RATIFICATION_DATE): Original adoption date unknown; set once known
-->

# English Vocabulary Trainer Constitution

## Core Principles

### Clean Code
Code must be readable, maintainable, and consistent. Practices include:
- Use clear naming, small functions, and single-responsibility modules.
- Eliminate dead code and duplication; prefer straightforward solutions over cleverness.
- Enforce formatting and linting in CI/CD pipelines.
Rationale: Clean code reduces defects, accelerates onboarding, and lowers maintenance costs.

### Simple & Responsive UX
User experience must be simple, fast, and accessible.
- Prioritize clear flows, minimal steps, and fast perceived performance.
- Ensure responsive design across devices; target <200ms p95 for primary interactions.
- Follow accessibility best practices (semantic HTML, keyboard navigation, ARIA where needed).
Rationale: Simplicity and responsiveness increase engagement and learning outcomes.

### Minimal Dependencies
Favor the standard library and a small, stable set of libraries.
- Add a dependency only when it yields clear, sustained value and low risk.
- Pin versions and remove unused packages promptly.
- Avoid transitive bloat; prefer direct implementations when reasonable.
Rationale: Fewer dependencies reduce attack surface, build issues, and update burden.

### Clear Architecture Boundaries
Keep boundaries explicit between frontend, backend, data, and infrastructure.
- Backend exposes stable HTTP APIs; frontend consumes them via typed clients.
- Separate domain logic from transport, persistence, and UI concerns.
- Define clear ownership and layering to prevent cross-boundary leakage.
Rationale: Clear boundaries improve evolvability, testing-in-production strategies, and clarity.

### No Automated Testing (Non-Negotiable)
Automated tests of any kind are not permitted.
- Unit, integration, end-to-end, and contract tests are forbidden.
- Test directories or pipelines MUST NOT be created or executed.
- Quality is ensured via code review, live verification, feature flags, and monitoring.
Rationale: By mandate, this project prioritizes velocity and operational monitoring over tests.

## Technology & Operational Constraints

- Backend: Go (Golang).
- Frontend: ViteJS (React + TypeScript as currently used).
- Database: PostgreSQL.
- Caching/queues: Redis.
- Containerization: Docker (Compose for local; compatible with production orchestration).
- Monitoring/Observability: Prometheus (metrics) and Grafana (dashboards).
- CI/CD: GitHub Actions for builds, linting/formatting, container builds, and deployments.
- Security: Manage secrets via environment variables or vault-backed runners; no secrets in code.
- Logging: Structured logs with request correlation; ship to standard streams for collection.

## Development Workflow & UX Standards

- Code review required for all changes; reviewers check principle adherence.
- No test-related files, jobs, or badges are allowed in any branch or workflow.
- Feature flags recommended for risky changes; verify behavior live in controlled environments.
- UX changes must prefer simplicity: fewer controls, clear copy, fast feedback.
- CI/CD gates: build, format, lint, type-check, containerize, scan images; no test stages.

## Governance

- Supremacy: This constitution supersedes all other project guidance. The "No Automated Testing"
  rule overrides any conflicting templates, scripts, or prior practices.
- Amendments: Changes require a PR titled "Constitution: Amendment" including rationale, migration
  plan (if any), and updated version below. Approval by maintainers is required.
- Versioning Policy: Semantic versioning
  - MAJOR: Backward-incompatible governance or principle removals/redefinitions.
  - MINOR: New principle/section or materially expanded guidance.
  - PATCH: Clarifications and non-semantic refinements.
- Compliance Reviews: On each PR, reviewers validate conformance to principles and constraints.
  CI/CD must block on violations (e.g., presence of test folders, jobs, or frameworks).

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): Original adoption date unknown | **Last Amended**: 2025-11-06
