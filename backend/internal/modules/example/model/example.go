package model

import "time"

// Example represents an example sentence or phrase using a word.
type Example struct {
	ID             int64     `json:"id"`
	WordID         int64     `json:"word_id"`
	ExampleText    string    `json:"example_text"`
	TranslationText string    `json:"translation_text,omitempty"`
	CefrLevelID    *int64    `json:"cefr_level_id,omitempty"`
	LanguageID     int64     `json:"language_id"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

