# Data Model: Frontend UI/UX Fixes

**Feature**: Frontend UI/UX Fixes  
**Date**: 2025-11-14

## Overview

This document defines the state management structure, component hierarchy, and data flow for the frontend UI/UX fixes. Since this is a frontend-only feature with no database changes, the focus is on client-side state management using Zustand stores and local component state.

## State Management Architecture

### Global State (Zustand Stores)

#### 1. Auth Store (`src/stores/authStore.ts`)

**Purpose**: Centralize authentication state across all components (replaces scattered localStorage checks and polling)

```typescript
interface AuthState {
  // State
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (userData: { user_id: number; username: string; jwt_token: string; profile?: UserProfile }) => void;
  logout: () => void;
  updateProfile: (profile: UserProfile) => void;
  initialize: () => Promise<void>; // Load from localStorage on app start
}
```

**State Fields**:
- `user`: User profile data (display_name, avatar_url, bio, etc.) or null if not authenticated
- `isAuthenticated`: Boolean flag for auth status (derived from presence of JWT token)
- `isLoading`: Loading state during initialization (prevents flicker on page load)

**Actions**:
- `login(userData)`: Store user data in state and localStorage, dispatch auth-state-changed event
- `logout()`: Clear state and localStorage, navigate to home, dispatch auth-state-changed event
- `updateProfile(profile)`: Update user profile data in state (after successful API call)
- `initialize()`: Called on app mount to restore state from localStorage (check JWT expiration)

**Usage in Components**:
```typescript
// Header.tsx - Only subscribes to user data
const user = useAuthStore(state => state.user);

// App.tsx - Only subscribes to isAuthenticated
const isAuthenticated = useAuthStore(state => state.isAuthenticated);

// Layout.tsx - Access logout action
const logout = useAuthStore(state => state.logout);
```

**Migration from Current State**:
- Replace localStorage checks in App.tsx, Header.tsx, HomePage.tsx, Layout.tsx
- Remove polling logic from Header.tsx (300ms interval for auth state changes)
- Remove event listeners for 'storage', 'focus', 'auth-state-changed' (handled by store)

---

#### 2. Game Store (`src/stores/gameStore.ts`)

**Purpose**: Centralize vocabulary quiz game state (replaces 20+ useState hooks in Game.tsx)

```typescript
interface GameStore {
  // Configuration State
  gameCode: string | null;
  selectedLevel: CefrLevel | null;
  translationDirection: TranslationDirection | null;
  
  // Quiz State
  sessionId: number | null;
  questions: Question[];
  currentQuestionIndex: number;
  answeredQuestions: Set<number>; // Question IDs to prevent duplicate submissions
  
  // Answer State
  selectedAnswer: string | null;
  correctAnswer: string | null;
  submittedAnswer: string | null;
  
  // Score State
  correctCount: number;
  incorrectCount: number;
  score: number;
  
  // Timer State
  startTime: number | null;
  timeElapsed: number;
  
  // Statistics State
  sessionStatistics: SessionStatistics | null;
  
  // UI State
  gameState: 'level-selection' | 'direction-selection' | 'playing' | 'completed';
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
```

**State Groups**:

1. **Configuration**: Game setup (level, direction)
2. **Quiz**: Questions, session tracking, current question
3. **Answer**: Current answer selection and feedback
4. **Score**: Performance metrics (correct/incorrect counts)
5. **Timer**: Time tracking for session duration
6. **Statistics**: Final session results
7. **UI**: Loading, error, game flow state

**Actions**:
- `setLevel(level)`: Store selected CEFR level, transition to direction-selection
- `setDirection(direction)`: Store translation direction, prepare to start session
- `startSession(sessionId, questions)`: Initialize quiz with questions, start timer, transition to playing
- `selectAnswer(answer)`: Mark answer as selected (UI feedback only, not submitted)
- `submitAnswer(isCorrect, correctAnswer)`: Update score, mark answer as submitted, show feedback
- `nextQuestion()`: Move to next question, clear answer state
- `finishSession(statistics)`: Stop timer, store final statistics, transition to completed
- `reset()`: Clear all state, return to level-selection (Play Again functionality)
- `startTimer()`: Begin interval timer for time elapsed tracking
- `stopTimer()`: Clear interval timer

