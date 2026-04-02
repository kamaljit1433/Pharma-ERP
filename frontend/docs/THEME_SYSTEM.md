# Theme System Implementation

## Overview

The Employee Management System frontend implements a comprehensive theme system supporting light and dark modes with smooth transitions, system preference detection, and mobile browser integration.

## Requirements Implemented

- **24.1**: Support for light and dark modes
- **24.2**: CSS variables for theme colors
- **24.3**: Consistent theme application across all components
- **24.4**: Theme preference persistence in localStorage
- **24.5**: System theme preference detection on first load
- **24.6**: Theme toggle in the header
- **24.7**: Smooth theme transition animations
- **24.8**: Text readability in both themes (WCAG 2.1 AA compliant)
- **24.9**: Meta theme-color updates for mobile browsers

## Architecture

### Components

1. **ThemeToggle Component** (`src/components/layout/ThemeToggle.tsx`)
   - Toggle button with Moon/Sun icons
   - Accessible with proper ARIA labels
   - Integrated with uiStore

2. **Theme Utility** (`src/utils/theme.ts`)
   - System theme detection
   - Theme application logic
   - Meta theme-color management
   - System theme change watcher

3. **UI Store** (`src/store/uiStore.ts`)
   - Theme state management
   - Persistence with Zustand middleware
   - Theme initialization

4. **Theme Initialization Hook** (`src/hooks/useThemeInitialization.ts`)
   - Initializes theme on app load
   - Optionally watches system theme changes

### CSS Variables

Theme colors are defined in `src/index.css` using HSL color space:

**Light Mode:**
- Background: `#FFFFFF` (Pure White)
- Foreground: `#0A0A0A` (Near Black)
- Primary: `#171717` (Black)
- Muted: `#F5F5F5` (Light Gray)

**Dark Mode:**
- Background: `#0A0A0A` (Near Black)
- Foreground: `#FAFAFA` (Off White)
- Primary: `#FAFAFA` (White)
- Muted: `#262626` (Dark Gray)

### Transition Animations

Smooth 0.3s ease transitions are applied to:
- `background-color`
- `border-color`
- `color`

Transitions are disabled for interactive elements (inputs, buttons during active state) to maintain responsiveness.

## Usage

### Basic Usage

The theme system is automatically initialized in `App.tsx`:

```typescript
import { useThemeInitialization } from '@/hooks/useThemeInitialization';

function App() {
  // Initialize theme with system preference watching
  useThemeInitialization(true);
  
  return <div>...</div>;
}
```

### Manual Theme Control

```typescript
import { useUIStore } from '@/store/uiStore';

function MyComponent() {
  const { theme, setTheme, toggleTheme } = useUIStore();
  
  // Get current theme
  console.log(theme); // 'light' or 'dark'
  
  // Set specific theme
  setTheme('dark');
  
  // Toggle theme
  toggleTheme();
}
```

### Using Theme in Components

Components automatically respond to theme changes through CSS variables:

```typescript
<div className="bg-background text-foreground">
  <Card className="bg-card text-card-foreground">
    Content adapts to theme automatically
  </Card>
</div>
```

## Testing

Unit tests are provided for:

1. **Theme Utility** (`src/utils/__tests__/theme.test.ts`)
   - System theme detection
   - Theme storage and retrieval
   - Theme application
   - Meta theme-color updates
   - System theme watching

2. **ThemeToggle Component** (`src/components/layout/__tests__/ThemeToggle.test.tsx`)
   - Icon rendering based on theme
   - Toggle functionality
   - Accessibility attributes

Run tests:
```bash
npm test -- src/utils/__tests__/theme.test.ts
npm test -- src/components/layout/__tests__/ThemeToggle.test.tsx
```

## Mobile Browser Integration

The theme system updates the `<meta name="theme-color">` tag dynamically:

- Light mode: `#ffffff` (white)
- Dark mode: `#0a0a0a` (near black)

This provides a native feel on mobile browsers by matching the browser chrome to the app theme.

## Accessibility

The theme system ensures WCAG 2.1 AA compliance:

- Minimum 4.5:1 contrast ratio for normal text
- Minimum 3:1 contrast ratio for large text
- Proper ARIA labels on theme toggle button
- Keyboard navigation support

## System Preference Detection

On first load, the theme system:

1. Checks localStorage for saved preference
2. Falls back to system preference if no saved preference exists
3. Applies the detected theme immediately
4. Optionally watches for system theme changes

## Persistence

Theme preference is automatically persisted to localStorage using Zustand's persist middleware:

```json
{
  "state": {
    "theme": "dark",
    "sidebarOpen": true
  },
  "version": 0
}
```

## Future Enhancements

Potential improvements:

1. Custom brand color themes
2. High contrast mode
3. Color blindness-friendly palettes
4. Per-user theme preferences (server-side)
5. Scheduled theme switching (e.g., auto dark mode at night)
