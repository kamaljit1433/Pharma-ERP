# Accessibility Testing Checklist

Use this checklist to verify accessibility compliance before each release.

## Automated Testing

- [ ] All automated accessibility tests pass (`npm run test:a11y`)
- [ ] No axe-core violations reported
- [ ] Test coverage includes all major components
- [ ] Test coverage includes all pages
- [ ] Color contrast tests pass

## Keyboard Navigation

### General Navigation

- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical and follows visual layout
- [ ] Focus indicators are clearly visible on all elements
- [ ] No keyboard traps exist
- [ ] Shift+Tab navigates backward correctly

### Skip Navigation

- [ ] Skip to main content link is first focusable element
- [ ] Skip link is visible when focused
- [ ] Skip link correctly moves focus to main content
- [ ] Skip to navigation link works (if applicable)

### Forms

- [ ] All form fields are keyboard accessible
- [ ] Tab order through form fields is logical
- [ ] Enter key submits forms from input fields
- [ ] Space key toggles checkboxes and switches
- [ ] Required fields are clearly indicated
- [ ] Error messages are keyboard accessible
- [ ] Form validation works with keyboard only

### Buttons and Links

- [ ] Buttons activate with Enter key
- [ ] Buttons activate with Space key
- [ ] Links activate with Enter key
- [ ] Button and link text is descriptive

### Modals and Dialogs

- [ ] Focus moves to modal when opened
- [ ] Focus is trapped within modal
- [ ] Tab cycles through modal elements
- [ ] Escape key closes modal
- [ ] Focus returns to trigger element when closed

### Dropdowns and Menus

- [ ] Dropdowns open with Enter or Space
- [ ] Arrow keys navigate menu items
- [ ] Enter selects menu item
- [ ] Escape closes dropdown
- [ ] Focus returns to trigger when closed

### Data Tables

- [ ] Column headers are keyboard accessible
- [ ] Sort controls work with keyboard
- [ ] Pagination controls are keyboard accessible
- [ ] Filter controls are keyboard accessible

### Keyboard Shortcuts

- [ ] Alt+N focuses navigation (if implemented)
- [ ] Alt+M focuses main content (if implemented)
- [ ] Keyboard shortcuts don't conflict with browser shortcuts
- [ ] Keyboard shortcuts are documented

## Screen Reader Testing

### NVDA (Windows) or VoiceOver (macOS)

#### Page Structure

- [ ] Page title is announced
- [ ] Headings are announced with correct level
- [ ] Heading hierarchy is logical (H1 → H2 → H3)
- [ ] Landmarks are announced (navigation, main, aside, footer)
- [ ] Page language is specified

#### Navigation

- [ ] Navigation menu is announced as navigation
- [ ] Menu items are announced correctly
- [ ] Current page is indicated
- [ ] Breadcrumbs are announced correctly
- [ ] Links have descriptive text

#### Forms

- [ ] Form labels are announced
- [ ] Labels are associated with inputs
- [ ] Required fields are indicated
- [ ] Field types are announced (text, email, password, etc.)
- [ ] Error messages are announced
- [ ] Error messages are associated with fields
- [ ] Success messages are announced
- [ ] Help text is announced

#### Buttons and Controls

- [ ] Button labels are announced
- [ ] Button states are announced (pressed, expanded, etc.)
- [ ] Icon-only buttons have aria-labels
- [ ] Toggle buttons announce state

#### Tables

- [ ] Table structure is announced
- [ ] Column headers are announced
- [ ] Row headers are announced (if applicable)
- [ ] Table caption is announced (if applicable)
- [ ] Cell content is announced

#### Images

- [ ] Images have alt text
- [ ] Alt text is descriptive
- [ ] Decorative images are hidden (alt="" or aria-hidden)
- [ ] Complex images have extended descriptions

#### Dynamic Content

- [ ] Loading states are announced
- [ ] Content updates are announced
- [ ] Error messages are announced
- [ ] Success messages are announced
- [ ] Live regions work correctly (aria-live)
- [ ] Status messages are announced

#### Lists

- [ ] Lists are announced as lists
- [ ] List item count is announced
- [ ] Nested lists are announced correctly

## Visual Accessibility

### Color Contrast

- [ ] Body text meets 4.5:1 contrast ratio
- [ ] Large text meets 3:1 contrast ratio
- [ ] Button text meets contrast requirements
- [ ] Link text meets contrast requirements
- [ ] Form labels meet contrast requirements
- [ ] Error messages meet contrast requirements
- [ ] Focus indicators meet 3:1 contrast ratio
- [ ] UI components meet 3:1 contrast ratio

### Color Usage

- [ ] Information is not conveyed by color alone
- [ ] Status indicators use icons or text in addition to color
- [ ] Required fields use asterisk or text, not just color
- [ ] Error states use icons or text, not just color
- [ ] Charts and graphs have patterns or labels

### Text and Typography

- [ ] Text can be resized to 200% without loss of functionality
- [ ] Text doesn't overflow containers when resized
- [ ] Line height is at least 1.5 for body text
- [ ] Paragraph spacing is adequate
- [ ] Font size is readable (minimum 16px for body text)

### Layout and Spacing

