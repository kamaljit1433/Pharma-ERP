# Keyboard Navigation Implementation

## Overview

This document describes the comprehensive keyboard navigation implementation for the Employee Management System frontend application. The implementation ensures full WCAG 2.1 AA compliance for keyboard accessibility.

## Requirements Addressed

- **21.1**: Provide keyboard navigation for all interactive elements
- **21.2**: Support tab navigation in logical order
- **21.3**: Provide visible focus indicators
- **21.10**: Provide skip navigation links

## Features Implemented

### 1. Skip Navigation Links (Requirement 21.10)

Skip navigation links allow keyboard users to bypass repetitive navigation and jump directly to main content or navigation.

**Component**: `SkipNavigation.tsx`

**Features**:
- Visually hidden by default (positioned off-screen)
- Becomes visible when focused with keyboard (Tab key)
- Provides two skip links:
  - "Skip to main content" → jumps to `#main-content`
  - "Skip to navigation" → jumps to `#navigation`
- Styled with high contrast for visibility
- Positioned at the top of the page (z-index: 9999)

**Usage**:
```tsx
import { SkipNavigation } from '@/components/layout';

// In MainLayout
<SkipNavigation />
```

**Keyboard Interaction**:
- Press `Tab` on page load to focus the first skip link
- Press `Enter` to activate the skip link and jump to the target

### 2. Enhanced Focus Indicators (Requirement 21.3)

Visible focus indicators are provided for all interactive elements with WCAG 2.1 AA compliant styling.

**Implementation**: `index.css`

**Features**:
- 2px solid outline with 2px offset for all focusable elements
- Uses theme-aware `--ring` color variable
- Works in both light and dark themes
- Enhanced focus for buttons with box-shadow
- Special focus styles for form inputs
- High contrast mode support (3px outline)
- Reduced motion support

**Styled Elements**:
- Links (`a`)
- Buttons (`button`, `[role="button"]`)
- Form inputs (`input`, `textarea`, `select`)
- Interactive elements (`[role="link"]`, `[role="tab"]`, `[role="menuitem"]`)
- Custom focusable elements (`[tabindex]:not([tabindex="-1"])`)

**CSS Classes**:
```css
/* Global focus indicator */
*:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
  border-radius: 2px;
}

/* Button focus with box-shadow */
button:focus-visible {
  box-shadow: 0 0 0 2px hsl(var(--background)), 0 0 0 4px hsl(var(--ring));
}

/* Form input focus */
input:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 0;
  border-color: hsl(var(--ring));
}
```

### 3. Logical Tab Order (Requirement 21.2)

The application maintains a logical tab order throughout all pages and components.

**Tab Order Flow**:
1. Skip navigation links (first tab stop)
2. Main navigation (sidebar links)
3. Header actions (search, notifications, theme toggle, user menu)
4. Main content area
5. Interactive elements within content (forms, buttons, links, tables)

**Implementation Details**:
- Semantic HTML structure ensures natural tab order
- `tabindex="-1"` used for programmatically focusable elements (e.g., main content)
- `tabindex="0"` used for custom interactive elements
- No positive `tabindex` values (maintains natural DOM order)

**MainLayout Tab Order**:
```
1. Skip to main content link
2. Skip to navigation link
3. Sidebar navigation links (in order)
4. Sidebar collapse toggle
5. Header hamburger menu (mobile)
6. Header search bar
7. Notification bell
8. Theme toggle
9. User menu
10. Main content area
11. Content interactive elements
```

### 4. Keyboard Navigation for All Interactive Elements (Requirement 21.1)

All interactive elements are fully keyboard accessible.

**Interactive Elements**:
- ✅ Navigation links (Sidebar)
- ✅ Buttons (Header, forms, actions)
- ✅ Form inputs (text, select, textarea, checkbox, radio)
- ✅ Dropdowns (user menu, notifications)
- ✅ Modals and dialogs
- ✅ Tables (sortable, filterable)
- ✅ Tabs
- ✅ Accordions
- ✅ Date pickers
- ✅ File upload
- ✅ Search bar

**Keyboard Shortcuts**:
- `Tab` / `Shift+Tab`: Navigate between interactive elements
- `Enter` / `Space`: Activate buttons and links
- `Escape`: Close modals, dropdowns, and mobile sidebar
- `Alt+N`: Focus navigation (custom shortcut)
- `Alt+M`: Focus main content (custom shortcut)
- `Arrow keys`: Navigate within dropdowns, tabs, and menus

### 5. ARIA Landmarks and Semantic HTML

Proper ARIA landmarks and semantic HTML ensure screen reader compatibility and logical structure.

