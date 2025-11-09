package service

import (
	"context"
	"errors"
	"fmt"
	"math/rand"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	cefrservice "github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/cefr_level/service"
	transservice "github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/translation/service"
	vocabgamemodel "github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/vocab_game/model"
	vocabgamesvc "github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/vocab_game/service"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/vocab_quiz/model"
)

// Service provides vocab quiz-related operations.
type Service struct {
	db              *pgxpool.Pool
	cefrLevelSvc    *cefrservice.Service
	translationSvc  *transservice.Service
	vocabGameSvc    *vocabgamesvc.Service
}

// New creates a new vocab quiz service.
func New(db *pgxpool.Pool, cefrLevelSvc *cefrservice.Service, translationSvc *transservice.Service, vocabGameSvc *vocabgamesvc.Service) *Service {
	return &Service{
		db:             db,
		cefrLevelSvc:   cefrLevelSvc,
		translationSvc: translationSvc,
		vocabGameSvc:   vocabGameSvc,
	}
}

// CreateSessionAndQuestions creates a new vocab game session and generates questions for it.
func (s *Service) CreateSessionAndQuestions(ctx context.Context, userID int64, gameID int64, cefrLevelID int64, translationDirection string, questionCount int) (int64, []model.Question, error) {
	// Determine source and target languages based on translation direction
	var fromLangCode, toLangCode string
	if translationDirection == "en-to-vi" {
		fromLangCode = "en"
		toLangCode = "vi"
	} else if translationDirection == "vi-to-en" {
		fromLangCode = "vi"
		toLangCode = "en"
	} else {
		return 0, nil, errors.New("invalid translation direction")
	}

	// Get language IDs
	var fromLangID, toLangID int64
	err := s.db.QueryRow(ctx, `SELECT id FROM languages WHERE code = $1`, fromLangCode).Scan(&fromLangID)
	if err != nil {
		return 0, nil, fmt.Errorf("failed to get from language ID: %w", err)
	}
	err = s.db.QueryRow(ctx, `SELECT id FROM languages WHERE code = $1`, toLangCode).Scan(&toLangID)
	if err != nil {
		return 0, nil, fmt.Errorf("failed to get to language ID: %w", err)
	}

	// Get CEFR level to determine which levels to include
	cefrLevel, err := s.cefrLevelSvc.GetByID(cefrLevelID)
	if err != nil {
		return 0, nil, fmt.Errorf("invalid CEFR level: %w", err)
	}

	// Get all levels up to and including the selected level (hierarchical inclusion)
	levels, err := s.cefrLevelSvc.GetLevelsUpTo(cefrLevel.Code)
	if err != nil {
		return 0, nil, fmt.Errorf("failed to get levels: %w", err)
	}

	if len(levels) == 0 {
		return 0, nil, errors.New("no CEFR levels found")
	}

	// Extract level IDs
	levelIDs := make([]int64, len(levels))
	for i, level := range levels {
		levelIDs[i] = level.ID
	}

	// Generate questions (get translations with word texts)
	questions, sessionQuestions, err := s.generateQuestionsWithTranslations(ctx, fromLangCode, toLangCode, levelIDs, questionCount)
	if err != nil {
		return 0, nil, fmt.Errorf("failed to generate questions: %w", err)
	}

	if len(questions) == 0 {
		return 0, nil, errors.New("no questions available for the selected level. Please try a different level or check back later")
	}

	// Create session
	session := &vocabgamemodel.VocabGameSession{
		UserID:         userID,
		GameID:         gameID,
		CefrLevelID:    cefrLevelID,
		FromLanguageID: fromLangID,
		ToLanguageID:   toLangID,
		TotalQuestions: len(questions),
		CorrectAnswers: 0,
	}

	sessionID, err := s.vocabGameSvc.CreateSession(ctx, session)
	if err != nil {
		return 0, nil, fmt.Errorf("failed to create session: %w", err)
	}

	// Set session IDs in session questions
	for i := range sessionQuestions {
		sessionQuestions[i].SessionID = sessionID
		sessionQuestions[i].QuestionNo = i + 1
	}

	// Create questions in database
	err = s.vocabGameSvc.CreateSessionQuestions(ctx, sessionID, sessionQuestions)
	if err != nil {
		return 0, nil, fmt.Errorf("failed to create session questions: %w", err)
	}

	// Set session question IDs in returned questions
	// We need to fetch them back to get the IDs
	dbQuestions, err := s.vocabGameSvc.GetSessionQuestions(ctx, sessionID)
	if err != nil {
		return 0, nil, fmt.Errorf("failed to get session questions: %w", err)
	}

	// Map database questions to model questions by question number
	for i := range questions {
		if i < len(dbQuestions) {
			// Update question with session question ID
			questions[i].ID = dbQuestions[i].ID
			questions[i].SessionQuestionID = dbQuestions[i].ID
		}
	}

	return sessionID, questions, nil
}

