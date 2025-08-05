package service

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"math/rand"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/models"
)

// Service provides game operations backed by an in-memory store.
type Service struct {
	mu         sync.Mutex
	users      map[string]models.User // username -> user
	words      []models.Word
	plays      []models.Play
	nextUserID int64
	nextWordID int64
	nextPlayID int64
}

// NewService creates a new Service with seed data.
func NewService() *Service {
	s := &Service{
		users: make(map[string]models.User),
	}
	s.seedWords()
	return s
}

// seedWords loads a few sample word pairs.
func (s *Service) seedWords() {
	s.addWordPair("apple", "táo", "easy")
	s.addWordPair("banana", "chuối", "easy")
	s.addWordPair("cat", "mèo", "easy")
}

func (s *Service) addWordPair(en, vi, diff string) {
	concept := uuid.New()
	s.nextWordID++
	w1 := models.Word{ID: s.nextWordID, ConceptID: concept, LanguageCode: "en", WordText: en, Difficulty: diff}
	s.nextWordID++
	w2 := models.Word{ID: s.nextWordID, ConceptID: concept, LanguageCode: "vi", WordText: vi, Difficulty: diff}
	s.words = append(s.words, w1, w2)
}

// RegisterUser registers a new user with hashed password.
func (s *Service) RegisterUser(username, password string) (models.User, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, exists := s.users[username]; exists {
		return models.User{}, errors.New("username already exists")
	}
	hashBytes := sha256.Sum256([]byte(password))
	s.nextUserID++
	user := models.User{
		ID:           s.nextUserID,
		Username:     username,
		PasswordHash: hex.EncodeToString(hashBytes[:]),
		CreatedAt:    time.Now(),
	}
	s.users[username] = user
	return user, nil
}

// Authenticate verifies user credentials.
func (s *Service) Authenticate(username, password string) (models.User, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	user, ok := s.users[username]
	if !ok {
		return models.User{}, errors.New("user not found")
	}
	hashBytes := sha256.Sum256([]byte(password))
	if user.PasswordHash != hex.EncodeToString(hashBytes[:]) {
		return models.User{}, errors.New("invalid credentials")
	}
	return user, nil
}

// GetRandomWords returns random words matching language and difficulty.
func (s *Service) GetRandomWords(count int, language, difficulty string) ([]models.Word, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	var filtered []models.Word
	for _, w := range s.words {
		if w.LanguageCode == language && w.Difficulty == difficulty {
			filtered = append(filtered, w)
		}
	}
	if len(filtered) == 0 {
		return nil, errors.New("no words found")
	}
	rand.Seed(time.Now().UnixNano())
	rand.Shuffle(len(filtered), func(i, j int) { filtered[i], filtered[j] = filtered[j], filtered[i] })
	if count > len(filtered) {
		count = len(filtered)
	}
	return filtered[:count], nil
}

// RecordPlay stores a play result.
func (s *Service) RecordPlay(p models.Play) (models.Play, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.nextPlayID++
	p.ID = s.nextPlayID
	p.PlayedAt = time.Now()
	s.plays = append(s.plays, p)
	return p, nil
}

// GetHistory returns all plays for a user.
func (s *Service) GetHistory(userID int64) ([]models.Play, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	var out []models.Play
	for _, p := range s.plays {
		if p.UserID == userID {
			out = append(out, p)
		}
	}
	return out, nil
}

// GetTranslation finds the translation for a word in another language.
func (s *Service) GetTranslation(wordID int64, language string) (string, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	var concept uuid.UUID
	for _, w := range s.words {
		if w.ID == wordID {
			concept = w.ConceptID
			break
		}
	}
	if concept == uuid.Nil {
		return "", errors.New("word not found")
	}
	for _, w := range s.words {
		if w.ConceptID == concept && strings.EqualFold(w.LanguageCode, language) {
			return w.WordText, nil
		}
	}
	return "", errors.New("translation not found")
}

// CreateSession generates a new session tag.
func (s *Service) CreateSession() uuid.UUID {
	return uuid.New()
}
