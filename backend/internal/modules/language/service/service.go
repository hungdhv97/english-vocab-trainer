package service

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/language/model"
)

// Service provides language-related operations.
type Service struct {
	db *pgxpool.Pool
}

// New creates a new language service.
func New(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

// List returns all languages.
func (s *Service) List() ([]model.Language, error) {
	ctx := context.Background()
	rows, err := s.db.Query(ctx, `SELECT id, code, name FROM languages ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var languages []model.Language
	for rows.Next() {
		var l model.Language
		if err := rows.Scan(&l.ID, &l.Code, &l.Name); err != nil {
			return nil, err
		}
		languages = append(languages, l)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return languages, nil
}

// GetByCode returns a language by its code.
func (s *Service) GetByCode(code string) (*model.Language, error) {
	ctx := context.Background()
	var l model.Language
	err := s.db.QueryRow(ctx, `SELECT id, code, name FROM languages WHERE code = $1`, code).
		Scan(&l.ID, &l.Code, &l.Name)
	if err != nil {
		return nil, err
	}
	return &l, nil
}

