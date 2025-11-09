-- Up migration: Migrate words language_code to language_id

-- This migration assumes languages table is already populated (from 004_seed_languages)
-- Update words to set language_id based on language_code
UPDATE words w
SET language_id = (
  SELECT id FROM languages WHERE code = w.language_code
)
WHERE language_code IN ('en', 'vi')
  AND EXISTS (SELECT 1 FROM languages WHERE code = w.language_code)
  AND w.language_id IS NULL;

-- Set language_id to NOT NULL if all rows have been migrated
-- This should be safe if the schema migration 007 already handled this
-- But we ensure it here as well
DO $$
BEGIN
  -- Check if there are any words without language_id that have valid language_code
  IF NOT EXISTS (
    SELECT 1 FROM words 
    WHERE language_id IS NULL 
    AND language_code IN ('en', 'vi')
    AND EXISTS (SELECT 1 FROM languages WHERE code = words.language_code)
  ) THEN
    -- All valid language_code values have been migrated
    -- Make language_id NOT NULL if it's not already
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'words' 
      AND column_name = 'language_id' 
      AND is_nullable = 'YES'
    ) THEN
      ALTER TABLE words ALTER COLUMN language_id SET NOT NULL;
    END IF;
  END IF;
END $$;

