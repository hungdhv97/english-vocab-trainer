# Feature Specification: Vocab Quiz Game Redesign

**Feature Branch**: `006-vocab-quiz-redesign`  
**Created**: 2025-01-27  
**Status**: Draft  
**Input**: User description: "redesign vocab quiz game - when i click play game then will go game type choose level A1 A2,..., after choosing then choose en to vi or vi to en, after choosing then go to play game page, with random 20 questions with a b c d answers, if en to vi, question is en and answer is vi, if vi to en, qusestion is vi and answer is en. list of questions will based on level type, the listing will be included this level type and previous level type questions (eg if choose A2 then the question will be included A2 and A1). remember scoring and statistic for each game session."

## User Scenarios & Verification *(mandatory)*

### User Story 1 - Complete Vocab Quiz Game Session (Priority: P1)

A user wants to play a vocabulary quiz game to test their English-Vietnamese translation skills. They click "Play Game" on the vocabulary quiz game card, select a difficulty level (A1, A2, etc.), choose a translation direction (English to Vietnamese or Vietnamese to English), and then answer 20 multiple-choice questions. The system tracks their score and statistics throughout the session.

**Why this priority**: This is the core user journey that delivers the primary value of the vocabulary quiz game. Without this complete flow, users cannot engage with the game's main functionality. This story encompasses the essential gameplay experience from start to finish.

**Manual Verification**: Can be fully verified by: (1) clicking "Play Game" on the vocab quiz game card, (2) selecting a level (e.g., A2), (3) selecting a translation direction (e.g., English to Vietnamese), (4) answering all 20 multiple-choice questions, (5) verifying that questions match the selected direction (English words with Vietnamese answer options), (6) verifying that questions include words from the selected level and all previous levels (A2 includes A2 and A1), (7) verifying that score updates after each answer, and (8) verifying that session statistics are recorded. This delivers a complete, playable quiz experience.

**Acceptance Scenarios**:

1. **Given** a user is on the homepage and clicks "Play Game" on the Vocabulary Quiz game card, **When** they are authenticated, **Then** they are navigated to the level selection page showing available levels (A1, A2, etc.)
2. **Given** a user is on the level selection page, **When** they select a level (e.g., A2), **Then** they are navigated to the translation direction selection page
3. **Given** a user is on the translation direction selection page, **When** they select a direction (e.g., English to Vietnamese), **Then** they are navigated to the game page with 20 random multiple-choice questions
4. **Given** a user is playing a quiz with English to Vietnamese direction, **When** they view a question, **Then** the question displays an English word and four answer options (a, b, c, d) in Vietnamese
5. **Given** a user is playing a quiz with Vietnamese to English direction, **When** they view a question, **Then** the question displays a Vietnamese word and four answer options (a, b, c, d) in English
6. **Given** a user selects level A2, **When** questions are generated, **Then** the questions include words from level A2 and all previous levels (A1)
7. **Given** a user answers a question, **When** they submit their answer, **Then** the system provides immediate feedback (correct/incorrect), updates their score, and proceeds to the next question
8. **Given** a user completes all 20 questions, **When** the game session ends, **Then** the system displays final score and session statistics, and saves the session data

---

### User Story 2 - View Game Session Statistics (Priority: P2)

A user wants to review their performance after completing a vocabulary quiz session. They can see their final score, number of correct answers, number of incorrect answers, accuracy percentage, and time taken to complete the quiz.

**Why this priority**: While not essential for gameplay, statistics provide valuable feedback that helps users track their progress and identify areas for improvement. This enhances the learning experience and encourages continued engagement with the game.

**Manual Verification**: Can be fully verified by: (1) completing a quiz session, (2) viewing the session completion screen, and (3) verifying that statistics display correctly (total score, correct answers count, incorrect answers count, accuracy percentage, time elapsed). This delivers valuable feedback to users about their performance.

**Acceptance Scenarios**:

1. **Given** a user completes all 20 questions in a quiz session, **When** the game ends, **Then** the system displays session statistics including total score, correct answers count, incorrect answers count, accuracy percentage, and time taken
2. **Given** a user views session statistics, **When** they review the data, **Then** all statistics are accurate and match their actual performance during the session
3. **Given** a user completes a session, **When** the session data is saved, **Then** the statistics are persisted and can be retrieved for future reference (e.g., history view)

