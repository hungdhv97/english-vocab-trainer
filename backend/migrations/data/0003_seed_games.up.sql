-- Data migration: seed initial game data

-- Insert sample games
INSERT INTO games (code, name, description, icon_path, category, display_order, is_active)
VALUES
  (
    'word-scramble',
    'Word Scramble',
    'Unscramble letters to form correct English words. Test your spelling skills and vocabulary knowledge!',
    '/games/word-scramble.svg',
    'vocabulary',
    1,
    TRUE
  ),
  (
    'vocab-quiz',
    'Vocabulary Quiz',
    'Match words with their definitions. Expand your vocabulary knowledge through interactive quizzes!',
    '/games/vocab-quiz.svg',
    'vocabulary',
    2,
    TRUE
  ),
  (
    'spelling-challenge',
    'Spelling Challenge',
    'Listen and spell words correctly. Perfect your English spelling with audio pronunciation!',
    '/games/spelling-challenge.svg',
    'mixed',
    3,
    TRUE
  ),
  (
    'pronunciation-practice',
    'Pronunciation Practice',
    'Practice speaking English words with correct pronunciation. Improve your speaking confidence!',
    '/games/pronunciation-practice.svg',
    'pronunciation',
    4,
    TRUE
  ),
  (
    'grammar-master',
    'Grammar Master',
    'Master English grammar rules through interactive exercises. Build strong grammar foundations!',
    '/games/grammar-master.svg',
    'grammar',
    5,
    TRUE
  )
ON CONFLICT (code) DO NOTHING;

-- Map games to existing levels (initially 1:1 mapping)
-- This assumes levels already exist from migration 001_create_tables.up.sql
-- Adjust level_id values based on your actual level data

-- Get existing level IDs and map to games
-- Note: This is a simple example. Adjust based on your actual level structure.
-- For now, we'll map each game to the first available level as a placeholder.

INSERT INTO game_levels (game_id, level_id)
SELECT g.game_id, l.level_id
FROM games g
CROSS JOIN LATERAL (
  SELECT level_id 
  FROM levels 
  WHERE is_active = TRUE 
  LIMIT 1
) l
WHERE g.code IN ('word-scramble', 'vocab-quiz', 'spelling-challenge', 'pronunciation-practice', 'grammar-master')
ON CONFLICT (game_id, level_id) DO NOTHING;

-- Alternative: If you want specific level mappings, uncomment and adjust:
-- INSERT INTO game_levels (game_id, level_id)
-- VALUES
--   ((SELECT game_id FROM games WHERE code = 'word-scramble'), 1),
--   ((SELECT game_id FROM games WHERE code = 'vocab-quiz'), 2),
--   ((SELECT game_id FROM games WHERE code = 'spelling-challenge'), 3)
-- ON CONFLICT (game_id, level_id) DO NOTHING;

