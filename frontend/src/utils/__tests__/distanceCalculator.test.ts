import { describe, it, expect } from 'vitest';
import {
  calculateHaversineDistance,
  calculateTotalDistance,
  calculateDistanceStats,
  calculateTravelAllowance,
  calculateAverageSpeed,
  detectSpeedAnomalies,
  formatDistance,
  formatSpeed,
  GeoPoint,
} from '../distanceCalculator';

describe('Distance Calculator Utility', () => {
  describe('calculateHaversineDistance', () => {
    it('should calculate distance between two points correctly', () => {
      // New York to Los Angeles (approximately 3944 km)
      const nyc: GeoPoint = { latitude: 40.7128, longitude: -74.006 };
      const la: GeoPoint = { latitude: 34.0522, longitude: -118.2437 };

      const distance = calculateHaversineDistance(nyc, la);

      expect(distance).toBeGreaterThan(3900);
      expect(distance).toBeLessThan(4000);
    });

    it('should return 0 for same point', () => {
      const point: GeoPoint = { latitude: 40.7128, longitude: -74.006 };
      const distance = calculateHaversineDistance(point, point);

      expect(distance).toBe(0);
    });

    it('should be symmetric (distance A to B equals B to A)', () => {
      const point1: GeoPoint = { latitude: 40.7128, longitude: -74.006 };
      const point2: GeoPoint = { latitude: 34.0522, longitude: -118.2437 };

      const distance1 = calculateHaversineDistance(point1, point2);
      const distance2 = calculateHaversineDistance(point2, point1);

      expect(distance1).toBeCloseTo(distance2, 5);
    });

    it('should handle antipodal points (opposite sides of Earth)', () => {
      const point1: GeoPoint = { latitude: 0, longitude: 0 };
      const point2: GeoPoint = { latitude: 0, longitude: 180 };

      const distance = calculateHaversineDistance(point1, point2);

      // Should be approximately half Earth's circumference (~20,000 km)
      expect(distance).toBeGreaterThan(19900);
      expect(distance).toBeLessThan(20100);
    });

    it('should handle points in different hemispheres', () => {
      const northernPoint: GeoPoint = { latitude: 51.5074, longitude: -0.1278 }; // London
      const southernPoint: GeoPoint = { latitude: -33.8688, longitude: 151.2093 }; // Sydney

      const distance = calculateHaversineDistance(northernPoint, southernPoint);

      // Should be approximately 17,000 km
      expect(distance).toBeGreaterThan(16900);
      expect(distance).toBeLessThan(17100);
    });

    it('should handle very close points', () => {
      const point1: GeoPoint = { latitude: 40.7128, longitude: -74.006 };
      const point2: GeoPoint = { latitude: 40.7129, longitude: -74.0061 };

      const distance = calculateHaversineDistance(point1, point2);

      // Should be very small (less than 200 meters)
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(0.2);
    });
  });

  describe('calculateTotalDistance', () => {
    it('should calculate total distance for multiple waypoints', () => {
      const waypoints: GeoPoint[] = [
        { latitude: 40.7128, longitude: -74.006 }, // NYC
        { latitude: 40.7580, longitude: -73.9855 }, // Midtown
        { latitude: 40.7489, longitude: -73.968 }, // Upper East Side
      ];

      const totalDistance = calculateTotalDistance(waypoints);

      expect(totalDistance).toBeGreaterThan(0);
      expect(totalDistance).toBeLessThan(10); // Should be less than 10 km
    });

    it('should return 0 for single point', () => {
      const waypoints: GeoPoint[] = [{ latitude: 40.7128, longitude: -74.006 }];

      const totalDistance = calculateTotalDistance(waypoints);

      expect(totalDistance).toBe(0);
    });

    it('should return 0 for empty array', () => {
      const waypoints: GeoPoint[] = [];

      const totalDistance = calculateTotalDistance(waypoints);

      expect(totalDistance).toBe(0);
    });

    it('should sum distances between consecutive waypoints', () => {
      const waypoints: GeoPoint[] = [
        { latitude: 0, longitude: 0 },
        { latitude: 0, longitude: 1 },
        { latitude: 0, longitude: 2 },
      ];

      const totalDistance = calculateTotalDistance(waypoints);
      const segment1 = calculateHaversineDistance(waypoints[0], waypoints[1]);
      const segment2 = calculateHaversineDistance(waypoints[1], waypoints[2]);

      expect(totalDistance).toBeCloseTo(segment1 + segment2, 5);
    });
  });

  describe('calculateDistanceStats', () => {
    it('should calculate correct statistics for waypoints', () => {
      const waypoints: GeoPoint[] = [
        { latitude: 40.7128, longitude: -74.006 },
        { latitude: 40.7580, longitude: -73.9855 },
        { latitude: 40.7489, longitude: -73.968 },
      ];

      const stats = calculateDistanceStats(waypoints);

      expect(stats.totalDistance).toBeGreaterThan(0);
      expect(stats.averageDistance).toBeGreaterThan(0);
      expect(stats.minDistance).toBeGreaterThan(0);
      expect(stats.maxDistance).toBeGreaterThan(0);
      expect(stats.segmentCount).toBe(2);
      expect(stats.averageDistance).toBeLessThanOrEqual(stats.maxDistance);
      expect(stats.averageDistance).toBeGreaterThanOrEqual(stats.minDistance);
    });

    it('should return zero stats for single point', () => {
      const waypoints: GeoPoint[] = [{ latitude: 40.7128, longitude: -74.006 }];

      const stats = calculateDistanceStats(waypoints);

      expect(stats.totalDistance).toBe(0);
      expect(stats.averageDistance).toBe(0);
      expect(stats.minDistance).toBe(0);
      expect(stats.maxDistance).toBe(0);
      expect(stats.segmentCount).toBe(0);
    });

    it('should return zero stats for empty array', () => {
      const waypoints: GeoPoint[] = [];

      const stats = calculateDistanceStats(waypoints);

      expect(stats.totalDistance).toBe(0);
      expect(stats.averageDistance).toBe(0);
      expect(stats.minDistance).toBe(0);
      expect(stats.maxDistance).toBe(0);
      expect(stats.segmentCount).toBe(0);
    });

    it('should correctly identify min and max distances', () => {
      const waypoints: GeoPoint[] = [
        { latitude: 0, longitude: 0 },
        { latitude: 0, longitude: 0.1 }, // Small distance
        { latitude: 0, longitude: 5 }, // Large distance
      ];

      const stats = calculateDistanceStats(waypoints);

      expect(stats.minDistance).toBeLessThan(stats.maxDistance);
      expect(stats.segmentCount).toBe(2);
    });
  });

  describe('calculateTravelAllowance', () => {
    it('should calculate allowance as distance * rate', () => {
      const allowance = calculateTravelAllowance(50, 5);

      expect(allowance).toBe(250);
    });

    it('should apply minimum allowance constraint', () => {
      const allowance = calculateTravelAllowance(10, 5, 100);

      expect(allowance).toBe(100);
    });

    it('should apply maximum allowance constraint', () => {
      const allowance = calculateTravelAllowance(100, 5, undefined, 400);

      expect(allowance).toBe(400);
    });

    it('should apply both min and max constraints', () => {
      const allowance1 = calculateTravelAllowance(10, 5, 100, 500);
      const allowance2 = calculateTravelAllowance(100, 5, 100, 500);
      const allowance3 = calculateTravelAllowance(50, 5, 100, 500);

      expect(allowance1).toBe(100); // Below min
      expect(allowance2).toBe(500); // Above max
      expect(allowance3).toBe(250); // Within range
    });

    it('should handle zero distance', () => {
      const allowance = calculateTravelAllowance(0, 5);

      expect(allowance).toBe(0);
    });

    it('should handle zero rate', () => {
      const allowance = calculateTravelAllowance(50, 0);

      expect(allowance).toBe(0);
    });
  });

  describe('calculateAverageSpeed', () => {
    it('should calculate average speed correctly', () => {
      const speed = calculateAverageSpeed(100, 60); // 100 km in 60 minutes

      expect(speed).toBe(100);
    });

    it('should handle different time units', () => {
      const speed = calculateAverageSpeed(50, 30); // 50 km in 30 minutes

      expect(speed).toBe(100); // 100 km/h
    });

    it('should return 0 for zero duration', () => {
      const speed = calculateAverageSpeed(100, 0);

      expect(speed).toBe(0);
    });

    it('should return 0 for zero distance', () => {
      const speed = calculateAverageSpeed(0, 60);

      expect(speed).toBe(0);
    });

    it('should handle fractional speeds', () => {
      const speed = calculateAverageSpeed(25, 60); // 25 km in 60 minutes

      expect(speed).toBe(25);
    });
  });

  describe('detectSpeedAnomalies', () => {
    it('should detect high-speed anomalies', () => {
      const waypoints: GeoPoint[] = [
        { latitude: 0, longitude: 0 },
        { latitude: 0, longitude: 5 }, // ~556 km
      ];
      const timestamps = [0, 60000]; // 1 minute apart = ~33,360 km/h (anomaly)

      const anomalies = detectSpeedAnomalies(waypoints, timestamps, 120);

      expect(anomalies.length).toBeGreaterThan(0);
      expect(anomalies).toContain(0);
    });

    it('should not flag normal speeds', () => {
      const waypoints: GeoPoint[] = [
        { latitude: 0, longitude: 0 },
        { latitude: 0, longitude: 0.1 }, // ~11 km
      ];
      const timestamps = [0, 600000]; // 10 minutes = ~66 km/h (normal)

      const anomalies = detectSpeedAnomalies(waypoints, timestamps, 120);

      expect(anomalies.length).toBe(0);
    });

    it('should return empty array for mismatched lengths', () => {
      const waypoints: GeoPoint[] = [
        { latitude: 0, longitude: 0 },
        { latitude: 0, longitude: 1 },
      ];
      const timestamps = [0]; // Mismatched length

      const anomalies = detectSpeedAnomalies(waypoints, timestamps);

      expect(anomalies.length).toBe(0);
    });

    it('should return empty array for single point', () => {
      const waypoints: GeoPoint[] = [{ latitude: 0, longitude: 0 }];
      const timestamps = [0];

      const anomalies = detectSpeedAnomalies(waypoints, timestamps);

      expect(anomalies.length).toBe(0);
    });

    it('should use custom max speed threshold', () => {
      const waypoints: GeoPoint[] = [
        { latitude: 0, longitude: 0 },
        { latitude: 0, longitude: 0.1 }, // ~11 km
      ];
      const timestamps = [0, 600000]; // 10 minutes = ~66 km/h

      const anomalies1 = detectSpeedAnomalies(waypoints, timestamps, 120);
      const anomalies2 = detectSpeedAnomalies(waypoints, timestamps, 50);

      expect(anomalies1.length).toBe(0);
      expect(anomalies2.length).toBeGreaterThan(0);
    });
  });

  describe('formatDistance', () => {
    it('should format distance with default decimals', () => {
      const formatted = formatDistance(15.5);

      expect(formatted).toBe('15.50 km');
    });

    it('should format distance with custom decimals', () => {
      const formatted = formatDistance(15.567, 1);

      expect(formatted).toBe('15.6 km');
    });

    it('should format zero distance', () => {
      const formatted = formatDistance(0);

      expect(formatted).toBe('0.00 km');
    });

    it('should format large distances', () => {
      const formatted = formatDistance(1234.5678, 2);

      expect(formatted).toBe('1234.57 km');
    });

    it('should format small distances', () => {
      const formatted = formatDistance(0.123, 3);

      expect(formatted).toBe('0.123 km');
    });
  });

  describe('formatSpeed', () => {
    it('should format speed with default decimals', () => {
      const formatted = formatSpeed(45.5);

      expect(formatted).toBe('45.5 km/h');
    });

    it('should format speed with custom decimals', () => {
      const formatted = formatSpeed(45.567, 2);

      expect(formatted).toBe('45.57 km/h');
    });

    it('should format zero speed', () => {
      const formatted = formatSpeed(0);

      expect(formatted).toBe('0.0 km/h');
    });

    it('should format high speeds', () => {
      const formatted = formatSpeed(120.5, 1);

      expect(formatted).toBe('120.5 km/h');
    });
  });

  describe('Edge Cases and Properties', () => {
    it('should satisfy triangle inequality for distances', () => {
      const p1: GeoPoint = { latitude: 0, longitude: 0 };
      const p2: GeoPoint = { latitude: 0, longitude: 1 };
      const p3: GeoPoint = { latitude: 1, longitude: 1 };

      const d12 = calculateHaversineDistance(p1, p2);
      const d23 = calculateHaversineDistance(p2, p3);
      const d13 = calculateHaversineDistance(p1, p3);

      // d13 <= d12 + d23
      expect(d13).toBeLessThanOrEqual(d12 + d23 + 0.0001); // Small epsilon for floating point
    });

    it('should handle negative coordinates', () => {
      const point1: GeoPoint = { latitude: -40.7128, longitude: -74.006 };
      const point2: GeoPoint = { latitude: -34.0522, longitude: -118.2437 };

      const distance = calculateHaversineDistance(point1, point2);

      expect(distance).toBeGreaterThan(0);
    });

    it('should handle coordinates at poles', () => {
      const northPole: GeoPoint = { latitude: 90, longitude: 0 };
      const southPole: GeoPoint = { latitude: -90, longitude: 0 };

      const distance = calculateHaversineDistance(northPole, southPole);

      // Should be approximately half Earth's circumference
      expect(distance).toBeGreaterThan(19900);
      expect(distance).toBeLessThan(20100);
    });

    it('should maintain distance additivity for waypoints', () => {
      const waypoints: GeoPoint[] = [
        { latitude: 0, longitude: 0 },
        { latitude: 0, longitude: 1 },
        { latitude: 0, longitude: 2 },
      ];

      const totalDistance = calculateTotalDistance(waypoints);
      const segment1 = calculateHaversineDistance(waypoints[0], waypoints[1]);
      const segment2 = calculateHaversineDistance(waypoints[1], waypoints[2]);

      expect(totalDistance).toBeCloseTo(segment1 + segment2, 5);
    });
  });
});
