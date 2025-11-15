# Quick Start Guide: Frontend UI/UX Fixes

**Feature**: Frontend UI/UX Fixes  
**Date**: 2025-11-14

## Overview

This guide provides a step-by-step implementation plan for all 9 frontend UI/UX fixes. Follow the order below to minimize conflicts and ensure each fix is independently verifiable.

## Prerequisites

- Node.js 18+ and npm installed
- Frontend development server running (`npm run dev`)
- Browser with React DevTools and React Query DevTools extensions installed
- Test devices or browser responsive mode for 320px, 768px, 1024px viewports

## Phase 1: Foundation Setup (Est: 30 min)

### Step 1.1: Install Dependencies

```bash
cd frontend
npm install zustand react-hook-form @hookform/resolvers zod @tanstack/react-query @tanstack/react-query-devtools
```

**Verify Installation**:
```bash
npm list zustand react-hook-form zod @tanstack/react-query
```

**Expected Output**:
```
frontend@0.0.0
├── @tanstack/react-query@5.x.x
├── react-hook-form@7.x.x
├── zod@3.x.x
└── zustand@4.x.x
```

---

### Step 1.2: Setup React Query Provider

**File**: `src/main.tsx`

```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App';
import './index.css';

// Create QueryClient with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: true,
      retry: 1
    }
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);
```

**Test**: Refresh app, check browser console for no errors. React Query DevTools icon should appear (bottom-left corner).

---

### Step 1.3: Create Zustand Auth Store

**File**: `src/stores/authStore.ts` (NEW)

```typescript
import { create } from 'zustand';
import type { UserProfile } from '@/types';

interface LoginResponse {
  user_id: number;
  username: string;
  jwt_token: string;
  profile?: UserProfile;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (userData: LoginResponse) => void;
  logout: () => void;
  updateProfile: (profile: UserProfile) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  login: (userData) => {
    // Store in localStorage
    localStorage.setItem('jwt_token', userData.jwt_token);
    localStorage.setItem('user_id', userData.user_id.toString());
    localStorage.setItem('username', userData.username);
    
    set({
      user: userData.profile || { user_id: userData.user_id, username: userData.username },
      isAuthenticated: true,
      isLoading: false
    });
    
    // Dispatch event for backward compatibility
    window.dispatchEvent(new Event('auth-state-changed'));
  },
  
  logout: () => {
    // Clear localStorage
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
    
    // Dispatch event for backward compatibility
    window.dispatchEvent(new Event('auth-state-changed'));
  },
  
  updateProfile: (profile) => {
    set({ user: profile });
  },
  
  initialize: async () => {
    const token = localStorage.getItem('jwt_token');
    const userId = localStorage.getItem('user_id');
    const username = localStorage.getItem('username');
    
    if (token && userId && username) {
      // TODO: Optionally fetch profile from API
      set({
        user: { user_id: parseInt(userId), username },
        isAuthenticated: true,
        isLoading: false
      });
    } else {
      set({ isLoading: false });
    }
  }
}));
```

---

### Step 1.4: Initialize Auth Store on App Mount

**File**: `src/App.tsx`

Add initialization in AppRoutes component:

```typescript
import { useAuthStore } from '@/stores/authStore';

function AppRoutes() {
  const initialize = useAuthStore(state => state.initialize);
  
  useEffect(() => {
    initialize();
  }, [initialize]);
  
  // ... rest of component
}
```

**Test**: 
1. Login to app
2. Refresh page
3. Check React DevTools → Components → App → hooks → Store (should show isAuthenticated: true)

---

### Step 1.5: Create Store Index File

**File**: `src/stores/index.ts` (NEW)

```typescript
export { useAuthStore } from './authStore';
// Export gameStore when created in Phase 3
```

**Checkpoint**: Foundation is ready. Auth store initialized, React Query provider added.

---

## Phase 2: Fix P1 Issues - Critical Responsive Fixes (Est: 2-3 hours)

### Step 2.1: Fix Mobile Header (P1)

**Issue**: Menu button not visible, buttons overflow on mobile

**File**: `src/components/layout/Header.tsx`

**Changes**:

1. **Add mobile menu button** (currently missing):
```typescript
// Add import
import { Menu } from 'lucide-react';

// Inside Header component, before navigation section
<div className="flex items-center md:hidden">
  <Button
    variant="ghost"
    size="icon"
    aria-label="Open menu"
    onClick={() => {/* TODO: Implement mobile menu */}}
  >
    <Menu className="h-6 w-6" />
  </Button>
</div>
```

