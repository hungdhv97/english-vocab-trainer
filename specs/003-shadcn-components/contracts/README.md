# API Contracts: Update Frontend to Use shadcn Components

**Feature**: Update Frontend to Use shadcn Components  
**Date**: 2025-01-27  
**Phase**: 1 - Design & Contracts

## Overview

This feature is a **frontend-only UI component migration** that does not involve any API contract changes. No new endpoints, request/response formats, or API behaviors are introduced.

## API Contract Changes

**Status**: No API contract changes required

This feature focuses exclusively on:
- Replacing UI components (custom error divs → shadcn Alert)
- Replacing UI components (raw HTML buttons → shadcn Button)
- Updating existing shadcn components to latest versions
- Removing direct Radix UI imports from application code

All existing API endpoints, request/response formats, and backend functionality remain unchanged.

## Existing API Endpoints (Unchanged)

The following API endpoints from existing features remain unchanged:

- `GET /api/v1/games` - Fetch all games
- `GET /api/v1/games/:id/leaderboard` - Fetch leaderboard for a game
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/play/answer` - Submit answer
- `GET /api/v1/levels` - Fetch game levels
- `GET /api/v1/words/random` - Fetch random words
- `POST /api/v1/sessions` - Create game session
- `POST /api/v1/sessions/finish` - Finish game session

## Error Response Format (Unchanged)

Error responses from the API remain unchanged. The UI migration only affects how error messages are **displayed** in the frontend, not how errors are **received** from the API.

Example error response (unchanged):
```json
{
  "error": "Failed to load games",
  "message": "Network error occurred"
}
```

The migration changes how this error is displayed (using shadcn Alert component instead of custom div), but the API response format remains the same.

## Request Format (Unchanged)

All request formats remain unchanged. Form submissions, API calls, and data sending patterns remain exactly as they were before this feature.

## Authentication (Unchanged)

Authentication mechanisms remain unchanged:
- JWT token storage (localStorage)
- Authorization headers
- Login/register endpoints
- Token validation

## Conclusion

This feature requires **no API contract documentation** as it is purely a UI component migration. All API endpoints, request/response formats, and backend functionality remain exactly as they were before this feature.

For API contract reference, see: `backend/docs/openapi.yaml`