**Usage in Components**:
```typescript
// VocabQuizGame.tsx - Orchestrates game flow
const { gameState, selectedLevel, setLevel, setDirection } = useGameStore();

// QuizPlay.tsx - Handles question display and answering
const { questions, currentQuestionIndex, selectedAnswer, selectAnswer, submitAnswer } = useGameStore();

// QuizResults.tsx - Displays final statistics
const { correctCount, incorrectCount, sessionStatistics, reset } = useGameStore();
```

**Migration from Current State**:
- Replace 20+ useState hooks in Game.tsx with single gameStore
- Extract timer logic (useRef + useEffect) into store actions (startTimer, stopTimer)
- Move answeredQuestions Set into store (currently useState)

---

### Local Component State

Components that keep local state (not managed by Zustand):

#### 1. Header.tsx
**Local State**:
- `profile`: UserProfile fetched from API (replace with React Query useProfile hook)
- `username`: Derived from profile or localStorage (remove, use authStore.user.username)

**Zustand State**:
- `isAuthenticated`: From authStore
- `logout`: From authStore

---

#### 2. LeaderboardPage.tsx
**Local State**:
- `selectedGameId`: Currently selected game tab (keep local, not shared across app)
- `isMobile`: From useIsMobile hook (keep local, responsive behavior)

**Zustand State**: None (no global state needed for leaderboard)

**React Query State**:
- `games`: From useGames hook (replaces useState + useEffect)
- `leaderboard`: From useLeaderboard hook (replaces useState + useEffect + AbortController)
- `cefrLevels`: From useCefrLevels hook (for vocab-quiz leaderboard)

---

#### 3. HomePage.tsx
**Local State**: None (all state moved to React Query)

**Zustand State**:
- `isAuthenticated`: From authStore (for conditional game card display)
- `userId`: From authStore.user.user_id (for game click handling)

**React Query State**:
- `games`: From useGames hook (replaces useState + useEffect)

---

#### 4. Login.tsx / Register.tsx
**Local State**: None (form state managed by React Hook Form)

**React Hook Form State**:
- `username`: Form field
- `password`: Form field
- `errors`: Validation errors (managed by RHF)

**Zustand State**:
- `login`: From authStore (called on successful API response)

**React Query State**:
- `loginMutation`: From useMutation (for login API call)
- `registerMutation`: From useMutation (for register API call)

---

#### 5. ProfilePage.tsx / ProfileForm.tsx
**Local State**: None (form state managed by React Hook Form)

**React Hook Form State**:
- `displayName`: Form field
- `bio`: Form field
- `avatarFile`: File upload field (may need useState for file preview)

**Zustand State**:
- `updateProfile`: From authStore (update user data after successful API call)

**React Query State**:
- `profile`: From useProfile query (fetch profile data)
- `updateProfileMutation`: From useMutation (update profile API call)

---

## Component Hierarchy

### Before Refactoring

```
App
├── Layout
│   ├── Header (20+ state pieces, polling logic)
│   ├── Main Content
│   │   ├── HomePage (useState + useEffect for games)
│   │   ├── LeaderboardPage (useState + useEffect for leaderboard, AbortController)
│   │   ├── Game (500+ lines, 20+ useState hooks)
│   │   │   ├── LevelSelector
│   │   │   ├── DirectionSelector
│   │   │   ├── QuestionDisplay
│   │   │   │   └── MultipleChoice
│   │   │   └── StatisticsView
│   │   ├── Login (manual validation)
│   │   ├── Register (manual validation)
│   │   └── ProfilePage
│   │       └── ProfileForm (manual validation)
│   └── Footer
```

