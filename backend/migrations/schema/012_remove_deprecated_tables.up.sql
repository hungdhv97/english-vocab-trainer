-- Up migration: Remove deprecated tables

-- Drop universe_index table (if exists)
DROP TABLE IF EXISTS universe_index;

-- Drop word_cefr_levels table (if exists)
DROP TABLE IF EXISTS word_cefr_levels;

-- Drop word_meanings table (if exists)
DROP TABLE IF EXISTS word_meanings;

-- Drop game_levels table (if exists)
DROP TABLE IF EXISTS game_levels;

-- Drop vocab_levels table (if exists)
DROP TABLE IF EXISTS vocab_levels;

-- Note: We keep the old levels table for now as it might still be referenced
-- It will be deprecated but not dropped to maintain backward compatibility
-- The old words table columns (concept_id, language_code, difficulty, is_primary, is_active)
-- will be removed in a separate migration after data migration is complete

