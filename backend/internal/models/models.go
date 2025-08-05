package models

// Word represents a vocabulary word.
type Word struct {
        ID         int64  `json:"id"`
        English    string `json:"english"`
        Vietnamese string `json:"vietnamese"`
        Level      int    `json:"level"`
}