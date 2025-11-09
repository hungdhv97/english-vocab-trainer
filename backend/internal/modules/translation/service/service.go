package service

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/translation/model"
)

// Service provides translation-related operations.
type Service struct {
	db *pgxpool.Pool
}

// New creates a new translation service.
func New(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

// GetByWord returns all translations for a word (both as from_word and to_word).
func (s *Service) GetByWord(wordID int64) ([]model.Translation, error) {
	ctx := context.Background()
	rows, err := s.db.Query(ctx, `
		SELECT id, from_word_id, to_word_id, cefr_level_id, meaning_order, note, created_at
		FROM translations
		WHERE from_word_id = $1 OR to_word_id = $1
		ORDER BY meaning_order
	`, wordID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var translations []model.Translation
	for rows.Next() {
		var t model.Translation
		var cefrLevelID *int64
		if err := rows.Scan(&t.ID, &t.FromWordID, &t.ToWordID, &cefrLevelID, &t.MeaningOrder, &t.Note, &t.CreatedAt); err != nil {
			return nil, err
		}
		t.CefrLevelID = cefrLevelID
		translations = append(translations, t)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return translations, nil
}

// GetByLevel returns all translations for a specific CEFR level.
func (s *Service) GetByLevel(cefrLevelID int64) ([]model.Translation, error) {
	ctx := context.Background()
	rows, err := s.db.Query(ctx, `
		SELECT id, from_word_id, to_word_id, cefr_level_id, meaning_order, note, created_at
		FROM translations
		WHERE cefr_level_id = $1
		ORDER BY meaning_order
	`, cefrLevelID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var translations []model.Translation
	for rows.Next() {
		var t model.Translation
		var cefrLevelID *int64
		if err := rows.Scan(&t.ID, &t.FromWordID, &t.ToWordID, &cefrLevelID, &t.MeaningOrder, &t.Note, &t.CreatedAt); err != nil {
			return nil, err
		}
		t.CefrLevelID = cefrLevelID
		translations = append(translations, t)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return translations, nil
}

// GetDistractors returns a list of word IDs that can be used as distractors for multiple-choice questions.
// It returns words from the same CEFR level(s) but excludes the correct answer word ID.
// If cefrLevelIDs is empty or nil, it will return words from any level.
func (s *Service) GetDistractors(cefrLevelIDs []int64, excludeWordID int64, limit int) ([]int64, error) {
	ctx := context.Background()
	
	var rows pgx.Rows
	var err error

	if len(cefrLevelIDs) == 0 {
		// If no level IDs provided, get distractors from any level
		rows, err = s.db.Query(ctx, `
			SELECT DISTINCT t.to_word_id
			FROM translations t
			WHERE t.to_word_id != $1
			ORDER BY RANDOM()
			LIMIT $2
		`, excludeWordID, limit)
	} else {
		rows, err = s.db.Query(ctx, `
			SELECT DISTINCT t.to_word_id
			FROM translations t
			WHERE t.cefr_level_id = ANY($1)
			AND t.to_word_id != $2
			ORDER BY RANDOM()
			LIMIT $3
		`, cefrLevelIDs, excludeWordID, limit)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var wordIDs []int64
	for rows.Next() {
		var wordID int64
		if err := rows.Scan(&wordID); err != nil {
			return nil, err
		}
		wordIDs = append(wordIDs, wordID)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return wordIDs, nil
}

// GetByFromWord returns translations where the word is the source (from_word).
func (s *Service) GetByFromWord(fromWordID int64, cefrLevelID *int64) ([]model.Translation, error) {
	ctx := context.Background()
	
	query := `
		SELECT id, from_word_id, to_word_id, cefr_level_id, meaning_order, note, created_at
		FROM translations
		WHERE from_word_id = $1
	`
	args := []interface{}{fromWordID}
	
	if cefrLevelID != nil {
		query += ` AND cefr_level_id = $2`
		args = append(args, *cefrLevelID)
	}
	
	query += ` ORDER BY meaning_order`

	rows, err := s.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var translations []model.Translation
	for rows.Next() {
		var t model.Translation
		var cefrLevelID *int64
		if err := rows.Scan(&t.ID, &t.FromWordID, &t.ToWordID, &cefrLevelID, &t.MeaningOrder, &t.Note, &t.CreatedAt); err != nil {
			return nil, err
		}
		t.CefrLevelID = cefrLevelID
		translations = append(translations, t)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return translations, nil
}

