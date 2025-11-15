# Research: Frontend UI/UX Fixes

**Feature**: Frontend UI/UX Fixes  
**Date**: 2025-11-14  
**Phase**: 0 - Research

## Overview

This research document consolidates findings for implementing 9 frontend UI/UX fixes focused on responsive design, state management consolidation, form validation standardization, and data fetching optimization. All fixes are frontend-only with no backend changes required.

## Research Tasks

### 1. State Management: Zustand vs React Context vs useState

**Task**: Evaluate state management solutions for consolidating scattered state across components

**Findings**:
- **Current State**: Application uses React useState extensively with prop drilling through 3-4 levels
  - `Game.tsx`: 20+ useState hooks for quiz state (questions, answers, timer, session, etc.)
  - `Header.tsx`: Auth state polling with 300ms intervals and multiple event listeners
  - `HomePage.tsx`, `LeaderboardPage.tsx`: Duplicate data fetching patterns with useState + useEffect
  - Auth state managed independently in multiple components (Header, Layout, App routes)

**const create = <state>(initializer) => {
  if (!store) {
    store = { state: initializer(), listeners: new Set() }
  }
  return [
    (selector) => selector(store.state), // useStore hook
    (updater) => { store.state = updater(store.state); store.listeners.forEach(l => l()) } // setState
  ]
}
```

- **React Context**: Requires Provider wrapper, all consumers re-render on any context value change, more boilerplate
- **Zustand**: Minimal boilerplate, selective subscriptions (only re-render on accessed state changes), devtools support, ~1KB size

**Performance Comparison**:
```typescript
// React Context - ALL consumers re-render when any part of state changes
const AuthContext = React.createContext();
function Header() {
  const { user, isAuthenticated, login } = useContext(AuthContext); // Re-renders on any auth state change
}

// Zustand - Only re-renders when SELECTED state changes
const useAuthStore = create((set) => ({ user: null, isAuthenticated: false, login: () => {} }));
function Header() {
  const user = useAuthStore(state => state.user); // Only re-renders when user changes
}
```

**Decision**: Use Zustand for global state management

**Rationale**:
- **Bundle Size**: Zustand is ~1KB (gzipped) vs Context is built-in but requires more code
- **Performance**: Selective subscriptions prevent unnecessary re-renders (critical for Header component rendered on every page)
- **Developer Experience**: Less boilerplate than Context (no Provider wrappers, direct store access)
- **Devtools**: Redux DevTools support for debugging state changes
- **Testing**: Easier to test (stores are plain objects, no Provider mocking needed)
- **Migration Path**: Can migrate incrementally (start with auth, then game state) without breaking existing code
- **Ecosystem**: Well-established (7M+ weekly downloads), actively maintained, used by Vercel, Poimandres

**Alternatives Considered**:
- **React Context**: Rejected - requires multiple Providers for different state domains (auth, game, etc.), all consumers re-render on context changes, more boilerplate
- **Redux Toolkit**: Rejected - heavier (13KB gzipped), more boilerplate (actions, reducers, slices), overkill for this application's state complexity
- **Jotai/Recoil**: Rejected - atom-based approach requires defining atoms for each state piece, less intuitive API than Zustand's store pattern
- **Continuing with useState**: Rejected - prop drilling becomes unmaintainable (Game.tsx already passes 10+ props to child components), duplicated state logic across components

**Implementation Approach**:
1. Create `src/stores/authStore.ts` for global auth state (user, isAuthenticated, login, logout)
2. Create `src/stores/gameStore.ts` for quiz game state (questions, currentIndex, score, session, timer)
3. Migrate Header component first (replace useState + polling with authStore subscription)
4. Migrate Game component (extract 20+ useState calls into gameStore)
5. Update App routing to use authStore instead of localStorage checks

---

### 2. Form Validation: React Hook Form vs Formik vs Manual

**Task**: Evaluate form validation solutions for standardizing validation across auth and profile forms

**Findings**:
- **Current State**: 4 forms use manual validation with useState for errors
  - `Login.tsx`: Manual username/password validation with setError state
  - `Register.tsx`: Manual username/password validation (duplicate logic from Login)
  - `ProfileForm.tsx`: Manual validation for displayName (50 char), bio (500 char)
  - No consistent validation schema across forms

**Form Validation Approaches**:

1. **React Hook Form**:
   - Uncontrolled inputs (better performance, fewer re-renders)
   - Built-in validation with Zod/Yup schema integration
   - 9KB gzipped, 40M+ weekly downloads
   - Minimal re-renders (only validates on blur/submit, not on every keystroke)

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(8)
});

function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });
  return <input {...register('username')} />; // No onChange, fewer re-renders
}
```

