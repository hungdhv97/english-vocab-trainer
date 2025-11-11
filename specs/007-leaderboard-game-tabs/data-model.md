# Data Model: Leaderboard Page Redesign with Game Tabs

**Feature**: Leaderboard Page Redesign with Game Tabs  
**Date**: 2025-01-27  
**Phase**: 1 - Design & Contracts

## Overview

This feature involves frontend-only changes with no database schema modifications. The data model documents the entities used by the frontend components, which correspond to existing backend API responses.

## Entities

### Game

**Purpose**: Represents a vocabulary learning game displayed as a tab on the leaderboard page.

**Source**: Backend API endpoint `GET /api/v1/games`

**Attributes**:
- `game_id` (number, required): Unique identifier for the game
- `code` (string, required): Game code used for routing and identification (e.g., "vocab-quiz", "word-scramble")
- `name` (string, required): Display name of the game (e.g., "Vocabulary Quiz", "Word Scramble")
- `description` (string, required): Short description of the game
- `icon_path` (string | null, optional): Relative path to game icon in public assets (e.g., "/games/vocab-quiz.svg")
- `category` (string | null, optional): Game category (e.g., "vocabulary", "grammar", "pronunciation", "mixed")
- `display_order` (number, required): Order for displaying games (lower number = displayed first). Used to determine default selected game.
- `is_active` (boolean, required): Whether the game is currently active and should be displayed
- `created_at` (string, required): ISO 8601 timestamp of when the game was created
- `updated_at` (string, required): ISO 8601 timestamp of when the game was last updated

**Relationships**:
- A Game has many LeaderboardEntry entries (one-to-many)
- Games are displayed as tabs, one tab per active game

**Validation Rules**:
- `game_id` must be a positive integer
- `code` must be a non-empty string, unique across games
- `name` must be a non-empty string
- `display_order` must be a non-negative integer
- Games with `is_active = false` should not be displayed as tabs

**Frontend Usage**:
- Games are fetched on component mount
- Sorted by `display_order` ascending
- First game (by display_order) is selected by default
- Each game becomes a tab in the Tabs component

### LeaderboardEntry

**Purpose**: Represents a single entry in a game's leaderboard.

**Source**: Backend API endpoints:
- `GET /api/v1/games/:id/leaderboard` (standard games)
- `GET /api/v1/vocab-quiz/leaderboard` (vocab-quiz with query parameters)

**Attributes** (Standard Games):
- `user_id` (number, required): Unique identifier for the user
- `username` (string, required): Display name of the user
- `score` (number, required): User's best score for this game
- `rank` (number, required): User's rank in the leaderboard (1-based)

**Attributes** (Vocab Quiz - VocabQuizLeaderboardEntry):
- `user_id` (number, required): Unique identifier for the user
- `username` (string, required): Display name of the user
- `accuracy_percentage` (number, required): User's accuracy percentage (0-100)
- `games_played` (number, required): Number of games played (minimum 5 required to appear on leaderboard)
- `rank` (number, required): User's rank in the leaderboard (1-based)

**Relationships**:
- Belongs to a Game (many-to-one)
- Leaderboard entries are displayed only for the currently selected game tab

**Validation Rules**:
- `user_id` must be a positive integer
- `username` must be a non-empty string
- `score` (standard games) must be a non-negative number
- `accuracy_percentage` (vocab-quiz) must be between 0 and 100
- `rank` must be a positive integer (1-based)
- Leaderboard entries are limited to top 10 per game

**Frontend Usage**:
- Fetched when a game tab is selected
- Displayed in Leaderboard component (standard games) or VocabQuizLeaderboard component (vocab-quiz)
- Empty leaderboards show appropriate empty state messages

### CefrLevel

**Purpose**: Represents a CEFR (Common European Framework of Reference) level for vocabulary quiz filtering.

**Source**: Backend API endpoint `GET /api/v1/cefr-levels`

**Attributes**:
- `id` (number, required): Unique identifier for the CEFR level
- `code` (string, required): CEFR level code (e.g., "A1", "A2", "B1", "B2", "C1", "C2")
- `name` (string, required): Full name of the CEFR level
- `description` (string, optional): Description of the level

**Relationships**:
- Used by VocabQuizLeaderboard component for filtering leaderboard by level

**Validation Rules**:
- `code` must be one of: "A1", "A2", "B1", "B2", "C1", "C2"
- Levels are sorted by code order (A1, A2, B1, B2, C1, C2)

**Frontend Usage**:
- Fetched on component mount (for vocab-quiz leaderboard)
- Used in VocabQuizLeaderboard component for level selection tabs
- First level (A1) is selected by default

## State Management

### Component State (LeaderboardPage)

**Selected Game State**:
- `selectedGameId` (number | null): Currently selected game ID
- Default: First game's ID (by display_order) on mount

**Games State**:
- `games` (Game[]): Array of all active games
- Fetched on mount
- Sorted by display_order

**Leaderboard State** (per game):
- `leaderboards` (Map<gameId, LeaderboardEntry[]>): Cached leaderboard data per game
- `loadingStates` (Map<gameId, boolean>): Loading state per game
- `errorStates` (Map<gameId, string | null>): Error state per game

**CEFR Levels State**:
- `cefrLevels` (CefrLevel[]): CEFR levels for vocab-quiz leaderboard
- Fetched on mount
- Only used when vocab-quiz tab is selected

### Request Management

**AbortController**:
- One AbortController per game leaderboard request
- Previous request is aborted when switching tabs
- Prevents race conditions when rapidly switching tabs

## Data Flow

1. **Page Load**:
   - Fetch all active games (`GET /api/v1/games`)
   - Fetch CEFR levels (`GET /api/v1/cefr-levels`)
   - Select first game by display_order
   - Fetch leaderboard for selected game

2. **Tab Selection**:
   - User clicks game tab
   - Update `selectedGameId` state
   - Abort previous leaderboard request (if any)
   - Fetch leaderboard for newly selected game
   - Display appropriate component (Leaderboard or VocabQuizLeaderboard)

3. **Special Game (vocab-quiz)**:
   - When vocab-quiz tab is selected
   - Render VocabQuizLeaderboard component
   - Component manages its own CEFR level and translation direction state
   - Component fetches leaderboard via `GET /api/v1/vocab-quiz/leaderboard` with query parameters

## Edge Cases

### Empty States
- **No games available**: Show empty state message, no tabs displayed
- **No leaderboard entries**: Show empty state message for selected game
- **Game leaderboard fetch fails**: Show error message for that game, tabs remain functional

### Loading States
- **Initial load**: Show skeleton loaders for tabs and leaderboard area
- **Tab switch**: Show loading state for newly selected game's leaderboard
- **Rapid tab switching**: Previous requests are aborted, only latest request's response is used

### Error States
- **Games fetch fails**: Show global error, no tabs displayed
- **Individual game leaderboard fails**: Show error for that game, other tabs remain clickable
- **CEFR levels fetch fails**: Vocab-quiz leaderboard may not function, but other games unaffected