// generateQuestionsWithTranslations generates questions and returns both the display format and database format.
func (s *Service) generateQuestionsWithTranslations(ctx context.Context, fromLangCode, toLangCode string, levelIDs []int64, count int) ([]model.Question, []vocabgamemodel.VocabGameSessionQuestion, error) {
	// Get words with translations for the specified levels
	query := `
		SELECT 
			w.id as word_id,
			w.word_text,
			t.id as translation_id,
			w_target.id as target_word_id,
			w_target.word_text as target_word_text
		FROM words w
		JOIN translations t ON w.id = t.from_word_id
		JOIN words w_target ON t.to_word_id = w_target.id
		JOIN languages l_source ON w.language_id = l_source.id
		JOIN languages l_target ON w_target.language_id = l_target.id
		WHERE l_source.code = $1
		AND l_target.code = $2
		AND (t.cefr_level_id = ANY($3) OR t.cefr_level_id IS NULL)
		ORDER BY RANDOM()
		LIMIT $4
	`

	rows, err := s.db.Query(ctx, query, fromLangCode, toLangCode, levelIDs, count)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to query words: %w", err)
	}
	defer rows.Close()

	var wordTranslations []struct {
		WordID          int64
		WordText        string
		TranslationID   int64
		TargetWordID    int64
		TargetWordText  string
	}

	for rows.Next() {
		var wt struct {
			WordID          int64
			WordText        string
			TranslationID   int64
			TargetWordID    int64
			TargetWordText  string
		}
		if err := rows.Scan(&wt.WordID, &wt.WordText, &wt.TranslationID, &wt.TargetWordID, &wt.TargetWordText); err != nil {
			return nil, nil, fmt.Errorf("failed to scan word: %w", err)
		}
		wordTranslations = append(wordTranslations, wt)
	}

	if len(wordTranslations) == 0 {
		return nil, nil, errors.New("no words available")
	}

	// Generate questions
	questions := make([]model.Question, 0, len(wordTranslations))
	sessionQuestions := make([]vocabgamemodel.VocabGameSessionQuestion, 0, len(wordTranslations))
	rand.Seed(time.Now().UnixNano())

	for i, wt := range wordTranslations {
		// Get distractors: find 3 other translations that have the same target language
		// We need translation IDs for distractors, not word IDs
		distractorTranslationIDs, err := s.getDistractorTranslationIDs(ctx, toLangCode, wt.TranslationID, levelIDs, 3)
		if err != nil {
			// Continue with fewer distractors if needed
			distractorTranslationIDs = []int64{}
		}

		// Ensure we have exactly 4 options (1 correct + 3 distractors)
		// If we don't have enough distractors, we'll use what we have
		totalOptions := 1 + len(distractorTranslationIDs)
		if totalOptions < 2 {
			continue // Skip if we can't create at least 2 options
		}
		if totalOptions > 4 {
			totalOptions = 4
			distractorTranslationIDs = distractorTranslationIDs[:3]
		}

		// Get word texts for all options
		optionTranslationIDs := make([]int64, 4)
		optionTexts := make([]string, 4)
		optionWordIDs := make([]int64, 4)

		// Correct answer is the translation we're testing
		optionTranslationIDs[0] = wt.TranslationID
		optionTexts[0] = wt.TargetWordText
		optionWordIDs[0] = wt.TargetWordID

		// Get distractors
		for j := 0; j < len(distractorTranslationIDs) && j < 3; j++ {
			optionTranslationIDs[j+1] = distractorTranslationIDs[j]
			// Get word text for this translation
			var distractorWordID int64
			var distractorText string
			err := s.db.QueryRow(ctx, `
				SELECT to_word_id, w.word_text
				FROM translations t
				JOIN words w ON t.to_word_id = w.id
				WHERE t.id = $1`,
				distractorTranslationIDs[j],
			).Scan(&distractorWordID, &distractorText)
			if err != nil {
				continue // Skip this distractor if we can't get the text
			}
			optionTexts[j+1] = distractorText
			optionWordIDs[j+1] = distractorWordID
		}

		// Shuffle options (keeping track of correct answer position)
		type optionData struct {
			TranslationID int64
			Text          string
			WordID        int64
			Index         int
		}
		optionsData := make([]optionData, totalOptions)
		for j := 0; j < totalOptions; j++ {
			optionsData[j] = optionData{
				TranslationID: optionTranslationIDs[j],
				Text:          optionTexts[j],
				WordID:        optionWordIDs[j],
				Index:         j,
			}
		}

		rand.Shuffle(len(optionsData), func(i, j int) {
			optionsData[i], optionsData[j] = optionsData[j], optionsData[i]
		})

		// Find correct answer position after shuffle
		correctOption := ""
		optionLetters := []string{"A", "B", "C", "D"}
		displayOptions := make([]model.Option, totalOptions)

		for j := 0; j < totalOptions; j++ {
			if optionsData[j].Index == 0 {
				correctOption = optionLetters[j]
			}
			letter := optionLetters[j]
			// Convert to lowercase for display
			if len(letter) > 0 && letter[0] >= 'A' && letter[0] <= 'Z' {
				letter = string(letter[0] + 32)
			}
			displayOptions[j] = model.Option{
				Letter: letter,
				Text:   optionsData[j].Text,
				WordID: optionsData[j].WordID,
			}
		}

		// Convert correct option to lowercase for display
		correctOptionLower := correctOption
		if len(correctOption) > 0 && correctOption[0] >= 'A' && correctOption[0] <= 'Z' {
			correctOptionLower = string(correctOption[0] + 32)
		}

		// Create question for display
		question := model.Question{
			ID:            int64(i + 1), // Will be updated with session question ID
			WordID:        wt.WordID,
			WordText:      wt.WordText,
			TranslationID: wt.TranslationID,
			Options:       displayOptions,
			CorrectAnswer: correctOptionLower,
		}
		questions = append(questions, question)

		// Create session question for database
		// Map options to A, B, C, D based on shuffled position
		var optionA, optionB, optionC, optionD int64
		for j := 0; j < totalOptions && j < 4; j++ {
			switch j {
			case 0:
				optionA = optionsData[j].TranslationID
			case 1:
				optionB = optionsData[j].TranslationID
			case 2:
				optionC = optionsData[j].TranslationID
			case 3:
				optionD = optionsData[j].TranslationID
			}
		}

		// Fill remaining options with the correct answer if we have fewer than 4 options
		if totalOptions < 4 {
			for j := totalOptions; j < 4; j++ {
				switch j {
				case 1:
					optionB = wt.TranslationID
				case 2:
					optionC = wt.TranslationID
				case 3:
					optionD = wt.TranslationID
				}
			}
		}

		sessionQuestion := vocabgamemodel.VocabGameSessionQuestion{
			SessionID:             0, // Will be set after session creation
			QuestionNo:            i + 1,
			TranslationID:         wt.TranslationID,
			OptionATranslationID:  optionA,
			OptionBTranslationID:  optionB,
			OptionCTranslationID:  optionC,
			OptionDTranslationID:  optionD,
			CorrectOption:         correctOption,
		}
		sessionQuestions = append(sessionQuestions, sessionQuestion)
	}

	return questions, sessionQuestions, nil
}