2. **Fix button row layout** (remove flex-col on mobile):
```typescript
// Find this line:
<div className="relative flex flex-col sm:flex-row sm:items-center py-4 sm:py-6 gap-2 sm:gap-4">

// Replace with:
<div className="relative flex flex-row items-center justify-between py-4 sm:py-6 gap-2 sm:gap-4">
```

3. **Ensure auth buttons stay in single row**:
```typescript
// Find auth section (right side)
<div className="flex items-center gap-2 sm:gap-4 sm:absolute sm:right-0">
  <ModeToggle />
  {authenticated ? (
    <DropdownMenu>...</DropdownMenu>
  ) : (
    <>
      <Link to="/login">
        <Button variant="ghost" size="sm">Login</Button>
      </Link>
      <Link to="/register">
        <Button size="sm">Sign Up</Button>
      </Link>
    </>
  )}
</div>
```

**Test**:
1. Open browser responsive mode (320px width)
2. Verify menu button is visible (left side)
3. Verify Login/Sign Up buttons are in single row (right side)
4. Verify no wrapping occurs at 320px, 375px, 414px widths

---

### Step 2.2: Fix Leaderboard Tabs (P1)

**Issue**: Tabs overflow horizontally on mobile/tablet

**File**: `src/components/leaderboard/LeaderboardPage.tsx`

**Changes**:

1. **Install shadcn Select component**:
```bash
npx shadcn@latest add select
```

2. **Import required components**:
```typescript
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
```

3. **Add conditional rendering** (replace Tabs section):
```typescript
const isMobile = useIsMobile();

// Replace the Tabs section with:
{isMobile ? (
  // Mobile: Dropdown Select
  <Select value={selectedGameId?.toString()} onValueChange={(value) => handleTabChange(value)}>
    <SelectTrigger className="w-full max-w-xs">
      <SelectValue placeholder="Select a game" />
    </SelectTrigger>
    <SelectContent>
      {games.map((game) => (
        <SelectItem key={game.game_id} value={game.game_id.toString()}>
          {game.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
) : (
  // Tablet+: Wrapped Tabs
  <Tabs value={selectedGameId?.toString()} onValueChange={handleTabChange} className="w-full">
    <TabsList className="flex-wrap justify-start h-auto">
      {games.map((game) => (
        <TabsTrigger key={game.game_id} value={game.game_id.toString()} className="mb-2">
          {game.name}
        </TabsTrigger>
      ))}
    </TabsList>
    {/* TabsContent sections remain the same */}
  </Tabs>
)}
```

**Test**:
1. Open leaderboard page on mobile (< 768px): Verify dropdown selector visible
2. Open leaderboard page on tablet/desktop (≥ 768px): Verify tabs visible and wrapped
3. Select each game: Verify correct leaderboard loads
4. Test with 10+ games: Verify no horizontal scrolling

---

### Step 2.3: Fix Answer Text Display (P1)

**Issue**: Long answer text overflows buttons

**File**: `src/components/game/MultipleChoice.tsx`

**Changes**:

```typescript
// Find Button component, update className:
<Button
  key={option.letter}
  onClick={() => !disabled && onSelect(option.letter)}
  disabled={disabled}
  variant="outline"
  className={cn(
    'h-auto min-h-[4rem] py-4 px-4 text-left justify-start whitespace-normal break-words',
    getButtonClassName(option.letter),
  )}
>
  <span className="font-semibold mr-2 shrink-0">{option.letter.toUpperCase()}.</span>
  <span className="font-semibold">{option.text}</span>
</Button>
```

**Key Changes**:
- `h-auto`: Allow button height to grow with content
- `min-h-[4rem]`: Minimum height for consistent button size
- `whitespace-normal`: Allow text wrapping (default is nowrap)
- `break-words`: Break long words if necessary
- `shrink-0` on letter: Prevent letter from shrinking

**Test**:
1. Start vocab quiz with long answers (test question with 50+ character answers)
2. Verify answers wrap within buttons at 320px, 768px, 1024px widths
3. Verify buttons remain same height when text wraps
4. Verify button grid (2 columns) remains intact

---

