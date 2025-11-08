# API Contracts: Fix Session Tag Missing Error

## Overview

This bug fix does not introduce any API contract changes. The existing API endpoints remain unchanged. Only the implementation behavior is modified (cookie configuration and frontend session management).

## Existing API Endpoints

### POST /api/v1/session

**Description**: Creates a new game session and sets the `session_tag` cookie.

**Request**:
```json
{
  "user_id": 1,
  "level_id": 1
}
```

**Response** (200 OK):
```json
{
  "session_tag": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Cookies Set**:
- `session_tag`: UUID value (HttpOnly, Path=/, SameSite=None, Secure=false for dev, Secure=true for prod)

**Behavior Changes**:
- Cookie `SameSite` and `Secure` attributes are now environment-aware:
  - Development: `SameSite=None, Secure=false`
  - Production: `SameSite=None, Secure=true`

### POST /api/v1/answer

**Description**: Submits an answer and returns feedback. Requires `session_tag` cookie.

**Request**:
```json
{
  "word_id": 1,
  "user_id": 1,
  "language_code": "vi",
  "user_answer": "táo"
}
```

**Response** (200 OK):
```json
{
  "correct_answer": "táo",
  "is_correct": true,
  "score": 10,
  "target": 5,
  "total_score": 50
}
```

**Error Response** (400 Bad Request):
```json
{
  "error": "missing session_tag"
}
```

**Behavior Changes**:
- No changes to API contract
- Error handling remains the same
- Cookie must be present (enforced by frontend session management)

### POST /api/v1/finish

**Description**: Marks the current session as finished. Requires `session_tag` cookie.

**Request**: None (cookie-based)

**Response** (200 OK):
```json
{
  "status": "finished"
}
```

**Error Response** (400 Bad Request):
```json
{
  "error": "missing session_tag"
}
```

**Behavior Changes**:
- No changes to API contract

## OpenAPI Specification

The complete OpenAPI specification is available at:
- `backend/docs/openapi.yaml`

The specification includes:
- Endpoint definitions
- Request/response schemas
- Error responses
- Cookie authentication scheme

## Contract Compliance

This bug fix maintains 100% backward compatibility:
- ✅ No new endpoints added
- ✅ No existing endpoints removed
- ✅ No request/response schema changes
- ✅ No authentication method changes
- ✅ Only implementation behavior changes (cookie configuration)

## Testing

See `quickstart.md` for manual testing procedures that verify:
- Session creation and cookie setting
- Answer submission with session cookie
- Error handling for missing session

## References

- OpenAPI Specification: `backend/docs/openapi.yaml`
- Backend Handler: `backend/internal/modules/play/handler/http.go`
- Frontend API Client: `frontend/src/lib/api.ts`

