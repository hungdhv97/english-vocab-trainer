-- Up migration: Create translations table

CREATE TABLE IF NOT EXISTS translations (
  id SERIAL PRIMARY KEY,
  from_word_id INT NOT NULL,
  to_word_id INT NOT NULL,
  cefr_level_id INT,
  meaning_order INT NOT NULL DEFAULT 1,
  note VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_trans_from_word
    FOREIGN KEY (from_word_id) REFERENCES words(id) ON DELETE CASCADE,
  CONSTRAINT fk_trans_to_word
    FOREIGN KEY (to_word_id) REFERENCES words(id) ON DELETE CASCADE,
  CONSTRAINT fk_trans_cefr
    FOREIGN KEY (cefr_level_id) REFERENCES cefr_levels(id) ON DELETE SET NULL
);

CREATE INDEX idx_trans_from ON translations(from_word_id);
CREATE INDEX idx_trans_to ON translations(to_word_id);
CREATE INDEX idx_trans_cefr ON translations(cefr_level_id);
CREATE INDEX idx_trans_from_to_cefr_order ON translations(from_word_id, to_word_id, cefr_level_id, meaning_order);

