# Data Model: Vocab Quiz Game Redesign

**Feature**: 006-vocab-quiz-redesign  
**Date**: 2025-01-27  
**Updated**: 2025-01-27  
**Purpose**: Define database schema and data relationships for vocab quiz game redesign

## Overview

This feature introduces CEFR levels (`cefr_levels`), language support (`languages`), word translations (`translations`), and examples (`examples`) for the vocabulary quiz game. The schema is simplified to remove game-specific levels, scoring config, and complex word-level relationships.

## Entity Relationship Diagram

```text
languages (1) ──→ (M) words
                      │
                      │ (M)
                      ↓
                translations
                      │
                      │ (M)
                      ↓
                cefr_levels
                      │
                      │
words (1) ────────────┘
    │
    │ (M)
    ↓
examples
    │
    │
words (1) ────────────┘
    │
    │ (M)
    ↓
game_sessions
    │
    │ (M)
    ↓
plays
```

## Core Entities

### 1. Language

**Table**: `languages`

**Description**: Supported languages for the vocabulary quiz game (English and Vietnamese).

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Unique identifier for language |
| `code` | VARCHAR(10) | NOT NULL, UNIQUE | Language code ('en', 'vi') |
| `name` | VARCHAR(50) | NOT NULL | Language name ('English', 'Vietnamese') |

**Indexes**:
- Primary key on `id`
- Unique index on `code`

**Relationships**:
- One-to-Many with `words` (via `language_id`)

**Example Data**:
```sql
INSERT INTO languages (code, name) VALUES
('en', 'English'),
('vi', 'Vietnamese');
```

---

### 2. CefrLevel

**Table**: `cefr_levels`

**Description**: CEFR (Common European Framework of Reference) levels for vocabulary classification. Contains exactly 6 levels from A1 to C2.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Unique identifier for CEFR level |
| `code` | VARCHAR(5) | NOT NULL, UNIQUE | CEFR level code (A1, A2, B1, B2, C1, C2) |
| `group_name` | VARCHAR(50) | NOT NULL | CEFR group name (Basic User, Independent User, Proficient User) |
| `level_name` | VARCHAR(100) | NOT NULL | Level name (Beginner / Breakthrough, etc.) |
| `description` | TEXT | NULLABLE | Level description |

**Indexes**:
- Primary key on `id`
- Unique index on `code`

**Relationships**:
- One-to-Many with `translations` (via `cefr_level_id`)

**Example Data**:
```sql
INSERT INTO cefr_levels (code, group_name, level_name, description) VALUES
('A1', 'Basic User', 'Beginner / Breakthrough', 'Có thể hiểu và sử dụng các mẫu câu rất đơn giản, giao tiếp cơ bản.'),
('A2', 'Basic User', 'Elementary / Waystage', 'Có thể giao tiếp trong các tình huống quen thuộc, mô tả ngắn gọn về bản thân, gia đình, môi trường xung quanh.'),
('B1', 'Independent User', 'Intermediate / Threshold', 'Hiểu được các điểm chính của văn bản quen thuộc và xử lý được hầu hết tình huống khi đi du lịch.'),
('B2', 'Independent User', 'Upper Intermediate / Vantage', 'Hiểu ý chính của văn bản phức tạp, giao tiếp khá trôi chảy và tự nhiên với người bản ngữ.'),
('C1', 'Proficient User', 'Advanced / Effective Operational Proficiency', 'Hiểu được các văn bản dài, phức tạp và diễn đạt ý tưởng trôi chảy, linh hoạt.'),
('C2', 'Proficient User', 'Proficiency / Mastery', 'Hiểu dễ dàng hầu hết mọi thứ nghe hoặc đọc được, diễn đạt chính xác và tinh tế.');
```

---

### 3. Word

**Table**: `words`

**Description**: Vocabulary words in different languages. Simplified schema without concept_id, difficulty, is_primary, or is_active flags.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Unique identifier for word |
| `language_id` | INTEGER | NOT NULL, FOREIGN KEY → `languages.id` | Reference to language |
| `word_text` | VARCHAR(255) | NOT NULL | Word text (e.g., 'book', 'sách') |
| `phonetic` | VARCHAR(255) | NULLABLE | Phonetic transcription (e.g., 'bʊk') |
| `part_of_speech` | VARCHAR(50) | NULLABLE | Part of speech (noun, verb, adj, etc.) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes**:
- Primary key on `id`
- Index on `language_id` for language queries
- Index on `(word_text, language_id)` for text searches
- Index on `part_of_speech` for part of speech filtering

