-- Up migration: create games and game_levels tables

-- =========================
-- GAMES TABLE
-- =========================
CREATE TABLE IF NOT EXISTS games (
  game_id       SERIAL        PRIMARY KEY,
  code          VARCHAR(50)   NOT NULL UNIQUE CHECK (code ~ '^[a-z0-9-]+$'),
  name          VARCHAR(100)  NOT NULL CHECK (LENGTH(TRIM(name)) >= 1),
  description   TEXT          NOT NULL CHECK (LENGTH(description) BETWEEN 10 AND 500),
  icon_path     VARCHAR(255)  CHECK (icon_path IS NULL OR icon_path ~ '^/games/[a-z0-9-]+\.(svg|png|jpg|webp)$'),
  category      VARCHAR(50),
  display_order INT           NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- Indexes for games table
CREATE INDEX IF NOT EXISTS idx_games_active_order 
  ON games(is_active, display_order) 
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_games_category 
  ON games(category) 
  WHERE category IS NOT NULL;

-- =========================
-- GAME_LEVELS JUNCTION TABLE
-- =========================
CREATE TABLE IF NOT EXISTS game_levels (
  game_id  INT NOT NULL REFERENCES games(game_id) ON DELETE RESTRICT,
  level_id INT NOT NULL REFERENCES levels(level_id) ON DELETE RESTRICT,
  PRIMARY KEY (game_id, level_id)
);

-- Indexes for game_levels table
CREATE INDEX IF NOT EXISTS idx_game_levels_game 
  ON game_levels(game_id);

CREATE INDEX IF NOT EXISTS idx_game_levels_level 
  ON game_levels(level_id);

-- Comments for documentation
COMMENT ON TABLE games IS 'User-facing vocabulary learning games displayed on home page';
COMMENT ON TABLE game_levels IS 'Many-to-many relationship between games and difficulty levels';
COMMENT ON COLUMN games.code IS 'URL-safe machine-readable identifier (e.g., word-scramble)';
COMMENT ON COLUMN games.icon_path IS 'Relative path to game icon in public assets directory';
COMMENT ON COLUMN games.display_order IS 'Sort order on home page (lower number = displayed first)';
COMMENT ON COLUMN games.is_active IS 'Controls visibility on home page (soft delete flag)';

