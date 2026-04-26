import React from 'react';
import { Menu, Search } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { NotificationBell } from './NotificationBell';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';
import { SearchBar } from './SearchBar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

/**
 * Header Component
 * 
 * Main application header with:
 * - Logo and app title
 * - Search bar (optional feature)
 * - Notification bell with badge
 * - Theme toggle
 * - User menu with profile and logout
 * - Mobile hamburger menu toggle
 * - Keyboard navigation support
 * 
 * Requirements: 4.6, 4.7, 4.3, 21.1, 21.2, 21.3
 */
export const Header: React.FC<HeaderProps> = ({ className }) => {
  const { toggleSidebar, sidebarOpen } = useUIStore();
  const [showSearch, setShowSearch] = React.useState(false);

  // Handle keyboard navigation for mobile search
  const handleSearchToggle = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setShowSearch(!showSearch);
    }
  };

  return (
    <header
      role="banner"
      className={cn(
        'sticky top-0 z-30 flex h-16 items-center border-b bg-card px-4 shadow-sm',
        className
      )}
    >
      <div className="flex w-full items-center justify-between gap-4">
        {/* Left section: Hamburger menu + Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger menu toggle - Requirement 21.1 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden"
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={sidebarOpen}
            aria-controls="navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo and app title */}
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground"
              role="img"
              aria-label="Employee Management System logo"
            >
              <span className="text-sm font-bold">EMS</span>
            </div>
            <h1 className="hidden text-lg font-semibold sm:block">
              Employee Management
            </h1>
          </div>
        </div>

        {/* Center section: Search bar (desktop) - Requirement 21.1 */}
        <div className="hidden flex-1 justify-center md:flex">
          <SearchBar className="max-w-md" />
        </div>

        {/* Right section: Actions - Requirement 21.2 (logical tab order) */}
        <nav
          className="flex items-center gap-2"
          aria-label="User actions"
        >
          {/* Mobile search toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSearch(!showSearch)}
            onKeyDown={handleSearchToggle}
            className="md:hidden"
            aria-label="Toggle search"
            aria-expanded={showSearch}
            aria-controls="mobile-search"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Notification bell - Requirement 21.1 */}
          <NotificationBell />

          {/* Theme toggle - Requirement 21.1 */}
          <ThemeToggle />

          {/* User menu - Requirement 21.1 */}
          <UserMenu />
        </nav>
      </div>

      {/* Mobile search bar (expanded) - Requirement 21.1 */}
      {showSearch && (
        <div
          id="mobile-search"
          className="absolute left-0 right-0 top-16 border-b bg-card p-4 shadow-md md:hidden"
          role="search"
        >
          <SearchBar onClose={() => setShowSearch(false)} />
        </div>
      )}
    </header>
  );
};

export default Header;
