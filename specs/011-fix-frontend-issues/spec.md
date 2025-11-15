# Feature Specification: Frontend UI/UX Fixes

**Feature Branch**: `011-fix-frontend-issues`  
**Created**: 2025-11-14  
**Status**: Draft  
**Input**: User description: "fix frontend issues - responsive issue, total score to total question, time format, game routing, answer blur"

## User Scenarios & Verification *(mandatory)*

### User Story 1 - Mobile Responsive Header (Priority: P1)

A mobile user navigates to the application and expects the header to display properly with all navigation elements accessible. The menu button should be visible on mobile devices, and action buttons should be arranged in a single row without wrapping or overlapping.

**Why this priority**: The header is the primary navigation component visible on every page. A broken header on mobile devices (which represent a significant portion of users) prevents access to core features and creates a poor first impression. This is critical for user experience and application accessibility.

**Manual Verification**: Can be fully verified by opening the application on a mobile device or mobile viewport (width < 768px), observing the header displays correctly with a menu button visible and all buttons arranged in a single row without overflow.

**Acceptance Scenarios**:

1. **Given** a user opens the application on a mobile device (width < 768px), **When** the page loads, **Then** the header displays a menu button that is visible and clickable
2. **Given** a user is viewing the header on mobile, **When** they view the right-side actions (mode toggle, auth buttons), **Then** all buttons are arranged in a single row without wrapping to multiple lines
3. **Given** a user is viewing the header on mobile, **When** they observe the navigation links, **Then** the links remain accessible and do not overlap with other header elements

---

### User Story 2 - Leaderboard Tab Navigation (Priority: P1)

A user viewing the leaderboard page on a mobile or tablet device expects to easily switch between different game leaderboards without horizontal scrolling or tabs overflowing the viewport.

**Why this priority**: The leaderboard page is a key engagement feature where users compare their performance. If the game tabs overflow on mobile/tablet devices, users cannot access all games' leaderboards, breaking core functionality. This directly impacts user engagement and competitive features.

**Manual Verification**: Can be fully verified by opening the leaderboard page on mobile (width < 768px) and tablet (width 768px-1024px) devices, observing all game tabs are accessible without horizontal scrolling, using either a dropdown selector or wrapped tab layout.

**Acceptance Scenarios**:

1. **Given** a user opens the leaderboard page on a mobile device, **When** the page loads with multiple games (5+ games), **Then** all game tabs are accessible without horizontal scrolling
2. **Given** a user is viewing the leaderboard on a tablet device, **When** they view the game selection interface, **Then** all games are visible and selectable through either wrapped tabs or a dropdown menu
3. **Given** a user selects a game from the tab interface, **When** they click or tap the selection, **Then** the corresponding leaderboard displays without layout issues

---

### User Story 3 - Content Padding Consistency (Priority: P2)

A user navigating between different pages (login, signup, vocab selection, quiz results, statistics, word detail) expects consistent spacing and padding so content doesn't touch the edge of the screen, especially on mobile devices.

**Why this priority**: Inconsistent padding creates a jarring user experience and makes content harder to read, especially on smaller screens. While not breaking functionality, it significantly impacts perceived quality and user comfort. This is important for user retention and professional appearance.

**Manual Verification**: Can be fully verified by navigating through all listed pages (login, signup, vocab CEFR selection, translation direction, quiz results, view statistics, view word detail) and confirming each has consistent horizontal padding (px-4 or equivalent) so content doesn't touch screen edges.

**Acceptance Scenarios**:

1. **Given** a user navigates to the login page, **When** the page renders, **Then** the form content has horizontal padding (approximately 1rem/16px) and doesn't touch the screen edges
2. **Given** a user navigates to the signup page, **When** the page renders, **Then** the form content has horizontal padding and doesn't touch the screen edges
3. **Given** a user is selecting CEFR level or translation direction for vocab quiz, **When** the selection interface renders, **Then** the content has horizontal padding and doesn't touch the screen edges
4. **Given** a user completes a quiz, **When** the results screen displays, **Then** the results content has horizontal padding and doesn't touch the screen edges
5. **Given** a user views statistics or word details, **When** these pages render, **Then** the content has horizontal padding and doesn't touch the screen edges

---

### User Story 4 - Answer Text Display (Priority: P1)

A user answering quiz questions with longer answer text expects all answer options to display fully within their buttons without text overflow or truncation, ensuring readability across all screen sizes.

**Why this priority**: If answer text is cut off or overflows its container, users cannot make informed choices during quizzes. This directly breaks core gameplay functionality and may cause users to select wrong answers due to incomplete information. This is critical for quiz integrity.

**Manual Verification**: Can be fully verified by starting a quiz with questions containing long answer options (20+ characters), observing all answer text displays fully within buttons with proper text wrapping on mobile, tablet, and desktop viewports.

