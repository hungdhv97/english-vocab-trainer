-- Up migration: Migrate existing word relationships to translations table

-- This migration creates translation records from existing word relationships
-- It assumes words have concept_id that links related words
-- Strategy:
-- 1. Find English words with Vietnamese translations via concept_id
-- 2. Create translation records for each word pair
-- 3. Try to assign CEFR levels based on existing difficulty levels if possible

-- Create translations from existing word pairs with same concept_id
-- Note: After migration 005, words.word_id is renamed to words.id
INSERT INTO translations (from_word_id, to_word_id, cefr_level_id, meaning_order, note, created_at)
SELECT DISTINCT
  w_en.id,
  w_vi.id,
  CAST(NULL AS INTEGER),
  1,
  'Migrated from concept_id relationship',
  NOW()
FROM words w_en
JOIN words w_vi ON w_en.concept_id = w_vi.concept_id
JOIN languages l_en ON w_en.language_id = l_en.id
JOIN languages l_vi ON w_vi.language_id = l_vi.id
WHERE l_en.code = 'en'
  AND l_vi.code = 'vi'
  AND NOT EXISTS (
    SELECT 1 FROM translations t
    WHERE t.from_word_id = w_en.id
    AND t.to_word_id = w_vi.id
  );

-- Note: CEFR level assignment can be done in a separate migration
-- if there's a mapping between old difficulty levels and CEFR levels
-- For now, translations are created without CEFR levels