**Checkpoint**: All P1 issues fixed. Header responsive, leaderboard tabs work on all screens, answer text wraps correctly.

---

## Phase 3: Fix P2 Issues - Important Improvements (Est: 3-4 hours)

### Step 3.1: Add Content Padding Consistency (P2)

**Issue**: Pages lack consistent horizontal padding

**Strategy**: Add `px-4` class to page wrapper divs

**Files to Update**:

1. **Login.tsx**:
```typescript
<div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-8 px-4">
  <Card className="w-full max-w-md">...</Card>
</div>
```

2. **Register.tsx**: (same pattern as Login)

3. **Game.tsx** (Level Selection):
```typescript
<div className="max-w-4xl mx-auto py-8 px-4">
  <CefrLevelSelector ... />
</div>
```

4. **Game.tsx** (Direction Selection):
```typescript
<div className="max-w-4xl mx-auto py-8 px-4">
  <DirectionSelector ... />
</div>
```

5. **Game.tsx** (Playing/Completed):
```typescript
<div className="max-w-4xl mx-auto py-8 px-4">
  {/* Quiz content */}
</div>
```

6. **SessionStatisticsPage.tsx**:
```typescript
<div className="max-w-7xl mx-auto py-8 px-4">
  {/* Statistics content */}
</div>
```

7. **WordDetailPage.tsx**:
```typescript
<div className="max-w-4xl mx-auto py-8 px-4">
  {/* Word detail content */}
</div>
```

**Test**:
1. Navigate through all pages at 320px width
2. Verify content doesn't touch screen edges (at least 1rem spacing)
3. Verify padding consistent across all pages

---

### Step 3.2: Fix Chart Responsive Sizing (P2)

**Issue**: Charts overflow viewport on mobile

**Files to Update**: 
- `StatisticsOverview.tsx`
- `SessionStatisticsPage.tsx`
- `WordDetailPage.tsx` (if has charts)

**Changes** (apply to ALL charts):

```typescript
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

// Wrap chart with ResponsiveContainer
<ResponsiveContainer width="100%" aspect={2}>
  <BarChart data={data}>
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="value" fill="#3b82f6" />
  </BarChart>
</ResponsiveContainer>
```

**Aspect Ratios**:
- Bar charts: `aspect={2}` (landscape, better for labels)
- Line charts: `aspect={1.8}` (slightly more square)
- Pie charts: `aspect={1}` (square)

**Test**:
1. Open statistics pages at 320px, 768px, 1024px widths
2. Verify all charts fit within viewport (no horizontal scrolling)
3. Verify charts remain readable (labels visible, bars distinguishable)

---

### Step 3.3: Game Routing & Component Splitting (P2)

**Issue**: Game.tsx is 500+ lines, routing to generic Game component

**Step 3.3a: Create VocabQuizGame Component**

**File**: `src/components/game/VocabQuizGame.tsx` (NEW)

```typescript
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '@/stores/gameStore';
import CefrLevelSelector from './CefrLevelSelector';
import DirectionSelector from './DirectionSelector';
// Import other components as you extract them

interface Props {
  userId: number;
}

export default function VocabQuizGame({ userId }: Props) {
  const { gameState } = useGameStore();
  const navigate = useNavigate();
  
  // Render based on game state
  if (gameState === 'level-selection') {
    return <CefrLevelSelector ... />;
  }
  
  if (gameState === 'direction-selection') {
    return <DirectionSelector ... />;
  }
  
  if (gameState === 'playing') {
    return <QuizPlay ... />;
  }
  
  if (gameState === 'completed') {
    return <QuizResults ... />;
  }
  
  return null;
}
```

**Step 3.3b: Create Game Store**

**File**: `src/stores/gameStore.ts` (NEW)

```typescript
import { create } from 'zustand';
import type { CefrLevel, Question, SessionStatistics, TranslationDirection } from '@/types';

type GameState = 'level-selection' | 'direction-selection' | 'playing' | 'completed';

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
  score: number;
  
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
  score: 0,
  startTime: null,
  timeElapsed: 0,
  timerInterval: null,
  sessionStatistics: null,
  gameState: 'level-selection',
  loading: false,
  error: null,
  
  // Actions
  setLevel: (level) => set({ selectedLevel: level, gameState: 'direction-selection' }),
  
  setDirection: (direction) => set({ translationDirection: direction }),
  
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
      score: isCorrect ? state.score + 1 : state.score,
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
      score: 0,
      startTime: null,
      timeElapsed: 0,
      sessionStatistics: null,
      gameState: 'level-selection',
      error: null
    });
  },
  
  startTimer: () => {
    const interval = window.setInterval(() => {
      const state = get();
      if (state.startTime) {
        set({ timeElapsed: Date.now() - state.startTime });
      }
    }, 1000);
    set({ timerInterval: interval });
  },
  
  stopTimer: () => {
    const state = get();
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      set({ timerInterval: null });
    }
  }
}));
```

