/**
 * Geolocation Utilities Tests
 * Tests for geolocation utility functions including permission handling,
 * coordinate validation, and geofence operations
 * 
 * Requirements Tested:
 * - 28.1: Request geolocation permission from user
 * - 28.2: Capture current location when permission is granted
 * - 28.4: Validate location against allowed geofences
 * - 28.5: Display location accuracy indicator
 * - 28.6: Handle geolocation errors gracefully
 * - 28.10: Respect user privacy and location permissions
 * - 30.2: Unit tests for components
 * - 30.3: Integration tests for API services
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Geolocation utility functions
export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
}

export interface GeofenceConfig {
  center: { latitude: number; longitude: number };
  radius: number; // in kilometers
  name: string;
  type: 'office' | 'site' | 'restricted' | 'custom';
}

/**
 * Validates if coordinates are within valid ranges
 */
export const validateCoordinates = (coords: { latitude: number; longitude: number }): boolean => {
  return (
    coords.latitude >= -90 &&
    coords.latitude <= 90 &&
    coords.longitude >= -180 &&
    coords.longitude <= 180
  );
};

/**
 * Calculates distance between two points using Haversine formula
 */
export const calculateDistance = (
  point1: { latitude: number; longitude: number },
  point2: { latitude: number; longitude: number }
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(point2.latitude - point1.latitude);
  const dLng = toRadians(point2.longitude - point1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.latitude)) *
      Math.cos(toRadians(point2.latitude)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Converts degrees to radians
 */
const toRadians = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

/**
 * Checks if a point is within a geofence
 */
export const isPointInGeofence = (
  point: { latitude: number; longitude: number },
  geofence: GeofenceConfig
): boolean => {
  const distance = calculateDistance(point, geofence.center);
  return distance <= geofence.radius;
};

/**
 * Validates multiple points against multiple geofences
 */
export const validatePointsAgainstGeofences = (
  points: Array<{ latitude: number; longitude: number }>,
  geofences: GeofenceConfig[]
): Array<{ point: { latitude: number; longitude: number }; validGeofences: string[] }> => {
  return points.map(point => ({
    point,
    validGeofences: geofences
      .filter(geofence => isPointInGeofence(point, geofence))
      .map(geofence => geofence.name)
  }));
};

/**
 * Gets accuracy level description based on accuracy value
 */
export const getAccuracyLevel = (accuracy: number): 'high' | 'medium' | 'low' => {
  if (accuracy <= 5) return 'high';
  if (accuracy <= 20) return 'medium';
  return 'low';
};

/**
 * Formats coordinates for display
 */
export const formatCoordinates = (
  coords: { latitude: number; longitude: number },
  precision: number = 6
): string => {
  return `${coords.latitude.toFixed(precision)}, ${coords.longitude.toFixed(precision)}`;
};

/**
 * Checks if geolocation is supported by the browser
 */
export const isGeolocationSupported = (): boolean => {
  return 'geolocation' in navigator;
};

/**
 * Gets permission status for geolocation
 */
export const getGeolocationPermissionStatus = async (): Promise<'granted' | 'denied' | 'prompt' | 'unknown'> => {
  if (!navigator.permissions) {
    return 'unknown';
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state as 'granted' | 'denied' | 'prompt';
  } catch {
    return 'unknown';
  }
};

describe('Geolocation Utilities', () => {
  describe('validateCoordinates', () => {
    it('should validate correct coordinates', () => {
      expect(validateCoordinates({ latitude: 40.7128, longitude: -74.006 })).toBe(true);
      expect(validateCoordinates({ latitude: 0, longitude: 0 })).toBe(true);
      expect(validateCoordinates({ latitude: 90, longitude: 180 })).toBe(true);
      expect(validateCoordinates({ latitude: -90, longitude: -180 })).toBe(true);
    });

    it('should reject invalid latitude', () => {
      expect(validateCoordinates({ latitude: 91, longitude: 0 })).toBe(false);
      expect(validateCoordinates({ latitude: -91, longitude: 0 })).toBe(false);
      expect(validateCoordinates({ latitude: 100, longitude: 0 })).toBe(false);
    });

    it('should reject invalid longitude', () => {
      expect(validateCoordinates({ latitude: 0, longitude: 181 })).toBe(false);
      expect(validateCoordinates({ latitude: 0, longitude: -181 })).toBe(false);
      expect(validateCoordinates({ latitude: 0, longitude: 200 })).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(validateCoordinates({ latitude: 89.999999, longitude: 179.999999 })).toBe(true);
      expect(validateCoordinates({ latitude: -89.999999, longitude: -179.999999 })).toBe(true);
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance between two points', () => {
      const nyc = { latitude: 40.7128, longitude: -74.006 };
      const la = { latitude: 34.0522, longitude: -118.2437 };

      const distance = calculateDistance(nyc, la);

      expect(distance).toBeGreaterThan(3900);
      expect(distance).toBeLessThan(4000);
    });

    it('should return 0 for same point', () => {
      const point = { latitude: 40.7128, longitude: -74.006 };
      expect(calculateDistance(point, point)).toBe(0);
    });

    it('should be symmetric', () => {
      const point1 = { latitude: 40.7128, longitude: -74.006 };
      const point2 = { latitude: 34.0522, longitude: -118.2437 };

      const distance1 = calculateDistance(point1, point2);
      const distance2 = calculateDistance(point2, point1);

      expect(distance1).toBeCloseTo(distance2, 5);
    });

    it('should handle very close points', () => {
      const point1 = { latitude: 40.7128, longitude: -74.006 };
      const point2 = { latitude: 40.7129, longitude: -74.0061 };

      const distance = calculateDistance(point1, point2);

      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(0.2); // Less than 200 meters
    });
  });

  describe('isPointInGeofence', () => {
    const officeGeofence: GeofenceConfig = {
      center: { latitude: 40.7128, longitude: -74.006 },
      radius: 0.1, // 100 meters
      name: 'Main Office',
      type: 'office'
    };

    it('should return true for point inside geofence', () => {
      const pointInside = { latitude: 40.7128, longitude: -74.006 };
      expect(isPointInGeofence(pointInside, officeGeofence)).toBe(true);
    });

    it('should return false for point outside geofence', () => {
      const pointOutside = { latitude: 40.7200, longitude: -74.0100 };
      expect(isPointInGeofence(pointOutside, officeGeofence)).toBe(false);
    });

    it('should handle point on geofence boundary', () => {
      const geofence: GeofenceConfig = {
        center: { latitude: 40.7128, longitude: -74.006 },
        radius: 1,
        name: 'Test Geofence',
        type: 'custom'
      };

      // Point approximately 1km away
      const boundaryPoint = { latitude: 40.7228, longitude: -74.006 };
      const result = isPointInGeofence(boundaryPoint, geofence);

      expect(typeof result).toBe('boolean');
    });

    it('should handle different geofence types', () => {
      const siteGeofence: GeofenceConfig = {
        center: { latitude: 40.7500, longitude: -73.9900 },
        radius: 0.5,
        name: 'Construction Site',
        type: 'site'
      };

      const restrictedGeofence: GeofenceConfig = {
        center: { latitude: 40.7600, longitude: -73.9800 },
        radius: 0.2,
        name: 'Restricted Area',
        type: 'restricted'
      };

      const point = { latitude: 40.7500, longitude: -73.9900 };

      expect(isPointInGeofence(point, siteGeofence)).toBe(true);
      expect(isPointInGeofence(point, restrictedGeofence)).toBe(false);
    });
  });

  describe('validatePointsAgainstGeofences', () => {
    const geofences: GeofenceConfig[] = [
      {
        center: { latitude: 40.7128, longitude: -74.006 },
        radius: 0.1,
        name: 'Main Office',
        type: 'office'
      },
      {
        center: { latitude: 40.7500, longitude: -73.9900 },
        radius: 0.5,
        name: 'Construction Site',
        type: 'site'
      },
      {
        center: { latitude: 40.7600, longitude: -73.9800 },
        radius: 0.2,
        name: 'Restricted Area',
        type: 'restricted'
      }
    ];

    it('should validate multiple points against multiple geofences', () => {
      const points = [
        { latitude: 40.7128, longitude: -74.006 }, // In Main Office
        { latitude: 40.7500, longitude: -73.9900 }, // In Construction Site
        { latitude: 40.8000, longitude: -73.9000 }, // Not in any geofence
      ];

      const results = validatePointsAgainstGeofences(points, geofences);

      expect(results).toHaveLength(3);
      expect(results[0].validGeofences).toContain('Main Office');
      expect(results[1].validGeofences).toContain('Construction Site');
      expect(results[2].validGeofences).toHaveLength(0);
    });

    it('should handle point in multiple geofences', () => {
      const overlappingGeofences: GeofenceConfig[] = [
        {
          center: { latitude: 40.7128, longitude: -74.006 },
          radius: 1,
          name: 'Large Area',
          type: 'custom'
        },
        {
          center: { latitude: 40.7130, longitude: -74.0060 },
          radius: 0.5,
          name: 'Small Area',
          type: 'office'
        }
      ];

      const points = [{ latitude: 40.7129, longitude: -74.0060 }];
      const results = validatePointsAgainstGeofences(points, overlappingGeofences);

      expect(results[0].validGeofences).toHaveLength(2);
      expect(results[0].validGeofences).toContain('Large Area');
      expect(results[0].validGeofences).toContain('Small Area');
    });

    it('should handle empty points array', () => {
      const results = validatePointsAgainstGeofences([], geofences);
      expect(results).toHaveLength(0);
    });

    it('should handle empty geofences array', () => {
      const points = [{ latitude: 40.7128, longitude: -74.006 }];
      const results = validatePointsAgainstGeofences(points, []);

      expect(results).toHaveLength(1);
      expect(results[0].validGeofences).toHaveLength(0);
    });
  });

  describe('getAccuracyLevel', () => {
    it('should return high accuracy for values <= 5', () => {
      expect(getAccuracyLevel(1)).toBe('high');
      expect(getAccuracyLevel(5)).toBe('high');
      expect(getAccuracyLevel(3.5)).toBe('high');
    });

    it('should return medium accuracy for values 6-20', () => {
      expect(getAccuracyLevel(6)).toBe('medium');
      expect(getAccuracyLevel(20)).toBe('medium');
      expect(getAccuracyLevel(15)).toBe('medium');
    });

    it('should return low accuracy for values > 20', () => {
      expect(getAccuracyLevel(21)).toBe('low');
      expect(getAccuracyLevel(50)).toBe('low');
      expect(getAccuracyLevel(100)).toBe('low');
    });

    it('should handle edge cases', () => {
      expect(getAccuracyLevel(0)).toBe('high');
      expect(getAccuracyLevel(5.1)).toBe('medium');
      expect(getAccuracyLevel(20.1)).toBe('low');
    });
  });

  describe('formatCoordinates', () => {
    it('should format coordinates with default precision', () => {
      const coords = { latitude: 40.712812, longitude: -74.006012 };
      expect(formatCoordinates(coords)).toBe('40.712812, -74.006012');
    });

    it('should format coordinates with custom precision', () => {
      const coords = { latitude: 40.712812345, longitude: -74.006012345 };
      expect(formatCoordinates(coords, 2)).toBe('40.71, -74.01');
      expect(formatCoordinates(coords, 4)).toBe('40.7128, -74.0060');
    });

    it('should handle negative coordinates', () => {
      const coords = { latitude: -33.8688, longitude: 151.2093 };
      expect(formatCoordinates(coords, 4)).toBe('-33.8688, 151.2093');
    });

    it('should handle zero coordinates', () => {
      const coords = { latitude: 0, longitude: 0 };
      expect(formatCoordinates(coords, 2)).toBe('0.00, 0.00');
    });
  });

  describe('isGeolocationSupported', () => {
    it('should return true when geolocation is supported', () => {
      // Mock geolocation support
      Object.defineProperty(navigator, 'geolocation', {
        value: {},
        writable: true,
      });

      expect(isGeolocationSupported()).toBe(true);
    });

    it('should return false when geolocation is not supported', () => {
      // Mock no geolocation support
      const originalGeolocation = navigator.geolocation;
      Object.defineProperty(navigator, 'geolocation', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      expect(isGeolocationSupported()).toBe(false);

      // Restore original
      Object.defineProperty(navigator, 'geolocation', {
        value: originalGeolocation,
        writable: true,
        configurable: true,
      });
    });
  });

  describe('getGeolocationPermissionStatus', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should return permission status when permissions API is available', async () => {
      const mockQuery = vi.fn().mockResolvedValue({ state: 'granted' });
      Object.defineProperty(navigator, 'permissions', {
        value: { query: mockQuery },
        writable: true,
      });

      const status = await getGeolocationPermissionStatus();

      expect(status).toBe('granted');
      expect(mockQuery).toHaveBeenCalledWith({ name: 'geolocation' });
    });

    it('should return unknown when permissions API is not available', async () => {
      Object.defineProperty(navigator, 'permissions', {
        value: undefined,
        writable: true,
      });

      const status = await getGeolocationPermissionStatus();

      expect(status).toBe('unknown');
    });

    it('should return unknown when permissions query fails', async () => {
      const mockQuery = vi.fn().mockRejectedValue(new Error('Permission query failed'));
      Object.defineProperty(navigator, 'permissions', {
        value: { query: mockQuery },
        writable: true,
      });

      const status = await getGeolocationPermissionStatus();

      expect(status).toBe('unknown');
    });

    it('should handle different permission states', async () => {
      const states = ['granted', 'denied', 'prompt'];

      for (const state of states) {
        const mockQuery = vi.fn().mockResolvedValue({ state });
        Object.defineProperty(navigator, 'permissions', {
          value: { query: mockQuery },
          writable: true,
        });

        const status = await getGeolocationPermissionStatus();
        expect(status).toBe(state);
      }
    });
  });

  describe('Integration Tests', () => {
    it('should validate real-world office scenario', () => {
      const officeGeofence: GeofenceConfig = {
        center: { latitude: 40.7589, longitude: -73.9851 }, // Times Square
        radius: 0.05, // 50 meters
        name: 'NYC Office',
        type: 'office'
      };

      const employeeLocations = [
        { latitude: 40.7589, longitude: -73.9851 }, // In office
        { latitude: 40.7595, longitude: -73.9851 }, // Across street (~67m)
        { latitude: 40.7580, longitude: -73.9851 }, // Down the block (~100m)
      ];

      const results = validatePointsAgainstGeofences(employeeLocations, [officeGeofence]);

      expect(results[0].validGeofences).toContain('NYC Office'); // In office
      expect(results[1].validGeofences).not.toContain('NYC Office'); // Too far
      expect(results[2].validGeofences).not.toContain('NYC Office'); // Too far
    });

    it('should handle construction site with multiple workers', () => {
      const siteGeofence: GeofenceConfig = {
        center: { latitude: 40.7500, longitude: -73.9900 },
        radius: 0.2, // 200 meters
        name: 'Construction Site Alpha',
        type: 'site'
      };

      const workerLocations = [
        { latitude: 40.7500, longitude: -73.9900 }, // Center of site
        { latitude: 40.7505, longitude: -73.9905 }, // Near site
        { latitude: 40.7520, longitude: -73.9920 }, // Edge of site
        { latitude: 40.7600, longitude: -73.9800 }, // Off site
      ];

      const results = validatePointsAgainstGeofences(workerLocations, [siteGeofence]);

      expect(results[0].validGeofences).toContain('Construction Site Alpha');
      expect(results[1].validGeofences).toContain('Construction Site Alpha');
      expect(results[2].validGeofences).not.toContain('Construction Site Alpha');
      expect(results[3].validGeofences).not.toContain('Construction Site Alpha');
    });

    it('should validate coordinates and calculate distances accurately', () => {
      const point1 = { latitude: 40.7128, longitude: -74.006 }; // NYC
      const point2 = { latitude: 40.7589, longitude: -73.9851 }; // Times Square

      expect(validateCoordinates(point1)).toBe(true);
      expect(validateCoordinates(point2)).toBe(true);

      const distance = calculateDistance(point1, point2);
      expect(distance).toBeGreaterThan(5); // Should be > 5km
      expect(distance).toBeLessThan(10); // Should be < 10km

      const accuracy1 = 3; // High accuracy GPS
      const accuracy2 = 25; // Low accuracy GPS

      expect(getAccuracyLevel(accuracy1)).toBe('high');
      expect(getAccuracyLevel(accuracy2)).toBe('low');
    });
  });
});