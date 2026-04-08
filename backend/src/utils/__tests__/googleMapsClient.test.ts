/**
 * Google Maps Client Tests
 * Tests for Google Maps API integration
 */

import googleMapsClient from '../googleMapsClient';
import { GeoLocation } from '../../types/geoTracking';

describe('GoogleMapsClient', () => {
  const client = googleMapsClient;

  describe('calculateDistance', () => {
    // Note: These tests require a valid Google Maps API key
    // They are skipped in CI/CD environments
    it.skip('should calculate distance between two locations', async () => {
      const origin: GeoLocation = { 
        latitude: 40.7128, 
        longitude: -74.006,
        timestamp: new Date()
      };
      const destination: GeoLocation = { 
        latitude: 34.0522, 
        longitude: -118.2437,
        timestamp: new Date()
      };

      const result = await client.calculateDistance(origin, destination);

      expect(result).toBeDefined();
      expect(result.distance).toBeDefined();
      expect(result.distance.value).toBeGreaterThan(0);
      expect(result.status).toBe('OK');
    });

    it.skip('should handle nearby locations', async () => {
      const origin: GeoLocation = { 
        latitude: 40.7128, 
        longitude: -74.006,
        timestamp: new Date()
      };
      const destination: GeoLocation = { 
        latitude: 40.7138, 
        longitude: -74.0060,
        timestamp: new Date()
      };

      const result = await client.calculateDistance(origin, destination);

      expect(result.distance.value).toBeGreaterThan(0);
      expect(result.distance.value).toBeLessThan(2000); // Less than 2 km in meters
    });
  });

  describe('calculateHaversineDistance', () => {
    it('should calculate distance between two locations', () => {
      const origin: GeoLocation = { 
        latitude: 40.7128, 
        longitude: -74.006,
        timestamp: new Date()
      };
      const destination: GeoLocation = { 
        latitude: 34.0522, 
        longitude: -118.2437,
        timestamp: new Date()
      };

      const distance = client.calculateHaversineDistance(origin, destination);

      expect(distance).toBeDefined();
      expect(distance).toBeGreaterThan(0);
      // Distance should be approximately 3944 km (3944000 meters)
      expect(distance).toBeGreaterThan(3900000);
      expect(distance).toBeLessThan(4000000);
    });

    it('should handle same location', () => {
      const location: GeoLocation = { 
        latitude: 40.7128, 
        longitude: -74.006,
        timestamp: new Date()
      };

      const distance = client.calculateHaversineDistance(location, location);

      expect(distance).toBe(0);
    });

    it('should handle nearby locations', () => {
      const origin: GeoLocation = { 
        latitude: 40.7128, 
        longitude: -74.006,
        timestamp: new Date()
      };
      const destination: GeoLocation = { 
        latitude: 40.7138, 
        longitude: -74.0060,
        timestamp: new Date()
      };

      const distance = client.calculateHaversineDistance(origin, destination);

      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(2000); // Less than 2 km in meters
    });

    it('should handle international locations', () => {
      const origin: GeoLocation = { 
        latitude: 51.5074, 
        longitude: -0.1278,
        timestamp: new Date()
      }; // London
      const destination: GeoLocation = { 
        latitude: 48.8566, 
        longitude: 2.3522,
        timestamp: new Date()
      }; // Paris

      const distance = client.calculateHaversineDistance(origin, destination);

      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeGreaterThan(300000); // More than 300 km in meters
      expect(distance).toBeLessThan(400000); // Less than 400 km in meters
    });

    it('should handle equatorial locations', () => {
      const origin: GeoLocation = { 
        latitude: 0, 
        longitude: 0,
        timestamp: new Date()
      };
      const destination: GeoLocation = { 
        latitude: 0, 
        longitude: 1,
        timestamp: new Date()
      };

      const distance = client.calculateHaversineDistance(origin, destination);

      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeGreaterThan(100000); // Approximately 111 km in meters
      expect(distance).toBeLessThan(120000);
    });

    it('should handle polar locations', () => {
      const origin: GeoLocation = { 
        latitude: 89, 
        longitude: 0,
        timestamp: new Date()
      };
      const destination: GeoLocation = { 
        latitude: 89, 
        longitude: 180,
        timestamp: new Date()
      };

      const distance = client.calculateHaversineDistance(origin, destination);

      expect(distance).toBeGreaterThan(0);
    });

    it('should use Haversine formula correctly', () => {
      // Test with known distances
      const origin: GeoLocation = { 
        latitude: 0, 
        longitude: 0,
        timestamp: new Date()
      };
      const destination: GeoLocation = { 
        latitude: 0, 
        longitude: 1,
        timestamp: new Date()
      };

      const distance = client.calculateHaversineDistance(origin, destination);

      // At equator, 1 degree longitude ≈ 111.32 km (111320 meters)
      expect(distance).toBeGreaterThan(110000);
      expect(distance).toBeLessThan(112000);
    });

    it('should handle antipodal points', () => {
      const origin: GeoLocation = { 
        latitude: 0, 
        longitude: 0,
        timestamp: new Date()
      };
      const destination: GeoLocation = { 
        latitude: 0, 
        longitude: 180,
        timestamp: new Date()
      };

      const distance = client.calculateHaversineDistance(origin, destination);

      // Half Earth's circumference ≈ 20015 km (20015000 meters)
      expect(distance).toBeGreaterThan(20000000);
      expect(distance).toBeLessThan(20100000);
    });
  });

  describe('isLocationWithinGeoFence', () => {
    it('should detect location within geo-fence', () => {
      const location: GeoLocation = { 
        latitude: 40.7128, 
        longitude: -74.006,
        timestamp: new Date()
      };
      const fenceCenter: GeoLocation = { 
        latitude: 40.7128, 
        longitude: -74.006,
        timestamp: new Date()
      };
      const radiusInMeters = 1000;

      const isWithin = client.isLocationWithinGeoFence(location, fenceCenter, radiusInMeters);

      expect(isWithin).toBe(true);
    });

    it('should detect location outside geo-fence', () => {
      const location: GeoLocation = { 
        latitude: 40.7128, 
        longitude: -74.006,
        timestamp: new Date()
      };
      const fenceCenter: GeoLocation = { 
        latitude: 40.7489, 
        longitude: -73.968,
        timestamp: new Date()
      };
      const radiusInMeters = 100; // Very small radius

      const isWithin = client.isLocationWithinGeoFence(location, fenceCenter, radiusInMeters);

      expect(isWithin).toBe(false);
    });

    it('should handle edge case at exact radius', () => {
      const location: GeoLocation = { 
        latitude: 40.7128, 
        longitude: -74.006,
        timestamp: new Date()
      };
      const fenceCenter: GeoLocation = { 
        latitude: 40.7128, 
        longitude: -74.006,
        timestamp: new Date()
      };
      const distance = client.calculateHaversineDistance(location, fenceCenter);

      const isWithin = client.isLocationWithinGeoFence(location, fenceCenter, distance);

      expect(isWithin).toBe(true);
    });
  });

  describe('detectAnomalies', () => {
    it('should detect excessive speed', () => {
      const waypoints: GeoLocation[] = [
        { latitude: 40.7128, longitude: -74.006, timestamp: new Date('2024-01-01T10:00:00Z') },
        { latitude: 40.7489, longitude: -73.968, timestamp: new Date('2024-01-01T10:05:00Z') },
      ];
      const totalDistance = 100000; // 100 km
      const totalDuration = 300; // 5 minutes (very fast!)

      const anomalies = client.detectAnomalies(waypoints, totalDistance, totalDuration);

      expect(anomalies.length).toBeGreaterThan(0);
      expect(anomalies.some(a => a.type === 'Speed')).toBe(true);
    });

    it('should detect time gaps', () => {
      const waypoints: GeoLocation[] = [
        { latitude: 40.7128, longitude: -74.006, timestamp: new Date('2024-01-01T10:00:00Z') },
        { latitude: 40.7489, longitude: -73.968, timestamp: new Date('2024-01-01T14:00:00Z') }, // 4 hours later
      ];
      const totalDistance = 5000; // 5 km
      const totalDuration = 14400; // 4 hours

      const anomalies = client.detectAnomalies(waypoints, totalDistance, totalDuration);

      expect(anomalies.length).toBeGreaterThan(0);
      expect(anomalies.some(a => a.type === 'TimeGap')).toBe(true);
    });

    it('should detect short distance', () => {
      const waypoints: GeoLocation[] = [
        { latitude: 40.7128, longitude: -74.006, timestamp: new Date('2024-01-01T10:00:00Z') },
        { latitude: 40.7129, longitude: -74.0061, timestamp: new Date('2024-01-01T10:05:00Z') },
      ];
      const totalDistance = 50; // 50 meters (very short)
      const totalDuration = 300; // 5 minutes

      const anomalies = client.detectAnomalies(waypoints, totalDistance, totalDuration);

      // Short distance anomaly is detected when distance < minDistanceThreshold (default 1 km = 1000m)
      // 50 meters is definitely less than 1000 meters
      expect(anomalies.some(a => a.type === 'Distance')).toBe(true);
    });

    it('should return no anomalies for normal journey', () => {
      const waypoints: GeoLocation[] = [
        { latitude: 40.7128, longitude: -74.006, timestamp: new Date('2024-01-01T10:00:00Z') },
        { latitude: 40.7489, longitude: -73.968, timestamp: new Date('2024-01-01T10:15:00Z') },
      ];
      const totalDistance = 5000; // 5 km
      const totalDuration = 900; // 15 minutes

      const anomalies = client.detectAnomalies(waypoints, totalDistance, totalDuration);

      expect(anomalies.length).toBe(0);
    });
  });

  describe('isConfigured', () => {
    it('should check if client is configured', () => {
      const isConfigured = client.isConfigured();

      expect(typeof isConfigured).toBe('boolean');
    });
  });
});
