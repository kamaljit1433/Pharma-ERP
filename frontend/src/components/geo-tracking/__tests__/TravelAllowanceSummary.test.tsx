import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TravelAllowanceSummary } from '../TravelAllowanceSummary';
import { useGeoTrackingStore } from '../../../store/geoTrackingStore';

vi.mock('../../../store/geoTrackingStore', () => ({
  useGeoTrackingStore: vi.fn(),
}));

vi.mock('date-fns', () => ({
  format: (date: Date, format: string) => {
    if (format === 'MMM dd') return 'Jan 15';
    return date.toString();
  },
  subMonths: (date: Date, months: number) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() - months);
    return d;
  },
}));

describe('TravelAllowanceSummary', () => {
  const mockMonthlyAllowance = {
    totalDistance: 150.5,
    totalAllowance: 1505,
    journeyCount: 10,
    rate: 10,
    currency: 'INR',
    journeys: [
      {
        id: '1',
        employeeId: 'EMP001',
        startLocation: {
          latitude: 28.6139,
          longitude: 77.209,
          address: 'Office',
          timestamp: new Date(),
        },
        endLocation: {
          latitude: 28.5244,
          longitude: 77.1855,
          address: 'Client Site',
          timestamp: new Date(),
        },
        waypoints: [],
        totalDistance: 15.5,
        totalDuration: 3600,
        startTime: new Date('2024-01-15T10:00:00'),
        endTime: new Date('2024-01-15T11:00:00'),
        purpose: 'Client Meeting',
        travelAllowance: 155,
        status: 'Approved' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with header', () => {
    (useGeoTrackingStore as any).mockReturnValue({
      monthlyAllowance: null,
      loadingAllowance: false,
      fetchMonthlyAllowance: vi.fn(),
      exportJourneyData: vi.fn(),
      yearlyStats: null,
      loadingStats: false,
      fetchYearlyStats: vi.fn(),
    });

    render(<TravelAllowanceSummary employeeId="EMP001" />);

    expect(screen.getByText('Travel Allowance Summary')).toBeInTheDocument();
    expect(screen.getByText('Monthly travel allowance breakdown and comparison')).toBeInTheDocument();
  });

  it('displays monthly allowance summary', () => {
    (useGeoTrackingStore as any).mockReturnValue({
      monthlyAllowance: mockMonthlyAllowance,
      loadingAllowance: false,
      fetchMonthlyAllowance: vi.fn(),
      exportJourneyData: vi.fn(),
      yearlyStats: null,
      loadingStats: false,
      fetchYearlyStats: vi.fn(),
    });

    render(<TravelAllowanceSummary employeeId="EMP001" />);

    expect(screen.getByText('150.5 km')).toBeInTheDocument();
    expect(screen.getByText('₹1505.00')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    (useGeoTrackingStore as any).mockReturnValue({
      monthlyAllowance: null,
      loadingAllowance: true,
      fetchMonthlyAllowance: vi.fn(),
      exportJourneyData: vi.fn(),
      yearlyStats: null,
      loadingStats: false,
      fetchYearlyStats: vi.fn(),
    });

    render(<TravelAllowanceSummary employeeId="EMP001" />);

    expect(screen.getByText('Loading summary...')).toBeInTheDocument();
  });

  it('shows empty state when no data available', () => {
    (useGeoTrackingStore as any).mockReturnValue({
      monthlyAllowance: null,
      loadingAllowance: false,
      fetchMonthlyAllowance: vi.fn(),
      exportJourneyData: vi.fn(),
      yearlyStats: null,
      loadingStats: false,
      fetchYearlyStats: vi.fn(),
    });

    render(<TravelAllowanceSummary employeeId="EMP001" />);

    expect(screen.getByText('No data available for the selected period')).toBeInTheDocument();
  });

  it('displays journey breakdown table', () => {
    (useGeoTrackingStore as any).mockReturnValue({
      monthlyAllowance: mockMonthlyAllowance,
      loadingAllowance: false,
      fetchMonthlyAllowance: vi.fn(),
      exportJourneyData: vi.fn(),
      yearlyStats: null,
      loadingStats: false,
      fetchYearlyStats: vi.fn(),
    });

    render(<TravelAllowanceSummary employeeId="EMP001" />);

    expect(screen.getByText('Journey Breakdown')).toBeInTheDocument();
    expect(screen.getByText('15.5 km')).toBeInTheDocument();
  });

  it('displays statistics section', () => {
    (useGeoTrackingStore as any).mockReturnValue({
      monthlyAllowance: mockMonthlyAllowance,
      loadingAllowance: false,
      fetchMonthlyAllowance: vi.fn(),
      exportJourneyData: vi.fn(),
      yearlyStats: null,
      loadingStats: false,
      fetchYearlyStats: vi.fn(),
    });

    render(<TravelAllowanceSummary employeeId="EMP001" />);

    expect(screen.getByText('Statistics')).toBeInTheDocument();
    expect(screen.getByText('Approved Journeys')).toBeInTheDocument();
    expect(screen.getByText('Pending Journeys')).toBeInTheDocument();
  });

  it('calculates average distance correctly', () => {
    (useGeoTrackingStore as any).mockReturnValue({
      monthlyAllowance: mockMonthlyAllowance,
      loadingAllowance: false,
      fetchMonthlyAllowance: vi.fn(),
      exportJourneyData: vi.fn(),
      yearlyStats: null,
      loadingStats: false,
      fetchYearlyStats: vi.fn(),
    });

    render(<TravelAllowanceSummary employeeId="EMP001" />);

    // Average distance = 150.5 / 10 = 15.05 km
    expect(screen.getByText('15.1 km')).toBeInTheDocument();
  });

  it('displays allowance rate', () => {
    (useGeoTrackingStore as any).mockReturnValue({
      monthlyAllowance: mockMonthlyAllowance,
      loadingAllowance: false,
      fetchMonthlyAllowance: vi.fn(),
      exportJourneyData: vi.fn(),
      yearlyStats: null,
      loadingStats: false,
      fetchYearlyStats: vi.fn(),
    });

    render(<TravelAllowanceSummary employeeId="EMP001" />);

    expect(screen.getByText('@ ₹10.00/km')).toBeInTheDocument();
  });

  it('calls export function on export button click', async () => {
    const mockExport = vi.fn().mockResolvedValue(new Blob());
    (useGeoTrackingStore as any).mockReturnValue({
      monthlyAllowance: mockMonthlyAllowance,
      loadingAllowance: false,
      fetchMonthlyAllowance: vi.fn(),
      exportJourneyData: mockExport,
      yearlyStats: null,
      loadingStats: false,
      fetchYearlyStats: vi.fn(),
    });

    render(<TravelAllowanceSummary employeeId="EMP001" />);

    const exportButton = screen.getByText('Export Report');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockExport).toHaveBeenCalled();
    });
  });

  it('updates month when month select changes', async () => {
    const mockFetch = vi.fn();
    (useGeoTrackingStore as any).mockReturnValue({
      monthlyAllowance: null,
      loadingAllowance: false,
      fetchMonthlyAllowance: mockFetch,
      exportJourneyData: vi.fn(),
      yearlyStats: null,
      loadingStats: false,
      fetchYearlyStats: vi.fn(),
    });

    render(<TravelAllowanceSummary employeeId="EMP001" initialMonth={1} initialYear={2024} />);

    const monthSelect = screen.getByDisplayValue('January');
    fireEvent.change(monthSelect, { target: { value: '2' } });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('EMP001', 2, 2024);
    });
  });

  it('updates year when year select changes', async () => {
    const mockFetch = vi.fn();
    (useGeoTrackingStore as any).mockReturnValue({
      monthlyAllowance: null,
      loadingAllowance: false,
      fetchMonthlyAllowance: mockFetch,
      exportJourneyData: vi.fn(),
      yearlyStats: null,
      loadingStats: false,
      fetchYearlyStats: vi.fn(),
    });

    render(<TravelAllowanceSummary employeeId="EMP001" initialMonth={1} initialYear={2024} />);

    const yearSelect = screen.getByDisplayValue('2024');
    fireEvent.change(yearSelect, { target: { value: '2023' } });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('EMP001', 1, 2023);
    });
  });

  it('displays journey status badges', () => {
    (useGeoTrackingStore as any).mockReturnValue({
      monthlyAllowance: mockMonthlyAllowance,
      loadingAllowance: false,
      fetchMonthlyAllowance: vi.fn(),
      exportJourneyData: vi.fn(),
      yearlyStats: null,
      loadingStats: false,
      fetchYearlyStats: vi.fn(),
    });

    render(<TravelAllowanceSummary employeeId="EMP001" />);

    expect(screen.getByText('Approved')).toBeInTheDocument();
  });
});
