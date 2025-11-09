package jobs

import (
	"context"
	"fmt"
	"log"
	"regexp"
	"strings"

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

// registerTranslateMissing schedules a job to translate English words that don't have Vietnamese translations.
// Updated to remove batchSize parameter - processes all words without translation (T064, T066).
func registerTranslateMissing(c *cron.Cron, db *pgxpool.Pool, deepLTranslator *translator.DeepLTranslator, schedule string) {
	_, err := c.AddFunc(schedule, func() {
		if err := translateMissingVietnamese(db, deepLTranslator); err != nil {
			log.Printf("Error in translate missing job: %v", err)
		}
	})
	if err != nil {
		log.Printf("Failed to register translate missing job: %v", err)
	} else {
		log.Printf("Translate missing job registered successfully with schedule: %s (full scan mode)", schedule)
	}
}

// translateMissingVietnamese finds English words without Vietnamese translations and translates them.
// Updated to use translations table and process all words (full scan) (T064, T065).
func translateMissingVietnamese(db *pgxpool.Pool, deepLTranslator *translator.DeepLTranslator) error {
	ctx := context.Background()

	// Get language IDs
	var enLangID, viLangID int64
	err := db.QueryRow(ctx, `SELECT id FROM languages WHERE code = 'en'`).Scan(&enLangID)
	if err != nil {
		return fmt.Errorf("failed to get English language ID: %w", err)
	}
	err = db.QueryRow(ctx, `SELECT id FROM languages WHERE code = 'vi'`).Scan(&viLangID)
	if err != nil {
		return fmt.Errorf("failed to get Vietnamese language ID: %w", err)
	}

	// Find English words that don't have Vietnamese translations in the translations table
	// This uses the new schema with translations table (T065)
	query := `
		SELECT w.id, w.word_text
		FROM words w
		WHERE w.language_id = $1
		AND NOT EXISTS (
			SELECT 1
			FROM translations t
			WHERE t.from_word_id = w.id
			AND EXISTS (
				SELECT 1
				FROM words w2
				WHERE w2.id = t.to_word_id
				AND w2.language_id = $2
			)
		)
		ORDER BY w.id
	`

	rows, err := db.Query(ctx, query, enLangID, viLangID)
	if err != nil {
		return fmt.Errorf("failed to query words: %w", err)
	}
	defer rows.Close()

	translatedCount := 0
	skippedCount := 0
	errorCount := 0

	log.Printf("Starting translation job (full scan mode)...")

	for rows.Next() {
		var wordID int64
		var wordText string

		if err := rows.Scan(&wordID, &wordText); err != nil {
			log.Printf("Error scanning row: %v", err)
			errorCount++
			continue
		}

		// Translate the English word to Vietnamese
		vietnameseText, err := deepLTranslator.Translate(wordText, "en", "vi")
		if err != nil {
			log.Printf("Error translating word '%s' (ID: %d): %v", wordText, wordID, err)
			errorCount++
			continue
		}

		// Clean special characters from Vietnamese text
		vietnameseText = cleanSpecialCharacters(vietnameseText)

		// Convert to lowercase before inserting
		vietnameseText = strings.ToLower(vietnameseText)

		// Find or create Vietnamese word
		var viWordID int64
		err = db.QueryRow(ctx, `
			SELECT id FROM words 
			WHERE language_id = $1 AND word_text = $2 
			LIMIT 1`, viLangID, vietnameseText).Scan(&viWordID)
		
		if err != nil {
			// Vietnamese word doesn't exist, create it
			err = db.QueryRow(ctx, `
				INSERT INTO words (language_id, word_text)
				VALUES ($1, $2)
				RETURNING id`, viLangID, vietnameseText).Scan(&viWordID)
			if err != nil {
				log.Printf("Error creating Vietnamese word for '%s' -> '%s': %v", wordText, vietnameseText, err)
				errorCount++
				continue
			}
		}

		// Check if translation already exists
		var existingTranslationID int64
		err = db.QueryRow(ctx, `
			SELECT id FROM translations 
			WHERE from_word_id = $1 AND to_word_id = $2 
			LIMIT 1`, wordID, viWordID).Scan(&existingTranslationID)
		
		if err == nil {
			// Translation already exists, skip
			skippedCount++
			continue
		}

		// Create translation record in translations table (T065)
		// Note: We don't set cefr_level_id here as we don't know the level - it can be set later
		_, insertErr := db.Exec(ctx, `
			INSERT INTO translations (from_word_id, to_word_id, meaning_order, note)
			VALUES ($1, $2, 1, 'Auto-translated by job')
		`, wordID, viWordID)

		if insertErr != nil {
			log.Printf("Error creating translation for '%s' (ID: %d) -> '%s' (ID: %d): %v", 
				wordText, wordID, vietnameseText, viWordID, insertErr)
			errorCount++
			continue
		}

		translatedCount++
		if translatedCount%100 == 0 {
			log.Printf("Progress: Translated %d words so far...", translatedCount)
		}
	}

	if err := rows.Err(); err != nil {
		return fmt.Errorf("error iterating rows: %w", err)
	}

	log.Printf("Translation job completed. Translated: %d, Skipped (already exists): %d, Errors: %d", 
		translatedCount, skippedCount, errorCount)
	return nil
}
