package model

import "github.com/google/uuid"

// Word represents a single word in a specific language.
type Word struct {
	ID           int64     `json:"word_id"`
	ConceptID    uuid.UUID `json:"concept_id"`
	LanguageCode string    `json:"language_code"`
	WordText     string    `json:"word_text"`
	Difficulty   string    `json:"difficulty"`
	IsPrimary    bool      `json:"is_primary"`
}
