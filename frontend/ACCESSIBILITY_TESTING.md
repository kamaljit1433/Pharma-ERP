# Accessibility Testing Guide

This document provides comprehensive guidance for testing the accessibility of the Employee Management System frontend application.

## Table of Contents

1. [Automated Testing](#automated-testing)
2. [Manual Keyboard Navigation Testing](#manual-keyboard-navigation-testing)
3. [Screen Reader Testing](#screen-reader-testing)
4. [Color Contrast Testing](#color-contrast-testing)
5. [Accessibility Checklist](#accessibility-checklist)
6. [Tools and Resources](#tools-and-resources)

## Automated Testing

### Running Automated Tests

The application includes comprehensive automated accessibility tests using axe-core and vitest-axe.

```bash
# Run all accessibility tests
npm run test:a11y

# Run tests in watch mode
npm run test:a11y:watch

# Run tests with coverage
npm run test:a11y:coverage

# Run all tests including accessibility
npm test
```

### Test Coverage

Automated tests cover:

- ✅ UI components (buttons, inputs, forms, tables)
- ✅ Layout components (header, sidebar, navigation)
- ✅ Page components (login, dashboard, etc.)
- ✅ Color contrast ratios
- ✅ Keyboard navigation
- ✅ ARIA attributes
- ✅ Semantic HTML
- ✅ Form validation
- ✅ Dynamic content announcements

### Understanding Test Results

When tests fail, axe-core provides detailed information:

- **Violation type**: What accessibility rule was violated
- **Impact**: Severity (critical, serious, moderate, minor)
- **Element**: Which HTML element has the issue
- **Fix**: Suggested remediation steps

## Manual Keyboard Navigation Testing

### Basic Keyboard Navigation

Test the following keyboard interactions:

#### Tab Navigation

1. **Tab Key**: Move focus forward through interactive elements
   - Press `Tab` repeatedly
   - Verify focus moves in logical order
   - Verify all interactive elements are reachable
   - Verify focus indicator is clearly visible

2. **Shift + Tab**: Move focus backward
   - Press `Shift + Tab` repeatedly
   - Verify focus moves in reverse order

3. **Skip Navigation**: Test skip links
   - Press `Tab` on page load
   - First focusable element should be "Skip to main content"
   - Press `Enter` to skip navigation
   - Verify focus moves to main content

#### Form Navigation

1. **Form Fields**:
   - Tab through all form fields
   - Verify logical tab order
   - Verify required fields are indicated
   - Verify error messages are announced

2. **Form Submission**:
   - Focus on any input field
   - Press `Enter` to submit form
   - Verify form submits correctly

#### Button Activation

1. **Enter Key**: Activate buttons
   - Focus on a button
   - Press `Enter`
   - Verify button action executes

2. **Space Key**: Activate buttons
   - Focus on a button
   - Press `Space`
   - Verify button action executes

#### Checkbox and Switch Controls

1. **Space Key**: Toggle checkboxes/switches
   - Focus on checkbox or switch
   - Press `Space`
   - Verify control toggles state

#### Modal Dialogs

1. **Focus Trap**:
   - Open a modal dialog
   - Press `Tab` repeatedly
   - Verify focus stays within modal
   - Verify focus cycles through modal elements

2. **Escape Key**: Close modals
   - Open a modal dialog
   - Press `Escape`
   - Verify modal closes
   - Verify focus returns to trigger element

#### Dropdown Menus

1. **Arrow Keys**: Navigate menu items
   - Open a dropdown menu
   - Press `ArrowDown` / `ArrowUp`
   - Verify focus moves through menu items

2. **Enter Key**: Select menu item
   - Focus on a menu item
   - Press `Enter`
   - Verify item is selected

#### Data Tables

1. **Sort Controls**:
   - Tab to column header sort buttons
   - Press `Enter` or `Space` to sort
   - Verify sort order changes
   - Verify sort state is announced

2. **Row Selection**:
   - Tab through table rows
   - Verify row selection with `Space` or `Enter`

### Keyboard Shortcuts

Test application-specific keyboard shortcuts:

- `Alt + N`: Focus navigation menu
- `Alt + M`: Focus main content
- `Escape`: Close sidebar on mobile
- `Ctrl + S`: Save (where applicable)

### Testing Checklist

- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical and intuitive
- [ ] Focus indicators are clearly visible
- [ ] Skip navigation links work correctly
- [ ] Forms can be completed using only keyboard
- [ ] Modals trap focus appropriately
- [ ] Escape key closes modals and dropdowns
- [ ] No keyboard traps (can always navigate away)
- [ ] Keyboard shortcuts don't conflict with browser shortcuts

## Screen Reader Testing

### Screen Readers to Test

- **Windows**: NVDA (free) or JAWS
- **macOS**: VoiceOver (built-in)
- **Linux**: Orca (free)
- **Mobile**: TalkBack (Android) or VoiceOver (iOS)

### NVDA Testing (Windows)

#### Setup

1. Download NVDA from https://www.nvaccess.org/
2. Install and launch NVDA
3. Open the application in a browser

#### Basic Commands

- `Insert + Down Arrow`: Read next item
- `Insert + Up Arrow`: Read previous item
- `Insert + Space`: Toggle browse/focus mode
- `H`: Navigate by headings
- `B`: Navigate by buttons
- `F`: Navigate by form fields
- `T`: Navigate by tables
- `L`: Navigate by links
- `Insert + F7`: List all elements

#### Testing Procedure

1. **Page Structure**:
   - Navigate by headings (`H`)
   - Verify heading hierarchy (H1 → H2 → H3)
   - Verify page landmarks are announced

2. **Navigation**:
   - Navigate through main menu
   - Verify menu items are announced correctly
   - Verify current page is indicated

3. **Forms**:
   - Navigate through form fields (`F`)
   - Verify labels are announced
   - Verify required fields are indicated
   - Verify error messages are announced
   - Submit form and verify success message

4. **Tables**:
   - Navigate to data table (`T`)
   - Verify table structure is announced
   - Verify column headers are announced
   - Navigate through table cells

5. **Dynamic Content**:
   - Trigger actions that update content
   - Verify changes are announced
   - Verify loading states are announced

6. **Images**:
   - Navigate through images
   - Verify alt text is announced
   - Verify decorative images are ignored

### VoiceOver Testing (macOS)

#### Setup

1. Enable VoiceOver: `Cmd + F5`
2. Open the application in Safari or Chrome

#### Basic Commands

- `VO + Right Arrow`: Move to next item
- `VO + Left Arrow`: Move to previous item
- `VO + Space`: Activate item
- `VO + U`: Open rotor (element list)
- `VO + H`: Navigate by headings
- `VO + J`: Navigate by form controls

#### Testing Procedure

Follow the same testing procedure as NVDA, using VoiceOver commands.

### Screen Reader Testing Checklist

- [ ] All content is accessible via screen reader
- [ ] Headings provide proper page structure
- [ ] Landmarks (nav, main, aside) are announced
- [ ] Form labels are associated with inputs
- [ ] Required fields are indicated
- [ ] Error messages are announced
- [ ] Success messages are announced
- [ ] Loading states are announced
- [ ] Dynamic content changes are announced
- [ ] Images have appropriate alt text
- [ ] Decorative images are hidden from screen readers
- [ ] Tables have proper headers
- [ ] Links have descriptive text
- [ ] Buttons have clear labels
- [ ] Status messages are announced

## Color Contrast Testing

### Automated Testing

Color contrast is tested automatically in the test suite, but manual verification is recommended.

### Manual Testing Tools

1. **Browser DevTools**:
   - Chrome DevTools: Inspect element → Accessibility pane
   - Shows contrast ratio for text elements

2. **WebAIM Contrast Checker**:
   - Visit https://webaim.org/resources/contrastchecker/
   - Enter foreground and background colors
   - Verify WCAG AA compliance

3. **Colour Contrast Analyser**:
   - Download from https://www.tpgi.com/color-contrast-checker/
   - Use eyedropper tool to check colors on screen

### Contrast Requirements

- **Normal text** (< 18pt): Minimum 4.5:1 contrast ratio
- **Large text** (≥ 18pt or ≥ 14pt bold): Minimum 3:1 contrast ratio
- **UI components**: Minimum 3:1 contrast ratio
- **Focus indicators**: Minimum 3:1 contrast ratio

### Testing Checklist

- [ ] Body text meets 4.5:1 contrast ratio
- [ ] Headings meet appropriate contrast ratio
- [ ] Button text meets contrast requirements
- [ ] Link text meets contrast requirements
- [ ] Form labels meet contrast requirements
- [ ] Error messages meet contrast requirements
- [ ] Status indicators meet contrast requirements
- [ ] Focus indicators are clearly visible
- [ ] Information is not conveyed by color alone

## Accessibility Checklist

### Keyboard Accessibility

- [ ] All functionality available via keyboard
- [ ] Logical tab order throughout application
- [ ] Visible focus indicators on all interactive elements
- [ ] No keyboard traps
- [ ] Skip navigation links provided
- [ ] Keyboard shortcuts documented
- [ ] Modal focus management works correctly

### Screen Reader Accessibility

- [ ] Semantic HTML used throughout
- [ ] Proper heading hierarchy (H1 → H2 → H3)
- [ ] ARIA labels on interactive elements
- [ ] ARIA live regions for dynamic content
- [ ] Form labels properly associated
- [ ] Error messages announced
- [ ] Loading states announced
- [ ] Alt text for all images
- [ ] Decorative images hidden from screen readers

### Visual Accessibility

- [ ] Color contrast meets WCAG AA standards
- [ ] Information not conveyed by color alone
- [ ] Text can be resized to 200% without loss of functionality
- [ ] Content reflows at 320px viewport width
- [ ] No horizontal scrolling at 100% zoom

### Forms

- [ ] All form fields have labels
- [ ] Required fields are indicated
- [ ] Error messages are clear and specific
- [ ] Error messages are associated with fields
- [ ] Form validation is accessible
- [ ] Success messages are announced

### Navigation

- [ ] Consistent navigation across pages
- [ ] Current page indicated in navigation
- [ ] Breadcrumb navigation provided
- [ ] Multiple ways to navigate (menu, search, breadcrumbs)

### Content

- [ ] Page titles are descriptive and unique
- [ ] Link text is descriptive
- [ ] Headings describe content sections
- [ ] Language of page is specified
- [ ] Abbreviations are explained

### Responsive Design

- [ ] Application works on mobile devices
- [ ] Touch targets are at least 44x44px
- [ ] Content is readable without zooming
- [ ] Orientation changes supported

## Tools and Resources

### Testing Tools

- **axe DevTools**: Browser extension for accessibility testing
- **WAVE**: Web accessibility evaluation tool
- **Lighthouse**: Built into Chrome DevTools
- **NVDA**: Free screen reader for Windows
- **VoiceOver**: Built-in screen reader for macOS/iOS
- **TalkBack**: Built-in screen reader for Android

### Resources

- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **WebAIM**: https://webaim.org/
- **A11y Project**: https://www.a11yproject.com/
- **MDN Accessibility**: https://developer.mozilla.org/en-US/docs/Web/Accessibility
- **Inclusive Components**: https://inclusive-components.design/

### Browser Extensions

- **axe DevTools**: https://www.deque.com/axe/devtools/
- **WAVE**: https://wave.webaim.org/extension/
- **Accessibility Insights**: https://accessibilityinsights.io/

## Reporting Issues

When reporting accessibility issues, include:

1. **Issue description**: What is the problem?
2. **WCAG criterion**: Which guideline is violated?
3. **Severity**: Critical, serious, moderate, or minor
4. **Steps to reproduce**: How to encounter the issue
5. **Expected behavior**: What should happen
6. **Actual behavior**: What actually happens
7. **Screenshots/videos**: Visual evidence if applicable
8. **Assistive technology**: Screen reader, browser, OS version

## Continuous Testing

Accessibility testing should be:

- **Automated**: Run tests in CI/CD pipeline
- **Manual**: Perform manual testing for each release
- **Ongoing**: Test new features as they're developed
- **User-focused**: Include users with disabilities in testing

## Compliance

This application aims to meet **WCAG 2.1 Level AA** compliance.

### WCAG 2.1 Principles

1. **Perceivable**: Information must be presentable to users
2. **Operable**: UI components must be operable
3. **Understandable**: Information and UI must be understandable
4. **Robust**: Content must be robust enough for assistive technologies

## Support

For accessibility questions or issues:

- Review this documentation
- Check automated test results
- Consult WCAG 2.1 guidelines
- Contact the development team

---

**Note**: While automated testing catches many issues, manual testing with real assistive technologies is essential for ensuring true accessibility. Always test with actual screen readers and keyboard-only navigation.
