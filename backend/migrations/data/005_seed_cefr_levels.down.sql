-- Down migration: Remove cefr_levels seed data

DELETE FROM cefr_levels WHERE code IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');

