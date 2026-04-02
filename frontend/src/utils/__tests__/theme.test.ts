import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getSystemTheme,
  getStoredTheme,
  applyTheme,
  updateMetaThemeColor,
  initializeTheme,
  watchSystemTheme,
} from '../theme';

describe('Theme Utility', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Reset document classes
    document.documentElement.className = '';
    
    // Create meta theme-color tag if it doesn't exist
    if (!document.querySelector('meta[name="theme-color"]')) {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = '#ffffff';
      document.head.appendChild(meta);
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getSystemTheme', () => {
    it('should return "dark" when system prefers dark mode', () => {
      // Mock matchMedia to return dark mode preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      expect(getSystemTheme()).toBe('dark');
    });

    it('should return "light" when system prefers light mode', () => {
      // Mock matchMedia to return light mode preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      expect(getSystemTheme()).toBe('light');
    });
  });

  describe('getStoredTheme', () => {
    it('should return stored theme from localStorage', () => {
      const mockStorage = {
        state: {
          theme: 'dark',
        },
      };
      localStorage.setItem('ui-storage', JSON.stringify(mockStorage));

      expect(getStoredTheme()).toBe('dark');
    });

    it('should return system theme when no stored preference exists', () => {
      // Mock matchMedia to return light mode
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(() => ({
          matches: false,
          media: '',
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      expect(getStoredTheme()).toBe('light');
    });

    it('should return system theme when stored data is invalid', () => {
      localStorage.setItem('ui-storage', 'invalid-json');

      // Mock matchMedia to return light mode
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(() => ({
          matches: false,
          media: '',
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      expect(getStoredTheme()).toBe('light');
    });
  });

  describe('applyTheme', () => {
    it('should add light class to document root', () => {
      applyTheme('light');
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('should add dark class to document root', () => {
      applyTheme('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
    });

    it('should remove previous theme class when switching', () => {
      applyTheme('light');
      expect(document.documentElement.classList.contains('light')).toBe(true);
      
      applyTheme('dark');
      expect(document.documentElement.classList.contains('light')).toBe(false);
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should update meta theme-color when applying theme', () => {
      const meta = document.querySelector('meta[name="theme-color"]');
      
      applyTheme('light');
      expect(meta?.getAttribute('content')).toBe('#ffffff');
      
      applyTheme('dark');
      expect(meta?.getAttribute('content')).toBe('#0a0a0a');
    });
  });

  describe('updateMetaThemeColor', () => {
    it('should set white color for light theme', () => {
      updateMetaThemeColor('light');
      const meta = document.querySelector('meta[name="theme-color"]');
      expect(meta?.getAttribute('content')).toBe('#ffffff');
    });

    it('should set near-black color for dark theme', () => {
      updateMetaThemeColor('dark');
      const meta = document.querySelector('meta[name="theme-color"]');
      expect(meta?.getAttribute('content')).toBe('#0a0a0a');
    });

    it('should handle missing meta tag gracefully', () => {
      const meta = document.querySelector('meta[name="theme-color"]');
      meta?.remove();
      
      expect(() => updateMetaThemeColor('light')).not.toThrow();
    });
  });

  describe('initializeTheme', () => {
    it('should initialize theme from stored preference', () => {
      const mockStorage = {
        state: {
          theme: 'dark',
        },
      };
      localStorage.setItem('ui-storage', JSON.stringify(mockStorage));

      const theme = initializeTheme();
      
      expect(theme).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should initialize theme from system preference when no stored preference', () => {
      // Mock matchMedia to return light mode
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(() => ({
          matches: false,
          media: '',
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      const theme = initializeTheme();
      
      expect(theme).toBe('light');
      expect(document.documentElement.classList.contains('light')).toBe(true);
    });
  });

  describe('watchSystemTheme', () => {
    it('should call callback when system theme changes', () => {
      const callback = vi.fn();
      let changeHandler: ((e: MediaQueryListEvent) => void) | null = null;

      // Mock matchMedia with addEventListener
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(() => ({
          matches: false,
          media: '',
          onchange: null,
          addEventListener: vi.fn((event, handler) => {
            if (event === 'change') {
              changeHandler = handler;
            }
          }),
          removeEventListener: vi.fn(),
          addListener: vi.fn(),
          removeListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      watchSystemTheme(callback);

      // Simulate theme change
      if (changeHandler) {
        changeHandler({ matches: true } as MediaQueryListEvent);
      }

      expect(callback).toHaveBeenCalledWith('dark');
    });

    it('should return cleanup function', () => {
      const callback = vi.fn();
      const removeEventListener = vi.fn();

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(() => ({
          matches: false,
          media: '',
          onchange: null,
          addEventListener: vi.fn(),
          removeEventListener,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      const cleanup = watchSystemTheme(callback);
      cleanup();

      expect(removeEventListener).toHaveBeenCalled();
    });
  });
});
