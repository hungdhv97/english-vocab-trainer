-- Up migration: Create new vocab game tables

-- Create vocab_game_sessions table
CREATE TABLE IF NOT EXISTS vocab_game_sessions (
    id                SERIAL PRIMARY KEY,
    user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id           INTEGER NOT NULL REFERENCES games(id) ON DELETE RESTRICT,
    cefr_level_id     INTEGER NOT NULL REFERENCES cefr_levels(id) ON DELETE RESTRICT,
    from_language_id  INTEGER NOT NULL REFERENCES languages(id) ON DELETE RESTRICT,
    to_language_id    INTEGER NOT NULL REFERENCES languages(id) ON DELETE RESTRICT,
    total_questions   INTEGER NOT NULL,
    correct_answers   INTEGER NOT NULL DEFAULT 0,
    started_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    finished_at       TIMESTAMP
);

-- Create indexes for vocab_game_sessions
CREATE INDEX IF NOT EXISTS idx_vocab_game_sessions_user ON vocab_game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_vocab_game_sessions_game ON vocab_game_sessions(game_id);
CREATE INDEX IF NOT EXISTS idx_vocab_game_sessions_cefr_level ON vocab_game_sessions(cefr_level_id);
CREATE INDEX IF NOT EXISTS idx_vocab_game_sessions_started ON vocab_game_sessions(started_at DESC);

-- Create vocab_game_session_questions table
CREATE TABLE IF NOT EXISTS vocab_game_session_questions (
    id                      SERIAL PRIMARY KEY,
    session_id              INTEGER NOT NULL REFERENCES vocab_game_sessions(id) ON DELETE CASCADE,
    question_no             INTEGER NOT NULL,
    translation_id          INTEGER NOT NULL REFERENCES translations(id) ON DELETE RESTRICT,
    option_a_translation_id INTEGER NOT NULL REFERENCES translations(id) ON DELETE RESTRICT,
    option_b_translation_id INTEGER NOT NULL REFERENCES translations(id) ON DELETE RESTRICT,
    option_c_translation_id INTEGER NOT NULL REFERENCES translations(id) ON DELETE RESTRICT,
    option_d_translation_id INTEGER NOT NULL REFERENCES translations(id) ON DELETE RESTRICT,
    correct_option          CHAR(1) NOT NULL CHECK (correct_option IN ('A','B','C','D')),
    UNIQUE(session_id, question_no)
);

-- Create indexes for vocab_game_session_questions
CREATE INDEX IF NOT EXISTS idx_vocab_session_questions_session ON vocab_game_session_questions(session_id);
CREATE INDEX IF NOT EXISTS idx_vocab_session_questions_translation ON vocab_game_session_questions(translation_id);

-- Create vocab_game_session_answers table
CREATE TABLE IF NOT EXISTS vocab_game_session_answers (
    id                      SERIAL PRIMARY KEY,
    session_question_id     INTEGER NOT NULL REFERENCES vocab_game_session_questions(id) ON DELETE CASCADE,
    chosen_option           CHAR(1) NOT NULL CHECK (chosen_option IN ('A','B','C','D')),
    is_correct              BOOLEAN NOT NULL,
    answered_at             TIMESTAMP NOT NULL DEFAULT NOW(),
    time_spent_ms           INTEGER
);

-- Create indexes for vocab_game_session_answers
CREATE INDEX IF NOT EXISTS idx_vocab_session_answers_question ON vocab_game_session_answers(session_question_id);
CREATE INDEX IF NOT EXISTS idx_vocab_session_answers_answered_at ON vocab_game_session_answers(answered_at DESC);

-- Create vocab_user_word_stats table
CREATE TABLE IF NOT EXISTS vocab_user_word_stats (
    user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    word_id       INTEGER NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    times_seen    INTEGER NOT NULL DEFAULT 0,
    times_correct INTEGER NOT NULL DEFAULT 0,
    last_seen_at  TIMESTAMP,
    PRIMARY KEY (user_id, word_id)
);

-- Create indexes for vocab_user_word_stats
CREATE INDEX IF NOT EXISTS idx_vocab_user_word_stats_user ON vocab_user_word_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_vocab_user_word_stats_word ON vocab_user_word_stats(word_id);
CREATE INDEX IF NOT EXISTS idx_vocab_user_word_stats_last_seen ON vocab_user_word_stats(last_seen_at DESC);

