import React, { useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Breadcrumbs } from './Breadcrumbs';

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
 * 
 * Requirements: 4.1, 4.2
 */
export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { sidebarOpen, setSidebarOpen } = useUIStore();

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

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card transition-all duration-300 ease-in-out',
          // Mobile: Full overlay when open, hidden when closed
          'md:relative md:z-auto',
          // Width transitions
          sidebarOpen
            ? 'w-64 translate-x-0'
            : 'w-0 -translate-x-full md:w-16 md:translate-x-0'
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
          aria-hidden="true"
        />
      )}

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="container mx-auto p-4 md:p-6 lg:p-8">
            {/* Breadcrumb navigation - Requirement 4.9 */}
            <Breadcrumbs />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
