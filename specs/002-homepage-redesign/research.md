# Research: Homepage Redesign with Leaderboard Separation

**Feature**: Homepage Redesign with Leaderboard Separation  
**Date**: 2025-01-27  
**Phase**: 0 - Outline & Research

## Research Objectives

This research phase addresses design decisions and component availability for the homepage redesign feature. Since all technical context is clear (no NEEDS CLARIFICATION markers), research focuses on:
1. shadcn UI component availability for header/footer/navigation
2. Best practices for responsive game card layouts
3. Navigation patterns for authentication-aware headers
4. Leaderboard page design patterns

## Research Findings

### 1. shadcn UI Component Availability

**Decision**: Use existing shadcn UI components and create Header/Footer as composition components

**Rationale**: 
- Existing shadcn UI components in `frontend/src/components/ui/` include: Button, Card, Separator, Dropdown Menu, Tooltip
- shadcn UI does not provide pre-built Header/Footer components, but provides primitives that can be composed
- Navigation can be built using standard HTML `<nav>`, `<a>` tags, or React Router `Link` components with Tailwind styling
- Button component can be used for Play buttons on game cards

**Alternatives Considered**:
- Custom header/footer from scratch: Rejected - Would require more development time and may not match shadcn design system
- Third-party navigation library: Rejected - Violates minimal dependencies principle, existing React Router is sufficient
- shadcn Navigation component: Not available - shadcn UI focuses on atomic components, navigation is application-specific

**Implementation Approach**:
- Create Header component using Tailwind CSS + shadcn Button components for navigation links
- Create Footer component using Tailwind CSS for simple footer with copyright
- Use React Router `Link` components for client-side navigation
- Style with Tailwind CSS utility classes to match existing design system

### 2. Responsive Game Card Layout

**Decision**: Use existing responsive grid pattern with Tailwind CSS grid system

**Rationale**:
- Current `GameGrid` component uses `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` pattern
- This pattern already supports responsive design (mobile: 1 column, tablet: 2 columns, desktop: 3 columns)
- Matches success criteria SC-007 (responsive design for mobile 320px+, tablet 768px+, desktop 1024px+)
- No changes needed to grid layout, only content within GameCard

**Alternatives Considered**:
- CSS Grid with custom breakpoints: Rejected - Tailwind's responsive system is more maintainable
- Flexbox layout: Rejected - Grid is more appropriate for card layouts
- Masonry layout: Rejected - Cards have consistent height, grid is sufficient

**Implementation Approach**:
- Keep existing `GameGrid` component structure
- Modify `GameCard` to remove leaderboard section
- Add Play button to GameCard (using shadcn Button component)
- Ensure game cards maintain consistent height and spacing

### 3. Navigation Patterns for Authentication-Aware Headers

**Decision**: Conditional rendering based on authentication state using existing `isAuthenticated()` utility

**Rationale**:
- Existing `lib/api.ts` provides `isAuthenticated()` function that checks JWT token
- React Router provides `Link` components for client-side navigation
- Conditional rendering pattern is standard React practice
- Matches existing authentication flow (redirect unauthenticated users to login)

**Alternatives Considered**:
- Server-side authentication check: Rejected - Adds complexity, client-side check is sufficient for navigation display
- Context API for auth state: Rejected - Adds complexity, existing localStorage check is sufficient
- Separate header components for authenticated/unauthenticated: Rejected - Conditional rendering is simpler

**Implementation Approach**:
- Header component checks `isAuthenticated()` on render
- Conditionally display Login/Register links (unauthenticated) or Dashboard/Logout links (authenticated)
- Always display Home and Leaderboard links (public navigation)
- Use React Router `Link` components for navigation

### 4. Leaderboard Page Design Patterns

**Decision**: Create dedicated LeaderboardPage component that displays leaderboards for all games or allows game selection

**Rationale**:
- Existing `Leaderboard` component can be reused for individual game leaderboards
- Page should show leaderboards for all games or allow filtering by game
- Matches user story requirement: "leaderboard information displayed for available games"
- Uses existing API endpoints: `/api/v1/games/:id/leaderboard`

**Alternatives Considered**:
- Single game leaderboard page: Rejected - Spec requires leaderboard for "one or more games"
- Modal/dialog for leaderboard: Rejected - Spec requires dedicated page, not overlay
- Tabbed interface for multiple games: Considered - May be implemented in future, but initial version shows all games