**Step 3.3c: Update Routing**

**File**: `src/App.tsx`

```typescript
// Import VocabQuizGame
import VocabQuizGame from '@/components/game/VocabQuizGame';

// Update route (replace Game with VocabQuizGame)
<Route
  path="/game/:code"
  element={
    userId !== null && !isLoggingOut.current ? (
      code === 'vocab-quiz' ? <VocabQuizGame userId={userId} /> : <ComingSoon gameCode={code} />
    ) : isLoggingOut.current ? (
      <Navigate to="/" replace />
    ) : (
      <Navigate to={`/login?redirect_to=${encodeURIComponent(location.pathname)}`} />
    )
  }
/>
```

**Test**:
1. Navigate to vocab quiz game
2. Complete full quiz flow (level → direction → playing → completed)
3. Click "Play Again": Verify routes to VocabQuizGame (check React DevTools component tree)
4. Verify game state resets correctly

---

**Checkpoint**: All P2 issues fixed. Content has consistent padding, charts responsive, game routing updated.

---

## Phase 4: Fix P3 Issues - Minor Improvements (Est: 1-2 hours)

### Step 4.1: Change "Total Score" to "Total Questions" (P3)

**Files to Update**:

1. **Game.tsx** (completion screen):
```typescript
<div>
  <p className="text-2xl font-bold">{totalQuestions}</p>
  <p className="text-sm text-muted-foreground">Total Questions</p>
</div>
```

2. **StatisticsView.tsx**:
```typescript
<CardTitle className="text-sm font-medium text-muted-foreground">
  Total Questions
</CardTitle>
<CardContent>
  <div className="text-2xl font-bold">{totalQuestions}</div>
</CardContent>
```

3. **StatisticsOverview.tsx**:
```typescript
<CardTitle className="text-sm font-medium text-muted-foreground">
  Total Questions
</CardTitle>
```

**Test**:
1. Complete quiz, check completion screen: "Total Questions" label
2. View session statistics: "Total Questions" label
3. Verify numeric value is correct (correct + incorrect counts)

---

### Step 4.2: Display Time in Seconds Format (P3)

**Step 4.2a: Create Utility Function**

**File**: `src/lib/utils.ts`

Add this function:

```typescript
/**
 * Formats duration in seconds to human-readable string.
 * Examples: 45 → "45s", 90 → "1m 30s", 125 → "2m 5s"
 */
export function formatDuration(seconds: number): string {
  const roundedSeconds = Math.floor(seconds);
  if (roundedSeconds < 60) return `${roundedSeconds}s`;
  const mins = Math.floor(roundedSeconds / 60);
  const secs = roundedSeconds % 60;
  return `${mins}m ${secs}s`;
}
```

**Step 4.2b: Update Components**

1. **StatisticsView.tsx**:
```typescript
import { formatDuration } from '@/lib/utils';

// Replace this:
// const timeMinutes = statistics.time_elapsed ? (statistics.time_elapsed / 60).toFixed(1) : '0.0';

// With this:
const timeFormatted = statistics.time_elapsed ? formatDuration(statistics.time_elapsed) : '0s';

// Update display:
<p className="text-lg">Time: {timeFormatted}</p>
```

2. **Game.tsx** (completion screen):
```typescript
import { formatDuration } from '@/lib/utils';

<div className="mt-4">
  <p className="text-lg">
    Time: {formatDuration(sessionStatistics.time_elapsed)}
  </p>
</div>
```

3. **StatisticsOverview.tsx** (if displays time):
```typescript
import { formatDuration } from '@/lib/utils';

// Replace calculation with formatDuration call
```

**Test**:
1. Complete quiz in <60 seconds: Verify time shows "45s" format
2. Complete quiz in 60-120 seconds: Verify time shows "1m 30s" format
3. View session statistics: Verify consistent time format

