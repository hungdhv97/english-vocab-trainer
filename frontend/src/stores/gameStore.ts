import { create } from 'zustand';
import type { CefrLevel, Question, SessionStatistics, TranslationDirection } from '@/types';

// Represents the finite states of the vocab quiz flow.
export type GameState = 'level-selection' | 'direction-selection' | 'playing' | 'completed';

interface GameStore {
  // Configuration
  selectedLevel: CefrLevel | null;
  translationDirection: TranslationDirection | null;

  // Session
  sessionId: number | null;
  questions: Question[];
  currentQuestionIndex: number;
  answeredQuestions: Set<number>;

  // Answer State
  selectedAnswer: string | null;
  correctAnswer: string | null;
  submittedAnswer: string | null;

  // Score
  correctCount: number;
  incorrectCount: number;

  // Timer
  startTime: number | null;
  timeElapsed: number;
  timerInterval: number | null;

  // Statistics
  sessionStatistics: SessionStatistics | null;

  // UI
  gameState: GameState;
  loading: boolean;
  error: string | null;

  // Actions
  setLevel: (level: CefrLevel) => void;
  setDirection: (direction: TranslationDirection) => void;
  startSession: (sessionId: number, questions: Question[]) => void;
  selectAnswer: (answer: string) => void;
  submitAnswer: (isCorrect: boolean, correctAnswer: string) => void;
  nextQuestion: () => void;
  finishSession: (statistics: SessionStatistics) => void;
  reset: () => void;
  startTimer: () => void;
  stopTimer: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  selectedLevel: null,
  translationDirection: null,
  sessionId: null,
  questions: [],
  currentQuestionIndex: 0,
  answeredQuestions: new Set(),
  selectedAnswer: null,
  correctAnswer: null,
  submittedAnswer: null,
  correctCount: 0,
  incorrectCount: 0,
  startTime: null,
  timeElapsed: 0,
  timerInterval: null,
  sessionStatistics: null,
  gameState: 'level-selection',
  loading: false,
  error: null,
  
  // Actions
  // Transition from level selection -> direction selection
  setLevel: (level) => set({ selectedLevel: level, gameState: 'direction-selection' }),

  setDirection: (direction) => set({ translationDirection: direction }),

  // Populate session data and transition into the playing state.
  startSession: (sessionId, questions) => {
    set({
      sessionId,
      questions,
      currentQuestionIndex: 0,
      answeredQuestions: new Set(),
      gameState: 'playing',
      startTime: Date.now()
    });
    get().startTimer();
  },

  selectAnswer: (answer) => set({ selectedAnswer: answer }),

  submitAnswer: (isCorrect, correctAnswer) => {
    const state = get();
    const currentQuestionId = state.questions[state.currentQuestionIndex]?.id;
    
    set({
      submittedAnswer: state.selectedAnswer,
      correctAnswer,
      correctCount: isCorrect ? state.correctCount + 1 : state.correctCount,
      incorrectCount: isCorrect ? state.incorrectCount : state.incorrectCount + 1,
      answeredQuestions: new Set(state.answeredQuestions).add(currentQuestionId)
    });
  },

  nextQuestion: () => {
    const state = get();
    if (state.currentQuestionIndex < state.questions.length - 1) {
      set({
        currentQuestionIndex: state.currentQuestionIndex + 1,
        selectedAnswer: null,
        submittedAnswer: null,
        correctAnswer: null
      });
    }
  },

  // Persist statistics and transition to the completed state.
  finishSession: (statistics) => {
    get().stopTimer();
    set({
      sessionStatistics: statistics,
      gameState: 'completed'
    });
  },

  reset: () => {
    get().stopTimer();
    set({
      selectedLevel: null,
      translationDirection: null,
      sessionId: null,
      questions: [],
      currentQuestionIndex: 0,
      answeredQuestions: new Set(),
      selectedAnswer: null,
      correctAnswer: null,
      submittedAnswer: null,
      correctCount: 0,
      incorrectCount: 0,
      startTime: null,
      timeElapsed: 0,
      sessionStatistics: null,
      gameState: 'level-selection',
      error: null
    });
  },

  // High-resolution timer sampled every 10ms to keep UI stopwatch smooth.
  startTimer: () => {
    const interval = window.setInterval(() => {
      const state = get();
      if (state.startTime) {
        set({ timeElapsed: Date.now() - state.startTime });
      }
    }, 10); // Update every 10ms for smooth millisecond display
    set({ timerInterval: interval });
  },

  // Ensure timer intervals are always cleaned up when leaving playing state.
  stopTimer: () => {
    const state = get();
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      set({ timerInterval: null });
    }
  }
}));

