# API Contracts: Frontend UI/UX Fixes

**Feature**: Frontend UI/UX Fixes  
**Date**: 2025-11-14

## Overview

This feature **does not require any new API endpoints or modifications to existing endpoints**. All fixes are frontend-only and leverage existing backend APIs without changes.

## Existing API Endpoints Used

### Authentication APIs

**POST /api/v1/auth/register**
- Used by: Register component (with React Hook Form + React Query)
- No changes required
- Current response format is sufficient

**POST /api/v1/auth/login**
- Used by: Login component (with React Hook Form + React Query)
- No changes required
- Current response format is sufficient

### Game APIs

**GET /api/v1/games**
- Used by: HomePage, LeaderboardPage (with React Query useGames hook)
- No changes required
- Current response format is sufficient

**GET /api/v1/games/code/:code**
- Used by: ComingSoon component (for unimplemented games)
- No changes required
- Used for game routing validation

### Leaderboard APIs

**GET /api/v1/leaderboard/game/:game_id**
- Used by: LeaderboardPage (with React Query useLeaderboard hook)
- No changes required
- Current response format is sufficient

**GET /api/v1/vocab-quiz/leaderboard**
- Used by: VocabQuizLeaderboard component
- Query params: `cefr_level_id`, `translation_direction`
- No changes required

### Vocabulary Quiz APIs

**GET /api/v1/cefr-levels**
- Used by: LevelSelector component
- No changes required

**POST /api/v1/vocab-quiz/session/start**
- Used by: VocabQuizGame component (when starting new quiz)
- Request: `{ cefr_level_id, translation_direction, question_count }`
- Response: `{ session_id, questions[] }`
- No changes required

**POST /api/v1/vocab-quiz/answer**
- Used by: QuizPlay component (when submitting answers)
- Request: `{ session_question_id, chosen_option, time_spent_ms }`
- Response: `{ is_correct }`
- No changes required

**POST /api/v1/vocab-quiz/session/:id/finish**
- Used by: VocabQuizGame component (when completing quiz)
- Response: `{ session_statistics: { correct_count, incorrect_count, accuracy_percentage, total_score, time_elapsed } }`
- No changes required

**GET /api/v1/vocab-quiz/session/:id/statistics**
- Used by: SessionStatisticsPage component
- No changes required

### Profile APIs

**GET /api/v1/profile**
- Used by: ProfilePage, Header (with React Query useProfile hook)
- No changes required

**PATCH /api/v1/profile**
- Used by: ProfileForm (with React Query mutation)
- Request: FormData with `display_name`, `bio`, `avatar` file
- No changes required

## Why No API Changes?

This feature focuses on frontend UI/UX improvements:

1. **Responsive Design Fixes**: CSS/Tailwind changes only
2. **State Management Refactoring**: Client-side Zustand stores
3. **Form Validation**: Client-side React Hook Form + Zod
4. **Data Fetching Optimization**: React Query wraps existing API calls
5. **Component Splitting**: Frontend component refactoring
6. **Label Changes**: Frontend display only ("Total Score" → "Total Questions")
7. **Time Format**: Frontend formatting utility (seconds display)
8. **Routing**: Frontend route configuration
9. **Visual Effects**: CSS class changes (remove blur)

All required data is already provided by existing endpoints. The fixes improve how data is displayed, managed, and interacted with on the client side.

## Frontend State Changes

While no API contracts change, the frontend state management structure changes significantly:

### Before (Scattered State)
- Auth state: localStorage checks in multiple components
- Game state: 20+ useState hooks in Game.tsx
- Data fetching: useEffect + useState in 6+ components

### After (Consolidated State)
- **Zustand Stores**: authStore, gameStore (global state)
- **React Query**: useGames, useLeaderboard, useProfile (server state)
- **React Hook Form**: Login, Register, Profile forms (form state)

See [data-model.md](../data-model.md) for complete state structure.

## API Client Refactoring

The `src/lib/api.ts` file will be refactored to remove state management concerns:

### Before
```typescript
// api.ts handles both API calls AND state management
export async function fetchGames(): Promise<Game[]> {
  const response = await fetch('/api/v1/games');
  // ... error handling, parsing
  return data;
}

// Component uses manual useEffect + useState
function HomePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchGames()
      .then(setGames)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);
}
```

### After
```typescript
// api.ts only handles API calls (pure functions)
export async function fetchGames(): Promise<Game[]> {
  const response = await fetch('/api/v1/games');
  // ... error handling, parsing
  return data;
}

// React Query hook wraps API call
export function useGames() {
  return useQuery({
    queryKey: ['games'],
    queryFn: fetchGames
  });
}

// Component uses React Query (state management built-in)
function HomePage() {
  const { data: games, isLoading, error } = useGames();
  // ... render
}
```

**Key Change**: Separation of concerns
- `api.ts`: Pure API call functions (no state)
- `src/hooks/queries/*.ts`: React Query hooks (server state management)
- `src/stores/*.ts`: Zustand stores (global client state)

## Testing Strategy

Since no API changes are made, **no backend testing is required**. All testing is frontend manual verification:

1. **Responsive Design**: Test at 320px, 768px, 1024px viewports
2. **State Management**: Verify Zustand stores update correctly in React DevTools
3. **Form Validation**: Test Zod schemas with valid/invalid inputs
4. **Data Fetching**: Verify React Query caching in React Query DevTools
5. **Component Rendering**: Verify split components render correctly

See [plan.md](../plan.md) "Success Validation" section for complete manual test checklist.

## Migration Notes

### No Breaking Changes

All API responses remain the same format, so migration is **backward compatible**:

- Existing components continue working during migration
- Can migrate incrementally (HomePage → LeaderboardPage → Game → etc.)
- No coordinated backend/frontend deployment needed

### Rollback Strategy

If issues arise, rollback is straightforward:

1. **Zustand Migration**: Keep old useState code commented out during migration, restore if needed
2. **React Query Migration**: Keep old useEffect + useState patterns until React Query is verified
3. **Component Splitting**: Keep old Game.tsx in `Game.backup.tsx` until VocabQuizGame is stable

## Summary

**API Changes**: None  
**Frontend Changes**: Extensive (state management, component structure, styling)  
**Backend Impact**: Zero  
**Deployment**: Frontend-only deployment sufficient  
**Testing**: Manual frontend testing only (per constitution - no automated tests)

For detailed implementation guide, see [quickstart.md](../quickstart.md).

