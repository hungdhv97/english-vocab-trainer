package model

// Question represents a multiple-choice question in the vocabulary quiz.
type Question struct {
	ID                int64    `json:"id"`                 // Session question ID (from vocab_game_session_questions)
	SessionQuestionID int64    `json:"session_question_id"` // Same as ID, for clarity
	WordID            int64    `json:"word_id"`
	WordText          string   `json:"word_text"`
	TranslationID     int64    `json:"translation_id"`
	Options           []Option `json:"options"`
	CorrectAnswer     string   `json:"correct_answer"` // a, b, c, or d
}

// Option represents a multiple-choice option.
type Option struct {
	Letter string `json:"letter"` // a, b, c, or d
	Text   string `json:"text"`
	WordID int64  `json:"word_id"`
}

// QuestionRequest represents a request to generate questions.
type QuestionRequest struct {
	UserID             int64  `json:"user_id"`
	GameID             int64  `json:"game_id"`
	CefrLevelID        int64  `json:"cefr_level_id"`
	TranslationDirection string `json:"translation_direction"` // "en-to-vi" or "vi-to-en"
	Count              int    `json:"count"`
}

// CreateSessionRequest represents a request to create a session.
type CreateSessionRequest struct {
	UserID             int64  `json:"user_id"`
	GameID             int64  `json:"game_id"`
	CefrLevelID        int64  `json:"cefr_level_id"`
	TranslationDirection string `json:"translation_direction"` // "en-to-vi" or "vi-to-en"
	QuestionCount      int    `json:"question_count"` // Default: 20
}

// AnswerRequest represents a request to submit an answer.
type AnswerRequest struct {
	SessionQuestionID int64  `json:"session_question_id"` // ID of the session question
	ChosenOption      string `json:"chosen_option"`       // A, B, C, or D
	TimeSpentMs       *int   `json:"time_spent_ms,omitempty"` // Optional time spent in milliseconds
}

// AnswerResponse represents the response after submitting an answer.
type AnswerResponse struct {
	IsCorrect     bool  `json:"is_correct"`
	CorrectCount  int   `json:"correct_count"`
	TotalCount    int   `json:"total_count"`
}

// SessionStatistics represents statistics for a game session.
type SessionStatistics struct {
	SessionID          int64    `json:"session_id"`
	TotalScore         int      `json:"total_score"`
	CorrectCount       int      `json:"correct_count"`
	IncorrectCount     int      `json:"incorrect_count"`
	AccuracyPercentage float64  `json:"accuracy_percentage"`
	TimeElapsed        *float64 `json:"time_elapsed,omitempty"` // in seconds
}

// CreateSessionResponse represents the response after creating a session.
type CreateSessionResponse struct {
	SessionID  int64           `json:"session_id"`
	Questions  []Question      `json:"questions"`
}

// LeaderboardEntry represents a single entry in a vocab quiz leaderboard.
type LeaderboardEntry struct {
	Rank               int     `json:"rank"`                // Player's position (1 = highest accuracy)
	UserID             int64   `json:"user_id"`             // Unique identifier of the player
	Username           string  `json:"username"`            // Player's display name
	AccuracyPercentage float64 `json:"accuracy_percentage"` // Average accuracy percentage across all sessions
	GamesPlayed        int     `json:"games_played"`        // Number of games played for this combination
}

// LeaderboardRequest represents a request to get leaderboard.
type LeaderboardRequest struct {
	GameID             int64  `json:"game_id"`               // Game ID (vocab-quiz)
	CefrLevelID        int64  `json:"cefr_level_id"`         // CEFR level ID (A1, A2, B1, etc.)
	TranslationDirection string `json:"translation_direction"` // "en-to-vi" or "vi-to-en"
}

// LeaderboardResponse represents the API response for a vocab quiz leaderboard.
type LeaderboardResponse struct {
	GameID             int64              `json:"game_id"`
	CefrLevelID        int64              `json:"cefr_level_id"`
	CefrLevelCode      string             `json:"cefr_level_code"`
	TranslationDirection string           `json:"translation_direction"`
	MinGamesPlayed    int                `json:"min_games_played"` // Minimum number of games required to appear on leaderboard
	Leaderboard        []LeaderboardEntry `json:"leaderboard"`
}