---

### User Story 3 - Navigate Between Game Selection Stages (Priority: P2)

A user wants to change their selections during game setup. They can go back from the translation direction selection to level selection, or from the game page back to previous selection screens, without losing their progress or requiring them to restart from the homepage.

**Why this priority**: This improves user experience by allowing users to correct their choices or explore different options without friction. While not critical for core functionality, it significantly enhances usability and reduces frustration.

**Manual Verification**: Can be fully verified by: (1) selecting a level and proceeding to direction selection, (2) clicking a back button to return to level selection, (3) selecting a different level, (4) proceeding to direction selection again, and (5) verifying that navigation works smoothly without errors. This delivers a flexible, user-friendly navigation experience.

**Acceptance Scenarios**:

1. **Given** a user is on the translation direction selection page, **When** they click a back button, **Then** they are returned to the level selection page
2. **Given** a user is on the game page, **When** they click a back button before starting the quiz, **Then** they are returned to the translation direction selection page
3. **Given** a user navigates back and changes their level selection, **When** they proceed to the game page again, **Then** the new level selection is used to generate questions

---

### Edge Cases

- What happens when a selected level has no words available? The system should display an appropriate error message and allow the user to select a different level
- What happens when there are fewer than 20 words available for a level (including previous levels)? The system should use all available words and inform the user that fewer than 20 questions are available
- How does the system handle rapid answer submissions? The system should process answers in order and prevent duplicate submissions for the same question
- What happens if a user's session expires during gameplay? The system should either maintain the session or provide clear feedback and allow the user to restart
- What happens when multiple choice options are generated? The system must ensure that exactly one option is correct and the other three are plausible but incorrect distractors
- How does the system handle questions when translation direction changes mid-session? Translation direction should be locked at session start and cannot be changed during gameplay
- What happens if a user closes the browser during a game session? The system should save progress up to the last answered question when the session is properly closed

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a level selection page after user clicks "Play Game" on the Vocabulary Quiz game card
- **FR-002**: System MUST display available levels using CEFR level codes (A1, A2, B1, B2, C1, C2) or equivalent level naming convention
- **FR-003**: System MUST navigate to translation direction selection page after user selects a level
- **FR-004**: System MUST provide two translation direction options: "English to Vietnamese" and "Vietnamese to English"
- **FR-005**: System MUST navigate to game page after user selects a translation direction
- **FR-006**: System MUST generate exactly 20 random questions for each game session
- **FR-007**: System MUST display questions as multiple-choice with exactly four options labeled a, b, c, and d
- **FR-008**: System MUST display English words as questions when "English to Vietnamese" direction is selected
- **FR-009**: System MUST display Vietnamese words as questions when "Vietnamese to English" direction is selected
- **FR-010**: System MUST display Vietnamese words as answer options when "English to Vietnamese" direction is selected
- **FR-011**: System MUST display English words as answer options when "Vietnamese to English" direction is selected
- **FR-012**: System MUST include questions from the selected level and all previous levels (e.g., A2 includes A2 and A1)
- **FR-013**: System MUST ensure exactly one correct answer option per question
- **FR-014**: System MUST generate three incorrect but plausible distractor options for each question
- **FR-015**: System MUST provide immediate feedback after each answer submission (correct or incorrect indication)
- **FR-016**: System MUST update and display the user's score after each answer
- **FR-017**: System MUST track session statistics including: total score, number of correct answers, number of incorrect answers, accuracy percentage, and time elapsed
- **FR-018**: System MUST display session statistics upon game completion
- **FR-019**: System MUST persist session data including score, statistics, level, translation direction, and all question-answer pairs
- **FR-020**: System MUST allow users to navigate back from translation direction selection to level selection
- **FR-021**: System MUST allow users to navigate back from game page to previous selection screens before starting the quiz
- **FR-022**: System MUST prevent answer submission for the same question multiple times
- **FR-023**: System MUST handle cases where fewer than 20 words are available for a level by using all available words and informing the user
- **FR-024**: System MUST validate that selected level exists and has associated words before starting a game session

