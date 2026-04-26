# ARIA Implementation Guide

## Overview

This document describes the ARIA (Accessible Rich Internet Applications) implementation across the Employee Management System frontend application. The implementation ensures WCAG 2.1 AA compliance and provides comprehensive screen reader support.

**Requirements Addressed:**
- 21.4: ARIA labels for all interactive elements
- 21.5: Alt text for all images
- 21.11: Announce dynamic content changes to screen readers
- 21.12: Support screen reader navigation

## Implementation Components

### 1. ARIA Helper Utilities (`src/utils/ariaHelpers.ts`)

Centralized utility functions for generating consistent ARIA labels across the application:

- `getNotificationAriaLabel()` - Notification count announcements
- `getLoadingAriaLabel()` - Loading state descriptions
- `getActionAriaLabel()` - Action button labels
- `getStatusAriaLabel()` - Status badge descriptions
- `getPaginationAriaLabel()` - Pagination state
- `getSortAriaLabel()` - Sort button states
- `getFilterAriaLabel()` - Filter control labels
- `getProgressAriaLabel()` - Progress indicator descriptions
- `getSearchAriaLabel()` - Search input labels
- `getExportAriaLabel()` - Export button labels
- `getDialogAriaLabel()` - Modal/dialog labels
- `getFieldAriaDescription()` - Form field descriptions
- `getNavAriaLabel()` - Navigation item labels
- `getExpandableAriaLabel()` - Expandable section labels
- `getTabAriaLabel()` - Tab control labels
- `getAnnouncementText()` - Live region announcements

### 2. Live Region Component (`src/components/ui/live-region.tsx`)

ARIA live region for announcing dynamic content changes:

```tsx
<LiveRegion 
  message="Employee record updated successfully"
  politeness="polite"
  clearOnAnnounce={true}
  clearDelay={1000}
/>
```

**Features:**
- Configurable politeness levels (`polite`, `assertive`, `off`)
- Auto-clear announcements after delay
- Screen reader only (visually hidden)
- `useLiveRegion()` hook for programmatic announcements

**Usage:**
```tsx
const { announce } = useLiveRegion();

// Announce success
announce('Data saved successfully', 'polite');

// Announce error (assertive)
announce('Error: Failed to save data', 'assertive');
```

### 3. Enhanced UI Components

#### Input Component (`src/components/ui/input.tsx`)

Enhanced with:
- `aria-invalid` for error states
- `aria-describedby` linking to error/description text
- Automatic ID generation for accessibility
- Error message association

```tsx
<Input
  label="Email"
  error="Invalid email format"
  description="Enter your work email address"
  required
/>
```

#### Button Component (`src/components/ui/button.tsx`)

Enhanced with:
- `aria-busy` for loading states
- `aria-disabled` for disabled states
- Loading spinner with `aria-hidden`
- Icon support with proper hiding

```tsx
<Button loading={isLoading} icon={<Save />}>
  Save Changes
</Button>
```

#### Toast Component (`src/components/ui/toast.tsx`)

Enhanced with:
- `role="status"` or `role="alert"` based on variant
- `aria-live="polite"` or `aria-live="assertive"`
- `aria-atomic="true"` for complete announcements
- Close button with `aria-label`

#### Progress Component (`src/components/ui/progress.tsx`)

Enhanced with:
- `role="progressbar"`
- `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- `aria-label` for context
- Optional live region for percentage updates

```tsx
<Progress 
  value={75} 
  label="Upload progress"
  showPercentage={true}
/>
```

#### Dialog Component (`src/components/ui/dialog.tsx`)

Enhanced with:
- `role="dialog"`
- `aria-modal="true"`
- Close button with descriptive label
- Proper focus management

### 4. Image Component (`src/components/ui/image.tsx`)

Accessible image component with:
- Required `alt` text
- Decorative image support (`decorative` prop)
- Fallback image handling
- Loading state indicators
- Error state handling

```tsx
<Image 
  src="/profile.jpg"
  alt="John Doe profile photo"
  fallbackSrc="/default-avatar.png"
  showLoadingIndicator
/>

<Image 
  src="/decorative-pattern.svg"
  alt=""
  decorative
/>
```

### 5. Loading Spinner (`src/components/ui/loading-spinner.tsx`)

Accessible loading indicators:
- `role="status"`
- `aria-live="polite"`
- `aria-busy="true"`
- Screen reader labels
- Multiple sizes

```tsx
<LoadingSpinner 
  size="md"
  label="Loading employee data"
  showLabel={true}
/>
```

### 6. Skip Navigation (`src/components/ui/skip-nav.tsx`)

Skip navigation links for keyboard users:
- Visually hidden until focused
- Jumps to main content
- Bypasses repetitive navigation

```tsx
<SkipNav targetId="main-content" label="Skip to main content" />
<SkipNavContent id="main-content">
  {/* Main content here */}
