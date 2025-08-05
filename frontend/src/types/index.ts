export type Difficulty = 1 | 2 | 3 | 4 | 5 | 6;

export interface Word {
  word_id: number;
  concept_id: string;
  language_code: string;
  word_text: string;
  difficulty: string;
}

export interface Play {
  play_id: number;
  user_id: number;
  word_id: number;
  user_answer: string;
  is_correct: boolean;
  earned_score: number;
  played_at: string;
}

export interface User {
  user_id: number;
  username: string;
}
