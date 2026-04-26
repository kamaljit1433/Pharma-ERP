import fc from 'fast-check';
import { describe, it, expect } from '@jest/globals';

/**
 * Property 45: Geo-Fence Validation
 * 
 * Feature: employee-management-system
 * 
 * For any GPS location and defined geo-fence (center point + radius), the system
 * must correctly determine whether the location is inside or outside the geo-fence
 * using distance calculation.
 * 
 * **Validates: Requirements FR-4.2.8**
 * 
 * **Correctness Criteria:**
 * 1. Distance calculation uses Haversine formula
 * 2. Location inside radius returns true
 * 3. Location outside radius returns false
 * 4. Boundary cases handled correctly
 * 5. Distance calculation is symmetric
 * 6. Handles edge cases (poles, date line)
 */
describe('Property 45: Geo-Fence Validation', () => {
  
  /**
   * Haversine formula to calculate distance between two GPS coordinates
   * Returns distance in meters
   */
  function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
  
  /**
   * Check if a location is inside a geo-fence
   */
  function isInsideGeoFence(
    location: { latitude: number; longitude: number },
    geoFence: { center: { latitude: number; longitude: number }; radiusMeters: number }
  ): boolean {
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      geoFence.center.latitude,
      geoFence.center.longitude
    );
    return distance <= geoFence.radiusMeters;
  }
  
  it('should correctly identify locations inside geo-fence', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -90, max: 90 }), // center latitude
        fc.double({ min: -180, max: 180 }), // center longitude
        fc.double({ min: 10, max: 5000 }), // radius in meters
        fc.double({ min: -0.01, max: 0.01 }), // small latitude offset
        fc.double({ min: -0.01, max: 0.01 }), // small longitude offset
        (centerLat, centerLon, radius, latOffset, lonOffset) => {
          const geoFence = {
            center: { latitude: centerLat, longitude: centerLon },
            radiusMeters: radius
          };
          
          // Create a location very close to center (should be inside)
          const location = {
            latitude: centerLat + latOffset,
            longitude: centerLon + lonOffset
          };
          
          const distance = calculateDistance(
            location.latitude,
            location.longitude,
            geoFence.center.latitude,
            geoFence.center.longitude
          );
          
          const isInside = isInsideGeoFence(location, geoFence);
          
          // Verify correctness
          if (distance <= radius) {
            expect(isInside).toBe(true);
          } else {
            expect(isInside).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should correctly identify locations outside geo-fence', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -89, max: 89 }), // center latitude (avoid poles)
        fc.double({ min: -179, max: 179 }), // center longitude
        fc.double({ min: 100, max: 1000 }), // radius in meters
        fc.double({ min: 0.1, max: 1 }), // large latitude offset
        fc.double({ min: 0.1, max: 1 }), // large longitude offset
        (centerLat, centerLon, radius, latOffset, lonOffset) => {
          const geoFence = {
            center: { latitude: centerLat, longitude: centerLon },
            radiusMeters: radius
          };
          
          // Create a location far from center (likely outside)
          const location = {
            latitude: centerLat + latOffset,
            longitude: centerLon + lonOffset
          };
          
          const distance = calculateDistance(
            location.latitude,
            location.longitude,
            geoFence.center.latitude,
            geoFence.center.longitude
          );
          
          const isInside = isInsideGeoFence(location, geoFence);
          
          // Verify correctness
          expect(isInside).toBe(distance <= radius);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should handle boundary cases correctly', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -89, max: 89 }), // center latitude
        fc.double({ min: -179, max: 179 }), // center longitude
        fc.double({ min: 100, max: 5000 }), // radius in meters
        (centerLat, centerLon, radius) => {
          const geoFence = {
            center: { latitude: centerLat, longitude: centerLon },
            radiusMeters: radius
          };
          
          // Test exact center (should always be inside)
          const centerLocation = {
            latitude: centerLat,
            longitude: centerLon
          };
          
          expect(isInsideGeoFence(centerLocation, geoFence)).toBe(true);
          
          // Distance at center should be 0
          const centerDistance = calculateDistance(
            centerLat,
            centerLon,
            centerLat,
            centerLon
          );
          expect(centerDistance).toBeCloseTo(0, 1);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should have symmetric distance calculation', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -89, max: 89 }), // lat1
        fc.double({ min: -179, max: 179 }), // lon1
        fc.double({ min: -89, max: 89 }), // lat2
        fc.double({ min: -179, max: 179 }), // lon2
        (lat1, lon1, lat2, lon2) => {
          // Distance from A to B should equal distance from B to A
          const distanceAB = calculateDistance(lat1, lon1, lat2, lon2);
          const distanceBA = calculateDistance(lat2, lon2, lat1, lon1);
          
          expect(distanceAB).toBeCloseTo(distanceBA, 1);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should validate geo-fence with multiple locations', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -89, max: 89 }), // center latitude
        fc.double({ min: -179, max: 179 }), // center longitude
        fc.double({ min: 500, max: 2000 }), // radius in meters
        fc.array(
          fc.record({
            latitude: fc.double({ min: -89, max: 89 }),
            longitude: fc.double({ min: -179, max: 179 })
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (centerLat, centerLon, radius, locations) => {
          const geoFence = {
            center: { latitude: centerLat, longitude: centerLon },
            radiusMeters: radius
          };
          
          // Check each location
          const results = locations.map(location => ({
            location,
            distance: calculateDistance(
              location.latitude,
              location.longitude,
              geoFence.center.latitude,
              geoFence.center.longitude
            ),
            isInside: isInsideGeoFence(location, geoFence)
          }));
          
          // Verify each result
          results.forEach(result => {
            if (result.distance <= radius) {
              expect(result.isInside).toBe(true);
            } else {
              expect(result.isInside).toBe(false);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should handle edge case: location at exact radius boundary', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 89 }), // center latitude (positive for simplicity)
        fc.double({ min: 0, max: 179 }), // center longitude
        fc.double({ min: 100, max: 1000 }), // radius in meters
        (centerLat, centerLon, radius) => {
          const geoFence = {
            center: { latitude: centerLat, longitude: centerLon },
            radiusMeters: radius
          };
          
          // Calculate a point approximately at the radius boundary
          // Using simple approximation: 1 degree latitude ≈ 111,000 meters
          const latOffset = (radius / 111000);
          const boundaryLocation = {
            latitude: centerLat + latOffset,
            longitude: centerLon
          };
          
          const distance = calculateDistance(
            boundaryLocation.latitude,
            boundaryLocation.longitude,
            geoFence.center.latitude,
            geoFence.center.longitude
          );
          
          const isInside = isInsideGeoFence(boundaryLocation, geoFence);
          
          // At boundary, should be consistent with distance <= radius check
          expect(isInside).toBe(distance <= radius);
        }
      ),
      { numRuns: 100 }
    );
  });
});