---

### Step 4.3: Remove Answer Selection Blur Effect (P3)

**File**: Search for blur CSS classes in Game components

**Strategy**: Remove any `blur-*` classes or `filter: blur()` styles

**Files to Check**:
- `QuestionDisplay.tsx`
- `MultipleChoice.tsx`
- `Game.tsx` (playing state)

**Typical blur pattern**:
```typescript
// REMOVE this pattern:
<div className={cn('transition-all', selectedAnswer && 'blur-sm')}>
  {/* Question content */}
</div>

// Keep just:
<div>
  {/* Question content */}
</div>
```

**Test**:
1. Start quiz, select any answer
2. Verify no blur effect during feedback period
3. Verify feedback text remains fully legible
4. Verify correct answer highlighting visible

---

**Checkpoint**: All P3 issues fixed. Labels updated, time formatted correctly, no blur effects.

---

## Phase 5: React Query Migration (Est: 2-3 hours)

### Step 5.1: Create React Query Hooks

**File**: `src/hooks/queries/useGames.ts` (NEW)

```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchGames } from '@/lib/api';

export function useGames() {
  return useQuery({
    queryKey: ['games'],
    queryFn: fetchGames,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}
```

**File**: `src/hooks/queries/useLeaderboard.ts` (NEW)

```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchLeaderboard } from '@/lib/api';

export function useLeaderboard(gameId: number | null) {
  return useQuery({
    queryKey: ['leaderboard', gameId],
    queryFn: () => fetchLeaderboard(gameId!),
    enabled: gameId !== null,
    staleTime: 2 * 60 * 1000 // 2 minutes
  });
}
```

