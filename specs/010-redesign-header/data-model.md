# Data Model: Header Redesign

**Feature**: Header Redesign  
**Date**: 2025-11-13  
**Phase**: 1 - Design & Contracts

## Overview

This is a frontend-only UI feature with no database schema changes. The component uses existing data structures and authentication state management.

## Data Entities

### User Profile (Existing)

**Source**: `frontend/src/types/index.ts`

```typescript
interface UserProfile {
  user_id: number;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
  is_complete: boolean;
}
```

**Usage in Header**:
- `display_name`: Displayed as text in user menu (non-clickable)
- `avatar_url`: Used for Avatar indicator image
- `user_id`: Used for routing and API calls

**Fallback Logic**:
- If `display_name` is null/empty: Use username from localStorage
- If `avatar_url` is null/empty: Display user initials (first letter of display_name or username)

### Authentication State (Existing)

**Source**: `frontend/src/lib/api.ts` - `isAuthenticated()` function

**Storage**: localStorage
- `user_id`: User ID string
- `jwt_token`: JWT token (optional, may use HTTP-only cookies)
- `username`: Username string

**Usage in Header**:
- Determines which header elements to display (authenticated vs unauthenticated)
- Triggers profile fetch when authenticated
- Updates header immediately on auth state changes

## Component State

### Header Component State

```typescript
interface HeaderState {
  authenticated: boolean;        // Current authentication status
  profile: UserProfile | null;    // User profile data (if authenticated)
  username: string;               // Fallback username from localStorage
  menuOpen: boolean;              // User menu dropdown open/closed state
}
```

**State Management**:
- Uses React `useState` hooks for local component state
- Listens to `auth-state-changed` custom events for auth updates
- Polls localStorage periodically (300ms interval) as fallback

## Data Flow

### Authentication State Flow

```
User Action (Login/Logout)
  ↓
localStorage updated
  ↓
Custom event 'auth-state-changed' dispatched
  ↓
Header component event listener triggered
  ↓
Header state updated (authenticated, profile)
  ↓
Header re-renders with new elements
```

### Profile Data Flow

```
User authenticated
  ↓
Header component detects authentication
  ↓
Calls getProfile() API function
  ↓
Profile data fetched from backend
  ↓
Profile state updated in Header component
  ↓
Avatar indicator and user menu display profile data
```

## No Database Changes

This feature does not require any database schema modifications. All data used is:
- Existing user profile data (already stored in database)
- Authentication state (stored in localStorage/cookies)
- No new tables, columns, or relationships needed

## Validation Rules

### Display Name Fallback

- If `profile.display_name` is null or empty string:
  - Use `localStorage.getItem('username')` as fallback
  - If username also unavailable, display "User" as final fallback

### Avatar Fallback

- If `profile.avatar_url` is null or empty string:
  - Extract first letter from `profile.display_name` (if available)
  - Otherwise, extract first letter from username
  - Display as uppercase letter in circular badge

### Route Validation

- `/my-progress`: TODO - route needs to be implemented (not part of this feature)
- `/profile`: Existing route, already implemented
- `/`: Home route, already implemented
- `/leaderboard`: Existing route, already implemented

