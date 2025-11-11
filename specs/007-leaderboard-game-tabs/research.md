# Research: Leaderboard Page Redesign with Game Tabs

**Feature**: Leaderboard Page Redesign with Game Tabs  
**Date**: 2025-01-27  
**Phase**: 0 - Research

## Overview

This research document consolidates findings for implementing game tabs on the leaderboard page. The feature requires frontend-only changes using shadcn UI components and existing backend APIs.

## Research Tasks

### 1. Tab Component Selection

**Task**: Research tab component options for React/TypeScript frontend

**Findings**:
- shadcn UI provides a `tabs` component built on Radix UI primitives
- Component is accessible (WCAG 2.1 AA compliant), keyboard-navigable, and mobile-responsive
- Already part of the approved technology stack (shadcn UI)
- Installation: `npx shadcn@latest add tabs`
- Component structure: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`

**Decision**: Use shadcn UI Tabs component

**Rationale**: 
- Aligns with constitution requirement for latest shadcn UI components
- Provides accessibility out of the box
- Consistent with existing UI component library
- No additional dependencies beyond what's already approved

**Alternatives Considered**:
- Custom tab implementation: Rejected - violates shadcn UI principle, more maintenance
- Other UI libraries (Material-UI, Ant Design): Rejected - not in approved stack, adds unnecessary dependencies

### 2. State Management for Selected Game

**Task**: Determine how to manage selected game state in LeaderboardPage component

**Findings**:
- Current implementation uses `useState` for component state management
- React state is sufficient for this feature (no complex state sharing needed)
- Need to track: selected game ID/code, loading states per game, error states per game
- Default selection: First game by `display_order` (already sorted in existing code)

**Decision**: Use React `useState` hook for selected game state

**Rationale**:
- Simple, local component state is sufficient
- No need for global state management (Zustand/Context) for this feature
- Follows existing patterns in the codebase
- Minimal complexity

**Alternatives Considered**:
- Zustand store: Rejected - overkill for single-page component state
- React Context: Rejected - no need for state sharing across components
- URL query parameters: Rejected - adds complexity, not required by spec

### 3. Leaderboard Data Fetching Strategy

**Task**: Determine when and how to fetch leaderboard data for selected game

**Findings**:
- Current implementation fetches all game leaderboards on mount in parallel
- For tabs, we can optimize to fetch only the selected game's leaderboard
- Special case: vocab-quiz uses different API endpoint and component
- Need to handle loading states per game when switching tabs
- Race condition prevention: Use AbortController or request cancellation

**Decision**: Fetch leaderboard data on tab selection (lazy loading)

**Rationale**:
- Reduces initial load time (only fetch first game's leaderboard)
- Better performance for users who only view one game
- Aligns with user expectation (fetch when needed)
- Can implement request cancellation to prevent race conditions

**Alternatives Considered**:
- Fetch all on mount (current approach): Rejected - wastes resources, slower initial load
- Prefetch all on mount: Rejected - unnecessary network requests, slower initial load
- Cache fetched leaderboards: Considered but not required for MVP - can be added later if needed

### 4. Special Leaderboard Handling (vocab-quiz)

**Task**: Determine how to preserve special leaderboard functionality for vocab-quiz

**Findings**:
- vocab-quiz uses `VocabQuizLeaderboard` component with CEFR level and translation direction selectors
- Uses different API endpoint: `GET /api/v1/vocab-quiz/leaderboard` with query parameters
- Component is self-contained and handles its own state management
- Should be rendered when vocab-quiz tab is selected

**Decision**: Conditionally render `VocabQuizLeaderboard` component when vocab-quiz tab is selected

**Rationale**:
- Preserves existing functionality
- Component is already well-designed and self-contained
- No changes needed to vocab-quiz leaderboard component itself
- Simple conditional rendering based on game code

**Alternatives Considered**:
- Refactor to unified component: Rejected - adds complexity, breaks existing functionality
- Remove special handling: Rejected - violates requirement FR-007

### 5. Default Game Selection

**Task**: Determine which game should be selected by default on page load

**Findings**:
- Current implementation sorts games by `display_order`
- First game in sorted list is the natural default
- Spec requirement FR-005: "automatically select the first available game (by display order)"
- User Story 2: Default game selection on page load (P2)

**Decision**: Select first game by `display_order` on page load

**Rationale**:
- Matches spec requirement exactly
- Consistent with existing sorting logic
- Provides immediate content to users
- Simple implementation

**Alternatives Considered**:
- No default selection: Rejected - violates spec requirement and user story
- Most popular game: Rejected - no popularity data available, adds complexity
- Last viewed game (localStorage): Considered but not required - can be enhancement later

### 6. Error and Loading State Handling

**Task**: Determine how to handle errors and loading states for individual games

**Findings**:
- Current implementation has per-game error and loading states
- With tabs, need to show loading/error for currently selected game only
- Other games' errors shouldn't block tab functionality
- Global error state still needed for games list fetch failure

**Decision**: 
- Per-game loading/error states for selected game only
- Global error state for games list fetch failure
- Tab remains clickable even if a game's leaderboard fails to load

**Rationale**:
- Isolates errors to individual games
- Better user experience (can still switch to other games)
- Aligns with requirement FR-009 and FR-010
- Matches existing error handling patterns

**Alternatives Considered**:
- Block all tabs on any error: Rejected - poor UX, violates FR-010
- Hide failed games from tabs: Rejected - user should see all games, even if leaderboard fails

### 7. Race Condition Prevention

**Task**: Determine how to prevent race conditions when rapidly switching tabs

**Findings**:
- Multiple API calls can be in flight simultaneously
- Need to ensure only the latest request's response is used
- AbortController can cancel in-flight requests
- Alternative: Track request sequence numbers

**Decision**: Use AbortController to cancel previous requests when switching tabs

**Rationale**:
- Standard browser API, no additional dependencies
- Prevents race conditions effectively
- Clean cancellation of unnecessary requests
- Aligns with requirement FR-012

**Alternatives Considered**:
- Request sequence numbers: Rejected - more complex, AbortController is cleaner
- Debouncing tab switches: Rejected - adds delay, poor UX
- Ignore race conditions: Rejected - violates FR-012

## Summary of Decisions

| Decision | Rationale |
|----------|-----------|
| Use shadcn UI Tabs component | Constitution compliance, accessibility, consistency |
| React useState for state management | Simple, sufficient for component-local state |
| Lazy load leaderboard data | Better performance, aligns with user expectations |
| Preserve VocabQuizLeaderboard component | Maintains existing functionality, no breaking changes |
| Default to first game by display_order | Matches spec requirement, simple implementation |
| Per-game error handling | Better UX, isolates failures |
| AbortController for race condition prevention | Standard API, clean cancellation |

## Unresolved Questions

None. All research tasks completed, all decisions made.

## Next Steps

Proceed to Phase 1: Design & Contracts
- Create data-model.md (frontend entities only)
- Create API contracts (verify existing endpoints are sufficient)
- Create quickstart.md

