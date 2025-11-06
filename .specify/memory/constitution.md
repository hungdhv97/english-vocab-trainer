# English Vocab Trainer Constitution

<!--
Sync Impact Report
- Version change: none → 1.0.0
- Modified principles: N/A (newly defined)
- Added sections: Core Principles; Technology Stack & Operational Constraints; Development Workflow & Review; Governance
- Removed sections: Template placeholders
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md (Constitution Check + testing language)
  - ✅ .specify/templates/spec-template.md (remove testing language)
  - ✅ .specify/templates/tasks-template.md (remove test sections)
  - ⚠ .specify/templates/agent-file-template.md (no changes required)
  - ⚠ .specify/templates/checklist-template.md (no changes required)
- Deferred TODOs:
  - TODO(RATIFICATION_DATE): Original adoption date unknown; set when governance approves
-->

## Core Principles

### I. Clean Code
- Code MUST be readable, maintainable, and consistent. Prefer clarity over cleverness.
- Naming MUST be descriptive; avoid abbreviations. Keep functions small with single responsibility.
- Enforce simple control flow and early returns; avoid deep nesting.
- Comments ONLY for non-obvious rationale and invariants.
Rationale: Clear code reduces defects and accelerates onboarding and change.

### II. Simple, Responsive UX
- UX MUST be simple, fast, and responsive across devices.
- Prioritize core flows; avoid optional features that add complexity.
- UI performance targets: first interaction under 200ms p95 on modern devices.
Rationale: Simplicity increases user success and lowers maintenance.

### III. Minimal Dependencies
- Add dependencies ONLY when they remove substantial, recurring complexity.
- Prefer standard library and project-local modules.
- Any new dependency MUST have a clear owner, license compatibility, and removal plan.
Rationale: Fewer dependencies reduce security, upgrade, and runtime risk.

### IV. Clear Architecture Boundaries
- Separate concerns by layers and modules with explicit contracts.
- Backend, frontend, database, and cache boundaries MUST be respected; no cross-layer leaks.
- Data flow MUST be unidirectional across boundaries; shared types live in dedicated modules.
Rationale: Strong boundaries enable parallel work and safer changes.

### V. No Testing Policy (Superseding)
- No unit, integration, or end-to-end tests are permitted.
- Templates, plans, and tasks MUST NOT introduce tests or test scaffolding.
Rationale: This project explicitly excludes all automated testing by policy.

## Technology Stack & Operational Constraints

- Backend: Golang
- Frontend: ViteJS
- Database: PostgreSQL
- Cache: Redis
- Containerization: Docker
- Monitoring/Observability: Prometheus (metrics), Grafana (dashboards)
- CI/CD: GitHub Actions

Constraints:
- Adhere to minimal dependency principle when selecting libraries.
- Instrument essential metrics (latency, errors, throughput) for operators.
- Keep docker images small; prefer multi-stage builds.

## Development Workflow & Review

- Code Review: All changes MUST be reviewed for compliance with principles.
- Branching: Use short-lived feature branches; merge via PR with CI passing.
- CI/CD: GitHub Actions MUST build, lint, and deploy; no test steps allowed.
- UX: Validate responsiveness manually on common breakpoints before merge.
- Documentation: Update README and module docs when contracts or behaviors change.

Constitution Check (PR Gate):
- No new tests or test tooling introduced.
- Dependencies justified against Minimal Dependencies.
- Boundaries respected between backend, frontend, DB, Redis.
- UX remains simple and responsive.
- Monitoring and CI/CD configurations remain functional.

## Governance

- Supremacy: This constitution supersedes conflicting guidance in templates or docs.
- Amendments: Propose via PR that updates this file and the Sync Impact Report.
- Versioning: Semantic for governance text.
  - MAJOR: Backward-incompatible policy changes or removals.
  - MINOR: Added or materially expanded principles/sections.
  - PATCH: Clarifications or wording fixes.
- Compliance: Reviewers MUST block PRs violating principles or stack constraints.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE) | **Last Amended**: 2025-11-06
