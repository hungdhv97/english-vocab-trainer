package service

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/example/model"
)

// Service provides example-related operations.
type Service struct {
	db *pgxpool.Pool
}

// New creates a new example service.
func New(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

// GetByWord returns all examples for a word.
func (s *Service) GetByWord(wordID int64) ([]model.Example, error) {
	ctx := context.Background()
	rows, err := s.db.Query(ctx, `
		SELECT id, word_id, example_text, translation_text, cefr_level_id, language_id, created_at, updated_at
		FROM examples
		WHERE word_id = $1
		ORDER BY created_at
	`, wordID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var examples []model.Example
	for rows.Next() {
		var e model.Example
		var cefrLevelID *int64
		if err := rows.Scan(&e.ID, &e.WordID, &e.ExampleText, &e.TranslationText, &cefrLevelID, &e.LanguageID, &e.CreatedAt, &e.UpdatedAt); err != nil {
			return nil, err
		}
		e.CefrLevelID = cefrLevelID
		examples = append(examples, e)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return examples, nil
}

// GetByLevel returns all examples for a specific CEFR level.
func (s *Service) GetByLevel(cefrLevelID int64) ([]model.Example, error) {
	ctx := context.Background()
	rows, err := s.db.Query(ctx, `
		SELECT id, word_id, example_text, translation_text, cefr_level_id, language_id, created_at, updated_at
		FROM examples
		WHERE cefr_level_id = $1
		ORDER BY created_at
	`, cefrLevelID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var examples []model.Example
	for rows.Next() {
		var e model.Example
		var cefrLevelID *int64
		if err := rows.Scan(&e.ID, &e.WordID, &e.ExampleText, &e.TranslationText, &cefrLevelID, &e.LanguageID, &e.CreatedAt, &e.UpdatedAt); err != nil {
			return nil, err
		}
		e.CefrLevelID = cefrLevelID
		examples = append(examples, e)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return examples, nil
}

