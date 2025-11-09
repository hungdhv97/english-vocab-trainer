-- Down migration: Revert words table changes

-- Drop new indexes
DROP INDEX IF EXISTS idx_words_part_of_speech;
DROP INDEX IF EXISTS idx_words_text_lang;
DROP INDEX IF EXISTS idx_words_language;

-- Drop foreign key constraint
ALTER TABLE words
DROP CONSTRAINT IF EXISTS fk_words_language;

-- Remove new columns
ALTER TABLE words
DROP COLUMN IF EXISTS language_id,
DROP COLUMN IF EXISTS phonetic,
DROP COLUMN IF EXISTS part_of_speech;

