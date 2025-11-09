package model

import "time"

// Translation represents a translation pair between words in different languages.
type Translation struct {
	ID           int64     `json:"id"`
	FromWordID   int64     `json:"from_word_id"`
	ToWordID     int64     `json:"to_word_id"`
	CefrLevelID  *int64    `json:"cefr_level_id,omitempty"`
	MeaningOrder int       `json:"meaning_order"`
	Note         string    `json:"note,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
}

