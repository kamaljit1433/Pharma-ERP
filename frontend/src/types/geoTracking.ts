/**
 * Geo Tracking Types for Frontend
 * Defines TypeScript interfaces for geo tracking, travel logs, and allowances
 */

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  timestamp: Date;
  address?: string;
}

export interface Journey {
  id: string;
  employeeId: string;
  startLocation: GeoLocation;
  endLocation: GeoLocation;
  waypoints: GeoLocation[];
  totalDistance: number;
  totalDuration: number;
  startTime: Date;
  endTime: Date;
  purpose?: string;
  travelAllowance: number;
  status: 'In Progress' | 'Completed' | 'Cancelled' | 'Pending' | 'Approved' | 'Rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface GeoFence {
  id: string;
  name: string;
  center: GeoLocation;
  radius: number;
  type: 'Office' | 'Site' | 'Restricted' | 'Custom';
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface DistanceResult {
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
  status: string;
}

export interface TravelAllowanceResult {
  distance: number;
  rate: number;
  unit: 'per_km' | 'per_mile';
  allowance: number;
  currency: string;
}

export interface GeoLog {
  id: string;
  employeeId: string;
  location: GeoLocation;
  action: 'CheckIn' | 'CheckOut' | 'Journey' | 'Manual';
  journeyId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface GeoTrackingStats {
  employeeId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalJourneys: number;
  totalDistance: number;
  totalTravelAllowance: number;
  averageDistancePerJourney: number;
  anomaliesDetected: number;
  anomaliesByType: Record<string, number>;
}

export interface CaptureLocationDTO {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  address?: string;
}

export interface TrackJourneyDTO {
  employeeId: string;
  startLocation: CaptureLocationDTO;
  endLocation: CaptureLocationDTO;
  waypoints?: CaptureLocationDTO[];
  purpose?: string;
}

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

export interface ValidateGeoFenceDTO {
  location: GeoLocation;
  geoFenceId: string;
}

export interface CreateGeoFenceDTO {
  name: string;
  center: {
    latitude: number;
    longitude: number;
  };
  radius: number;
  type: 'Office' | 'Site' | 'Restricted' | 'Custom';
}

export interface GeoTrackingResponseDTO {
  success: boolean;
  data?: unknown;
  error?: string;
  timestamp: Date;
}
