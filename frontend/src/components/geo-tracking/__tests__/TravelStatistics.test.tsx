import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TravelStatistics, Journey } from '../TravelStatistics';

// Mock data
const mockJourneys: Journey[] = [
  {
    id: '1',
    startLocation: { latitude: 40.7128, longitude: -74.006 },
    endLocation: { latitude: 40.7580, longitude: -73.9855 },
    waypoints: [
      { latitude: 40.7128, longitude: -74.006 },
      { latitude: 40.7580, longitude: -73.9855 },
    ],
    totalDistance: 5.2,
    totalDuration: 1200000, // 20 minutes
    startTime: new Date('2024-01-15T09:00:00'),
    endTime: new Date('2024-01-15T09:20:00'),
    purpose: 'Client meeting',
    travelAllowance: 26,
    status: 'Completed',
  },
  {
    id: '2',
    startLocation: { latitude: 40.7580, longitude: -73.9855 },
    endLocation: { latitude: 40.7489, longitude: -73.968 },
    waypoints: [
      { latitude: 40.7580, longitude: -73.9855 },
      { latitude: 40.7489, longitude: -73.968 },
    ],
    totalDistance: 3.8,
    totalDuration: 900000, // 15 minutes
    startTime: new Date('2024-01-15T10:00:00'),
    endTime: new Date('2024-01-15T10:15:00'),
    purpose: 'Office visit',
    travelAllowance: 19,
    status: 'Approved',
  },
  {
    id: '3',
    startLocation: { latitude: 40.7489, longitude: -73.968 },
    endLocation: { latitude: 40.7128, longitude: -74.006 },
    waypoints: [
      { latitude: 40.7489, longitude: -73.968 },
      { latitude: 40.7128, longitude: -74.006 },
    ],
    totalDistance: 4.5,
    totalDuration: 1080000, // 18 minutes
    startTime: new Date('2024-01-15T11:00:00'),
    endTime: new Date('2024-01-15T11:18:00'),
    purpose: 'Return to office',
    travelAllowance: 22.5,
    status: 'Pending',
  },
];

