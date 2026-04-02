import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDashboardRefresh } from '../useDashboardRefresh';
import { useDashboardStore } from '../../store/dashboardStore';

// Mock the dashboard store
vi.mock('../../store/dashboardStore', () => ({
  useDashboardStore: vi.fn(),
}));

describe('useDashboardRefresh', () => {
  const mockFetchStats = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    (useDashboardStore as any).mockReturnValue({
      fetchStats: mockFetchStats,
      autoRefreshEnabled: true,
      refreshInterval: 5 * 60 * 1000, // 5 minutes
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls fetchStats on mount', () => {
    renderHook(() => useDashboardRefresh());

    expect(mockFetchStats).toHaveBeenCalledTimes(1);
  });

  it('sets up interval when autoRefreshEnabled is true', () => {
    renderHook(() => useDashboardRefresh());

    // Fast-forward time by 5 minutes
    vi.advanceTimersByTime(5 * 60 * 1000);

    // Should have been called on mount + once after interval
    expect(mockFetchStats).toHaveBeenCalledTimes(2);
  });

  it('does not set up interval when autoRefreshEnabled is false', () => {
    (useDashboardStore as any).mockReturnValue({
      fetchStats: mockFetchStats,
      autoRefreshEnabled: false,
      refreshInterval: 5 * 60 * 1000,
    });

    renderHook(() => useDashboardRefresh());

    // Fast-forward time by 5 minutes
    vi.advanceTimersByTime(5 * 60 * 1000);

    // Should only be called on mount
    expect(mockFetchStats).toHaveBeenCalledTimes(1);
  });

  it('respects custom refresh interval', () => {
    const customInterval = 10 * 60 * 1000; // 10 minutes
    (useDashboardStore as any).mockReturnValue({
      fetchStats: mockFetchStats,
      autoRefreshEnabled: true,
      refreshInterval: customInterval,
    });

    renderHook(() => useDashboardRefresh());

    // Fast-forward by 5 minutes (less than interval)
    vi.advanceTimersByTime(5 * 60 * 1000);
    expect(mockFetchStats).toHaveBeenCalledTimes(1); // Only initial call

    // Fast-forward by another 5 minutes (total 10 minutes)
    vi.advanceTimersByTime(5 * 60 * 1000);
    expect(mockFetchStats).toHaveBeenCalledTimes(2); // Initial + interval call
  });

  it('cleans up interval on unmount', () => {
    const { unmount } = renderHook(() => useDashboardRefresh());

    expect(mockFetchStats).toHaveBeenCalledTimes(1);

    unmount();

    // Fast-forward time after unmount
    vi.advanceTimersByTime(5 * 60 * 1000);

    // Should not have been called again after unmount
    expect(mockFetchStats).toHaveBeenCalledTimes(1);
  });

  it('returns fetchStats function', () => {
    const { result } = renderHook(() => useDashboardRefresh());

    expect(result.current.fetchStats).toBeDefined();
    expect(typeof result.current.fetchStats).toBe('function');
  });

  it('allows manual refresh via returned fetchStats', () => {
    const { result } = renderHook(() => useDashboardRefresh());

    // Initial call on mount
    expect(mockFetchStats).toHaveBeenCalledTimes(1);

    // Manual refresh
    result.current.fetchStats();

    expect(mockFetchStats).toHaveBeenCalledTimes(2);
  });

  it('handles multiple intervals correctly', () => {
    renderHook(() => useDashboardRefresh());

    // First interval
    vi.advanceTimersByTime(5 * 60 * 1000);
    expect(mockFetchStats).toHaveBeenCalledTimes(2);

    // Second interval
    vi.advanceTimersByTime(5 * 60 * 1000);
    expect(mockFetchStats).toHaveBeenCalledTimes(3);

    // Third interval
    vi.advanceTimersByTime(5 * 60 * 1000);
    expect(mockFetchStats).toHaveBeenCalledTimes(4);
  });
});
