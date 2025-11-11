# Feature Specification: Session Statistics Page

**Feature Branch**: `008-session-statistics-page`  
**Created**: 2025-01-27  
**Status**: Draft  
**Input**: User description: "View Statistics will show more detail of session game. should have a chart. should view list of question and answer in the session. Click on the word will route to full word detail page. View Statistics should show in another page, not a popup."

## Clarifications

### Session 2025-01-27

- Q: Which chart types should be displayed on the session statistics page? → A: All three (accuracy breakdown + time analysis + performance over time)
- Q: Which fields are mandatory on the word detail page? → A: Core fields mandatory (word text, translations, difficulty level); other fields optional if available (examples, part of speech, phonetic, related words)
- Q: How should the statistics page handle loading while data is fetched? → A: Show skeleton screens with placeholders (skeleton UI matching the final layout for statistics, charts, and questions list)
- Q: How should detailed session data be retrieved from the backend? → A: Single endpoint with optional query parameters (one endpoint that can return full data or partial data based on query parameters)
- Q: What should the performance over time chart show? → A: Both running accuracy and correct/incorrect indicators (dual-axis or two separate charts showing both metrics)

## User Scenarios & Verification *(mandatory)*

### User Story 1 - View Session Statistics on Dedicated Page with Charts (Priority: P1)

A user wants to view detailed statistics for a completed game session on a dedicated page with visual charts. After completing a vocabulary quiz session, they can click "View Statistics" to navigate to a separate page that displays comprehensive session statistics including visual charts showing accuracy breakdown, performance metrics, and time analysis.

**Why this priority**: This is the core user journey that delivers the primary value of the feature. Users need a dedicated page (not a popup) to view detailed statistics with visual representations. This provides a clear, focused view of their performance and enhances the learning experience.

**Manual Verification**: Can be fully verified by: (1) completing a vocabulary quiz session, (2) clicking "View Statistics" button on the completion screen, (3) verifying navigation to a dedicated statistics page (not a popup), (4) verifying that the page displays session overview statistics (score, correct/incorrect counts, accuracy percentage, time elapsed), (5) verifying that three charts are displayed: accuracy breakdown chart (pie/donut), time analysis chart (bar/line), and performance over time chart (line), and (6) verifying that the page is accessible via a unique URL. This delivers a comprehensive, visually-enhanced view of session performance.

**Acceptance Scenarios**:

1. **Given** a user completes a vocabulary quiz session, **When** they click "View Statistics" on the completion screen, **Then** they are navigated to a dedicated statistics page (not a popup) with a unique URL
2. **Given** a user is on the session statistics page, **When** they view the page, **Then** they see session overview statistics including total score, correct answers count, incorrect answers count, accuracy percentage, and time elapsed
3. **Given** a user is on the session statistics page, **When** they view the page, **Then** they see three visual charts: (1) accuracy breakdown chart (pie/donut showing correct vs incorrect answers), (2) time analysis chart (bar/line chart showing time per question or time distribution), and (3) performance over time chart (showing both running accuracy percentage trend and correct/incorrect indicators by question number, displayed as dual-axis chart or two separate charts)
4. **Given** a user navigates to a session statistics page, **When** they view the URL, **Then** the URL contains the session identifier (e.g., `/session/123/statistics`)
5. **Given** a user is on the session statistics page, **When** they refresh the page or share the URL, **Then** the statistics page loads correctly with all data displayed

---

### User Story 2 - View Detailed List of Questions and Answers (Priority: P2)

A user wants to review all questions and their answers from a completed game session. On the statistics page, they can see a detailed list showing each question, all answer options, their selected answer, the correct answer, whether their answer was correct, and the time spent on each question.

**Why this priority**: This provides detailed feedback that helps users understand their mistakes and learn from them. While not essential for basic statistics viewing, it significantly enhances the learning value by allowing users to review specific questions and answers.

**Manual Verification**: Can be fully verified by: (1) navigating to a session statistics page, (2) scrolling to the questions and answers section, (3) verifying that all questions from the session are listed, (4) verifying that each question displays the question text (word), all answer options (a, b, c, d), the user's selected answer, the correct answer, correctness status (correct/incorrect), and time spent, and (5) verifying that questions are displayed in the order they were answered. This delivers detailed feedback for learning and improvement.

**Acceptance Scenarios**:

1. **Given** a user is on the session statistics page, **When** they scroll to the questions section, **Then** they see a list of all questions from the session
2. **Given** a user views a question in the list, **When** they examine the question details, **Then** they see the question text (word), all four answer options (a, b, c, d with text), their selected answer (highlighted or marked), the correct answer (clearly indicated), whether their answer was correct or incorrect, and the time spent on that question
3. **Given** a user views the questions list, **When** they examine the list, **Then** questions are displayed in the order they were answered during the session
4. **Given** a user views a question with an incorrect answer, **When** they examine the question, **Then** both their incorrect answer and the correct answer are clearly displayed and distinguishable
5. **Given** a user views the questions list, **When** they scroll through the list, **Then** all questions from the session are accessible and displayed

---

### User Story 3 - Navigate to Word Detail Page from Statistics (Priority: P3)