**Relationships**:
- Many-to-One with `languages` (via `language_id`)
- One-to-Many with `translations` (via `from_word_id` or `to_word_id`)
- One-to-Many with `examples` (via `word_id`)

**Example Data**:
```sql
INSERT INTO words (language_id, word_text, phonetic, part_of_speech) VALUES
(1, 'book', 'bʊk', 'noun'),
(2, 'sách', NULL, 'noun'),
(1, 'hello', 'həˈloʊ', 'interjection'),
(2, 'xin chào', NULL, 'interjection');
```

---

### 4. Translation

**Table**: `translations`

**Description**: Translation pairs between words in different languages, optionally associated with CEFR levels. Replaces the previous `word_cefr_levels` and `word_meanings` tables.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Unique identifier for translation |
| `from_word_id` | INTEGER | NOT NULL, FOREIGN KEY → `words.id` | Source word (EN or VI) |
| `to_word_id` | INTEGER | NOT NULL, FOREIGN KEY → `words.id` | Target word (VI or EN) |
| `cefr_level_id` | INTEGER | NULLABLE, FOREIGN KEY → `cefr_levels.id` | CEFR level (NULL if not determined) |
| `meaning_order` | INTEGER | NOT NULL, DEFAULT 1 | Meaning order (1, 2, 3...) for same word pair |
| `note` | VARCHAR(255) | NULLABLE | Short note about the meaning |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes**:
- Primary key on `id`
- Index on `from_word_id` for source word queries
- Index on `to_word_id` for target word queries
- Index on `cefr_level_id` for CEFR level filtering
- Index on `(from_word_id, to_word_id, cefr_level_id, meaning_order)` for unique meaning constraint

**Relationships**:
- Many-to-One with `words` (via `from_word_id`)
- Many-to-One with `words` (via `to_word_id`)
- Many-to-One with `cefr_levels` (via `cefr_level_id`)

**Example Data**:
```sql
INSERT INTO translations (from_word_id, to_word_id, cefr_level_id, meaning_order, note) VALUES
(1, 2, 1, 1, 'A book for reading'),  -- 'book' → 'sách' at A1 level
(3, 4, 1, 1, 'Greeting'),            -- 'hello' → 'xin chào' at A1 level
(1, 2, 2, 2, 'To book a reservation'); -- 'book' → 'sách' at A2 level (different meaning)
```

---

### 5. Example

**Table**: `examples`

**Description**: Example sentences or phrases using words, optionally associated with CEFR levels.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Unique identifier for example |
| `word_id` | INTEGER | NOT NULL, FOREIGN KEY → `words.id` | Reference to word |
| `example_text` | TEXT | NOT NULL | Example sentence or phrase |
| `translation_text` | TEXT | NULLABLE | Translation of the example |
| `cefr_level_id` | INTEGER | NULLABLE, FOREIGN KEY → `cefr_levels.id` | CEFR level (NULL if not specific) |
| `language_id` | INTEGER | NOT NULL, FOREIGN KEY → `languages.id` | Language of the example |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes**:
- Primary key on `id`
- Index on `word_id` for word queries
- Index on `cefr_level_id` for CEFR level filtering
- Index on `language_id` for language filtering

**Relationships**:
- Many-to-One with `words` (via `word_id`)
- Many-to-One with `cefr_levels` (via `cefr_level_id`)
- Many-to-One with `languages` (via `language_id`)

**Example Data**:
```sql
INSERT INTO examples (word_id, example_text, translation_text, cefr_level_id, language_id) VALUES
(1, 'I read a book every day', 'Tôi đọc sách mỗi ngày', 1, 1),  -- English example for 'book'
(1, 'This is a good book', 'Đây là một cuốn sách hay', 1, 1),  -- Another example
(2, 'Tôi đọc sách mỗi ngày', 'I read a book every day', 1, 2); -- Vietnamese example
```

---

### 6. GameSession (Updated)

**Table**: `game_sessions`

**Description**: Represents a vocabulary quiz game session. Updated to reference `cefr_level_id` instead of `level_id` or `vocab_level_id`.