// getDistractorTranslationIDs gets translation IDs for distractors.
func (s *Service) getDistractorTranslationIDs(ctx context.Context, toLangCode string, excludeTranslationID int64, levelIDs []int64, limit int) ([]int64, error) {
	// Get the target language ID
	var toLangID int64
	err := s.db.QueryRow(ctx, `SELECT id FROM languages WHERE code = $1`, toLangCode).Scan(&toLangID)
	if err != nil {
		return nil, fmt.Errorf("failed to get target language ID: %w", err)
	}

	// Get the exclude word ID from the translation
	var excludeWordID int64
	err = s.db.QueryRow(ctx, `SELECT to_word_id FROM translations WHERE id = $1`, excludeTranslationID).Scan(&excludeWordID)
	if err != nil {
		return nil, fmt.Errorf("failed to get exclude word ID: %w", err)
	}

	// Query for distractor translations
	query := `
		SELECT DISTINCT t.id
		FROM translations t
		JOIN words w ON t.to_word_id = w.id
		WHERE w.language_id = $1
		AND t.to_word_id != $2
		AND (t.cefr_level_id = ANY($3) OR t.cefr_level_id IS NULL)
		ORDER BY RANDOM()
		LIMIT $4
	`

	rows, err := s.db.Query(ctx, query, toLangID, excludeWordID, levelIDs, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to query distractors: %w", err)
	}
	defer rows.Close()

	var translationIDs []int64
	for rows.Next() {
		var id int64
		if err := rows.Scan(&id); err != nil {
			return nil, fmt.Errorf("failed to scan distractor: %w", err)
		}
		translationIDs = append(translationIDs, id)
	}

	return translationIDs, nil
}

