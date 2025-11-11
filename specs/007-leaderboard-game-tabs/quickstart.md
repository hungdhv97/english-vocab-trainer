# Quick Start: Leaderboard Page Redesign with Game Tabs

**Feature**: Leaderboard Page Redesign with Game Tabs  
**Date**: 2025-01-27  
**Branch**: `007-leaderboard-game-tabs`

## Overview

This feature redesigns the leaderboard page to display game tabs at the top, allowing users to select a specific game and view only that game's leaderboard. The page automatically selects the first game by display order on load.

## Prerequisites

- Node.js 18+ and npm
- Backend API running (see backend README)
- Frontend dependencies installed: `cd frontend && npm install`

## Setup Steps

### 1. Install shadcn UI Tabs Component

```bash
cd frontend
npx shadcn@latest add tabs
```

This will:
- Install `@radix-ui/react-tabs` dependency (if not already installed)
- Create `src/components/ui/tabs.tsx` component file
- Add necessary styles and configuration

### 2. Verify Component Installation

Check that `frontend/src/components/ui/tabs.tsx` exists and contains:
- `Tabs` component
- `TabsList` component
- `TabsTrigger` component
- `TabsContent` component

### 3. Start Development Server

```bash
# Terminal 1: Start backend (if not already running)
cd backend
go run cmd/api/main.go

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### 4. Navigate to Leaderboard Page

Open browser to: `http://localhost:5173/leaderboard`

## Implementation Checklist

### Phase 1: Component Setup

- [ ] Install shadcn UI tabs component
- [ ] Import Tabs components in LeaderboardPage.tsx
- [ ] Add state for selected game ID
- [ ] Add state for games list
- [ ] Add state for leaderboard data (per game)

### Phase 2: Tab Rendering

- [ ] Fetch games on component mount
- [ ] Render TabsList with TabsTrigger for each active game
- [ ] Set default selected game (first by display_order)
- [ ] Handle tab click to update selected game

### Phase 3: Leaderboard Display

- [ ] Fetch leaderboard for selected game on tab change
- [ ] Display loading state while fetching
- [ ] Display error state if fetch fails
- [ ] Display empty state if no entries
- [ ] Conditionally render VocabQuizLeaderboard for vocab-quiz game
- [ ] Conditionally render standard Leaderboard for other games

### Phase 4: Race Condition Prevention

- [ ] Implement AbortController for leaderboard requests
- [ ] Abort previous request when switching tabs
- [ ] Test rapid tab switching

### Phase 5: Error Handling

- [ ] Handle games fetch failure (global error)
- [ ] Handle individual game leaderboard failure (per-game error)
- [ ] Ensure tabs remain clickable even if one game fails

## Manual Verification

### Test Case 1: Page Load

1. Navigate to `/leaderboard`
2. **Expected**: 
   - Game tabs displayed at top
   - First game (by display_order) is selected
   - That game's leaderboard is displayed
   - Loading state shown briefly

### Test Case 2: Tab Selection

1. Click on a different game tab
2. **Expected**:
   - Tab is visually highlighted as active
   - Previous leaderboard disappears
   - Loading state shown
   - New game's leaderboard appears

### Test Case 3: Special Game (vocab-quiz)

1. Click on vocab-quiz tab (if available)
2. **Expected**:
   - VocabQuizLeaderboard component displayed
   - CEFR level selector visible
   - Translation direction selector visible
   - Leaderboard updates when filters change

### Test Case 4: Rapid Tab Switching

1. Quickly click between multiple tabs
2. **Expected**:
   - No race conditions
   - Only the last selected tab's leaderboard is displayed
   - No console errors

### Test Case 5: Error Handling

1. Simulate network error (disable backend or block API calls)
2. **Expected**:
   - Global error shown if games fetch fails
   - Per-game error shown if individual leaderboard fails
   - Tabs remain clickable

### Test Case 6: Empty States

1. Select a game with no leaderboard entries
2. **Expected**:
   - Appropriate empty state message displayed
   - No errors in console

### Test Case 7: Mobile Responsiveness

1. Open page on mobile device or resize browser to mobile width
2. **Expected**:
   - Tabs are responsive and scrollable if needed
   - Leaderboard content is readable
   - No horizontal scrolling

## Common Issues

### Issue: Tabs component not found

**Solution**: Run `npx shadcn@latest add tabs` in the frontend directory

### Issue: Tab selection not updating leaderboard

**Solution**: Check that `selectedGameId` state is being updated and useEffect is triggering leaderboard fetch

### Issue: Race conditions when switching tabs

**Solution**: Implement AbortController to cancel previous requests

### Issue: Vocab-quiz leaderboard not showing

**Solution**: Verify that `game.code === 'vocab-quiz'` condition is correct and VocabQuizLeaderboard component is imported

## Next Steps

After implementation:
1. Test all manual verification cases
2. Check browser console for errors
3. Verify mobile responsiveness
4. Test with different numbers of games (1, 2, 5+)
5. Test with games that have no leaderboard entries

## Related Files

- `frontend/src/components/leaderboard/LeaderboardPage.tsx` - Main component to refactor
- `frontend/src/components/game/VocabQuizLeaderboard.tsx` - Special leaderboard component (preserved)
- `frontend/src/components/home/Leaderboard.tsx` - Standard leaderboard component (preserved)
- `frontend/src/components/ui/tabs.tsx` - shadcn UI tabs component (new)
- `frontend/src/lib/api.ts` - API functions (no changes needed)

