-- Up migration: create initial schema

-- =========================
-- USERS
-- =========================
CREATE TABLE IF NOT EXISTS users (
  user_id       SERIAL        PRIMARY KEY,
  username      VARCHAR(50)   NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- =========================
-- LEVELS
-- =========================
CREATE TABLE IF NOT EXISTS levels (
  level_id       SERIAL        PRIMARY KEY,
  code           VARCHAR(50)   NOT NULL UNIQUE,
  name           VARCHAR(100)  NOT NULL,
  description    TEXT,
  difficulty     VARCHAR(20)   NOT NULL,
  scoring_config JSONB         NOT NULL,
  is_active      BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- =========================
-- WORDS
-- =========================
CREATE TABLE IF NOT EXISTS words (
  word_id       SERIAL        PRIMARY KEY,
  concept_id    UUID          NOT NULL,
  language_code VARCHAR(10)   NOT NULL,
  word_text     VARCHAR(100)  NOT NULL,
  difficulty    VARCHAR(20)   NOT NULL,
  is_primary    BOOLEAN       NOT NULL DEFAULT FALSE,
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- Tránh trùng chính tả trong cùng concept/ngôn ngữ
CREATE UNIQUE INDEX IF NOT EXISTS ux_words_concept_lang_text
  ON words(concept_id, language_code, word_text);

-- Tối đa 1 bản dịch "chính" cho mỗi concept/ngôn ngữ
CREATE UNIQUE INDEX IF NOT EXISTS ux_words_primary_per_lang
  ON words(concept_id, language_code) WHERE is_primary = true;

-- Gợi ý index bổ sung
CREATE INDEX IF NOT EXISTS idx_words_concept     ON words(concept_id);
CREATE INDEX IF NOT EXISTS idx_words_lang        ON words(language_code);
CREATE INDEX IF NOT EXISTS idx_words_difficulty  ON words(difficulty);

-- =========================
-- GAME_SESSIONS
-- =========================
CREATE TABLE IF NOT EXISTS game_sessions (
  session_tag   UUID          PRIMARY KEY,
  user_id       INT           NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  level_id      INT           REFERENCES levels(level_id),
  total_score   INT           NOT NULL DEFAULT 0,
  started_at    TIMESTAMP     NOT NULL DEFAULT NOW(),
  finished_at   TIMESTAMP
);

-- Gợi ý index sẵn có
CREATE INDEX IF NOT EXISTS idx_sessions_user   ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_level  ON game_sessions(level_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_started
  ON game_sessions(user_id, started_at DESC);

-- =========================
-- PLAYS
-- =========================
CREATE TABLE IF NOT EXISTS plays (
  play_id       BIGSERIAL     PRIMARY KEY,
  user_id       INT           NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  word_id       INT           NOT NULL REFERENCES words(word_id) ON DELETE CASCADE,
  session_tag   UUID          NOT NULL REFERENCES game_sessions(session_tag) ON DELETE CASCADE,
  user_answer   VARCHAR(255)  NOT NULL,
  is_correct    BOOLEAN       NOT NULL,
  score         INT           NOT NULL,
  target        INT           NOT NULL DEFAULT 0,
  played_at     TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- Gợi ý index sẵn có
CREATE INDEX IF NOT EXISTS idx_plays_session_tag ON plays(session_tag);

CREATE INDEX IF NOT EXISTS idx_plays_user_time
  ON plays(user_id, played_at DESC);

CREATE INDEX IF NOT EXISTS idx_plays_session_time
  ON plays(session_tag, played_at);
