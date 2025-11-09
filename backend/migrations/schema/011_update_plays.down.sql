-- Down migration: Revert plays table changes

DROP INDEX IF EXISTS idx_plays_translation;

ALTER TABLE plays
DROP CONSTRAINT IF EXISTS fk_plays_translation;

ALTER TABLE plays
DROP COLUMN IF EXISTS translation_id,
DROP COLUMN IF EXISTS correct_answer;

