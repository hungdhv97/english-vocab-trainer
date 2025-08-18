package service

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/level/model"
)

// Service provides level-related operations.
type Service struct {
	db *pgxpool.Pool
}

// New creates a new level service.
func New(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

// List returns all active levels.
func (s *Service) List() ([]model.Level, error) {
	ctx := context.Background()
	rows, err := s.db.Query(ctx, `SELECT level_id, code, name, description, difficulty, scoring_config FROM levels WHERE is_active = true ORDER BY level_id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []model.Level
	for rows.Next() {
		var l model.Level
		if err := rows.Scan(&l.ID, &l.Code, &l.Name, &l.Description, &l.Difficulty, &l.ScoringConfig); err != nil {
			return nil, err
		}
		out = append(out, l)
	}
	return out, nil
}
