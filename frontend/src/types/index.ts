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
  total_questions: number;
  accuracy_percentage: number;
  time_elapsed: number; // in seconds (always present)
}

// Extended session statistics (for session details page)
export interface ExtendedSessionStatistics {
  session_id: number;
  correct_count: number;
  incorrect_count: number;
  total_questions: number;
  accuracy_percentage: number;
  time_elapsed: number; // in seconds (always present)
  session_start_time: string; // ISO 8601 timestamp
  session_end_time?: string; // ISO 8601 timestamp
  level_information?: LevelInformation;
  translation_direction: TranslationDirection;
}

export interface LevelInformation {
  cefr_level_id: number;
  cefr_level_code: string;
  level_name: string;
  group_name: string;
}

// Session details (comprehensive session data)
export interface SessionDetails {
  session_id: number;
  statistics: ExtendedSessionStatistics;
  questions: SessionQuestionDetail[];
  session_info: SessionInfo;
}

export interface SessionQuestionDetail {
  question_id: number;
  session_question_id: number;
  question_number: number; // Order in session (1-based)
  word_id: number;
  word_text: string;
  translation_id: number;
  options: QuestionOption[];
  correct_answer: string; // 'A', 'B', 'C', or 'D'
  user_answer?: UserAnswer;
  time_answer_ms?: number;
}

export interface QuestionOption {
  letter: string; // 'a', 'b', 'c', or 'd' (lowercase)
  text: string;
  word_id: number;
  translation_id: number;
}

export interface UserAnswer {
  chosen_option: string; // 'A', 'B', 'C', or 'D' (uppercase)
  is_correct: boolean;
  answered_at: string; // ISO 8601 timestamp
  time_answer_ms?: number;
}

export interface SessionInfo {
  session_id: number;
  user_id: number;
  game_id: number;
  cefr_level_id: number;
  cefr_level_code: string;
  translation_direction: TranslationDirection;
  total_questions: number;
  started_at: string; // ISO 8601 timestamp
  finished_at?: string; // ISO 8601 timestamp
}

// Word Detail types
export interface WordDetail {
  word_id: number;
  word_text: string;
  language_code: string;
  translations: WordTranslation[];
  cefr_level_code: string;
  examples?: WordExample[];
  part_of_speech?: string;
  phonetic?: string;
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
  min_games_played: number; // Minimum number of games required to appear on leaderboard
  leaderboard: VocabQuizLeaderboardEntry[];
}

// ===== User Profile Types =====

export interface UserProfile {
  user_id: number;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
  is_complete: boolean;
}

export interface ProfileCompletionStatus {
  is_complete: boolean;
  has_display_name: boolean;
  has_avatar: boolean;
  has_bio: boolean;
}
