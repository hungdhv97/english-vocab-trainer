package model

import "time"

// Word represents a single word in a specific language.
type Word struct {
	ID            int64     `json:"id"`
	LanguageID    int64     `json:"language_id"`
	WordText      string    `json:"word_text"`
	Phonetic      string    `json:"phonetic,omitempty"`
	PartOfSpeech  string    `json:"part_of_speech,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}
