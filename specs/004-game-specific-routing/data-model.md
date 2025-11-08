# Data Model: Game-Specific Routing with Coming Soon Page

**Feature**: Game-Specific Routing with Coming Soon Page  
**Date**: 2025-01-27  
**Phase**: 1 - Design & Contracts

## Overview

This feature implements game-specific routing with no database schema modifications. The data model documents the entities used by the frontend components and the new backend endpoint for fetching game information by code.

## Entities

### Game

**Purpose**: Represents a vocabulary learning game with routing information.

**Source**: Backend API endpoints:
- `GET /api/v1/games` (existing - list all games)
- `GET /api/v1/games/code/:code` (new - get game by code)

**Attributes**:
- `game_id` (number, required): Unique identifier for the game
- `code` (string, required): Game code used for routing (e.g., "vocab-quiz", "word-scramble", "spelling-challenge")
- `name` (string, required): Display name of the game
- `description` (string, required): Short description of the game
- `icon_path` (string | null, optional): Relative path to game icon in public assets (e.g., "/games/vocab-quiz.svg")
- `category` (string | null, optional): Game category (e.g., "vocabulary", "grammar", "pronunciation", "mixed")
- `display_order` (number, required): Order for displaying games on homepage
- `is_active` (boolean, required): Whether the game is currently active and should be displayed
- `created_at` (string, required): ISO 8601 timestamp of when the game was created
- `updated_at` (string, required): ISO 8601 timestamp of when the game was last updated

**Relationships**:
- A Game has many LeaderboardEntry entries (one-to-many)
- A Game is associated with multiple Levels (many-to-many via GameLevel junction table)

**Validation Rules**:
- `game_id` must be a positive integer
- `code` must be a non-empty string, unique across games (enforced by database unique constraint)
- `name` must be a non-empty string
- `description` must be a non-empty string
- `icon_path` must be a valid path if provided (starts with "/")
- `display_order` must be a non-negative integer
- Games with `is_active = false` should not be displayed on homepage

**Usage in Feature**:
- Game routing uses `code` field to determine which game page to display
- Coming Soon page displays game `name`, `description`, and `icon_path`
- Vocabulary Quiz game routes to `/game/vocab-quiz` when `code === 'vocab-quiz'`
- Other game codes route to Coming Soon page

### GameCode (Frontend-Only Constant)

**Purpose**: Tracks which games are fully implemented in the frontend.

**Source**: Frontend constants file (e.g., `frontend/src/constants/games.ts`)

**Attributes**:
- `IMPLEMENTED_GAMES` (array of strings, constant): List of game codes that are fully implemented
  - Current value: `['vocab-quiz']`
  - Extensible: New game codes can be added when games are implemented

**Usage in Feature**:
- Routing logic checks if game code is in `IMPLEMENTED_GAMES` list
- If code is in list: Route to game-specific component (e.g., Vocabulary Quiz)
- If code is not in list but exists in database: Route to Coming Soon page
- If code is not in list and doesn't exist in database: Redirect to homepage

**State Transitions**:
- **Game Implementation**: When a new game is fully implemented, add its code to `IMPLEMENTED_GAMES` array
- **Game Removal**: If a game is removed, remove its code from `IMPLEMENTED_GAMES` array (rare)

### RoutingState (Frontend-Only)

**Purpose**: Tracks the current game routing state based on URL parameters and game implementation status.

**Source**: Client-side state (React Router URL parameters + game code validation)

**Attributes**:
- `gameCode` (string, derived): Game code extracted from URL path `/game/:code`
- `isImplemented` (boolean, derived): Whether the game code is in `IMPLEMENTED_GAMES` list
- `gameInfo` (Game | null, fetched): Game information fetched from backend API
- `isLoading` (boolean, state): Whether game information is being fetched
- `error` (string | null, state): Error message if game code is invalid or fetch fails

**State Transitions**:
- **Route Load**: User navigates to `/game/:code` → Extract `code` from URL → Check if implemented
  - If `vocab-quiz`: Render Vocabulary Quiz component
  - If other valid code: Fetch game info → Render Coming Soon component
  - If invalid code: Redirect to homepage