### After Refactoring

```
App (with QueryClientProvider)
├── Layout
│   ├── Header (reads authStore, uses useProfile query)
│   ├── Main Content
│   │   ├── HomePage (uses useGames query, reads authStore)
│   │   ├── LeaderboardPage (responsive tabs/dropdown, uses useGames + useLeaderboard queries)
│   │   │   ├── Tabs (tablet+) / Select (mobile)
│   │   │   ├── Leaderboard (standard games)
│   │   │   └── VocabQuizLeaderboard (vocab-quiz)
│   │   ├── VocabQuizGame (NEW, replaces Game for vocab-quiz)
│   │   │   ├── GameConfigFlow (NEW, orchestrates level + direction selection)
│   │   │   │   ├── LevelSelector (refactored)
│   │   │   │   └── DirectionSelector (refactored)
│   │   │   ├── QuizPlay (NEW, extracted from Game playing state)
│   │   │   │   ├── QuestionDisplay
│   │   │   │   │   └── MultipleChoice (fixed text wrapping)
│   │   │   │   └── QuizTimer (NEW, extracted timer logic)
│   │   │   └── QuizResults (NEW, extracted from Game completed state)
│   │   │       └── StatisticsView (fixed labels, time format)
│   │   ├── Login (React Hook Form + Zod, useMutation)
│   │   ├── Register (React Hook Form + Zod, useMutation)
│   │   └── ProfilePage (uses useProfile query)
│   │       └── ProfileForm (React Hook Form + Zod, useMutation)
│   └── Footer
└── Stores (Zustand)
    ├── authStore (global auth state)
    └── gameStore (quiz game state)
```

---

## Data Flow Diagrams

### 1. Authentication Flow (with Zustand)

```
User Login
    ↓
Login Component (RHF validation)
    ↓
useMutation (loginMutation)
    ↓
API: POST /api/v1/auth/login
    ↓
Response: { user_id, username, jwt_token, profile }
    ↓
authStore.login(userData)
    ├── Store user in Zustand state
    ├── Store JWT in localStorage
    └── Dispatch 'auth-state-changed' event (backward compatibility)
    ↓
All components with authStore subscriptions update automatically
    ├── Header: Shows user avatar/menu
    ├── Layout: Updates ProfileBanner
    └── HomePage: Shows authenticated game options
```

**Key Changes**:
- Single source of truth (authStore) instead of scattered localStorage reads
- No polling logic (Zustand reactive subscriptions)
- Fewer event listeners (backward compatibility only)

---

### 2. Quiz Game Flow (with Zustand gameStore)

```
VocabQuizGame Mount
    ↓
gameStore.reset() → gameState: 'level-selection'
    ↓
GameConfigFlow renders LevelSelector
    ↓
User selects level → gameStore.setLevel(level)
    ↓
gameState → 'direction-selection'
    ↓
GameConfigFlow renders DirectionSelector
    ↓
User selects direction → gameStore.setDirection(direction)
    ↓
API: POST /api/v1/vocab-quiz/session/start → { session_id, questions }
    ↓
gameStore.startSession(session_id, questions)
    ├── Store session_id, questions
    ├── gameState → 'playing'
    └── startTimer()
    ↓
QuizPlay renders QuestionDisplay with current question
    ↓
User selects answer → gameStore.selectAnswer(answer)
    ↓
API: POST /api/v1/vocab-quiz/answer → { is_correct }
    ↓
gameStore.submitAnswer(is_correct, correct_answer)
    ├── Update score (correctCount / incorrectCount)
    ├── Show feedback (green/red button colors)
    └── Delay 1s → gameStore.nextQuestion()
    ↓
Repeat until all questions answered
    ↓
API: POST /api/v1/vocab-quiz/session/:id/finish → { session_statistics }
    ↓
gameStore.finishSession(statistics)
    ├── stopTimer()
    ├── Store sessionStatistics
    └── gameState → 'completed'
    ↓
QuizResults renders final statistics
    ↓
User clicks "Play Again" → gameStore.reset() → Back to level-selection
```

