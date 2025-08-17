package jobs

import (
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/platform/deps"
	"github.com/robfig/cron/v3"
)

// Start initializes scheduled jobs using the provided dependencies.
func Start(d *deps.Deps) {
	c := cron.New()
	registerUniverseIndex(c, d.PG)
	c.Start()
}
