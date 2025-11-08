# Quick Start: Homepage Redesign with Leaderboard Separation

**Feature**: Homepage Redesign with Leaderboard Separation  
**Date**: 2025-01-27  
**Phase**: 1 - Design & Contracts

## Overview

This guide provides step-by-step instructions for setting up the development environment and manually verifying the homepage redesign feature.

## Prerequisites

- Node.js 18+ and npm (for frontend development)
- Go 1.24+ (for backend, if testing API endpoints)
- Docker and Docker Compose (for running the full stack)
- Git (for version control)

## Development Setup

### 1. Clone Repository and Checkout Feature Branch

```bash
git clone <repository-url>
cd english-vocab-trainer
git checkout 002-homepage-redesign
```

### 2. Start Backend Services

```bash
# Start PostgreSQL, Redis, and backend API
docker-compose -f docker-compose.dev.yml up -d

# Verify backend is running
curl http://localhost:8180/api/v1/games
```

### 3. Start Frontend Development Server

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` (or the port shown in the terminal).

### 4. Verify Setup

1. Open browser to `http://localhost:5173`
2. Verify homepage loads without errors
3. Check browser console for any errors
4. Verify API endpoints are accessible:
   - `http://localhost:8180/api/v1/games` - Should return JSON array of games
   - `http://localhost:8180/api/v1/games/1/leaderboard` - Should return JSON leaderboard data

## Manual Verification Steps

### User Story 1: View Enhanced Homepage with Game Listing

**Steps**:
1. Navigate to `http://localhost:5173/`
2. Verify header is visible at the top with:
   - Application title: "English Vocabulary Trainer"
   - Subtitle/description
   - Navigation links (Home, Leaderboard, Login/Register or Dashboard/Logout)
3. Verify game cards are displayed in a responsive grid layout showing:
   - Game icon
   - Game name
   - Game category (if available)
   - Game description
   - Play button
4. Verify game cards do NOT contain leaderboard information
5. Verify footer is visible at the bottom with copyright information
6. Verify page loads within 2 seconds (check Network tab in browser DevTools)

**Expected Results**:
- ✅ Header displays correctly with navigation
- ✅ Game cards show game information without leaderboards
- ✅ Footer displays at bottom
- ✅ Page loads quickly (<2s)
- ✅ Responsive design works on mobile/tablet/desktop viewports

### User Story 2: Navigate to Leaderboard Page

**Steps**:
1. From homepage, click "Leaderboard" link in header
2. Verify navigation to `/leaderboard` route occurs within 1 second
3. Verify leaderboard page displays:
   - Header (same as homepage)
   - Leaderboard information for available games
   - Top player rankings with usernames, scores, and rank positions
   - Footer (same as homepage)
4. Verify page loads within 2 seconds
5. Test empty leaderboard state:
   - If no leaderboard data exists, verify appropriate message displays ("Be the first to play!")

**Expected Results**:
- ✅ Navigation to leaderboard page works correctly
- ✅ Leaderboard data displays for games
- ✅ Empty states handled gracefully
- ✅ Page loads quickly (<2s)
- ✅ Consistent header/footer structure

### User Story 3: Homepage Header Navigation

**Steps**:
1. Verify header contains navigation links:
   - Home (always visible)
   - Leaderboard (always visible)
   - Login/Register (if not authenticated)
   - Dashboard/Logout (if authenticated)
2. Test navigation links:
   - Click "Home" → Navigate to homepage
   - Click "Leaderboard" → Navigate to leaderboard page
   - Click "Login" (if not authenticated) → Navigate to login page
   - Click "Dashboard" (if authenticated) → Navigate to dashboard
3. Verify active navigation link is highlighted
4. Test authentication-aware navigation:
   - Log out → Verify Login/Register links appear
   - Log in → Verify Dashboard/Logout links appear

**Expected Results**:
- ✅ All navigation links function correctly
- ✅ Navigation responds quickly (<1s)
- ✅ Authentication-aware navigation works
- ✅ Active route highlighting works

### Edge Cases

**Test Empty States**:
1. If no games are available, verify homepage shows appropriate empty state message
2. If leaderboard data fails to load, verify error message with retry option displays

**Test Responsive Design**:
1. Resize browser window to mobile size (320px width)
2. Verify homepage header, game grid, and footer adapt correctly
3. Resize to tablet size (768px width)
4. Verify layout adapts to 2-column grid
5. Resize to desktop size (1024px+ width)
6. Verify layout adapts to 3-column grid

**Test Error Handling**:
1. Stop backend server
2. Refresh homepage
3. Verify error message displays with retry option
4. Restart backend server
5. Click retry
6. Verify page loads successfully

