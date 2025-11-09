-- Up migration: Drop old tables (game_sessions, levels, plays) and related structures

-- Drop foreign key constraints that reference these tables first
ALTER TABLE IF EXISTS game_levels DROP CONSTRAINT IF EXISTS game_levels_level_id_fkey;
ALTER TABLE IF EXISTS plays DROP CONSTRAINT IF EXISTS plays_session_tag_fkey;

-- Drop indexes on tables to be removed
DROP INDEX IF EXISTS idx_sessions_user;
DROP INDEX IF EXISTS idx_sessions_level;
DROP INDEX IF EXISTS idx_sessions_user_started;
DROP INDEX IF EXISTS idx_game_sessions_game_finished_score;
DROP INDEX IF EXISTS idx_game_sessions_game_finished;
DROP INDEX IF EXISTS idx_game_sessions_cefr_level;
DROP INDEX IF EXISTS idx_plays_session_tag;
DROP INDEX IF EXISTS idx_plays_user_time;
DROP INDEX IF EXISTS idx_plays_session_time;

-- Drop tables
DROP TABLE IF EXISTS plays CASCADE;
DROP TABLE IF EXISTS game_sessions CASCADE;
DROP TABLE IF EXISTS game_levels CASCADE;
DROP TABLE IF EXISTS levels CASCADE;

