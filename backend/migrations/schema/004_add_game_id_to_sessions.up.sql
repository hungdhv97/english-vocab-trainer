-- Up migration: add game_id column to game_sessions table

-- Step 1: Add game_id column as NULLABLE (for backward compatibility during migration)
-- Note: After migration 005, games.game_id will be renamed to games.id
-- This migration should run before 005, so it uses game_id
-- After 005 runs, the foreign key will be updated to reference games.id
ALTER TABLE game_sessions 
  ADD COLUMN IF NOT EXISTS game_id INT;

-- Step 2: Backfill game_id from level_id via game_levels junction table
-- This assumes that game_levels mapping has been populated by data migration 0003_seed_games
-- Note: After migration 005 runs, games.game_id will be renamed to games.id,
-- but game_levels.game_id column name stays the same (only the FK reference changes)
UPDATE game_sessions gs
SET game_id = gl.game_id
FROM game_levels gl
WHERE gs.level_id = gl.level_id
  AND gs.game_id IS NULL;

-- Step 3: Make game_id NOT NULL after backfill completes
-- Note: This will fail if there are sessions with level_ids that don't have game mappings
-- In that case, those sessions need to be handled (either deleted or mapped) before running this
ALTER TABLE game_sessions 
  ALTER COLUMN game_id SET NOT NULL;

-- Step 4: Add index for leaderboard queries
-- This composite index optimizes the window function query for top 10 leaderboard
CREATE INDEX IF NOT EXISTS idx_game_sessions_game_finished_score 
  ON game_sessions(game_id, finished_at, total_score) 
  WHERE finished_at IS NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN game_sessions.game_id IS 'Reference to parent game (for leaderboard aggregation)';

