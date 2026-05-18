import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { getNavigationForRole } from '@/utils/navigation';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface SidebarProps {
  className?: string;
}

/**
 * Sidebar Component
 * 
 * Provides role-based navigation with:
 * - Role-based navigation links with icons
 * - Active route highlighting
 * - User profile summary
 * - Mobile overlay behavior
 * - Collapsible sidebar
 * - Full keyboard navigation support
 * 
 * Requirements: 4.4, 4.5, 4.3, 21.1, 21.2, 21.3
 */
export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  // Get navigation items based on user role
  const navigationItems = user ? getNavigationForRole(user.role) : [];

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user) return 'U';
    const email = user.email || '';
    return email.charAt(0).toUpperCase();
  };

  // Get icon component from lucide-react
  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className="h-5 w-5" aria-hidden="true" /> : null;
  };

  // Check if route is active
  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Handle keyboard navigation for collapse toggle
  const handleCollapseKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setSidebarOpen(!sidebarOpen);
    }
  };

  if (!user) return null;

  return (
    <aside
      className={cn(
        'flex h-full flex-col bg-card',
        className
      )}
    >
      {/* User Profile Summary */}
      <div
        className={cn(
          'flex items-center gap-3 border-b p-4',
          !sidebarOpen && 'justify-center'
        )}
        role="region"
        aria-label="User profile"
      >
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={undefined} alt={user.email} />
          <AvatarFallback>{getUserInitials()}</AvatarFallback>
        </Avatar>
        
        {sidebarOpen && (
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium">
              {user.email}
            </p>
            <p className="truncate text-xs text-muted-foreground capitalize">
              {user.role.replace(/_/g, ' ')}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Links - Requirement 21.1, 21.2 */}
      <nav
        className="flex-1 overflow-y-auto p-2"
        aria-label="Main navigation"
      >
        <ul className="space-y-1" role="list">
          {navigationItems.map((item) => {
            const isActive = isActiveRoute(item.path);
            
            return (
              <li key={item.id} role="listitem">
                <NavLink
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    isActive && 'bg-accent text-accent-foreground',
                    !sidebarOpen && 'justify-center'
                  )}
                  title={!sidebarOpen ? item.label : undefined}
                  aria-label={!sidebarOpen ? item.label : undefined}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="flex-shrink-0">
                    {getIcon(item.icon)}
                  </span>
                  {sidebarOpen && (
                    <span className="flex-1 truncate">{item.label}</span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <Separator />

      {/* Collapse Toggle (Desktop only) - Requirement 21.1 */}
      <div className="hidden border-t p-2 pb-safe md:block">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          onKeyDown={handleCollapseKeyDown}
          className={cn(
            'w-full',
            !sidebarOpen && 'justify-center'
          )}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-expanded={sidebarOpen}
        >
          {sidebarOpen ? (
            <>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              <span className="ml-2">Collapse</span>
            </>
          ) : (
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
