# Layout Components

## MainLayout

The `MainLayout` component provides the main application layout structure with responsive behavior and sidebar management.

### Features

- **Responsive Design**: Adapts to mobile (< 768px), tablet (768-1024px), and desktop (> 1024px) breakpoints
- **Sidebar Management**: Integrates with `uiStore` for sidebar collapse state
- **Mobile Overlay**: Shows a backdrop overlay on mobile when sidebar is open
- **Automatic Behavior**: 
  - Closes sidebar on mobile by default
  - Opens sidebar on desktop by default
  - Responds to window resize events

### Usage

```tsx
import { MainLayout } from '@/components/layout';

function App() {
  return (
    <MainLayout>
      <YourPageContent />
    </MainLayout>
  );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| children | React.ReactNode | Yes | The main content to render inside the layout |

### Layout Structure

```
┌─────────────────────────────────────────┐
│ Sidebar │ Header                        │
│         ├───────────────────────────────┤
│         │                               │
│         │  Main Content Area            │
│         │  (children)                   │
│         │                               │
└─────────────────────────────────────────┘
```

### Responsive Behavior

#### Desktop (≥ 1024px)
- Sidebar is open by default
- Sidebar width: 256px (w-64) when open, 64px (w-16) when collapsed
- No overlay

#### Tablet (768px - 1024px)
- Sidebar behavior controlled by user
- Sidebar width: 256px (w-64) when open, 64px (w-16) when collapsed
- No overlay

#### Mobile (< 768px)
- Sidebar is closed by default
- Sidebar overlays content when open
- Dark backdrop overlay shown when sidebar is open
- Clicking overlay closes sidebar

### Integration with uiStore

The component uses the following from `uiStore`:
- `sidebarOpen`: Current sidebar state
- `setSidebarOpen(open: boolean)`: Set sidebar state

### Accessibility

- Mobile overlay has `aria-hidden="true"` attribute
- Proper semantic HTML structure (header, aside, main)
- Keyboard navigation support (inherited from child components)

### Styling

The component uses Tailwind CSS with the following key classes:
- Responsive utilities: `md:`, `lg:`
- Transitions: `transition-all duration-300 ease-in-out`
- Z-index layers: sidebar (z-50), overlay (z-40), header (z-30)

### Future Enhancements

The following will be added in subsequent tasks:
- Task 7.2: Header component with navigation, notifications, theme toggle
- Task 7.3: Sidebar component with role-based navigation links
- Task 7.5: Breadcrumb navigation

### Requirements

Validates:
- **Requirement 4.1**: Provides a Responsive_Layout with header, sidebar, and main content area
- **Requirement 4.2**: Adapts to mobile (< 768px), tablet (768px-1024px), and desktop (> 1024px) screens


## Sidebar

The `Sidebar` component provides role-based navigation with collapsible behavior and user profile display.

### Features

- **Role-Based Navigation**: Displays navigation links based on user permissions
- **Active Route Highlighting**: Highlights the current active route
- **User Profile Summary**: Shows user avatar, email, and role
- **Collapsible Design**: Can collapse to icon-only mode on desktop
- **Mobile Overlay**: Works as an overlay on mobile devices
- **Icon Support**: Uses Lucide React icons for navigation items

### Usage

```tsx
import { Sidebar } from '@/components/layout';

// The Sidebar is automatically integrated into MainLayout
// It reads user data from authStore and displays appropriate navigation
```

### Role-Based Navigation

Different user roles see different navigation items:

#### Super Admin
- All modules (full access)

#### HR Manager
- Dashboard, Employees, Attendance, Leave, Payroll, Recruitment, Performance, Training, Benefits, Separation, Organization, Settings

#### Department Manager
- Dashboard, Attendance, Leave, Performance, Training, Organization, Settings

#### Finance
- Dashboard, Payroll, Benefits, Organization, Settings

#### Employee
- Dashboard, Attendance, Leave, Performance, Training, Benefits, Organization, Settings

#### IT Admin
- Dashboard, Organization, Settings

### Component Structure

```
┌─────────────────────────┐
│ User Profile Summary    │
│ ┌─────┐                 │
│ │ Av  │ user@email.com  │
│ └─────┘ Role            │
├─────────────────────────┤
│ Navigation Links        │
│ 🏠 Dashboard            │
│ 👥 Employees            │
│ 📅 Attendance           │
│ ...                     │
├─────────────────────────┤
│ [Collapse Button]       │
└─────────────────────────┘
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| className | string | No | Additional CSS classes |

### State Management

The component uses:
- `authStore.user`: Current authenticated user with role
- `uiStore.sidebarOpen`: Sidebar open/collapsed state
- `uiStore.setSidebarOpen`: Function to toggle sidebar state

### Navigation Configuration

Navigation items are defined in `@/utils/navigation.ts`:
- Each item has: id, label, path, icon, requiredPermission
- Filtered by `getNavigationForRole(role)` function
- Icons are dynamically loaded from lucide-react

### Collapsed State

When collapsed (desktop only):
- Width: 64px (w-16)
- Shows only icons
- Hides text labels
- Shows expand button (chevron right)
- Tooltips show on hover (via title attribute)

### Active Route Detection

Routes are considered active if:
- Current path exactly matches the navigation item path
- Current path starts with the navigation item path (for nested routes)

Example: `/employees/123` will highlight the "Employees" navigation item

### Accessibility

- Semantic HTML with `<nav>` and `<ul>` elements
- ARIA labels for collapse/expand buttons
- Keyboard navigation support via NavLink
- Focus indicators on interactive elements
- Title attributes for collapsed state tooltips

### Styling

Key Tailwind classes:
- Transitions: `transition-colors` for smooth hover effects
- Focus: `focus-visible:outline-none focus-visible:ring-2`
- Active state: `bg-accent text-accent-foreground`
- Hover state: `hover:bg-accent hover:text-accent-foreground`

### Integration with MainLayout

The Sidebar is rendered inside the `<aside>` element in MainLayout:
- Fixed positioning on mobile (overlays content)
- Relative positioning on desktop (part of layout)
- Width transitions handled by MainLayout
- Visibility controlled by `sidebarOpen` state

### Requirements

Validates:
- **Requirement 4.4**: Provides a sidebar with role-based navigation links
- **Requirement 4.5**: Highlights the active navigation item
- **Requirement 4.3**: Displays a collapsible hamburger menu on mobile

### Testing

Comprehensive test coverage in `__tests__/Sidebar.test.tsx`:
- Renders nothing when user is not authenticated
- Displays user profile summary
- Shows role-based navigation items
- Handles collapsed/expanded states
- Verifies role-specific navigation visibility
