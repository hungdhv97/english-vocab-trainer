-- Up migration: Update plays table

-- Add translation_id column
ALTER TABLE plays
ADD COLUMN IF NOT EXISTS translation_id INT;

ALTER TABLE plays
ADD CONSTRAINT fk_plays_translation
  FOREIGN KEY (translation_id) REFERENCES translations(id) ON DELETE SET NULL;

-- Add correct_answer column
ALTER TABLE plays
ADD COLUMN IF NOT EXISTS correct_answer VARCHAR(255);

-- Create index
CREATE INDEX IF NOT EXISTS idx_plays_translation ON plays(translation_id);

