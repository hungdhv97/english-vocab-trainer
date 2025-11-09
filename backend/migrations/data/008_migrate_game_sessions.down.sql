-- Down migration: Revert game_sessions cefr_level_id migration

-- Clear cefr_level_id (level_id should still exist in old sessions)
UPDATE game_sessions SET cefr_level_id = NULL;

