# Feature Specification: Header Redesign

**Feature Branch**: `010-redesign-header`  
**Created**: 2025-11-13  
**Status**: Draft  
**Input**: User description: "redesign header -  before login: Logo (left) (Click then route to Home), Games (mid) (Click then route to Home), Leaderboard (mid), Login (right), Sign Up (right) (must be hightlight). after login: Logo, Games, Leaderboard, Avatar indicator (click then show user menu). User menu: Display Name (text), My Progress, Profile, Logout (button). Use icon in user menu."

## Clarifications

### Session 2025-11-13

- Q: Where should the user menu appear relative to the Avatar indicator, and what should happen when navigating to a menu item? → A: Dropdown below Avatar - stays open after menu item click (user must click outside)
- Q: What is the exact route path for the "My Progress" menu item? → A: /my-progress (TODO: route needs to be implemented)
- Q: How should the Sign Up link be visually highlighted compared to other navigation links? → A: Primary button style (solid background, contrasting text color)
- Q: What should be displayed as the Avatar indicator when the user's avatar image is unavailable? → A: User initials (first letter of display name or username)
- Q: What should the Logo element be? → A: Image logo (if available, otherwise text fallback "English Coach")

## User Scenarios & Verification *(mandatory)*

### User Story 1 - Navigate Header Before Login (Priority: P1)

A visitor who is not logged in can navigate the application using the header navigation elements. The header displays Logo, Games, Leaderboard, Login, and Sign Up links. The Sign Up link is visually highlighted to encourage new user registration. Clicking Logo or Games routes to the Home page, while Leaderboard routes to the leaderboard page. Login and Sign Up routes navigate to their respective authentication pages.

**Why this priority**: This is the primary navigation interface for unauthenticated users. It must be functional and clear to enable user onboarding and basic navigation.

**Manual Verification**: Can be fully verified by visiting the application while logged out, observing all header elements are visible and correctly positioned, clicking each navigation element to confirm correct routing, and verifying Sign Up is visually highlighted compared to other links.

**Acceptance Scenarios**:

1. **Given** a user is not logged in, **When** they view the header, **Then** they see Logo on the left, Games and Leaderboard in the middle, and Login and Sign Up on the right
2. **Given** a user is not logged in, **When** they view the Sign Up link, **Then** it appears visually highlighted compared to other navigation links
3. **Given** a user is not logged in, **When** they click the Logo, **Then** they are routed to the Home page
4. **Given** a user is not logged in, **When** they click Games, **Then** they are routed to the Home page
5. **Given** a user is not logged in, **When** they click Leaderboard, **Then** they are routed to the Leaderboard page
6. **Given** a user is not logged in, **When** they click Login, **Then** they are routed to the Login page
7. **Given** a user is not logged in, **When** they click Sign Up, **Then** they are routed to the Sign Up page

---

### User Story 2 - Navigate Header After Login (Priority: P1)

A logged-in user can navigate the application using the header navigation elements. The header displays Logo, Games, Leaderboard, and an Avatar indicator. Clicking Logo, Games, or Leaderboard routes to their respective pages. Clicking the Avatar indicator reveals a user menu with Display Name, My Progress, Profile, and Logout options, each with appropriate icons.

**Why this priority**: This is the primary navigation interface for authenticated users. It must provide quick access to key features and user account management.

**Manual Verification**: Can be fully verified by logging into the application, observing all header elements are visible and correctly positioned, clicking each navigation element to confirm correct routing, clicking the Avatar indicator to verify the user menu appears, and testing each menu item navigation.

**Acceptance Scenarios**:

1. **Given** a user is logged in, **When** they view the header, **Then** they see Logo, Games, Leaderboard, and an Avatar indicator
2. **Given** a user is logged in, **When** they click the Logo, **Then** they are routed to the Home page
3. **Given** a user is logged in, **When** they click Games, **Then** they are routed to the Home page
4. **Given** a user is logged in, **When** they click Leaderboard, **Then** they are routed to the Leaderboard page
5. **Given** a user is logged in, **When** they click the Avatar indicator, **Then** a user menu appears displaying their Display Name, My Progress, Profile, and Logout options
6. **Given** a user is logged in, **When** they view the user menu, **Then** each menu item (My Progress, Profile, Logout) displays with an appropriate icon
7. **Given** a user is logged in, **When** they view the user menu, **Then** their Display Name is shown as text (not a clickable link)

---

### User Story 3 - Access User Menu Features (Priority: P2)

A logged-in user can access their account features through the user menu. The menu displays the user's Display Name, and provides navigation to My Progress and Profile pages, as well as a Logout action. Each menu item (except Display Name) is clickable and includes an icon for visual clarity.

**Why this priority**: This enables users to manage their account and view their progress, which are core authenticated user features.

**Manual Verification**: Can be fully verified by logging in, opening the user menu, verifying Display Name is shown, clicking My Progress to navigate to the progress page, clicking Profile to navigate to the profile page, and clicking Logout to successfully log out.