2. **Formik**:
   - Controlled inputs (more re-renders)
   - 13KB gzipped, 2.7M+ weekly downloads
   - More boilerplate (Field, Form, ErrorMessage components)

3. **Manual Validation**:
   - Current approach with useState
   - Full control but duplicated logic across forms
   - More code to maintain

**Performance Comparison**:
- React Hook Form: ~3 re-renders per form submission (mount, blur, submit)
- Formik: ~10-15 re-renders per form submission (controlled inputs re-render on every keystroke)
- Manual: Similar to Formik if using controlled inputs

**Decision**: Use React Hook Form with Zod schemas

**Rationale**:
- **Performance**: Uncontrolled inputs reduce re-renders (critical for responsive feel, <100ms interactions per success criteria)
- **Bundle Size**: Smaller than Formik (9KB vs 13KB)
- **Developer Experience**: Less boilerplate than Formik, cleaner API than manual validation
- **Schema Reusability**: Zod schemas can be shared between frontend and backend validation (future-proof)
- **Type Safety**: Full TypeScript support with inferred types from Zod schemas
- **Ecosystem**: Industry standard (40M+ weekly downloads), actively maintained, used by shadcn/ui examples
- **Validation Modes**: Flexible validation (onSubmit, onBlur, onChange) - we'll use onBlur for better UX

**Alternatives Considered**:
- **Formik**: Rejected - larger bundle size, more boilerplate, controlled inputs cause more re-renders
- **Manual Validation**: Rejected - duplicated logic across 4 forms, no schema reusability, prone to inconsistent validation rules
- **Browser Validation (HTML5)**: Rejected - insufficient for complex rules (username uniqueness, password strength), poor UX customization

**Implementation Approach**:
1. Install: `npm install react-hook-form @hookform/resolvers zod`
2. Create `src/schemas/authSchema.ts` with Zod schemas for login/register
3. Create `src/schemas/profileSchema.ts` with Zod schema for profile form
4. Migrate Login component first (replace manual validation with useForm + zodResolver)
5. Migrate Register component (reuse loginSchema)
6. Migrate ProfileForm component (add profileSchema)

---

### 3. Data Fetching: React Query vs SWR vs Manual useEffect

**Task**: Evaluate data fetching solutions for consolidating API calls and caching

**Findings**:
- **Current State**: Manual useEffect + useState patterns in 6+ components
  - `HomePage.tsx`: useEffect + useState for fetchGames (loading, error, data)
  - `LeaderboardPage.tsx`: useEffect + useState for fetchLeaderboard with AbortController
  - `ProfilePage.tsx`: useEffect + useState for fetchProfile
  - Duplicate loading/error state management (50+ lines of boilerplate per component)
  - No caching (every component mount triggers new API call)
  - No refetching strategy (stale data remains until manual refresh)

**Data Fetching Approaches**:

1. **React Query (TanStack Query)**:
   - Built-in caching, refetching, loading/error states
   - 14KB gzipped, 12M+ weekly downloads
   - Devtools for debugging queries
   - Optimistic updates, mutations with automatic refetching

