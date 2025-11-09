# Implementation Plan: Vocab Quiz Game Redesign

**Branch**: `006-vocab-quiz-redesign` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-vocab-quiz-redesign/spec.md`

**Additional Requirements from User**:
- Each game will have separate list of tables (game_levels won't be used anymore)
- Levels will be changed to vocab_levels (game-specific levels)
- Each English word can have multiple CEFR levels
- Each CEFR level of a word can have multiple meanings
- Update cron job to run full scan instead of batch scan (translate all words without meaning)

## Summary

Redesign the vocabulary quiz game to support:
1. **Game-specific levels**: Replace shared `levels` table with `vocab_levels` table specific to vocabulary quiz game
2. **CEFR level support**: Support multiple CEFR levels (A1, A2, B1, B2, C1, C2) per English word
3. **Multiple meanings**: Support multiple meanings/translations per CEFR level
4. **Multiple-choice questions**: Replace text input with multiple-choice (a, b, c, d) format
5. **Translation direction**: Support bidirectional translation (English ↔ Vietnamese)
6. **Hierarchical level selection**: Include questions from selected level and all previous levels
7. **Session statistics**: Track and display comprehensive statistics per game session
8. **Full translation scan**: Update translation job to process all words without batch limits

**Technical Approach**:
- Database migration to restructure levels and word relationships
- New tables: `vocab_levels`, `word_cefr_levels`, `word_meanings`
- Backend API updates for multiple-choice question generation
- Frontend UI updates for level selection, direction selection, and multiple-choice interface
- Job update to remove batch processing limits

## Technical Context

**Language/Version**: Go 1.24+, TypeScript 5+, React 19+

**Primary Dependencies**: 
- Backend: Gin (HTTP routing), pgx/v5 (PostgreSQL), robfig/cron (job scheduling)
- Frontend: React 19, Vite 5, shadcn UI (latest), Tailwind CSS 3

**Storage**: PostgreSQL 15+ (primary data store), Redis 7+ (caching)

**Testing**: No automated tests required (manual verification only per constitution)

**Target Platform**: Web application (desktop and mobile browsers)

**Project Type**: Web application (backend + frontend)

**Performance Goals**: 
- Question generation: <500ms for 20 questions
- Answer submission: <200ms response time
- Page load: <2s for game selection screens
- UI interaction: <100ms response time

**Constraints**: 
- Must maintain backward compatibility with existing game sessions during migration
- Translation job must handle large word datasets without memory issues
- Multiple-choice generation must ensure plausible distractors
- Level hierarchy must support CEFR progression (A1 → A2 → B1 → B2 → C1 → C2)

**Scale/Scope**: 
- Support 10,000+ words in database
- Handle 100+ concurrent game sessions
- Support 6 CEFR levels (A1-C2)
- Generate 20 questions per session with 4 answer options each

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Clean Code**: Feature maintains readable, self-documenting code with clear naming and single responsibility. Database models, service methods, and UI components follow clean code principles.

- [x] **Simple and Responsive UX**: UI prioritizes performance (<2s load, <100ms interaction), mobile-responsiveness, and accessibility. Multiple-choice interface uses shadcn UI components for consistent, accessible interactions.

- [x] **Latest shadcn UI Components**: All frontend UI components will use shadcn UI (latest version). Level selection, direction selection, and multiple-choice questions will use shadcn Button, Card, RadioGroup components.

- [x] **Minimal Dependencies**: No new dependencies required. Uses existing Go, React, and PostgreSQL stack. Translation job uses existing DeepL translator integration.

- [x] **Clear Architecture Boundaries**: Design respects layer separation (Models → Services → Handlers) with no circular dependencies. New vocab_levels module follows existing module structure.

- [x] **No Testing Required**: Confirmed - no unit, integration, or e2e tests will be created (manual verification only per constitution).

- [x] **Technology Stack Compliance**: Feature uses only approved technologies (Go, Gin, PostgreSQL, Redis, React, Vite, TypeScript, Tailwind, shadcn UI). No new technologies introduced.

- [x] **Architecture Structure**: Implementation follows prescribed backend (`internal/modules/vocab_level/`) and frontend (`src/components/game/`) structure. New components organized by feature.

## Project Structure

### Documentation (this feature)

```text
specs/006-vocab-quiz-redesign/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── openapi.yaml     # API contract for vocab quiz endpoints
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── internal/
│   ├── modules/
│   │   ├── vocab_level/          # New module for vocab-specific levels
│   │   │   ├── model/
│   │   │   │   └── vocab_level.go
│   │   │   ├── service/
│   │   │   │   └── service.go
│   │   │   ├── handler/
│   │   │   │   └── http.go
│   │   │   └── wiring.go
│   │   ├── word/
│   │   │   ├── model/
│   │   │   │   └── word.go       # Updated to support CEFR levels and meanings
│   │   │   └── service/
│   │   │       └── service.go    # Updated for multiple-choice generation
│   │   ├── play/
│   │   │   ├── model/
│   │   │   │   └── play.go       # Updated for multiple-choice answers
│   │   │   └── service/
│   │   │       └── service.go    # Updated for statistics calculation
│   │   └── game/
│   │       └── service/
│   │           └── service.go    # Updated to remove game_levels dependency
│   └── platform/
│       ├── jobs/
│       │   └── translate_missing.go  # Updated for full scan
│       └── db/
│           └── postgres.go
└── migrations/
    ├── schema/
    │   ├── 005_create_vocab_levels.up.sql
    │   ├── 005_create_vocab_levels.down.sql
    │   ├── 006_create_word_cefr_levels.up.sql
    │   ├── 006_create_word_cefr_levels.down.sql
    │   ├── 007_create_word_meanings.up.sql
    │   ├── 007_create_word_meanings.down.sql
    │   ├── 008_migrate_levels_to_vocab_levels.up.sql
    │   ├── 008_migrate_levels_to_vocab_levels.down.sql
    │   ├── 009_update_game_sessions.up.sql
    │   └── 009_update_game_sessions.down.sql
    └── data/
        ├── 004_seed_vocab_levels.up.sql
        └── 004_seed_vocab_levels.down.sql

