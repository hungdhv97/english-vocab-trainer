# Implementation Plan: Frontend UI/UX Fixes

**Branch**: `011-fix-frontend-issues` | **Date**: 2025-11-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-fix-frontend-issues/spec.md`

## Summary

This feature addresses 9 frontend UI/UX issues related to responsive design, content spacing, text display, chart sizing, label updates, time formatting, routing, and visual effects. The fixes target mobile/tablet responsiveness (particularly header and leaderboard tabs), ensure consistent padding across pages, fix text overflow in quiz answers, make charts responsive, change "Total Score" labels to "Total Questions", display time in seconds format, ensure correct game-specific component routing, and remove blur effects after answer selection.

**Technical Approach**: This is a frontend-only refactoring that improves existing components without backend changes. We will leverage Zustand for state management consolidation, React Hook Form for form validation standardization, and React Query for server data fetching optimization. Components will be analyzed and split into smaller, reusable units where appropriate. All fixes use existing Tailwind CSS utilities, shadcn/ui components, and Recharts configuration.

## Technical Context

**Language/Version**: TypeScript 5.8, React 19.1  
**Primary Dependencies**: 
- **State Management**: Zustand (to be added)
- **Form Validation**: React Hook Form (to be added)
- **Server Fetching**: React Query / TanStack Query (to be added)
- **UI Components**: shadcn/ui (existing, Radix UI primitives)
- **Styling**: Tailwind CSS 4.1
- **Charts**: Recharts 2.15
- **Routing**: React Router DOM 7.8

**Storage**: N/A (frontend-only, uses localStorage for auth tokens)  
**Testing**: Manual verification only (per constitution)  
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge) on mobile (320px+), tablet (768px+), desktop (1024px+)  
**Project Type**: Web application (frontend component of full-stack app)  
**Performance Goals**: <100ms interaction response time for all UI changes  
**Constraints**: 
- Minimum viewport width: 320px (iPhone SE)
- All fixes must work in both light and dark themes
- No breaking changes to existing functionality
- Maintain accessibility (WCAG 2.1 AA)

**Scale/Scope**: 
- 14 components affected (Header, LeaderboardPage, Game, Login, Register, multiple pages)
- ~30 functional requirements across 9 user stories
- No new API endpoints (frontend-only fixes)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Clean Code**: Yes - Refactoring will improve code quality by splitting large components into smaller, focused units with clear single responsibility. State management consolidation with Zustand reduces duplication. React Hook Form standardizes validation logic.

- [x] **Simple and Responsive UX**: Yes - This feature's primary goal is to improve responsive design (<100ms interaction, mobile-first responsive breakpoints, consistent visual hierarchy). All fixes target performance and accessibility improvements.

- [x] **Latest shadcn UI Components**: Yes - All UI components continue using shadcn/ui. New dropdown selectors (if implemented for leaderboard) will use shadcn Select component. No custom components built where shadcn equivalents exist.

- [x] **Minimal Dependencies**: Partial - Adding 3 new dependencies (Zustand, React Hook Form, React Query). Justification:
  - **Zustand**: Eliminates prop drilling, consolidates scattered useState calls across 10+ components, reduces re-renders with selective subscriptions. Value > maintenance cost.
  - **React Hook Form**: Standardizes form validation across 4 form components (Login, Register, Profile, potentially others), reduces boilerplate, improves performance with uncontrolled inputs. Value > maintenance cost.
  - **React Query**: Centralizes API call logic, provides caching/refetching/loading states out-of-box, eliminates manual useEffect/useState patterns for data fetching in 6+ components. Value > maintenance cost.
  - All three are industry-standard, actively maintained libraries with large communities.

- [x] **Clear Architecture Boundaries**: Yes - Maintains existing structure: Components → Services (lib/api.ts) → API. New Zustand stores will live in `src/stores/`, React Hook Form schemas in `src/schemas/`, React Query hooks in `src/hooks/queries/`. No layer skipping.

- [x] **No Testing Required**: Confirmed - No automated tests will be created. All fixes verified manually across mobile/tablet/desktop viewports.

- [x] **Technology Stack Compliance**: Yes - All technologies are approved (React, TypeScript, Tailwind, shadcn/ui, Vite). New dependencies (Zustand, React Hook Form, React Query) are standard React ecosystem libraries that align with approved patterns.

- [x] **Architecture Structure**: Yes - Follows prescribed frontend structure (`src/components/`, `src/lib/`, `src/hooks/`, `src/types/`). New directories: `src/stores/` (Zustand), `src/schemas/` (validation), `src/hooks/queries/` (React Query).

## Project Structure

### Documentation (this feature)

```text
specs/011-fix-frontend-issues/
├── plan.md              # This file
├── research.md          # Phase 0: Technology decisions and best practices
├── data-model.md        # Phase 1: State management, component structure
├── quickstart.md        # Phase 1: Implementation guide
├── contracts/           # Phase 1: N/A (no API changes)
│   └── README.md        # Explains no API changes needed
└── tasks.md             # Phase 2: NOT created by /speckit.plan
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/      # React components (existing)
│   │   ├── layout/
│   │   │   ├── Header.tsx           # Fix: Mobile menu button, button layout
│   │   │   └── Layout.tsx           # Refactor: Extract padding to wrapper
│   │   ├── leaderboard/
│   │   │   └── LeaderboardPage.tsx  # Fix: Responsive tabs (dropdown/wrapped)
│   │   ├── game/
│   │   │   ├── Game.tsx             # Refactor: Split into smaller components
│   │   │   ├── VocabQuizGame.tsx    # NEW: Extracted game logic
│   │   │   ├── MultipleChoice.tsx   # Fix: Answer text wrapping
│   │   │   └── StatisticsView.tsx   # Fix: Total Questions label, time format
│   │   ├── auth/
│   │   │   ├── Login.tsx            # Refactor: Use React Hook Form
│   │   │   └── Register.tsx         # Refactor: Use React Hook Form
│   │   ├── statistics/
│   │   │   ├── StatisticsOverview.tsx  # Fix: Charts responsive, labels
│   │   │   └── SessionStatisticsPage.tsx  # Fix: Padding, charts
│   │   ├── word/
│   │   │   └── WordDetailPage.tsx   # Fix: Padding, charts
│   │   └── ui/                      # shadcn/ui components (existing)
│   ├── stores/          # NEW: Zustand state management
│   │   ├── authStore.ts             # Global auth state
│   │   ├── gameStore.ts             # Quiz game state
│   │   └── index.ts                 # Export all stores
│   ├── schemas/         # NEW: React Hook Form validation schemas
│   │   ├── authSchema.ts            # Login/Register validation
│   │   ├── profileSchema.ts         # Profile form validation
│   │   └── index.ts                 # Export all schemas
│   ├── hooks/           # Custom React hooks (existing + new)
│   │   ├── queries/                 # NEW: React Query hooks
│   │   │   ├── useGames.ts          # Fetch games
│   │   │   ├── useLeaderboard.ts    # Fetch leaderboards
│   │   │   ├── useProfile.ts        # Fetch/update profile
│   │   │   └── index.ts             # Export all query hooks
│   │   └── use-mobile.ts            # Existing mobile detection hook
│   ├── lib/             # Utility functions (existing)
│   │   ├── api.ts       # API client (refactor to remove state management)
│   │   └── utils.ts     # Utility helpers
│   ├── types/           # TypeScript type definitions (existing)
│   │   └── index.ts     # All type definitions
│   └── main.tsx         # Application entry point (add QueryClientProvider)
└── package.json         # Update: Add zustand, react-hook-form, @tanstack/react-query
```

**Structure Decision**: Maintaining existing frontend structure with three new directories:
1. `src/stores/` for Zustand global state (auth, game state)
2. `src/schemas/` for React Hook Form validation schemas
3. `src/hooks/queries/` for React Query data fetching hooks

This follows the web application pattern with clear separation of concerns: Components use stores for state, schemas for validation, and query hooks for data fetching.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Minimal Dependencies (adding 3 libraries) | **Zustand**: Current state management uses scattered useState hooks across 10+ components with complex prop drilling. Game.tsx alone has 20+ useState calls. **React Hook Form**: 4 form components use manual validation with duplicate logic. **React Query**: 6+ components have duplicate useEffect/useState patterns for API calls with manual loading/error states. | **Zustand alternative rejected**: Using React Context would require multiple context providers, more boilerplate, and worse performance (all consumers re-render on any state change). Continuing with useState requires passing 10+ props through 3-4 component layers. **React Hook Form alternative rejected**: Manual validation requires duplicate error state management and validation logic across forms. Browser validation is insufficient for complex rules. **React Query alternative rejected**: Manual useEffect/useState for each API call results in 50+ lines of boilerplate per component, inconsistent error handling, and no caching/refetching strategies. |

## Phase 0: Research & Technology Decisions

See [research.md](./research.md) for detailed technology decisions, best practices, and alternatives considered.

**Key Decisions**:
1. **Responsive Strategy**: Mobile-first with Tailwind breakpoints (sm: 640px, md: 768px, lg: 1024px)
2. **Leaderboard Tabs**: Use shadcn Select (dropdown) on mobile (<768px), shadcn Tabs (wrapped) on tablet/desktop
3. **Component Splitting**: Extract Game.tsx (500+ lines) into VocabQuizGame, LevelSelector, DirectionSelector, QuizPlay components
4. **State Management**: Consolidate auth state (Header, Layout, multiple pages) into authStore; quiz state (Game component) into gameStore
5. **Form Validation**: Standardize with React Hook Form + Zod schemas for Login, Register, Profile forms
6. **Data Fetching**: Migrate fetchGames, fetchLeaderboard, fetchProfile to React Query hooks with caching
7. **Chart Responsiveness**: Use Recharts ResponsiveContainer with width="100%" and aspect ratio constraints

## Phase 1: Design & Contracts

### Data Model

See [data-model.md](./data-model.md) for complete state structure, component hierarchy, and data flow.

**Key Entities**:
- **AuthStore** (Zustand): Global auth state (user, isAuthenticated, login, logout methods)
- **GameStore** (Zustand): Quiz game state (questions, currentIndex, score, session, actions)
- **UI State** (Local): Component-specific UI state (modals, dropdowns, loading overlays)

### API Contracts

See [contracts/README.md](./contracts/README.md) - No new API endpoints required (frontend-only fixes).

### Quick Start

See [quickstart.md](./quickstart.md) for step-by-step implementation guide.

## Phase 2: Task Breakdown

**NOTE**: Tasks will be generated by `/speckit.tasks` command (not part of this plan).

The task breakdown will follow this priority order:
1. **Foundation** (P1): Install dependencies, setup Zustand stores, setup React Query provider
2. **Mobile Header Fix** (P1): Fix menu button visibility, button layout responsiveness
3. **Leaderboard Tabs Fix** (P1): Implement responsive tab/dropdown pattern
4. **Answer Text Fix** (P1): Fix text wrapping in MultipleChoice buttons
5. **Content Padding** (P2): Add consistent px-4 padding to all pages
6. **Chart Responsive** (P2): Configure ResponsiveContainer for all charts
7. **Game Routing** (P2): Extract VocabQuizGame component, update routing
8. **Label Updates** (P3): Change "Total Score" to "Total Questions" across components
9. **Time Format** (P3): Update time display to seconds format (Xs, Xm Ys)
10. **Remove Blur** (P3): Remove blur effects from answer feedback

## Implementation Notes

### Risk Mitigation

1. **Breaking Changes**: Each fix is isolated to specific components. Test thoroughly before moving to next fix.
2. **State Migration**: Zustand migration must preserve existing localStorage auth logic. Implement incrementally (start with auth store, then game store).
3. **Form Migration**: Migrate forms one at a time (Login → Register → Profile) to isolate issues.
4. **React Query Migration**: Start with read-only queries (fetchGames, fetchLeaderboard), then mutations (login, register).
5. **Responsive Testing**: Test each fix at 320px, 375px, 768px, 1024px, 1920px widths minimum.

### Performance Considerations

- **Zustand**: Selective subscriptions prevent unnecessary re-renders (use `useAuthStore(state => state.user)` not `useAuthStore()`)
- **React Query**: Default 5-minute cache reduces API calls; staleTime configured per query type
- **Charts**: ResponsiveContainer only re-renders on actual size changes, not parent re-renders
- **Component Splitting**: Smaller components = better memoization opportunities

### Accessibility Considerations

- **Mobile Menu**: Ensure menu button has proper ARIA labels (`aria-label="Open menu"`)
- **Leaderboard Dropdown**: Use shadcn Select (built on Radix) for keyboard navigation support
- **Answer Buttons**: Maintain full button area clickability even with wrapped text
- **Time Display**: Ensure screen readers announce time correctly ("45 seconds" not "45s")
- **Charts**: Maintain Recharts default accessibility (SVG with proper titles/descriptions)

### Browser Compatibility

- **Target Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Zustand**: Works in all modern browsers (uses ES6 Proxy, supported since 2016)
- **React Query**: No special considerations (uses standard React hooks)
- **Tailwind Breakpoints**: Standard CSS media queries (universal support)
- **Recharts ResponsiveContainer**: Uses ResizeObserver (polyfill not needed for target browsers)

## Success Validation

After implementation, manually verify:

1. **Mobile Header** (320px-767px): Menu button visible, all buttons in single row without wrapping
2. **Leaderboard Tabs** (320px-1024px): All game tabs accessible without horizontal scroll (dropdown on mobile, wrapped tabs on tablet+)
3. **Content Padding**: All 7 page types (login, signup, level selection, direction selection, results, statistics, word detail) have 1rem horizontal padding
4. **Answer Text**: Quiz questions with 50+ character answers display fully without truncation (test at 320px, 768px, 1024px)
5. **Charts**: All charts (session stats, progress, word detail) fit within viewport at 320px, 768px, 1024px widths
6. **Total Questions**: Label reads "Total Questions" (not "Total Score") on completion screen and statistics pages
7. **Time Format**: Time displays as "45s" or "1m 30s" (not "1.5 minutes") for sessions under 3 minutes
8. **Game Routing**: Completing vocab-quiz and clicking "Play Again" routes to VocabQuizGame component (verify in React DevTools)
9. **No Blur**: No blur effect visible during answer feedback period (visual inspection)
10. **Performance**: All UI interactions respond in <100ms (use Chrome DevTools Performance tab)

## Known Issues & Follow-ups

1. **Manual Verification Outstanding**: Phase 15 tasks (T092–T095) still require hands-on responsive/light+dark/performance/accessibility sweeps. Follow the updated checklist in `quickstart.md` once physical devices or BrowserStack are available.
2. **Avatar URL Normalization**: Header still normalizes relative avatar paths inline. Consider extracting this logic into a shared helper (`formatAvatarUrl`) so other components can reuse it and unit tests can cover the behavior.
3. **React Query DevTools**: Keep DevTools enabled only for development—verify profile caching between Header and ProfilePage there, and remember to disable it for production bundles to avoid leaking internals.

## Next Steps

1. Run `/speckit.tasks` to generate detailed task breakdown with checkpoints
2. Create feature branch from `011-fix-frontend-issues`
3. Install dependencies: `npm install zustand react-hook-form @tanstack/react-query zod`
4. Follow implementation order in [quickstart.md](./quickstart.md)
5. Test each fix at mobile/tablet/desktop breakpoints before proceeding
6. Manual verification checklist before merging (see Success Validation above)
