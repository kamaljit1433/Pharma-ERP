# Breadcrumbs Component

## Overview

The Breadcrumbs component provides automatic breadcrumb navigation for nested pages in the Employee Management System frontend. It dynamically generates breadcrumb trails based on the current route path using React Router's location.

**Requirements:** 4.9 - Display breadcrumb navigation for nested pages

## Features

- ✅ **Automatic Generation**: Breadcrumbs are automatically generated from the current URL path
- ✅ **Clickable Navigation**: All intermediate breadcrumbs are clickable links for easy navigation
- ✅ **Smart Formatting**: Route segments are formatted into readable labels (kebab-case → Title Case)
- ✅ **Custom Labels**: Predefined labels for common routes (e.g., "bank-details" → "Bank Details")
- ✅ **Home Icon**: Dashboard link includes a home icon for visual clarity
- ✅ **Accessibility**: Full WCAG 2.1 AA compliance with proper ARIA attributes
- ✅ **Responsive**: Works seamlessly on mobile, tablet, and desktop devices
- ✅ **Theme Support**: Integrates with the application's light/dark theme system

## Usage

### Basic Integration

The Breadcrumbs component is already integrated into the MainLayout component and will automatically render for all nested pages:

```tsx
import { MainLayout } from '@/components/layout';

function MyPage() {
  return (
    <MainLayout>
      {/* Your page content */}
    </MainLayout>
  );
}
```

### Standalone Usage

You can also use the Breadcrumbs component independently:

```tsx
import { Breadcrumbs } from '@/components/layout';

function CustomLayout() {
  return (
    <div>
      <Breadcrumbs />
      {/* Your content */}
    </div>
  );
}
```

## Behavior

### When Breadcrumbs Are Displayed

Breadcrumbs are displayed for all nested pages **except**:
- Root path (`/`)
- Dashboard page (`/dashboard`)

### Breadcrumb Generation Examples

| Current Path | Breadcrumbs Displayed |
|--------------|----------------------|
| `/dashboard` | *(none)* |
| `/employees` | Dashboard > **Employees** |
| `/employees/123` | Dashboard > Employees > **123** |
| `/employees/123/edit` | Dashboard > Employees > 123 > **Edit** |
| `/recruitment/jobs/456/candidates` | Dashboard > Recruitment > Jobs > 456 > **Candidates** |

**Note:** The last breadcrumb (in bold) is the current page and is not clickable.

## Route Label Mapping

The component includes predefined labels for common routes:

```typescript
const routeLabels = {
  dashboard: 'Dashboard',
  employees: 'Employees',
  attendance: 'Attendance',
  leave: 'Leave',
  payroll: 'Payroll',
  recruitment: 'Recruitment',
  performance: 'Performance',
  training: 'Training',
  benefits: 'Benefits',
  separation: 'Separation',
  hierarchy: 'Hierarchy',
  settings: 'Settings',
  'bank-details': 'Bank Details',
  'geo-tracking': 'Geo Tracking',
  // ... and more
};
```

### Adding Custom Labels

To add custom labels for new routes, edit the `routeLabels` object in `Breadcrumbs.tsx`:

```typescript
const routeLabels: Record<string, string> = {
  // ... existing labels
  'my-new-route': 'My Custom Label',
};
```

## Accessibility

The Breadcrumbs component follows WCAG 2.1 AA accessibility guidelines:

- **Semantic HTML**: Uses `<nav>` with `aria-label="breadcrumb"`
- **Ordered List**: Breadcrumbs are rendered in an `<ol>` for proper structure
- **Current Page**: Marked with `aria-current="page"` and `aria-disabled="true"`
- **Keyboard Navigation**: All links are keyboard accessible with visible focus indicators
- **Screen Reader Support**: Includes screen reader text for the home icon

## Styling

The component uses Tailwind CSS classes and integrates with the application's theme system:

- **Text Color**: Uses `text-muted-foreground` for inactive breadcrumbs and `text-foreground` for the current page
- **Hover Effects**: Smooth color transitions on hover
- **Focus Indicators**: Visible focus rings for keyboard navigation
- **Responsive**: Adjusts spacing and icon visibility on mobile devices

## Component Structure

```
Breadcrumbs
├── Breadcrumb (nav wrapper)
│   └── BreadcrumbList (ol)
│       ├── BreadcrumbItem (Dashboard)
│       │   └── BreadcrumbLink (clickable)
│       ├── BreadcrumbSeparator (ChevronRight icon)
│       ├── BreadcrumbItem (Intermediate pages)
│       │   └── BreadcrumbLink (clickable)
│       ├── BreadcrumbSeparator
│       └── BreadcrumbItem (Current page)
│           └── BreadcrumbPage (non-clickable)
```

## Testing

The component includes comprehensive unit tests covering:

- ✅ No breadcrumbs on dashboard/root
- ✅ Single-level nested pages
- ✅ Multi-level nested pages
- ✅ Kebab-case formatting
- ✅ Custom label mapping
- ✅ Home icon rendering
- ✅ Clickable intermediate breadcrumbs
- ✅ Separator rendering
- ✅ Complex nested routes
- ✅ Accessibility attributes
- ✅ Trailing/leading slash handling

Run tests with:

```bash
npm test -- Breadcrumbs.test.tsx
```

## Implementation Details

### Path Parsing

The component parses the current pathname using the following logic:

1. Remove leading and trailing slashes
2. Split by `/` to get segments
3. Filter out empty segments
4. Build breadcrumb objects with path and label

### Label Formatting

Labels are formatted using this priority:

1. **Custom Label**: Check `routeLabels` mapping
2. **ID Detection**: If segment is a UUID or numeric ID, use as-is
3. **Auto-Format**: Convert kebab-case/snake_case to Title Case

### Performance

- **Memoization**: The component re-renders only when the location changes
- **Minimal DOM**: Only renders necessary elements
- **No External API Calls**: All logic is client-side

## Browser Support

The Breadcrumbs component works in all modern browsers:

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Related Components

- **MainLayout**: Parent component that includes Breadcrumbs
- **Header**: Sibling component in the layout
- **Sidebar**: Sibling component in the layout
- **UI Breadcrumb Components**: Base primitives in `@/components/ui/breadcrumb`

## Future Enhancements

Potential improvements for future iterations:

- [ ] Breadcrumb ellipsis for very long paths (e.g., Dashboard > ... > Current)
- [ ] Custom breadcrumb overrides via route metadata
- [ ] Breadcrumb dropdown menus for complex hierarchies
- [ ] Breadcrumb history/back navigation
- [ ] Animated transitions between breadcrumb changes

## Support

For issues or questions about the Breadcrumbs component, please refer to:

- Component source: `frontend/src/components/layout/Breadcrumbs.tsx`
- UI primitives: `frontend/src/components/ui/breadcrumb.tsx`
- Tests: `frontend/src/components/layout/__tests__/Breadcrumbs.test.tsx`
- Design spec: `.kiro/specs/frontend-application/design.md`
