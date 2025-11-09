-- Up migration: Remove total_score column from game_sessions table

-- Drop index that includes total_score
DROP INDEX IF EXISTS idx_game_sessions_game_finished_score;

-- Remove total_score column
ALTER TABLE game_sessions 
  DROP COLUMN IF EXISTS total_score;

-- Recreate index without total_score
CREATE INDEX IF NOT EXISTS idx_game_sessions_game_finished 
  ON game_sessions(game_id, finished_at) 
  WHERE finished_at IS NOT NULL;

