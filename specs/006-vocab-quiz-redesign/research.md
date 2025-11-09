# Research & Design Decisions: Vocab Quiz Game Redesign

**Feature**: 006-vocab-quiz-redesign  
**Date**: 2025-01-27  
**Updated**: 2025-01-27  
**Purpose**: Document research findings and design decisions for vocab quiz game redesign

## Decision 1: CEFR Level Hierarchy and Ordering

### Decision

Use CEFR (Common European Framework of Reference) level codes (A1, A2, B1, B2, C1, C2) stored in a simple `cefr_levels` table without game association or scoring configuration.

### Rationale

**Standard Compliance**: CEFR is an international standard for language proficiency levels, widely recognized and used in language learning applications.

**Simplicity**: Removing game-specific levels and scoring configuration simplifies the data model and makes CEFR levels reusable across different game types.

**Hierarchical Inclusion**: CEFR levels have inherent ordering (A1 → A2 → B1 → B2 → C1 → C2) that can be used for hierarchical inclusion without explicit ordering field.

**Database Efficiency**: Using CEFR codes directly allows efficient querying for "level and all previous levels" using IN clause with level codes.

### Implementation

```sql
CREATE TABLE cefr_levels (
  id SERIAL PRIMARY KEY,
  code VARCHAR(5) NOT NULL UNIQUE,  -- 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'
  group_name VARCHAR(50) NOT NULL,  -- 'Basic User', 'Independent User', 'Proficient User'
  level_name VARCHAR(100) NOT NULL, -- 'Beginner / Breakthrough', etc.
  description TEXT
);
```

**Level Structure**:
- A1: Basic User - Beginner / Breakthrough
- A2: Basic User - Elementary / Waystage
- B1: Independent User - Intermediate / Threshold
- B2: Independent User - Upper Intermediate / Vantage
- C1: Proficient User - Advanced / Effective Operational Proficiency
- C2: Proficient User - Proficiency / Mastery

**Query for Hierarchical Inclusion**:
```sql
-- Get words for level A2 and all previous levels (A1, A2)
SELECT w.*
FROM words w
JOIN translations t ON w.id = t.from_word_id
JOIN cefr_levels cl ON t.cefr_level_id = cl.id
WHERE cl.code IN ('A1', 'A2')
AND w.language_id = (SELECT id FROM languages WHERE code = 'en');
```

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Game-specific levels** | CEFR levels are universal standards, not game-specific |
| **Scoring configuration in levels** | Scoring should be game-specific, not level-specific |
| **Explicit ordering field** | CEFR codes have inherent ordering, no need for separate field |

### Implementation Implications

- Migration must create `cefr_levels` table with 6 predefined levels
- Level selection UI displays CEFR codes with group names and level names
- Question generation queries use `IN ('A1', 'A2', ...)` for hierarchical inclusion
- No scoring configuration stored in levels table

---

## Decision 2: Multiple CEFR Levels per Word via Translations

### Decision

Support multiple CEFR levels per word through the `translations` table, which links word pairs with optional CEFR level associations.

### Rationale

**Real-World Usage**: English words can appear at multiple CEFR levels with different meanings or usage contexts. For example, "bank" can be A1 (river bank) or B1 (financial bank).

**Simplified Model**: Combining translations with CEFR levels in a single table eliminates the need for separate junction tables and simplifies the data model.

**Meaning Context**: Translations naturally capture the meaning context at different CEFR levels, making it the ideal place to associate CEFR levels with words.

### Implementation