```typescript
import { useQuery } from '@tanstack/react-query';

function HomePage() {
  const { data: games, isLoading, error } = useQuery({
    queryKey: ['games'],
    queryFn: fetchGames,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
  // No useEffect, no useState for loading/error - handled by useQuery
}
```

2. **SWR (Vercel)**:
   - Similar features to React Query
   - 5KB gzipped, 3M+ weekly downloads
   - Slightly smaller but less feature-rich

3. **Manual useEffect + useState**:
   - Current approach
   - Full control but duplicated logic
   - 50+ lines per component for loading/error/data state

**Feature Comparison**:

| Feature | React Query | SWR | Manual |
|---------|-------------|-----|--------|
| Caching | ✅ Built-in | ✅ Built-in | ❌ Manual |
| Refetching | ✅ Auto (focus, interval) | ✅ Auto (focus, interval) | ❌ Manual |
| Loading States | ✅ Built-in | ✅ Built-in | ⚠️ Manual useState |
| Error Handling | ✅ Built-in | ✅ Built-in | ⚠️ Manual useState |
| Optimistic Updates | ✅ Built-in | ⚠️ Limited | ❌ Manual |
| Devtools | ✅ Dedicated | ❌ None | ❌ None |
| Bundle Size | 14KB | 5KB | 0KB (but more code) |

**Decision**: Use React Query (TanStack Query)

**Rationale**:
- **Code Reduction**: Eliminates 50+ lines of useEffect + useState boilerplate per component (6 components = 300+ lines saved)
- **Caching**: Automatic caching reduces API calls (HomePage and LeaderboardPage both fetch games - only 1 API call needed)
- **Developer Experience**: useQuery hook is more intuitive than SWR's useSWR (queryKey + queryFn pattern is clearer)
- **Features**: More feature-rich than SWR (optimistic updates, query invalidation, parallel queries)
- **Devtools**: Built-in devtools for debugging queries (critical for diagnosing caching issues)
- **Ecosystem**: Industry standard (12M+ weekly downloads), actively maintained by TanStack (same team as React Router)
- **Performance**: Automatic refetching on window focus ensures data freshness without manual polling

**Alternatives Considered**:
- **SWR**: Rejected - smaller bundle (5KB vs 14KB) but less feature-rich, weaker devtools, less intuitive API
- **Manual useEffect + useState**: Rejected - duplicated code, no caching, no refetching strategy, manual AbortController management
- **Axios + custom hooks**: Rejected - still requires manual cache management, no built-in refetching, reinventing the wheel

**Implementation Approach**:
1. Install: `npm install @tanstack/react-query`
2. Add QueryClientProvider to `src/main.tsx` with default config (5-minute staleTime)
3. Create `src/hooks/queries/useGames.ts` wrapping fetchGames
4. Create `src/hooks/queries/useLeaderboard.ts` wrapping fetchLeaderboard
5. Create `src/hooks/queries/useProfile.ts` wrapping getProfile/updateProfile
6. Migrate HomePage first (replace useEffect + useState with useQuery)
7. Migrate LeaderboardPage (replace AbortController pattern with useQuery)
8. Migrate ProfilePage (use useMutation for updateProfile)

---

### 4. Responsive Strategy: Mobile-First vs Desktop-First

**Task**: Determine responsive design approach for fixing mobile header and leaderboard tabs

