# API Contracts: Header Redesign

**Feature**: Header Redesign  
**Date**: 2025-11-13  
**Phase**: 1 - Design & Contracts

## Overview

This is a frontend-only UI feature. No new API endpoints are required. The header component uses existing API functions and routes.

## Existing API Functions Used

### Authentication

**Function**: `isAuthenticated(): boolean`  
**Source**: `frontend/src/lib/api.ts`

**Description**: Checks if user is currently authenticated by checking localStorage for `user_id`.

**Returns**: `boolean` - true if user is authenticated, false otherwise

**Usage**: Header component uses this to determine which elements to display.

---

### User Profile

**Function**: `getProfile(): Promise<UserProfile>`  
**Source**: `frontend/src/lib/api.ts`

**Endpoint**: `GET /api/v1/profile`  
**Authentication**: Required (JWT token in cookie or Authorization header)

**Response**:
```typescript
{
  user_id: number;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
  is_complete: boolean;
}
```

**Usage**: Header component fetches user profile when authenticated to display avatar and display name.

**Error Handling**: Silently fails if profile doesn't exist (user might not have completed profile setup).

---

## Existing Routes Used

### Frontend Routes (React Router)

| Route | Component | Authentication | Usage in Header |
|-------|-----------|----------------|-----------------|
| `/` | HomePage | Public | Logo and Games links route here |
| `/leaderboard` | LeaderboardPage | Public | Leaderboard link routes here |
| `/login` | Login | Public | Login link routes here |
| `/register` | Register | Public | Sign Up link routes here |
| `/profile` | ProfilePage | Required | Profile menu item routes here |
| `/my-progress` | TODO | Required | My Progress menu item routes here (needs implementation) |

## No New API Contracts

This feature does not introduce any new API endpoints or modify existing API contracts. All functionality uses:
- Existing authentication state management
- Existing user profile API
- Existing frontend routing

## Event Contracts

### Custom Events

**Event**: `auth-state-changed`  
**Type**: `Event` (no payload)  
**Dispatched by**: Login, Register, Logout components  
**Listened by**: Header component

**Usage**: Notifies Header component when authentication state changes so it can update its display immediately.

---

**Event**: `profile-updated`  
**Type**: `Event` (no payload)  
**Dispatched by**: Profile page after profile updates  
**Listened by**: Header component

**Usage**: Notifies Header component when user profile is updated so it can refresh profile data.

