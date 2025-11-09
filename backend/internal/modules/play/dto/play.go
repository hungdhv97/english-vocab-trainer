package dto

// AnswerRequest represents a play answer submission.
// Updated to support new schema with translation_id (T056).
type AnswerRequest struct {
	WordID        int64  `json:"word_id" validate:"required"`
	UserID        int64  `json:"user_id" validate:"required"`
	LanguageCode  string `json:"language_code,omitempty"`  // Old schema: required for backward compatibility
	TranslationID *int64 `json:"translation_id,omitempty"` // New schema: translation ID
	CorrectAnswer string `json:"correct_answer,omitempty"` // New schema: correct answer text
	UserAnswer    string `json:"user_answer"`
}

// SessionRequest represents a request to start a new game session.
// Updated to support both old schema (level_id) and new schema (cefr_level_id, translation_direction) (T055).
type SessionRequest struct {
	UserID             int64  `json:"user_id" validate:"required"`
	LevelID            int64  `json:"level_id,omitempty"`              // Old schema: required for backward compatibility
	CefrLevelID        *int64 `json:"cefr_level_id,omitempty"`         // New schema: CEFR level ID
	TranslationDirection string `json:"translation_direction,omitempty"` // New schema: "en-to-vi" or "vi-to-en"
}
