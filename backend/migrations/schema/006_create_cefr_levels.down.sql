-- Down migration: Drop cefr_levels table

DELETE FROM cefr_levels;
DROP INDEX IF EXISTS idx_cefr_levels_code;
DROP TABLE IF EXISTS cefr_levels;

