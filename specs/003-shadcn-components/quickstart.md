# Quickstart: Update Frontend to Use shadcn Components

**Feature**: Update Frontend to Use shadcn Components  
**Date**: 2025-01-27  
**Phase**: 1 - Design & Contracts

## Overview

This guide provides step-by-step instructions for migrating the frontend to use shadcn UI components exclusively, ensuring all components are updated to the latest version.

## Prerequisites

- Node.js and npm installed
- Frontend dependencies installed (`npm install` in `frontend/` directory)
- shadcn UI already initialized (components.json exists)
- Access to terminal/command line

## Migration Steps

### Step 1: Add shadcn Alert Component

Add the Alert component (if not already present) using the latest version:

```bash
cd frontend
npx shadcn@latest add alert
```

**Verification**: Check that `frontend/src/components/ui/alert.tsx` exists.

### Step 2: Update Existing shadcn Components to Latest Versions

Update all existing shadcn components to the latest versions using the `--overwrite` flag:

```bash
cd frontend
npx shadcn@latest add button --overwrite
npx shadcn@latest add card --overwrite
npx shadcn@latest add input --overwrite
npx shadcn@latest add skeleton --overwrite
npx shadcn@latest add tooltip --overwrite
npx shadcn@latest add dropdown-menu --overwrite
npx shadcn@latest add separator --overwrite
npx shadcn@latest add sheet --overwrite
npx shadcn@latest add sidebar --overwrite
npx shadcn@latest add chart --overwrite
```

**Verification**: Check that component files in `frontend/src/components/ui/` are updated with latest code.

### Step 3: Migrate Error Messages to Alert Component

Replace custom error message divs with shadcn Alert components:

#### 3.1 Update HomePage.tsx

**File**: `frontend/src/components/home/HomePage.tsx`

**Changes**:
- Import Alert components: `import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';`
- Replace custom error div with Alert component:
  ```tsx
  // Before:
  <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg" role="alert">
    <p className="text-red-800 dark:text-red-200 font-medium">Error loading games</p>
    <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
    <button onClick={() => window.location.reload()} className="mt-3 text-sm text-red-700 dark:text-red-300 underline hover:no-underline">
      Try again
    </button>
  </div>

  // After:
  <Alert variant="destructive" className="mb-8">
    <AlertTitle>Error loading games</AlertTitle>
    <AlertDescription>
      {error}
      <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="mt-3">
        Try again
      </Button>
    </AlertDescription>
  </Alert>
  ```
- Ensure Button component is imported: `import { Button } from '@/components/ui/button';`

**Verification**: 
- Start development server: `npm run dev`
- Navigate to homepage
- Trigger error condition (e.g., disable network, break API endpoint)
- Verify error message displays using Alert component with destructive variant
- Verify "Try again" button uses shadcn Button component

#### 3.2 Update LeaderboardPage.tsx

**File**: `frontend/src/components/leaderboard/LeaderboardPage.tsx`

**Changes**:
- Import Alert components: `import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';`
- Replace custom error divs with Alert components:
  - Global error (loading games): Use `<Alert variant="destructive">`
  - Game-specific error (loading leaderboard): Use `<Alert>` (default variant for warnings)
- Replace "Try again" buttons with shadcn Button components

**Verification**:
- Navigate to leaderboard page
- Trigger error conditions
- Verify error/warning messages display using Alert components
- Verify buttons use shadcn Button components

### Step 4: Migrate Buttons to Button Component

Replace all raw HTML button elements with shadcn Button components:

#### 4.1 Check All Components for Raw Buttons

Search for `<button` elements in component files:

```bash
cd frontend
grep -r "<button" src/components --include="*.tsx"
```

#### 4.2 Replace Buttons

For each raw button found:
- Import Button: `import { Button } from '@/components/ui/button';`
- Replace `<button>` with `<Button>`
- Use appropriate variant:
  - Error recovery: `variant="outline"` or `variant="default"`
  - Empty state actions: `variant="default"`
  - Navigation: `variant="link"` or `variant="ghost"`
- Maintain existing onClick handlers and functionality

**Components to Check**:
- `components/home/HomePage.tsx` - Empty state "Refresh Page" button
- `components/leaderboard/LeaderboardPage.tsx` - Error recovery buttons, empty state buttons
- Any other components with raw buttons

**Verification**:
- Navigate through all pages
- Verify all buttons use shadcn Button component
- Verify button styling is consistent
- Verify button functionality (onClick handlers work)
- Verify keyboard navigation (Tab, Enter, Space keys)

### Step 5: Verify Navigation Links

Check that navigation links follow shadcn design patterns:

#### 5.1 Review Header.tsx

**File**: `frontend/src/components/layout/Header.tsx`

