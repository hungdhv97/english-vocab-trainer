INSERT INTO universe_index(language_code, difficulty, rank, word_id)
SELECT language_code,
       difficulty,
       ROW_NUMBER() OVER (PARTITION BY language_code, difficulty ORDER BY word_id) - 1 AS rank,
       word_id
FROM words;
