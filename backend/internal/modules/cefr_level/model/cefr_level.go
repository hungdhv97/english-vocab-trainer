package model

// CefrLevel represents a CEFR (Common European Framework of Reference) level.
type CefrLevel struct {
	ID          int64  `json:"id"`
	Code        string `json:"code"`
	GroupName   string `json:"group_name"`
	LevelName   string `json:"level_name"`
	Description string `json:"description"`
}

