/**
 * Distance Calculator Utility Module
 * Provides functions for calculating distances between geographic coordinates
 * using the Haversine formula and related distance statistics.
 */

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface DistanceStats {
  totalDistance: number;
  averageDistance: number;
  minDistance: number;
  maxDistance: number;
  segmentCount: number;
}

/**
 * Calculates the great-circle distance between two geographic points
 * using the Haversine formula.
 *
 * @param point1 - First geographic point (latitude, longitude)
 * @param point2 - Second geographic point (latitude, longitude)
 * @returns Distance in kilometers
 *
 * @example
 * const distance = calculateHaversineDistance(
 *   { latitude: 40.7128, longitude: -74.0060 },
 *   { latitude: 34.0522, longitude: -118.2437 }
 * );
 * console.log(distance); // ~3944 km
 */
export const calculateHaversineDistance = (point1: GeoPoint, point2: GeoPoint): number => {
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
 *
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
const toRadians = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

/**
 * Calculates total distance traveled across multiple waypoints.
 * Sums the distances between consecutive waypoint pairs.
 *
 * @param waypoints - Array of geographic points in order of travel
 * @returns Total distance in kilometers
 *
 * @example
 * const waypoints = [
 *   { latitude: 40.7128, longitude: -74.0060 },
 *   { latitude: 40.7580, longitude: -73.9855 },
 *   { latitude: 40.7489, longitude: -73.9680 }
 * ];
 * const totalDistance = calculateTotalDistance(waypoints);
 */
export const calculateTotalDistance = (waypoints: GeoPoint[]): number => {
  if (waypoints.length < 2) {
    return 0;
  }

  let totalDistance = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    totalDistance += calculateHaversineDistance(waypoints[i], waypoints[i + 1]);
  }

  return totalDistance;
};

/**
 * Calculates distance statistics from a set of waypoints.
 * Provides min, max, average, and total distance metrics.
 *
 * @param waypoints - Array of geographic points
 * @returns Object containing distance statistics
 *
 * @example
 * const stats = calculateDistanceStats(waypoints);
 * console.log(stats);
 * // {
 * //   totalDistance: 15.5,
 * //   averageDistance: 5.17,
 * //   minDistance: 2.1,
 * //   maxDistance: 8.3,
 * //   segmentCount: 3
 * // }
 */
export const calculateDistanceStats = (waypoints: GeoPoint[]): DistanceStats => {
  if (waypoints.length < 2) {
    return {
      totalDistance: 0,
      averageDistance: 0,
      minDistance: 0,
      maxDistance: 0,
      segmentCount: 0,
    };
  }

  const distances: number[] = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    distances.push(calculateHaversineDistance(waypoints[i], waypoints[i + 1]));
  }

  const totalDistance = distances.reduce((sum, d) => sum + d, 0);
  const averageDistance = totalDistance / distances.length;
  const minDistance = Math.min(...distances);
  const maxDistance = Math.max(...distances);

  return {
    totalDistance,
    averageDistance,
    minDistance,
    maxDistance,
    segmentCount: distances.length,
  };
};

/**
 * Calculates travel allowance based on distance and rate.
 * Applies minimum and maximum allowance constraints if provided.
 *
 * @param distance - Distance traveled in kilometers
 * @param ratePerKm - Allowance rate per kilometer
 * @param minAllowance - Minimum allowance amount (optional)
 * @param maxAllowance - Maximum allowance amount (optional)
 * @returns Calculated allowance amount
 *
 * @example
 * const allowance = calculateTravelAllowance(50, 5, 100, 500);
 * console.log(allowance); // 250 (50 * 5, within min/max bounds)
 */
export const calculateTravelAllowance = (
  distance: number,
  ratePerKm: number,
  minAllowance?: number,
  maxAllowance?: number
): number => {
  let allowance = distance * ratePerKm;

  if (minAllowance !== undefined && allowance < minAllowance) {
    allowance = minAllowance;
  }

  if (maxAllowance !== undefined && allowance > maxAllowance) {
    allowance = maxAllowance;
  }

  return allowance;
};

/**
 * Calculates average speed based on distance and duration.
 *
 * @param distance - Distance traveled in kilometers
 * @param durationMinutes - Duration of travel in minutes
 * @returns Average speed in km/h
 *
 * @example
 * const speed = calculateAverageSpeed(50, 60);
 * console.log(speed); // 50 km/h
 */
export const calculateAverageSpeed = (distance: number, durationMinutes: number): number => {
  if (durationMinutes === 0) {
    return 0;
  }

  const durationHours = durationMinutes / 60;
  return distance / durationHours;
};

/**
 * Detects anomalies in travel data based on speed thresholds.
 * Flags segments with unusually high speeds.
 *
 * @param waypoints - Array of geographic points
 * @param timestamps - Array of timestamps corresponding to waypoints (in milliseconds)
 * @param maxSpeedKmh - Maximum expected speed in km/h (default: 120)
 * @returns Array of anomaly indices (segment indices with anomalies)
 *
 * @example
 * const anomalies = detectSpeedAnomalies(waypoints, timestamps, 100);
 * console.log(anomalies); // [2, 5] - segments 2 and 5 have anomalies
 */
export const detectSpeedAnomalies = (
  waypoints: GeoPoint[],
  timestamps: number[],
  maxSpeedKmh: number = 120
): number[] => {
  if (waypoints.length < 2 || timestamps.length !== waypoints.length) {
    return [];
  }

  const anomalies: number[] = [];

  for (let i = 0; i < waypoints.length - 1; i++) {
    const distance = calculateHaversineDistance(waypoints[i], waypoints[i + 1]);
    const timeDiffMs = timestamps[i + 1] - timestamps[i];
    const timeDiffMinutes = timeDiffMs / (1000 * 60);

    if (timeDiffMinutes > 0) {
      const speed = calculateAverageSpeed(distance, timeDiffMinutes);
      if (speed > maxSpeedKmh) {
        anomalies.push(i);
      }
    }
  }

  return anomalies;
};

/**
 * Formats distance value with appropriate unit and precision.
 *
 * @param distance - Distance in kilometers
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted distance string (e.g., "15.50 km")
 *
 * @example
 * console.log(formatDistance(15.5)); // "15.50 km"
 * console.log(formatDistance(0.5)); // "0.50 km"
 */
export const formatDistance = (distance: number, decimals: number = 2): string => {
  return `${distance.toFixed(decimals)} km`;
};

/**
 * Formats speed value with appropriate unit and precision.
 *
 * @param speed - Speed in km/h
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted speed string (e.g., "45.5 km/h")
 *
 * @example
 * console.log(formatSpeed(45.5)); // "45.5 km/h"
 */
export const formatSpeed = (speed: number, decimals: number = 1): string => {
  return `${speed.toFixed(decimals)} km/h`;
};
