# Research: Game-Specific Routing with Coming Soon Page

**Feature**: 004-game-specific-routing  
**Date**: 2025-01-27  
**Purpose**: Document research decisions and technical approach for game-specific routing implementation

## Research Questions & Decisions

### 1. How to Determine Which Games Are Implemented?

**Question**: How should the system determine which games are fully implemented vs. "coming soon"?

**Decision**: Use a frontend-based approach with a list of implemented game codes. The frontend will maintain a list of fully implemented game codes (starting with `['vocab-quiz']`) and route accordingly.

**Rationale**: 
- Simple and performant (no backend call needed for routing decision)
- Easy to extend when new games are implemented (just add to the list)
- Supports the requirement that "every game will be separated" - each game can have its own routing logic
- Backend endpoint for getting game by code will still be available for validation and displaying game information on Coming Soon pages

**Alternatives Considered**:
- Backend flag (`is_implemented` field in games table): Rejected because it adds database complexity and requires migration. Frontend routing decision doesn't need database query.
- Backend endpoint to check implementation status: Rejected because it adds unnecessary API call for routing decision. Frontend can make this decision based on URL.
- Config file: Rejected because frontend list is simpler and more maintainable for routing logic.

### 2. Where Should Game Code Validation Happen?

**Question**: Should game code validation happen in frontend, backend, or both?

**Decision**: Validate in both layers:
- **Frontend**: Check if game code exists in the list of implemented games or fetch game info from backend to validate code exists
- **Backend**: Validate game code exists in database when fetching game information via `GET /api/v1/games/code/:code`

**Rationale**:
- Frontend validation provides immediate feedback and prevents unnecessary API calls
- Backend validation ensures data integrity and handles cases where game codes might be removed or invalid
- Coming Soon page needs game information (name, description) which requires backend call anyway
- Invalid game codes should be handled gracefully with redirect to homepage

**Alternatives Considered**:
- Frontend-only validation: Rejected because Coming Soon page needs game information from backend
- Backend-only validation: Rejected because frontend should validate before making API calls for better UX

### 3. How to Structure Coming Soon Component?

**Question**: What information should the Coming Soon page display and how should it be structured?

**Decision**: Coming Soon page should display:
- Game name (from backend API)
- Game description (from backend API)
- Game icon (if available)
- "Coming Soon" message
- "Back to Home" button
- Consistent styling with existing game pages

**Rationale**:
- Provides clear feedback to users about game availability
- Maintains consistent user experience across all game pages
- Uses existing shadcn UI components for consistency
- Fetches game information from backend to ensure accurate display

**Alternatives Considered**:
- Static "Coming Soon" page without game info: Rejected because users should see which game they clicked on
- Hardcoded game information: Rejected because game data should come from backend for consistency

### 4. How to Handle Invalid Game Codes?

**Question**: What should happen when a user accesses an invalid or unknown game code?

**Decision**: Redirect to homepage with a toast notification or error message indicating the game was not found.

**Rationale**:
- Provides clear feedback to users
- Prevents broken URLs from causing errors
- Maintains good user experience
- Follows existing error handling patterns

**Alternatives Considered**:
- Show 404 page: Rejected because homepage redirect is more user-friendly
- Show error page: Rejected because redirect to homepage allows users to continue browsing games

### 5. How to Make Routing Extensible for Future Games?

**Question**: How should the routing system be designed to easily add new games in the future?

**Decision**: 
- Maintain a list of implemented game codes in a constants file or configuration
- Use a routing component that checks game code against implemented list
- Each game can have its own component/route handler
- Vocabulary Quiz remains as the default implemented game
- New games can be added by updating the implemented games list and creating game-specific components

**Rationale**:
- Supports the requirement that "every game will be separated"
- Makes it easy to add new games without modifying core routing logic
- Follows separation of concerns (each game is independent)
- Maintains clean architecture boundaries

**Alternatives Considered**:
- Single Game component with game-specific logic: Rejected because it violates separation of concerns and makes it harder to maintain separate games
- Dynamic game component loading: Rejected because it adds unnecessary complexity for current requirements

## Technical Decisions

### Frontend Routing Strategy

**Decision**: Use React Router's `useParams` hook to extract game code from URL, then route based on implemented games list.

**Implementation**:
- Extract `code` parameter from `/game/:code` route
- Check if code is in implemented games list
- Route to Vocabulary Quiz component if `code === 'vocab-quiz'`
- Route to Coming Soon component for all other valid game codes
- Redirect to homepage for invalid game codes

### Backend API Endpoint

**Decision**: Add `GET /api/v1/games/code/:code` endpoint to fetch game information by code.

**Implementation**:
- Add handler method `GetGameByCode` in game handler
- Add service method `GetGameByCode` in game service
- Query games table by code field (which has unique constraint)
- Return 404 if game code not found
- Return game information if found (for Coming Soon page display)

### Component Structure

**Decision**: 
- Modify existing `Game.tsx` to check game code and route accordingly
- Create new `ComingSoon.tsx` component for unimplemented games
- Keep Vocabulary Quiz logic in `Game.tsx` but conditionally render based on game code

**Rationale**:
- Maintains existing Vocabulary Quiz functionality
- Separates concerns (Coming Soon vs. actual game)
- Easy to extend when new games are implemented

## Implementation Notes

### Game Code Constants

Create a constants file or configuration to manage implemented game codes:

```typescript
// frontend/src/constants/games.ts
export const IMPLEMENTED_GAMES = ['vocab-quiz'] as const;

export function isGameImplemented(gameCode: string): boolean {
  return IMPLEMENTED_GAMES.includes(gameCode as any);
}
```

### Routing Logic

Game component will check game code and render accordingly:

1. Extract game code from URL using `useParams`
2. Check if game code is implemented
3. If `vocab-quiz`: Render Vocabulary Quiz game
4. If other valid game code: Fetch game info and render Coming Soon
5. If invalid: Redirect to homepage

### Backend Service Method

Add service method to get game by code:

```go
func (s *Service) GetGameByCode(ctx context.Context, code string) (*model.Game, error) {
    // Query games table by code
    // Return game or error if not found
}
```

## Dependencies

- No new dependencies required
- Uses existing React Router for routing
- Uses existing shadcn UI components for Coming Soon page
- Uses existing backend game module structure

## Risks & Mitigations

**Risk**: Game code validation might fail if game codes change in database
**Mitigation**: Backend endpoint validates game code exists, frontend handles 404 gracefully

**Risk**: Routing logic might become complex as more games are added
**Mitigation**: Use constants file for implemented games list, keep routing logic simple and extensible

**Risk**: Coming Soon page might not display correctly if game information fetch fails
**Mitigation**: Handle API errors gracefully, show fallback message if game info unavailable

## Future Considerations

- When new games are implemented, add game code to `IMPLEMENTED_GAMES` constant
- Create game-specific components/routes for each new game
- Consider game-specific routing configuration if routing becomes more complex
- Each game will have its own separate implementation (as per requirement)

