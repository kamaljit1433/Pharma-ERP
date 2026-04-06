/**
 * Geo Tracking Service
 * Handles GPS location capture, distance calculation, and geo-fencing
 */

interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

interface Journey {
  id: string;
  employeeId: string;
  date: Date;
  waypoints: GeoLocation[];
  totalKm: number;
  anomalies: Anomaly[];
  createdAt: Date;
}

interface Anomaly {
  type: 'unusual_distance' | 'impossible_speed' | 'location_jump';
  description: string;
  severity: 'low' | 'medium' | 'high';
  waypoints: GeoLocation[];
}

interface GeoFence {
  id: string;
  name: string;
  center: GeoLocation;
  radiusMeters: number;
}

export class GeoTrackingService {
  // googleMapsApiKey will be added as a method param when Google Maps distance-matrix
  // or routing APIs are integrated. It is not used yet so it is not stored as a field.

  constructor(_googleMapsApiKey?: string) {
    // key reserved for future use
  }

  /**
   * captureLocation() — NOT available on the backend.
   *
   * navigator.geolocation is a browser-only Web API. It does not exist in Node.js
   * and will always throw a ReferenceError at runtime.
   *
   * Location capture MUST happen on the client (frontend / mobile app).
   * The client should send the coordinates to the backend via the request body.
   */
  captureLocation(): never {
    throw new Error(
      'captureLocation() is not supported on the backend. ' +
      'Capture GPS coordinates on the client and send them in the request body.'
    );
  }

  /**
   * Calculate distance between two GPS coordinates using Haversine formula
   * Returns distance in kilometers
   */
  calculateDistance(
    point1: GeoLocation,
    point2: GeoLocation
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this._toRad(point2.latitude - point1.latitude);
    const dLon = this._toRad(point2.longitude - point1.longitude);
    const lat1 = this._toRad(point1.latitude);
    const lat2 = this._toRad(point2.latitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) *
        Math.sin(dLon / 2) *
        Math.cos(lat1) *
        Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  /**
   * Calculate total distance from a journey with multiple waypoints
   */
  calculateTotalDistance(waypoints: GeoLocation[]): number {
    if (waypoints.length < 2) {
      return 0;
    }

    let totalDistance = 0;
    for (let i = 1; i < waypoints.length; i++) {
      // Loop bounds guarantee both indices are in range; non-null assertions are safe
      totalDistance += this.calculateDistance(waypoints[i - 1]!, waypoints[i]!);
    }

    return totalDistance;
  }

  /**
   * Validate if a location is within a geo-fence
   */
  validateGeoFence(location: GeoLocation, geoFence: GeoFence): boolean {
    const distance = this.calculateDistance(location, geoFence.center);
    const distanceInMeters = distance * 1000;
    return distanceInMeters <= geoFence.radiusMeters;
  }

  /**
   * Detect anomalies in a journey (unusual distances, impossible speeds, etc.)
   */
  detectAnomalies(journey: Journey): Anomaly[] {
    const anomalies: Anomaly[] = [];
    const waypoints = journey.waypoints;

    if (waypoints.length < 2) {
      return anomalies;
    }

    // Check for unusual distances and impossible speeds
    for (let i = 1; i < waypoints.length; i++) {
      // Loop bounds guarantee both indices are in range; assertions are safe
      const prevPoint = waypoints[i - 1] as GeoLocation;
      const currentPoint = waypoints[i] as GeoLocation;

      const distance = this.calculateDistance(prevPoint, currentPoint);
      const timeDiffSeconds =
        (currentPoint.timestamp.getTime() - prevPoint.timestamp.getTime()) /
        1000;
      const speedKmh = (distance / timeDiffSeconds) * 3600;

      // Check for impossible speed (> 300 km/h)
      if (speedKmh > 300) {
        anomalies.push({
          type: 'impossible_speed',
          description: `Impossible speed detected: ${speedKmh.toFixed(2)} km/h`,
          severity: 'high',
          waypoints: [prevPoint, currentPoint],
        });
      }

      // Check for unusual distance (> 100 km in 1 hour)
      if (distance > 100 && timeDiffSeconds < 3600) {
        anomalies.push({
          type: 'unusual_distance',
          description: `Unusual distance detected: ${distance.toFixed(2)} km in ${(timeDiffSeconds / 60).toFixed(2)} minutes`,
          severity: 'medium',
          waypoints: [prevPoint, currentPoint],
        });
      }

      // Check for location jumps (> 50 km in < 1 minute)
      if (distance > 50 && timeDiffSeconds < 60) {
        anomalies.push({
          type: 'location_jump',
          description: `Location jump detected: ${distance.toFixed(2)} km in ${timeDiffSeconds} seconds`,
          severity: 'high',
          waypoints: [prevPoint, currentPoint],
        });
      }
    }

    return anomalies;
  }

  /**
   * Calculate travel allowance based on distance and rate
   */
  calculateTravelAllowance(
    distance: number,
    ratePerKm: number
  ): number {
    return distance * ratePerKm;
  }

  /**
   * Convert degrees to radians
   */
  private _toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}

export const geoTrackingService = new GeoTrackingService();
export type { GeoLocation, Journey, Anomaly, GeoFence };
