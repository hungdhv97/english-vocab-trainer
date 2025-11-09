-- Down migration: Drop vocab game tables

-- Drop indexes first
DROP INDEX IF EXISTS idx_vocab_user_word_stats_last_seen;
DROP INDEX IF EXISTS idx_vocab_user_word_stats_word;
DROP INDEX IF EXISTS idx_vocab_user_word_stats_user;
DROP INDEX IF EXISTS idx_vocab_session_answers_answered_at;
DROP INDEX IF EXISTS idx_vocab_session_answers_question;
DROP INDEX IF EXISTS idx_vocab_session_questions_translation;
DROP INDEX IF EXISTS idx_vocab_session_questions_session;
DROP INDEX IF EXISTS idx_vocab_game_sessions_started;
DROP INDEX IF EXISTS idx_vocab_game_sessions_cefr_level;
DROP INDEX IF EXISTS idx_vocab_game_sessions_game;
DROP INDEX IF EXISTS idx_vocab_game_sessions_user;

-- Drop tables (CASCADE will handle foreign keys)
DROP TABLE IF EXISTS vocab_user_word_stats CASCADE;
DROP TABLE IF EXISTS vocab_game_session_answers CASCADE;
DROP TABLE IF EXISTS vocab_game_session_questions CASCADE;
DROP TABLE IF EXISTS vocab_game_sessions CASCADE;