- [ ] Content reflows at 320px viewport width
- [ ] No horizontal scrolling at 100% zoom
- [ ] Touch targets are at least 44x44px
- [ ] Adequate spacing between interactive elements
- [ ] Content is readable without zooming on mobile

## Responsive Design

### Mobile Testing

- [ ] Application works on mobile devices
- [ ] Touch targets are large enough (44x44px minimum)
- [ ] Content is readable without zooming
- [ ] Forms are usable on mobile
- [ ] Navigation works on mobile
- [ ] Modals work on mobile
- [ ] Tables are accessible on mobile (scroll or card layout)

### Orientation

- [ ] Application works in portrait orientation
- [ ] Application works in landscape orientation
- [ ] Content adapts to orientation changes

### Breakpoints

- [ ] Mobile breakpoint (< 768px) works correctly
- [ ] Tablet breakpoint (768-1024px) works correctly
- [ ] Desktop breakpoint (> 1024px) works correctly

## Content Accessibility

### Headings

- [ ] Each page has one H1
- [ ] Heading hierarchy is logical
- [ ] Headings describe content sections
- [ ] No heading levels are skipped

### Links

- [ ] Link text is descriptive
- [ ] Links make sense out of context
- [ ] External links are indicated
- [ ] Links that open in new window are indicated

### Language

- [ ] Page language is specified (lang attribute)
- [ ] Language changes are marked (lang attribute)
- [ ] Abbreviations are explained (first use)

### Timing

- [ ] No time limits on interactions (or can be extended)
- [ ] Auto-playing content can be paused
- [ ] Animations can be disabled (prefers-reduced-motion)

## Forms and Input

### Form Structure

- [ ] Forms have descriptive labels
- [ ] Related fields are grouped (fieldset/legend)
- [ ] Form purpose is clear
- [ ] Submit button is clearly labeled

### Form Validation

- [ ] Validation errors are clear and specific
- [ ] Errors are announced to screen readers
- [ ] Errors are associated with fields
- [ ] Inline validation doesn't interfere with input
- [ ] Success messages are announced

### Input Types

- [ ] Appropriate input types are used (email, tel, date, etc.)
- [ ] Autocomplete attributes are used where appropriate
- [ ] Input format is explained (if specific format required)

## Interactive Components

### Modals and Dialogs

- [ ] Modal has role="dialog"
- [ ] Modal has aria-modal="true"
- [ ] Modal has aria-labelledby
- [ ] Modal has aria-describedby (if applicable)
- [ ] Focus is managed correctly
- [ ] Background content is inert

### Tabs

- [ ] Tabs use proper ARIA roles
- [ ] Tab selection is announced
- [ ] Arrow keys navigate tabs
- [ ] Tab panels are associated with tabs

### Accordions

- [ ] Accordion buttons have aria-expanded
- [ ] Accordion buttons have aria-controls
- [ ] Expanded state is announced
- [ ] Content is keyboard accessible

### Tooltips

- [ ] Tooltips are keyboard accessible
- [ ] Tooltips are announced to screen readers
- [ ] Tooltips don't hide on hover (can be read)
- [ ] Tooltips can be dismissed

### Notifications and Alerts

- [ ] Notifications are announced (aria-live)
- [ ] Alerts use role="alert"
- [ ] Notifications can be dismissed
- [ ] Notifications don't auto-dismiss too quickly

## Data Tables

### Table Structure

- [ ] Tables use proper HTML structure
- [ ] Column headers use <th> with scope="col"
- [ ] Row headers use <th> with scope="row" (if applicable)
- [ ] Complex tables use headers attribute
- [ ] Table has caption or aria-label

### Table Features

- [ ] Sort controls are keyboard accessible
- [ ] Sort state is announced
- [ ] Pagination is keyboard accessible
- [ ] Filters are keyboard accessible
- [ ] Row selection is keyboard accessible

## Testing Tools Used

- [ ] axe DevTools browser extension
- [ ] WAVE browser extension
- [ ] Lighthouse accessibility audit
- [ ] NVDA screen reader (Windows)
- [ ] VoiceOver screen reader (macOS)
- [ ] Keyboard-only navigation
- [ ] Color contrast analyzer

## Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Compliance Verification

- [ ] WCAG 2.1 Level A compliance
- [ ] WCAG 2.1 Level AA compliance
- [ ] No critical accessibility violations
- [ ] No serious accessibility violations
- [ ] Moderate violations documented and planned for fix

## Documentation

- [ ] Accessibility features are documented
- [ ] Keyboard shortcuts are documented
- [ ] Known issues are documented
- [ ] Remediation plan exists for any violations

## User Testing

- [ ] Testing with users who use screen readers
- [ ] Testing with users who use keyboard only
- [ ] Testing with users with low vision
- [ ] Testing with users with motor disabilities
- [ ] Feedback incorporated into improvements

## Notes

Use this space to document any issues found, workarounds, or planned improvements:

---

**Testing Date**: _______________

**Tested By**: _______________

**Version**: _______________

**Overall Status**: ☐ Pass ☐ Pass with minor issues ☐ Fail

**Critical Issues**: _______________

**Action Items**: _______________
