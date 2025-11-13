# Quick Start: Header Redesign

**Feature**: Header Redesign  
**Date**: 2025-11-13  
**Phase**: 1 - Design & Contracts

## Overview

This guide provides a quick start for implementing the header redesign feature. This is a frontend-only UI enhancement that modifies the existing Header component.

## Prerequisites

- Node.js and npm/yarn installed
- Frontend dependencies installed (`npm install` in `frontend/` directory)
- Development server running (`npm run dev` in `frontend/` directory)
- Access to existing codebase with shadcn UI components configured

## Implementation Steps

### 1. Review Current Header Component

**File**: `frontend/src/components/layout/Header.tsx`

**Current State**:
- Displays title and subtitle
- Shows Home and Leaderboard links
- Shows Login/Register for unauthenticated users
- Shows Avatar and Logout button for authenticated users

**What Needs to Change**:
- Restructure layout: Logo (left), Navigation (middle), Auth/User (right)
- Add Games link in middle section
- Style Sign Up as primary button
- Replace Logout button with Avatar indicator that opens dropdown menu
- Add user menu with Display Name, My Progress, Profile, Logout

### 2. Component Structure

The redesigned Header will have these sections:

```
Header
├── Logo (left)
│   └── Image or "English Coach" text → routes to /
├── Navigation (middle)
│   ├── Games → routes to /
│   └── Leaderboard → routes to /leaderboard
└── Auth/User (right)
    ├── [Unauthenticated]
    │   ├── Login → routes to /login
    │   └── Sign Up (primary button) → routes to /register
    └── [Authenticated]
        └── Avatar Indicator
            └── Dropdown Menu
                ├── Display Name (text)
                ├── My Progress (icon + text) → routes to /my-progress
                ├── Profile (icon + text) → routes to /profile
                └── Logout (icon + text) → logs out
```

### 3. Key Implementation Details

#### Logo Component

```typescript
// Check if logo.png exists in public folder
const logoPath = '/logo.png';
// If image fails to load, display "English Coach" text
```

#### Sign Up Button Styling

```typescript
// Use Button component with variant="default" (primary style)
<Button variant="default" asChild>
  <Link to="/register">Sign Up</Link>
</Button>
```

#### User Menu Dropdown

```typescript
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { BarChart3, User, LogOut } from 'lucide-react';

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    {/* Avatar indicator */}
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    {/* Display Name (non-clickable) */}
    <div className="px-2 py-1.5 text-sm font-medium">
      {profile?.display_name || username || 'User'}
    </div>
    <DropdownMenuSeparator />
    <DropdownMenuItem asChild>
      <Link to="/my-progress">
        <BarChart3 className="mr-2 h-4 w-4" />
        My Progress
      </Link>
    </DropdownMenuItem>
    <DropdownMenuItem asChild>
      <Link to="/profile">
        <User className="mr-2 h-4 w-4" />
        Profile
      </Link>
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={handleLogout}>
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

#### Avatar Fallback (Initials)

```typescript
const getInitials = (displayName: string | null, username: string): string => {
  if (displayName) {
    return displayName.charAt(0).toUpperCase();
  }
  return username.charAt(0).toUpperCase();
};
```

### 4. Responsive Design

Use Tailwind CSS responsive classes:
- `flex flex-col sm:flex-row` for mobile stacking
- `gap-2 sm:gap-4` for spacing
- `text-sm sm:text-base` for font sizes

### 5. Menu Behavior

- Menu opens below Avatar indicator
- Menu stays open after clicking menu items (user must click outside to close)
- Menu closes when clicking Avatar indicator again
- Menu closes when clicking outside menu area

### 6. Testing Checklist

Manual verification steps:

- [ ] Logo displays correctly (image or "English Coach" text)
- [ ] All navigation links route correctly
- [ ] Sign Up button is visually highlighted (primary button style)
- [ ] Header shows correct elements when logged out
- [ ] Header shows correct elements when logged in
- [ ] Avatar indicator displays user avatar or initials
- [ ] User menu opens when clicking Avatar
- [ ] User menu displays Display Name correctly
- [ ] User menu items have icons
- [ ] My Progress routes to `/my-progress` (when implemented)
- [ ] Profile routes to `/profile`
- [ ] Logout works correctly
- [ ] Menu stays open after clicking menu items
- [ ] Menu closes when clicking outside
- [ ] Header updates immediately on login/logout
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Dark mode works correctly
- [ ] Accessibility: keyboard navigation works
- [ ] Accessibility: screen reader announces menu items

## Dependencies

No new dependencies required. Uses existing:
- `@/components/ui/dropdown-menu` (shadcn UI)
- `@/components/ui/button` (shadcn UI)
- `lucide-react` (icons)
- `react-router-dom` (routing)

## Files to Modify

1. **`frontend/src/components/layout/Header.tsx`** - Main header component redesign

## Files to Create

None - all functionality uses existing components and utilities.

## Notes

- The `/my-progress` route is marked as TODO in the spec and needs to be implemented separately
- This feature does not require any backend changes
- All authentication state management logic already exists and works correctly