A user wants to learn more about a word that appeared in the quiz session. They can click on any word (question text) in the statistics page to navigate to a dedicated word detail page that shows comprehensive information about that word, including translations, examples, difficulty level, and other relevant details.

**Why this priority**: This enhances the learning experience by allowing users to explore words in depth. While not essential for viewing statistics, it provides additional educational value and helps users understand words better. This is a nice-to-have feature that improves the overall learning experience.

**Manual Verification**: Can be fully verified by: (1) navigating to a session statistics page, (2) clicking on a word (question text) in the questions list, (3) verifying navigation to a word detail page, (4) verifying that the word detail page displays mandatory information (word text, translations, difficulty level) and optional information if available (examples, part of speech, phonetic information), and (5) verifying that users can navigate back to the statistics page. This delivers enhanced learning opportunities through detailed word information.

**Acceptance Scenarios**:

1. **Given** a user is on the session statistics page viewing the questions list, **When** they click on a word (question text), **Then** they are navigated to a word detail page for that word
2. **Given** a user is on a word detail page, **When** they view the page, **Then** they see mandatory word information (word text, translations in both languages, difficulty level) and optional information if available (examples of usage, part of speech, phonetic information, related words)
3. **Given** a user is on a word detail page, **When** they want to return to the statistics page, **Then** they can navigate back using a back button or breadcrumb navigation
4. **Given** a user clicks on a word in the statistics page, **When** the word detail page loads, **Then** the URL contains the word identifier (e.g., `/word/123` or `/words/123`)
5. **Given** a user is on a word detail page accessed from statistics, **When** they refresh the page or share the URL, **Then** the word detail page loads correctly with all word information displayed

---

### Edge Cases

- What happens when a session has no answers submitted? The statistics page should display appropriate messaging indicating no answers were submitted, and charts should handle empty data gracefully
- What happens when a session statistics page is accessed for a session that doesn't exist? The system should display an appropriate error message and provide navigation back to a valid page
- What happens when a user tries to access statistics for a session that belongs to another user? The system should prevent unauthorized access and display an appropriate error message
- How does the system handle sessions with incomplete data (e.g., session finished but some answers missing)? The statistics page should display available data and indicate any missing information
- What happens when a word in the questions list no longer exists in the database? The system should display the word text if available, or indicate that word details are unavailable, and handle the click navigation gracefully
- How does the system handle very long sessions with many questions? The questions list should be paginated or virtualized to ensure good performance and usability
- What happens when chart data cannot be loaded or is invalid? Charts should display appropriate fallback content or error messages without breaking the page
- What happens when a user clicks on a word that doesn't have mandatory detail fields (word text, translations, difficulty)? The system must display an appropriate error message indicating that word details are unavailable. If only optional fields are missing, the system should display the available mandatory fields
- How does the system display loading states while fetching session data? The system should display skeleton screens with placeholders that match the final layout structure (overview statistics placeholders, chart placeholders, questions list placeholders) to provide visual feedback during data loading

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a "View Statistics" button or link on the game session completion screen
- **FR-002**: System MUST navigate users to a dedicated statistics page (not a popup) when "View Statistics" is clicked
- **FR-003**: System MUST provide a unique URL route for each session statistics page (e.g., `/session/:sessionId/statistics`)
- **FR-004**: System MUST display session overview statistics on the statistics page including: total score, correct answers count, incorrect answers count, accuracy percentage, and time elapsed
- **FR-005**: System MUST display three visual charts on the statistics page: (1) accuracy breakdown chart (pie/donut chart showing correct vs incorrect answers), (2) time analysis chart (bar chart or line chart showing time spent per question or time distribution), and (3) performance over time chart (showing both running accuracy percentage trend from question 1 to current question and correct/incorrect indicators by question number, displayed as dual-axis chart or two separate charts)
- **FR-006**: System MUST display a detailed list of all questions from the session on the statistics page
- **FR-007**: System MUST display for each question in the list: question text (word), all answer options (a, b, c, d with text), user's selected answer, correct answer, correctness status (correct/incorrect), and time spent on the question
- **FR-008**: System MUST display questions in the order they were answered during the session
- **FR-009**: System MUST make words (question text) in the questions list clickable
- **FR-010**: System MUST navigate users to a word detail page when a word is clicked in the questions list
- **FR-011**: System MUST provide a word detail page that displays mandatory word information: word text, translations (in both languages), and difficulty level. The page MAY display optional information if available: examples of usage, part of speech, phonetic information, and related words
- **FR-012**: System MUST provide navigation back to the statistics page from the word detail page
- **FR-013**: System MUST ensure that session statistics pages are only accessible to the user who created the session (authorization check)
- **FR-014**: System MUST handle cases where session data is incomplete or missing gracefully (display available data, indicate missing information)
- **FR-015**: System MUST provide a single API endpoint to retrieve detailed session data. The endpoint MUST support optional query parameters to return full data (statistics, questions, answers, and related information) or partial data based on requested fields. The endpoint MUST return all required data for the statistics page when called with appropriate parameters
- **FR-016**: System MUST ensure that statistics pages load correctly when accessed directly via URL (including page refresh and shared URLs)
- **FR-017**: System MUST display appropriate error messages when a session does not exist or cannot be accessed
- **FR-021**: System MUST display skeleton screens with placeholders while loading session data. Skeleton UI MUST match the final layout structure (placeholders for overview statistics, charts, and questions list sections)
- **FR-018**: System MUST handle cases where word details are unavailable gracefully. If mandatory fields (word text, translations, difficulty) are unavailable, the system MUST display an appropriate error message. If optional fields are unavailable, the system MUST display available mandatory fields without error
- **FR-019**: System MUST ensure that charts display correctly even when data is minimal or empty (graceful degradation)
- **FR-020**: System MUST ensure that the questions list is performant for sessions with many questions (pagination, virtualization, or efficient rendering)

