CREATE TABLE IF NOT EXISTS universe_index (
    language_code TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    rank INTEGER NOT NULL,
    word_id BIGINT NOT NULL,
    PRIMARY KEY (language_code, difficulty, rank)
);

CREATE INDEX IF NOT EXISTS idx_universe_index_word ON universe_index(word_id);
