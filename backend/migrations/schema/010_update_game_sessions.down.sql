-- Down migration: Revert game_sessions table changes

DROP INDEX IF EXISTS idx_game_sessions_cefr_level;

ALTER TABLE game_sessions
DROP CONSTRAINT IF EXISTS chk_game_sessions_translation_direction;

ALTER TABLE game_sessions
DROP CONSTRAINT IF EXISTS fk_game_sessions_cefr_level;

ALTER TABLE game_sessions
DROP COLUMN IF EXISTS cefr_level_id,
DROP COLUMN IF EXISTS translation_direction,
DROP COLUMN IF EXISTS correct_count,
DROP COLUMN IF EXISTS incorrect_count,
DROP COLUMN IF EXISTS accuracy_percentage;
