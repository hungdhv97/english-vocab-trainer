package jobs

import (
	"context"
	"log"
	"regexp"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/robfig/cron/v3"

	"github.com/hungdhv97/english-vocab-trainer/backend/internal/platform/translator"
)

// cleanSpecialCharacters removes special characters from Vietnamese text
func cleanSpecialCharacters(text string) string {
	// Remove common punctuation marks like ?, !, ., etc.
	re := regexp.MustCompile(`[?!.,;:()"\-\[\]{}…""''‚„«»‹›]`)
	cleaned := re.ReplaceAllString(text, "")

	// Remove extra whitespace that might be left after removing punctuation
	cleaned = strings.TrimSpace(cleaned)
	cleaned = regexp.MustCompile(`\s+`).ReplaceAllString(cleaned, " ")

	return cleaned
}

// registerTranslateMissing schedules a job to translate English words that don't have Vietnamese translations
func registerTranslateMissing(c *cron.Cron, db *pgxpool.Pool, deepLTranslator *translator.DeepLTranslator, schedule string, batchSize int) {
	_, err := c.AddFunc(schedule, func() {
		if err := translateMissingVietnamese(db, deepLTranslator, batchSize); err != nil {
			log.Printf("Error in translate missing job: %v", err)
		}
	})
	if err != nil {
		log.Printf("Failed to register translate missing job: %v", err)
	} else {
		log.Printf("Translate missing job registered successfully with schedule: %s", schedule)
	}
}

// translateMissingVietnamese finds English words without Vietnamese translations and translates them
func translateMissingVietnamese(db *pgxpool.Pool, deepLTranslator *translator.DeepLTranslator, batchSize int) error {
	ctx := context.Background()

	// Find English words that don't have Vietnamese translations
	query := `
		SELECT w.word_id, w.concept_id, w.word_text, w.difficulty
		FROM words w
		WHERE w.language_code = 'en'
		AND NOT EXISTS (
			SELECT 1
			FROM words w2
			WHERE w2.concept_id = w.concept_id
			AND LOWER(w2.language_code) = 'vi'
		)
		ORDER BY w.word_id
		LIMIT $1
	`

	rows, err := db.Query(ctx, query, batchSize)
	if err != nil {
		return err
	}
	defer rows.Close()

	translatedCount := 0

	for rows.Next() {
		var wordID int64
		var conceptID uuid.UUID
		var wordText string
		var difficulty string

		if err := rows.Scan(&wordID, &conceptID, &wordText, &difficulty); err != nil {
			log.Printf("Error scanning row: %v", err)
			continue
		}

		// Translate the English word to Vietnamese
		vietnameseText, err := deepLTranslator.Translate(wordText, "en", "vi")
		if err != nil {
			log.Printf("Error translating word '%s': %v", wordText, err)
			continue
		}

		// Clean special characters from Vietnamese text
		vietnameseText = cleanSpecialCharacters(vietnameseText)

		// Convert to lowercase before inserting
		vietnameseText = strings.ToLower(vietnameseText)

		// Insert the Vietnamese translation
		_, insertErr := db.Exec(ctx, `
			INSERT INTO words (concept_id, language_code, word_text, difficulty, is_primary)
			VALUES ($1, 'vi', $2, $3, true)
			ON CONFLICT (concept_id, language_code, word_text) DO NOTHING
		`, conceptID, vietnameseText, difficulty)

		if insertErr != nil {
			log.Printf("Error inserting Vietnamese translation for '%s': %v", wordText, insertErr)
			continue
		}

		translatedCount++
		log.Printf("Translated '%s' to '%s'", wordText, vietnameseText)
	}

	if err := rows.Err(); err != nil {
		return err
	}

	log.Printf("Translation job completed. Translated %d words.", translatedCount)
	return nil
}
