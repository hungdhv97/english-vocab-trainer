# Tasks: Vocab Quiz Game Redesign

**Input**: Design documents from `/specs/006-vocab-quiz-redesign/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**NO TESTING POLICY**: This project does NOT require automated tests per Constitution Principle V. Do NOT create unit tests, integration tests, or e2e tests. Manual verification and production monitoring suffice.

**Organization**: Tasks are grouped by user story to enable independent implementation and manual verification of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/internal/modules/`, `backend/migrations/`
- **Frontend**: `frontend/src/components/`, `frontend/src/lib/`
- **Database**: `backend/migrations/schema/`, `backend/migrations/data/`

## Phase 1: Setup (Database Migrations)

**Purpose**: Create database schema for new tables and update existing tables

- [X] T001 Create migration 005: Create languages table in backend/migrations/schema/005_create_languages.up.sql
- [X] T002 Create migration 005 down: Drop languages table in backend/migrations/schema/005_create_languages.down.sql
- [X] T003 Create migration 006: Create cefr_levels table in backend/migrations/schema/006_create_cefr_levels.up.sql
- [X] T004 Create migration 006 down: Drop cefr_levels table in backend/migrations/schema/006_create_cefr_levels.down.sql
- [X] T005 Create migration 007: Update words table (add language_id, phonetic, part_of_speech, remove old columns) in backend/migrations/schema/007_update_words.up.sql
- [X] T006 Create migration 007 down: Revert words table changes in backend/migrations/schema/007_update_words.down.sql
- [X] T007 Create migration 008: Create translations table in backend/migrations/schema/008_create_translations.up.sql
- [X] T008 Create migration 008 down: Drop translations table in backend/migrations/schema/008_create_translations.down.sql
- [X] T009 Create migration 009: Create examples table in backend/migrations/schema/009_create_examples.up.sql
- [X] T010 Create migration 009 down: Drop examples table in backend/migrations/schema/009_create_examples.down.sql
- [X] T011 Create migration 010: Update game_sessions table (add cefr_level_id, translation_direction, statistics columns) in backend/migrations/schema/010_update_game_sessions.up.sql
- [X] T012 Create migration 010 down: Revert game_sessions table changes in backend/migrations/schema/010_update_game_sessions.down.sql
- [X] T013 Create migration 011: Update plays table (add translation_id, correct_answer columns) in backend/migrations/schema/011_update_plays.up.sql
- [X] T014 Create migration 011 down: Revert plays table changes in backend/migrations/schema/011_update_plays.down.sql
- [X] T015 Create migration 012: Remove deprecated tables (universe_index, word_cefr_levels, word_meanings, game_levels, vocab_levels) in backend/migrations/schema/012_remove_deprecated_tables.up.sql
- [X] T016 Create migration 012 down: Recreate deprecated tables in backend/migrations/schema/012_remove_deprecated_tables.down.sql
- [X] T017 Create data migration: Seed languages table (en, vi) in backend/migrations/data/004_seed_languages.up.sql
- [X] T018 Create data migration down: Remove languages seed data in backend/migrations/data/004_seed_languages.down.sql
- [X] T019 Create data migration: Seed cefr_levels table (A1-C2) in backend/migrations/data/005_seed_cefr_levels.up.sql
- [X] T020 Create data migration down: Remove cefr_levels seed data in backend/migrations/data/005_seed_cefr_levels.down.sql
- [X] T021 Create data migration: Migrate words language_code to language_id in backend/migrations/data/006_migrate_words_language.up.sql
- [X] T022 Create data migration: Migrate existing word relationships to translations table in backend/migrations/data/007_migrate_to_translations.up.sql
- [X] T023 Create data migration: Migrate game_sessions level_id to cefr_level_id in backend/migrations/data/008_migrate_game_sessions.up.sql

---

