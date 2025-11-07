-- Data migration rollback: remove seeded game data

-- Delete game_levels mappings first (foreign key constraint)
DELETE FROM game_levels 
WHERE game_id IN (
  SELECT game_id FROM games 
  WHERE code IN (
    'word-scramble', 
    'vocab-quiz', 
    'spelling-challenge', 
    'pronunciation-practice', 
    'grammar-master'
  )
);

-- Delete the games
DELETE FROM games 
WHERE code IN (
  'word-scramble',
  'vocab-quiz',
  'spelling-challenge',
  'pronunciation-practice',
  'grammar-master'
);