- **Game Info Fetch**: Fetch game information from backend
  - Success: Set `gameInfo`, render Coming Soon page
  - Error (404): Redirect to homepage (game code doesn't exist)
  - Error (other): Show error state, allow retry or redirect

**Usage in Feature**:
- Game component uses RoutingState to determine which page to render
- Coming Soon component uses `gameInfo` to display game name, description, icon
- Error handling uses `error` state to display appropriate messages

## Data Flow

### Game Routing Data Flow

1. **User Clicks Game Card**: User clicks on a game card from homepage
2. **Navigation**: React Router navigates to `/game/:code` (where `:code` is the game code)
3. **Route Handler**: App.tsx route handler checks authentication
   - If authenticated: Render Game component with game code
   - If not authenticated: Redirect to `/login?redirect_to=/game/:code`
4. **Game Component**: Game component extracts `code` from URL using `useParams()`
5. **Implementation Check**: Check if `code` is in `IMPLEMENTED_GAMES` list
6. **Routing Decision**:
   - **If `vocab-quiz`**: Render Vocabulary Quiz game interface (existing functionality)
   - **If other valid code**: Fetch game info from `GET /api/v1/games/code/:code` → Render Coming Soon page
   - **If invalid code**: Redirect to homepage with error message

### Coming Soon Page Data Flow

1. **Component Mount**: Coming Soon component mounts for unimplemented game
2. **API Call**: `fetchGameByCode(code)` called to `GET /api/v1/games/code/:code`
3. **Data Processing**: 
   - Success: Game information received, display Coming Soon page with game name, description, icon
   - Error (404): Game code doesn't exist, redirect to homepage
   - Error (other): Show error message, allow retry or redirect
4. **Rendering**: Coming Soon component renders with game information
5. **User Interaction**: User clicks "Back to Home" → Navigate to homepage

### Invalid Game Code Handling

1. **Invalid URL Access**: User accesses `/game/invalid-game` directly
2. **API Call**: `fetchGameByCode('invalid-game')` called
3. **Error Response**: Backend returns 404 Not Found
4. **Error Handling**: Frontend catches 404 error
5. **Redirect**: Redirect to homepage with toast notification: "Game not found"

### Authentication Redirect Flow

1. **Unauthenticated Access**: User clicks game card but is not authenticated
2. **Redirect to Login**: Navigate to `/login?redirect_to=/game/:code`
3. **Login**: User completes login
4. **Post-Login Redirect**: After successful login, redirect to `/game/:code`
5. **Game Routing**: Game component handles routing based on game code (as described above)

## API Contracts

### GET /api/v1/games/code/:code (NEW)

**Purpose**: Fetch game information by game code for routing and Coming Soon page display.

**Request Parameters**:
- `code` (path parameter, required): Game code (string, e.g., "vocab-quiz", "word-scramble")

**Response**:
```json
{
  "game": {
    "game_id": 1,
    "code": "word-scramble",
    "name": "Word Scramble",
    "description": "Unscramble letters to form correct English words. Test your spelling skills and vocabulary knowledge!",
    "icon_path": "/games/word-scramble.svg",
    "category": "vocabulary",
    "display_order": 1,
    "is_active": true,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
}
```

**Status Codes**:
- `200 OK`: Success, returns game information
- `404 Not Found`: Game code does not exist in database
- `500 Internal Server Error`: Server error

**Error Response (404)**:
```json
{
  "error": "Game not found",
  "message": "No game found with code: invalid-game"
}
```

**Error Response (500)**:
```json
{
  "error": "Internal server error",
  "message": "Failed to retrieve game"
}
```

### GET /api/v1/games (EXISTING - No Changes)

**Purpose**: List all active games (used by homepage).

**Request**: No parameters

**Response**: (No changes from existing implementation)
```json
{
  "games": [
    {
      "game_id": 1,
      "code": "vocab-quiz",
      "name": "Vocabulary Quiz",
      "description": "Match words with their definitions",
      "icon_path": "/games/vocab-quiz.svg",
      "category": "vocabulary",
      "display_order": 1,
      "is_active": true,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

**Status Codes**:
- `200 OK`: Success, returns array of games
- `500 Internal Server Error`: Server error

## Data Validation

### Frontend Validation

**Game Code Validation**:
- Validate `code` is a non-empty string
- Check if `code` is in `IMPLEMENTED_GAMES` list
- Validate `code` exists in backend (via API call for Coming Soon page)
- Handle invalid codes gracefully (redirect to homepage)

**Game Information Validation**:
- Validate `game_id` is a positive integer
- Validate `name` is a non-empty string
- Validate `description` is a non-empty string
- Validate `icon_path` is a valid path if provided (starts with "/")
- Handle missing game information gracefully (show fallback message)

**Error Handling**:
- API errors (404): Redirect to homepage with error message
- API errors (500): Show error state, allow retry or redirect
- Invalid game codes: Redirect to homepage
- Network errors: Show error message, allow retry

### Backend Validation

**Game Code Validation**:
- Validate `code` parameter is provided (path parameter required)
- Validate `code` exists in database (query games table by code)
- Return 404 if game code not found
- Return game information if found

**Database Query**:
- Query: `SELECT * FROM games WHERE code = $1 AND is_active = TRUE`
- Return single game record or error if not found
- Use database unique constraint on `code` field for data integrity

## Database Schema (No Changes)

**Note**: This feature does not modify database schema. All data comes from existing `games` table:

- `games` table: Stores game information with `code` field (unique constraint)
- No new tables or columns required
- No migrations needed

**Existing Schema**:
```sql
CREATE TABLE games (
    game_id BIGSERIAL PRIMARY KEY,
    code VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon_path VARCHAR(255),
    category VARCHAR(50),
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Summary

This feature uses existing data models with no schema changes. The frontend implements game-specific routing based on game codes, and the backend adds a new endpoint to fetch game information by code. Routing state is managed client-side using React Router, game code constants, and API calls to validate and fetch game information.

