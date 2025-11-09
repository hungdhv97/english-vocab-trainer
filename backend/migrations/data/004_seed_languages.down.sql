-- Down migration: Remove languages seed data

DELETE FROM languages WHERE code IN ('en', 'vi');

