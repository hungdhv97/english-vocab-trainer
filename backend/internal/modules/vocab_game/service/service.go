package service

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/vocab_game/model"
)

// Service provides vocab game session operations.
type Service struct {
	db *pgxpool.Pool
}

// New creates a new vocab game service.
func New(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

// CreateSession creates a new vocab game session.
func (s *Service) CreateSession(ctx context.Context, session *model.VocabGameSession) (int64, error) {
	var sessionID int64
	err := s.db.QueryRow(ctx, `
		INSERT INTO vocab_game_sessions 
		(user_id, game_id, cefr_level_id, from_language_id, to_language_id, total_questions)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id`,
		session.UserID, session.GameID, session.CefrLevelID, session.FromLanguageID, session.ToLanguageID, session.TotalQuestions,
	).Scan(&sessionID)
	if err != nil {
		return 0, fmt.Errorf("failed to create session: %w", err)
	}
	return sessionID, nil
}

// CreateSessionQuestions creates questions for a session.
func (s *Service) CreateSessionQuestions(ctx context.Context, sessionID int64, questions []model.VocabGameSessionQuestion) error {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	for _, q := range questions {
		_, err := tx.Exec(ctx, `
			INSERT INTO vocab_game_session_questions
			(session_id, question_no, translation_id, option_a_translation_id, option_b_translation_id, 
			 option_c_translation_id, option_d_translation_id, correct_option)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
			sessionID, q.QuestionNo, q.TranslationID, q.OptionATranslationID, q.OptionBTranslationID,
			q.OptionCTranslationID, q.OptionDTranslationID, q.CorrectOption,
		)
		if err != nil {
			return fmt.Errorf("failed to insert question: %w", err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}
	return nil
}

// SubmitAnswer submits an answer for a question and returns whether it was correct.
func (s *Service) SubmitAnswer(ctx context.Context, sessionQuestionID int64, chosenOption string, timeSpentMs *int) (bool, error) {
	// Get the correct option for this question
	var correctOption string
	var sessionID int64
	err := s.db.QueryRow(ctx, `
		SELECT correct_option, session_id
		FROM vocab_game_session_questions
		WHERE id = $1`,
		sessionQuestionID,
	).Scan(&correctOption, &sessionID)
	if err != nil {
		return false, fmt.Errorf("failed to get question: %w", err)
	}

	// Normalize options to uppercase for comparison
	chosenOption = normalizeOption(chosenOption)
	correctOption = normalizeOption(correctOption)
	isCorrect := chosenOption == correctOption

	// Insert answer
	_, err = s.db.Exec(ctx, `
		INSERT INTO vocab_game_session_answers
		(session_question_id, chosen_option, is_correct, time_spent_ms)
		VALUES ($1, $2, $3, $4)`,
		sessionQuestionID, chosenOption, isCorrect, timeSpentMs,
	)
	if err != nil {
		return false, fmt.Errorf("failed to insert answer: %w", err)
	}

	// Update session correct_answers count if correct
	if isCorrect {
		_, err = s.db.Exec(ctx, `
			UPDATE vocab_game_sessions
			SET correct_answers = correct_answers + 1
			WHERE id = $1`,
			sessionID,
		)
		if err != nil {
			return false, fmt.Errorf("failed to update session: %w", err)
		}
	}

	// Update user word stats
	err = s.updateUserWordStats(ctx, sessionQuestionID, isCorrect)
	if err != nil {
		// Log error but don't fail the request
		// TODO: Add proper logging
		_ = err
	}

	return isCorrect, nil
}

// updateUserWordStats updates user statistics for words seen in the question.
func (s *Service) updateUserWordStats(ctx context.Context, sessionQuestionID int64, isCorrect bool) error {
	// Get the translation IDs from the question
	var translationID, optionATranslationID, optionBTranslationID, optionCTranslationID, optionDTranslationID int64
	var sessionID int64
	err := s.db.QueryRow(ctx, `
		SELECT translation_id, option_a_translation_id, option_b_translation_id, 
		       option_c_translation_id, option_d_translation_id, session_id
		FROM vocab_game_session_questions
		WHERE id = $1`,
		sessionQuestionID,
	).Scan(&translationID, &optionATranslationID, &optionBTranslationID, &optionCTranslationID, &optionDTranslationID, &sessionID)
	if err != nil {
		return fmt.Errorf("failed to get question translations: %w", err)
	}

	// Get user_id from session
	var userID int64
	err = s.db.QueryRow(ctx, `SELECT user_id FROM vocab_game_sessions WHERE id = $1`, sessionID).Scan(&userID)
	if err != nil {
		return fmt.Errorf("failed to get user_id: %w", err)
	}

	// Get word_id from translation (the from_word_id)
	var wordID int64
	err = s.db.QueryRow(ctx, `SELECT from_word_id FROM translations WHERE id = $1`, translationID).Scan(&wordID)
	if err != nil {
		return fmt.Errorf("failed to get word_id: %w", err)
	}

	// Update or insert user word stats
	_, err = s.db.Exec(ctx, `
		INSERT INTO vocab_user_word_stats (user_id, word_id, times_seen, times_correct, last_seen_at)
		VALUES ($1, $2, 1, $3, NOW())
		ON CONFLICT (user_id, word_id)
		DO UPDATE SET
			times_seen = vocab_user_word_stats.times_seen + 1,
			times_correct = vocab_user_word_stats.times_correct + CASE WHEN $3 THEN 1 ELSE 0 END,
			last_seen_at = NOW()`,
		userID, wordID, isCorrect,
	)
	if err != nil {
		return fmt.Errorf("failed to update user word stats: %w", err)
	}

	return nil
}

// FinishSession marks a session as finished.
func (s *Service) FinishSession(ctx context.Context, sessionID int64) error {
	_, err := s.db.Exec(ctx, `
		UPDATE vocab_game_sessions
		SET finished_at = NOW()
		WHERE id = $1`,
		sessionID,
	)
	if err != nil {
		return fmt.Errorf("failed to finish session: %w", err)
	}
	return nil
}

// GetSession retrieves a session by ID.
func (s *Service) GetSession(ctx context.Context, sessionID int64) (*model.VocabGameSession, error) {
	var session model.VocabGameSession
	err := s.db.QueryRow(ctx, `
		SELECT id, user_id, game_id, cefr_level_id, from_language_id, to_language_id,
		       total_questions, correct_answers, started_at, finished_at
		FROM vocab_game_sessions
		WHERE id = $1`,
		sessionID,
	).Scan(
		&session.ID, &session.UserID, &session.GameID, &session.CefrLevelID,
		&session.FromLanguageID, &session.ToLanguageID, &session.TotalQuestions,
		&session.CorrectAnswers, &session.StartedAt, &session.FinishedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get session: %w", err)
	}
	return &session, nil
}

// GetSessionQuestions retrieves all questions for a session.
func (s *Service) GetSessionQuestions(ctx context.Context, sessionID int64) ([]model.VocabGameSessionQuestion, error) {
	rows, err := s.db.Query(ctx, `
		SELECT id, session_id, question_no, translation_id, option_a_translation_id,
		       option_b_translation_id, option_c_translation_id, option_d_translation_id, correct_option
		FROM vocab_game_session_questions
		WHERE session_id = $1
		ORDER BY question_no`,
		sessionID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get questions: %w", err)
	}
	defer rows.Close()

	var questions []model.VocabGameSessionQuestion
	for rows.Next() {
		var q model.VocabGameSessionQuestion
		err := rows.Scan(
			&q.ID, &q.SessionID, &q.QuestionNo, &q.TranslationID,
			&q.OptionATranslationID, &q.OptionBTranslationID, &q.OptionCTranslationID,
			&q.OptionDTranslationID, &q.CorrectOption,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan question: %w", err)
		}
		questions = append(questions, q)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating questions: %w", err)
	}

	return questions, nil
}

// GetSessionQuestionByNumber retrieves a question by session ID and question number.
func (s *Service) GetSessionQuestionByNumber(ctx context.Context, sessionID int64, questionNo int) (*model.VocabGameSessionQuestion, error) {
	var q model.VocabGameSessionQuestion
	err := s.db.QueryRow(ctx, `
		SELECT id, session_id, question_no, translation_id, option_a_translation_id,
		       option_b_translation_id, option_c_translation_id, option_d_translation_id, correct_option
		FROM vocab_game_session_questions
		WHERE session_id = $1 AND question_no = $2`,
		sessionID, questionNo,
	).Scan(
		&q.ID, &q.SessionID, &q.QuestionNo, &q.TranslationID,
		&q.OptionATranslationID, &q.OptionBTranslationID, &q.OptionCTranslationID,
		&q.OptionDTranslationID, &q.CorrectOption,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get question: %w", err)
	}
	return &q, nil
}

// GetSessionAnswer retrieves an answer for a session question.
func (s *Service) GetSessionAnswer(ctx context.Context, sessionQuestionID int64) (*model.VocabGameSessionAnswer, error) {
	var answer model.VocabGameSessionAnswer
	err := s.db.QueryRow(ctx, `
		SELECT id, session_question_id, chosen_option, is_correct, answered_at, time_spent_ms
		FROM vocab_game_session_answers
		WHERE session_question_id = $1`,
		sessionQuestionID,
	).Scan(
		&answer.ID, &answer.SessionQuestionID, &answer.ChosenOption, &answer.IsCorrect,
		&answer.AnsweredAt, &answer.TimeSpentMs,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get answer: %w", err)
	}
	return &answer, nil
}

// normalizeOption normalizes option letters to uppercase (A, B, C, D).
func normalizeOption(option string) string {
	if len(option) == 0 {
		return ""
	}
	// Convert to uppercase
	firstChar := option[0]
	if firstChar >= 'a' && firstChar <= 'z' {
		firstChar = firstChar - 32
	}
	upper := string(firstChar)
	if upper >= "A" && upper <= "D" {
		return upper
	}
	return option
}