**Acceptance Scenarios**:

1. **Given** a user is viewing a quiz question with long answer options, **When** the answers render on mobile (width < 768px), **Then** all answer text wraps within the button boundaries without overflow or truncation
2. **Given** a user is viewing a quiz question with long answer options, **When** the answers render on tablet (width 768px-1024px), **Then** all answer text displays fully and remains readable
3. **Given** a user is viewing a quiz question with long answer options, **When** the answers render on desktop (width > 1024px), **Then** all answer text displays fully with appropriate spacing

---

### User Story 5 - Chart Responsive Sizing (Priority: P2)

A user viewing statistics pages with charts and graphs expects all visualizations to fit within the page width without horizontal scrolling, adapting to different screen sizes for optimal viewing.

**Why this priority**: Charts that overflow the viewport width break page layout and force horizontal scrolling, creating a frustrating experience. While statistics viewing is important for user engagement, this is less critical than core gameplay functionality. Users can still access data in other formats (tables/cards) even if charts are oversized.

**Manual Verification**: Can be fully verified by navigating to all pages with charts (session statistics, my progress, word detail statistics), resizing the viewport to mobile (< 768px), tablet (768px-1024px), and desktop (> 1024px) widths, and confirming all charts fit within the page width.

**Acceptance Scenarios**:

1. **Given** a user views session statistics with charts, **When** the page renders on mobile device, **Then** all charts fit within the viewport width without horizontal scrolling
2. **Given** a user views the my progress page with performance graphs, **When** the page renders on tablet device, **Then** all graphs scale appropriately to the viewport width
3. **Given** a user views word detail statistics with charts, **When** the page renders on any screen size, **Then** charts maintain readability while fitting within the page width

---

### User Story 6 - Display Total Questions Instead of Total Score (Priority: P3)

A user completing a quiz expects to see "Total Questions" displayed instead of "Total Score" in results and statistics views, providing clearer context about the quiz scope.

**Why this priority**: While displaying "Total Score" may be confusing (as it seems redundant with the correct count in this context), this is primarily a labeling issue that doesn't prevent users from understanding their results. The numeric values are still correct. This is a minor UX improvement rather than a critical fix.

**Manual Verification**: Can be fully verified by completing a quiz, viewing the completion screen and statistics pages, and confirming the label reads "Total Questions" instead of "Total Score" while still displaying the same numeric value.

**Acceptance Scenarios**:

1. **Given** a user completes a quiz, **When** the completion screen displays, **Then** the results show "Total Questions" label instead of "Total Score"
2. **Given** a user views session statistics, **When** the statistics page renders, **Then** the overview cards show "Total Questions" label instead of "Total Score"
3. **Given** a user views the statistics overview in any context, **When** the data displays, **Then** the label clearly indicates total questions answered

---

### User Story 7 - Time Display in Seconds (Priority: P3)

A user viewing time elapsed for short quiz sessions expects to see time displayed in seconds (or seconds + minutes) rather than decimal minutes, providing more intuitive and precise time information for sessions under 2-3 minutes.

**Why this priority**: Displaying "1.5 minutes" is less intuitive than "1m 30s" for short sessions, but this is a minor display preference that doesn't affect core functionality. Users can still understand their performance. This is a nice-to-have improvement for clarity but not critical.

**Manual Verification**: Can be fully verified by completing a quiz in under 2 minutes, viewing the results and statistics, and confirming time displays as "Xs" or "Xm Ys" format instead of "X.Y minutes".

**Acceptance Scenarios**:

1. **Given** a user completes a quiz session lasting under 60 seconds, **When** the completion screen displays, **Then** time shows as "Xs" (e.g., "45s") instead of fractional minutes
2. **Given** a user completes a quiz session lasting 60+ seconds but under 120 seconds, **When** the time displays, **Then** format shows "Xm Ys" (e.g., "1m 30s") instead of "1.5 minutes"
3. **Given** a user views statistics for multiple sessions, **When** time elapsed displays, **Then** all time values use consistent seconds-based formatting

---

### User Story 8 - Game-Specific Component Routing (Priority: P2)

A user completing a game expects to be routed to the appropriate game-specific component rather than a generic "Game" component, ensuring they play the correct game type when starting a new session.

**Why this priority**: Currently, after completing a game, clicking "Play Again" may route to a generic component instead of the specific game (e.g., VocabQuizGame). This could cause confusion or incorrect game loading. However, if the routing works for initial game selection, this is primarily about consistency. Users can still navigate back to home to select games.

**Manual Verification**: Can be fully verified by completing a vocab quiz game, clicking "Play Again" or navigating to start a new game, and confirming the VocabQuizGame component loads (not a generic Game component).

