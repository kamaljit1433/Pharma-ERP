import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '../ThemeToggle';
import { useUIStore } from '@/store/uiStore';

// Mock the uiStore
vi.mock('@/store/uiStore', () => ({
  useUIStore: vi.fn(),
}));

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render moon icon in light mode', () => {
    const mockToggleTheme = vi.fn();
    
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      theme: 'light',
      toggleTheme: mockToggleTheme,
    });

    render(<ThemeToggle />);
    
    // Moon icon should be visible in light mode
    const button = screen.getByRole('button', { name: /switch to dark mode/i });
    expect(button).toBeInTheDocument();
  });

  it('should render sun icon in dark mode', () => {
    const mockToggleTheme = vi.fn();
    
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      theme: 'dark',
      toggleTheme: mockToggleTheme,
    });

    render(<ThemeToggle />);
    
    // Sun icon should be visible in dark mode
    const button = screen.getByRole('button', { name: /switch to light mode/i });
    expect(button).toBeInTheDocument();
  });

  it('should call toggleTheme when clicked', () => {
    const mockToggleTheme = vi.fn();
    
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      theme: 'light',
      toggleTheme: mockToggleTheme,
    });

    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('should have proper aria-label for accessibility', () => {
    const mockToggleTheme = vi.fn();
    
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      theme: 'light',
      toggleTheme: mockToggleTheme,
    });

    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
  });

  it('should update aria-label based on current theme', () => {
    const mockToggleTheme = vi.fn();
    
    // Test light mode
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      theme: 'light',
      toggleTheme: mockToggleTheme,
    });

    const { rerender } = render(<ThemeToggle />);
    let button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');

    // Test dark mode
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      theme: 'dark',
      toggleTheme: mockToggleTheme,
    });

    rerender(<ThemeToggle />);
    button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
  });

  it('should have title attribute for tooltip', () => {
    const mockToggleTheme = vi.fn();
    
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      theme: 'light',
      toggleTheme: mockToggleTheme,
    });

    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Switch to dark mode');
  });
});
