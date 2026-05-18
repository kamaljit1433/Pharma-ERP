import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Breadcrumbs } from './Breadcrumbs';
import { SkipNavigation } from './SkipNavigation';

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * MainLayout Component
 * 
 * Provides the main application layout structure with:
 * - Responsive header, sidebar, and main content area
 * - Mobile (< 768px), tablet (768-1024px), desktop (> 1024px) breakpoints
 * - Sidebar collapse state management
 * - Skip navigation links for keyboard accessibility
 * - Proper ARIA landmarks and semantic HTML
 * 
 * Requirements: 4.1, 4.2, 21.1, 21.2, 21.3, 21.10
 */
export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname, setSidebarOpen]);

  // Close sidebar on mobile by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      }
    };

    // Set initial state
    handleResize();

    // Listen for window resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);

  // Handle keyboard shortcuts for accessibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt + N: Focus navigation
      if (event.altKey && event.key === 'n') {
        event.preventDefault();
        const nav = document.getElementById('navigation');
        if (nav) {
          const firstLink = nav.querySelector('a');
          firstLink?.focus();
        }
      }
      
      // Alt + M: Focus main content
      if (event.altKey && event.key === 'm') {
        event.preventDefault();
        const main = document.getElementById('main-content');
        main?.focus();
      }

      // Escape: Close sidebar on mobile
      if (event.key === 'Escape' && sidebarOpen && window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen, setSidebarOpen]);

  return (
    <>
      {/* Skip Navigation Links - Requirement 21.10 */}
      <SkipNavigation />

      <div className="flex h-screen overflow-hidden overflow-x-hidden bg-background">
        {/* Sidebar Navigation - Requirement 21.1, 21.2 */}
        <aside
          id="navigation"
          role="navigation"
          aria-label="Main navigation"
          className={cn(
            'fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card transition-all duration-300 ease-in-out overflow-hidden',
            // Mobile: Full overlay when open, hidden when closed
            'md:relative md:z-auto',
            // Width transitions — keep w-64 so -translate-x-full actually slides off-screen
            sidebarOpen
              ? 'w-64 translate-x-0'
              : 'w-64 -translate-x-full md:w-16 md:translate-x-0'
          )}
        >
          {/* Render Sidebar component */}
          <Sidebar />
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSidebarOpen(false);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Close navigation menu"
          />
        )}

        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <Header />

          {/* Main content - Requirement 21.1, 21.2 */}
          <main
            id="main-content"
            role="main"
            aria-label="Main content"
            tabIndex={-1}
            className="flex-1 overflow-y-auto overflow-x-hidden focus:outline-none"
          >
            <div className="w-full max-w-screen-2xl mx-auto px-3 py-4 pb-safe sm:px-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
              {/* Breadcrumb navigation - Requirement 4.9 */}
              <Breadcrumbs />
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default MainLayout;