**Implementation Approach**:
- Create `LeaderboardPage` component that fetches all games
- For each game, fetch and display leaderboard using existing `Leaderboard` component
- Display games in sections or cards with their respective leaderboards
- Handle loading and error states appropriately
- Maintain consistent header/footer structure

### 5. Play Button Design

**Decision**: Add Play button to game cards using shadcn Button component

**Rationale**:
- User context specifies "Play button" on game cards
- Existing game card click handler can be reused or button can trigger same action
- shadcn Button component provides consistent styling and accessibility
- Button provides clearer call-to-action than clickable card

**Alternatives Considered**:
- Keep entire card clickable: Rejected - User context specifically requests Play button
- Icon-only button: Rejected - Text button is clearer for accessibility
- Link instead of button: Rejected - Button is more appropriate for actions, Link for navigation

**Implementation Approach**:
- Add shadcn Button component to GameCard with "Play" text
- Button triggers same navigation logic as card click (authenticated → game, unauthenticated → login)
- Style button to match game card design
- Ensure button is accessible (keyboard navigation, ARIA labels)

## Design Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Header Component | Custom composition using Tailwind + shadcn Button | shadcn doesn't provide Header, composition is standard |
| Footer Component | Custom using Tailwind CSS | Simple footer doesn't need shadcn components |
| Navigation | React Router Link + conditional auth rendering | Standard pattern, minimal dependencies |
| Game Card Layout | Keep existing responsive grid | Already meets requirements, no changes needed |
| Play Button | shadcn Button component | Consistent with design system, accessible |
| Leaderboard Page | Dedicated page with game sections | Matches spec requirement for dedicated page |

## Component Dependencies

**Existing Components (No Changes)**:
- `components/ui/button.tsx` - shadcn Button (for Play buttons)
- `components/ui/card.tsx` - shadcn Card (for game cards)
- `components/home/GameGrid.tsx` - Game grid layout
- `components/home/Leaderboard.tsx` - Leaderboard display (reused in LeaderboardPage)
- `lib/api.ts` - API functions (fetchGames, fetchLeaderboard, isAuthenticated)

**New Components (To Create)**:
- `components/layout/Header.tsx` - Reusable header with navigation
- `components/layout/Footer.tsx` - Reusable footer
- `components/leaderboard/LeaderboardPage.tsx` - Dedicated leaderboard page

**Modified Components**:
- `components/home/HomePage.tsx` - Remove leaderboard from game cards, use Header/Footer
- `components/home/GameCard.tsx` - Remove leaderboard section, add Play button
- `App.tsx` - Add `/leaderboard` route

## API Endpoints (No Changes)

**Existing Endpoints** (sufficient for feature):
- `GET /api/v1/games` - Fetch all games (used by HomePage)
- `GET /api/v1/games/:id/leaderboard` - Fetch leaderboard for a game (used by LeaderboardPage)

**No new endpoints required** - Existing API provides all necessary data.

## Accessibility Considerations

- shadcn UI components provide WCAG 2.1 AA compliance by default
- Navigation links use semantic HTML (`<nav>`, `<a>`)
- Play buttons include proper ARIA labels
- Responsive design ensures usability across screen sizes
- Keyboard navigation supported via React Router and shadcn components

## Performance Considerations

- Lazy loading: Consider code-splitting for LeaderboardPage (future optimization)
- API calls: Fetch leaderboards in parallel for all games on LeaderboardPage
- Image loading: Game icons use `loading="lazy"` attribute (already implemented)
- Bundle size: No new dependencies, minimal impact on bundle size

## Next Steps

1. **Phase 1 - Design & Contracts**: 
   - Generate data-model.md (document Game and LeaderboardEntry entities)
   - Generate API contracts (document existing endpoints)
   - Generate quickstart.md (development setup and testing instructions)
   - Update agent context with new components

2. **Phase 2 - Implementation**:
   - Create Header and Footer components
   - Modify HomePage and GameCard components
   - Create LeaderboardPage component
   - Update App.tsx routes
   - Manual verification and testing

## Research Validation

✅ **All design decisions made**: No NEEDS CLARIFICATION items remain  
✅ **Component availability confirmed**: shadcn UI components available, custom components can be composed  
✅ **API endpoints confirmed**: Existing endpoints sufficient, no backend changes needed  
✅ **Architecture compliance**: All decisions align with Constitution principles  
✅ **Performance goals achievable**: Success criteria metrics are realistic with existing stack  

**Status**: Research complete, ready for Phase 1 (Design & Contracts)