**Fields** (Updated):

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `session_tag` | UUID | PRIMARY KEY | Unique session identifier |
| `user_id` | INTEGER | NOT NULL, FOREIGN KEY → `users.id` | Reference to user |
| `cefr_level_id` | INTEGER | NULLABLE, FOREIGN KEY → `cefr_levels.id` | Reference to CEFR level |
| `game_id` | INTEGER | NULLABLE, FOREIGN KEY → `games.id` | Reference to game |
| `translation_direction` | VARCHAR(10) | NULLABLE | Translation direction ('en-to-vi' or 'vi-to-en') |
| `total_score` | INTEGER | NOT NULL, DEFAULT 0 | Total session score |
| `correct_count` | INTEGER | NOT NULL, DEFAULT 0 | Number of correct answers |
| `incorrect_count` | INTEGER | NOT NULL, DEFAULT 0 | Number of incorrect answers |
| `accuracy_percentage` | DECIMAL(5,2) | NULLABLE | Accuracy percentage |
| `started_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Session start timestamp |
| `finished_at` | TIMESTAMP | NULLABLE | Session end timestamp |

**Indexes**:
- Primary key on `session_tag`
- Index on `user_id` for user history queries
- Index on `cefr_level_id` for level statistics
- Index on `game_id` for game statistics
- Index on `(user_id, started_at DESC)` for ordered history

**Relationships**:
- Many-to-One with `users` (via `user_id`)
- Many-to-One with `cefr_levels` (via `cefr_level_id`)
- Many-to-One with `games` (via `game_id`)
- One-to-Many with `plays` (via `session_tag`)

---

### 7. Play (Updated)

**Table**: `plays`

**Description**: Represents a single answer attempt in a vocabulary quiz session. Updated to support multiple-choice answers and reference translations.

**Fields** (Updated):

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | BIGSERIAL | PRIMARY KEY | Unique identifier for play |
| `user_id` | INTEGER | NOT NULL, FOREIGN KEY → `users.id` | Reference to user |
| `word_id` | INTEGER | NOT NULL, FOREIGN KEY → `words.id` | Reference to word |
| `session_tag` | UUID | NOT NULL, FOREIGN KEY → `game_sessions.session_tag` | Reference to game session |
| `translation_id` | INTEGER | NULLABLE, FOREIGN KEY → `translations.id` | Reference to translation used in question |
| `user_answer` | VARCHAR(255) | NOT NULL | User's selected answer (option a, b, c, or d) |
| `correct_answer` | VARCHAR(255) | NOT NULL | Correct answer option (a, b, c, or d) |
| `is_correct` | BOOLEAN | NOT NULL | Whether answer is correct |
| `score` | INTEGER | NOT NULL | Points awarded for this answer |
| `target` | INTEGER | NOT NULL, DEFAULT 0 | Target progress delta |
| `played_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Answer timestamp |

**Indexes**:
- Primary key on `id`
- Index on `session_tag` for session queries
- Index on `user_id` for user history queries
- Index on `(session_tag, played_at)` for ordered session plays
- Index on `translation_id` for translation tracking

**Relationships**:
- Many-to-One with `users` (via `user_id`)
- Many-to-One with `words` (via `word_id`)
- Many-to-One with `game_sessions` (via `session_tag`)
- Many-to-One with `translations` (via `translation_id`)

---

## Database Schema (PostgreSQL)

### Migration 005: Create languages Table

```sql
-- Up migration
CREATE TABLE IF NOT EXISTS languages (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL
);

CREATE INDEX idx_languages_code ON languages(code);

-- Down migration
DROP TABLE IF EXISTS languages;
```

### Migration 006: Create cefr_levels Table

```sql
-- Up migration
CREATE TABLE IF NOT EXISTS cefr_levels (
  id SERIAL PRIMARY KEY,
  code VARCHAR(5) NOT NULL UNIQUE,
  group_name VARCHAR(50) NOT NULL,
  level_name VARCHAR(100) NOT NULL,
  description TEXT
);

CREATE INDEX idx_cefr_levels_code ON cefr_levels(code);

-- Insert CEFR levels
INSERT INTO cefr_levels (code, group_name, level_name, description) VALUES
('A1', 'Basic User', 'Beginner / Breakthrough', 'Có thể hiểu và sử dụng các mẫu câu rất đơn giản, giao tiếp cơ bản.'),
('A2', 'Basic User', 'Elementary / Waystage', 'Có thể giao tiếp trong các tình huống quen thuộc, mô tả ngắn gọn về bản thân, gia đình, môi trường xung quanh.'),
('B1', 'Independent User', 'Intermediate / Threshold', 'Hiểu được các điểm chính của văn bản quen thuộc và xử lý được hầu hết tình huống khi đi du lịch.'),
('B2', 'Independent User', 'Upper Intermediate / Vantage', 'Hiểu ý chính của văn bản phức tạp, giao tiếp khá trôi chảy và tự nhiên với người bản ngữ.'),
('C1', 'Proficient User', 'Advanced / Effective Operational Proficiency', 'Hiểu được các văn bản dài, phức tạp và diễn đạt ý tưởng trôi chảy, linh hoạt.'),
('C2', 'Proficient User', 'Proficiency / Mastery', 'Hiểu dễ dàng hầu hết mọi thứ nghe hoặc đọc được, diễn đạt chính xác và tinh tế.');

-- Down migration
DELETE FROM cefr_levels;
DROP TABLE IF EXISTS cefr_levels;
```

