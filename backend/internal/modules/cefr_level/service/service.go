package service

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/cefr_level/model"
)

// Service provides CEFR level-related operations.
type Service struct {
	db *pgxpool.Pool
}

// New creates a new CEFR level service.
func New(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

// List returns all CEFR levels.
func (s *Service) List() ([]model.CefrLevel, error) {
	ctx := context.Background()
	rows, err := s.db.Query(ctx, `SELECT id, code, group_name, level_name, description FROM cefr_levels ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var levels []model.CefrLevel
	for rows.Next() {
		var l model.CefrLevel
		if err := rows.Scan(&l.ID, &l.Code, &l.GroupName, &l.LevelName, &l.Description); err != nil {
			return nil, err
		}
		levels = append(levels, l)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return levels, nil
}

// GetByCode returns a CEFR level by its code.
func (s *Service) GetByCode(code string) (*model.CefrLevel, error) {
	ctx := context.Background()
	var l model.CefrLevel
	err := s.db.QueryRow(ctx, `SELECT id, code, group_name, level_name, description FROM cefr_levels WHERE code = $1`, code).
		Scan(&l.ID, &l.Code, &l.GroupName, &l.LevelName, &l.Description)
	if err != nil {
		return nil, err
	}
	return &l, nil
}

// GetByID returns a CEFR level by its ID.
func (s *Service) GetByID(id int64) (*model.CefrLevel, error) {
	ctx := context.Background()
	var l model.CefrLevel
	err := s.db.QueryRow(ctx, `SELECT id, code, group_name, level_name, description FROM cefr_levels WHERE id = $1`, id).
		Scan(&l.ID, &l.Code, &l.GroupName, &l.LevelName, &l.Description)
	if err != nil {
		return nil, err
	}
	return &l, nil
}

// GetLevelsUpTo returns all CEFR levels up to and including the specified level.
// This is used for hierarchical level inclusion (e.g., A2 includes A1).
func (s *Service) GetLevelsUpTo(code string) ([]model.CefrLevel, error) {
	ctx := context.Background()
	
	// CEFR level order: A1, A2, B1, B2, C1, C2
	levelOrder := map[string]int{
		"A1": 1,
		"A2": 2,
		"B1": 3,
		"B2": 4,
		"C1": 5,
		"C2": 6,
	}

	targetOrder, exists := levelOrder[code]
	if !exists {
		// If code is not recognized, return empty list
		return []model.CefrLevel{}, nil
	}

	rows, err := s.db.Query(ctx, `
		SELECT id, code, group_name, level_name, description 
		FROM cefr_levels 
		WHERE CASE code
			WHEN 'A1' THEN 1
			WHEN 'A2' THEN 2
			WHEN 'B1' THEN 3
			WHEN 'B2' THEN 4
			WHEN 'C1' THEN 5
			WHEN 'C2' THEN 6
		END <= $1
		ORDER BY id
	`, targetOrder)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var levels []model.CefrLevel
	for rows.Next() {
		var l model.CefrLevel
		if err := rows.Scan(&l.ID, &l.Code, &l.GroupName, &l.LevelName, &l.Description); err != nil {
			return nil, err
		}
		levels = append(levels, l)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return levels, nil
}

