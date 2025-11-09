-- Down migration: Drop examples table

DROP INDEX IF EXISTS idx_examples_language;
DROP INDEX IF EXISTS idx_examples_cefr;
DROP INDEX IF EXISTS idx_examples_word;
DROP TABLE IF EXISTS examples;

