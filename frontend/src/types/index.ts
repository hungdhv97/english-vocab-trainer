export interface Word {
  word_id: number;
  concept_id: string;
  language_code: string;
  word_text: string;
  difficulty: string;
}

export interface WordBatch {
  words: Word[];
  next_cursor: string;
}

// Note: Play, SessionInfo, and HistoryPlay types have been removed
// as they were used with the old plays and game_sessions tables.
// The new vocab quiz uses vocab_game_sessions, vocab_game_session_questions, etc.

export interface User {
  user_id: number;
  username: string;
}

// Note: Level type has been removed as it was used with the old levels table.
// The new vocab quiz uses CEFR levels (CefrLevel type) instead.

// Game Home Page Types
export interface Game {
  game_id: number;
  code: string;
  name: string;
  description: string;
  icon_path: string | null;
  category: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string; // ISO 8601 timestamp
  updated_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  score: number;
  achieved_at: string; // ISO 8601 timestamp
}

export interface GameWithLeaderboard extends Game {
  leaderboard: LeaderboardEntry[];
}

// ===== Vocab Quiz Types =====

// CEFR Level types
export interface CefrLevel {
  id: number;
  code: string; // A1, A2, B1, B2, C1, C2
  group_name: string; // Basic User, Independent User, Proficient User
  level_name: string; // Beginner / Breakthrough, etc.
  description: string;
}

// Translation direction
export type TranslationDirection = 'en-to-vi' | 'vi-to-en';

// Question and Option types
export interface Option {
  letter: string; // a, b, c, or d
  text: string;
  word_id: number;
}

export interface Question {
  id: number; // Session question ID
  session_question_id: number; // Same as id, for clarity
  word_id: number;
  word_text: string;
  translation_id: number;
  options: Option[];
  correct_answer: string; // a, b, c, or d
}

// Answer submission and response
export interface AnswerRequest {
  session_question_id: number; // ID of the session question
  chosen_option: string; // A, B, C, or D (uppercase)
  time_spent_ms?: number; // Optional time spent in milliseconds
}

export interface AnswerResponse {
  is_correct: boolean;
  correct_count: number;
  total_count: number;
}

// Session management
export interface VocabQuizSessionRequest {
  user_id: number;
  game_id: number;
  cefr_level_id: number;
  translation_direction: TranslationDirection;
  question_count?: number; // Default: 20
}

export interface VocabQuizSessionResponse {
  session_id: number; // Integer session ID (not UUID anymore)
  questions: Question[];
}

// Session statistics
export interface SessionStatistics {
  session_id: number; // Integer session ID
  correct_count: number;
  incorrect_count: number;
  total_score: number;
  accuracy_percentage: number;
  time_elapsed?: number; // in seconds
}

// Vocab Quiz Leaderboard types
export interface VocabQuizLeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  accuracy_percentage: number;
  games_played: number;
}

export interface VocabQuizLeaderboardResponse {
  game_id: number;
  cefr_level_id: number;
  cefr_level_code: string;
  translation_direction: TranslationDirection;
  leaderboard: VocabQuizLeaderboardEntry[];
}