**Key Changes**:
- Single gameStore manages all quiz state (replaces 20+ useState hooks)
- State machine pattern (gameState: 'level-selection' | 'direction-selection' | 'playing' | 'completed')
- Timer logic encapsulated in store (startTimer, stopTimer actions)

---

### 3. Data Fetching Flow (with React Query)

```
HomePage Mount
    ↓
useGames() hook
    ↓
React Query checks cache
    ├── Cache Hit (fresh data, < 5 min old)
    │   └── Return cached data immediately
    └── Cache Miss or Stale (≥ 5 min old)
        ↓
        API: GET /api/v1/games
        ↓
        Response: Game[]
        ↓
        React Query updates cache
        ↓
        Component re-renders with data
        ↓
        Background refetch on window focus (automatic)
```

**Key Changes**:
- No manual useEffect + useState boilerplate (50+ lines → 3 lines)
- Automatic caching (HomePage and LeaderboardPage share games cache)
- Automatic refetching on window focus (data freshness without polling)
- Built-in loading/error states (isLoading, isError from useQuery)

---

### 4. Form Validation Flow (with React Hook Form)

```
User types in Login form
    ↓
React Hook Form (uncontrolled input)
    └── No re-render on every keystroke (performance ↑)
    ↓
User submits form → handleSubmit(onSubmit)
    ↓
Zod schema validation (loginSchema)
    ├── Valid → Call onSubmit(data)
    │   ↓
    │   useMutation (loginMutation)
    │   ↓
    │   API: POST /api/v1/auth/login
    │   ↓
    │   Success → authStore.login(userData)
    │   ↓
    │   Navigate to home/redirect URL
    └── Invalid → Show errors
        ↓
        errors.username → "Username must be at least 3 characters"
        errors.password → "Password must be at least 8 characters"
```

**Key Changes**:
- Uncontrolled inputs (3 re-renders per form vs 10-15 with manual validation)
- Centralized schemas (loginSchema reused for Login + Register)
- Type-safe (TypeScript infers form data types from Zod schema)

---

## State Transitions

### Game State Machine (gameStore.gameState)

```
[Start]
    ↓
'level-selection'
    ↓ setLevel(level)
'direction-selection'
    ↓ setDirection(direction) + startSession()
'playing'
    ↓ finishSession(statistics)
'completed'
    ↓ reset()
'level-selection' (loop)
```

**States**:
1. **level-selection**: User selects CEFR level (A1, A2, B1, B2, C1, C2)
2. **direction-selection**: User selects translation direction (en-to-vi, vi-to-en)
3. **playing**: User answers quiz questions one by one
4. **completed**: User views final statistics and score

**Transitions**:
- `level-selection` → `direction-selection`: setLevel(level) called
- `direction-selection` → `playing`: setDirection(direction) + API startSession successful
- `playing` → `completed`: All questions answered + API finishSession successful
- `completed` → `level-selection`: reset() called (Play Again button)

**Edge Cases**:
- **Back Navigation**: From direction-selection → level-selection (setLevel(null))
- **API Errors**: Remain in current state, show error message, allow retry
- **Session Timeout**: finishSession fails → Still transition to completed with cached statistics

---

## Type Definitions

### Zustand Store Types

```typescript
// src/stores/authStore.ts
export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: LoginResponse) => void;
  logout: () => void;
  updateProfile: (profile: UserProfile) => void;
  initialize: () => Promise<void>;
}

// src/stores/gameStore.ts
export interface GameStore {
  // Configuration
  gameCode: string | null;
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
  score: number;
  
  // Timer
  startTime: number | null;
  timeElapsed: number;
  
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

export type GameState = 'level-selection' | 'direction-selection' | 'playing' | 'completed';
```

### React Hook Form Schema Types

