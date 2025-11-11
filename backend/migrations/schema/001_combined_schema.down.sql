-- Combined Schema Migration - Rollback
-- This file drops all tables in reverse order of dependencies
DROP TABLE IF EXISTS vocab_user_word_stats CASCADE;
DROP TABLE IF EXISTS vocab_game_session_answers CASCADE;
DROP TABLE IF EXISTS vocab_game_session_questions CASCADE;
DROP TABLE IF EXISTS vocab_game_sessions CASCADE;
DROP TABLE IF EXISTS examples CASCADE;
DROP TABLE IF EXISTS translations CASCADE;
DROP TABLE IF EXISTS words CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS cefr_levels CASCADE;
DROP TABLE IF EXISTS languages CASCADE;
DROP TABLE IF EXISTS user_activity_logs CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;