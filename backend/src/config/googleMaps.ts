import dotenv from 'dotenv';

dotenv.config();

/**
 * Google Maps API Configuration
 * Handles initialization and configuration of Google Maps services
 * for geo tracking, distance calculation, and travel allowance computation
 */

export const googleMapsConfig = {
  // API Keys
  apiKey: process.env['GOOGLE_MAPS_API_KEY'] || '',
  distanceMatrixApiKey: process.env['GOOGLE_MAPS_DISTANCE_MATRIX_API_KEY'] || '',

  // Feature Flags
  enabled: process.env['GOOGLE_MAPS_ENABLED'] === 'true',
  geoTrackingEnabled: process.env['GEO_TRACKING_ENABLED'] === 'true',

  // Travel Allowance Configuration
  travelAllowance: {
    rate: parseFloat(process.env['TRAVEL_ALLOWANCE_RATE'] || '5'),
    unit: process.env['TRAVEL_ALLOWANCE_UNIT'] || 'per_km', // per_km or per_mile
  },

  // API Endpoints
  endpoints: {
    distanceMatrix: 'https://maps.googleapis.com/maps/api/distancematrix/json',
    geocoding: 'https://maps.googleapis.com/maps/api/geocode/json',
    directions: 'https://maps.googleapis.com/maps/api/directions/json',
  },

  // Request Configuration
  request: {
    timeout: 10000, // 10 seconds
    retries: 3,
    retryDelay: 1000, // 1 second
  },

  // Geo-fencing Configuration
  geoFencing: {
    defaultRadius: 100, // meters
    maxRadius: 5000, // meters
  },

  // Anomaly Detection Configuration
  anomalyDetection: {
    maxSpeedThreshold: 120, // km/h - flag if journey exceeds this
    minDistanceThreshold: 0.1, // km - minimum distance to track
    maxTimeGap: 3600000, // 1 hour in milliseconds - flag if gap between waypoints exceeds this
  },
};

/**
 * Validate Google Maps configuration
 * Ensures required API keys are present when feature is enabled
 */
export function validateGoogleMapsConfig(): boolean {
  if (!googleMapsConfig.enabled) {
    console.warn('Google Maps API is disabled');
    return true;
  }

  if (!googleMapsConfig.apiKey) {
    console.error('GOOGLE_MAPS_API_KEY is not configured');
    return false;
  }

  if (!googleMapsConfig.distanceMatrixApiKey) {
    console.warn('GOOGLE_MAPS_DISTANCE_MATRIX_API_KEY is not configured, using main API key');
  }

  return true;
}

export default googleMapsConfig;