```typescript
// src/schemas/authSchema.ts
import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = loginSchema; // Same validation rules

export type RegisterFormData = z.infer<typeof registerSchema>;

// src/schemas/profileSchema.ts
export const profileSchema = z.object({
  display_name: z.string().max(50, 'Display name must be 50 characters or less').optional(),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
  avatar: z.instanceof(File).optional()
});

export type ProfileFormData = z.infer<typeof profileSchema>;
```

### React Query Hook Types

```typescript
// src/hooks/queries/useGames.ts
import { useQuery } from '@tanstack/react-query';
import { fetchGames } from '@/lib/api';

export function useGames() {
  return useQuery({
    queryKey: ['games'],
    queryFn: fetchGames,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}

// Return type: { data: Game[], isLoading: boolean, isError: boolean, error: Error | null }

// src/hooks/queries/useLeaderboard.ts
export function useLeaderboard(gameId: number | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ['leaderboard', gameId],
    queryFn: () => fetchLeaderboard(gameId!),
    enabled: enabled && gameId !== null,
    staleTime: 2 * 60 * 1000 // 2 minutes (leaderboards change more frequently)
  });
}

// src/hooks/queries/useProfile.ts
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    staleTime: 10 * 60 * 1000 // 10 minutes (profile changes infrequently)
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();
  
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      authStore.updateProfile(data);
    }
  });
}
```

---

## Responsive Breakpoint Logic

### useIsMobile Hook (Existing)

```typescript
// src/hooks/use-mobile.ts
const MOBILE_BREAKPOINT = 768; // md breakpoint

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);
  
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  
  return !!isMobile;
}
```

**Usage**:
```typescript
// LeaderboardPage.tsx
const isMobile = useIsMobile();

return isMobile
  ? <Select value={selectedGame} onValueChange={handleSelect}>{games.map(...)}</Select>
  : <Tabs value={selectedGame} onValueChange={handleSelect}><TabsList className="flex-wrap">{games.map(...)}</TabsList></Tabs>
```

---

## Performance Optimizations

### Zustand Selective Subscriptions

```typescript
// ❌ BAD: Component re-renders on ANY authStore change
function Header() {
  const authStore = useAuthStore(); // Subscribes to entire store
  return <div>{authStore.user?.username}</div>;
}

// ✅ GOOD: Component only re-renders when user changes
function Header() {
  const user = useAuthStore(state => state.user); // Selective subscription
  return <div>{user?.username}</div>;
}
```

### React Query Caching Strategy

```typescript
// Query Client Configuration (src/main.tsx)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes default
      cacheTime: 10 * 60 * 1000, // 10 minutes in memory
      refetchOnWindowFocus: true, // Refetch when user returns to tab
      retry: 1 // Retry failed requests once
    }
  }
});
```

**Cache Behavior**:
- `games` query: 5-minute stale time (games rarely change)
- `leaderboard` query: 2-minute stale time (leaderboards update frequently)
- `profile` query: 10-minute stale time (profile changes infrequently)

---

## Summary

**State Management**:
- **Global State**: Zustand stores (authStore, gameStore)
- **Server State**: React Query (useGames, useLeaderboard, useProfile)
- **Form State**: React Hook Form (Login, Register, Profile)
- **Local State**: Component-specific UI state (modals, dropdowns)

**Data Flow**:
- **Auth Flow**: Login → useMutation → authStore.login → All components update
- **Quiz Flow**: VocabQuizGame → gameStore state machine → QuizPlay/QuizResults
- **Data Fetching**: Component mount → useQuery → API call → Cache → Re-render

**Key Improvements**:
- **300+ lines of boilerplate removed** (useEffect + useState patterns)
- **Fewer re-renders** (Zustand selective subscriptions, RHF uncontrolled inputs)
- **Automatic caching** (React Query eliminates duplicate API calls)
- **Better maintainability** (Centralized state, schemas, query hooks)

