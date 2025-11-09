-- Up migration: Seed languages table

INSERT INTO languages (code, name) VALUES
('en', 'English'),
('vi', 'Vietnamese')
ON CONFLICT (code) DO NOTHING;