**Findings**:
- **Current Approach**: Application uses Tailwind CSS with mobile-first breakpoints
  - Breakpoints: `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`
  - Header uses `flex-col sm:flex-row` pattern (mobile-first)
  - GameGrid uses `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (mobile-first)

**Responsive Approaches**:

1. **Mobile-First**: Base styles for mobile, add complexity with min-width media queries
```css
/* Base (mobile) */
.header { flex-direction: column; }
/* Tablet+ */
@media (min-width: 768px) { .header { flex-direction: row; } }
```

2. **Desktop-First**: Base styles for desktop, simplify with max-width media queries
```css
/* Base (desktop) */
.header { flex-direction: row; }
/* Mobile */
@media (max-width: 767px) { .header { flex-direction: column; } }
```

**Decision**: Continue with Mobile-First approach

**Rationale**:
- **Consistency**: Application already uses mobile-first (changing would require refactoring all existing responsive styles)
- **Tailwind Default**: Tailwind CSS uses mobile-first breakpoints (`sm:`, `md:`, `lg:`)
- **Progressive Enhancement**: Start with minimal mobile layout, add features for larger screens (aligns with constitution principle)
- **Mobile-First Stats**: 60%+ of web traffic is mobile (per constitution, mobile responsive is NON-NEGOTIABLE)
- **Maintainability**: Easier to add features for larger screens than remove them for smaller screens

**Alternatives Considered**:
- **Desktop-First**: Rejected - would require refactoring all existing responsive utilities, inconsistent with Tailwind defaults
- **Adaptive (separate layouts)**: Rejected - increases complexity, harder to maintain, not needed for this application

**Implementation Approach**:
- Header: Add mobile menu button at base level, hide with `md:hidden` for tablet+
- Header buttons: Stack at base level (`flex-col`), row layout with `sm:flex-row`
- Leaderboard tabs: Use dropdown (shadcn Select) at base level, switch to tabs with `md:block` for tablet+

---

### 5. Leaderboard Tabs: Dropdown vs Wrapped Tabs vs Horizontal Scroll

**Task**: Determine best solution for responsive game tab navigation on mobile/tablet

**Findings**:
- **Current Implementation**: Tabs component from shadcn/ui (Radix UI TabsList)
  - 10 games = 10 tabs in horizontal row
  - Tabs overflow viewport on mobile (width < 768px), requiring horizontal scroll
  - No wrapping behavior (Radix UI TabsList uses `flex-nowrap` by default)

**Responsive Tab Patterns**:

1. **Dropdown Selection** (Select component):
   - shadcn Select component (Radix UI Select primitive)
   - Good for mobile (vertical list, native scrolling)
   - Poor for desktop (hidden options until opened)

2. **Wrapped Tabs** (Custom CSS):
   - Modify TabsList with `flex-wrap` CSS
   - Good for tablet/desktop (all tabs visible)
   - Can be cramped on mobile with many tabs

3. **Horizontal Scroll** (Current behavior):
   - Keep existing TabsList without changes
   - Poor UX (hidden tabs, non-obvious scrolling)

4. **Hybrid Approach** (Dropdown mobile, Tabs desktop):
   - Use Select component on mobile (<768px)
   - Use Tabs component on tablet+ (≥768px)
   - Best of both worlds

**Decision**: Use Hybrid Approach (Dropdown on mobile, Wrapped Tabs on tablet+)

**Rationale**:
- **Mobile UX**: Dropdown provides better experience on small screens (native scrolling, larger tap targets, no horizontal scrolling)
- **Desktop UX**: Wrapped tabs provide better experience on larger screens (all options visible, no extra click to open dropdown)
- **Accessibility**: Both shadcn Select and Tabs are built on Radix UI (keyboard navigation, ARIA labels)
- **Implementation**: Conditional rendering based on viewport width using `useIsMobile` hook (already exists in codebase)
- **Consistency**: shadcn Select matches application's design system (same library as other components)

**Alternatives Considered**:
- **Dropdown Only**: Rejected - poor desktop UX (unnecessary click to open dropdown when screen space is available)
- **Wrapped Tabs Only**: Rejected - tabs become cramped on mobile with 10+ games (small tap targets, hard to read)
- **Horizontal Scroll**: Rejected - poor UX (non-obvious scrolling, hidden tabs), violates success criteria (no horizontal scrolling)
- **Accordion**: Rejected - poor pattern for tab navigation (vertical space consumption, requires scrolling to see content)

**Implementation Approach**:
1. Import shadcn Select component: `npx shadcn@latest add select`
2. Use existing `useIsMobile` hook from `src/hooks/use-mobile.ts` (threshold: 768px)
3. Conditional rendering in LeaderboardPage:
   ```typescript
   const isMobile = useIsMobile();
   return isMobile
     ? <Select value={selectedGame} onValueChange={handleSelect}>{games.map(...)}</Select>
     : <Tabs value={selectedGame} onValueChange={handleSelect}><TabsList className="flex-wrap">{games.map(...)}</TabsList></Tabs>
   ```
4. Add `flex-wrap` CSS to TabsList for tablet+ (allows tabs to wrap to multiple rows if needed)

---

### 6. Component Splitting Strategy: Game.tsx Refactoring

**Task**: Determine strategy for splitting large Game.tsx component (500+ lines) into smaller components

**Findings**:
- **Current Game.tsx Structure**: Monolithic component with 500+ lines
  - 20+ useState hooks (gameState, selectedLevel, questions, currentQuestionIndex, score, timer, etc.)
  - 10+ functions (handleLevelSelect, handleDirectionSelect, handleAnswerSelect, handleFinishSession, etc.)
  - 4 rendering modes (level-selection, direction-selection, playing, completed)
  - Mixes concerns: game configuration, quiz gameplay, results display

**Component Splitting Approaches**:

1. **By Feature** (Game flow stages):
   - `LevelSelector.tsx` (existing, used in Game.tsx)
   - `DirectionSelector.tsx` (existing, used in Game.tsx)
   - `QuizPlay.tsx` (new, extract playing state)
   - `QuizResults.tsx` (new, extract completed state)

2. **By Responsibility** (SRP):
   - `VocabQuizGame.tsx` (game orchestration, state machine)
   - `QuizSession.tsx` (question display, answer handling)
   - `QuizTimer.tsx` (timer logic, display)
   - `QuizResults.tsx` (results display, statistics)

3. **Minimal Split** (Only extract heavy sections):
   - Keep Game.tsx as orchestrator
   - Extract only `playing` and `completed` render sections

**Decision**: Split by Feature (Game flow stages) + Create VocabQuizGame Wrapper

**Rationale**:
- **Single Responsibility**: Each component handles one stage of game flow (configuration, gameplay, results)
- **State Isolation**: Level/direction selection state lives in configuration components; quiz state lives in gameplay component
- **Reusability**: QuizPlay and QuizResults can be reused for other quiz game types (future-proof)
- **Testing**: Easier to test individual stages in isolation
- **Routing Fix**: Creating VocabQuizGame component directly addresses FR-025 (route to VocabQuizGame not generic Game)
- **Migration Path**: Can extract incrementally (start with VocabQuizGame wrapper, then split internal components)

**Component Structure**:
```
VocabQuizGame.tsx (new, replaces Game.tsx for vocab-quiz)
├── GameConfigFlow.tsx (new, orchestrates level + direction selection)
│   ├── LevelSelector.tsx (existing, move to game/)
│   └── DirectionSelector.tsx (existing, move to game/)
├── QuizPlay.tsx (new, extract playing state from Game.tsx)
│   ├── QuestionDisplay.tsx (existing)
│   └── MultipleChoice.tsx (existing)
└── QuizResults.tsx (new, extract completed state from Game.tsx)
    └── StatisticsView.tsx (existing)
