# Feature Specification: Fix Session Tag Missing Error in Vocab Quiz

**Feature Branch**: `005-fix-session-tag`  
**Created**: 2025-01-27  
**Status**: Draft  
**Input**: User description: "fix the issue, when i play vocab quiz then answer the question then the api /answer response is {"error":"missing session_tag"}. please fix to make answer can work"

## User Scenarios & Verification *(mandatory)*

### User Story 1 - Answer Questions in Vocab Quiz (Priority: P1)

A user plays the vocabulary quiz game, selects a level, and answers questions. When they submit an answer, the system should successfully process it and provide feedback without errors.

**Why this priority**: This is the core functionality of the vocab quiz game. Without working answers, the game is completely non-functional, making this the highest priority issue to fix.

**Manual Verification**: Can be fully verified by:
1. Starting the vocab quiz game
2. Selecting a level
3. Answering a question
4. Verifying that the answer is accepted and feedback is shown without any "missing session_tag" error

**Acceptance Scenarios**:

1. **Given** a user is logged in and on the vocab quiz game page, **When** they select a level and answer the first question, **Then** the answer is successfully submitted and feedback is displayed
2. **Given** a user has started a quiz session, **When** they answer multiple questions in sequence, **Then** all answers are successfully processed without session errors
3. **Given** a user is playing the quiz, **When** they submit an answer, **Then** the system correctly associates the answer with the session and updates scores

---

### Edge Cases

- What happens when the session creation fails? The user should see an appropriate error message
- How does the system handle rapid successive answer submissions? Answers should be processed in order without losing session context
- What happens if the session cookie expires during gameplay? The system should either maintain the session or provide clear feedback to the user
- How does the system handle network interruptions during session creation? The user should be able to retry without data inconsistency

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST ensure session is created and cookie is set before allowing answer submissions
- **FR-002**: System MUST wait for session creation to complete before processing answers
- **FR-003**: System MUST properly set session_tag cookie that can be read by subsequent API requests
- **FR-004**: System MUST handle cookie settings appropriately for both development (HTTP) and production (HTTPS) environments
- **FR-005**: System MUST provide clear error messages if session creation fails
- **FR-006**: System MUST maintain session context throughout the quiz gameplay session

### Key Entities

- **Game Session**: Represents an active quiz session for a user and level, identified by session_tag
- **Answer Submission**: Represents a user's answer to a quiz question, associated with a session_tag

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of answer submissions during vocab quiz gameplay succeed without "missing session_tag" errors
- **SC-002**: Users can complete a full quiz session (answer multiple questions) without session-related interruptions
- **SC-003**: Session creation completes successfully before the first answer submission in 100% of quiz sessions
- **SC-004**: System works correctly in both development (localhost HTTP) and production (HTTPS) environments

## Assumptions

- The backend API `/session` endpoint correctly creates sessions and sets cookies when called properly
- The frontend has proper CORS configuration to send and receive cookies
- Users are authenticated before starting a quiz session
- The issue is primarily related to timing (session not created before answer submission) and/or cookie configuration (SameSite/Secure settings)

## Dependencies

- Backend session creation endpoint (`/session`)
- Backend answer submission endpoint (`/answer`)
- Cookie handling in browser and backend
- CORS configuration for cookie support
