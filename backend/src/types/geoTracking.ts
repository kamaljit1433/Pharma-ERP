/**
 * Geo Tracking Types
 * Defines TypeScript interfaces for geo tracking, distance calculation,
 * and travel allowance computation
 */

/**
 * Geographic location with latitude and longitude
 */
export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number; // Accuracy in meters
  altitude?: number; // Altitude in meters
  timestamp: Date;
  address?: string; // Human-readable address
}

/**
 * Journey tracking with multiple waypoints
 */
export interface Journey {
  id: string;
  employeeId: string;
  startLocation: GeoLocation;
  endLocation: GeoLocation;
  waypoints: GeoLocation[];
  totalDistance: number; // in kilometers
  totalDuration: number; // in seconds
  startTime: Date;
  endTime: Date;
  purpose?: string; // e.g., "Client visit", "Site inspection"
  travelAllowance: number; // Calculated allowance
  status: 'In Progress' | 'Completed' | 'Cancelled';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Geo-fence definition for location validation
 */
export interface GeoFence {
  id: string;
  name: string;
  center: GeoLocation;
  radius: number; // in meters
  type: 'Office' | 'Site' | 'Restricted' | 'Custom';
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Anomaly detected in journey tracking
 */
export interface Anomaly {
  id: string;
  journeyId: string;
  type: 'Speed' | 'TimeGap' | 'Distance' | 'Location' | 'Other';
  severity: 'Low' | 'Medium' | 'High';
  description: string;
  details: Record<string, unknown>;
  flaggedAt: Date;
  reviewed: boolean;
  reviewedBy?: string;
  reviewNotes?: string;
}

/**
 * Distance calculation result from Google Maps API
 */
export interface DistanceResult {
  distance: {
    text: string; // e.g., "5.2 km"
    value: number; // in meters
  };
  duration: {
    text: string; // e.g., "15 mins"
    value: number; // in seconds
  };
  status: 'OK' | 'NOT_FOUND' | 'ZERO_RESULTS' | 'MAX_WAYPOINTS_EXCEEDED' | 'REQUEST_DENIED' | 'INVALID_REQUEST' | 'OVER_QUERY_LIMIT' | 'UNKNOWN_ERROR';
}

/**
 * Travel allowance calculation result
 */
export interface TravelAllowanceResult {
  distance: number; // in kilometers
  rate: number; // per km or per mile
  unit: 'per_km' | 'per_mile';
  allowance: number; // calculated amount
  currency: string; // e.g., "INR", "USD"
}

/**
 * Geo log entry for audit trail
 */
export interface GeoLog {
  id: string;
  employeeId: string;
  location: GeoLocation;
  action: 'CheckIn' | 'CheckOut' | 'Journey' | 'Manual';
  journeyId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

/**
 * Request DTO for capturing location
 */
export interface CaptureLocationDTO {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  address?: string;
}

/**
 * Request DTO for tracking journey
 */
export interface TrackJourneyDTO {
  employeeId: string;
  startLocation: CaptureLocationDTO;
  endLocation: CaptureLocationDTO;
  waypoints?: CaptureLocationDTO[];
  purpose?: string;
}

/**
 * Request DTO for calculating distance
 */
export interface CalculateDistanceDTO {
  origin: {
    latitude: number;
    longitude: number;
  };
  destination: {
    latitude: number;
    longitude: number;
  };
  mode?: 'driving' | 'walking' | 'bicycling' | 'transit';
}

/**
 * Request DTO for validating geo-fence
 */
export interface ValidateGeoFenceDTO {
  location: GeoLocation;
  geoFenceId: string;
}

/**
 * Request DTO for creating geo-fence
 */
export interface CreateGeoFenceDTO {
  name: string;
  center: {
    latitude: number;
    longitude: number;
  };
  radius: number;
  type: 'Office' | 'Site' | 'Restricted' | 'Custom';
}

/**
 * Response DTO for geo tracking operations
 */
export interface GeoTrackingResponseDTO {
  success: boolean;
  data?: unknown;
  error?: string;
  timestamp: Date;
}

/**
 * Google Maps Distance Matrix API Response
 */
export interface GoogleMapsDistanceMatrixResponse {
  status: string;
  origin_addresses: string[];
  destination_addresses: string[];
  rows: Array<{
    elements: Array<{
      status: string;
      distance?: {
        value: number;
        text: string;
      };
      duration?: {
        value: number;
        text: string;
      };
    }>;
  }>;
}

/**
 * Google Maps Geocoding API Response
 */
export interface GoogleMapsGeocodingResponse {
  results: Array<{
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
      location_type: string;
      bounds?: {
        northeast: { lat: number; lng: number };
        southwest: { lat: number; lng: number };
      };
    };
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
  }>;
  status: string;
}

/**
 * Geo tracking statistics for reporting
 */
export interface GeoTrackingStats {
  employeeId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalJourneys: number;
  totalDistance: number; // in kilometers
  totalTravelAllowance: number;
  averageDistancePerJourney: number;
  anomaliesDetected: number;
  anomaliesByType: Record<string, number>;
}