```

**Alternatives Considered**:
- **By Responsibility (SRP)**: Rejected - creates too many small components (7+), harder to understand game flow, over-engineered for current needs
- **Minimal Split**: Rejected - Game.tsx remains 300+ lines, doesn't solve routing issue (still called "Game" not "VocabQuizGame")
- **No Split**: Rejected - 500+ lines violates clean code principle (readability), harder to test, harder to debug

**Implementation Approach**:
1. Create `VocabQuizGame.tsx` as new entry component (replaces Game.tsx in routing)
2. Move existing LevelSelector and DirectionSelector to `src/components/game/` (currently in root)
3. Extract `QuizPlay.tsx` from Game.tsx playing state (questions, answers, timer logic)
4. Extract `QuizResults.tsx` from Game.tsx completed state (statistics display, play again button)
5. Use Zustand gameStore for shared state between components (questions, score, session, timer)
6. Update App.tsx routing: `<Route path="/game/vocab-quiz" element={<VocabQuizGame />} />`

---

### 7. Chart Responsiveness: Recharts ResponsiveContainer Configuration

**Task**: Determine Recharts configuration for making charts fit viewport width on all screen sizes

**Findings**:
- **Current Implementation**: Charts in 3 components use Recharts
  - `StatisticsOverview.tsx`: Bar charts for performance metrics
  - `SessionStatisticsPage.tsx`: Line charts for question performance
  - `WordDetailPage.tsx`: Charts for word statistics (assumed based on spec)
  - Some charts overflow viewport on mobile (width < 768px)

**Recharts Responsive Patterns**:

1. **ResponsiveContainer with 100% width**:
```typescript
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data}>...</BarChart>
</ResponsiveContainer>
```
- Pros: Adapts to parent container width automatically
- Cons: Requires parent container to have defined width

2. **ResponsiveContainer with aspect ratio**:
```typescript
<ResponsiveContainer width="100%" aspect={2}>
  <BarChart data={data}>...</BarChart>
