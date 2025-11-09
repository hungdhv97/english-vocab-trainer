-- Up migration: Create examples table

CREATE TABLE IF NOT EXISTS examples (
  id SERIAL PRIMARY KEY,
  word_id INT NOT NULL,
  example_text TEXT NOT NULL,
  translation_text TEXT,
  cefr_level_id INT,
  language_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_examples_word
    FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE,
  CONSTRAINT fk_examples_cefr
    FOREIGN KEY (cefr_level_id) REFERENCES cefr_levels(id) ON DELETE SET NULL,
  CONSTRAINT fk_examples_language
    FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE RESTRICT
);

CREATE INDEX idx_examples_word ON examples(word_id);
CREATE INDEX idx_examples_cefr ON examples(cefr_level_id);
CREATE INDEX idx_examples_language ON examples(language_id);

