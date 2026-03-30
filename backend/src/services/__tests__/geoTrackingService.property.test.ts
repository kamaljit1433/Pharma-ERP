/**
 * Property-Based Tests for Geo Tracking Service
 * Validates: Property 43 - Distance Calculation from Waypoints
 * Validates: Property 44 - Travel Allowance Calculation
 */

import fc from 'fast-check';
import { geoTrackingService, GeoLocation } from '../geoTrackingService';

describe('Geo Tracking Service - Property Tests', () => {
  /**
   * Arbitrary generator for valid GPS coordinates
   */
  const geoLocationArbitrary = () =>
    fc.record({
      latitude: fc.double({ min: -90, max: 90 }),
      longitude: fc.double({ min: -180, max: 180 }),
      accuracy: fc.double({ min: 0, max: 100 }),
      timestamp: fc.date(),
    });

  /**
   * Feature: employee-management-system
   * Property 43: Distance Calculation from Waypoints
   *
   * For any set of GPS waypoints representing a journey, the calculated total
   * distance must be the sum of distances between consecutive waypoint pairs
   * using the Haversine formula or equivalent.
   *
   * **Validates: Requirements FR-4.2.2**
   */
  it('Property 43: Distance calculation from waypoints', () => {
    fc.assert(
      fc.property(
        fc.array(geoLocationArbitrary(), { minLength: 2, maxLength: 10 }),
        (waypoints) => {
          // Calculate total distance
          const totalDistance =
            geoTrackingService.calculateTotalDistance(waypoints);

          // Manually calculate sum of consecutive distances
          let expectedTotal = 0;
          for (let i = 1; i < waypoints.length; i++) {
            const distance = geoTrackingService.calculateDistance(
              waypoints[i - 1],
              waypoints[i]
            );
            expectedTotal += distance;
          }

          // Verify total distance equals sum of consecutive distances
          expect(totalDistance).toBeCloseTo(expectedTotal, 5);

          // Verify total distance is non-negative
          expect(totalDistance).toBeGreaterThanOrEqual(0);

          // Verify total distance is reasonable (< 40,000 km - Earth's circumference)
          expect(totalDistance).toBeLessThan(40000);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: employee-management-system
   * Property 44: Travel Allowance Calculation
   *
   * For any employee with a configured per-km travel allowance rate and a
   * journey with calculated distance, the travel allowance must equal
   * (total km × rate per km).
   *
   * **Validates: Requirements FR-4.2.4**
   */
  it('Property 44: Travel allowance calculation', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 1000 }), // distance in km
        fc.double({ min: 0, max: 100 }), // rate per km
        (distance, ratePerKm) => {
          // Calculate travel allowance
          const allowance = geoTrackingService.calculateTravelAllowance(
            distance,
            ratePerKm
          );

          // Verify allowance equals distance × rate
          const expectedAllowance = distance * ratePerKm;
          expect(allowance).toBeCloseTo(expectedAllowance, 2);

          // Verify allowance is non-negative
          expect(allowance).toBeGreaterThanOrEqual(0);

          // Verify allowance is reasonable
          expect(allowance).toBeLessThan(100000);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Distance calculation should be symmetric
   */
  it('should calculate symmetric distances', () => {
    fc.assert(
      fc.property(
        geoLocationArbitrary(),
        geoLocationArbitrary(),
        (point1, point2) => {
          const distance1 = geoTrackingService.calculateDistance(point1, point2);
          const distance2 = geoTrackingService.calculateDistance(point2, point1);

          // Distance should be symmetric
          expect(distance1).toBeCloseTo(distance2, 5);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Distance from a point to itself should be zero
   */
  it('should return zero distance for same point', () => {
    fc.assert(
      fc.property(geoLocationArbitrary(), (point) => {
        const distance = geoTrackingService.calculateDistance(point, point);

        expect(distance).toBeCloseTo(0, 5);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Triangle inequality: distance(A, C) <= distance(A, B) + distance(B, C)
   */
  it('should satisfy triangle inequality', () => {
    fc.assert(
      fc.property(
        geoLocationArbitrary(),
        geoLocationArbitrary(),
        geoLocationArbitrary(),
        (pointA, pointB, pointC) => {
          const distanceAB = geoTrackingService.calculateDistance(pointA, pointB);
          const distanceBC = geoTrackingService.calculateDistance(pointB, pointC);
          const distanceAC = geoTrackingService.calculateDistance(pointA, pointC);

          // Triangle inequality
          expect(distanceAC).toBeLessThanOrEqual(distanceAB + distanceBC + 0.01); // Small tolerance for floating point
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Total distance should be additive for waypoints
   */
  it('should be additive for waypoint sequences', () => {
    fc.assert(
      fc.property(
        fc.array(geoLocationArbitrary(), { minLength: 3, maxLength: 5 }),
        (waypoints) => {
          // Calculate total distance
          const totalDistance =
            geoTrackingService.calculateTotalDistance(waypoints);

          // Split waypoints and calculate separately
          const midpoint = Math.floor(waypoints.length / 2);
          const firstPart = geoTrackingService.calculateTotalDistance(
            waypoints.slice(0, midpoint + 1)
          );
          const secondPart = geoTrackingService.calculateTotalDistance(
            waypoints.slice(midpoint)
          );

          // Total should equal sum of parts (with small tolerance)
          const expectedTotal = firstPart + secondPart - geoTrackingService.calculateDistance(
            waypoints[midpoint],
            waypoints[midpoint]
          );

          expect(totalDistance).toBeCloseTo(expectedTotal, 5);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Travel allowance should scale linearly with distance
   */
  it('should scale travel allowance linearly with distance', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 500 }),
        fc.double({ min: 1, max: 50 }),
        fc.double({ min: 1, max: 5 }),
        (baseDistance, ratePerKm, multiplier) => {
          const allowance1 = geoTrackingService.calculateTravelAllowance(
            baseDistance,
            ratePerKm
          );
          const allowance2 = geoTrackingService.calculateTravelAllowance(
            baseDistance * multiplier,
            ratePerKm
          );

          // Allowance should scale proportionally
          const expectedRatio = multiplier;
          const actualRatio = allowance2 / (allowance1 + 0.01); // Avoid division by zero

          expect(actualRatio).toBeCloseTo(expectedRatio, 1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Travel allowance should scale linearly with rate
   */
  it('should scale travel allowance linearly with rate', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 500 }),
        fc.double({ min: 1, max: 50 }),
        fc.double({ min: 1, max: 5 }),
        (distance, baseRate, multiplier) => {
          const allowance1 = geoTrackingService.calculateTravelAllowance(
            distance,
            baseRate
          );
          const allowance2 = geoTrackingService.calculateTravelAllowance(
            distance,
            baseRate * multiplier
          );

          // Allowance should scale proportionally with rate
          const expectedRatio = multiplier;
          const actualRatio = allowance2 / (allowance1 + 0.01); // Avoid division by zero

          expect(actualRatio).toBeCloseTo(expectedRatio, 1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Anomaly detection should identify impossible speeds
   */
  it('should detect anomalies for impossible speeds', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.1, max: 1 }), // degrees of latitude/longitude
        fc.integer({ min: 1, max: 10 }), // seconds between points
        (degrees, seconds) => {
          fc.pre(seconds > 0); // Precondition: time must be positive

          const journey = {
            id: 'journey-1',
            employeeId: 'emp-1',
            date: new Date(),
            waypoints: [
              {
                latitude: 0,
                longitude: 0,
                accuracy: 10,
                timestamp: new Date('2024-01-15T09:00:00'),
              },
              {
                latitude: degrees,
                longitude: degrees,
                accuracy: 10,
                timestamp: new Date(
                  new Date('2024-01-15T09:00:00').getTime() + seconds * 1000
                ),
              },
            ],
            totalKm: 0,
            anomalies: [],
            createdAt: new Date(),
          };

          const anomalies = geoTrackingService.detectAnomalies(journey);

          // For very short time intervals with large distances, anomalies should be detected
          if (seconds < 60 && degrees > 0.5) {
            expect(anomalies.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