**Acceptance Scenarios**:

1. **Given** a user completes a vocab quiz game, **When** they click "Play Again", **Then** the application routes to the VocabQuizGame component with proper game initialization
2. **Given** a user navigates to a game from the home page, **When** the game loads, **Then** the correct game-specific component renders (VocabQuizGame for vocab-quiz)
3. **Given** a user is routed to any game, **When** the component loads, **Then** all game-specific features and configurations are available

---

### User Story 9 - Remove Answer Selection Blur Effect (Priority: P3)

A user selecting an answer during a quiz expects the interface to remain clear and readable for the feedback duration, without blur effects that reduce visibility of the question, answer, or feedback.

**Why this priority**: Blur effects after answer selection may be an intentional design choice to indicate state change, but if it reduces readability of feedback, it hinders learning. However, this is a subjective UI preference and doesn't break functionality. Users can still see feedback and proceed. This is the lowest priority cosmetic change.

**Manual Verification**: Can be fully verified by starting a quiz, selecting any answer, and observing no blur effect is applied to the question card, answer buttons, or feedback during the feedback display period.

**Acceptance Scenarios**:

1. **Given** a user is answering a quiz question, **When** they select an answer, **Then** no blur effect is applied to the question display area
2. **Given** a user has just selected an answer, **When** feedback displays (correct/incorrect), **Then** all text remains fully legible without blur effects
3. **Given** a user views the feedback period, **When** the correct answer is highlighted, **Then** the interface maintains full clarity for optimal learning

---

### Edge Cases

- What happens when a user on a very small mobile device (width < 375px) views the header? The header should still function with minimal but acceptable layout, possibly collapsing some elements into a hamburger menu if necessary
- How does the system handle very long answer text (50+ characters) in quiz questions? Text should wrap to multiple lines within the button, maintaining button proportions and grid layout
- What happens when there are 10+ games on the leaderboard page? The tab interface should use a scrollable dropdown or similar pattern to maintain usability
- How are charts displayed when there is insufficient data (e.g., only 1-2 data points)? Charts should gracefully handle minimal data and still fit within viewport constraints
- What happens when time elapsed is 0 seconds (immediate completion)? The display should show "0s" or handle the edge case appropriately
- How does the application route if a game code is invalid or game component doesn't exist? The system should fall back gracefully, redirecting to home or showing an appropriate error message

## Requirements *(mandatory)*

### Functional Requirements

#### Responsive Layout Requirements

- **FR-001**: System MUST display a mobile menu button in the header when viewport width is less than 768px
- **FR-002**: System MUST arrange all header buttons (mode toggle, auth buttons, user menu) in a single row without wrapping on mobile devices (width < 768px)
- **FR-003**: System MUST display leaderboard game tabs without horizontal scrolling on mobile devices (width < 768px), using wrapped tab layout or dropdown selection
- **FR-004**: System MUST display leaderboard game tabs without horizontal scrolling on tablet devices (width 768px-1024px)

#### Content Spacing Requirements

- **FR-005**: System MUST apply consistent horizontal padding (minimum 1rem/16px) to login page content
- **FR-006**: System MUST apply consistent horizontal padding (minimum 1rem/16px) to signup page content
- **FR-007**: System MUST apply consistent horizontal padding (minimum 1rem/16px) to vocab CEFR level selection interface
- **FR-008**: System MUST apply consistent horizontal padding (minimum 1rem/16px) to translation direction selection interface
- **FR-009**: System MUST apply consistent horizontal padding (minimum 1rem/16px) to quiz result screens
- **FR-010**: System MUST apply consistent horizontal padding (minimum 1rem/16px) to statistics view pages
- **FR-011**: System MUST apply consistent horizontal padding (minimum 1rem/16px) to word detail pages

#### Quiz Display Requirements

- **FR-012**: System MUST display all answer option text fully visible within answer buttons without truncation
- **FR-013**: System MUST wrap answer text to multiple lines when necessary to prevent overflow on small screens
- **FR-014**: System MUST maintain button grid layout (2 columns) even when answer text wraps to multiple lines
- **FR-015**: System MUST ensure answer buttons remain tappable/clickable across their full area regardless of text length

#### Chart and Visualization Requirements

- **FR-016**: System MUST display all charts and graphs within viewport width on mobile devices (width < 768px)
- **FR-017**: System MUST display all charts and graphs within viewport width on tablet devices (width 768px-1024px)
- **FR-018**: System MUST maintain chart readability when scaled to fit smaller viewports
- **FR-019**: System MUST apply responsive sizing to all chart components (session statistics charts, progress graphs, word detail charts)

#### Label and Display Requirements

