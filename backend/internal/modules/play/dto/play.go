package dto

// AnswerRequest represents a play answer submission.
type AnswerRequest struct {
	WordID       int64  `json:"word_id" validate:"required"`
	UserID       int64  `json:"user_id" validate:"required"`
	LanguageCode string `json:"language_code" validate:"required"`
	ResponseTime int    `json:"response_time" validate:"required"`
	UserAnswer   string `json:"user_answer"`
	EarnedScore  int    `json:"earned_score" validate:"required"`
}
