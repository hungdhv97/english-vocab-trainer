-- Up migration: Update game_sessions table

-- Add cefr_level_id column
ALTER TABLE game_sessions
ADD COLUMN IF NOT EXISTS cefr_level_id INT;

ALTER TABLE game_sessions
ADD CONSTRAINT fk_game_sessions_cefr_level
  FOREIGN KEY (cefr_level_id) REFERENCES cefr_levels(id) ON DELETE SET NULL;

-- Add translation_direction column
ALTER TABLE game_sessions
ADD COLUMN IF NOT EXISTS translation_direction VARCHAR(10);

-- Add check constraint for translation_direction
ALTER TABLE game_sessions
DROP CONSTRAINT IF EXISTS chk_game_sessions_translation_direction;

ALTER TABLE game_sessions
ADD CONSTRAINT chk_game_sessions_translation_direction
  CHECK (translation_direction IS NULL OR translation_direction IN ('en-to-vi', 'vi-to-en'));

-- Add statistics columns
ALTER TABLE game_sessions
ADD COLUMN IF NOT EXISTS correct_count INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS incorrect_count INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS accuracy_percentage DECIMAL(5,2);

-- Create index
CREATE INDEX IF NOT EXISTS idx_game_sessions_cefr_level ON game_sessions(cefr_level_id);

-- Note: Migration of existing level_id to cefr_level_id will be handled in data migration 008_migrate_game_sessions

