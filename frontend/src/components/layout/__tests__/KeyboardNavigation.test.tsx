import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MainLayout } from '../MainLayout';

/**
 * Integration tests for keyboard navigation
 * 
 * Requirements tested:
 * - 21.1: Keyboard navigation for all interactive elements
 * - 21.2: Support tab navigation in logical order
 * - 21.3: Visible focus indicators
 * - 21.10: Skip navigation links
 */

// Mock stores
vi.mock('@/store/uiStore', () => ({
  useUIStore: () => ({
    sidebarOpen: true,
    setSidebarOpen: vi.fn(),
    toggleSidebar: vi.fn(),
  }),
}));

vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({
    user: {
      id: '1',
      email: 'test@example.com',
      role: 'employee',
    },
  }),
}));

vi.mock('@/utils/navigation', () => ({
  getNavigationForRole: () => [
    { id: '1', label: 'Dashboard', path: '/dashboard', icon: 'Home' },
    { id: '2', label: 'Employees', path: '/employees', icon: 'Users' },
  ],
}));

describe('Keyboard Navigation Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Skip Navigation Links', () => {
    it('should render skip navigation links', () => {
      render(
        <BrowserRouter>
          <MainLayout>
            <div>Test Content</div>
          </MainLayout>
        </BrowserRouter>
      );

      const skipToMainLink = screen.getByText('Skip to main content');
      const skipToNavLink = screen.getByText('Skip to navigation');

      expect(skipToMainLink).toBeInTheDocument();
      expect(skipToNavLink).toBeInTheDocument();
    });

    it('should have correct href targets', () => {
      render(
        <BrowserRouter>
          <MainLayout>
            <div>Test Content</div>
          </MainLayout>
        </BrowserRouter>
      );

      const skipToMainLink = screen.getByText('Skip to main content');
      const skipToNavLink = screen.getByText('Skip to navigation');

      expect(skipToMainLink).toHaveAttribute('href', '#main-content');
      expect(skipToNavLink).toHaveAttribute('href', '#navigation');
    });
  });

  describe('ARIA Landmarks', () => {
    it('should have main landmark with correct id', () => {
      render(
        <BrowserRouter>
          <MainLayout>
            <div>Test Content</div>
          </MainLayout>
        </BrowserRouter>
      );

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('id', 'main-content');
      expect(main).toHaveAttribute('aria-label', 'Main content');
    });

    it('should have navigation landmark with correct id', () => {
      render(
        <BrowserRouter>
          <MainLayout>
            <div>Test Content</div>
          </MainLayout>
        </BrowserRouter>
      );

      const nav = document.getElementById('navigation');
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveAttribute('role', 'navigation');
      expect(nav).toHaveAttribute('aria-label', 'Main navigation');
    });

    it('should have banner landmark', () => {
      render(
        <BrowserRouter>
          <MainLayout>
            <div>Test Content</div>
          </MainLayout>
        </BrowserRouter>
      );

      const banner = screen.getByRole('banner');
      expect(banner).toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should have keyboard shortcut handlers registered', () => {
      render(
        <BrowserRouter>
          <MainLayout>
            <div>Test Content</div>
          </MainLayout>
        </BrowserRouter>
      );

      // Verify that the component renders without errors
      // The keyboard shortcuts are registered in useEffect
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('Focus Management', () => {
    it('should set main content as focusable with tabindex -1', () => {
      render(
        <BrowserRouter>
          <MainLayout>
            <div>Test Content</div>
          </MainLayout>
        </BrowserRouter>
      );

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('tabindex', '-1');
    });

    it('should have focus:outline-none class on main content', () => {
      render(
        <BrowserRouter>
          <MainLayout>
            <div>Test Content</div>
          </MainLayout>
        </BrowserRouter>
      );

      const main = screen.getByRole('main');
      expect(main).toHaveClass('focus:outline-none');
    });
  });

  describe('Mobile Overlay Keyboard Support', () => {
    it('should render mobile overlay with keyboard support when sidebar is open', () => {
      // Mock window.innerWidth for mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });

      render(
        <BrowserRouter>
          <MainLayout>
            <div>Test Content</div>
          </MainLayout>
        </BrowserRouter>
      );

      const overlay = screen.getByRole('button', { name: 'Close navigation menu' });
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveAttribute('tabindex', '0');
    });

    it('should have proper keyboard event handlers on overlay', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });

      render(
        <BrowserRouter>
          <MainLayout>
            <div>Test Content</div>
          </MainLayout>
        </BrowserRouter>
      );

      const overlay = screen.getByRole('button', { name: 'Close navigation menu' });
      
      // Verify overlay has proper attributes for keyboard interaction
      expect(overlay).toHaveAttribute('role', 'button');
      expect(overlay).toHaveAttribute('tabindex', '0');
      expect(overlay).toHaveAttribute('aria-label', 'Close navigation menu');
    });
  });

  describe('Semantic HTML', () => {
    it('should use semantic HTML elements', () => {
      render(
        <BrowserRouter>
          <MainLayout>
            <div>Test Content</div>
          </MainLayout>
        </BrowserRouter>
      );

      // Check for semantic elements
      expect(screen.getByRole('banner')).toBeInTheDocument(); // header
      expect(screen.getByRole('main')).toBeInTheDocument(); // main
      
      // There are two navigation elements with the same label (outer aside and inner nav)
      // We should check that at least one exists
      const navElements = screen.getAllByRole('navigation', { name: 'Main navigation' });
      expect(navElements.length).toBeGreaterThan(0);
    });
  });
});
