# Quickstart: Fix Session Tag Missing Error

## Overview

This guide provides manual testing steps to verify the fix for the "missing session_tag" error in the vocab quiz game.

## Prerequisites

1. Development environment set up and running:
   - Backend API server on `http://localhost:8180`
   - Frontend dev server on `http://localhost:5173`
   - PostgreSQL database running
   - User account created and logged in

2. Browser developer tools open (F12) to inspect:
   - Network requests
   - Cookies
   - Console logs

## Manual Testing Steps

### Test 1: Session Creation and Cookie Setting

**Objective**: Verify that session is created and cookie is set correctly.

**Steps**:
1. Navigate to vocab quiz game: `http://localhost:5173/games/vocab-quiz`
2. Select a level
3. Open browser developer tools → Network tab
4. Filter for "session" requests
5. Verify:
   - `POST /api/v1/session` request is made
   - Response status is 200
   - Response contains `{"session_tag": "<uuid>"}`
   - Response headers include `Set-Cookie` header with `session_tag` cookie
   - Cookie has correct attributes:
     - `SameSite=None` (development)
     - `Secure=false` (development)
     - `HttpOnly=true`
     - `Path=/`

**Expected Result**: 
- Session is created successfully
- Cookie is set in browser
- Cookie attributes are correct for development environment

### Test 2: Answer Submission After Session Creation

**Objective**: Verify that answers can be submitted after session is created.

**Steps**:
1. Complete Test 1 (session created)
2. Wait for loading to complete (session ready)
3. Enter an answer in the input field
4. Submit the answer
5. Open browser developer tools → Network tab
6. Verify:
   - `POST /api/v1/answer` request is made
   - Request includes `session_tag` cookie in Cookie header
   - Response status is 200
   - Response contains answer feedback (correct_answer, is_correct, score, target)

**Expected Result**:
- Answer is submitted successfully
- No "missing session_tag" error
- Answer feedback is displayed correctly

### Test 3: Multiple Answers in Sequence

**Objective**: Verify that multiple answers can be submitted in sequence without session errors.

**Steps**:
1. Complete Test 2 (first answer submitted)
2. Submit 5-10 additional answers
3. Verify:
   - All answer submissions succeed
   - No "missing session_tag" errors
   - Session cookie persists across requests
   - Scores and targets update correctly

**Expected Result**:
- All answers are processed successfully
- Session context is maintained throughout gameplay
- No session-related errors

### Test 4: Session Creation Failure Handling

**Objective**: Verify error handling when session creation fails.

**Steps**:
1. Stop backend server (simulate network error)
2. Navigate to vocab quiz game
3. Select a level
4. Verify:
   - Loading state is shown
   - Error message is displayed: "Error: Failed to create session"
   - "Go Back" button is available
   - Answer input is disabled

**Expected Result**:
- User sees clear error message
- User can retry by going back and selecting level again
- No partial state (answers cannot be submitted without session)

### Test 5: Cookie Configuration in Development

**Objective**: Verify cookie settings work correctly in development environment.

**Steps**:
1. Complete Test 1 (session created)
2. Open browser developer tools → Application tab → Cookies
3. Verify cookie `session_tag`:
   - Domain: `localhost`
   - Path: `/`
   - SameSite: `None` (or `None` in Chrome DevTools)
   - Secure: `false` (development)
   - HttpOnly: `true`

**Expected Result**:
- Cookie is set with correct attributes for development
- Cookie is accessible for cross-origin requests (frontend:5173 → backend:8180)

### Test 6: Session Reset and Retry

**Objective**: Verify that session can be reset and recreated.

**Steps**:
1. Complete Test 2 (answer submitted)
2. Click "Go Back" button (reset session)
3. Select level again
4. Verify:
   - New session is created
   - New `session_tag` cookie is set
   - Answers can be submitted with new session

**Expected Result**:
- Session is properly reset
- New session is created successfully
- No conflicts with previous session

## Verification Checklist

- [ ] Session creation completes before answer submissions
- [ ] Cookie is set with correct attributes for development
- [ ] Answers can be submitted without "missing session_tag" error
- [ ] Multiple answers work in sequence
- [ ] Error handling works for session creation failures
- [ ] Session can be reset and recreated
- [ ] Loading states are displayed correctly
- [ ] Error messages are user-friendly

## Troubleshooting

### Issue: Cookie not being set

**Symptoms**: Cookie not visible in browser developer tools

**Possible Causes**:
1. CORS configuration not allowing credentials
2. Cookie attributes incorrect
3. Browser blocking cookies

**Solutions**:
1. Verify CORS middleware includes `Access-Control-Allow-Credentials: true`
2. Check cookie attributes match development environment requirements
3. Check browser settings (cookies enabled, not in incognito mode)

### Issue: "missing session_tag" error still occurs

**Symptoms**: Error persists after fix

**Possible Causes**:
1. Frontend not awaiting session creation
2. Cookie not being sent with requests
3. Backend not reading cookie correctly

**Solutions**:
1. Verify `sessionReady` state is set to `true` before answer submissions
2. Check `credentials: 'include'` in fetch requests
3. Verify backend reads cookie from `c.Request.Cookie("session_tag")`

### Issue: Session creation fails

**Symptoms**: Error message displayed, session not created

**Possible Causes**:
1. Backend server not running
2. Database connection error
3. Invalid user_id or level_id

**Solutions**:
1. Verify backend server is running on port 8180
2. Check database connection and migrations
3. Verify user is logged in and level exists

## Production Testing

**Note**: For production testing, verify cookie settings:
- `SameSite=None` with `Secure=true` (required for HTTPS)
- Cookie works across different domains (if frontend and backend are on different domains)

## Success Criteria

All tests pass when:
- ✅ 100% of answer submissions succeed without "missing session_tag" errors
- ✅ Session creation completes before first answer submission
- ✅ Error handling provides clear feedback to users
- ✅ System works correctly in both development and production environments

