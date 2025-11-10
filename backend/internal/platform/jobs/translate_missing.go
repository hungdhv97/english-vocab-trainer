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

// registerTranslateMissing schedules a job to translate words that don't have translations.
// Processes batches of English and Vietnamese words (configurable batch size).
func registerTranslateMissing(c *cron.Cron, db *pgxpool.Pool, deepLTranslator *translator.DeepLTranslator, schedule string, batchSize int) {
	_, err := c.AddFunc(schedule, func() {
		if err := translateMissingWords(db, deepLTranslator, batchSize); err != nil {
			log.Printf("Error in translate missing job: %v", err)
		}
	})
	if err != nil {
		log.Printf("Failed to register translate missing job: %v", err)
	} else {
		log.Printf("Translate missing job registered successfully with schedule: %s (batch size: %d per language)", schedule, batchSize)
	}
}

// translateMissingWords finds words without translations and translates them in batches.
// Processes batchSize English words and batchSize Vietnamese words per run.
// Creates bidirectional translations (EN->VI and VI->EN) for each word pair.
func translateMissingWords(db *pgxpool.Pool, deepLTranslator *translator.DeepLTranslator, batchSize int) error {
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

	log.Printf("Starting translation job (batch mode: %d words per language)...", batchSize)

	// Process English words without Vietnamese translations
	enTranslated, enReverse, enSkipped, enErrors := processLanguageBatch(
		ctx, db, deepLTranslator, enLangID, viLangID, "en", "vi", batchSize,
	)

	// Process Vietnamese words without English translations
	viTranslated, viReverse, viSkipped, viErrors := processLanguageBatch(
		ctx, db, deepLTranslator, viLangID, enLangID, "vi", "en", batchSize,
	)

	totalSkipped := enSkipped + viSkipped
	totalErrors := enErrors + viErrors

	log.Printf("Translation job completed. EN->VI: %d (+ %d reverse), VI->EN: %d (+ %d reverse), Skipped: %d, Errors: %d",
		enTranslated, enReverse, viTranslated, viReverse, totalSkipped, totalErrors)

	return nil
}

// processLanguageBatch processes a batch of words from one language to another.
// Returns: translated count, reverse translated count, skipped count, error count
func processLanguageBatch(
	ctx context.Context,
	db *pgxpool.Pool,
	deepLTranslator *translator.DeepLTranslator,
	fromLangID, toLangID int64,
	fromLangCode, toLangCode string,
	batchSize int,
) (int, int, int, int) {
	// Find words that don't have translations to the target language
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
		LIMIT $3
	`

	rows, err := db.Query(ctx, query, fromLangID, toLangID, batchSize)
	if err != nil {
		log.Printf("Error querying %s words: %v", fromLangCode, err)
		return 0, 0, 0, 1
	}
	defer rows.Close()

	translatedCount := 0
	reverseTranslatedCount := 0
	skippedCount := 0
	errorCount := 0

	for rows.Next() {
		var wordID int64
		var wordText string

		if err := rows.Scan(&wordID, &wordText); err != nil {
			log.Printf("Error scanning row: %v", err)
			errorCount++
			continue
		}

		// Translate the word to target language
		translatedText, err := deepLTranslator.Translate(wordText, fromLangCode, toLangCode)
		if err != nil {
			log.Printf("Error translating %s word '%s' (ID: %d): %v", fromLangCode, wordText, wordID, err)
			errorCount++
			continue
		}

		// Clean special characters from translated text
		translatedText = cleanSpecialCharacters(translatedText)

		// Convert to lowercase before inserting
		translatedText = strings.ToLower(translatedText)

		// Find or create target language word
		var toWordID int64
		err = db.QueryRow(ctx, `
			SELECT id FROM words 
			WHERE language_id = $1 AND word_text = $2 
			LIMIT 1`, toLangID, translatedText).Scan(&toWordID)
		
		if err != nil {
			// Target word doesn't exist, create it
			err = db.QueryRow(ctx, `
				INSERT INTO words (language_id, word_text)
				VALUES ($1, $2)
				RETURNING id`, toLangID, translatedText).Scan(&toWordID)
			if err != nil {
				log.Printf("Error creating %s word for '%s' -> '%s': %v", toLangCode, wordText, translatedText, err)
				errorCount++
				continue
			}
		}

		// Check if translation already exists
		var existingTranslationID int64
		err = db.QueryRow(ctx, `
			SELECT id FROM translations 
			WHERE from_word_id = $1 AND to_word_id = $2 
			LIMIT 1`, wordID, toWordID).Scan(&existingTranslationID)
		
		if err == nil {
			// Translation already exists, skip
			skippedCount++
			continue
		}

		// Create translation record in translations table (from -> to)
		// Note: We don't set cefr_level_id here as we don't know the level - it can be set later
		_, insertErr := db.Exec(ctx, `
			INSERT INTO translations (from_word_id, to_word_id, meaning_order, note)
			VALUES ($1, $2, 1, 'Auto-translated by job')
		`, wordID, toWordID)

		if insertErr != nil {
			log.Printf("Error creating translation for '%s' (ID: %d) -> '%s' (ID: %d): %v", 
				wordText, wordID, translatedText, toWordID, insertErr)
			errorCount++
			continue
		}

		// Check if reverse translation exists (to -> from)
		var existingReverseTranslationID int64
		err = db.QueryRow(ctx, `
			SELECT id FROM translations 
			WHERE from_word_id = $1 AND to_word_id = $2 
			LIMIT 1`, toWordID, wordID).Scan(&existingReverseTranslationID)
		
		if err != nil {
			// Reverse translation doesn't exist, create it
			_, reverseInsertErr := db.Exec(ctx, `
				INSERT INTO translations (from_word_id, to_word_id, meaning_order, note)
				VALUES ($1, $2, 1, 'Auto-translated by job (reverse)')
			`, toWordID, wordID)
			
			if reverseInsertErr != nil {
				log.Printf("Error creating reverse translation for '%s' (ID: %d) -> '%s' (ID: %d): %v", 
					translatedText, toWordID, wordText, wordID, reverseInsertErr)
				// Don't increment errorCount here as the main translation was successful
			} else {
				reverseTranslatedCount++
			}
		}

		translatedCount++
	}

	if err := rows.Err(); err != nil {
		log.Printf("Error iterating rows for %s words: %v", fromLangCode, err)
		errorCount++
	}

	return translatedCount, reverseTranslatedCount, skippedCount, errorCount
}
