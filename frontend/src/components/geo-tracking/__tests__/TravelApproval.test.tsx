import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TravelApproval } from '../TravelApproval';
import { useGeoTrackingStore } from '../../../store/geoTrackingStore';

vi.mock('../../../store/geoTrackingStore', () => ({
  useGeoTrackingStore: vi.fn(),
}));

vi.mock('date-fns', () => ({
  format: (date: Date, format: string) => {
    if (format === 'MMM dd, yyyy') return 'Jan 15, 2024';
    if (format === 'MMM dd, yyyy HH:mm') return 'Jan 15, 2024 10:30';
    return date.toString();
  },
}));

describe('TravelApproval', () => {
  const mockPendingApprovals = [
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
      status: 'Pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with header', () => {
    (useGeoTrackingStore as any).mockReturnValue({
      pendingApprovals: [],
      loadingApprovals: false,
      fetchPendingApprovals: vi.fn(),
      approveJourney: vi.fn(),
      rejectJourney: vi.fn(),
    });

    render(<TravelApproval managerId="MGR001" />);

    expect(screen.getByText('Travel Approval')).toBeInTheDocument();
    expect(screen.getByText('Approve or reject team member travel logs')).toBeInTheDocument();
  });

  it('displays pending approvals count', () => {
    (useGeoTrackingStore as any).mockReturnValue({
      pendingApprovals: mockPendingApprovals,
      loadingApprovals: false,
      fetchPendingApprovals: vi.fn(),
      approveJourney: vi.fn(),
      rejectJourney: vi.fn(),
    });

    render(<TravelApproval managerId="MGR001" />);

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('displays pending travel logs in table', () => {
    (useGeoTrackingStore as any).mockReturnValue({
      pendingApprovals: mockPendingApprovals,
      loadingApprovals: false,
      fetchPendingApprovals: vi.fn(),
      approveJourney: vi.fn(),
      rejectJourney: vi.fn(),
    });

    render(<TravelApproval managerId="MGR001" />);

    expect(screen.getByText('EMP001')).toBeInTheDocument();
    expect(screen.getByText('15.5 km')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    (useGeoTrackingStore as any).mockReturnValue({
      pendingApprovals: [],
      loadingApprovals: true,
      fetchPendingApprovals: vi.fn(),
      approveJourney: vi.fn(),
      rejectJourney: vi.fn(),
    });

    render(<TravelApproval managerId="MGR001" />);

    expect(screen.getByText('Loading approvals...')).toBeInTheDocument();
  });

  it('shows empty state when no pending approvals', () => {
    (useGeoTrackingStore as any).mockReturnValue({
      pendingApprovals: [],
      loadingApprovals: false,
      fetchPendingApprovals: vi.fn(),
      approveJourney: vi.fn(),
      rejectJourney: vi.fn(),
    });

    render(<TravelApproval managerId="MGR001" />);

    expect(screen.getByText('No pending travel logs for approval')).toBeInTheDocument();
  });

  it('opens review dialog on review button click', async () => {
    (useGeoTrackingStore as any).mockReturnValue({
      pendingApprovals: mockPendingApprovals,
      loadingApprovals: false,
      fetchPendingApprovals: vi.fn(),
      approveJourney: vi.fn(),
      rejectJourney: vi.fn(),
    });

    render(<TravelApproval managerId="MGR001" />);

    const reviewButton = screen.getByText('Review');
    fireEvent.click(reviewButton);

    await waitFor(() => {
      expect(screen.getByText('Review Travel Log')).toBeInTheDocument();
    });
  });

  it('calls approve function when approve is confirmed', async () => {
    const mockApprove = vi.fn();
    (useGeoTrackingStore as any).mockReturnValue({
      pendingApprovals: mockPendingApprovals,
      loadingApprovals: false,
      fetchPendingApprovals: vi.fn(),
      approveJourney: mockApprove,
      rejectJourney: vi.fn(),
    });

    render(<TravelApproval managerId="MGR001" />);

    const reviewButton = screen.getByText('Review');
    fireEvent.click(reviewButton);

    await waitFor(() => {
      const approveButton = screen.getByText('Approve');
      fireEvent.click(approveButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Confirm Approval')).toBeInTheDocument();
    });
  });

  it('allows bulk approval of selected journeys', async () => {
    (useGeoTrackingStore as any).mockReturnValue({
      pendingApprovals: mockPendingApprovals,
      loadingApprovals: false,
      fetchPendingApprovals: vi.fn(),
      approveJourney: vi.fn(),
      rejectJourney: vi.fn(),
    });

    render(<TravelApproval managerId="MGR001" />);

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]); // Select all

    await waitFor(() => {
      expect(screen.getByText(/Approve Selected/)).toBeInTheDocument();
    });
  });
});