**File**: `src/hooks/queries/useProfile.ts` (NEW)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    staleTime: 10 * 60 * 1000 // 10 minutes
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const updateProfileInStore = useAuthStore(state => state.updateProfile);
  
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      updateProfileInStore(data);
    }
  });
}
```

**File**: `src/hooks/queries/index.ts` (NEW)

```typescript
export { useGames } from './useGames';
export { useLeaderboard } from './useLeaderboard';
export { useProfile, useUpdateProfile } from './useProfile';
```

---

### Step 5.2: Migrate HomePage

**File**: `src/components/home/HomePage.tsx`

**Before**:
```typescript
const [games, setGames] = useState<Game[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const loadGames = async () => {
    try {
      const data = await fetchGames();
      setGames(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  loadGames();
}, []);
```

**After**:
```typescript
import { useGames } from '@/hooks/queries';

const { data: games = [], isLoading, error } = useGames();
```

**Test**: Verify games load, check React Query DevTools for cache entry.

---

### Step 5.3: Migrate LeaderboardPage

**File**: `src/components/leaderboard/LeaderboardPage.tsx`

Replace games and leaderboard fetching with React Query hooks:

```typescript
import { useGames, useLeaderboard } from '@/hooks/queries';

const { data: games = [], isLoading: gamesLoading } = useGames();
const { data: leaderboard, isLoading: leaderboardLoading } = useLeaderboard(selectedGameId);
```

**Remove**: AbortController logic, useState for loading/error, useEffect for fetching

**Test**: Verify leaderboards load, check React Query DevTools for cache entries.

---

### Step 5.4: Migrate ProfilePage

**File**: `src/components/profile/ProfilePage.tsx`

```typescript
import { useProfile, useUpdateProfile } from '@/hooks/queries';

const {
  data: profile,
  isLoading,
  isError,
  error,
  refetch,
} = useProfile();
const updateProfileMutation = useUpdateProfile();

useEffect(() => {
  if (error) {
    toast.error(error.message);
  }
}, [error]);

const handleSubmit = async (formData: FormData) => {
  const updatedProfile = await updateProfileMutation.mutateAsync(formData);
  toast.success('Profile updated successfully!');

  if (isOnboarding && updatedProfile.is_complete) {
    navigate('/');
  }
};
```

- Show a retry card when `isError` is true so users can refresh the query.
- Pass `isLoading || updateProfileMutation.isPending` down to `ProfileForm` to keep CTA buttons disabled during mutations.

**Test**: Verify profile loads, update profile, and confirm the `profile` query cache updates in React Query DevTools. Use the retry button to ensure refetch logic works after simulated API failures.

---

### Step 5.5: Connect Header to React Query

**File**: `src/components/layout/Header.tsx`

1. Import the hook: `import { useProfile } from '@/hooks/queries';`
2. Call it with an `enabled` guard so unauthenticated sessions skip the request:

```typescript
const authenticated = useAuthStore((state) => state.isAuthenticated);
const { data: profile } = useProfile({ enabled: authenticated });
```

3. Merge the query result with the auth store fallback so the dropdown stays populated even before the first fetch completes:

```typescript
const authUser = useAuthStore((state) => state.user);
const resolvedProfile = authenticated ? profile ?? authUser ?? null : null;
```

4. Remove the old `getProfile` `useEffect`/polling logic—React Query now owns profile fetching, caching, and refetching.

**Test**: Log in, refresh, and confirm the avatar/name updates immediately when profile data changes. Verify React Query DevTools shows only one cached `profile` request shared by Header and ProfilePage.

---

**Checkpoint**: React Query migration complete. All API calls use query hooks with caching.

---

## Phase 6: React Hook Form Migration (Est: 1-2 hours)

### Step 6.1: Create Validation Schemas

**File**: `src/schemas/authSchema.ts` (NEW)

```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = loginSchema;

export type RegisterFormData = z.infer<typeof registerSchema>;
```

**File**: `src/schemas/profileSchema.ts` (NEW)

```typescript
import { z } from 'zod';

export const profileSchema = z.object({
  display_name: z.string().max(50, 'Display name must be 50 characters or less').optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional().or(z.literal(''))
});

export type ProfileFormData = z.infer<typeof profileSchema>;
```

**File**: `src/schemas/index.ts` (NEW)

```typescript
export * from './authSchema';
export * from './profileSchema';
```

---

### Step 6.2: Migrate Login Component

**File**: `src/components/auth/Login.tsx`

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/schemas';

export default function Login({ onLogin }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });
  
  const onSubmit = async (data: LoginFormData) => {
    try {
      const user = await login(data.username, data.password, redirectTo);
      // ... handle success
    } catch (err) {
      // ... handle error
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        {...register('username')}
        placeholder="Username"
      />
      {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
      
      <Input
        {...register('password')}
        type="password"
        placeholder="Password"
      />
      {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
      
      <Button type="submit">Login</Button>
    </form>
  );
}
```

**Test**: Verify validation errors show for invalid inputs, successful login works.

---

### Step 6.3: Migrate Register Component

Same pattern as Login (reuse loginSchema).

---

### Step 6.4: Migrate ProfileForm Component

**File**: `src/components/profile/ProfileForm.tsx`

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileFormData } from '@/schemas';

export function ProfileForm({ profile, onSubmit }: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: profile?.display_name || '',
      bio: profile?.bio || '',
    },
  });

  useEffect(() => {
    reset({
      display_name: profile?.display_name || '',
      bio: profile?.bio || '',
    });
  }, [profile, reset]);

  const onFormSubmit = async (values: ProfileFormData) => {
    const formData = new FormData();
    if (values.display_name?.trim()) formData.append('display_name', values.display_name.trim());
    if (values.bio?.trim()) formData.append('bio', values.bio.trim());
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      {/* Inputs wired up with {...register('field')} */}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}
```

**Test**: Verify character limits enforced, error messages display correctly.

**Additional Notes**:
- Use `formState.isSubmitting` instead of separate `useState` flags for all RHF-powered forms.
- Keep avatar uploads outside of Zod—`AvatarUpload` already enforces file size/type before calling `onSubmit`.
- `profileSchema` allows empty strings, so untouched optional fields don’t block submission.

---

**Checkpoint**: React Hook Form migration complete. All forms use RHF + Zod validation.

---

## Phase 14: Component Splitting (Game Flow)

**Goal**: Break the monolithic `VocabQuizGame` JSX into smaller, testable pieces.

1. **Create `GameConfigFlow.tsx`** – renders CEFR level & direction selectors for the `level-selection`/`direction-selection` states. Accepts `gameState`, `levels`, and `onReset` so it can recover from inconsistent store data.
2. **Create `QuizPlay.tsx`** – renders the progress header + `QuestionDisplay`, and falls back to a friendly card when no questions are returned.
3. **Create `QuizResults.tsx`** – renders the completion stats grid (correct/incorrect/total/accuracy/time) with “Play Again” and “View Statistics” buttons.
4. **Export `GameState` from `gameStore.ts`** – allows the new components to type their props accurately and documents the finite state machine.
5. **Add inline comments** inside `gameStore.ts` for transitions (`startSession`, `finishSession`) and the 10ms timer helpers to clarify behavior.
6. **Update `VocabQuizGame.tsx`** – replace the inline JSX branches with the new components, keep loading/error cards, and wire existing handlers through props.

**Test**: Run through the full quiz flow (level → direction → playing → completed → play again) and confirm the same API calls fire. Use React DevTools to verify `GameConfigFlow`, `QuizPlay`, and `QuizResults` render at the expected phases.

---

## Phase 7: Final Testing & Verification (Est: 1-2 hours)

### Manual Test Checklist

**Responsive Design** (Test at 320px, 768px, 1024px):
- [ ] Header: Menu button visible on mobile, buttons in single row
- [ ] Leaderboard: Dropdown on mobile (<768px), wrapped tabs on tablet+ (≥768px)
- [ ] All pages: Content has 1rem horizontal padding
- [ ] Answer buttons: Text wraps within buttons, no overflow
- [ ] Charts: Fit within viewport, no horizontal scrolling

**Labels & Formatting**:
- [ ] "Total Questions" displays (not "Total Score") on completion screen
- [ ] "Total Questions" displays in statistics overview
- [ ] Time displays as "45s" for <60 seconds
- [ ] Time displays as "1m 30s" for ≥60 seconds

**Routing & State**:
- [ ] Completing vocab quiz routes to VocabQuizGame (verify in React DevTools)
- [ ] "Play Again" resets game state correctly
- [ ] Auth state persists across page refreshes
- [ ] React Query cache works (navigate away and back, no duplicate API calls)

**Visual Effects**:
- [ ] No blur effect during answer feedback
- [ ] Feedback text fully legible
- [ ] Correct answer highlighting visible

**Performance**:
- [ ] UI interactions respond in <100ms (use Chrome DevTools Performance tab)
- [ ] No layout shifts during page load
- [ ] Smooth transitions between game states

---

## Troubleshooting

### Issue: Zustand store not persisting across refreshes
**Solution**: Check `initialize()` is called on app mount in App.tsx

### Issue: React Query not caching
**Solution**: Check QueryClient staleTime configuration in main.tsx

### Issue: Form validation not working
**Solution**: Verify zodResolver is imported and used in useForm config

### Issue: Charts still overflowing
**Solution**: Ensure parent container has defined width (not `width: auto`)

### Issue: Leaderboard dropdown not switching
**Solution**: Verify `handleTabChange` updates `selectedGameId` state

---

## Summary

**Total Estimated Time**: 10-15 hours

**Priority Order**:
1. Foundation (30 min)
2. P1 Fixes (2-3 hours)
3. P2 Fixes (3-4 hours)
4. P3 Fixes (1-2 hours)
5. React Query Migration (2-3 hours)
6. React Hook Form Migration (1-2 hours)
7. Final Testing (1-2 hours)

**Dependencies Installed**:
- `zustand`: State management
- `react-hook-form`, `@hookform/resolvers`, `zod`: Form validation
- `@tanstack/react-query`, `@tanstack/react-query-devtools`: Data fetching

**New Files Created**:
- `src/stores/authStore.ts`, `src/stores/gameStore.ts`, `src/stores/index.ts`
- `src/schemas/authSchema.ts`, `src/schemas/profileSchema.ts`, `src/schemas/index.ts`
- `src/hooks/queries/useGames.ts`, `useLeaderboard.ts`, `useProfile.ts`, `index.ts`
- `src/components/game/VocabQuizGame.tsx`

**Files Modified**:
- `src/main.tsx`: Add QueryClientProvider
- `src/App.tsx`: Initialize auth store, update routing
- `src/components/layout/Header.tsx`: Fix mobile layout
- `src/components/leaderboard/LeaderboardPage.tsx`: Responsive tabs
- `src/components/game/MultipleChoice.tsx`: Fix text wrapping
- `src/components/game/Game.tsx`: Extract to VocabQuizGame
- `src/lib/utils.ts`: Add formatDuration function
- Multiple pages: Add px-4 padding
- Multiple components: Update labels, time format, remove blur

For detailed task breakdown, run `/speckit.tasks` command.

