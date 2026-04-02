import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { OfflineIndicator } from '../OfflineIndicator';

// Mock the pwaRegister utility
vi.mock('@/utils/pwaRegister', () => ({
  onOnlineStatusChange: vi.fn((callback) => {
    // Store callback for manual triggering in tests
    (window as any).__onlineStatusCallback = callback;
    return () => {};
  }),
}));

describe('OfflineIndicator', () => {
  beforeEach(() => {
    // Reset navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when online initially', () => {
    const { container } = render(<OfflineIndicator />);
    expect(container.firstChild).toBeNull();
  });

  it('should render offline indicator when going offline', async () => {
    render(<OfflineIndicator />);

    // Simulate going offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    // Trigger the callback
    const callback = (window as any).__onlineStatusCallback;
    callback(false);

    await waitFor(() => {
      expect(screen.getByText('You are offline')).toBeInTheDocument();
    });
  });

  it('should show back online message when reconnecting', async () => {
    render(<OfflineIndicator />);

    // Simulate going offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });
    const callback = (window as any).__onlineStatusCallback;
    callback(false);

    await waitFor(() => {
      expect(screen.getByText('You are offline')).toBeInTheDocument();
    });

    // Simulate going back online
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
    callback(true);

    await waitFor(() => {
      expect(screen.getByText('Back online')).toBeInTheDocument();
    });
  });

  it('should auto-hide online indicator after 3 seconds', async () => {
    vi.useFakeTimers();
    const { container } = render(<OfflineIndicator />);

    // Simulate going offline then online
    const callback = (window as any).__onlineStatusCallback;
    callback(false);
    
    await waitFor(() => {
      expect(screen.getByText('You are offline')).toBeInTheDocument();
    });
    
    callback(true);

    await waitFor(() => {
      expect(screen.getByText('Back online')).toBeInTheDocument();
    });

    // Fast-forward time by 3 seconds
    vi.advanceTimersByTime(3000);

    // Wait for the component to update
    await waitFor(() => {
      expect(screen.queryByText('Back online')).not.toBeInTheDocument();
    }, { timeout: 100 });

    vi.useRealTimers();
  });
});
