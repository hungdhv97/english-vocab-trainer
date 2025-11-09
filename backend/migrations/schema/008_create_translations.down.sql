-- Down migration: Drop translations table

DROP INDEX IF EXISTS idx_trans_from_to_cefr_order;
DROP INDEX IF EXISTS idx_trans_cefr;
DROP INDEX IF EXISTS idx_trans_to;
DROP INDEX IF EXISTS idx_trans_from;
DROP TABLE IF EXISTS translations;

