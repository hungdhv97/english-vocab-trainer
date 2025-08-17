-- Up migration: create initial schema
-- 1. Bảng users: thông tin người chơi, có thêm password_hash
CREATE TABLE IF NOT EXISTS users (
  user_id        SERIAL      PRIMARY KEY,
  username       VARCHAR(50) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  created_at     TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- 2. Bảng words: kết hợp từ gốc và bản dịch, không còn definition
CREATE TABLE IF NOT EXISTS words (
  word_id        SERIAL       PRIMARY KEY,
  concept_id     UUID         NOT NULL,
  language_code  VARCHAR(10)  NOT NULL,
  word_text      VARCHAR(100) NOT NULL,
  difficulty     VARCHAR(20)  NOT NULL,
  is_primary     BOOLEAN      NOT NULL DEFAULT FALSE
);

-- Thêm unique hạt mịn hơn để tránh trùng chính tả trong cùng concept/ngôn ngữ
CREATE UNIQUE INDEX IF NOT EXISTS ux_words_concept_lang_text ON words(concept_id, language_code, word_text);

-- Đảm bảo tối đa 1 bản dịch "chính" cho mỗi concept/ngôn ngữ
CREATE UNIQUE INDEX IF NOT EXISTS ux_words_primary_per_lang ON words(concept_id, language_code) WHERE is_primary = true;

-- 3. Bảng plays: ghi lại mỗi lượt hỏi–đáp, thêm user_answer, gom session bằng UUID
CREATE TABLE IF NOT EXISTS plays (
  play_id       BIGSERIAL     PRIMARY KEY,
  user_id       INT           NOT NULL REFERENCES users(user_id)    ON DELETE CASCADE,
  word_id       INT           NOT NULL REFERENCES words(word_id)    ON DELETE CASCADE,
  user_answer   VARCHAR(255)  NOT NULL,
  is_correct    BOOLEAN       NOT NULL,
  response_time INT,
  earned_score  INT           NOT NULL,
  played_at     TIMESTAMP     NOT NULL DEFAULT NOW(),
  session_tag   UUID          NOT NULL
);

-- 4. Indexes gợi ý để tăng tốc truy vấn
CREATE INDEX IF NOT EXISTS idx_words_concept     ON words(concept_id);
CREATE INDEX IF NOT EXISTS idx_words_lang        ON words(language_code);
CREATE INDEX IF NOT EXISTS idx_words_difficulty  ON words(difficulty);
CREATE INDEX IF NOT EXISTS idx_plays_session_tag ON plays(session_tag);
