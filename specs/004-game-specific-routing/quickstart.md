# Quickstart: Game-Specific Routing with Coming Soon Page

**Feature**: 004-game-specific-routing  
**Date**: 2025-01-27  
**Purpose**: Manual verification guide for game-specific routing implementation

## Prerequisites

- Backend server running on `http://localhost:8180`
- Frontend development server running
- Database with games table populated (at minimum: `vocab-quiz` game)
- At least one user account for authentication testing

## Setup

1. **Start Backend Server**:
   ```bash
   cd backend
   go run ./cmd/api
   ```

2. **Start Frontend Server**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Verify Database**:
   - Ensure `games` table has at least these games:
     - `vocab-quiz` (Vocabulary Quiz) - implemented
     - `word-scramble` (Word Scramble) - unimplemented
     - `spelling-challenge` (Spelling Challenge) - unimplemented

## Manual Verification Scenarios

### Scenario 1: Access Vocabulary Quiz Game (Implemented)

**Purpose**: Verify Vocabulary Quiz game routes correctly to game interface.

**Steps**:
1. Navigate to homepage (`http://localhost:5173/`)
2. Click on "Vocabulary Quiz" game card
3. If not authenticated: Complete login
4. Verify you are routed to `/game/vocab-quiz`
5. Verify Vocabulary Quiz game interface is displayed (level selector)
6. Verify you can select a level and play the game

**Expected Results**:
- ✅ URL is `/game/vocab-quiz`
- ✅ Vocabulary Quiz game interface is displayed
- ✅ Level selector is visible
- ✅ Game functionality works as before

### Scenario 2: Access Unimplemented Game (Coming Soon)

**Purpose**: Verify unimplemented games route to Coming Soon page.

**Steps**:
1. Navigate to homepage (`http://localhost:5173/`)
2. Click on "Word Scramble" game card (or any non-Vocabulary Quiz game)
3. If not authenticated: Complete login
4. Verify you are routed to `/game/word-scramble` (or corresponding game code)
5. Verify Coming Soon page is displayed
6. Verify game name, description, and icon are displayed
7. Verify "Back to Home" button is visible
8. Click "Back to Home" button
9. Verify you are redirected to homepage

**Expected Results**:
- ✅ URL is `/game/word-scramble` (or corresponding game code)
- ✅ Coming Soon page is displayed
- ✅ Game name is displayed correctly
- ✅ Game description is displayed correctly
- ✅ Game icon is displayed (if available)
- ✅ "Back to Home" button works
- ✅ Navigation to homepage works

### Scenario 3: Direct URL Access (Authenticated)

**Purpose**: Verify direct URL access works for both implemented and unimplemented games.

**Steps**:
1. Ensure you are authenticated (logged in)
2. Navigate directly to `/game/vocab-quiz`
3. Verify Vocabulary Quiz game interface is displayed
4. Navigate directly to `/game/word-scramble`
5. Verify Coming Soon page is displayed
6. Navigate directly to `/game/spelling-challenge`
7. Verify Coming Soon page is displayed with correct game information

**Expected Results**:
- ✅ Direct URL access works for Vocabulary Quiz
- ✅ Direct URL access works for unimplemented games
- ✅ Correct pages are displayed for each game
- ✅ Game information is fetched and displayed correctly

### Scenario 4: Direct URL Access (Unauthenticated)

**Purpose**: Verify unauthenticated users are redirected to login.

**Steps**:
1. Log out (if logged in)
2. Navigate directly to `/game/vocab-quiz`
3. Verify you are redirected to `/login?redirect_to=/game/vocab-quiz`
4. Complete login
5. Verify you are redirected to `/game/vocab-quiz`
6. Verify Vocabulary Quiz game interface is displayed
7. Log out again
8. Navigate directly to `/game/word-scramble`
9. Verify you are redirected to `/login?redirect_to=/game/word-scramble`
10. Complete login
11. Verify you are redirected to `/game/word-scramble`
12. Verify Coming Soon page is displayed

**Expected Results**:
- ✅ Unauthenticated users are redirected to login
- ✅ Redirect parameter is preserved in login URL
- ✅ After login, users are redirected to intended game page
- ✅ Correct pages are displayed after authentication

### Scenario 5: Invalid Game Code Handling

**Purpose**: Verify invalid game codes are handled gracefully.

**Steps**:
1. Ensure you are authenticated
2. Navigate to `/game/invalid-game`
3. Verify you are redirected to homepage
4. Verify error message or toast notification is displayed (if implemented)
5. Verify you can continue using the application normally

**Expected Results**:
- ✅ Invalid game codes redirect to homepage
- ✅ Error message is displayed (optional)
- ✅ Application does not crash
- ✅ User can continue browsing games

### Scenario 6: Bookmarked Game URLs

**Purpose**: Verify bookmarked game URLs work correctly.

