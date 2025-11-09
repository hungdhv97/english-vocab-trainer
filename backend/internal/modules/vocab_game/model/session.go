package model

import (
	"time"
)

// VocabGameSession represents a vocabulary quiz game session.
type VocabGameSession struct {
	ID             int64     `json:"id" db:"id"`
	UserID         int64     `json:"user_id" db:"user_id"`
	GameID         int64     `json:"game_id" db:"game_id"`
	CefrLevelID    int64     `json:"cefr_level_id" db:"cefr_level_id"`
	FromLanguageID int64     `json:"from_language_id" db:"from_language_id"`
	ToLanguageID   int64     `json:"to_language_id" db:"to_language_id"`
	TotalQuestions int       `json:"total_questions" db:"total_questions"`
	CorrectAnswers int       `json:"correct_answers" db:"correct_answers"`
	StartedAt      time.Time `json:"started_at" db:"started_at"`
	FinishedAt     *time.Time `json:"finished_at,omitempty" db:"finished_at"`
}

// VocabGameSessionQuestion represents a question in a vocabulary quiz session.
type VocabGameSessionQuestion struct {
	ID                    int64  `json:"id" db:"id"`
	SessionID             int64  `json:"session_id" db:"session_id"`
	QuestionNo            int    `json:"question_no" db:"question_no"`
	TranslationID         int64  `json:"translation_id" db:"translation_id"`
	OptionATranslationID  int64  `json:"option_a_translation_id" db:"option_a_translation_id"`
	OptionBTranslationID  int64  `json:"option_b_translation_id" db:"option_b_translation_id"`
	OptionCTranslationID  int64  `json:"option_c_translation_id" db:"option_c_translation_id"`
	OptionDTranslationID  int64  `json:"option_d_translation_id" db:"option_d_translation_id"`
	CorrectOption         string `json:"correct_option" db:"correct_option"`
}

// VocabGameSessionAnswer represents an answer to a question in a vocabulary quiz session.
type VocabGameSessionAnswer struct {
	ID               int64     `json:"id" db:"id"`
	SessionQuestionID int64    `json:"session_question_id" db:"session_question_id"`
	ChosenOption     string    `json:"chosen_option" db:"chosen_option"`
	IsCorrect        bool      `json:"is_correct" db:"is_correct"`
	AnsweredAt       time.Time `json:"answered_at" db:"answered_at"`
	TimeSpentMs      *int      `json:"time_spent_ms,omitempty" db:"time_spent_ms"`
}

// VocabUserWordStats represents user statistics for a word.
type VocabUserWordStats struct {
	UserID       int64      `json:"user_id" db:"user_id"`
	WordID       int64      `json:"word_id" db:"word_id"`
	TimesSeen    int        `json:"times_seen" db:"times_seen"`
	TimesCorrect int        `json:"times_correct" db:"times_correct"`
	LastSeenAt   *time.Time `json:"last_seen_at,omitempty" db:"last_seen_at"`
}

