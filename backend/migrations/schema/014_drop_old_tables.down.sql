-- Down migration: Restore old tables (game_sessions, levels, plays)
-- Note: This is a simplified restoration - actual data will be lost

-- Recreate levels table
CREATE TABLE IF NOT EXISTS levels (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  difficulty VARCHAR(50),
  scoring_config JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Recreate game_levels table
CREATE TABLE IF NOT EXISTS game_levels (
  game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE RESTRICT,
  level_id INTEGER NOT NULL REFERENCES levels(id) ON DELETE RESTRICT,
  PRIMARY KEY (game_id, level_id)
);

-- Recreate game_sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  session_tag UUID PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level_id INTEGER REFERENCES levels(id),
  game_id INTEGER REFERENCES games(id),
  cefr_level_id INTEGER REFERENCES cefr_levels(id),
  translation_direction VARCHAR(10),
  correct_count INTEGER NOT NULL DEFAULT 0,
  incorrect_count INTEGER NOT NULL DEFAULT 0,
  accuracy_percentage DECIMAL(5,2),
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMP,
  CONSTRAINT chk_game_sessions_translation_direction
    CHECK (translation_direction IS NULL OR translation_direction IN ('en-to-vi', 'vi-to-en'))
);

-- Recreate plays table
CREATE TABLE IF NOT EXISTS plays (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word_id INTEGER NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  session_tag UUID NOT NULL REFERENCES game_sessions(session_tag) ON DELETE CASCADE,
  translation_id INTEGER REFERENCES translations(id),
  user_answer VARCHAR(255) NOT NULL,
  correct_answer VARCHAR(255),
  is_correct BOOLEAN NOT NULL,
  score INTEGER NOT NULL,
  target INTEGER NOT NULL DEFAULT 0,
  played_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Recreate indexes
CREATE INDEX IF EXISTS idx_sessions_user ON game_sessions(user_id);
CREATE INDEX IF EXISTS idx_sessions_level ON game_sessions(level_id);
CREATE INDEX IF EXISTS idx_sessions_user_started ON game_sessions(user_id, started_at DESC);
CREATE INDEX IF EXISTS idx_game_sessions_game_finished ON game_sessions(game_id, finished_at) WHERE finished_at IS NOT NULL;
CREATE INDEX IF EXISTS idx_game_sessions_cefr_level ON game_sessions(cefr_level_id);
CREATE INDEX IF EXISTS idx_plays_session_tag ON plays(session_tag);
CREATE INDEX IF EXISTS idx_plays_user_time ON plays(user_id, played_at DESC);
CREATE INDEX IF EXISTS idx_plays_session_time ON plays(session_tag, played_at);

