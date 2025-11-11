# Data Model: Session Statistics Page

**Feature**: Session Statistics Page  
**Date**: 2025-01-27  
**Branch**: `008-session-statistics-page`

## Overview

This document defines the data models for the session statistics page feature, including frontend TypeScript types and backend Go models for the new API endpoint.

## Frontend TypeScript Types

### SessionDetails

Comprehensive session data including statistics, questions, and answers.

```typescript
export interface SessionDetails {
  session_id: number;
  statistics: SessionStatistics;
  questions: SessionQuestionDetail[];
  session_info: SessionInfo;
}

export interface SessionStatistics {
  session_id: number;
  correct_count: number;
  incorrect_count: number;
  total_score: number;
  accuracy_percentage: number;
  time_elapsed?: number; // in seconds
  session_start_time: string; // ISO 8601 timestamp
  session_end_time?: string; // ISO 8601 timestamp
  level_information?: LevelInformation;
  translation_direction: 'en-to-vi' | 'vi-to-en';
}

export interface SessionQuestionDetail {
  question_id: number;
  session_question_id: number;
  question_number: number; // Order in session (1-based)
  word_id: number;
  word_text: string;
  translation_id: number;
  options: QuestionOption[];
  correct_answer: string; // 'a', 'b', 'c', or 'd'
  user_answer?: UserAnswer;
  time_spent_ms?: number;
}

export interface QuestionOption {
  letter: string; // 'a', 'b', 'c', or 'd'
  text: string;
  word_id: number;
  translation_id: number;
}

export interface UserAnswer {
  chosen_option: string; // 'A', 'B', 'C', or 'D'
  is_correct: boolean;
  answered_at: string; // ISO 8601 timestamp
  time_spent_ms?: number;
}

export interface SessionInfo {
  session_id: number;
  user_id: number;
  game_id: number;
  cefr_level_id: number;
  cefr_level_code: string;
  translation_direction: 'en-to-vi' | 'vi-to-en';
  total_questions: number;
  started_at: string; // ISO 8601 timestamp
  finished_at?: string; // ISO 8601 timestamp
}

export interface LevelInformation {
  cefr_level_id: number;
  cefr_level_code: string;
  level_name: string;
  group_name: string;
}
```

### WordDetail

Word information for the word detail page.

```typescript
export interface WordDetail {
  word_id: number;
  word_text: string;
  language_code: string;
  translations: WordTranslation[];
  cefr_level_code: string;
  examples?: WordExample[];
  part_of_speech?: string;
  phonetic?: string;
  concept_id?: string;
  related_words?: RelatedWord[];
}

export interface WordTranslation {
  translation_id: number;
  target_language: string;
  translation_text: string;
}

export interface WordExample {
  example_id: number;
  example_text: string;
  translation_text: string;
}

export interface RelatedWord {
  word_id: number;
  word_text: string;
  relationship_type: string;
}
```

### Chart Data Types

Data structures for chart visualizations.

```typescript
export interface AccuracyBreakdownData {
  name: string;
  value: number;
  color: string;
}

export interface TimeAnalysisData {
  question_number: number;
  time_spent_ms: number;
  time_spent_seconds: number;
}

export interface PerformanceOverTimeData {
  question_number: number;
  running_accuracy: number; // Cumulative accuracy percentage
  is_correct: number; // 0 or 1 for incorrect/correct
}
```

## Backend Go Models

### SessionDetailsResponse

Response model for the new session details endpoint.

