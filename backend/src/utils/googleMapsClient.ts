import axios, { AxiosInstance } from 'axios';
import googleMapsConfig from '../config/googleMaps';
import {
  DistanceResult,
  GoogleMapsDistanceMatrixResponse,
  GoogleMapsGeocodingResponse,
  GeoLocation,
} from '../types/geoTracking';
import logger from './logger';

/**
 * Google Maps API Client
 * Handles all interactions with Google Maps APIs
 */
class GoogleMapsClient {
  private client: AxiosInstance;
  private apiKey: string;
  private distanceMatrixApiKey: string;

  constructor() {
    this.apiKey = googleMapsConfig.apiKey;
    this.distanceMatrixApiKey = googleMapsConfig.distanceMatrixApiKey || this.apiKey;

    this.client = axios.create({
      timeout: googleMapsConfig.request.timeout,
    });

    // Add retry logic
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;
        if (!config || !config.retryCount) {
          config.retryCount = 0;
        }

        config.retryCount += 1;

        if (config.retryCount <= googleMapsConfig.request.retries) {
          await new Promise((resolve) =>
            setTimeout(resolve, googleMapsConfig.request.retryDelay)
          );
          return this.client(config);
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Calculate distance between two locations using Distance Matrix API
   */
  async calculateDistance(
    origin: GeoLocation,
    destination: GeoLocation,
    mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
  ): Promise<DistanceResult> {
    try {
      const originCoords = `${origin.latitude},${origin.longitude}`;
      const destinationCoords = `${destination.latitude},${destination.longitude}`;

      const response = await this.client.get<GoogleMapsDistanceMatrixResponse>(
        googleMapsConfig.endpoints.distanceMatrix,
        {
          params: {
            origins: originCoords,
            destinations: destinationCoords,
            mode,
            key: this.distanceMatrixApiKey,
          },
        }
      );

      if (response.data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${response.data.status}`);
      }

      const element = response.data.rows[0]?.elements[0];
      if (!element || element.status !== 'OK') {
        throw new Error('Unable to calculate distance between locations');
      }

      return {
        distance: element.distance!,
        duration: element.duration!,
        status: 'OK',
      };
    } catch (error) {
      logger.error('Error calculating distance:', { error });
      throw error;
    }
  }

  /**
   * Calculate distance between multiple waypoints
   */
  async calculateDistanceWithWaypoints(
    origin: GeoLocation,
    destination: GeoLocation,
    waypoints: GeoLocation[] = [],
    mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
  ): Promise<DistanceResult> {
    try {
      const originCoords = `${origin.latitude},${origin.longitude}`;
      const destinationCoords = `${destination.latitude},${destination.longitude}`;
      const waypointCoords = waypoints
        .map((wp) => `${wp.latitude},${wp.longitude}`)
        .join('|');

      const response = await this.client.get(
        googleMapsConfig.endpoints.directions,
        {
          params: {
            origin: originCoords,
            destination: destinationCoords,
            waypoints: waypointCoords || undefined,
            mode,
            key: this.apiKey,
          },
        }
      );

      if (response.data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${response.data.status}`);
      }

      const route = response.data.routes[0];
      if (!route) {
        throw new Error('No route found');
      }

      const totalDistance = route.legs.reduce(
        (sum: number, leg: any) => sum + (leg.distance?.value || 0),
        0
      );
      const totalDuration = route.legs.reduce(
        (sum: number, leg: any) => sum + (leg.duration?.value || 0),
        0
      );

      return {
        distance: {
          text: `${(totalDistance / 1000).toFixed(2)} km`,
          value: totalDistance,
        },
        duration: {
          text: this.formatDuration(totalDuration),
          value: totalDuration,
        },
        status: 'OK',
      };
    } catch (error) {
      logger.error('Error calculating distance with waypoints:', { error });
      throw error;
    }
  }

  /**
   * Geocode coordinates to address
   */
  async geocodeCoordinates(location: GeoLocation): Promise<string> {
    try {
      const response = await this.client.get<GoogleMapsGeocodingResponse>(
        googleMapsConfig.endpoints.geocoding,
        {
          params: {
            latlng: `${location.latitude},${location.longitude}`,
            key: this.apiKey,
          },
        }
      );

      if (response.data.status !== 'OK' || response.data.results.length === 0) {
        return `${location.latitude}, ${location.longitude}`;
      }

      return response.data.results[0]!.formatted_address;
    } catch (error) {
      logger.error('Error geocoding coordinates:', { error });
      return `${location.latitude}, ${location.longitude}`;
    }
  }

  /**
   * Reverse geocode address to coordinates
   */
  async reverseGeocodeAddress(address: string): Promise<GeoLocation | null> {
    try {
      const response = await this.client.get<GoogleMapsGeocodingResponse>(
        googleMapsConfig.endpoints.geocoding,
        {
          params: {
            address,
            key: this.apiKey,
          },
        }
      );

      if (response.data.status !== 'OK' || response.data.results.length === 0) {
        return null;
      }

      const result = response.data.results[0]!;
      return {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        timestamp: new Date(),
        address: result.formatted_address,
      };
    } catch (error) {
      logger.error('Error reverse geocoding address:', { error });
      return null;
    }
  }

  /**
   * Check if location is within geo-fence
   */
  isLocationWithinGeoFence(
    location: GeoLocation,
    fenceCenter: GeoLocation,
    radiusInMeters: number
  ): boolean {
    const distance = this.calculateHaversineDistance(location, fenceCenter);
    return distance <= radiusInMeters;
  }

  /**
   * Calculate Haversine distance between two coordinates (in meters)
   * Used for client-side geo-fence validation without API calls
   */
  calculateHaversineDistance(location1: GeoLocation, location2: GeoLocation): number {
    const R = 6371000; // Earth's radius in meters
    const lat1 = this.toRadians(location1.latitude);
    const lat2 = this.toRadians(location2.latitude);
    const deltaLat = this.toRadians(location2.latitude - location1.latitude);
    const deltaLng = this.toRadians(location2.longitude - location1.longitude);

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLng / 2) *
        Math.sin(deltaLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Detect anomalies in journey
   */
  detectAnomalies(
    waypoints: GeoLocation[],
    totalDistance: number,
    totalDuration: number
  ): Array<{ type: string; severity: string; description: string }> {
    const anomalies: Array<{ type: string; severity: string; description: string }> = [];

    // Check for excessive speed
    const speedKmh = (totalDistance / 1000) / (totalDuration / 3600);
    if (speedKmh > googleMapsConfig.anomalyDetection.maxSpeedThreshold) {
      anomalies.push({
        type: 'Speed',
        severity: 'High',
        description: `Excessive speed detected: ${speedKmh.toFixed(2)} km/h`,
      });
    }

    // Check for time gaps between waypoints
    for (let i = 1; i < waypoints.length; i++) {
      const timeDiff =
        waypoints[i]!.timestamp.getTime() - waypoints[i - 1]!.timestamp.getTime();
      if (timeDiff > googleMapsConfig.anomalyDetection.maxTimeGap) {
        anomalies.push({
          type: 'TimeGap',
          severity: 'Medium',
          description: `Large time gap detected: ${(timeDiff / 60000).toFixed(2)} minutes`,
        });
      }
    }

    // Check for minimum distance
    if (totalDistance < googleMapsConfig.anomalyDetection.minDistanceThreshold * 1000) {
      anomalies.push({
        type: 'Distance',
        severity: 'Low',
        description: 'Journey distance is very short',
      });
    }

    return anomalies;
  }

  /**
   * Format duration in seconds to readable string
   */
  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} min${minutes !== 1 ? 's' : ''}`;
    }
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Validate API configuration
   */
  isConfigured(): boolean {
    return !!this.apiKey && googleMapsConfig.enabled;
  }
}

export default new GoogleMapsClient();
