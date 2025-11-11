-- Combined Schema Migration
-- This file contains all table definitions for the final database schema
-- =========================
-- USERS
-- =========================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- =========================
-- LANGUAGES
-- =========================
CREATE TABLE IF NOT EXISTS languages (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL
);
CREATE INDEX idx_languages_code ON languages(code);
-- =========================
-- CEFR LEVELS
-- =========================
CREATE TABLE IF NOT EXISTS cefr_levels (
  id SERIAL PRIMARY KEY,
  code VARCHAR(5) NOT NULL UNIQUE,
  group_name VARCHAR(50) NOT NULL,
  level_name VARCHAR(100) NOT NULL,
  description TEXT
);
CREATE INDEX idx_cefr_levels_code ON cefr_levels(code);
-- =========================
-- WORDS
-- =========================
CREATE TABLE IF NOT EXISTS words (
  id SERIAL PRIMARY KEY,
  word_text VARCHAR(100) NOT NULL,
  language_id INT NOT NULL,
  phonetic VARCHAR(255),
  part_of_speech VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_words_language FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE RESTRICT
);
CREATE INDEX idx_words_language ON words(language_id);
CREATE INDEX idx_words_text_lang ON words(word_text, language_id);
CREATE INDEX idx_words_part_of_speech ON words(part_of_speech);
-- =========================
-- TRANSLATIONS
-- =========================
CREATE TABLE IF NOT EXISTS translations (
  id SERIAL PRIMARY KEY,
  from_word_id INT NOT NULL,
  to_word_id INT NOT NULL,
  cefr_level_id INT,
  meaning_order INT NOT NULL DEFAULT 1,
  note VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_trans_from_word FOREIGN KEY (from_word_id) REFERENCES words(id) ON DELETE CASCADE,
  CONSTRAINT fk_trans_to_word FOREIGN KEY (to_word_id) REFERENCES words(id) ON DELETE CASCADE,
  CONSTRAINT fk_trans_cefr FOREIGN KEY (cefr_level_id) REFERENCES cefr_levels(id) ON DELETE
  SET NULL
);
CREATE INDEX idx_trans_from ON translations(from_word_id);
CREATE INDEX idx_trans_to ON translations(to_word_id);
CREATE INDEX idx_trans_cefr ON translations(cefr_level_id);
CREATE INDEX idx_trans_from_to_cefr_order ON translations(
  from_word_id,
  to_word_id,
  cefr_level_id,
  meaning_order
);
-- =========================
-- EXAMPLES
-- =========================
CREATE TABLE IF NOT EXISTS examples (
  id SERIAL PRIMARY KEY,
  word_id INT NOT NULL,
  example_text TEXT NOT NULL,
  translation_text TEXT,
  cefr_level_id INT,
  language_id INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_examples_word FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE,
  CONSTRAINT fk_examples_cefr FOREIGN KEY (cefr_level_id) REFERENCES cefr_levels(id) ON DELETE
  SET NULL,
    CONSTRAINT fk_examples_language FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE RESTRICT
);
CREATE INDEX idx_examples_word ON examples(word_id);
CREATE INDEX idx_examples_cefr ON examples(cefr_level_id);
CREATE INDEX idx_examples_language ON examples(language_id);
-- =========================
-- GAMES
-- =========================
CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE CHECK (code ~ '^[a-z0-9-]+$'),
  name VARCHAR(100) NOT NULL CHECK (LENGTH(TRIM(name)) >= 1),
  description TEXT NOT NULL CHECK (
    LENGTH(description) BETWEEN 10 AND 500
  ),
  icon_path VARCHAR(255) CHECK (
    icon_path IS NULL
    OR icon_path ~ '^/games/[a-z0-9-]+\.(svg|png|jpg|webp)$'
  ),
  category VARCHAR(50),
  display_order INT NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_games_active_order ON games(is_active, display_order)
WHERE is_active = TRUE;
CREATE INDEX idx_games_category ON games(category)
WHERE category IS NOT NULL;
-- =========================
-- VOCAB GAME SESSIONS
-- =========================
CREATE TABLE IF NOT EXISTS vocab_game_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE RESTRICT,
  cefr_level_id INTEGER NOT NULL REFERENCES cefr_levels(id) ON DELETE RESTRICT,
  from_language_id INTEGER NOT NULL REFERENCES languages(id) ON DELETE RESTRICT,
  to_language_id INTEGER NOT NULL REFERENCES languages(id) ON DELETE RESTRICT,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);
CREATE INDEX idx_vocab_game_sessions_user ON vocab_game_sessions(user_id);
CREATE INDEX idx_vocab_game_sessions_game ON vocab_game_sessions(game_id);
CREATE INDEX idx_vocab_game_sessions_cefr_level ON vocab_game_sessions(cefr_level_id);
CREATE INDEX idx_vocab_game_sessions_started ON vocab_game_sessions(started_at DESC);
-- =========================
-- VOCAB GAME SESSION QUESTIONS
-- =========================
CREATE TABLE IF NOT EXISTS vocab_game_session_questions (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES vocab_game_sessions(id) ON DELETE CASCADE,
  question_no INTEGER NOT NULL,
  translation_id INTEGER NOT NULL REFERENCES translations(id) ON DELETE RESTRICT,
  option_a_translation_id INTEGER NOT NULL REFERENCES translations(id) ON DELETE RESTRICT,
  option_b_translation_id INTEGER NOT NULL REFERENCES translations(id) ON DELETE RESTRICT,
  option_c_translation_id INTEGER NOT NULL REFERENCES translations(id) ON DELETE RESTRICT,
  option_d_translation_id INTEGER NOT NULL REFERENCES translations(id) ON DELETE RESTRICT,
  correct_option CHAR(1) NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  UNIQUE(session_id, question_no)
);
CREATE INDEX idx_vocab_session_questions_session ON vocab_game_session_questions(session_id);
CREATE INDEX idx_vocab_session_questions_translation ON vocab_game_session_questions(translation_id);
-- =========================
-- VOCAB GAME SESSION ANSWERS
-- =========================
CREATE TABLE IF NOT EXISTS vocab_game_session_answers (
  id SERIAL PRIMARY KEY,
  session_question_id INTEGER NOT NULL REFERENCES vocab_game_session_questions(id) ON DELETE CASCADE,
  chosen_option CHAR(1) NOT NULL CHECK (chosen_option IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  time_spent_ms INTEGER
);
CREATE INDEX idx_vocab_session_answers_question ON vocab_game_session_answers(session_question_id);
CREATE INDEX idx_vocab_session_answers_answered_at ON vocab_game_session_answers(answered_at DESC);
-- =========================
-- VOCAB USER WORD STATS
-- =========================
CREATE TABLE IF NOT EXISTS vocab_user_word_stats (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word_id INTEGER NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  times_seen INTEGER NOT NULL DEFAULT 0,
  times_correct INTEGER NOT NULL DEFAULT 0,
  last_seen_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, word_id)
);
CREATE INDEX idx_vocab_user_word_stats_user ON vocab_user_word_stats(user_id);
CREATE INDEX idx_vocab_user_word_stats_word ON vocab_user_word_stats(word_id);
CREATE INDEX idx_vocab_user_word_stats_last_seen ON vocab_user_word_stats(last_seen_at DESC);
-- =========================
-- USER PROFILES
-- =========================
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name VARCHAR(100),
  avatar_url VARCHAR(255),
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- =========================
-- USER ACTIVITY LOGS
-- =========================
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_user_activity_user ON user_activity_logs(user_id);
CREATE INDEX idx_user_activity_created_at ON user_activity_logs(created_at DESC);