- **FR-020**: System MUST display "Total Questions" label instead of "Total Score" on quiz completion screens
- **FR-021**: System MUST display "Total Questions" label instead of "Total Score" in session statistics overview
- **FR-022**: System MUST display time elapsed in seconds format ("Xs") for durations under 60 seconds
- **FR-023**: System MUST display time elapsed in minutes and seconds format ("Xm Ys") for durations of 60 seconds or more
- **FR-024**: System MUST consistently use seconds-based time formatting across all quiz result and statistics displays

#### Navigation and Routing Requirements

- **FR-025**: System MUST route to VocabQuizGame component when user starts or restarts a vocab-quiz game
- **FR-026**: System MUST maintain correct game context when user clicks "Play Again" after completing a game
- **FR-027**: System MUST load the appropriate game-specific component based on game code from routing

#### Visual Effects Requirements

- **FR-028**: System MUST NOT apply blur effects to question display area after answer selection
- **FR-029**: System MUST NOT apply blur effects to answer buttons during feedback display
- **FR-030**: System MUST maintain full text legibility throughout the answer selection and feedback cycle

### Key Entities

- **HeaderLayout**: Navigation component structure including logo, nav links, auth buttons, user menu, and mobile menu button; responsive behavior across breakpoints
- **LeaderboardTabs**: Tab navigation component for game selection; must handle multiple tabs with responsive overflow strategy
- **PagePadding**: Horizontal spacing configuration applied consistently across all page components
- **AnswerButton**: Quiz answer option display component; handles text wrapping and maintains grid layout
- **ChartContainer**: Wrapper component for charts and graphs; handles responsive width constraints
- **TimeDisplay**: Formatted time duration showing elapsed time in appropriate units (seconds, minutes+seconds)
- **QuestionCounter**: Display component showing total questions (previously labeled as total score)
- **GameRouting**: Navigation logic determining which game-specific component to render based on game code

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of header elements remain accessible and visible without overlap on mobile viewports (width 320px-767px)
- **SC-002**: All leaderboard game tabs are selectable without horizontal scrolling on mobile and tablet devices (width 320px-1024px)
- **SC-003**: 100% of pages with form content (login, signup, game configuration) have consistent horizontal padding of at least 1rem on all screen sizes
- **SC-004**: All quiz answer text displays fully without truncation regardless of text length (tested with answers up to 100 characters)
- **SC-005**: 100% of charts fit within viewport width without horizontal scrolling on all screen sizes (tested 320px-1920px widths)
- **SC-006**: Time elapsed displays in seconds format for 90% of typical quiz sessions (which are under 3 minutes)
- **SC-007**: Users completing any game are routed to the correct game-specific component 100% of the time when restarting
- **SC-008**: No blur effects are visible during answer feedback display (verifiable by visual inspection and CSS audit)
- **SC-009**: Users can complete a full quiz session on mobile device (375px width) without encountering layout-breaking issues
- **SC-010**: Page load and interaction performance remains under 100ms for all UI changes related to these fixes

## Assumptions

- The application uses Tailwind CSS with a mobile-first responsive design approach and standard breakpoints (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)
- The chart library being used (assumed to be Recharts or similar) supports responsive width configuration
- All pages mentioned in content padding requirements exist and are currently accessible in the application
- The "Total Score" currently displays the same numeric value that should be shown for "Total Questions" (no calculation change needed, only label change)
- The VocabQuizGame component exists or the current Game component can be refactored to serve this purpose
- Blur effects (if present) are applied via CSS classes that can be removed or conditionally applied
- The mobile menu button functionality may already exist but is hidden due to CSS issues, or may need to be implemented
- Users primarily interact with the application on mobile devices in portrait orientation (320px-430px width)
- The application should support minimum viewport width of 320px (iPhone SE and similar small devices)
- Charts display data that is meaningful at smaller sizes (if data granularity is an issue, this should be addressed separately)

## Dependencies

- No new external library dependencies required (all fixes should be achievable with existing Tailwind CSS, shadcn/ui components, and chart libraries)
- No backend API changes required (all fixes are frontend-only)
- No database schema changes required

## Out of Scope

- Implementing a full hamburger menu navigation system if one doesn't exist (priority is ensuring existing elements display correctly)
- Redesigning the leaderboard tab UI completely (priority is making existing tabs work responsively)
- Adding new chart types or data visualizations (priority is fixing existing chart responsive sizing)
- Changing time calculation logic or backend time tracking (only frontend time display format changes)
- Implementing comprehensive game routing for all game types (priority is fixing vocab-quiz routing specifically)
- Optimizing chart rendering performance (priority is fixing display width issues only)
- Adding responsive table layouts for leaderboard data (focus is on tab navigation responsiveness)
- Implementing theme-specific fixes (fixes should work in both light and dark modes)