describe('TravelStatistics Component', () => {
  describe('Rendering', () => {
    it('should render loading state', () => {
      render(<TravelStatistics journeys={[]} loading={true} />);

      expect(screen.getByText('Loading travel statistics...')).toBeInTheDocument();
    });

    it('should render empty state', () => {
      render(<TravelStatistics journeys={[]} />);

      expect(screen.getByText('No journey data available')).toBeInTheDocument();
    });

    it('should render custom empty message', () => {
      const customMessage = 'No journeys found for this period';
      render(<TravelStatistics journeys={[]} emptyMessage={customMessage} />);

      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    it('should render all statistics sections', () => {
      render(<TravelStatistics journeys={mockJourneys} />);

      expect(screen.getByText('Total Distance')).toBeInTheDocument();
      expect(screen.getByText('Average Distance')).toBeInTheDocument();
      expect(screen.getByText('Average Speed')).toBeInTheDocument();
      expect(screen.getByText('Total Duration')).toBeInTheDocument();
      expect(screen.getByText('Distance Range')).toBeInTheDocument();
      expect(screen.getByText('Journey Status Summary')).toBeInTheDocument();
      expect(screen.getByText('Travel Allowance Summary')).toBeInTheDocument();
    });
  });

  describe('Distance Statistics', () => {
    it('should calculate and display total distance', () => {
      render(<TravelStatistics journeys={mockJourneys} />);

      // Total distance should be 5.2 + 3.8 + 4.5 = 13.5 km
      const totalDistanceText = screen.getByText(/13\.50 km/);
      expect(totalDistanceText).toBeInTheDocument();
    });

    it('should calculate and display average distance', () => {
      render(<TravelStatistics journeys={mockJourneys} />);

      // Average distance should be 13.5 / 3 = 4.5 km
      const averageDistanceText = screen.getByText(/4\.50 km/);
      expect(averageDistanceText).toBeInTheDocument();
    });

    it('should display journey count', () => {
      render(<TravelStatistics journeys={mockJourneys} />);

      expect(screen.getByText('3 journeys')).toBeInTheDocument();
    });

    it('should display minimum and maximum distances', () => {
      render(<TravelStatistics journeys={mockJourneys} />);

      expect(screen.getByText('Minimum Distance')).toBeInTheDocument();
      expect(screen.getByText('Maximum Distance')).toBeInTheDocument();
      // Min should be 3.8 km, Max should be 5.2 km
      expect(screen.getByText('3.80 km')).toBeInTheDocument();
      expect(screen.getByText('5.20 km')).toBeInTheDocument();
    });
  });

  describe('Speed Statistics', () => {
    it('should calculate and display average speed', () => {
      render(<TravelStatistics journeys={mockJourneys} />);

      // Total distance: 13.5 km, Total duration: 3180000 ms = 0.883 hours
      // Average speed: 13.5 / 0.883 ≈ 15.3 km/h
      expect(screen.getByText(/km\/h/)).toBeInTheDocument();
    });

    it('should display total duration in hours', () => {
      render(<TravelStatistics journeys={mockJourneys} />);

      // Total duration: 3180000 ms = 0.883 hours
      expect(screen.getByText(/0\.9h/)).toBeInTheDocument();
    });
  });

  describe('Journey Status Summary', () => {
    it('should display journey status counts', () => {
      render(<TravelStatistics journeys={mockJourneys} />);

      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Approved')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('should calculate status percentages', () => {
      render(<TravelStatistics journeys={mockJourneys} />);

      // 1 completed out of 3 = 33%
      // 1 approved out of 3 = 33%
      // 1 pending out of 3 = 33%
      const percentages = screen.getAllByText(/33%/);
      expect(percentages.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Travel Allowance Summary', () => {
    it('should display total allowance', () => {
      render(<TravelStatistics journeys={mockJourneys} />);

      // Total allowance: 26 + 19 + 22.5 = 67.5
      expect(screen.getByText('₹67.50')).toBeInTheDocument();
    });

    it('should calculate average allowance per journey', () => {
      render(<TravelStatistics journeys={mockJourneys} />);

      // Average: 67.5 / 3 = 22.5
      expect(screen.getByText(/₹22\.50 per journey/)).toBeInTheDocument();
    });
  });

  describe('Anomalies Detection', () => {
    it('should not display anomalies section when no anomalies', () => {
      render(<TravelStatistics journeys={mockJourneys} />);

      expect(screen.queryByText('Anomalies Detected')).not.toBeInTheDocument();
    });

    it('should display anomalies section when anomalies exist', () => {
      const journeyWithAnomaly: Journey = {
        ...mockJourneys[0],
        totalDistance: 500, // Very high distance
        totalDuration: 60000, // Very short duration (1 minute)
        // This would result in ~30,000 km/h speed
      };

      render(<TravelStatistics journeys={[journeyWithAnomaly]} />);

      expect(screen.getByText('Anomalies Detected')).toBeInTheDocument();
      expect(screen.getByText(/journey\(ies\) with unusual speed patterns/)).toBeInTheDocument();
    });

    it('should display high speed badge for anomalies', () => {
      const journeyWithAnomaly: Journey = {
        ...mockJourneys[0],
        totalDistance: 500,
        totalDuration: 60000,
      };

      render(<TravelStatistics journeys={[journeyWithAnomaly]} />);

      expect(screen.getByText('High Speed')).toBeInTheDocument();
    });
  });

  describe('Single Journey', () => {
    it('should handle single journey correctly', () => {
      const singleJourney = [mockJourneys[0]];
      render(<TravelStatistics journeys={singleJourney} />);

      expect(screen.getByText('1 journeys')).toBeInTheDocument();
      // Check for the total distance card specifically
      const totalDistanceCards = screen.getAllByText(/5\.20 km/);
      expect(totalDistanceCards.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle journeys with zero distance', () => {
      const zeroDistanceJourney: Journey = {
        ...mockJourneys[0],
        totalDistance: 0,
      };

      render(<TravelStatistics journeys={[zeroDistanceJourney]} />);

      // Check for zero distance in the rendered output
      const zeroDistanceElements = screen.getAllByText('0.00 km');
      expect(zeroDistanceElements.length).toBeGreaterThan(0);
    });

    it('should handle journeys with zero duration', () => {
      const zeroDurationJourney: Journey = {
        ...mockJourneys[0],
        totalDuration: 0,
      };

      render(<TravelStatistics journeys={[zeroDurationJourney]} />);

      // Should display 0.0h for zero duration
      const durationElements = screen.getAllByText(/0\.0h/);
      expect(durationElements.length).toBeGreaterThan(0);
    });

    it('should handle very large distances', () => {
      const largeDistanceJourney: Journey = {
        ...mockJourneys[0],
        totalDistance: 10000,
        travelAllowance: 50000,
      };

      render(<TravelStatistics journeys={[largeDistanceJourney]} />);

      const largeDistanceElements = screen.getAllByText('10000.00 km');
      expect(largeDistanceElements.length).toBeGreaterThan(0);
      expect(screen.getByText('₹50000.00')).toBeInTheDocument();
    });

    it('should handle mixed journey statuses', () => {
      const mixedJourneys: Journey[] = [
        { ...mockJourneys[0], status: 'Completed' },
        { ...mockJourneys[1], status: 'Approved' },
        { ...mockJourneys[2], status: 'Pending' },
        { ...mockJourneys[0], status: 'Rejected' },
        { ...mockJourneys[1], status: 'Cancelled' },
      ];

      render(<TravelStatistics journeys={mixedJourneys} />);

      // Should still calculate statistics correctly
      expect(screen.getByText('5 journeys')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<TravelStatistics journeys={mockJourneys} />);

      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should display descriptive text for statistics', () => {
      render(<TravelStatistics journeys={mockJourneys} />);

      expect(screen.getByText('per journey')).toBeInTheDocument();
      expect(screen.getByText('overall average')).toBeInTheDocument();
      expect(screen.getByText('travel time')).toBeInTheDocument();
    });
  });
});