// SubmitAnswer submits an answer for a session question.
func (s *Service) SubmitAnswer(ctx context.Context, sessionQuestionID int64, chosenOption string, timeSpentMs *int) (bool, error) {
	return s.vocabGameSvc.SubmitAnswer(ctx, sessionQuestionID, chosenOption, timeSpentMs)
}

// FinishSession marks a session as finished.
func (s *Service) FinishSession(ctx context.Context, sessionID int64) error {
	return s.vocabGameSvc.FinishSession(ctx, sessionID)
}

// GetSessionStatistics retrieves statistics for a session.
func (s *Service) GetSessionStatistics(ctx context.Context, sessionID int64) (*model.SessionStatistics, error) {
	session, err := s.vocabGameSvc.GetSession(ctx, sessionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get session: %w", err)
	}

	correctCount := session.CorrectAnswers
	
	// Count total answered questions by counting answers
	var totalAnswered int
	err = s.db.QueryRow(ctx, `
		SELECT COUNT(*)
		FROM vocab_game_session_answers a
		JOIN vocab_game_session_questions q ON a.session_question_id = q.id
		WHERE q.session_id = $1`,
		sessionID,
	).Scan(&totalAnswered)
	if err != nil {
		return nil, fmt.Errorf("failed to count answered questions: %w", err)
	}
	
	incorrectCount := totalAnswered - correctCount

	var accuracyPercentage float64
	if totalAnswered > 0 {
		accuracyPercentage = float64(correctCount) / float64(totalAnswered) * 100.0
	}

	// Calculate time elapsed
	var timeElapsed *float64
	if session.FinishedAt != nil {
		elapsed := session.FinishedAt.Sub(session.StartedAt).Seconds()
		timeElapsed = &elapsed
	} else {
		// Calculate elapsed time from start to now
		elapsed := time.Since(session.StartedAt).Seconds()
		timeElapsed = &elapsed
	}

	stats := &model.SessionStatistics{
		SessionID:          sessionID,
		TotalScore:         correctCount, // Score is just correct count
		CorrectCount:       correctCount,
		IncorrectCount:     incorrectCount,
		AccuracyPercentage: accuracyPercentage,
		TimeElapsed:        timeElapsed,
	}

	return stats, nil
}

// GetSessionByQuestionID retrieves a session by question ID.
func (s *Service) GetSessionByQuestionID(ctx context.Context, sessionQuestionID int64) (*vocabgamemodel.VocabGameSession, error) {
	// Get the session ID from the question
	var sessionID int64
	err := s.db.QueryRow(ctx, `SELECT session_id FROM vocab_game_session_questions WHERE id = $1`, sessionQuestionID).Scan(&sessionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get session ID: %w", err)
	}

	// Get the session
	session, err := s.vocabGameSvc.GetSession(ctx, sessionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get session: %w", err)
	}

	return session, nil
}
