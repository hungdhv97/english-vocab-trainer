-- Note: After migration 005, words.word_id is renamed to words.id
-- Note: This table will be removed in migration 012_remove_deprecated_tables
INSERT INTO universe_index(language_code, difficulty, rank, word_id)
SELECT language_code,
       difficulty,
       ROW_NUMBER() OVER (PARTITION BY language_code, difficulty ORDER BY id) - 1 AS rank,
       id as word_id
FROM words;