### Migration 007: Update words Table

```sql
-- Up migration
-- Add new columns
ALTER TABLE words
ADD COLUMN language_id INT,
ADD COLUMN phonetic VARCHAR(255),
ADD COLUMN part_of_speech VARCHAR(50);

-- Migrate language_code to language_id
UPDATE words w
SET language_id = (
  SELECT id FROM languages WHERE code = w.language_code
)
WHERE language_code IN ('en', 'vi');

-- Make language_id NOT NULL after migration
ALTER TABLE words
ALTER COLUMN language_id SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE words
ADD CONSTRAINT fk_words_language
  FOREIGN KEY (language_id) REFERENCES languages(id);

-- Create indexes
CREATE INDEX idx_words_language ON words(language_id);
CREATE INDEX idx_words_text_lang ON words(word_text, language_id);
CREATE INDEX idx_words_part_of_speech ON words(part_of_speech);

-- Remove old columns (after data migration)
ALTER TABLE words
DROP COLUMN IF EXISTS concept_id,
DROP COLUMN IF EXISTS language_code,
DROP COLUMN IF EXISTS difficulty,
DROP COLUMN IF EXISTS is_primary,
DROP COLUMN IF EXISTS is_active;

-- Drop old indexes
DROP INDEX IF EXISTS ux_words_concept_lang_text;
DROP INDEX IF EXISTS ux_words_primary_per_lang;
DROP INDEX IF EXISTS idx_words_concept;
DROP INDEX IF EXISTS idx_words_lang;
DROP INDEX IF EXISTS idx_words_difficulty;

-- Down migration (reverse changes)
ALTER TABLE words
ADD COLUMN concept_id UUID,
ADD COLUMN language_code VARCHAR(10),
ADD COLUMN difficulty VARCHAR(20),
ADD COLUMN is_primary BOOLEAN DEFAULT FALSE,
ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

ALTER TABLE words
DROP COLUMN IF EXISTS language_id,
DROP COLUMN IF EXISTS phonetic,
DROP COLUMN IF EXISTS part_of_speech;
```

### Migration 008: Create translations Table

```sql
-- Up migration
CREATE TABLE IF NOT EXISTS translations (
  id SERIAL PRIMARY KEY,
  from_word_id INT NOT NULL,
  to_word_id INT NOT NULL,
  cefr_level_id INT,
  meaning_order INT NOT NULL DEFAULT 1,
  note VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_trans_from_word
    FOREIGN KEY (from_word_id) REFERENCES words(id) ON DELETE CASCADE,
  CONSTRAINT fk_trans_to_word
    FOREIGN KEY (to_word_id) REFERENCES words(id) ON DELETE CASCADE,
  CONSTRAINT fk_trans_cefr
    FOREIGN KEY (cefr_level_id) REFERENCES cefr_levels(id) ON DELETE SET NULL
);

CREATE INDEX idx_trans_from ON translations(from_word_id);
CREATE INDEX idx_trans_to ON translations(to_word_id);
CREATE INDEX idx_trans_cefr ON translations(cefr_level_id);
CREATE INDEX idx_trans_from_to_cefr_order ON translations(from_word_id, to_word_id, cefr_level_id, meaning_order);

-- Down migration
DROP TABLE IF EXISTS translations;
```

### Migration 009: Create examples Table

```sql
-- Up migration
CREATE TABLE IF NOT EXISTS examples (
  id SERIAL PRIMARY KEY,
  word_id INT NOT NULL,
  example_text TEXT NOT NULL,
  translation_text TEXT,
  cefr_level_id INT,
  language_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_examples_word
    FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE,
  CONSTRAINT fk_examples_cefr
    FOREIGN KEY (cefr_level_id) REFERENCES cefr_levels(id) ON DELETE SET NULL,
  CONSTRAINT fk_examples_language
    FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE RESTRICT
);

CREATE INDEX idx_examples_word ON examples(word_id);
CREATE INDEX idx_examples_cefr ON examples(cefr_level_id);
CREATE INDEX idx_examples_language ON examples(language_id);

-- Down migration
DROP TABLE IF EXISTS examples;
```

