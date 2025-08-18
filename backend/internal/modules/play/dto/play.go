package dto

// AnswerRequest represents a play answer submission.
type AnswerRequest struct {
	WordID       int64  `json:"word_id" validate:"required"`
	UserID       int64  `json:"user_id" validate:"required"`
	LanguageCode string `json:"language_code" validate:"required"`
	UserAnswer   string `json:"user_answer"`
}

// SessionRequest represents a request to start a new game session.
type SessionRequest struct {
	UserID  int64 `json:"user_id" validate:"required"`
	LevelID int64 `json:"level_id" validate:"required"`
}