## Phase 2: Foundational (Backend Models & Services)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T024 [P] Create Language model in backend/internal/modules/language/model/language.go
- [X] T025 [P] Create CefrLevel model in backend/internal/modules/cefr_level/model/cefr_level.go
- [X] T026 [P] Create Translation model in backend/internal/modules/translation/model/translation.go
- [X] T027 [P] Create Example model in backend/internal/modules/example/model/example.go
- [X] T028 Update Word model to use language_id instead of language_code and remove concept_id, difficulty, is_primary, is_active in backend/internal/modules/word/model/word.go
- [X] T029 Update Play model to include translation_id and correct_answer fields in backend/internal/modules/play/model/play.go
- [X] T030 Update SessionInfo model to use cefr_level_id instead of level_id and add translation_direction, statistics fields in backend/internal/modules/play/model/play.go
- [X] T031 [P] Create Language service with List method in backend/internal/modules/language/service/service.go
- [X] T032 [P] Create CefrLevel service with List and GetByCode methods in backend/internal/modules/cefr_level/service/service.go
- [X] T033 [P] Create Translation service with GetByWord, GetByLevel, GetDistractors methods in backend/internal/modules/translation/service/service.go
- [X] T034 [P] Create Example service with GetByWord and GetByLevel methods in backend/internal/modules/example/service/service.go
- [X] T035 Update Word service to use language_id and remove concept_id, difficulty queries in backend/internal/modules/word/service/service.go
- [X] T036 Update Word service GetRandomWords method to query via translations and cefr_levels in backend/internal/modules/word/service/service.go
- [X] T037 Update Word service GetMeaning method to use translations table instead of concept_id in backend/internal/modules/word/service/service.go
- [X] T038 [P] Create Language handler with List endpoint in backend/internal/modules/language/handler/http.go
- [X] T039 [P] Create CefrLevel handler with List and GetByCode endpoints in backend/internal/modules/cefr_level/handler/http.go
- [X] T040 [P] Create Translation handler with GetByWord and GetByLevel endpoints in backend/internal/modules/translation/handler/http.go
- [X] T041 [P] Create Example handler with GetByWord and GetByLevel endpoints in backend/internal/modules/example/handler/http.go
- [X] T042 [P] Create Language wiring to register routes in backend/internal/modules/language/wiring.go
- [X] T043 [P] Create CefrLevel wiring to register routes in backend/internal/modules/cefr_level/wiring.go
- [X] T044 [P] Create Translation wiring to register routes in backend/internal/modules/translation/wiring.go
- [X] T045 [P] Create Example wiring to register routes in backend/internal/modules/example/wiring.go
- [X] T046 Register Language routes in backend router in backend/internal/platform/server/router.go
- [X] T047 Register CefrLevel routes in backend router in backend/internal/platform/server/router.go
- [X] T048 Register Translation routes in backend router in backend/internal/platform/server/router.go
- [X] T049 Register Example routes in backend router in backend/internal/platform/server/router.go
- [X] T050 Update Play service RecordPlay method to use cefr_level_id and remove scoring_config dependency in backend/internal/modules/play/service/service.go
- [X] T051 Update Play service to calculate statistics (correct_count, incorrect_count, accuracy_percentage) in backend/internal/modules/play/service/service.go
- [X] T052 Update Play service CreateSession method to accept cefr_level_id and translation_direction in backend/internal/modules/play/service/service.go
- [X] T053 Update Play service FinishSession method to calculate and store session statistics in backend/internal/modules/play/service/service.go
- [X] T054 Update Play service GetHistory method to use new schema (translations, cefr_levels) in backend/internal/modules/play/service/service.go
- [X] T055 Update Play handler to accept cefr_level_id and translation_direction in session creation in backend/internal/modules/play/handler/http.go
- [X] T056 Update Play handler to return translation_id in answer response in backend/internal/modules/play/handler/http.go
- [X] T064 Update translation job to remove batchSize parameter and process all words in backend/internal/platform/jobs/translate_missing.go
- [X] T065 Update translation job to use translations table instead of words table for creating translations in backend/internal/platform/jobs/translate_missing.go
- [X] T066 Update translation job registration to remove batchSize parameter in backend/internal/platform/jobs/jobs.go
- [X] T067 Update translation job config to remove BatchSize field in backend/internal/platform/config/config.go
- [X] T057 Create VocabQuiz service for question generation with multiple-choice logic in backend/internal/modules/vocab_quiz/service/service.go
- [X] T058 Implement GenerateQuestions method to create 20 multiple-choice questions in backend/internal/modules/vocab_quiz/service/service.go
- [X] T059 Implement GetDistractors method to select 3 plausible distractors for multiple-choice in backend/internal/modules/vocab_quiz/service/service.go
- [X] T060 Implement hierarchical level inclusion (A2 includes A1) in question generation in backend/internal/modules/vocab_quiz/service/service.go
- [X] T061 Create VocabQuiz handler with GenerateQuestions and SubmitAnswer endpoints in backend/internal/modules/vocab_quiz/handler/http.go
- [X] T062 Create VocabQuiz wiring to register routes in backend/internal/modules/vocab_quiz/wiring.go
- [X] T063 Register VocabQuiz routes in backend router in backend/internal/platform/server/router.go

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Complete Vocab Quiz Game Session (Priority: P1) 🎯 MVP