### Migration 010: Update game_sessions Table

```sql
-- Up migration
-- Add cefr_level_id column
ALTER TABLE game_sessions
ADD COLUMN cefr_level_id INT REFERENCES cefr_levels(id) ON DELETE SET NULL;

-- Add translation_direction column
ALTER TABLE game_sessions
ADD COLUMN translation_direction VARCHAR(10) CHECK (translation_direction IN ('en-to-vi', 'vi-to-en'));

-- Add statistics columns
ALTER TABLE game_sessions
ADD COLUMN correct_count INT NOT NULL DEFAULT 0,
ADD COLUMN incorrect_count INT NOT NULL DEFAULT 0,
ADD COLUMN accuracy_percentage DECIMAL(5,2);

-- Create index
CREATE INDEX idx_game_sessions_cefr_level ON game_sessions(cefr_level_id);

-- Migrate existing level_id to cefr_level_id (if levels table exists)
-- This is a placeholder - actual migration depends on existing data structure
-- UPDATE game_sessions gs
-- SET cefr_level_id = (
--   SELECT cl.id FROM cefr_levels cl
--   JOIN levels l ON ...
--   WHERE l.level_id = gs.level_id
-- );

-- Down migration
ALTER TABLE game_sessions
DROP COLUMN IF EXISTS cefr_level_id,
DROP COLUMN IF EXISTS translation_direction,
DROP COLUMN IF EXISTS correct_count,
DROP COLUMN IF EXISTS incorrect_count,
DROP COLUMN IF EXISTS accuracy_percentage;
```

### Migration 011: Update plays Table

```sql
-- Up migration
-- Rename play_id to id (if needed - PostgreSQL doesn't require this if using SERIAL)
-- Add translation_id column
ALTER TABLE plays
ADD COLUMN translation_id INT REFERENCES translations(id) ON DELETE SET NULL;

-- Add correct_answer column
ALTER TABLE plays
ADD COLUMN correct_answer VARCHAR(255);

-- Create index
CREATE INDEX idx_plays_translation ON plays(translation_id);

-- Update foreign key references to use 'id' instead of prefixed names
-- Note: This assumes users table also uses 'id' instead of 'user_id'
-- ALTER TABLE plays
-- DROP CONSTRAINT IF EXISTS plays_user_id_fkey,
-- ADD CONSTRAINT plays_user_id_fkey
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Down migration
ALTER TABLE plays
DROP COLUMN IF EXISTS translation_id,
DROP COLUMN IF EXISTS correct_answer;
```

### Migration 012: Remove Deprecated Tables

```sql
-- Up migration
-- Drop universe_index table
DROP TABLE IF EXISTS universe_index;

-- Drop word_cefr_levels table (if exists)
DROP TABLE IF EXISTS word_cefr_levels;

-- Drop word_meanings table (if exists)
DROP TABLE IF EXISTS word_meanings;

-- Drop game_levels table (if exists)
DROP TABLE IF EXISTS game_levels;

-- Note: vocab_levels table should also be dropped if it exists
DROP TABLE IF EXISTS vocab_levels;

-- Down migration
-- Recreate tables if needed for rollback (not recommended)
```

## Query Examples

### Get Words for Level A2 (Including A1) - English to Vietnamese

```sql
-- Get English words with Vietnamese translations for A2 level and below
SELECT DISTINCT w.id, w.word_text, w.phonetic, w.part_of_speech
FROM words w
JOIN translations t ON w.id = t.from_word_id
JOIN cefr_levels cl ON t.cefr_level_id = cl.id
JOIN languages l ON w.language_id = l.id
WHERE l.code = 'en'
AND cl.code IN ('A1', 'A2')
ORDER BY RANDOM()
LIMIT 20;
```

### Get Translations for Word at Specific CEFR Level

```sql
-- Get all translations for a word at a specific CEFR level
SELECT 
  t.id,
  w_from.word_text as from_word,
  w_to.word_text as to_word,
  cl.code as cefr_level,
  t.meaning_order,
  t.note
FROM translations t
JOIN words w_from ON t.from_word_id = w_from.id
JOIN words w_to ON t.to_word_id = w_to.id
LEFT JOIN cefr_levels cl ON t.cefr_level_id = cl.id
WHERE w_from.id = $word_id
AND (cl.code = $cefr_level OR cl.code IS NULL)
ORDER BY t.meaning_order;
```

