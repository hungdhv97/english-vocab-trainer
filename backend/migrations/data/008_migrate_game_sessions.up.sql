-- Up migration: Migrate game_sessions level_id to cefr_level_id

-- This migration migrates existing game_sessions from level_id to cefr_level_id
-- Strategy:
-- 1. If levels table exists and has a mapping to cefr_levels, use that
-- 2. Otherwise, set cefr_level_id to NULL (old sessions won't have CEFR level)

-- Option 1: If there's a direct mapping between levels and cefr_levels via code
-- This assumes levels.code matches cefr_levels.code (e.g., both have 'A1', 'A2', etc.)
-- Note: After migration 005, levels.level_id is renamed to levels.id
UPDATE game_sessions gs
SET cefr_level_id = (
  SELECT cl.id 
  FROM cefr_levels cl
  JOIN levels l ON l.code = cl.code
  WHERE l.id = gs.level_id
  LIMIT 1
)
WHERE gs.level_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM levels l
    JOIN cefr_levels cl ON l.code = cl.code
    WHERE l.id = gs.level_id
  )
  AND gs.cefr_level_id IS NULL;

-- Note: If levels table doesn't have matching codes with cefr_levels,
-- the cefr_level_id will remain NULL for old sessions
-- This is acceptable as old sessions are historical data