### Key Entities *(include if feature involves data)*

- **Session Statistics Detail**: Extended session statistics with detailed breakdown. Key attributes: session identifier, total score, correct answers count, incorrect answers count, accuracy percentage, time elapsed, session start time, session end time, level information, translation direction
- **Session Question with Answer**: Detailed question information including user's answer and performance. Key attributes: question identifier, session identifier, question text (word), word identifier, all answer options (a, b, c, d with text and word identifiers), user's selected answer option, correct answer option, correctness status (correct/incorrect), time spent on question (in milliseconds), question order in session
- **Word Detail**: Information about a vocabulary word. Mandatory attributes: word identifier, word text, language code, translations (in target language), difficulty level. Optional attributes (displayed if available): examples of usage, part of speech, phonetic information, concept identifier, related words
- **Chart Data**: Data structure for visual charts. Key attributes: chart type (pie/donut for accuracy breakdown, bar/line for time analysis, dual-axis or combined chart for performance over time), data points, labels, values, colors/styling information. Three charts required: accuracy breakdown (correct vs incorrect), time analysis (time per question or distribution), performance over time (running accuracy percentage trend and correct/incorrect indicators by question number, displayed as dual-axis or two separate charts)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can navigate to the session statistics page from the completion screen in under 2 seconds
- **SC-002**: Session statistics page loads and displays all data (overview statistics, charts, questions list) in under 3 seconds for sessions with up to 20 questions
- **SC-003**: All three visual charts (accuracy breakdown, time analysis, performance over time) are displayed and render correctly for 100% of session statistics pages. Performance over time chart displays both running accuracy percentage trend and correct/incorrect indicators
- **SC-004**: All questions from a session are accurately displayed in the questions list for 100% of completed sessions
- **SC-005**: Users can click on words in the questions list and navigate to word detail pages successfully for 100% of clickable words
- **SC-006**: Word detail pages load and display comprehensive word information in under 2 seconds for 95% of word detail page requests
- **SC-007**: Session statistics pages are accessible via direct URL (including refresh and shared URLs) and load correctly for 100% of valid session identifiers
- **SC-008**: Unauthorized access attempts to session statistics pages are prevented for 100% of unauthorized requests
- **SC-009**: Statistics pages handle edge cases (missing data, empty sessions, invalid sessions) gracefully without errors for 100% of edge case scenarios
- **SC-010**: Questions list displays correctly and remains performant for sessions with up to 50 questions without pagination or performance issues

## Assumptions

- Session data (questions, answers, statistics) is persisted in the database and can be retrieved via API endpoints
- Users are authenticated before accessing session statistics pages (existing authentication system)
- Word detail pages can be implemented as part of this feature or may reference existing word detail functionality
- Chart library or visualization component is available in the frontend framework for rendering charts
- Session identifiers are unique and can be used in URL routes
- Time spent per question data is tracked and stored during the game session
- Word translations and additional word information (examples, difficulty, part of speech, phonetic) are available in the database or can be retrieved via API
- Navigation between statistics page and word detail page maintains user context and allows returning to statistics
- Frontend routing system supports dynamic routes for session statistics pages (e.g., `/session/:sessionId/statistics`)
- Backend API provides a single endpoint with optional query parameters that can return full session data (statistics, questions, answers, and related information) or partial data based on requested fields

## Dependencies

- Existing authentication system for user identification and authorization
- Existing session management system for game session tracking and data retrieval
- Existing word database with word information, translations, and metadata
- Frontend routing system for navigation between pages
- Chart/visualization library for rendering statistical charts
- Backend API endpoint for: retrieving detailed session data (with optional query parameters for full or partial data), retrieving word detail information
- Existing game completion flow that triggers statistics display

## Out of Scope

- Modifying the existing game completion screen beyond adding "View Statistics" navigation (assumes completion screen exists)
- Creating a comprehensive word management system (word detail page may be basic or reference existing functionality)
- Implementing advanced chart types beyond basic statistical visualizations (pie charts, bar charts, line charts)
- Adding comparison features between multiple sessions (single session focus)
- Implementing search or filtering within the questions list (basic list display)
- Adding export or sharing functionality for statistics (view-only feature)
- Modifying existing session data structure or database schema (assumes data is available)
- Implementing real-time updates for statistics pages (static data display)
- Adding editing or annotation features for questions and answers (read-only view)
