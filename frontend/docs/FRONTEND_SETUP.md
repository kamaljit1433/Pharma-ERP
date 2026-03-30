# Frontend Infrastructure Setup

This document describes the frontend infrastructure setup for the Employee Management System PWA.

## Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **PWA**: vite-plugin-pwa with Workbox
- **Routing**: React Router v6
- **State Management**: Zustand with persist middleware
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Fonts**: Inter (primary), JetBrains Mono (monospace)

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── ui/           # shadcn/ui components
│   ├── lib/              # Utility functions
│   ├── pages/            # Page components
│   ├── routes/           # Router configuration
│   ├── store/            # Zustand stores
│   ├── App.tsx           # Root component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles with theme
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Theme Configuration

### Color Palette

The application uses a monochromatic base theme with semantic accent colors:

**Base Colors:**
- Background: Pure White (#FFFFFF)
- Foreground: Near Black (#0A0A0A)
- Muted: Light Gray (#F5F5F5)
- Border: Border Gray (#E5E5E5)

**Semantic Colors:**
- Success: Green (#16A34A)
- Warning: Amber (#F59E0B)
- Error/Destructive: Red (#EF4444)
- Info: Blue (#3B82F6)
- Pending: Orange (#FB923C)
- Approved: Emerald (#10B981)
- Rejected: Rose (#E11D48)

### Typography

- **Primary Font**: Inter (400, 500, 600, 700)
- **Monospace Font**: JetBrains Mono (400, 500, 600, 700)

Font sizes follow Tailwind's default scale (xs, sm, base, lg, xl, 2xl, 3xl, 4xl).

## PWA Configuration

The application is configured as a Progressive Web App with:

- Auto-update registration
- Service worker with Workbox
- Offline support for static assets
- Runtime caching for:
  - Google Fonts (CacheFirst, 1 year)
  - API calls (NetworkFirst, 5 minutes)
- Manifest with app metadata and icons

## State Management

### Stores

1. **authStore** (`src/store/authStore.ts`)
   - User authentication state
   - Token management
   - Persisted to localStorage

2. **uiStore** (`src/store/uiStore.ts`)
   - UI state (sidebar, theme)
   - Not persisted

## UI Components

The following shadcn/ui components are set up:

- Button (with variants: default, secondary, outline, ghost, destructive, link)
- Card (with Header, Title, Description, Content, Footer)
- Badge (with status variants)
- Input
- Label
- Separator

Additional components can be added as needed following the shadcn/ui pattern.

## Development

### Running the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Linting and Formatting

```bash
npm run lint        # Check for linting errors
npm run lint:fix    # Fix linting errors
npm run format      # Format code with Prettier
```

## Path Aliases

The following path aliases are configured:

- `@/*` → `src/*`
- `@components/*` → `src/components/*`
- `@pages/*` → `src/pages/*`
- `@services/*` → `src/services/*`
- `@hooks/*` → `src/hooks/*`
- `@utils/*` → `src/utils/*`
- `@types/*` → `src/types/*`
- `@store/*` → `src/store/*`
- `@lib/*` → `src/lib/*`

## Next Steps

The following features will be implemented in subsequent tasks:

1. Authentication system integration
2. API service layer
3. Module-specific pages (Employees, Attendance, Leave, Payroll, etc.)
4. Advanced UI components (Tables, Forms, Dialogs, etc.)
5. Real-time notifications
6. Offline data synchronization
7. Face detection integration
8. GPS tracking integration

## Notes

- The theme is designed to be WCAG 2.1 AA compliant
- All components support keyboard navigation
- The PWA is installable on mobile and desktop devices
- Service worker caching strategies are optimized for performance
