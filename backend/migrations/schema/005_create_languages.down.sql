-- Down migration: Drop languages table and revert ID column renames

-- Drop languages table first
DROP INDEX IF EXISTS idx_languages_code;
DROP TABLE IF EXISTS languages;

-- =========================
-- STEP 1: Drop foreign key constraints
-- =========================

ALTER TABLE game_sessions
DROP CONSTRAINT IF EXISTS game_sessions_user_id_fkey;

ALTER TABLE game_sessions
DROP CONSTRAINT IF EXISTS game_sessions_level_id_fkey;

ALTER TABLE plays
DROP CONSTRAINT IF EXISTS plays_user_id_fkey;

ALTER TABLE plays
DROP CONSTRAINT IF EXISTS plays_word_id_fkey;

ALTER TABLE game_levels
DROP CONSTRAINT IF EXISTS game_levels_game_id_fkey;

ALTER TABLE game_levels
DROP CONSTRAINT IF EXISTS game_levels_level_id_fkey;

-- =========================
-- STEP 2: Rename primary key columns back to prefixed names
-- =========================

ALTER TABLE users
RENAME COLUMN id TO user_id;

ALTER TABLE levels
RENAME COLUMN id TO level_id;

ALTER TABLE words
RENAME COLUMN id TO word_id;

ALTER TABLE games
RENAME COLUMN id TO game_id;

ALTER TABLE plays
RENAME COLUMN id TO play_id;

-- =========================
-- STEP 3: Recreate foreign key constraints with original column names
-- =========================

ALTER TABLE game_sessions
ADD CONSTRAINT game_sessions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE game_sessions
ADD CONSTRAINT game_sessions_level_id_fkey
  FOREIGN KEY (level_id) REFERENCES levels(level_id) ON DELETE SET NULL;

ALTER TABLE plays
ADD CONSTRAINT plays_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE plays
ADD CONSTRAINT plays_word_id_fkey
  FOREIGN KEY (word_id) REFERENCES words(word_id) ON DELETE CASCADE;

ALTER TABLE game_levels
ADD CONSTRAINT game_levels_game_id_fkey
  FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE RESTRICT;

ALTER TABLE game_levels
ADD CONSTRAINT game_levels_level_id_fkey
  FOREIGN KEY (level_id) REFERENCES levels(level_id) ON DELETE RESTRICT;

-- Revert game_sessions.game_id foreign key if it exists (from migration 004)
ALTER TABLE game_sessions
DROP CONSTRAINT IF EXISTS game_sessions_game_id_fkey;

