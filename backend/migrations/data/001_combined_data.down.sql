-- Combined Data Migration Rollback
-- This file contains all rollback operations for seed data
-- =========================
-- ROLLBACK GAMES
-- =========================
DELETE FROM games
WHERE code IN (
    'word-scramble',
    'vocab-quiz',
    'spelling-challenge',
    'pronunciation-practice',
    'grammar-master'
  );
-- =========================
-- ROLLBACK WORDS
-- =========================
-- Note: This removes all words seeded in the up migration
-- Since words are inserted in a DO block, we need to delete them
-- This assumes all words in the database were seeded by this migration
-- If you have other words, adjust this query accordingly
DELETE FROM words
WHERE language_id IN (
    SELECT id
    FROM languages
    WHERE code = 'en'
  );
-- =========================
-- ROLLBACK CEFR LEVELS
-- =========================
DELETE FROM cefr_levels
WHERE code IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');
-- =========================
-- ROLLBACK LANGUAGES
-- =========================
DELETE FROM languages
WHERE code IN ('en', 'vi');