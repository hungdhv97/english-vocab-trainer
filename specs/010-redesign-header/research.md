# Research: Header Redesign

**Feature**: Header Redesign  
**Date**: 2025-11-13  
**Phase**: 0 - Outline & Research

## Research Summary

This feature is a frontend-only UI redesign with no technical unknowns requiring research. All technology choices are already established in the codebase and comply with the constitution. The implementation will use existing components and patterns.

## Technology Decisions

### shadcn UI Dropdown Menu Component

**Decision**: Use existing `dropdown-menu.tsx` component from shadcn UI for the user menu.

**Rationale**: 
- The project already has shadcn UI components installed and configured
- The dropdown-menu component provides accessible, keyboard-navigable dropdown functionality out of the box
- Aligns with Constitution Principle III (Latest shadcn UI Components)
- No custom dropdown implementation needed

**Alternatives considered**:
- Custom dropdown implementation: Rejected - violates constitution principle to use shadcn UI
- Radix UI directly: Rejected - constitution requires using shadcn UI (which wraps Radix primitives)

### React Router for Navigation

**Decision**: Continue using React Router DOM for all navigation routing.

**Rationale**:
- Already established in the codebase (React Router DOM 7.8.1)
- Provides declarative routing with Link components
- Handles programmatic navigation via useNavigate hook
- No changes needed to routing infrastructure

**Alternatives considered**: None - React Router is already the standard routing solution.

### lucide-react for Icons

**Decision**: Use lucide-react icons for menu items (My Progress, Profile, Logout).

**Rationale**:
- Already installed in the project (lucide-react 0.536.0)
- Provides consistent icon set with good accessibility support
- Lightweight and tree-shakeable
- No new dependency required

**Alternatives considered**:
- Custom SVG icons: Rejected - unnecessary complexity when lucide-react is available
- Other icon libraries: Rejected - would require new dependency, violating minimal dependencies principle

### Avatar Fallback: User Initials

**Decision**: Display user initials (first letter of display name, or username if display name unavailable) when avatar image is missing.

**Rationale**:
- Provides personalization without requiring image upload
- Simple to implement using existing user data
- Common UX pattern users are familiar with
- No additional dependencies or services needed

**Alternatives considered**:
- Default generic icon: Rejected - less personalized, doesn't leverage available user data
- Gravatar integration: Rejected - would require new dependency and external service

### Logo Implementation: Image with Text Fallback

**Decision**: Use logo image if available (`/logo.png`), otherwise display "English Coach" as text.

**Rationale**:
- Provides flexibility for branding while ensuring functionality
- Text fallback ensures logo is always visible even if image fails to load
- Simple conditional rendering logic
- No new dependencies required

**Alternatives considered**:
- Image only: Rejected - no fallback if image fails to load
- Text only: Rejected - less visually appealing, doesn't utilize existing logo asset

## Component Structure Decisions

### Header Component Refactoring

**Decision**: Refactor Header component into logical sub-sections while maintaining single component file.

**Rationale**:
- Keeps related code together for easier maintenance
- Clear separation of concerns: Logo, Navigation, AuthButtons, UserMenu
- Follows existing component structure patterns
- No need for separate component files for simple sub-sections

**Alternatives considered**:
- Separate component files for each section: Rejected - unnecessary complexity for simple header sections
- Complete rewrite: Rejected - existing auth state management logic is sound, only UI needs updating

## No Additional Research Required

All technical decisions are straightforward and use existing, approved technologies. No external research, API integrations, or new technology evaluations are needed for this feature.