</SkipNavContent>
```

### 7. Layout Components

#### Header (`src/components/layout/Header.tsx`)

- `role="banner"` landmark
- Hamburger menu with `aria-label`, `aria-expanded`, `aria-controls`
- Logo with `role="img"` and `aria-label`
- Navigation with `aria-label="User actions"`
- Search toggle with `aria-expanded`, `aria-controls`

#### Sidebar (`src/components/layout/Sidebar.tsx`)

- `role="navigation"` landmark
- User profile region with `aria-label`
- Navigation list with `role="list"` and `role="listitem"`
- Active route indication with `aria-current="page"`
- Collapse toggle with `aria-label`, `aria-expanded`
- Icons marked with `aria-hidden="true"`

#### MainLayout (`src/components/layout/MainLayout.tsx`)

- Skip navigation links
- `role="navigation"` for sidebar
- `role="main"` for content area
- `aria-label` for landmarks
- Mobile overlay with keyboard support
- Keyboard shortcuts (Alt+N for nav, Alt+M for main)

#### NotificationBell (`src/components/layout/NotificationBell.tsx`)

- Button with dynamic `aria-label` including count
- Badge for visual count indicator

#### NotificationDropdown (`src/components/layout/NotificationDropdown.tsx`)

- `role="dialog"` with `aria-label`
- `role="list"` for notification list
- `role="listitem"` for each notification
- Keyboard navigation support
- Mark as read with descriptive labels
- Time elements with `dateTime` attribute

#### UserMenu (`src/components/layout/UserMenu.tsx`)

- Button with `aria-label`, `aria-expanded`, `aria-haspopup`
- Dropdown with `role="menu"` and `aria-label`
- Menu items with `role="menuitem"`
- Icons marked with `aria-hidden="true"`

### 8. Form Components

#### LoginForm (`src/components/forms/LoginForm.tsx`)

- Form with `aria-label`
- Inputs with `aria-required`, `aria-invalid`, `aria-describedby`
- Error messages with `role="alert"` and unique IDs
- Loading states on submit button

## Best Practices

### 1. Interactive Elements

All interactive elements (buttons, links, inputs) must have:
- Descriptive labels (visible or `aria-label`)
- Keyboard accessibility
- Focus indicators
- Appropriate ARIA roles

### 2. Dynamic Content

Dynamic content changes must be announced using:
- ARIA live regions (`role="status"`, `role="alert"`)
- `aria-live="polite"` or `aria-live="assertive"`
- `aria-atomic="true"` for complete announcements
- Toast notifications with proper roles

### 3. Images

All images must have:
- Descriptive `alt` text for meaningful images
- Empty `alt=""` for decorative images
- `aria-hidden="true"` for purely decorative elements
- Fallback handling for failed loads

### 4. Forms

Form fields must have:
- Associated labels (explicit or `aria-label`)
- Error messages linked with `aria-describedby`
- `aria-invalid` for error states
- `aria-required` for required fields
- Field descriptions for additional context

### 5. Navigation

Navigation must include:
- Skip navigation links
- Proper landmark roles (`banner`, `navigation`, `main`, `contentinfo`)
- `aria-current="page"` for active items
- Breadcrumb trails with proper structure

### 6. Modals and Dialogs

Modals must have:
- `role="dialog"` or `role="alertdialog"`
- `aria-modal="true"`
- `aria-labelledby` or `aria-label`
- Focus trap within modal
- Close button with descriptive label

### 7. Loading States

Loading indicators must have:
- `role="status"` or `role="progressbar"`
- `aria-live="polite"`
- `aria-busy="true"` on loading elements
- Descriptive labels for context

### 8. Tables

Data tables must have:
- `<table>` element with proper structure
- `<th>` elements with `scope` attribute
- `<caption>` or `aria-label` for table description
- Sort buttons with `aria-sort` attribute
- Row selection with `aria-selected`

## Testing Guidelines

### Automated Testing

1. **ESLint Plugin**: Use `eslint-plugin-jsx-a11y` for static analysis
2. **Axe DevTools**: Run automated accessibility scans
3. **Lighthouse**: Check accessibility scores (target: 100)

### Manual Testing

1. **Keyboard Navigation**:
   - Tab through all interactive elements
   - Verify focus indicators are visible
   - Test keyboard shortcuts (Alt+N, Alt+M, Escape)
   - Verify skip navigation works

2. **Screen Reader Testing**:
   - **NVDA** (Windows): Test with Firefox
   - **JAWS** (Windows): Test with Chrome
   - **VoiceOver** (macOS): Test with Safari
   - Verify all content is announced
   - Check live region announcements
   - Test form validation messages

3. **Visual Testing**:
   - Verify focus indicators
   - Check color contrast ratios
   - Test with browser zoom (200%)
   - Verify responsive behavior

## Common Patterns

### Announcing Form Submission

```tsx
const { announce } = useLiveRegion();

const handleSubmit = async () => {
  try {
    await saveData();
    announce('Data saved successfully', 'polite');
  } catch (error) {
    announce('Error: Failed to save data', 'assertive');
  }
};
```

### Loading States

```tsx
<Button loading={isLoading} aria-label="Save employee data">
  Save
</Button>

{isLoading && (
  <LoadingSpinner label="Saving employee data" />
)}
```

### Error Messages

```tsx
<Input
  id="email"
  label="Email"
  error={errors.email}
  aria-invalid={!!errors.email}
  aria-describedby={errors.email ? 'email-error' : undefined}
/>
{errors.email && (
  <p id="email-error" role="alert">
    {errors.email}
  </p>
)}
```

### Dynamic Lists

```tsx
<div role="list" aria-label="Employee list">
  {employees.map(employee => (
    <div key={employee.id} role="listitem">
      {employee.name}
    </div>
  ))}
</div>

<LiveRegion message={`${employees.length} employees loaded`} />
```

## Resources

- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN ARIA Documentation](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
- [Radix UI Accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility)

## Maintenance

When adding new components:

1. Use ARIA helper utilities for consistent labels
2. Add live regions for dynamic content
3. Ensure keyboard accessibility
4. Test with screen readers
5. Document ARIA patterns used
6. Update this guide with new patterns

## Support

For accessibility questions or issues:
1. Review this guide
2. Check WAI-ARIA Authoring Practices
3. Test with screen readers
4. Consult with accessibility experts