</ResponsiveContainer>
```
- Pros: Maintains aspect ratio (height = width / aspect)
- Cons: May be too tall or too short on some viewports

3. **Fixed width with max-width**:
```typescript
<ResponsiveContainer width={600} maxWidth="100%" height={300}>
  <BarChart data={data}>...</BarChart>
</ResponsiveContainer>
```
- Pros: Controlled size on desktop
- Cons: Not officially supported (maxWidth is not a ResponsiveContainer prop)

**Decision**: Use ResponsiveContainer with 100% width + Aspect Ratio

**Rationale**:
- **Responsive**: width="100%" ensures chart never exceeds viewport width (meets SC-005: charts fit viewport)
- **Aspect Ratio**: Maintains readable proportions across screen sizes (aspect={2} for landscape charts, aspect={1.5} for square charts)
- **Parent Container**: Charts are already inside Card components with proper width constraints (px-4 padding adds buffer)
- **Performance**: ResponsiveContainer only re-renders on actual size changes (uses ResizeObserver)
- **Recharts Recommendation**: Official Recharts docs recommend ResponsiveContainer for responsive charts

**Alternatives Considered**:
- **Fixed Width**: Rejected - overflows viewport on mobile, violates success criteria
- **CSS-only (width: 100% on SVG)**: Rejected - Recharts SVG dimensions are controlled by React props, CSS doesn't work
- **Media Queries with Different Charts**: Rejected - over-engineered, harder to maintain, same chart works across sizes with ResponsiveContainer

**Implementation Approach**:
1. Wrap all charts with ResponsiveContainer: `<ResponsiveContainer width="100%" aspect={2}>`
2. Adjust aspect ratios per chart type:
   - Bar charts (performance metrics): `aspect={2}` (landscape, easier to read labels)
   - Line charts (trends): `aspect={1.8}` (slightly more square, better for time series)
   - Pie charts (if any): `aspect={1}` (square)
3. Ensure parent containers have proper width (Card components already have `w-full` class)
4. Test at 320px, 768px, 1024px widths to verify readability

---

### 8. Time Display Format: Formatting Strategy

**Task**: Determine formatting strategy for displaying time in seconds vs minutes

**Findings**:
- **Current Implementation**: Time displayed as decimal minutes
  - `StatisticsView.tsx`: `(statistics.time_elapsed / 60).toFixed(1)` → "1.5 minutes"
  - `Game.tsx`: Same calculation in completion screen
- **Requirements**: Display time as "Xs" for <60s, "Xm Ys" for ≥60s

**Time Formatting Approaches**:

1. **Inline Formatting**:
```typescript
const formatTime = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};
```

2. **Utility Function** (in lib/utils.ts):
```typescript
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs}s`;
}
```

