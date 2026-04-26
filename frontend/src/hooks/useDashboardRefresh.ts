import { useEffect, useRef } from 'react';
import { useDashboardStore } from '../store/dashboardStore';

export function useDashboardRefresh() {
  const { fetchStats, autoRefreshEnabled, refreshInterval } = useDashboardStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initial fetch
    fetchStats();

    // Set up auto-refresh interval
    if (autoRefreshEnabled) {
      intervalRef.current = setInterval(() => {
        fetchStats();
      }, refreshInterval);
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefreshEnabled, refreshInterval]);

  return { fetchStats };
}