**Goal**: User can play a complete vocabulary quiz game session: select level, choose translation direction, answer 20 multiple-choice questions, and see results.

**Manual Verification**: (1) Click "Play Game" on vocab quiz game card, (2) Select a level (e.g., A2), (3) Select translation direction (e.g., English to Vietnamese), (4) Answer all 20 multiple-choice questions, (5) Verify questions match selected direction, (6) Verify questions include words from selected level and previous levels, (7) Verify score updates after each answer, (8) Verify session statistics are recorded.

### Implementation for User Story 1

- [X] T068 [US1] Update API contract to use cefr_level_id instead of vocab_level_id and update endpoint to /cefr-levels in specs/006-vocab-quiz-redesign/contracts/openapi.yaml
- [X] T069 [US1] Create CefrLevel API function to fetch CEFR levels in frontend/src/lib/api.ts
- [X] T070 [US1] Create VocabQuiz API functions (createSession, generateQuestions, submitAnswer, finishSession) in frontend/src/lib/api.ts
- [X] T071 [US1] Update types to include CefrLevel, Translation, Question types in frontend/src/types/index.ts
- [X] T072 [US1] Create CefrLevelSelector component to display CEFR levels (A1-C2) in frontend/src/components/game/CefrLevelSelector.tsx
- [X] T073 [US1] Create DirectionSelector component with en-to-vi and vi-to-en options in frontend/src/components/game/DirectionSelector.tsx
- [X] T074 [US1] Create MultipleChoice component to display 4 answer options (a, b, c, d) in frontend/src/components/game/MultipleChoice.tsx
- [X] T075 [US1] Create QuestionDisplay component to show question text and multiple-choice options in frontend/src/components/game/QuestionDisplay.tsx
- [X] T076 [US1] Update Game component to implement level selection → direction selection → question flow in frontend/src/components/game/Game.tsx
- [X] T077 [US1] Implement question generation with 20 random questions in Game component in frontend/src/components/game/Game.tsx
- [X] T078 [US1] Implement multiple-choice answer submission and feedback in Game component in frontend/src/components/game/Game.tsx
- [X] T079 [US1] Implement score tracking and display in Game component in frontend/src/components/game/Game.tsx
- [X] T080 [US1] Implement hierarchical level inclusion (A2 includes A1) in question generation in backend/internal/modules/vocab_quiz/service/service.go
- [X] T081 [US1] Implement translation direction logic (en-to-vi shows English question with Vietnamese options) in backend/internal/modules/vocab_quiz/service/service.go
- [X] T082 [US1] Implement translation direction logic (vi-to-en shows Vietnamese question with English options) in backend/internal/modules/vocab_quiz/service/service.go
- [X] T083 [US1] Implement answer validation and scoring in VocabQuiz service in backend/internal/modules/vocab_quiz/service/service.go
- [X] T084 [US1] Implement session creation with cefr_level_id and translation_direction in VocabQuiz handler in backend/internal/modules/vocab_quiz/handler/http.go
- [X] T085 [US1] Implement question generation endpoint that returns 20 questions with 4 options each in backend/internal/modules/vocab_quiz/handler/http.go
- [X] T086 [US1] Implement answer submission endpoint that validates answer and returns feedback in backend/internal/modules/vocab_quiz/handler/http.go
- [X] T087 [US1] Update game_sessions table to store cefr_level_id and translation_direction on session creation in backend/internal/modules/play/service/service.go
- [X] T088 [US1] Update plays table to store translation_id and correct_answer on answer submission in backend/internal/modules/play/service/service.go
- [X] T089 [US1] Implement immediate feedback (correct/incorrect) after answer submission in frontend/src/components/game/Game.tsx
- [X] T090 [US1] Implement score update after each answer in frontend/src/components/game/Game.tsx
- [X] T091 [US1] Implement session completion and statistics display in frontend/src/components/game/Game.tsx
- [X] T092 [US1] Handle edge case: insufficient words for level (use all available words, inform user) in backend/internal/modules/vocab_quiz/service/service.go
- [X] T093 [US1] Handle edge case: no words available for level (display error, allow level reselection) in backend/internal/modules/vocab_quiz/service/service.go
- [X] T094 [US1] Handle edge case: prevent duplicate answer submissions for same question in frontend/src/components/game/Game.tsx
- [ ] T095 [US1] Manual verification: Test complete quiz flow from level selection to results in browser