**Acceptance Scenarios**:

1. **Given** a user is logged in and the user menu is open, **When** they view the menu, **Then** their Display Name is displayed as text at the top of the menu
2. **Given** a user is logged in and the user menu is open, **When** they click My Progress, **Then** they are routed to `/my-progress`
3. **Given** a user is logged in and the user menu is open, **When** they click Profile, **Then** they are routed to their profile page
4. **Given** a user is logged in and the user menu is open, **When** they click Logout, **Then** they are logged out and returned to the Home page
5. **Given** a user is logged in and the user menu is open, **When** they view My Progress, **Then** it displays with an icon
6. **Given** a user is logged in and the user menu is open, **When** they view Profile, **Then** it displays with an icon
7. **Given** a user is logged in and the user menu is open, **When** they view Logout, **Then** it displays with an icon
8. **Given** a user is logged in and the user menu is open, **When** they click a menu item (My Progress, Profile, or Logout), **Then** they are routed to the appropriate page and the menu remains open until they click outside the menu area

---

### Edge Cases

- What happens when a user's Display Name is null or empty? The system should display a fallback (e.g., username or "User")
- What happens when a user clicks outside the user menu? The menu should close
- What happens when a user's avatar image fails to load? The system should display user initials (first letter of display name, or first letter of username if display name is unavailable) as the fallback avatar indicator
- How does the header handle responsive design on mobile devices? Navigation elements should remain accessible and properly positioned
- What happens when a user clicks the Avatar indicator while the menu is already open? The menu should close
- How does the system handle authentication state changes while the header is displayed? The header should update immediately to reflect the current authentication state

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a Logo element on the left side of the header that routes to Home when clicked (image logo if available, otherwise text "English Coach" as fallback)
- **FR-002**: System MUST display a Games navigation link in the middle section of the header that routes to Home when clicked
- **FR-003**: System MUST display a Leaderboard navigation link in the middle section of the header that routes to the Leaderboard page when clicked
- **FR-004**: System MUST display Login and Sign Up links on the right side of the header when user is not authenticated
- **FR-005**: System MUST visually highlight the Sign Up link using primary button style (solid background with contrasting text color) compared to other navigation links when user is not authenticated
- **FR-006**: System MUST display an Avatar indicator on the right side of the header when user is authenticated
- **FR-007**: System MUST display a user menu as a dropdown below the Avatar indicator when clicked, containing Display Name, My Progress, Profile, and Logout options
- **FR-008**: System MUST display the user's Display Name as text (non-clickable) at the top of the user menu
- **FR-009**: System MUST display an icon for each clickable menu item (My Progress, Profile, Logout) in the user menu
- **FR-010**: System MUST route to `/my-progress` when My Progress is clicked from the user menu (TODO: `/my-progress` route needs to be implemented)
- **FR-011**: System MUST route to the user's profile page when Profile is clicked from the user menu
- **FR-012**: System MUST log out the user and route to Home when Logout is clicked from the user menu
- **FR-013**: System MUST update the header display immediately when authentication state changes (login/logout)
- **FR-014**: System MUST close the user menu when user clicks outside the menu area (menu stays open after clicking menu items until user clicks outside)
- **FR-015**: System MUST close the user menu when user clicks the Avatar indicator while menu is open
- **FR-016**: System MUST display user initials (first letter of display name, or first letter of username if display name is unavailable) as a fallback indicator when user's avatar image fails to load or is unavailable

### Key Entities *(include if feature involves data)*

- **User Profile**: Represents the authenticated user's profile information, including display_name used in the user menu
- **Authentication State**: Represents whether a user is currently logged in, determining which header elements to display

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can navigate to any primary page (Home, Games, Leaderboard) from the header in under 2 seconds
- **SC-002**: 100% of header navigation links route to the correct destination
- **SC-003**: The user menu opens and closes within 200ms of user interaction
- **SC-004**: The header correctly displays the appropriate elements (authenticated vs unauthenticated) 100% of the time based on authentication state
- **SC-005**: Users can access all user menu features (My Progress, Profile, Logout) within 3 clicks from any page
- **SC-006**: The Sign Up link is visually distinguishable from other navigation links for 100% of unauthenticated users

## Assumptions

- The Logo element will be a clickable component (image logo if available, otherwise text "English Coach" as fallback) that routes to the Home page
- "My Progress" routes to `/my-progress` (TODO: this route needs to be implemented to display user progress/statistics information)
- The Avatar indicator will display the user's avatar image if available, or user initials (first letter of display name, or first letter of username if display name is unavailable) as a fallback if not
- Icons for menu items (My Progress, Profile, Logout) will be standard UI icons appropriate for each action
- The user menu will be a dropdown component that appears below the Avatar indicator and remains open after menu item clicks until the user clicks outside the menu area
- The Sign Up link will use primary button style (solid background with contrasting text color) to distinguish it from other navigation links
- The header layout will be responsive and adapt to different screen sizes while maintaining the specified element positions
