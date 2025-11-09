-- Down migration: Revert words language_id migration

-- Set language_id back to NULL
ALTER TABLE words ALTER COLUMN language_id DROP NOT NULL;

-- Update words to clear language_id (language_code should still exist)
UPDATE words SET language_id = NULL;

