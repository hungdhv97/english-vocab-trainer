-- Down migration: drop games and game_levels tables

-- Drop junction table first (has foreign keys to games and levels)
DROP TABLE IF EXISTS game_levels;

-- Drop games table
DROP TABLE IF EXISTS games;