**Landmarks Implemented**:
- `<header role="banner">`: Main header
- `<nav role="navigation" aria-label="Main navigation">`: Sidebar navigation
- `<nav aria-label="User actions">`: Header actions
- `<main role="main" aria-label="Main content">`: Main content area
- `<aside role="navigation">`: Sidebar

**ARIA Attributes**:
- `aria-label`: Descriptive labels for regions and buttons
- `aria-expanded`: State for expandable elements (sidebar, dropdowns)
- `aria-controls`: Relationship between controls and controlled elements
- `aria-current="page"`: Current page in navigation
- `aria-hidden="true"`: Decorative icons
- `aria-disabled`: Disabled state for interactive elements

### 6. Mobile Overlay Keyboard Support

The mobile sidebar overlay is fully keyboard accessible.

**Features**:
- Overlay is focusable with `tabindex="0"`
- `Enter` or `Space` key closes the overlay
- `Escape` key closes the overlay
- Proper `role="button"` and `aria-label`

**Implementation**:
```tsx
<div
  className="fixed inset-0 z-40 bg-black/50 md:hidden"
  onClick={() => setSidebarOpen(false)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSidebarOpen(false);
    }
  }}
  role="button"
  tabIndex={0}
  aria-label="Close navigation menu"
/>
```

## Testing Keyboard Navigation

### Manual Testing Checklist

1. **Skip Navigation**:
   - [ ] Press `Tab` on page load
   - [ ] Verify skip links become visible
   - [ ] Press `Enter` on "Skip to main content"
   - [ ] Verify focus moves to main content
   - [ ] Press `Tab` again and activate "Skip to navigation"
   - [ ] Verify focus moves to first navigation link

2. **Tab Order**:
   - [ ] Tab through entire page
   - [ ] Verify logical order: skip links → navigation → header → content
   - [ ] Verify no focus traps
   - [ ] Verify all interactive elements are reachable

3. **Focus Indicators**:
   - [ ] Tab through all interactive elements
   - [ ] Verify visible focus ring on all elements
   - [ ] Test in light mode
   - [ ] Test in dark mode
   - [ ] Verify focus indicators meet WCAG 2.1 AA contrast requirements

4. **Keyboard Shortcuts**:
   - [ ] Press `Alt+N` to focus navigation
   - [ ] Press `Alt+M` to focus main content
   - [ ] Press `Escape` to close mobile sidebar
   - [ ] Press `Escape` to close modals/dropdowns

5. **Interactive Elements**:
   - [ ] Navigate forms with `Tab`
   - [ ] Activate buttons with `Enter` or `Space`
   - [ ] Navigate dropdowns with arrow keys
   - [ ] Close dropdowns with `Escape`
   - [ ] Navigate tables with `Tab`
   - [ ] Sort tables with `Enter` on column headers

### Automated Testing

Use accessibility testing tools to verify keyboard navigation:

```bash
# Run accessibility tests
npm run test:a11y

# Run with axe-core
npm run test -- --grep "accessibility"
```

**Tools**:
- axe-core: Automated accessibility testing
- jest-axe: Jest integration for axe-core
- Lighthouse: Accessibility audit
- WAVE: Web accessibility evaluation tool

## Browser Support

Keyboard navigation is tested and supported in:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Accessibility Standards Compliance

This implementation meets the following standards:

- **WCAG 2.1 Level AA**:
  - 2.1.1 Keyboard (Level A)
  - 2.1.2 No Keyboard Trap (Level A)
  - 2.4.1 Bypass Blocks (Level A)
  - 2.4.3 Focus Order (Level A)
  - 2.4.7 Focus Visible (Level AA)

- **Section 508**:
  - 1194.21(a) Keyboard access
  - 1194.21(c) Focus indication

## Known Limitations

1. **Third-party Components**: Some third-party components (e.g., date pickers, rich text editors) may have their own keyboard navigation patterns. Ensure they are accessible before integration.

2. **Complex Interactions**: Complex interactions (e.g., drag-and-drop, canvas-based components) may require additional keyboard alternatives.

3. **Dynamic Content**: Dynamically loaded content should announce changes to screen readers using ARIA live regions.

## Future Enhancements

1. **Keyboard Shortcuts Panel**: Add a help panel showing all available keyboard shortcuts (accessible via `?` key)

2. **Focus Management**: Implement focus management for route changes (focus main heading on navigation)

3. **Roving Tabindex**: Implement roving tabindex for complex widgets (e.g., toolbars, grids)

4. **Keyboard Navigation Hints**: Add visual hints for keyboard shortcuts on hover

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN: Keyboard-navigable JavaScript widgets](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets)
- [WebAIM: Keyboard Accessibility](https://webaim.org/techniques/keyboard/)
- [A11y Project: Checklist](https://www.a11yproject.com/checklist/)

## Support

For questions or issues related to keyboard navigation, please contact the development team or file an issue in the project repository.
