package jobs

import (
	"log"

	"github.com/hungdhv97/english-vocab-trainer/backend/internal/platform/deps"
	"github.com/robfig/cron/v3"
)

// Start initializes scheduled jobs using the provided dependencies.
func Start(d *deps.Deps) {
	c := cron.New()

	// Register universe index job if enabled
	if d.Cfg.Jobs.UniverseIndex.Enabled {
		registerUniverseIndex(c, d.PG, d.Cfg.Jobs.UniverseIndex.Schedule)
	} else {
		log.Println("Universe index job is disabled in config")
	}

	// Register translation job if translator is available and enabled
	if d.Translator != nil && d.Cfg.Jobs.TranslateMissing.Enabled {
		registerTranslateMissing(c, d.PG, d.Translator,
			d.Cfg.Jobs.TranslateMissing.Schedule,
			d.Cfg.Jobs.TranslateMissing.BatchSize)
	} else {
		if d.Translator == nil {
			log.Println("DeepL translator not available, skipping translation job")
		} else {
			log.Println("Translation job is disabled in config")
		}
	}

	c.Start()
}
