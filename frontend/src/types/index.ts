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
  played_at: string;
  session_tag: string;
}

export interface HistoryPlay extends Omit<Play, 'word_id'> {
  word: Word;
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
    correct_points: number;
    wrong_penalty: number;
    slow_penalty: number;
  };
}