```go
// SessionDetailsResponse represents the comprehensive session data response.
type SessionDetailsResponse struct {
    SessionID   int64                  `json:"session_id"`
    Statistics  SessionStatistics      `json:"statistics"`
    Questions   []SessionQuestionDetail `json:"questions"`
    SessionInfo SessionInfo            `json:"session_info"`
}

// SessionStatistics represents statistics for a game session (extended).
type SessionStatistics struct {
    SessionID          int64     `json:"session_id"`
    TotalScore         int       `json:"total_score"`
    CorrectCount       int       `json:"correct_count"`
    IncorrectCount     int       `json:"incorrect_count"`
    AccuracyPercentage float64   `json:"accuracy_percentage"`
    TimeElapsed        *float64  `json:"time_elapsed,omitempty"` // in seconds
    SessionStartTime   time.Time `json:"session_start_time"`
    SessionEndTime     *time.Time `json:"session_end_time,omitempty"`
    LevelInformation   *LevelInformation `json:"level_information,omitempty"`
    TranslationDirection string  `json:"translation_direction"` // "en-to-vi" or "vi-to-en"
}

// SessionQuestionDetail represents a question with answer details.
type SessionQuestionDetail struct {
    QuestionID      int64           `json:"question_id"`
    SessionQuestionID int64         `json:"session_question_id"`
    QuestionNumber  int             `json:"question_number"`
    WordID          int64           `json:"word_id"`
    WordText        string          `json:"word_text"`
    TranslationID   int64           `json:"translation_id"`
    Options         []QuestionOption `json:"options"`
    CorrectAnswer   string          `json:"correct_answer"` // "A", "B", "C", or "D"
    UserAnswer      *UserAnswer     `json:"user_answer,omitempty"`
    TimeSpentMs     *int            `json:"time_spent_ms,omitempty"`
}

// QuestionOption represents a multiple-choice option.
type QuestionOption struct {
    Letter        string `json:"letter"` // "a", "b", "c", or "d"
    Text          string `json:"text"`
    WordID        int64  `json:"word_id"`
    TranslationID int64  `json:"translation_id"`
}

// UserAnswer represents the user's answer to a question.
type UserAnswer struct {
    ChosenOption string    `json:"chosen_option"` // "A", "B", "C", or "D"
    IsCorrect    bool      `json:"is_correct"`
    AnsweredAt   time.Time `json:"answered_at"`
    TimeSpentMs  *int      `json:"time_spent_ms,omitempty"`
}

// SessionInfo represents session metadata.
type SessionInfo struct {
    SessionID          int64     `json:"session_id"`
    UserID             int64     `json:"user_id"`
    GameID             int64     `json:"game_id"`
    CefrLevelID        int64     `json:"cefr_level_id"`
    CefrLevelCode      string    `json:"cefr_level_code"`
    TranslationDirection string  `json:"translation_direction"` // "en-to-vi" or "vi-to-en"
    TotalQuestions     int       `json:"total_questions"`
    StartedAt          time.Time `json:"started_at"`
    FinishedAt         *time.Time `json:"finished_at,omitempty"`
}

// LevelInformation represents CEFR level information.
type LevelInformation struct {
    CefrLevelID   int64  `json:"cefr_level_id"`
    CefrLevelCode string `json:"cefr_level_code"`
    LevelName     string `json:"level_name"`
    GroupName     string `json:"group_name"`
}
```

### WordDetailResponse

Response model for word detail endpoint (if new endpoint is needed).

```go
// WordDetailResponse represents comprehensive word information.
type WordDetailResponse struct {
    WordID          int64            `json:"word_id"`
    WordText        string           `json:"word_text"`
    LanguageCode    string           `json:"language_code"`
    Translations    []WordTranslation `json:"translations"`
    DifficultyLevel string           `json:"difficulty_level"`
    Examples        []WordExample    `json:"examples,omitempty"`
    PartOfSpeech    *string          `json:"part_of_speech,omitempty"`
    Phonetic        *string          `json:"phonetic,omitempty"`
    ConceptID       *string          `json:"concept_id,omitempty"`
    RelatedWords    []RelatedWord    `json:"related_words,omitempty"`
}

// WordTranslation represents a translation of a word.
type WordTranslation struct {
    TranslationID   int64  `json:"translation_id"`
    TargetLanguage  string `json:"target_language"`
    TranslationText string `json:"translation_text"`
}

// WordExample represents an example usage of a word.
type WordExample struct {
    ExampleID      int64  `json:"example_id"`
    ExampleText    string `json:"example_text"`
    TranslationText string `json:"translation_text"`
}

// RelatedWord represents a word related to the current word.
type RelatedWord struct {
    WordID          int64  `json:"word_id"`
    WordText        string `json:"word_text"`
    RelationshipType string `json:"relationship_type"`
}
```

## Database Schema

### Existing Tables (No Changes Required)

The following existing database tables support this feature:

#### vocab_game_sessions
- `id` (primary key)
- `user_id` (foreign key to users)
- `game_id` (foreign key to games)
- `cefr_level_id` (foreign key to cefr_levels)
- `from_language_id` (foreign key to languages)
- `to_language_id` (foreign key to languages)
- `total_questions`
- `correct_answers`
- `started_at`
- `finished_at`

#### vocab_game_session_questions
- `id` (primary key)
- `session_id` (foreign key to vocab_game_sessions)
- `question_no` (order in session)
- `translation_id` (foreign key to translations)
- `option_a_translation_id` (foreign key to translations)
- `option_b_translation_id` (foreign key to translations)
- `option_c_translation_id` (foreign key to translations)
- `option_d_translation_id` (foreign key to translations)
- `correct_option` ('A', 'B', 'C', or 'D')

#### vocab_game_session_answers
- `id` (primary key)
- `session_question_id` (foreign key to vocab_game_session_questions)
- `chosen_option` ('A', 'B', 'C', or 'D')
- `is_correct` (boolean)
- `answered_at` (timestamp)
- `time_spent_ms` (integer, nullable)

#### translations
- `id` (primary key)
- `concept_id` (foreign key to concepts)
- `language_id` (foreign key to languages)
- `word_id` (foreign key to words)
- `translation_text`