```sql
CREATE TABLE translations (
  id SERIAL PRIMARY KEY,
  from_word_id INT NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  to_word_id INT NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  cefr_level_id INT REFERENCES cefr_levels(id) ON DELETE SET NULL,
  meaning_order INT NOT NULL DEFAULT 1,
  note VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Example Data**:
- Word "bank" (id=1) → Translation to "ngân hàng" (id=2) at B1 level (financial)
- Word "bank" (id=1) → Translation to "bờ sông" (id=3) at A1 level (river bank)
- Word "run" (id=4) → Translation to "chạy" (id=5) at A1 level
- Word "run" (id=4) → Translation to "vận hành" (id=6) at B2 level (operate)

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Separate word_cefr_levels table** | Adds unnecessary complexity, translations already capture level context |
| **Single level per word** | Too restrictive, doesn't reflect real-world usage |
| **Level in words table** | Cannot support multiple levels per word with different meanings |

### Implementation Implications

- Question generation joins `words` → `translations` → `cefr_levels` to filter by level
- Migration must create translations from existing word relationships
- Word management UI must support creating translations with CEFR levels
- Multiple meanings for same word pair are distinguished by `meaning_order`

---

## Decision 3: Multiple Meanings per CEFR Level via Translations

### Decision

Store multiple meanings/translations per word-CEFR level combination using the `translations` table with `meaning_order` field.

### Rationale

**Context-Specific Meanings**: Words have different meanings at different CEFR levels. For example, "present" at A1 means "gift", at B1 means "current time", at B2 means "to show".

**Translation Accuracy**: Multiple translation pairs allow more accurate translation options for quiz questions.

**Question Variety**: Multiple translations enable variety in question generation for the same word at the same level.

**Simplified Model**: Using translations table eliminates the need for separate word_meanings table while maintaining the same functionality.

### Implementation

```sql
CREATE TABLE translations (
  id SERIAL PRIMARY KEY,
  from_word_id INT NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  to_word_id INT NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  cefr_level_id INT REFERENCES cefr_levels(id) ON DELETE SET NULL,
  meaning_order INT NOT NULL DEFAULT 1,
  note VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Example Data**:
- Word "present" (id=1) at A1:
  - Translation to "món quà" (id=2) with meaning_order=1, note="gift"
- Word "present" (id=1) at B1:
  - Translation to "hiện tại" (id=3) with meaning_order=1, note="current time"
  - Translation to "trình bày" (id=4) with meaning_order=2, note="to show"

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Separate word_meanings table** | Adds unnecessary complexity, translations already capture meanings |
| **Single meaning per level** | Too restrictive, doesn't capture word complexity |
| **Meanings in words table** | Cannot support multiple meanings per level |

### Implementation Implications

- Question generation selects translation with meaning_order=1 for correct answer
- Multiple-choice distractors can use other translations or related words
- Translation job must create `translations` records for each CEFR level and meaning
- UI must support managing multiple translations per word with meaning_order

---

## Decision 4: Universal CEFR Levels (Not Game-Specific)

### Decision

Use universal `cefr_levels` table without game association. CEFR levels are standard and can be shared across all games.

### Rationale

**Standard Compliance**: CEFR levels are universal language proficiency standards, not game-specific. All vocabulary games can use the same CEFR levels.

**Simplicity**: Removing game association simplifies the data model and eliminates the need for game_levels junction table.

**Reusability**: CEFR levels can be reused across different game types without duplication.

**Consistency**: Using standard CEFR levels ensures consistent difficulty assessment across the application.

### Implementation

```sql
-- Universal cefr_levels table (not game-specific)
CREATE TABLE cefr_levels (
  id SERIAL PRIMARY KEY,
  code VARCHAR(5) NOT NULL UNIQUE,
  group_name VARCHAR(50) NOT NULL,
  level_name VARCHAR(100) NOT NULL,
  description TEXT
);

-- Update game_sessions to reference cefr_level_id
ALTER TABLE game_sessions
ADD COLUMN cefr_level_id INT REFERENCES cefr_levels(id) ON DELETE SET NULL;

-- Remove game_levels table (after migration)
DROP TABLE IF EXISTS game_levels;
```

### Migration Strategy

1. **Create cefr_levels table** with 6 predefined levels (A1-C2)
2. **Migrate existing levels** to cefr_levels (map numeric codes to CEFR codes)
3. **Update game_sessions** to set cefr_level_id from level_id
4. **Remove game_levels table** after migration complete
5. **Remove level_id** from game_sessions after migration complete

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Game-specific levels** | CEFR levels are universal standards, not game-specific |
| **Keep game_levels junction** | Adds unnecessary complexity, CEFR levels are standard |
| **Levels per game in games table** | Doesn't scale, CEFR levels should be shared |

### Implementation Implications

- All level queries use cefr_levels table directly (no game_id filter)
- Migration script must map existing levels to CEFR levels
- Service layer must use cefr_levels instead of vocab_levels or levels
- Frontend must use new cefr-levels API endpoint
- Scoring configuration removed from levels (handled at game level if needed)

---

## Decision 5: Language Reference Table

### Decision

Create a `languages` table to reference supported languages (English and Vietnamese) instead of using language codes directly in words table.

### Rationale

**Data Integrity**: Language reference table ensures only valid languages are used and provides a single source of truth for language information.

**Extensibility**: Easy to add new languages in the future without modifying multiple tables.

**Consistency**: Centralized language management ensures consistent language codes and names across the application.

**Foreign Key Constraints**: Using foreign keys ensures referential integrity and prevents invalid language references.

### Implementation

```sql
CREATE TABLE languages (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL
);

INSERT INTO languages (code, name) VALUES
('en', 'English'),
('vi', 'Vietnamese');
```

**Example Usage**:
- Words table uses `language_id` instead of `language_code`
- Foreign key constraint ensures only valid languages are referenced
- Language names can be displayed in UI without hardcoding

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Language codes in words table** | No referential integrity, harder to manage |
| **Enum type for languages** | Less flexible, harder to extend |
| **Hardcoded language checks** | No database-level validation |

### Implementation Implications

- Migration must create languages table and insert 'en' and 'vi'
- Words table must use `language_id` instead of `language_code`
- All queries must join languages table or use language_id
- UI can display language names from languages table

---

## Decision 6: Simplified Words Table

### Decision

Simplify `words` table by removing `concept_id`, `difficulty`, `is_primary`, `is_active` fields and adding `phonetic` and `part_of_speech` fields.

### Rationale

**Simplicity**: Removing concept_id eliminates unnecessary complexity. Words are independent entities.

**CEFR Levels in Translations**: Difficulty/CEFR levels are now in translations table, not words table.

**Enhanced Word Information**: Adding phonetic and part_of_speech provides more useful word information for learning.

**Language Reference**: Using `language_id` instead of `language_code` provides referential integrity.

### Implementation

```sql
CREATE TABLE words (
  id SERIAL PRIMARY KEY,
  language_id INT NOT NULL REFERENCES languages(id),
  word_text VARCHAR(255) NOT NULL,
  phonetic VARCHAR(255),
  part_of_speech VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Removed Fields**:
- `concept_id` - No longer needed, words are independent
- `language_code` - Replaced by `language_id` foreign key
- `difficulty` - Replaced by CEFR levels in translations
- `is_primary` - Replaced by `meaning_order` in translations
- `is_active` - No longer needed

**Added Fields**:
- `phonetic` - Phonetic transcription for pronunciation
- `part_of_speech` - Grammar classification (noun, verb, etc.)

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Keep concept_id** | Adds unnecessary complexity, words can be independent |
| **Keep difficulty in words** | CEFR levels are better represented in translations |
| **Keep is_primary flag** | meaning_order in translations is more flexible |

### Implementation Implications

- Migration must remove concept_id and related indexes
- Migration must convert language_code to language_id
- Migration must migrate difficulty to CEFR levels in translations
- Word management UI must support phonetic and part_of_speech
- Queries must use language_id instead of language_code

---

## Decision 7: Examples Table

### Decision

Create an `examples` table to store example sentences or phrases using words, optionally associated with CEFR levels.

### Rationale

**Learning Support**: Examples help users understand word usage in context, improving learning effectiveness.

**CEFR Level Context**: Examples can be associated with CEFR levels to provide level-appropriate usage examples.

**Bilingual Support**: Examples can be stored in both languages with translations for better comprehension.

**Flexibility**: Examples are optional and can be added gradually without affecting core functionality.

### Implementation

```sql
CREATE TABLE examples (
  id SERIAL PRIMARY KEY,
  word_id INT NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  example_text TEXT NOT NULL,
  translation_text TEXT,
  cefr_level_id INT REFERENCES cefr_levels(id) ON DELETE SET NULL,
  language_id INT NOT NULL REFERENCES languages(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Example Data**:
- Word "book" (id=1):
  - Example: "I read a book every day" (English, A1)
  - Translation: "Tôi đọc sách mỗi ngày" (Vietnamese)
- Word "sách" (id=2):
  - Example: "Tôi đọc sách mỗi ngày" (Vietnamese, A1)
  - Translation: "I read a book every day" (English)

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Examples in words table** | Would bloat words table, examples are optional |
| **Examples in translations table** | Examples are word-specific, not translation-specific |
| **Separate examples per language** | Single table with language_id is simpler |

### Implementation Implications

- Examples are optional and can be added gradually
- Examples can be displayed in quiz results or word details
- Examples can be filtered by CEFR level for level-appropriate content
- UI must support managing examples for words

---

## Decision 8: Multiple-Choice Question Generation

### Decision

Generate multiple-choice questions with 4 options (a, b, c, d) using algorithm that selects plausible distractors from same CEFR level or related levels.

### Rationale

**User Experience**: Multiple-choice format is faster and easier for users than text input.

**Question Quality**: Plausible distractors make questions more challenging and educational.

**Scalability**: Algorithm-based generation scales better than manual question creation.

### Implementation

**Question Generation Algorithm**:
1. Select random English word from selected CEFR level (and previous levels) via translations
2. Get translation with meaning_order=1 as correct answer
3. Select 3 distractors from:
   - Other translations at same CEFR level with different words
   - Translations from same word but different meanings
   - Random words from same language and CEFR level
4. Shuffle options (a, b, c, d) with correct answer
5. Store question with correct answer option identifier

**Distractor Selection Strategy**:
```sql
-- Get distractors from same CEFR level
SELECT DISTINCT t.to_word_id
FROM translations t
JOIN cefr_levels cl ON t.cefr_level_id = cl.id
WHERE cl.code = $cefr_level
AND t.to_word_id != $correct_word_id
ORDER BY RANDOM()
LIMIT 3;
```

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Manual question creation** | Doesn't scale, requires manual effort |
| **Random distractors** | Too easy, not educational |
| **AI-generated distractors** | Adds complexity, requires AI service |

### Implementation Implications

- Question generation service must implement distractor selection algorithm
- Options must be shuffled to randomize correct answer position
- Correct answer option identifier must be stored for validation
- Frontend must display options as buttons (a, b, c, d)

---

## Decision 9: Full Scan Translation Job

### Decision

Update translation job to process all words without missing translations in a single run, removing batch size limits.

### Rationale

**Completeness**: Full scan ensures all words without translations are processed, not just a batch.

**Simplicity**: Removes need for batch size configuration and multiple job runs.

**Efficiency**: Single full scan is more efficient than multiple batch runs for complete translation.

### Implementation

```go
// Updated translation job (removed batchSize parameter)
func translateMissingVietnamese(db *pgxpool.Pool, deepLTranslator *translator.DeepLTranslator) error {
    ctx := context.Background()
    
    // Find ALL English words without Vietnamese translations (no LIMIT)
    query := `
        SELECT w.id, w.word_text
        FROM words w
        JOIN languages l ON w.language_id = l.id
        WHERE l.code = 'en'
        AND NOT EXISTS (
            SELECT 1
            FROM translations t
            JOIN words w2 ON t.to_word_id = w2.id
            JOIN languages l2 ON w2.language_id = l2.id
            WHERE t.from_word_id = w.id
            AND l2.code = 'vi'
        )
        ORDER BY w.id
    `
    
    rows, err := db.Query(ctx, query)
    // ... process all rows without batch limit
}
```

**Job Configuration**:
- Remove `BatchSize` configuration parameter
- Update job registration to not pass batchSize
- Add progress logging for large translation jobs

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Keep batch processing** | Doesn't ensure all words are translated |
| **Streaming processing** | Adds complexity, not necessary for translation job |
| **Parallel processing** | May hit API rate limits, adds complexity |

### Implementation Implications

- Translation job may take longer for large word datasets
- Must handle API rate limits gracefully (retry logic)
- Must log progress for monitoring
- Must handle errors gracefully (continue on individual word errors)
- Must create translations records instead of word records

---

## Decision 10: Session Statistics Tracking

### Decision

Track comprehensive session statistics including total score, correct/incorrect counts, accuracy percentage, and time elapsed.

### Rationale

**User Feedback**: Statistics provide valuable feedback on user performance and progress.

**Learning Analytics**: Statistics enable analysis of user learning patterns and difficulty levels.

**Engagement**: Statistics encourage continued engagement and improvement.

### Implementation

**Statistics Calculation**:
```sql
-- Calculate session statistics
SELECT 
    COUNT(*) as total_questions,
    SUM(CASE WHEN p.is_correct THEN 1 ELSE 0 END) as correct_count,
    SUM(CASE WHEN p.is_correct THEN 0 ELSE 1 END) as incorrect_count,
    SUM(p.score) as total_score,
    ROUND(100.0 * SUM(CASE WHEN p.is_correct THEN 1 ELSE 0 END) / COUNT(*), 2) as accuracy_percentage,
    EXTRACT(EPOCH FROM (gs.finished_at - gs.started_at)) as time_elapsed_seconds
FROM plays p
JOIN game_sessions gs ON p.session_tag = gs.session_tag
WHERE gs.session_tag = $session_tag;
```

**Statistics Display**:
- Total score
- Correct answers count
- Incorrect answers count
- Accuracy percentage
- Time elapsed
- Average time per question

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Minimal statistics** | Doesn't provide enough feedback for users |
| **Real-time statistics** | Adds complexity, not necessary for quiz format |
| **Historical statistics** | Out of scope for this feature (future enhancement) |

### Implementation Implications

- Statistics calculated on session completion
- Statistics stored in game_sessions table or calculated on-demand
- Frontend displays statistics in results screen
- Statistics API endpoint returns calculated values

---

## Summary

All research decisions align with constitution principles:
- **Clean Code**: Clear database schema and service layer design
- **Simple UX**: Multiple-choice interface is simpler than text input
- **Minimal Dependencies**: No new dependencies, uses existing stack
- **Clear Architecture**: New modules follow existing architecture patterns
- **Technology Compliance**: Uses only approved technologies (Go, PostgreSQL, React, shadcn UI)

**Key Schema Changes**:
1. `vocab_levels` → `cefr_levels` (universal, no game_id, no scoring_config)
2. `word_cefr_levels` + `word_meanings` → `translations` (unified table)
3. `words` table simplified (removed concept_id, difficulty, is_primary, is_active)
4. Added `languages` table for language reference
5. Added `examples` table for example sentences
6. All IDs renamed to `id` (no prefixes)
7. Removed `universe_index` table

No constitution violations identified. All decisions support feature requirements while maintaining code quality and architecture boundaries.
