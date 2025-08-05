package service

import "github.com/gemini-demo-apps/vocab-app/internal/models"

// WordRepository defines database operations for words.
type WordRepository interface {
	GetRandomWords(level int, limit int) ([]models.Word, error)
	GetWordByEnglish(english string) (models.Word, error)
}

// Service exposes application business logic.
type Service interface {
	GetRandomWords(level int, limit int) ([]models.Word, error)
	GetWordByEnglish(english string) (models.Word, error)
}

type service struct {
	repo WordRepository
}

// NewService creates a new Service.
func NewService(r WordRepository) Service {
	return &service{repo: r}
}

// GetRandomWords returns a random subset of words for a level.
func (s *service) GetRandomWords(level int, limit int) ([]models.Word, error) {
	return s.repo.GetRandomWords(level, limit)
}

// GetWordByEnglish retrieves a word by its English value.
func (s *service) GetWordByEnglish(english string) (models.Word, error) {
	return s.repo.GetWordByEnglish(english)
}
