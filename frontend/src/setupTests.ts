import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
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

// Mock scrollIntoView for Radix UI Select component
Element.prototype.scrollIntoView = vi.fn();

// Mock GeolocationPositionError for jsdom environment
class GeolocationPositionError extends Error {
  public code: number;
  public PERMISSION_DENIED: number = 1;
  public POSITION_UNAVAILABLE: number = 2;
  public TIMEOUT: number = 3;

  constructor(code?: number, message?: string) {
    super(message || 'Geolocation error');
    this.name = 'GeolocationPositionError';
    this.code = code || 0;
  }
}

// Add to global scope
(global as any).GeolocationPositionError = GeolocationPositionError;
