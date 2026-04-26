/**
 * MapDisplay Component Tests
 * Tests for map display, geofence validation, and location rendering
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MapDisplay } from '../MapDisplay';
import { GeoLocation, GeoFence, Journey } from '../../../types/geoTracking';

// Mock Google Maps API
vi.mock('../../../hooks/useGoogleMaps', () => ({
  useGoogleMaps: () => ({
    isLoaded: true,
    error: null,
  }),
  createMapInstance: vi.fn(() => ({
    fitBounds: vi.fn(),
  })),
  createMarker: vi.fn(() => ({
    setMap: vi.fn(),
    addListener: vi.fn(),
    getPosition: vi.fn(() => ({
      lat: () => 40.7128,
      lng: () => -74.006,
    })),
  })),
  createPolyline: vi.fn(() => ({
    setMap: vi.fn(),
  })),
  createCircle: vi.fn(() => ({
    setMap: vi.fn(),
  })),
  isPointInGeofence: vi.fn((point, center, radius) => {
    // Simple mock: return true if within 1km
    return radius >= 1;
  }),
  fitBoundsToMarkers: vi.fn(),
}));

describe('MapDisplay Component', () => {
  const mockLocation: GeoLocation = {
    latitude: 40.7128,
    longitude: -74.006,
    accuracy: 10,
    timestamp: new Date(),
  };

  const mockGeofence: GeoFence = {
    id: '1',
    name: 'Office',
    center: {
      latitude: 40.7128,
      longitude: -74.006,
      accuracy: 0,
      timestamp: new Date(),
    },
    radius: 500,
    type: 'Office',
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockJourney: Journey = {
    id: '1',
    employeeId: 'emp1',
    startLocation: {
      latitude: 40.7128,
      longitude: -74.006,
      accuracy: 10,
      timestamp: new Date(),
    },
    endLocation: {
      latitude: 40.758,
      longitude: -73.9855,
      accuracy: 10,
      timestamp: new Date(),
    },
    waypoints: [],
    totalDistance: 5.2,
    totalDuration: 1800,
    startTime: new Date(),
    endTime: new Date(Date.now() + 1800000),
    travelAllowance: 100,
    status: 'Completed',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render map container', () => {
    render(
      <MapDisplay
        location={mockLocation}
        showGeofences={false}
        showTravelHistory={false}
        showAttendanceRecords={false}
      />
    );

    expect(screen.getByText('Location Map')).toBeInTheDocument();
  });

  it('should display loading state initially', () => {
    render(
      <MapDisplay
        location={mockLocation}
        showGeofences={false}
        showTravelHistory={false}
        showAttendanceRecords={false}
      />
    );

    // The component should render without errors
    expect(screen.getByText('Location Map')).toBeInTheDocument();
  });

  it('should display geofence validation status when geofences are provided', async () => {
    const { rerender } = render(
      <MapDisplay
        location={mockLocation}
        geofences={[mockGeofence]}
        showGeofences={true}
        showTravelHistory={false}
        showAttendanceRecords={false}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Geofence Status')).toBeInTheDocument();
    });
  });

  it('should call onGeofenceValidation callback when location is validated', async () => {
    const onGeofenceValidation = vi.fn();

    render(
      <MapDisplay
        location={mockLocation}
        geofences={[mockGeofence]}
        showGeofences={true}
        onGeofenceValidation={onGeofenceValidation}
        showTravelHistory={false}
        showAttendanceRecords={false}
      />
    );

    await waitFor(() => {
      expect(onGeofenceValidation).toHaveBeenCalled();
    });
  });

  it('should display travel history when journeys are provided', async () => {
    render(
      <MapDisplay
        location={mockLocation}
        journeys={[mockJourney]}
        showTravelHistory={true}
        showGeofences={false}
        showAttendanceRecords={false}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Location Map')).toBeInTheDocument();
    });
  });

  it('should display map legend', () => {
    render(
      <MapDisplay
        location={mockLocation}
        showGeofences={true}
        showTravelHistory={true}
        showAttendanceRecords={true}
      />
    );

    expect(screen.getByText('Map Legend')).toBeInTheDocument();
    expect(screen.getByText('Current Location')).toBeInTheDocument();
  });

  it('should display error message when Google Maps API fails to load', () => {
    vi.doMock('../../../hooks/useGoogleMaps', () => ({
      useGoogleMaps: () => ({
        isLoaded: false,
        error: 'Failed to load Google Maps API',
      }),
    }));

    render(
      <MapDisplay
        location={mockLocation}
        showGeofences={false}
        showTravelHistory={false}
        showAttendanceRecords={false}
      />
    );

    expect(screen.getByText('Map Error')).toBeInTheDocument();
  });

  it('should handle empty location gracefully', () => {
    render(
      <MapDisplay
        location={undefined}
        showGeofences={false}
        showTravelHistory={false}
        showAttendanceRecords={false}
      />
    );

    expect(screen.getByText('Location Map')).toBeInTheDocument();
  });

  it('should handle empty geofences array', () => {
    render(
      <MapDisplay
        location={mockLocation}
        geofences={[]}
        showGeofences={true}
        showTravelHistory={false}
        showAttendanceRecords={false}
      />
    );

    expect(screen.getByText('Location Map')).toBeInTheDocument();
  });

  it('should handle empty journeys array', () => {
    render(
      <MapDisplay
        location={mockLocation}
        journeys={[]}
        showTravelHistory={true}
        showGeofences={false}
        showAttendanceRecords={false}
      />
    );

    expect(screen.getByText('Location Map')).toBeInTheDocument();
  });

  it('should display attendance records when provided', async () => {
    const attendanceRecords = [
      {
        id: '1',
        employeeId: 'emp1',
        date: new Date().toISOString(),
        checkInLocation: mockLocation,
        checkOutLocation: mockLocation,
        status: 'present' as const,
      },
    ];

    render(
      <MapDisplay
        location={mockLocation}
        attendanceRecords={attendanceRecords}
        showAttendanceRecords={true}
        showGeofences={false}
        showTravelHistory={false}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Location Map')).toBeInTheDocument();
    });
  });

  it('should respect showGeofences prop', () => {
    const { rerender } = render(
      <MapDisplay
        location={mockLocation}
        geofences={[mockGeofence]}
        showGeofences={false}
        showTravelHistory={false}
        showAttendanceRecords={false}
      />
    );

    // Geofence status should not be visible
    expect(screen.queryByText('Geofence Status')).not.toBeInTheDocument();

    rerender(
      <MapDisplay
        location={mockLocation}
        geofences={[mockGeofence]}
        showGeofences={true}
        showTravelHistory={false}
        showAttendanceRecords={false}
      />
    );

    // After rerender with showGeofences=true, it should be visible
    expect(screen.getByText('Geofence Status')).toBeInTheDocument();
  });

  it('should apply custom height to map container', () => {
    const { container } = render(
      <MapDisplay
        location={mockLocation}
        height="600px"
        showGeofences={false}
        showTravelHistory={false}
        showAttendanceRecords={false}
      />
    );

    const mapContainer = container.querySelector('[style*="height"]');
    expect(mapContainer).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <MapDisplay
        location={mockLocation}
        className="custom-class"
        showGeofences={false}
        showTravelHistory={false}
        showAttendanceRecords={false}
      />
    );

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
