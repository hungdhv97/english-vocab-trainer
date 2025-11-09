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

export interface Play {
  play_id: number;
  user_id: number;
  word_id: number;
  user_answer: string;
  is_correct: boolean;
  score: number;
  target: number;
  played_at: string;
  session_tag: string;
  correct_answer: string;
}

export interface SessionInfo {
  session_tag: string;
  started_at: string;
  level_id: number;
  total_score: number;
  finished_at: string | null;
}

export interface HistoryPlay extends Omit<Play, 'word_id' | 'session_tag'> {
  word: Word;
  session: SessionInfo;
}

export interface User {
  user_id: number;
  username: string;
}

export interface Level {
  level_id: number;
  code: string;
  name: string;
  description: string;
  difficulty: string;
  scoring_config: {
    target: number;
    target_rules: {
      correct_bonus: number;
      wrong_penalty: number | string;
      mode: 'number' | 'formula';
    };
    score_rules: {
      correct_points: number;
      wrong_penalty: number;
    };
  };
}

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
  id: number;
  word_id: number;
  word_text: string;
  translation_id: number;
  options: Option[];
  correct_answer: string; // a, b, c, or d
}

// Answer submission and response
export interface AnswerRequest {
  word_id: number;
  translation_id: number;
  user_answer: string; // a, b, c, or d
  correct_answer: string; // a, b, c, or d
  user_id: number;
  session_tag?: string;
}

export interface AnswerResponse {
  is_correct: boolean;
  correct_answer: string;
  score: number;
  total_score: number;
  translation_id?: number;
}

// Session management
export interface VocabQuizSessionRequest {
  user_id: number;
  game_id: number;
  cefr_level_id: number;
  translation_direction: TranslationDirection;
}

export interface VocabQuizSessionResponse {
  session_tag: string;
  cefr_level_id?: number;
  translation_direction?: TranslationDirection;
}

// Session statistics
export interface SessionStatistics {
  session_tag: string;
  correct_count: number;
  incorrect_count: number;
  total_score: number;
  accuracy_percentage: number;
  time_elapsed?: number;
}
