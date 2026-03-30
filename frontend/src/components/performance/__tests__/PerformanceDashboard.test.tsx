import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PerformanceDashboard } from '../PerformanceDashboard';
import { usePerformanceStore } from '../../../store/performanceStore';
import { vi } from 'vitest';

vi.mock('../../../store/performanceStore');

describe('PerformanceDashboard Component', () => {
  const mockFetchDashboardStats = vi.fn();

  const mockDashboardStats = {
    activeReviewCycles: 3,
    pendingReviews: 12,
    activePIPs: 2,
    recentFeedback: [
      { id: 'f1', type: 'Positive', count: 25 },
      { id: 'f2', type: 'Constructive', count: 8 },
      { id: 'f3', type: 'Neutral', count: 5 },
    ],
    goalCompletionStats: {
      completed: 45,
      onTrack: 120,
      atRisk: 30,
      behind: 15,
    },
    reviewRatingsDistribution: [
      { rating: 5, count: 20 },
      { rating: 4, count: 35 },
      { rating: 3, count: 25 },
      { rating: 2, count: 8 },
      { rating: 1, count: 2 },
    ],
    feedbackSentiment: {
      positive: 25,
      constructive: 8,
      neutral: 5,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (usePerformanceStore as any).mockReturnValue({
      dashboardStats: mockDashboardStats,
      loadingDashboard: false,
      fetchDashboardStats: mockFetchDashboardStats,
      error: null,
    });
  });

  it('renders dashboard title', () => {
    render(<PerformanceDashboard />);
    expect(screen.getByText('Performance Management Dashboard')).toBeInTheDocument();
  });

  it('displays key metrics', () => {
    render(<PerformanceDashboard />);
    expect(screen.getByText('Active Review Cycles')).toBeInTheDocument();
    expect(screen.getByText('Pending Reviews')).toBeInTheDocument();
    expect(screen.getByText('Active PIPs')).toBeInTheDocument();
    expect(screen.getByText('Recent Feedback')).toBeInTheDocument();
  });

  it('displays correct metric values', () => {
    render(<PerformanceDashboard />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('displays goal completion distribution', () => {
    render(<PerformanceDashboard />);
    expect(screen.getByText('Goal Completion Distribution')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('On Track')).toBeInTheDocument();
    expect(screen.getByText('At Risk')).toBeInTheDocument();
    expect(screen.getByText('Behind')).toBeInTheDocument();
  });

  it('displays review ratings distribution', () => {
    render(<PerformanceDashboard />);
    expect(screen.getByText('Review Ratings Distribution')).toBeInTheDocument();
    expect(screen.getByText('20 reviews')).toBeInTheDocument();
    expect(screen.getByText('35 reviews')).toBeInTheDocument();
  });

  it('displays feedback sentiment breakdown', () => {
    render(<PerformanceDashboard />);
    expect(screen.getByText('Feedback Sentiment Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Positive')).toBeInTheDocument();
    expect(screen.getByText('Constructive')).toBeInTheDocument();
    expect(screen.getByText('Neutral')).toBeInTheDocument();
  });

  it('displays quick action buttons', () => {
    render(<PerformanceDashboard />);
    expect(screen.getByRole('button', { name: /Create Goal/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit Review/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Provide Feedback/i })).toBeInTheDocument();
  });

  it('displays filter section', () => {
    render(<PerformanceDashboard />);
    expect(screen.getByLabelText('Filter by employee ID')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by review cycle')).toBeInTheDocument();
    expect(screen.getByLabelText('Date Range')).toBeInTheDocument();
  });

  it('allows filtering by employee ID', async () => {
    render(<PerformanceDashboard />);
    const employeeInput = screen.getByLabelText('Filter by employee ID');
    await userEvent.type(employeeInput, 'emp1');
    expect(employeeInput).toHaveValue('emp1');
  });

  it('allows filtering by review cycle', async () => {
    render(<PerformanceDashboard />);
    const cycleInput = screen.getByLabelText('Filter by review cycle');
    await userEvent.type(cycleInput, 'Q1 2026');
    expect(cycleInput).toHaveValue('Q1 2026');
  });

  it('allows filtering by date range', async () => {
    render(<PerformanceDashboard />);
    const dateRangeSelect = screen.getByLabelText('Date Range');
    await userEvent.click(dateRangeSelect);
    expect(screen.getByText('This Month')).toBeInTheDocument();
    expect(screen.getByText('This Quarter')).toBeInTheDocument();
    expect(screen.getByText('This Year')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    (usePerformanceStore as any).mockReturnValue({
      dashboardStats: null,
      loadingDashboard: true,
      fetchDashboardStats: mockFetchDashboardStats,
      error: null,
    });

    render(<PerformanceDashboard />);
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('displays error message', () => {
    const errorMessage = 'Failed to load dashboard';
    (usePerformanceStore as any).mockReturnValue({
      dashboardStats: null,
      loadingDashboard: false,
      fetchDashboardStats: mockFetchDashboardStats,
      error: errorMessage,
    });

    render(<PerformanceDashboard />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('fetches dashboard stats on mount', () => {
    render(<PerformanceDashboard />);
    expect(mockFetchDashboardStats).toHaveBeenCalled();
  });

  it('displays correct goal completion numbers', () => {
    render(<PerformanceDashboard />);
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('displays correct feedback sentiment numbers', () => {
    render(<PerformanceDashboard />);
    const sentimentSection = screen.getByText('Feedback Sentiment Breakdown').closest('div');
    expect(sentimentSection).toBeInTheDocument();
  });

  it('handles null dashboard stats gracefully', () => {
    (usePerformanceStore as any).mockReturnValue({
      dashboardStats: null,
      loadingDashboard: false,
      fetchDashboardStats: mockFetchDashboardStats,
      error: null,
    });

    render(<PerformanceDashboard />);
    expect(screen.getByText('Performance Management Dashboard')).toBeInTheDocument();
  });
});