#### words
- `id` (primary key)
- `concept_id`
- `language_id` (foreign key to languages)
- `word_text`

#### cefr_levels
- `id` (primary key)
- `code` (e.g., 'A1', 'A2')
- `group_name`
- `level_name`
- `description`

## Data Relationships

### Session to Questions
- One session has many questions (vocab_game_session_questions)
- Questions are ordered by `question_no`

### Question to Answers
- One question has one answer (vocab_game_session_answers)
- Answer is linked via `session_question_id`

### Question to Translations
- Question has one main translation (question text) via `translation_id`
- Question has four option translations via `option_a_translation_id`, `option_b_translation_id`, `option_c_translation_id`, `option_d_translation_id`

### Translation to Words
- Translation belongs to one word via `word_id`
- Word text is retrieved from words table

### Session to User
- Session belongs to one user via `user_id`
- Used for authorization (users can only view their own sessions)

### Session to CEFR Level
- Session has one CEFR level via `cefr_level_id`
- Level information is retrieved from cefr_levels table

## Data Retrieval Queries

### Get Session Details Query

```sql
-- Get session with statistics
SELECT 
    s.id,
    s.user_id,
    s.game_id,
    s.cefr_level_id,
    s.from_language_id,
    s.to_language_id,
    s.total_questions,
    s.correct_answers,
    s.started_at,
    s.finished_at,
    cl.code as cefr_level_code,
    cl.level_name,
    cl.group_name
FROM vocab_game_sessions s
JOIN cefr_levels cl ON s.cefr_level_id = cl.id
WHERE s.id = $1 AND s.user_id = $2;

-- Get questions with options
SELECT 
    q.id,
    q.session_id,
    q.question_no,
    q.translation_id,
    q.option_a_translation_id,
    q.option_b_translation_id,
    q.option_c_translation_id,
    q.option_d_translation_id,
    q.correct_option,
    wt.word_text,
    wt.word_id
FROM vocab_game_session_questions q
JOIN translations t ON q.translation_id = t.id
JOIN words wt ON t.word_id = wt.id
WHERE q.session_id = $1
ORDER BY q.question_no;

-- Get answers with time spent
SELECT 
    a.id,
    a.session_question_id,
    a.chosen_option,
    a.is_correct,
    a.answered_at,
    a.time_spent_ms
FROM vocab_game_session_answers a
JOIN vocab_game_session_questions q ON a.session_question_id = q.id
WHERE q.session_id = $1
ORDER BY q.question_no;
```

## Validation Rules

### Frontend Validation
- Session ID must be a positive integer
- Question number must be between 1 and total questions
- Answer option must be 'A', 'B', 'C', or 'D'
- Time spent must be a positive integer (milliseconds)
- Word ID must be a positive integer

### Backend Validation
- Session ID must exist and belong to authenticated user
- Session must be accessible (not deleted, user has permission)
- Questions must be ordered by question_no
- Answers must correspond to valid questions
- Translation direction must be 'en-to-vi' or 'vi-to-en'

## Error Handling

### Frontend Error Types
```typescript
export interface SessionDetailsError {
  error: string;
  message: string;
  code?: string;
  session_id?: number;
}
```

### Backend Error Responses
- `400 Bad Request`: Invalid session ID or query parameters
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User doesn't have access to this session
- `404 Not Found`: Session not found
- `500 Internal Server Error`: Database or server error

## Performance Considerations

### Database Indexes
- Index on `vocab_game_sessions(user_id, id)` for user session lookup
- Index on `vocab_game_session_questions(session_id, question_no)` for ordered question retrieval
- Index on `vocab_game_session_answers(session_question_id)` for answer lookup

### Query Optimization
- Use JOINs to retrieve related data in single query
- Use ORDER BY to ensure questions are in correct order
- Limit query results if pagination is needed (future enhancement)

### Caching Strategy
- Session details can be cached (session data doesn't change after completion)
- Cache key: `session:details:{session_id}`
- Cache TTL: 24 hours (sessions are immutable after completion)

## Data Transformation

### Backend to Frontend Mapping
- Backend uses uppercase option letters ('A', 'B', 'C', 'D')
- Frontend uses lowercase option letters ('a', 'b', 'c', 'd')
- Transformation happens in API client or backend response

### Time Format Conversion
- Backend stores time as `time.Time` (Go) or `timestamp` (PostgreSQL)
- Frontend receives time as ISO 8601 strings
- Frontend displays time in human-readable format (e.g., "2 minutes 30 seconds")

### Chart Data Preparation
- Frontend transforms session data into chart data structures
- Accuracy breakdown: Calculate percentages from correct/incorrect counts
- Time analysis: Aggregate time spent per question
- Performance over time: Calculate running accuracy percentage for each question

