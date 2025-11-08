# Research: Fix Session Tag Missing Error

## Research Tasks

### 1. Cookie SameSite Behavior in Development vs Production

**Question**: How should cookies be configured for cross-origin requests in development (HTTP) vs production (HTTPS)?

**Research Findings**:

1. **SameSite Attribute Values**:
   - `SameSite=Strict`: Cookie only sent in first-party context (same site)
   - `SameSite=Lax`: Cookie sent in first-party and top-level navigation contexts
   - `SameSite=None`: Cookie sent in all contexts (cross-site requests)

2. **Secure Flag Requirement**:
   - `SameSite=None` requires `Secure=true` in most browsers (Chrome, Firefox, Safari)
   - Exception: Modern browsers allow `SameSite=None` without `Secure=true` for `localhost` and `127.0.0.1` in development
   - Production environments on HTTPS must use `Secure=true` with `SameSite=None`

3. **Development Environment (HTTP)**:
   - Frontend: `localhost:5173` (Vite dev server)
   - Backend: `localhost:8180` (Go API server)
   - Cross-origin requests require `SameSite=None`
   - Browsers allow `SameSite=None` without `Secure=true` for localhost

4. **Production Environment (HTTPS)**:
   - Requires `SameSite=None` with `Secure=true` for cross-site cookies
   - No exceptions - Secure flag is mandatory

**Decision**: 
- Development: Use `SameSite=None` with `Secure=false` (browsers allow this for localhost)
- Production: Use `SameSite=None` with `Secure=true` (required for HTTPS)

**Rationale**: 
- Provides consistent behavior across environments
- Works with cross-origin architecture (frontend/backend on different ports/domains)
- Leverages browser exceptions for localhost development
- Meets security requirements for production

**Alternatives Considered**:
- **SameSite=Lax with Secure=false**: Would not work for cross-origin requests in development
- **SameSite=Strict**: Too restrictive, would break cross-origin cookie sharing
- **Proxy frontend through backend**: Adds complexity, not necessary with proper cookie configuration

### 2. Session Creation Timing and Race Conditions

**Question**: How to ensure session creation completes before answer submissions?

**Research Findings**:

1. **Asynchronous Session Creation**:
   - Session creation is an async HTTP request (`createSession` API call)
   - Cookie is set by server via `Set-Cookie` header in response
   - Browser must receive and store cookie before subsequent requests

2. **Race Condition Problem**:
   - Frontend was calling `createSession` without awaiting
   - Answer submissions could occur before cookie was set
   - Backend rejected requests with "missing session_tag" error

3. **Frontend State Management Patterns**:
   - **State-based approach**: Track session readiness with React state
   - **Promise-based approach**: Await session creation promise before allowing submissions
   - **Combined approach**: Use state + promise for better UX (loading states, error handling)

**Decision**: 
- Use state-based approach with `sessionReady` boolean state
- Await `createSession` promise before setting `sessionReady = true`
- Disable answer input until `sessionReady === true`
- Show loading state while session is being created
- Display error message if session creation fails

**Rationale**:
- Prevents race conditions by ensuring session exists before answers
- Provides better UX with loading and error states
- Simple implementation using React hooks (useState, useEffect)
- No additional dependencies required

**Alternatives Considered**:
- **Optimistic UI**: Allow answers immediately, retry if session fails
  - Rejected: Could lead to data loss if session creation fails
- **Session polling**: Poll for session creation status
  - Rejected: Unnecessary complexity, session creation is fast (<100ms)
- **Session in URL/query param**: Pass session_tag as URL parameter
  - Rejected: Less secure, exposes session in URLs, violates cookie-based design

### 3. Error Handling for Session Creation Failures

**Question**: How should the system handle session creation failures?

**Research Findings**:

1. **Failure Scenarios**:
   - Network errors (offline, timeout)
   - Server errors (database connection, validation errors)
   - Authentication errors (user not logged in)

2. **User Experience Considerations**:
   - Users should see clear error messages
   - Users should be able to retry without data loss
   - System should prevent further actions until session is created

**Decision**:
- Display error message in UI if session creation fails
- Provide "Go Back" button to reset and retry
- Prevent answer submissions until session is successfully created
- Reset session state when level is changed

**Rationale**:
- Clear feedback helps users understand what went wrong
- Retry mechanism allows recovery from transient errors
- Prevents partial state (answers without session)

**Alternatives Considered**:
- **Silent retry**: Automatically retry session creation
  - Rejected: Could mask persistent errors, confusing for users
- **Fallback to guest mode**: Allow play without session
  - Rejected: Violates data model requirements (sessions are required)

## Implementation Decisions Summary

| Decision | Rationale | Alternative Rejected |
|----------|-----------|---------------------|
| Cookie: Development `SameSite=None, Secure=false` | Browsers allow this for localhost | SameSite=Lax (wouldn't work cross-origin) |
| Cookie: Production `SameSite=None, Secure=true` | Required for HTTPS cross-site cookies | SameSite=Lax (wouldn't work cross-origin) |
| Frontend: State-based session readiness | Prevents race conditions, better UX | Optimistic UI (risk of data loss) |
| Error handling: User-visible errors with retry | Clear feedback, recovery mechanism | Silent retry (masks errors) |

## References

- [MDN: SameSite Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)
- [Chrome: Cookies SameSite Attribute](https://www.chromium.org/updates/same-site)
- [React: useState Hook](https://react.dev/reference/react/useState)
- [React: useEffect Hook](https://react.dev/reference/react/useEffect)