frontend/
├── src/
│   ├── components/
│   │   └── game/
│   │       ├── Game.tsx              # Updated for multiple-choice
│   │       ├── LevelSelector.tsx     # Updated for vocab levels
│   │       ├── DirectionSelector.tsx # New component
│   │       ├── MultipleChoice.tsx    # New component
│   │       ├── QuestionDisplay.tsx   # New component
│   │       └── StatisticsDisplay.tsx # New component
│   ├── lib/
│   │   └── api.ts                    # Updated API functions
│   └── types/
│       └── index.ts                  # Updated type definitions
```

**Structure Decision**: Web application structure with separate backend and frontend. Backend follows modular architecture with new `vocab_level` module. Frontend uses component-based structure with new game components for level selection, direction selection, and multiple-choice interface.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified. All requirements align with constitution principles.

## Phase 0: Research & Design Decisions

### Research Tasks

1. **CEFR Level Hierarchy**: Research CEFR level structure and ordering (A1 → A2 → B1 → B2 → C1 → C2)
2. **Multiple Meanings Storage**: Design schema for storing multiple meanings per CEFR level
3. **Multiple-Choice Generation**: Research algorithms for generating plausible distractors
4. **Migration Strategy**: Plan migration from shared levels to game-specific vocab_levels
5. **Translation Job Optimization**: Design full scan approach without batch limits
6. **Level Inclusion Logic**: Design query logic for including previous levels in question generation

### Key Design Decisions Needed

- How to represent CEFR level hierarchy in database (ordering field vs. code-based ordering)
- How to generate plausible distractors for multiple-choice questions
- How to handle migration of existing game sessions from levels to vocab_levels
- How to optimize translation job for full scan without memory issues
- How to query words by CEFR level with hierarchical inclusion

## Phase 1: Data Model & API Contracts

### Data Model Changes

1. **New Table: `vocab_levels`**: Game-specific levels for vocabulary quiz (replaces shared `levels` table)
2. **New Table: `word_cefr_levels`**: Many-to-many relationship between words and CEFR levels
3. **New Table: `word_meanings`**: Multiple meanings/translations per word-CEFR level combination
4. **Updated Table: `game_sessions`**: Reference `vocab_level_id` instead of `level_id`
5. **Removed Table: `game_levels`**: No longer needed (each game has its own levels)

### API Contracts

1. **GET /api/v1/vocab-levels**: Get all vocab levels for vocabulary quiz game
2. **POST /api/v1/vocab-quiz/questions**: Generate 20 multiple-choice questions
3. **POST /api/v1/vocab-quiz/answer**: Submit multiple-choice answer
4. **GET /api/v1/vocab-quiz/session/:sessionTag/statistics**: Get session statistics
5. **POST /api/v1/vocab-quiz/session**: Create new vocab quiz session

## Phase 2: Implementation Tasks

*(Tasks will be generated by `/speckit.tasks` command - not part of this plan)*

## Phase 0 & 1 Completion Status

✅ **Phase 0: Research & Design Decisions** - COMPLETE
- Research document created: `research.md`
- All design decisions documented (7 decisions)
- CEFR level hierarchy and ordering defined
- Multiple CEFR levels per word design documented
- Multiple meanings per level design documented
- Game-specific levels design documented
- Multiple-choice generation algorithm defined
- Full scan translation job design documented
- Session statistics tracking design documented

✅ **Phase 1: Data Model & API Contracts** - COMPLETE
- Data model document created: `data-model.md`
- Database schema defined (5 new/updated tables)
- Migration strategy documented
- API contracts created: `contracts/openapi.yaml`
- Quickstart guide created: `quickstart.md`
- Agent context updated: `.cursor/rules/specify-rules.mdc`

## Generated Artifacts

1. **research.md**: Design decisions and rationale for all technical choices
2. **data-model.md**: Complete database schema with migrations and queries
3. **contracts/openapi.yaml**: API specification for vocab quiz endpoints
4. **quickstart.md**: Manual verification guide with 10 test scenarios
5. **plan.md**: Implementation plan with technical context and structure

## Next Steps

1. Run `/speckit.tasks` to generate implementation tasks
2. Begin implementation following the plan and data model
3. Apply database migrations (005-009)
4. Implement backend API endpoints
5. Implement frontend UI components
6. Update translation job for full scan
7. Test using quickstart guide scenarios

## Migration Strategy

### Phase 1: Create New Tables
1. Create `vocab_levels` table with CEFR level codes (A1-C2)
2. Create `word_cefr_levels` junction table
3. Create `word_meanings` table for multiple meanings

### Phase 2: Migrate Data
1. Migrate existing level data to `vocab_levels` (map numeric codes to CEFR codes)
2. Migrate word-level relationships to `word_cefr_levels`
3. Migrate existing translations to `word_meanings`

### Phase 3: Update References
1. Update `game_sessions` to reference `vocab_level_id`
2. Update all service layer code to use new tables
3. Remove `game_levels` table (after migration complete)

### Phase 4: Update Jobs
1. Update translation job to remove batch limits
2. Update translation job to use new `word_meanings` table

## Risk Assessment

### High Risk
- **Data Migration**: Migrating existing game sessions and word-level relationships requires careful planning
- **Backward Compatibility**: Existing game sessions may reference old level structure

### Medium Risk
- **Performance**: Full scan translation job may be slow for large word datasets
- **Multiple-Choice Generation**: Generating plausible distractors requires good algorithm

### Low Risk
- **UI Changes**: Frontend changes are straightforward with shadcn UI components
- **API Changes**: API changes are additive (new endpoints) with minimal breaking changes

## Success Metrics

- All existing game sessions successfully migrated to new structure
- Translation job processes all words without batch limits
- Multiple-choice questions generate with plausible distractors
- Level selection includes hierarchical level inclusion (A2 includes A1)
- Session statistics accurately calculated and displayed
- UI responds within performance targets (<2s load, <100ms interaction)
