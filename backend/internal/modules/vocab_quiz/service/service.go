package service

import (
	"context"
	"errors"
	"fmt"
	"log"
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
	log.Printf("[generateQuestionsWithTranslations] Starting - fromLang: %s, toLang: %s, levelIDs: %v, count: %d", fromLangCode, toLangCode, levelIDs, count)
	
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

	log.Printf("[generateQuestionsWithTranslations] Executing query with params: fromLang=%s, toLang=%s, levelIDs=%v, count=%d", fromLangCode, toLangCode, levelIDs, count)
	rows, err := s.db.Query(ctx, query, fromLangCode, toLangCode, levelIDs, count)
	if err != nil {
		log.Printf("[generateQuestionsWithTranslations] Query failed: %v", err)
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

	rowCount := 0
	for rows.Next() {
		var wt struct {
			WordID          int64
			WordText        string
			TranslationID   int64
			TargetWordID    int64
			TargetWordText  string
		}
		if err := rows.Scan(&wt.WordID, &wt.WordText, &wt.TranslationID, &wt.TargetWordID, &wt.TargetWordText); err != nil {
			log.Printf("[generateQuestionsWithTranslations] Failed to scan row %d: %v", rowCount, err)
			return nil, nil, fmt.Errorf("failed to scan word: %w", err)
		}
		wordTranslations = append(wordTranslations, wt)
		rowCount++
		log.Printf("[generateQuestionsWithTranslations] Scanned word: word_id=%d, word_text=%s, translation_id=%d, target_word_id=%d, target_word_text=%s", 
			wt.WordID, wt.WordText, wt.TranslationID, wt.TargetWordID, wt.TargetWordText)
	}

	if err := rows.Err(); err != nil {
		log.Printf("[generateQuestionsWithTranslations] Row iteration error: %v", err)
		return nil, nil, fmt.Errorf("error iterating rows: %w", err)
	}

	log.Printf("[generateQuestionsWithTranslations] Found %d word translations", len(wordTranslations))
	if len(wordTranslations) == 0 {
		log.Printf("[generateQuestionsWithTranslations] No words available for query")
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
		log.Printf("[generateQuestionsWithTranslations] Question %d: totalOptions=%d (1 correct + %d distractors)", 
			i+1, totalOptions, len(distractorTranslationIDs))
		
		if totalOptions < 2 {
			log.Printf("[generateQuestionsWithTranslations] Question %d: Skipping - insufficient options (%d < 2)", i+1, totalOptions)
			continue // Skip if we can't create at least 2 options
		}
		if totalOptions > 4 {
			log.Printf("[generateQuestionsWithTranslations] Question %d: Limiting to 4 options (had %d)", i+1, totalOptions)
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
		log.Printf("[generateQuestionsWithTranslations] Question %d: Fetching distractor texts for %d distractors", i+1, len(distractorTranslationIDs))
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
				log.Printf("[generateQuestionsWithTranslations] Question %d: Failed to get distractor text for translation_id=%d: %v", 
					i+1, distractorTranslationIDs[j], err)
				continue // Skip this distractor if we can't get the text
			}
			log.Printf("[generateQuestionsWithTranslations] Question %d: Distractor %d: translation_id=%d, word_id=%d, text=%s", 
				i+1, j+1, distractorTranslationIDs[j], distractorWordID, distractorText)
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
			log.Printf("[generateQuestionsWithTranslations] Question %d: Option %d (before shuffle): translation_id=%d, text=%s, word_id=%d, is_correct=%v", 
				i+1, j, optionTranslationIDs[j], optionTexts[j], optionWordIDs[j], j == 0)
		}

		rand.Shuffle(len(optionsData), func(i, j int) {
			optionsData[i], optionsData[j] = optionsData[j], optionsData[i]
		})

		log.Printf("[generateQuestionsWithTranslations] Question %d: Options shuffled", i+1)

		// Find correct answer position after shuffle
		correctOption := ""
		optionLetters := []string{"A", "B", "C", "D"}
		displayOptions := make([]model.Option, totalOptions)

		for j := 0; j < totalOptions; j++ {
			if optionsData[j].Index == 0 {
				correctOption = optionLetters[j]
				log.Printf("[generateQuestionsWithTranslations] Question %d: Correct answer is option %s (position %d after shuffle)", 
					i+1, correctOption, j)
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
			log.Printf("[generateQuestionsWithTranslations] Question %d: Option %s: text=%s, word_id=%d, is_correct=%v", 
				i+1, letter, optionsData[j].Text, optionsData[j].WordID, optionsData[j].Index == 0)
		}

		// Convert correct option to lowercase for display
		correctOptionLower := correctOption
		if len(correctOption) > 0 && correctOption[0] >= 'A' && correctOption[0] <= 'Z' {
			correctOptionLower = string(correctOption[0] + 32)
		}
		log.Printf("[generateQuestionsWithTranslations] Question %d: Correct option (lowercase): %s", i+1, correctOptionLower)

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
		log.Printf("[generateQuestionsWithTranslations] Question %d: Session question created - translation_id=%d, options=[A:%d, B:%d, C:%d, D:%d], correct=%s", 
			i+1, wt.TranslationID, optionA, optionB, optionC, optionD, correctOption)
		sessionQuestions = append(sessionQuestions, sessionQuestion)
		log.Printf("[generateQuestionsWithTranslations] Question %d: Successfully created", i+1)
	}

	log.Printf("[generateQuestionsWithTranslations] Completed - Generated %d questions, %d session questions", 
		len(questions), len(sessionQuestions))
	return questions, sessionQuestions, nil
}

// GenerateQuestionsWithTranslations is a public wrapper for generateQuestionsWithTranslations.
// It generates questions without creating a session (for backward compatibility).
func (s *Service) GenerateQuestionsWithTranslations(ctx context.Context, fromLangCode, toLangCode string, levelIDs []int64, count int) ([]model.Question, []vocabgamemodel.VocabGameSessionQuestion, error) {
	return s.generateQuestionsWithTranslations(ctx, fromLangCode, toLangCode, levelIDs, count)
}

// getDistractorTranslationIDs gets translation IDs for distractors.
func (s *Service) getDistractorTranslationIDs(ctx context.Context, toLangCode string, excludeTranslationID int64, levelIDs []int64, limit int) ([]int64, error) {
	log.Printf("[getDistractorTranslationIDs] Starting - toLangCode=%s, excludeTranslationID=%d, levelIDs=%v, limit=%d", 
		toLangCode, excludeTranslationID, levelIDs, limit)
	
	// Get the target language ID
	var toLangID int64
	err := s.db.QueryRow(ctx, `SELECT id FROM languages WHERE code = $1`, toLangCode).Scan(&toLangID)
	if err != nil {
		log.Printf("[getDistractorTranslationIDs] Failed to get target language ID for code=%s: %v", toLangCode, err)
		return nil, fmt.Errorf("failed to get target language ID: %w", err)
	}
	log.Printf("[getDistractorTranslationIDs] Target language ID: %d", toLangID)

	// Get the exclude word ID from the translation
	var excludeWordID int64
	err = s.db.QueryRow(ctx, `SELECT to_word_id FROM translations WHERE id = $1`, excludeTranslationID).Scan(&excludeWordID)
	if err != nil {
		log.Printf("[getDistractorTranslationIDs] Failed to get exclude word ID for translation_id=%d: %v", excludeTranslationID, err)
		return nil, fmt.Errorf("failed to get exclude word ID: %w", err)
	}
	log.Printf("[getDistractorTranslationIDs] Exclude word ID: %d", excludeWordID)

	// Query for distractor translations
	query := `
		SELECT id
		FROM (
			SELECT DISTINCT t.id
			FROM translations t
			JOIN words w ON t.to_word_id = w.id
			WHERE w.language_id = $1
			AND t.to_word_id != $2
			AND (t.cefr_level_id = ANY($3) OR t.cefr_level_id IS NULL)
		) sub
		ORDER BY RANDOM()
		LIMIT $4
	`

	log.Printf("[getDistractorTranslationIDs] Executing query with params: toLangID=%d, excludeWordID=%d, levelIDs=%v, limit=%d", 
		toLangID, excludeWordID, levelIDs, limit)
	rows, err := s.db.Query(ctx, query, toLangID, excludeWordID, levelIDs, limit)
	if err != nil {
		log.Printf("[getDistractorTranslationIDs] Query failed: %v", err)
		return nil, fmt.Errorf("failed to query distractors: %w", err)
	}
	defer rows.Close()

	var translationIDs []int64
	rowCount := 0
	for rows.Next() {
		var id int64
		if err := rows.Scan(&id); err != nil {
			log.Printf("[getDistractorTranslationIDs] Failed to scan row %d: %v", rowCount, err)
			return nil, fmt.Errorf("failed to scan distractor: %w", err)
		}
		translationIDs = append(translationIDs, id)
		rowCount++
		log.Printf("[getDistractorTranslationIDs] Found distractor translation_id=%d", id)
	}

	if err := rows.Err(); err != nil {
		log.Printf("[getDistractorTranslationIDs] Row iteration error: %v", err)
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	log.Printf("[getDistractorTranslationIDs] Completed - Found %d distractor translation IDs: %v", len(translationIDs), translationIDs)
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

// GetCefrLevelByID gets a CEFR level by ID.
func (s *Service) GetCefrLevelByID(ctx context.Context, levelID int64) (*struct {
	ID   int64
	Code string
}, error) {
	level, err := s.cefrLevelSvc.GetByID(levelID)
	if err != nil {
		return nil, err
	}
	return &struct {
		ID   int64
		Code string
	}{
		ID:   level.ID,
		Code: level.Code,
	}, nil
}

// GetCefrLevelsUpTo gets all CEFR levels up to and including the specified level code.
func (s *Service) GetCefrLevelsUpTo(ctx context.Context, levelCode string) ([]struct {
	ID   int64
	Code string
}, error) {
	levels, err := s.cefrLevelSvc.GetLevelsUpTo(levelCode)
	if err != nil {
		return nil, err
	}
	result := make([]struct {
		ID   int64
		Code string
	}, len(levels))
	for i, level := range levels {
		result[i] = struct {
			ID   int64
			Code string
		}{
			ID:   level.ID,
			Code: level.Code,
		}
	}
	return result, nil
}

// GetLeaderboard retrieves the top 10 players for a specific CEFR level and translation direction.
// Only includes players who have completed at least 5 games for this combination.
// Ranking is based on average accuracy percentage across all sessions.
func (s *Service) GetLeaderboard(ctx context.Context, gameID int64, cefrLevelID int64, translationDirection string) ([]model.LeaderboardEntry, string, error) {
	// Determine source and target languages based on translation direction
	var fromLangCode, toLangCode string
	if translationDirection == "en-to-vi" {
		fromLangCode = "en"
		toLangCode = "vi"
	} else if translationDirection == "vi-to-en" {
		fromLangCode = "vi"
		toLangCode = "en"
	} else {
		return nil, "", errors.New("invalid translation direction")
	}

	// Get language IDs
	var fromLangID, toLangID int64
	err := s.db.QueryRow(ctx, `SELECT id FROM languages WHERE code = $1`, fromLangCode).Scan(&fromLangID)
	if err != nil {
		return nil, "", fmt.Errorf("failed to get from language ID: %w", err)
	}
	err = s.db.QueryRow(ctx, `SELECT id FROM languages WHERE code = $1`, toLangCode).Scan(&toLangID)
	if err != nil {
		return nil, "", fmt.Errorf("failed to get to language ID: %w", err)
	}

	// Get CEFR level code
	var cefrLevelCode string
	err = s.db.QueryRow(ctx, `SELECT code FROM cefr_levels WHERE id = $1`, cefrLevelID).Scan(&cefrLevelCode)
	if err != nil {
		return nil, "", fmt.Errorf("failed to get CEFR level code: %w", err)
	}

	// Query for leaderboard entries
	// Calculate average accuracy percentage: SUM(correct_answers) / SUM(total_questions) * 100
	// Only include users who have played at least 1 finished games
	query := `
		WITH user_stats AS (
			SELECT
				vgs.user_id,
				COUNT(*) as games_played,
				SUM(vgs.correct_answers) as total_correct,
				SUM(vgs.total_questions) as total_questions
			FROM vocab_game_sessions vgs
			WHERE vgs.game_id = $1
				AND vgs.cefr_level_id = $2
				AND vgs.from_language_id = $3
				AND vgs.to_language_id = $4
				AND vgs.finished_at IS NOT NULL
			GROUP BY vgs.user_id
			HAVING COUNT(*) >= 1
		),
		user_accuracy AS (
			SELECT
				us.user_id,
				us.games_played,
				CASE 
					WHEN us.total_questions > 0 THEN
						(us.total_correct::float / us.total_questions::float * 100.0)
					ELSE 0.0
				END as accuracy_percentage
			FROM user_stats us
		),
		ranked_users AS (
			SELECT
				ua.user_id,
				u.username,
				ua.games_played,
				ua.accuracy_percentage,
				ROW_NUMBER() OVER (ORDER BY ua.accuracy_percentage DESC, ua.user_id ASC) as rank
			FROM user_accuracy ua
			JOIN users u ON ua.user_id = u.id
			WHERE u.is_active = TRUE
		)
		SELECT rank, user_id, username, accuracy_percentage, games_played
		FROM ranked_users
		WHERE rank <= 10
		ORDER BY rank ASC
	`

	rows, err := s.db.Query(ctx, query, gameID, cefrLevelID, fromLangID, toLangID)
	if err != nil {
		return nil, "", fmt.Errorf("failed to query leaderboard: %w", err)
	}
	defer rows.Close()

	var entries []model.LeaderboardEntry
	for rows.Next() {
		var entry model.LeaderboardEntry
		err := rows.Scan(
			&entry.Rank,
			&entry.UserID,
			&entry.Username,
			&entry.AccuracyPercentage,
			&entry.GamesPlayed,
		)
		if err != nil {
			return nil, "", fmt.Errorf("failed to scan leaderboard entry: %w", err)
		}
		entries = append(entries, entry)
	}

	if err := rows.Err(); err != nil {
		return nil, "", fmt.Errorf("error iterating leaderboard rows: %w", err)
	}

	// Return empty slice instead of nil if no entries found
	if entries == nil {
		entries = []model.LeaderboardEntry{}
	}

	return entries, cefrLevelCode, nil
}