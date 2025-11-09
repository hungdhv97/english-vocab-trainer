-- Down migration: Restore total_score column to game_sessions table

-- Drop the new index
DROP INDEX IF EXISTS idx_game_sessions_game_finished;

-- Add total_score column back
ALTER TABLE game_sessions 
  ADD COLUMN IF NOT EXISTS total_score INT NOT NULL DEFAULT 0;

-- Recreate the original index with total_score
CREATE INDEX IF NOT EXISTS idx_game_sessions_game_finished_score 
  ON game_sessions(game_id, finished_at, total_score) 
  WHERE finished_at IS NOT NULL;

