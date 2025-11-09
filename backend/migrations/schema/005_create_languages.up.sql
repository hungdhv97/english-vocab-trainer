-- Up migration: Create languages table
-- Also rename all ID columns to remove prefixes for consistency

-- =========================
-- STEP 1: Drop foreign key constraints that reference ID columns
-- =========================

-- Drop foreign keys from game_sessions
ALTER TABLE game_sessions
DROP CONSTRAINT IF EXISTS game_sessions_user_id_fkey;

ALTER TABLE game_sessions
DROP CONSTRAINT IF EXISTS game_sessions_level_id_fkey;

-- Drop foreign keys from plays
ALTER TABLE plays
DROP CONSTRAINT IF EXISTS plays_user_id_fkey;

ALTER TABLE plays
DROP CONSTRAINT IF EXISTS plays_word_id_fkey;

-- Drop foreign keys from game_levels
ALTER TABLE game_levels
DROP CONSTRAINT IF EXISTS game_levels_game_id_fkey;

ALTER TABLE game_levels
DROP CONSTRAINT IF EXISTS game_levels_level_id_fkey;

-- =========================
-- STEP 2: Rename primary key columns to 'id'
-- =========================

-- Rename users.user_id to users.id
ALTER TABLE users
RENAME COLUMN user_id TO id;

-- Rename levels.level_id to levels.id
ALTER TABLE levels
RENAME COLUMN level_id TO id;

-- Rename words.word_id to words.id
ALTER TABLE words
RENAME COLUMN word_id TO id;

-- Rename games.game_id to games.id
ALTER TABLE games
RENAME COLUMN game_id TO id;

-- Rename plays.play_id to plays.id
ALTER TABLE plays
RENAME COLUMN play_id TO id;

-- =========================
-- STEP 3: Update foreign key column references in dependent tables
-- =========================

-- Update game_sessions.user_id to reference users.id
ALTER TABLE game_sessions
DROP CONSTRAINT IF EXISTS game_sessions_user_id_fkey;

ALTER TABLE game_sessions
ADD CONSTRAINT game_sessions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Update game_sessions.level_id to reference levels.id
ALTER TABLE game_sessions
DROP CONSTRAINT IF EXISTS game_sessions_level_id_fkey;

ALTER TABLE game_sessions
ADD CONSTRAINT game_sessions_level_id_fkey
  FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE SET NULL;

-- Update plays.user_id to reference users.id
ALTER TABLE plays
DROP CONSTRAINT IF EXISTS plays_user_id_fkey;

ALTER TABLE plays
ADD CONSTRAINT plays_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Update plays.word_id to reference words.id
ALTER TABLE plays
DROP CONSTRAINT IF EXISTS plays_word_id_fkey;

ALTER TABLE plays
ADD CONSTRAINT plays_word_id_fkey
  FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE;

-- Update game_levels.game_id to reference games.id
ALTER TABLE game_levels
DROP CONSTRAINT IF EXISTS game_levels_game_id_fkey;

ALTER TABLE game_levels
ADD CONSTRAINT game_levels_game_id_fkey
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE RESTRICT;

-- Update game_levels.level_id to reference levels.id
ALTER TABLE game_levels
DROP CONSTRAINT IF EXISTS game_levels_level_id_fkey;

ALTER TABLE game_levels
ADD CONSTRAINT game_levels_level_id_fkey
  FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE RESTRICT;

-- Update game_sessions.game_id to reference games.id (if game_id column exists from migration 004)
-- Note: Migration 004 adds game_id column, but it might reference games(game_id) which we just renamed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'game_sessions' AND column_name = 'game_id'
  ) THEN
    -- Drop existing constraint if it exists (might reference games.game_id)
    ALTER TABLE game_sessions
    DROP CONSTRAINT IF EXISTS game_sessions_game_id_fkey;
    
    -- Add constraint referencing games.id
    ALTER TABLE game_sessions
    ADD CONSTRAINT game_sessions_game_id_fkey
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE RESTRICT;
  END IF;
END $$;

-- =========================
-- STEP 4: Update indexes that reference renamed columns
-- =========================

-- Recreate indexes for game_sessions (they should automatically update, but we'll ensure they're correct)
-- The indexes on user_id and level_id should still work since we only renamed the referenced columns

-- =========================
-- STEP 5: Create languages table
-- =========================

CREATE TABLE IF NOT EXISTS languages (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL
);

CREATE INDEX idx_languages_code ON languages(code);

