CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  cnt BIGINT;
  cid UUID;
BEGIN
  SELECT COUNT(*) INTO cnt FROM words;
  IF cnt = 0 THEN
    -- apple / táo
    cid := gen_random_uuid();
    INSERT INTO words (concept_id, language_code, word_text, difficulty, is_primary)
    VALUES
      (cid, 'en', 'apple',  'easy', TRUE),
      (cid, 'vi', 'táo',    'easy', TRUE);

    -- banana / chuối
    cid := gen_random_uuid();
    INSERT INTO words (concept_id, language_code, word_text, difficulty, is_primary)
    VALUES
      (cid, 'en', 'banana', 'easy', TRUE),
      (cid, 'vi', 'chuối',  'easy', TRUE);

    -- cat / mèo
    cid := gen_random_uuid();
    INSERT INTO words (concept_id, language_code, word_text, difficulty, is_primary)
    VALUES
      (cid, 'en', 'cat',    'easy', TRUE),
      (cid, 'vi', 'mèo',    'easy', TRUE);
  END IF;
END $$;
