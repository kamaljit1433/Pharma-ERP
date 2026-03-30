import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TravelLogViewer } from '../TravelLogViewer';
import { useGeoTrackingStore } from '../../../store/geoTrackingStore';

// Mock the store
vi.mock('../../../store/geoTrackingStore', () => ({
  useGeoTrackingStore: vi.fn(),
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: (date: Date, format: string) => {
    if (format === 'MMM dd, yyyy') return 'Jan 15, 2024';
    if (format === 'HH:mm') return '10:30';
    return date.toString();
  },
}));

describe('TravelLogViewer', () => {
  const mockTravelLogs = [
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
      status: 'Approved',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with header', () => {
    (useGeoTrackingStore as any).mockReturnValue({
      travelLogs: [],
      loadingTravelLogs: false,
      fetchDailyJourney: vi.fn(),
      exportJourneyData: vi.fn(),
    });

    render(<TravelLogViewer employeeId="EMP001" />);

    expect(screen.getByText('Travel Log Viewer')).toBeInTheDocument();
    expect(screen.getByText('View and manage your travel journeys')).toBeInTheDocument();
  });

  it('displays travel logs in table', () => {
    (useGeoTrackingStore as any).mockReturnValue({
      travelLogs: mockTravelLogs,
      loadingTravelLogs: false,
      fetchDailyJourney: vi.fn(),
      exportJourneyData: vi.fn(),
    });

    render(<TravelLogViewer employeeId="EMP001" />);

    expect(screen.getByText('15.5 km')).toBeInTheDocument();
    expect(screen.getByText('155')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    (useGeoTrackingStore as any).mockReturnValue({
      travelLogs: [],
      loadingTravelLogs: true,
      fetchDailyJourney: vi.fn(),
      exportJourneyData: vi.fn(),
    });

    render(<TravelLogViewer employeeId="EMP001" />);

    expect(screen.getByText('Loading journeys...')).toBeInTheDocument();
  });

  it('shows empty state when no journeys', () => {
    (useGeoTrackingStore as any).mockReturnValue({
      travelLogs: [],
      loadingTravelLogs: false,
      fetchDailyJourney: vi.fn(),
      exportJourneyData: vi.fn(),
    });

    render(<TravelLogViewer employeeId="EMP001" />);

    expect(screen.getByText('No journeys recorded for this date')).toBeInTheDocument();
  });

  it('calculates and displays summary correctly', () => {
    (useGeoTrackingStore as any).mockReturnValue({
      travelLogs: mockTravelLogs,
      loadingTravelLogs: false,
      fetchDailyJourney: vi.fn(),
      exportJourneyData: vi.fn(),
    });

    render(<TravelLogViewer employeeId="EMP001" />);

    expect(screen.getByText('15.5 km')).toBeInTheDocument();
    expect(screen.getByText('₹155.00')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('opens journey details dialog on view button click', async () => {
    (useGeoTrackingStore as any).mockReturnValue({
      travelLogs: mockTravelLogs,
      loadingTravelLogs: false,
      fetchDailyJourney: vi.fn(),
      exportJourneyData: vi.fn(),
    });

    render(<TravelLogViewer employeeId="EMP001" />);

    const viewButton = screen.getByText('View');
    fireEvent.click(viewButton);

    await waitFor(() => {
      expect(screen.getByText('Journey Details')).toBeInTheDocument();
    });
  });

  it('calls export function on export button click', async () => {
    const mockExport = vi.fn().mockResolvedValue(new Blob());
    (useGeoTrackingStore as any).mockReturnValue({
      travelLogs: mockTravelLogs,
      loadingTravelLogs: false,
      fetchDailyJourney: vi.fn(),
      exportJourneyData: mockExport,
    });

    render(<TravelLogViewer employeeId="EMP001" />);

    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockExport).toHaveBeenCalled();
    });
  });

  it('updates date when date input changes', async () => {
    const mockFetch = vi.fn();
    (useGeoTrackingStore as any).mockReturnValue({
      travelLogs: [],
      loadingTravelLogs: false,
      fetchDailyJourney: mockFetch,
      exportJourneyData: vi.fn(),
    });

    render(<TravelLogViewer employeeId="EMP001" initialDate="2024-01-15" />);

    const dateInput = screen.getByDisplayValue('2024-01-15') as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: '2024-01-16' } });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('EMP001', '2024-01-16');
    });
  });
});
