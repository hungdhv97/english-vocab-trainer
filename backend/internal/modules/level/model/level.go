package model

import "encoding/json"

// Level represents a game level configuration.
type Level struct {
	ID            int64           `json:"level_id"`
	Code          string          `json:"code"`
	Name          string          `json:"name"`
	Description   string          `json:"description"`
	Difficulty    string          `json:"difficulty"`
	ScoringConfig json.RawMessage `json:"scoring_config"`
}