3. **Intl.DurationFormat** (ECMAScript Proposal, Stage 3):
```typescript
new Intl.DurationFormat('en', { style: 'narrow' }).format({ minutes: 1, seconds: 30 });
// → "1m 30s"
```
- Not yet supported in all browsers (Safari 16.4+, Chrome 99+, Firefox 120+)

**Decision**: Create Utility Function in lib/utils.ts

**Rationale**:
- **Reusability**: Function used in 3+ components (StatisticsView, Game, StatisticsOverview, SessionStatisticsPage)
- **Consistency**: Centralized formatting ensures consistent display across application
- **Type Safety**: TypeScript function signature documents input/output types
- **Testing**: Utility functions easier to test than inline code
- **Browser Support**: Intl.DurationFormat not widely supported yet (Safari 16.4 was released April 2023, too recent)

**Alternatives Considered**:
- **Inline Formatting**: Rejected - duplicated code across 3+ components, inconsistent formatting, harder to update
- **Intl.DurationFormat**: Rejected - insufficient browser support (fails in Safari <16.4, target is Safari 14+)
- **Library (date-fns, luxon)**: Rejected - adds dependency for simple function, violates minimal dependencies principle

**Implementation Approach**:
1. Add `formatDuration` function to `src/lib/utils.ts`:
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
2. Update StatisticsView.tsx: Replace `(statistics.time_elapsed / 60).toFixed(1) + ' minutes'` with `formatDuration(statistics.time_elapsed)`
3. Update Game.tsx completion screen: Same replacement
4. Update StatisticsOverview.tsx (if displaying time)

---

## Summary of Decisions

| Research Area | Decision | Key Rationale |
|---------------|----------|---------------|
| **State Management** | Zustand | Minimal boilerplate, selective subscriptions, 1KB size vs Context complexity |
| **Form Validation** | React Hook Form + Zod | Uncontrolled inputs (better performance), schema reusability, less boilerplate than Formik |
| **Data Fetching** | React Query (TanStack Query) | Built-in caching/refetching, eliminates 300+ lines of boilerplate, industry standard |
| **Responsive Strategy** | Mobile-First | Consistent with existing Tailwind usage, progressive enhancement, mobile traffic dominance |
| **Leaderboard Tabs** | Hybrid (Dropdown mobile, Wrapped Tabs tablet+) | Best UX for each viewport size, leverages shadcn components |
| **Component Splitting** | By Feature (Game flow stages) + VocabQuizGame | Single responsibility, state isolation, addresses routing requirement |
| **Chart Responsiveness** | ResponsiveContainer with 100% width + Aspect Ratio | Official Recharts recommendation, maintains readability, performant |
| **Time Formatting** | Utility function in lib/utils.ts | Reusable across 3+ components, centralized formatting, no dependencies |

## Dependencies to Install

```bash
npm install zustand react-hook-form @hookform/resolvers zod @tanstack/react-query
```

**Bundle Size Impact**:
- Zustand: ~1KB gzipped
- React Hook Form: ~9KB gzipped
- Zod: ~8KB gzipped
- React Query: ~14KB gzipped
- **Total**: ~32KB gzipped (~0.5% of typical React app bundle)

**Justification**: All four libraries eliminate more code than they add (estimated 500+ lines of boilerplate removed), improve performance (fewer re-renders, optimized data fetching), and align with industry best practices.

## Next Steps

1. Proceed to Phase 1: Generate data-model.md (state structure, component hierarchy)
2. Generate quickstart.md (step-by-step implementation guide)
3. Generate contracts/ (N/A for this feature - no API changes)
4. Update agent context with new dependencies

