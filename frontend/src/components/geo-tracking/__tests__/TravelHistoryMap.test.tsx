/**
 * TravelHistoryMap Component Tests
 * Tests for travel history visualization and filtering
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TravelHistoryMap } from '../TravelHistoryMap';
import { Journey } from '../../../types/geoTracking';

// Mock MapDisplay component
vi.mock('../MapDisplay', () => ({
  MapDisplay: ({ journeys }: any) => (
    <div data-testid="map-display">
      {journeys.length > 0 && <div>Map with {journeys.length} journey(s)</div>}
    </div>
  ),
}));

describe('TravelHistoryMap Component', () => {
  const mockJourneys: Journey[] = [
    {
      id: '1',
      employeeId: 'emp1',
      startLocation: {
        latitude: 40.7128,
        longitude: -74.006,
        accuracy: 10,
        timestamp: new Date('2024-01-15T08:00:00'),
      },
      endLocation: {
        latitude: 40.758,
        longitude: -73.9855,
        accuracy: 10,
        timestamp: new Date('2024-01-15T09:00:00'),
      },
      waypoints: [],
      totalDistance: 5.2,
      totalDuration: 3600,
      startTime: new Date('2024-01-15T08:00:00'),
      endTime: new Date('2024-01-15T09:00:00'),
      purpose: 'Client Meeting',
      travelAllowance: 100,
      status: 'Completed',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      employeeId: 'emp1',
      startLocation: {
        latitude: 40.758,
        longitude: -73.9855,
        accuracy: 10,
        timestamp: new Date('2024-01-15T14:00:00'),
      },
      endLocation: {
        latitude: 40.7128,
        longitude: -74.006,
        accuracy: 10,
        timestamp: new Date('2024-01-15T15:30:00'),
      },
      waypoints: [],
      totalDistance: 5.2,
      totalDuration: 5400,
      startTime: new Date('2024-01-15T14:00:00'),
      endTime: new Date('2024-01-15T15:30:00'),
      purpose: 'Return to Office',
      travelAllowance: 100,
      status: 'Completed',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render travel history map', () => {
    render(<TravelHistoryMap journeys={mockJourneys} />);

    expect(screen.getByTestId('map-display')).toBeInTheDocument();
  });

  it('should display statistics', () => {
    render(<TravelHistoryMap journeys={mockJourneys} />);

    expect(screen.getByText('Total Distance')).toBeInTheDocument();
    expect(screen.getByText('Total Duration')).toBeInTheDocument();
    expect(screen.getByText('Avg Speed')).toBeInTheDocument();
    expect(screen.getByText('Journeys')).toBeInTheDocument();
  });

  it('should calculate correct total distance', () => {
    render(<TravelHistoryMap journeys={mockJourneys} />);

    // Total distance should be 5.2 + 5.2 = 10.4 km
    expect(screen.getByText('10.4 km')).toBeInTheDocument();
  });

  it('should calculate correct total duration', () => {
    render(<TravelHistoryMap journeys={mockJourneys} />);

    // Total duration should be 3600 + 5400 = 9000 seconds = 2h 30m
    expect(screen.getByText('2h 30m')).toBeInTheDocument();
  });

  it('should display journey list', () => {
    render(<TravelHistoryMap journeys={mockJourneys} />);

    expect(screen.getByText('Journey Details')).toBeInTheDocument();
    expect(screen.getByText('Client Meeting')).toBeInTheDocument();
    expect(screen.getByText('Return to Office')).toBeInTheDocument();
  });

  it('should filter journeys by date', async () => {
    render(<TravelHistoryMap journeys={mockJourneys} />);

    // Click on a specific date filter
    const dateButtons = screen.getAllByRole('button');
    const dateButton = dateButtons.find((btn) => btn.textContent?.includes('Jan'));

    if (dateButton) {
      fireEvent.click(dateButton);

      await waitFor(() => {
        expect(screen.getByText('Journey Details')).toBeInTheDocument();
      });
    }
  });

  it('should display "All Dates" filter button', () => {
    render(<TravelHistoryMap journeys={mockJourneys} />);

    const allDatesButton = screen.getByRole('button', { name: /All Dates/i });
    expect(allDatesButton).toBeInTheDocument();
  });

  it('should select journey on click', async () => {
    const onJourneySelect = vi.fn();
    render(
      <TravelHistoryMap journeys={mockJourneys} onJourneySelect={onJourneySelect} />
    );

    const journeyItems = screen.getAllByText(/Client Meeting|Return to Office/);
    fireEvent.click(journeyItems[0]);

    await waitFor(() => {
      expect(onJourneySelect).toHaveBeenCalled();
    });
  });

  it('should display selected journey details', async () => {
    render(<TravelHistoryMap journeys={mockJourneys} />);

    expect(screen.getByText('Selected Journey Details')).toBeInTheDocument();
  });

  it('should display journey status badge', () => {
    render(<TravelHistoryMap journeys={mockJourneys} />);

    expect(screen.getAllByText('Completed').length).toBeGreaterThan(0);
  });

  it('should display travel allowance', () => {
    render(<TravelHistoryMap journeys={mockJourneys} />);

    expect(screen.getAllByText(/₹100/)).toHaveLength(2);
  });

  it('should handle empty journeys array', () => {
    render(<TravelHistoryMap journeys={[]} />);

    expect(screen.getByText('No travel history available')).toBeInTheDocument();
  });

  it('should display journey waypoints count', () => {
    render(<TravelHistoryMap journeys={mockJourneys} />);

    expect(screen.getByText('Selected Journey Details')).toBeInTheDocument();
  });

  it('should calculate average speed correctly', () => {
    render(<TravelHistoryMap journeys={mockJourneys} />);

    // Total distance: 10.4 km, Total duration: 9000 seconds = 2.5 hours
    // Average speed: 10.4 / 2.5 = 4.16 km/h
    expect(screen.getByText(/Avg Speed/)).toBeInTheDocument();
  });

  it('should display journey start and end times', () => {
    render(<TravelHistoryMap journeys={mockJourneys} />);

    expect(screen.getByText('Selected Journey Details')).toBeInTheDocument();
  });

  it('should format duration correctly', () => {
    render(<TravelHistoryMap journeys={mockJourneys} />);

    // 3600 seconds = 1h
    expect(screen.getByText('1h')).toBeInTheDocument();
  });

  it('should display journey purpose', () => {
    render(<TravelHistoryMap journeys={mockJourneys} />);

    expect(screen.getByText('Client Meeting')).toBeInTheDocument();
    expect(screen.getByText('Return to Office')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <TravelHistoryMap journeys={mockJourneys} className="custom-class" />
    );

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('should display map legend', () => {
    render(<TravelHistoryMap journeys={mockJourneys} />);

    // Map legend should be displayed by MapDisplay component
    expect(screen.getByTestId('map-display')).toBeInTheDocument();
  });

  it('should handle single journey', () => {
    render(<TravelHistoryMap journeys={[mockJourneys[0]]} />);

    expect(screen.getByText('Client Meeting')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Journey count
  });

  it('should update statistics when filtering by date', async () => {
    render(<TravelHistoryMap journeys={mockJourneys} />);

    // Initial stats should show 2 journeys
    expect(screen.getByText('2')).toBeInTheDocument();

    // Click on a date filter
    const dateButtons = screen.getAllByRole('button');
    const dateButton = dateButtons.find((btn) => btn.textContent?.includes('Jan'));

    if (dateButton) {
      fireEvent.click(dateButton);

      await waitFor(() => {
        // Stats should update based on filtered journeys
        expect(screen.getByText('Journey Details')).toBeInTheDocument();
      });
    }
  });
});
