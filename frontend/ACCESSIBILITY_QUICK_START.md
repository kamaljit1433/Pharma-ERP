# Accessibility Testing Quick Start Guide

## Quick Commands

```bash
# Run all accessibility tests
npm run test:a11y

# Run tests in watch mode (for development)
npm run test:a11y:watch

# Run tests with coverage report
npm run test:a11y:coverage

# Run all tests (including accessibility)
npm test
```

## Test Status

✅ **70 accessibility tests passing**

- 31 tests: UI components, layout, pages, color contrast, keyboard, ARIA, semantic HTML
- 19 tests: Feature components, tables, forms, navigation, dynamic content
- 20 tests: Keyboard navigation, focus management, shortcuts

## Quick Manual Tests

### 1. Keyboard Navigation (2 minutes)

1. Open the application
2. Press `Tab` repeatedly
3. Verify:
   - ✅ Focus moves through all interactive elements
   - ✅ Focus indicator is clearly visible
   - ✅ Tab order is logical
   - ✅ No keyboard traps

### 2. Screen Reader (5 minutes)

**Windows (NVDA)**:
1. Download from https://www.nvaccess.org/
2. Launch NVDA
3. Navigate with `Insert + Down Arrow`
4. Verify all content is announced

**macOS (VoiceOver)**:
1. Press `Cmd + F5` to enable
2. Navigate with `VO + Right Arrow`
3. Verify all content is announced

### 3. Color Contrast (1 minute)

1. Open Chrome DevTools (F12)
2. Inspect any text element
3. Check Accessibility pane
4. Verify contrast ratio ≥ 4.5:1

## Common Issues & Fixes

### Issue: Button not keyboard accessible
**Fix**: Ensure button has proper role and tabindex
```tsx
<button onClick={handleClick}>Click me</button>
// NOT: <div onClick={handleClick}>Click me</div>
```

### Issue: Form field missing label
**Fix**: Associate label with input
```tsx
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />
```

### Issue: Image missing alt text
**Fix**: Add descriptive alt text
```tsx
<img src="/logo.png" alt="Company logo" />
// Decorative images: <img src="/decoration.png" alt="" />
```

### Issue: Dynamic content not announced
**Fix**: Use aria-live region
```tsx
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
```

## WCAG 2.1 Level AA Checklist

Quick pre-release checklist:

- [ ] All automated tests pass (`npm run test:a11y`)
- [ ] Keyboard navigation works
- [ ] Screen reader announces all content
- [ ] Color contrast meets 4.5:1 ratio
- [ ] Forms have labels
- [ ] Images have alt text
- [ ] No keyboard traps
- [ ] Focus indicators visible

## Documentation

- **Full Guide**: `ACCESSIBILITY_TESTING.md`
- **Detailed Checklist**: `ACCESSIBILITY_CHECKLIST.md`
- **Implementation Summary**: `ACCESSIBILITY_IMPLEMENTATION_SUMMARY.md`

## Resources

- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/
- **WebAIM**: https://webaim.org/
- **axe DevTools**: https://www.deque.com/axe/devtools/

## Need Help?

1. Check the full documentation in `ACCESSIBILITY_TESTING.md`
2. Review test examples in `src/__tests__/accessibility/`
3. Consult WCAG 2.1 guidelines
4. Use axe DevTools browser extension

---

**Remember**: Accessibility is not optional. It's a requirement for all users.
