import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MainLayout } from '../MainLayout';
import { useUIStore } from '@/store/uiStore';

// Mock the uiStore
vi.mock('@/store/uiStore', () => ({
  useUIStore: vi.fn(),
}));

describe('MainLayout', () => {
  const mockSetSidebarOpen = vi.fn();
  const mockToggleSidebar = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      sidebarOpen: true,
      setSidebarOpen: mockSetSidebarOpen,
      toggleSidebar: mockToggleSidebar,
    });
  });

  it('renders children content', () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders with sidebar open by default on desktop', () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );

    const sidebar = document.querySelector('aside');
    expect(sidebar).toBeInTheDocument();
    expect(sidebar).toHaveClass('translate-x-0');
  });

  it('renders with sidebar closed when sidebarOpen is false', () => {
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      sidebarOpen: false,
      setSidebarOpen: mockSetSidebarOpen,
      toggleSidebar: mockToggleSidebar,
    });

    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );

    const sidebar = document.querySelector('aside');
    expect(sidebar).toHaveClass('-translate-x-full');
  });

  it('shows mobile overlay when sidebar is open', () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );

    const overlay = document.querySelector('.fixed.inset-0.z-40');
    expect(overlay).toBeInTheDocument();
  });

  it('does not show mobile overlay when sidebar is closed', () => {
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      sidebarOpen: false,
      setSidebarOpen: mockSetSidebarOpen,
      toggleSidebar: mockToggleSidebar,
    });

    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );

    const overlay = document.querySelector('.fixed.inset-0.z-40');
    expect(overlay).not.toBeInTheDocument();
  });

  it('closes sidebar when clicking mobile overlay', () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );

    const overlay = document.querySelector('.fixed.inset-0.z-40');
    expect(overlay).toBeInTheDocument();

    fireEvent.click(overlay!);
    expect(mockSetSidebarOpen).toHaveBeenCalledWith(false);
  });

  it('renders header section', () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );

    const header = document.querySelector('header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('sticky', 'top-0');
  });

  it('renders main content area', () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );

    const main = document.querySelector('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass('flex-1', 'overflow-y-auto');
  });

  it('applies responsive classes for mobile breakpoint', () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );

    const sidebar = document.querySelector('aside');
    expect(sidebar).toHaveClass('md:relative');
  });

  it('applies responsive padding to main content', () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );

    const container = document.querySelector('.container');
    expect(container).toHaveClass('p-4', 'md:p-6', 'lg:p-8');
  });

  it('handles window resize events', () => {
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );

    // Simulate resize to mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });

    fireEvent(window, new Event('resize'));

    expect(mockSetSidebarOpen).toHaveBeenCalledWith(false);
  });

  it('maintains accessibility with proper ARIA attributes', () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );

    const overlay = document.querySelector('[aria-hidden="true"]');
    expect(overlay).toBeInTheDocument();
  });
});
