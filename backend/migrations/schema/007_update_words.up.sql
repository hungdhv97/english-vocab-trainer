-- Up migration: Update words table

-- Add new columns
ALTER TABLE words
ADD COLUMN IF NOT EXISTS language_id INT,
ADD COLUMN IF NOT EXISTS phonetic VARCHAR(255),
ADD COLUMN IF NOT EXISTS part_of_speech VARCHAR(50);

-- Migrate language_code to language_id
-- Note: This requires languages table to be populated first (run data migration 004_seed_languages first)
UPDATE words w
SET language_id = (
  SELECT id FROM languages WHERE code = w.language_code
)
WHERE language_code IN ('en', 'vi')
  AND EXISTS (SELECT 1 FROM languages WHERE code = w.language_code);

-- Make language_id NOT NULL after migration (only if all rows were migrated)
-- If some rows don't have language_id, set them to a default or handle separately
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM words WHERE language_id IS NULL AND language_code IN ('en', 'vi')) THEN
    ALTER TABLE words ALTER COLUMN language_id SET NOT NULL;
  END IF;
END $$;

-- Add foreign key constraint
ALTER TABLE words
DROP CONSTRAINT IF EXISTS fk_words_language;

ALTER TABLE words
ADD CONSTRAINT fk_words_language
  FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE RESTRICT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_words_language ON words(language_id);
CREATE INDEX IF NOT EXISTS idx_words_text_lang ON words(word_text, language_id);
CREATE INDEX IF NOT EXISTS idx_words_part_of_speech ON words(part_of_speech);

-- Remove old columns (after data migration is complete)
-- Note: These will be dropped in a later migration after data is fully migrated
ALTER TABLE words
DROP COLUMN IF EXISTS concept_id,
DROP COLUMN IF EXISTS language_code,
DROP COLUMN IF EXISTS difficulty,
DROP COLUMN IF EXISTS is_primary,
DROP COLUMN IF EXISTS is_active;

-- Drop old indexes that are no longer needed
-- Note: These will be dropped in a later migration after data is fully migrated
DROP INDEX IF EXISTS ux_words_concept_lang_text;
DROP INDEX IF EXISTS ux_words_primary_per_lang;
DROP INDEX IF EXISTS idx_words_concept;
DROP INDEX IF EXISTS idx_words_lang;
DROP INDEX IF EXISTS idx_words_difficulty;