**Steps**:
1. While authenticated, navigate to `/game/vocab-quiz`
2. Bookmark the page (or copy URL)
3. Close browser tab
4. Open new tab and navigate to bookmarked URL
5. Verify Vocabulary Quiz game interface is displayed (if still authenticated)
6. If logged out: Verify you are redirected to login, then to Vocabulary Quiz after authentication
7. Repeat for `/game/word-scramble` bookmark

**Expected Results**:
- ✅ Bookmarked URLs work correctly
- ✅ Authentication state is checked
- ✅ Correct pages are displayed
- ✅ Login redirect works for bookmarked URLs

### Scenario 7: Backend API Endpoint

**Purpose**: Verify new backend endpoint works correctly.

**Steps**:
1. Test `GET /api/v1/games/code/vocab-quiz`:
   ```bash
   curl http://localhost:8180/api/v1/games/code/vocab-quiz
   ```
2. Verify response contains game information
3. Test `GET /api/v1/games/code/word-scramble`:
   ```bash
   curl http://localhost:8180/api/v1/games/code/word-scramble
   ```
4. Verify response contains game information
5. Test `GET /api/v1/games/code/invalid-game`:
   ```bash
   curl http://localhost:8180/api/v1/games/code/invalid-game
   ```
6. Verify 404 response is returned

**Expected Results**:
- ✅ Valid game codes return 200 with game information
- ✅ Invalid game codes return 404
- ✅ Response format matches OpenAPI contract
- ✅ Game information is correct

### Scenario 8: Browser Navigation

**Purpose**: Verify browser back/forward buttons work correctly.

**Steps**:
1. Navigate to homepage
2. Click on Vocabulary Quiz game card
3. Click browser back button
4. Verify you return to homepage
5. Click browser forward button
6. Verify you return to Vocabulary Quiz game
7. Navigate to Word Scramble game
8. Click browser back button
9. Verify you return to previous page (homepage or Vocabulary Quiz)
10. Click browser forward button
11. Verify you return to Word Scramble Coming Soon page

**Expected Results**:
- ✅ Browser back button works correctly
- ✅ Browser forward button works correctly
- ✅ Application state is preserved
- ✅ No errors occur during navigation

## Success Criteria Verification

### SC-001: Vocabulary Quiz Access Time
- **Requirement**: Users can successfully access the Vocabulary Quiz game via `/game/vocab-quiz` within 2 seconds of clicking the game card from the homepage
- **Verification**: Measure time from click to page display (should be <2 seconds)

### SC-002: Coming Soon Page Access Time
- **Requirement**: Users can successfully access "Coming Soon" pages for unimplemented games within 2 seconds of clicking the game card from the homepage
- **Verification**: Measure time from click to page display (should be <2 seconds)

### SC-003: Correct Routing
- **Requirement**: 100% of game card clicks from the homepage route to the correct page
- **Verification**: Test all game cards on homepage, verify correct routing for each

### SC-004: Authentication Redirect Time
- **Requirement**: Unauthenticated users are successfully redirected to login and then to their intended game page after authentication in under 5 seconds total
- **Verification**: Measure time from click to final game page display (should be <5 seconds)

### SC-005: Navigation Response Time
- **Requirement**: Users can return to the homepage from any game page within 1 second of clicking the navigation link
- **Verification**: Measure time from click to homepage display (should be <1 second)

### SC-006: Invalid URL Handling
- **Requirement**: Invalid game URLs are handled gracefully without application errors, with users redirected to a valid page within 2 seconds
- **Verification**: Test invalid game codes, verify redirect time and error handling

### SC-007: Bookmarked URL Handling
- **Requirement**: Bookmarked game URLs work correctly for authenticated users, routing to the appropriate page within 2 seconds of page load
- **Verification**: Test bookmarked URLs, measure load time

### SC-008: Vocabulary Quiz Functionality
- **Requirement**: All game routing scenarios function correctly without breaking existing Vocabulary Quiz game functionality
- **Verification**: Verify Vocabulary Quiz game works exactly as before, no regressions

## Troubleshooting

### Issue: Coming Soon page doesn't display game information
- **Check**: Backend endpoint `GET /api/v1/games/code/:code` is working
- **Check**: Frontend API function `fetchGameByCode` is called correctly
- **Check**: Game code exists in database

### Issue: Invalid game codes don't redirect
- **Check**: Error handling in Game component
- **Check**: Backend returns 404 for invalid game codes
- **Check**: Frontend handles 404 errors correctly

### Issue: Authentication redirect doesn't preserve game URL
- **Check**: Redirect parameter is included in login URL
- **Check**: Login component handles redirect parameter
- **Check**: Post-login redirect logic

### Issue: Vocabulary Quiz game doesn't work
- **Check**: Game component routing logic doesn't interfere with Vocabulary Quiz
- **Check**: Game code check doesn't prevent Vocabulary Quiz from rendering
- **Check**: No breaking changes to existing Vocabulary Quiz functionality

## Notes

- All scenarios should be tested on both mobile and desktop browsers
- Test with different authentication states (logged in, logged out)
- Verify responsive design on different screen sizes
- Check browser console for any errors
- Verify no regressions in existing functionality