**Checkpoint**: At this point, User Story 1 should be fully functional and manually verified

---

## Phase 4: User Story 2 - View Game Session Statistics (Priority: P2)

**Goal**: User can view comprehensive statistics after completing a quiz session including total score, correct/incorrect counts, accuracy percentage, and time elapsed.

**Manual Verification**: (1) Complete a quiz session, (2) View session completion screen, (3) Verify statistics display correctly (total score, correct answers count, incorrect answers count, accuracy percentage, time elapsed), (4) Verify statistics are accurate and match actual performance.

### Implementation for User Story 2

- [ ] T096 [US2] Create GetSessionStatistics method in VocabQuiz service to calculate statistics in backend/internal/modules/vocab_quiz/service/service.go
- [ ] T097 [US2] Implement statistics calculation (total_score, correct_count, incorrect_count, accuracy_percentage, time_elapsed) in backend/internal/modules/vocab_quiz/service/service.go
- [ ] T098 [US2] Create GetSessionStatistics endpoint in VocabQuiz handler in backend/internal/modules/vocab_quiz/handler/http.go
- [ ] T099 [US2] Create GetSessionStatistics API function in frontend/src/lib/api.ts
- [ ] T100 [US2] Create StatisticsDisplay component to show session statistics in frontend/src/components/game/StatisticsDisplay.tsx
- [ ] T101 [US2] Update Game component to display statistics on session completion in frontend/src/components/game/Game.tsx
- [ ] T102 [US2] Implement time tracking (start time, end time, elapsed time) in Game component in frontend/src/components/game/Game.tsx
- [ ] T103 [US2] Update session completion to calculate and store statistics in backend/internal/modules/play/service/service.go
- [ ] T104 [US2] Verify statistics are persisted in game_sessions table (correct_count, incorrect_count, accuracy_percentage) in backend/internal/modules/play/service/service.go
- [ ] T105 [US2] Manual verification: Complete quiz session and verify statistics accuracy in browser

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently and be manually verified

---

## Phase 5: User Story 3 - Navigate Between Game Selection Stages (Priority: P2)

**Goal**: User can navigate back from translation direction selection to level selection, and from game page back to previous selection screens without losing progress.

**Manual Verification**: (1) Select a level and proceed to direction selection, (2) Click back button to return to level selection, (3) Select a different level, (4) Proceed to direction selection again, (5) Verify navigation works smoothly without errors, (6) Verify level selection is maintained when navigating back.

### Implementation for User Story 3

- [ ] T106 [US3] Implement back button in DirectionSelector component to return to level selection in frontend/src/components/game/DirectionSelector.tsx
- [ ] T107 [US3] Implement back button in Game component to return to direction selection (before quiz starts) in frontend/src/components/game/Game.tsx
- [ ] T108 [US3] Implement state management to preserve level selection when navigating back in frontend/src/components/game/Game.tsx
- [ ] T109 [US3] Implement state management to preserve direction selection when navigating back in frontend/src/components/game/Game.tsx
- [ ] T110 [US3] Update navigation to use URL parameters or state management for level and direction in frontend/src/components/game/Game.tsx
- [ ] T111 [US3] Handle navigation back after quiz starts (prevent or show confirmation) in frontend/src/components/game/Game.tsx
- [ ] T112 [US3] Verify level selection changes are reflected when navigating back and selecting different level in frontend/src/components/game/Game.tsx
- [ ] T113 [US3] Manual verification: Test navigation back functionality in browser

**Checkpoint**: All user stories should now be independently functional and manually verified

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final polish

