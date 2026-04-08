/**
 * Unit Tests for Geo Tracking Service
 */

import { geoTrackingService, GeoLocation } from '../geoTrackingService';

describe('GeoTrackingService', () => {
  const mockLocation1: GeoLocation = {
    latitude: 40.7128,
    longitude: -74.006,
    accuracy: 10,
    timestamp: new Date('2024-01-15T09:00:00'),
  };

  const mockLocation2: GeoLocation = {
    latitude: 40.7489,
    longitude: -73.968,
    accuracy: 10,
    timestamp: new Date('2024-01-15T09:30:00'),
  };

  describe('calculateDistance', () => {
    it('should calculate distance between two points correctly', () => {
      const distance = geoTrackingService.calculateDistance(
        mockLocation1,
        mockLocation2
      );

      // Distance between NYC and Times Square is approximately 4.5 km
      expect(distance).toBeGreaterThan(4);
      expect(distance).toBeLessThan(5);
    });

    it('should return 0 for same location', () => {
      const distance = geoTrackingService.calculateDistance(
        mockLocation1,
        mockLocation1
      );

      expect(distance).toBe(0);
    });

    it('should handle antipodal points', () => {
      const point1: GeoLocation = {
        latitude: 0,
        longitude: 0,
        accuracy: 10,
        timestamp: new Date(),
      };

      const point2: GeoLocation = {
        latitude: 0,
        longitude: 180,
        accuracy: 10,
        timestamp: new Date(),
      };

      const distance = geoTrackingService.calculateDistance(point1, point2);

      // Distance should be approximately half Earth's circumference
      expect(distance).toBeGreaterThan(19000);
      expect(distance).toBeLessThan(21000);
    });

    it('should be symmetric', () => {
      const distance1 = geoTrackingService.calculateDistance(
        mockLocation1,
        mockLocation2
      );
      const distance2 = geoTrackingService.calculateDistance(
        mockLocation2,
        mockLocation1
      );

      expect(distance1).toBeCloseTo(distance2, 5);
    });
  });

  describe('calculateTotalDistance', () => {
    it('should calculate total distance for multiple waypoints', () => {
      const waypoints: GeoLocation[] = [
        mockLocation1,
        mockLocation2,
        {
          latitude: 40.7614,
          longitude: -73.9776,
          accuracy: 10,
          timestamp: new Date('2024-01-15T10:00:00'),
        },
      ];

      const totalDistance = geoTrackingService.calculateTotalDistance(waypoints);

      expect(totalDistance).toBeGreaterThan(0);
      expect(totalDistance).toBeLessThan(20);
    });

    it('should return 0 for single waypoint', () => {
      const waypoints: GeoLocation[] = [mockLocation1];

      const totalDistance = geoTrackingService.calculateTotalDistance(waypoints);

      expect(totalDistance).toBe(0);
    });

    it('should return 0 for empty waypoints', () => {
      const waypoints: GeoLocation[] = [];

      const totalDistance = geoTrackingService.calculateTotalDistance(waypoints);

      expect(totalDistance).toBe(0);
    });

    it('should sum distances correctly', () => {
      const waypoints: GeoLocation[] = [
        mockLocation1,
        mockLocation2,
      ];

      const totalDistance = geoTrackingService.calculateTotalDistance(waypoints);
      const directDistance = geoTrackingService.calculateDistance(
        mockLocation1,
        mockLocation2
      );

      expect(totalDistance).toBeCloseTo(directDistance, 5);
    });
  });

  describe('validateGeoFence', () => {
    it('should validate location inside geo-fence', () => {
      const geoFence = {
        id: 'fence-1',
        name: 'Office',
        center: mockLocation1,
        radiusMeters: 1000,
      };

      const locationInside: GeoLocation = {
        latitude: 40.7128,
        longitude: -74.005,
        accuracy: 10,
        timestamp: new Date(),
      };

      const isValid = geoTrackingService.validateGeoFence(
        locationInside,
        geoFence
      );

      expect(isValid).toBe(true);
    });

    it('should reject location outside geo-fence', () => {
      const geoFence = {
        id: 'fence-1',
        name: 'Office',
        center: mockLocation1,
        radiusMeters: 100,
      };

      const isValid = geoTrackingService.validateGeoFence(
        mockLocation2,
        geoFence
      );

      expect(isValid).toBe(false);
    });

    it('should validate location at geo-fence boundary', () => {
      const geoFence = {
        id: 'fence-1',
        name: 'Office',
        center: mockLocation1,
        radiusMeters: 500,
      };

      const distance = geoTrackingService.calculateDistance(
        mockLocation1,
        mockLocation2
      );
      const radiusKm = geoFence.radiusMeters / 1000;

      if (distance <= radiusKm) {
        const isValid = geoTrackingService.validateGeoFence(
          mockLocation2,
          geoFence
        );
        expect(isValid).toBe(true);
      }
    });
  });

  describe('detectAnomalies', () => {
    it('should detect impossible speed', () => {
      const journey = {
        id: 'journey-1',
        employeeId: 'emp-1',
        date: new Date('2024-01-15'),
        waypoints: [
          {
            latitude: 0,
            longitude: 0,
            accuracy: 10,
            timestamp: new Date('2024-01-15T09:00:00'),
          },
          {
            latitude: 1,
            longitude: 1,
            accuracy: 10,
            timestamp: new Date('2024-01-15T09:00:10'), // 10 seconds later
          },
        ],
        totalKm: 0,
        anomalies: [],
        createdAt: new Date(),
      };

      const anomalies = geoTrackingService.detectAnomalies(journey);

      expect(anomalies.length).toBeGreaterThan(0);
      expect(anomalies[0]!.type).toBe('impossible_speed');
    });

    it('should detect location jumps', () => {
      const journey = {
        id: 'journey-1',
        employeeId: 'emp-1',
        date: new Date('2024-01-15'),
        waypoints: [
          {
            latitude: 0,
            longitude: 0,
            accuracy: 10,
            timestamp: new Date('2024-01-15T09:00:00'),
          },
          {
            latitude: 0.5,
            longitude: 0.5,
            accuracy: 10,
            timestamp: new Date('2024-01-15T09:00:30'), // 30 seconds later
          },
        ],
        totalKm: 0,
        anomalies: [],
        createdAt: new Date(),
      };

      const anomalies = geoTrackingService.detectAnomalies(journey);

      // Should detect either impossible speed or location jump
      expect(anomalies.length).toBeGreaterThan(0);
    });

    it('should not detect anomalies for normal journey', () => {
      const journey = {
        id: 'journey-1',
        employeeId: 'emp-1',
        date: new Date('2024-01-15'),
        waypoints: [
          {
            latitude: 40.7128,
            longitude: -74.006,
            accuracy: 10,
            timestamp: new Date('2024-01-15T09:00:00'),
          },
          {
            latitude: 40.7129,
            longitude: -74.0059,
            accuracy: 10,
            timestamp: new Date('2024-01-15T09:05:00'), // 5 minutes later
          },
        ],
        totalKm: 0,
        anomalies: [],
        createdAt: new Date(),
      };

      const anomalies = geoTrackingService.detectAnomalies(journey);

      expect(anomalies.length).toBe(0);
    });

    it('should return empty anomalies for single waypoint', () => {
      const journey = {
        id: 'journey-1',
        employeeId: 'emp-1',
        date: new Date('2024-01-15'),
        waypoints: [mockLocation1],
        totalKm: 0,
        anomalies: [],
        createdAt: new Date(),
      };

      const anomalies = geoTrackingService.detectAnomalies(journey);

      expect(anomalies.length).toBe(0);
    });
  });

  describe('calculateTravelAllowance', () => {
    it('should calculate travel allowance correctly', () => {
      const distance = 50; // km
      const ratePerKm = 10; // per km

      const allowance = geoTrackingService.calculateTravelAllowance(
        distance,
        ratePerKm
      );

      expect(allowance).toBe(500);
    });

    it('should handle zero distance', () => {
      const allowance = geoTrackingService.calculateTravelAllowance(0, 10);

      expect(allowance).toBe(0);
    });

    it('should handle decimal distances', () => {
      const distance = 25.5; // km
      const ratePerKm = 10; // per km

      const allowance = geoTrackingService.calculateTravelAllowance(
        distance,
        ratePerKm
      );

      expect(allowance).toBe(255);
    });

    it('should handle decimal rates', () => {
      const distance = 50; // km
      const ratePerKm = 10.5; // per km

      const allowance = geoTrackingService.calculateTravelAllowance(
        distance,
        ratePerKm
      );

      expect(allowance).toBe(525);
    });
  });
});
