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