**Test Direct URL Navigation**:
1. Navigate directly to `http://localhost:5173/leaderboard` (without visiting homepage first)
2. Verify leaderboard page loads correctly
3. Verify header and footer structure is maintained

## Component Development

### Creating Header Component

**File**: `frontend/src/components/layout/Header.tsx`

```typescript
// Example structure (not full implementation)
import { Link } from 'react-router-dom';
import { isAuthenticated } from '@/lib/api';

export function Header() {
  const authenticated = isAuthenticated();
  
  return (
    <header>
      <h1>English Vocabulary Trainer</h1>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/leaderboard">Leaderboard</Link>
        {authenticated ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
```

### Creating Footer Component

**File**: `frontend/src/components/layout/Footer.tsx`

```typescript
// Example structure (not full implementation)
export function Footer() {
  return (
    <footer>
      <p>© 2025 English Vocabulary Trainer. All rights reserved.</p>
    </footer>
  );
}
```

### Creating LeaderboardPage Component

**File**: `frontend/src/components/leaderboard/LeaderboardPage.tsx`

```typescript
// Example structure (not full implementation)
import { useEffect, useState } from 'react';
import { fetchGames, fetchLeaderboard } from '@/lib/api';
import { Leaderboard } from '@/components/home/Leaderboard';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export function LeaderboardPage() {
  const [games, setGames] = useState([]);
  const [leaderboards, setLeaderboards] = useState({});
  
  useEffect(() => {
    // Fetch games and leaderboards
  }, []);
  
  return (
    <div>
      <Header />
      <main>
        {/* Display leaderboards for each game */}
      </main>
      <Footer />
    </div>
  );
}
```

### Modifying HomePage Component

**File**: `frontend/src/components/home/HomePage.tsx`

**Changes**:
1. Import Header and Footer components
2. Remove leaderboard fetching logic (no longer needed in homepage)
3. Remove leaderboard prop from GameCard components
4. Wrap page content with Header and Footer

### Modifying GameCard Component

**File**: `frontend/src/components/home/GameCard.tsx`

**Changes**:
1. Remove Leaderboard component import and usage
2. Remove leaderboard section from card layout
3. Add Play button using shadcn Button component
4. Ensure Play button triggers game navigation

## API Testing

### Test Games Endpoint

```bash
# Get all games
curl http://localhost:8180/api/v1/games

# Expected response:
# {
#   "games": [
#     {
#       "game_id": 1,
#       "code": "vocab-quiz",
#       "name": "Vocabulary Quiz",
#       ...
#     }
#   ]
# }
```

### Test Leaderboard Endpoint

```bash
# Get leaderboard for game ID 1
curl http://localhost:8180/api/v1/games/1/leaderboard

# Expected response:
# {
#   "game_id": 1,
#   "leaderboard": [
#     {
#       "rank": 1,
#       "user_id": 1,
#       "username": "player1",
#       "score": 1000,
#       "achieved_at": "2025-01-27T10:00:00Z"
#     }
#   ]
# }
```

## Troubleshooting

### Frontend Not Loading

- Check if frontend dev server is running: `npm run dev`
- Check browser console for errors
- Verify API base URL in `frontend/src/lib/api.ts`

### API Endpoints Not Working

- Check if backend is running: `docker-compose -f docker-compose.dev.yml ps`
- Verify backend logs: `docker-compose -f docker-compose.dev.yml logs backend`
- Check API base URL matches backend port (default: 8180)

### Navigation Not Working

- Verify React Router is configured correctly in `App.tsx`
- Check if routes are defined: `/`, `/leaderboard`, `/login`, `/register`, `/dashboard`
- Verify `Link` components are imported from `react-router-dom`

### Authentication Issues

- Check if JWT token is stored in localStorage: `localStorage.getItem('jwt_token')`
- Verify `isAuthenticated()` utility function works correctly
- Check if authentication state updates on login/logout

## Success Criteria Verification

- **SC-001**: Homepage loads with header, game listing, and footer within 2 seconds ✅
- **SC-002**: Navigation from homepage to leaderboard page occurs within 1 second ✅
- **SC-003**: Game cards display without leaderboard sections ✅
- **SC-004**: Leaderboard page loads and displays data within 2 seconds ✅
- **SC-005**: 100% of navigation links function correctly ✅
- **SC-006**: Consistent header and footer structure across pages ✅
- **SC-007**: Responsive design works on mobile, tablet, and desktop ✅
- **SC-008**: Error states handled gracefully with user-friendly messages ✅

## Next Steps

After manual verification:
1. Address any issues found during testing
2. Update documentation if needed
3. Proceed to implementation (Phase 2)
4. Create tasks using `/speckit.tasks` command