- [ ] T114 [P] Update OpenAPI documentation with new vocab quiz endpoints in backend/docs/openapi.yaml
- [ ] T115 [P] Update frontend types to match new API responses in frontend/src/types/index.ts
- [ ] T116 [P] Add error handling for insufficient words scenario in frontend/src/components/game/Game.tsx
- [ ] T117 [P] Add error handling for session expiration during gameplay in frontend/src/components/game/Game.tsx
- [ ] T118 [P] Add loading states for question generation and answer submission in frontend/src/components/game/Game.tsx
- [ ] T119 [P] Implement shuffle algorithm for multiple-choice options to randomize correct answer position in backend/internal/modules/vocab_quiz/service/service.go
- [ ] T120 [P] Verify distractor selection algorithm generates plausible distractors in backend/internal/modules/vocab_quiz/service/service.go
- [ ] T121 [P] Update translation job to create translations records with CEFR level associations in backend/internal/platform/jobs/translate_missing.go
- [ ] T122 [P] Update translation job to handle meaning_order for multiple translations per word in backend/internal/platform/jobs/translate_missing.go
- [ ] T123 [P] Add progress logging for translation job full scan in backend/internal/platform/jobs/translate_missing.go
- [ ] T124 [P] Update game service to remove game_levels dependency in backend/internal/modules/game/service/service.go
- [ ] T125 [P] Remove references to game_levels table from all services in backend/internal/modules/
- [ ] T126 [P] Update level module to use cefr_levels instead of levels table (if still used) in backend/internal/modules/level/service/service.go
- [ ] T127 [P] Update universe_index references to use new translations-based query in backend/internal/modules/word/service/service.go
- [ ] T128 [P] Remove universe_index job registration and implementation in backend/internal/platform/jobs/jobs.go and backend/internal/platform/jobs/universe_index.go
- [ ] T129 [P] Run database migrations and verify schema changes in development environment
- [ ] T130 [P] Verify all API endpoints work correctly with new schema in development environment
- [ ] T131 [P] Run quickstart.md validation scenarios from specs/006-vocab-quiz-redesign/quickstart.md
- [ ] T132 [P] Manual end-to-end verification of all user stories in browser
- [ ] T133 [P] Verify performance targets (question generation <500ms, answer submission <200ms) in development environment
- [ ] T134 [P] Verify UI performance (page load <2s, interaction <100ms) in browser
- [ ] T135 [P] Verify mobile responsiveness for all game components in browser
- [ ] T136 [P] Verify accessibility (WCAG 2.1 AA) for multiple-choice interface in browser

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P2)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for session completion
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Can be implemented independently but integrates with US1

### Within Each User Story

- Models before services
- Services before handlers
- Handlers before frontend components
- API functions before components
- Core implementation before integration
- Manual verification before story completion
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks (T001-T023) can run in parallel (different migration files)
- All Foundational model tasks (T024-T030) marked [P] can run in parallel
- All Foundational service tasks (T031-T037) marked [P] can run in parallel
- All Foundational handler tasks (T038-T041) marked [P] can run in parallel
- All Foundational wiring tasks (T042-T045) marked [P] can run in parallel
- Once Foundational phase completes, User Story 1 can start
- User Story 2 can start after User Story 1 session completion is implemented
- User Story 3 can start independently after Foundational phase
- Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all API functions and types together:
Task: "Create CefrLevel API function to fetch CEFR levels in frontend/src/lib/api.ts"
Task: "Create VocabQuiz API functions in frontend/src/lib/api.ts"
Task: "Update types to include CefrLevel, Translation, Question types in frontend/src/types/index.ts"

# Launch all UI components together:
Task: "Create CefrLevelSelector component in frontend/src/components/game/CefrLevelSelector.tsx"
Task: "Create DirectionSelector component in frontend/src/components/game/DirectionSelector.tsx"
Task: "Create MultipleChoice component in frontend/src/components/game/MultipleChoice.tsx"
Task: "Create QuestionDisplay component in frontend/src/components/game/QuestionDisplay.tsx"

# After components are ready, integrate in Game component:
Task: "Update Game component to implement level selection → direction selection → question flow"
Task: "Implement question generation with 20 random questions in Game component"
Task: "Implement multiple-choice answer submission and feedback in Game component"

# After implementation, manual verification:
Task: "Manual verification: Test complete quiz flow from level selection to results in browser"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (Database Migrations)
2. Complete Phase 2: Foundational (Backend Models & Services)
3. Complete Phase 3: User Story 1 (Complete Vocab Quiz Game Session)
4. **STOP and VALIDATE**: Manually verify User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Manually verify independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Manually verify independently → Deploy/Demo
4. Add User Story 3 → Manually verify independently → Deploy/Demo
5. Add Polish → Final verification → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Backend question generation)
   - Developer B: User Story 1 (Frontend UI components)
   - Developer C: User Story 2 (Statistics)
   - Developer D: User Story 3 (Navigation)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and manually verifiable
- NO AUTOMATED TESTS: Manual verification only (per Constitution Principle V)
- Commit after each task or logical group
- Stop at any checkpoint to manually validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Database migrations must be run in order (005 → 006 → 007 → ... → 012)
- Data migrations must be run after schema migrations
- Translation job update can be done in parallel with user stories (Phase 6)