**Options**:
- **Option A**: Convert navigation links to Button components with `asChild` prop:
  ```tsx
  <Button variant="ghost" asChild>
    <Link to="/">Home</Link>
  </Button>
  ```
- **Option B**: Keep Link components but ensure Tailwind classes use shadcn design tokens

**Decision**: Evaluate which approach maintains best UX while following shadcn patterns.

**Verification**:
- Navigate through pages
- Verify navigation links have consistent styling
- Verify active state styling is clear
- Verify keyboard navigation works
- Verify links work correctly

### Step 6: Remove Direct Radix UI Imports

Verify no direct Radix UI imports exist in application code:

#### 6.1 Search for Radix Imports

```bash
cd frontend
grep -r "@radix-ui" src/components --include="*.tsx" | grep -v "src/components/ui"
```

This searches for Radix imports excluding the `components/ui/` directory (where shadcn wrapper components are allowed to import Radix).

#### 6.2 Remove or Replace Imports

If any Radix imports are found in application code:
- Identify the functionality needed
- Find the corresponding shadcn component
- Replace Radix import with shadcn component import
- Update component usage

**Verification**:
- Run grep command above
- Verify no Radix imports in application code (only in `components/ui/`)
- Verify application still works correctly

### Step 7: Manual Verification

Manually verify all changes:

#### 7.1 Error Messages
- [ ] HomePage error message uses Alert component
- [ ] LeaderboardPage error messages use Alert components
- [ ] Error messages are accessible (keyboard navigation, screen readers)
- [ ] Error messages display correctly in light and dark modes

#### 7.2 Buttons
- [ ] All buttons use shadcn Button component
- [ ] Button variants are appropriate for context
- [ ] Button functionality works (onClick handlers)
- [ ] Buttons are accessible (keyboard navigation)
- [ ] Buttons display correctly in light and dark modes

#### 7.3 Navigation
- [ ] Navigation links follow shadcn design patterns
- [ ] Active state styling is clear
- [ ] Navigation works correctly (client-side routing)
- [ ] Navigation is accessible (keyboard navigation)

#### 7.4 Component Updates
- [ ] All shadcn components are updated to latest versions
- [ ] Alert component is added and working
- [ ] No direct Radix UI imports in application code
- [ ] Application builds without errors
- [ ] No console errors in browser

#### 7.5 Functionality Preservation
- [ ] All existing functionality works (no regressions)
- [ ] Error handling works correctly
- [ ] Form submissions work correctly
- [ ] Navigation works correctly
- [ ] Authentication flow works correctly

## Troubleshooting

### Component Update Issues

**Problem**: Component update fails or breaks existing functionality

**Solution**:
- Check component file for custom modifications
- Review shadcn component documentation for breaking changes
- Test component in isolation
- Consider keeping custom modifications if they don't break shadcn structure

### Import Errors

**Problem**: Import errors after component updates

**Solution**:
- Verify component exports match imports
- Check path aliases in `tsconfig.json` and `components.json`
- Restart development server
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`

### Styling Issues

**Problem**: Components don't look right after migration

**Solution**:
- Verify Tailwind CSS configuration
- Check that shadcn design tokens are configured correctly
- Review component variant usage
- Test in both light and dark modes

### Functionality Issues

**Problem**: Functionality breaks after migration

**Solution**:
- Verify event handlers are preserved
- Check component props are passed correctly
- Review component API documentation
- Test functionality step by step

## Success Criteria Verification

Verify all success criteria are met:

- [ ] **SC-001**: 100% of error messages use shadcn Alert components
- [ ] **SC-002**: 100% of button elements use shadcn Button components
- [ ] **SC-003**: Zero direct Radix UI imports in application code
- [ ] **SC-004**: All pages maintain existing functionality
- [ ] **SC-005**: All replaced components maintain WCAG 2.1 AA accessibility
- [ ] **SC-006**: All replaced components maintain consistent visual appearance in light and dark themes
- [ ] **SC-007**: Component migration completed without breaking user flows
- [ ] **SC-008**: All interactive elements maintain proper keyboard navigation

## Next Steps

After completing migration:

1. **Code Review**: Review all changes for code quality and consistency
2. **Manual Testing**: Test all pages and functionality thoroughly
3. **Accessibility Testing**: Verify WCAG 2.1 AA compliance
4. **Performance Testing**: Verify no performance degradation
5. **Documentation**: Update component usage documentation if needed

## References

- [shadcn UI Documentation](https://ui.shadcn.com/)
- [shadcn UI Components](https://ui.shadcn.com/docs/components)
- [shadcn UI Installation](https://ui.shadcn.com/docs/installation)
- [Constitution Principle III: Latest shadcn UI Components](.specify/memory/constitution.md)

