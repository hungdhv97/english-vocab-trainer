-- Down migration: remove game_id column from game_sessions table

-- Drop the index first
DROP INDEX IF EXISTS idx_game_sessions_game_finished_score;

-- Remove the game_id column
ALTER TABLE game_sessions 
  DROP COLUMN IF EXISTS game_id;