### Get Multiple-Choice Options for Question

```sql
-- Get correct translation and 3 distractors for a multiple-choice question
WITH correct_translation AS (
  SELECT t.to_word_id, t.cefr_level_id
  FROM translations t
  WHERE t.id = $translation_id
),
distractors AS (
  SELECT DISTINCT t.to_word_id
  FROM translations t
  JOIN correct_translation ct ON t.cefr_level_id = ct.cefr_level_id
  WHERE t.to_word_id != ct.to_word_id
  ORDER BY RANDOM()
  LIMIT 3
)
SELECT w.word_text, 'correct' as type
FROM words w
JOIN correct_translation ct ON w.id = ct.to_word_id
UNION ALL
SELECT w.word_text, 'distractor' as type
FROM words w
JOIN distractors d ON w.id = d.to_word_id;
```

### Calculate Session Statistics

```sql
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

### Get Examples for Word at CEFR Level

```sql
-- Get examples for a word at a specific CEFR level
SELECT 
  e.id,
  e.example_text,
  e.translation_text,
  cl.code as cefr_level,
  l.code as language_code
FROM examples e
JOIN words w ON e.word_id = w.id
LEFT JOIN cefr_levels cl ON e.cefr_level_id = cl.id
JOIN languages l ON e.language_id = l.id
WHERE w.id = $word_id
AND (cl.code = $cefr_level OR cl.code IS NULL)
ORDER BY e.created_at;
```

## Validation Rules

1. **CEFR Level**: `code` must be one of: A1, A2, B1, B2, C1, C2 (exactly 6 records)
2. **Language**: `code` must be 'en' or 'vi' (exactly 2 records)
3. **Translation**: `from_word_id` and `to_word_id` must reference different words
4. **Translation**: `meaning_order` must be >= 1 for same word pair and CEFR level
5. **Game Session**: `translation_direction` must be 'en-to-vi' or 'vi-to-en'
6. **Play**: `user_answer` and `correct_answer` must be 'a', 'b', 'c', or 'd'
7. **Example**: `example_text` cannot be empty
8. **Word**: `word_text` must be unique per language (can have same text in different languages)

## Indexes for Performance

- `languages`: Index on `code` for language lookups
- `cefr_levels`: Index on `code` for level lookups
- `words`: Index on `language_id`, `(word_text, language_id)`, `part_of_speech` for word queries
- `translations`: Index on `from_word_id`, `to_word_id`, `cefr_level_id` for translation queries
- `examples`: Index on `word_id`, `cefr_level_id`, `language_id` for example queries
- `game_sessions`: Index on `cefr_level_id`, `user_id` for statistics queries
- `plays`: Index on `session_tag`, `translation_id` for answer tracking

## Migration Notes

### Breaking Changes

1. **Removed Tables**:
   - `vocab_levels` (replaced by `cefr_levels`)
   - `word_cefr_levels` (replaced by `translations`)
   - `word_meanings` (replaced by `translations`)
   - `universe_index` (no longer needed)
   - `game_levels` (no longer needed)

2. **Removed Fields**:
   - `words.concept_id` (no longer needed)
   - `words.language_code` (replaced by `language_id`)
   - `words.difficulty` (replaced by CEFR levels in translations)
   - `words.is_primary` (replaced by `meaning_order` in translations)
   - `words.is_active` (no longer needed)
   - `scoring_config` from all level-related tables

3. **Renamed Fields**:
   - All `*_id` fields renamed to `id` (e.g., `word_id` → `id`, `vocab_level_id` → `id`)
   - `game_sessions.vocab_level_id` → `cefr_level_id`
   - `plays.word_meaning_id` → `translation_id`

4. **New Tables**:
   - `languages` (language reference)
   - `cefr_levels` (CEFR level reference)
   - `translations` (word translations with CEFR levels)
   - `examples` (example sentences)

### Data Migration Strategy

1. **Migrate Languages**: Create `languages` table and insert 'en' and 'vi'
2. **Migrate CEFR Levels**: Create `cefr_levels` table and insert 6 levels (A1-C2)
3. **Migrate Words**: Update `words` table to use `language_id` instead of `language_code`
4. **Migrate Translations**: Create `translations` table from existing word relationships
5. **Migrate Game Sessions**: Update `game_sessions` to use `cefr_level_id`
6. **Migrate Plays**: Update `plays` to use `translation_id`
7. **Clean Up**: Remove deprecated tables and columns
