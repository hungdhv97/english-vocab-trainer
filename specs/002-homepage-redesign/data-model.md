# Data Model: Homepage Redesign with Leaderboard Separation

**Feature**: Homepage Redesign with Leaderboard Separation  
**Date**: 2025-01-27  
**Phase**: 1 - Design & Contracts

## Overview

This feature involves frontend-only changes with no database schema modifications. The data model documents the entities used by the frontend components, which correspond to existing backend API responses.

## Entities

### Game

**Purpose**: Represents a vocabulary learning game displayed on the homepage.

**Source**: Backend API endpoint `GET /api/v1/games`

**Attributes**:
- `game_id` (number, required): Unique identifier for the game
- `code` (string, required): Game code used for routing (e.g., "vocab-quiz", "spelling-challenge")
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
- A Game is associated with multiple Levels (many-to-many via GameLevel junction table, not used in this feature)

**Validation Rules**:
- `game_id` must be a positive integer
- `code` must be a non-empty string, unique across games
- `name` must be a non-empty string
- `description` must be a non-empty string
- `icon_path` must be a valid path if provided (starts with "/")
- `display_order` must be a non-negative integer
- Games with `is_active = false` should not be displayed on homepage

**Usage in Feature**:
- HomePage component displays all active games in a grid layout
- GameCard component displays individual game information (name, icon, description, category)
- LeaderboardPage component may display games for leaderboard filtering
- Game selection navigates to `/game/:code` route

### LeaderboardEntry

**Purpose**: Represents a player's ranking for a specific game in the leaderboard.

**Source**: Backend API endpoint `GET /api/v1/games/:id/leaderboard`

**Attributes**:
- `rank` (number, required): Player's position in leaderboard (1 = highest score, 2 = second highest, etc.)
- `user_id` (number, required): Unique identifier of the player
- `username` (string, required): Player's display name
- `score` (number, required): Player's best score for this game
- `achieved_at` (string, required): ISO 8601 timestamp when the best score was achieved

**Relationships**:
- A LeaderboardEntry belongs to one Game (many-to-one, via game_id)
- A LeaderboardEntry belongs to one User (many-to-one, via user_id)

**Validation Rules**:
- `rank` must be a positive integer (1 or greater)
- `user_id` must be a positive integer
- `username` must be a non-empty string
- `score` must be a non-negative integer
- `achieved_at` must be a valid ISO 8601 timestamp
- Leaderboard entries are sorted by score (descending), then by achieved_at (ascending for ties)

**Usage in Feature**:
- LeaderboardPage component displays leaderboard entries for games
- Leaderboard component (reused from existing code) displays top 10 entries
- Empty leaderboards (no entries) show "Be the first to play!" message
- Leaderboard entries are displayed with rank, username, and score

### NavigationState (Frontend-Only)

**Purpose**: Tracks the user's current page location and authentication status to determine which navigation links should be displayed in the header.

**Source**: Client-side state (React Router location + localStorage authentication check)

**Attributes**:
- `currentPath` (string, derived): Current route path (e.g., "/", "/leaderboard", "/game/vocab-quiz")
- `isAuthenticated` (boolean, derived): Whether the user is authenticated (checked via `isAuthenticated()` utility)

**State Transitions**:
- **Unauthenticated → Authenticated**: User logs in → `isAuthenticated` becomes `true`, navigation shows Dashboard/Logout links
- **Authenticated → Unauthenticated**: User logs out → `isAuthenticated` becomes `false`, navigation shows Login/Register links
- **Route Change**: User navigates to different page → `currentPath` updates, active navigation link highlights

**Usage in Feature**:
- Header component uses NavigationState to conditionally render navigation links
- Authentication-aware navigation: Shows Login/Register for unauthenticated users, Dashboard/Logout for authenticated users
- Always shows Home and Leaderboard links (public navigation)

## Data Flow

### HomePage Data Flow

1. **Component Mount**: HomePage component mounts
2. **API Call**: `fetchGames()` called to `GET /api/v1/games`
3. **Data Processing**: Response filtered to show only `is_active = true` games, sorted by `display_order`
4. **Rendering**: GameGrid component renders GameCard for each game
5. **User Interaction**: User clicks game card or Play button → Navigate to `/game/:code` (authenticated) or `/login?redirect_to=/game/:code` (unauthenticated)

### LeaderboardPage Data Flow

1. **Component Mount**: LeaderboardPage component mounts
2. **API Calls**: 
   - `fetchGames()` called to `GET /api/v1/games` (get all games)
   - For each game: `fetchLeaderboard(game.game_id)` called to `GET /api/v1/games/:id/leaderboard`
3. **Data Processing**: Leaderboard entries sorted by rank, limited to top 10 per game
4. **Rendering**: Leaderboard component renders entries for each game
5. **Error Handling**: Empty leaderboards show appropriate message, API errors show error state

### Header Navigation Data Flow

1. **Component Render**: Header component renders
2. **Authentication Check**: `isAuthenticated()` utility checks localStorage for JWT token
3. **Route Check**: React Router `useLocation()` hook gets current pathname
4. **Conditional Rendering**: Navigation links rendered based on authentication state and current route
5. **User Interaction**: User clicks navigation link → React Router navigates to target route

## API Contracts

### GET /api/v1/games

**Request**: No parameters

**Response**:
```json
{
  "games": [
    {
      "game_id": 1,
      "code": "vocab-quiz",
      "name": "Vocabulary Quiz",
      "description": "Test your vocabulary knowledge",
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

### GET /api/v1/games/:id/leaderboard

**Request Parameters**:
- `id` (path parameter, required): Game ID (integer)

**Response**:
```json
{
  "game_id": 1,
  "leaderboard": [
    {
      "rank": 1,
      "user_id": 1,
      "username": "player1",
      "score": 1000,
      "achieved_at": "2025-01-27T10:00:00Z"
    }
  ]
}
```

**Status Codes**:
- `200 OK`: Success, returns leaderboard (may be empty array)
- `400 Bad Request`: Invalid game ID
- `404 Not Found`: Game not found
- `500 Internal Server Error`: Server error

## Data Validation

### Frontend Validation

**Game Data**:
- Validate `game_id` is a positive integer
- Validate `code` is a non-empty string
- Validate `name` is a non-empty string
- Validate `description` is a non-empty string
- Filter out games with `is_active = false`
- Sort games by `display_order` (ascending)

**Leaderboard Data**:
- Validate `rank` is a positive integer
- Validate `user_id` is a positive integer
- Validate `username` is a non-empty string
- Validate `score` is a non-negative integer
- Sort entries by `rank` (ascending)
- Limit display to top 10 entries per game

**Error Handling**:
- API errors: Display user-friendly error message with retry option
- Empty states: Display appropriate message (e.g., "No games available", "Be the first to play!")
- Loading states: Show loading skeleton or spinner while fetching data

## Database Schema (No Changes)

**Note**: This feature does not modify database schema. All data comes from existing tables:
- `games` table: Stores game information
- `game_sessions` table: Stores game session data (used for leaderboard calculation)
- `users` table: Stores user information (used for leaderboard usernames)

## Summary

This feature uses existing data models with no schema changes. The frontend components consume data from existing API endpoints and display it in a redesigned layout. Navigation state is managed client-side using React Router and authentication utilities.

