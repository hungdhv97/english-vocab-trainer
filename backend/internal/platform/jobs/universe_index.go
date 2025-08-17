package jobs

import (
	"context"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/robfig/cron/v3"
)

// registerUniverseIndex schedules rebuilding the universe_index table
// at 02:00 every day if the number of words has changed.
func registerUniverseIndex(c *cron.Cron, db *pgxpool.Pool) {
	c.AddFunc("0 2 * * *", func() { rebuildUniverseIndex(db) })
}

func rebuildUniverseIndex(db *pgxpool.Pool) {
	ctx := context.Background()

	var wordCount, indexCount int
	if err := db.QueryRow(ctx, "SELECT COUNT(*) FROM words").Scan(&wordCount); err != nil {
		log.Printf("count words: %v", err)
		return
	}
	if err := db.QueryRow(ctx, "SELECT COUNT(*) FROM universe_index").Scan(&indexCount); err != nil {
		log.Printf("count universe_index: %v", err)
		return
	}
	if wordCount == indexCount {
		return
	}

	tx, err := db.Begin(ctx)
	if err != nil {
		log.Printf("begin tx: %v", err)
		return
	}
	defer tx.Rollback(ctx)

	if _, err := tx.Exec(ctx, "TRUNCATE universe_index"); err != nil {
		log.Printf("truncate universe_index: %v", err)
		return
	}

	if _, err := tx.Exec(ctx, `INSERT INTO universe_index(language_code, difficulty, rank, word_id)
        SELECT language_code, difficulty,
               ROW_NUMBER() OVER (PARTITION BY language_code, difficulty ORDER BY word_id) - 1 AS rank,
               word_id
        FROM words`); err != nil {
		log.Printf("fill universe_index: %v", err)
		return
	}

	if err := tx.Commit(ctx); err != nil {
		log.Printf("commit universe_index: %v", err)
	}
}