### Key Entities *(include if feature involves data)*

- **Game Session**: Represents a single vocabulary quiz gameplay session. Key attributes: session identifier, user identifier, selected level, translation direction (en-to-vi or vi-to-en), start timestamp, end timestamp, total score, number of questions answered, number of correct answers, number of incorrect answers, accuracy percentage, time elapsed
- **Question**: Represents a single quiz question within a game session. Key attributes: question identifier, session identifier, word identifier (the word being questioned), question text (in source language), four answer options (a, b, c, d), correct answer option identifier, user's selected answer, whether answer was correct, points awarded
- **Level**: Represents a difficulty level for vocabulary words. Key attributes: level code (e.g., A1, A2), level name, description, difficulty classification, hierarchy/ordering to determine which previous levels to include
- **Word**: Represents a vocabulary word that can be used in quiz questions. Key attributes: word identifier, concept identifier, language code (en or vi), word text, associated level, difficulty classification
- **Session Statistics**: Aggregated data about a game session. Key attributes: session identifier, total score, correct answers count, incorrect answers count, accuracy percentage (correct answers / total questions), average time per question, total time elapsed

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the full quiz game flow (level selection → direction selection → 20 questions → results) in under 5 minutes
- **SC-002**: 95% of quiz sessions successfully generate and display 20 questions without errors
- **SC-003**: Users can answer all 20 questions with response time under 2 seconds per question for the interface (excluding thinking time)
- **SC-004**: Session statistics are accurately calculated and displayed for 100% of completed game sessions
- **SC-005**: System correctly includes questions from selected level and all previous levels for 100% of game sessions
- **SC-006**: Multiple choice questions display exactly one correct answer and three plausible distractors for 100% of questions
- **SC-007**: Translation direction (en-to-vi or vi-to-en) is correctly applied to questions and answers for 100% of game sessions
- **SC-008**: All session data (score, statistics, questions, answers) is persisted successfully for 100% of completed game sessions
- **SC-009**: Users can navigate back between selection screens without errors in 100% of navigation attempts
- **SC-010**: Game sessions handle edge cases (insufficient words, session expiration, rapid submissions) gracefully without crashing or data loss

## Assumptions

- Levels follow CEFR naming convention (A1, A2, B1, B2, C1, C2) or a similar hierarchical structure where each level includes content from previous levels
- The word database contains sufficient words for each level to generate quiz questions (ideally 20+ words per level, but system handles cases with fewer words)
- Words are properly tagged with level information and language codes (en for English, vi for Vietnamese)
- Translation relationships between English and Vietnamese words are established through concept identifiers or similar linking mechanism
- Users are authenticated before starting a game session (existing authentication system)
- Session management infrastructure exists to track game sessions and persist data
- Multiple choice distractors can be generated from other words in the same level or related levels to ensure plausibility
- Score calculation follows existing scoring rules from level configuration, adapted for multiple-choice format
- Time tracking uses client-side timers that are synchronized with server-side session timestamps
- Navigation between screens maintains user selections in browser state or URL parameters until game session starts

## Dependencies

- Existing authentication system for user identification
- Existing word database with level classifications and language codes
- Existing session management system for game session tracking
- Existing scoring configuration system for level-based scoring rules
- Frontend routing system for navigation between game selection and gameplay screens
- Backend API endpoints for: level retrieval, word/question generation, answer submission, session creation and completion, statistics calculation

## Out of Scope

- Changing existing level structure or database schema for levels (assumes levels can be mapped to A1/A2 naming)
- Modifying authentication or user management systems
- Adding new game types beyond vocabulary quiz
- Implementing leaderboards or social features (existing leaderboard system may be used)
- Adding hints or explanations for incorrect answers (may be future enhancement)
- Supporting more than two languages (currently English and Vietnamese only)
- Allowing users to customize number of questions per session (fixed at 20 questions)
- Implementing adaptive difficulty or personalized question selection algorithms
- Adding audio pronunciation features for words
- Supporting offline gameplay or mobile app versions
