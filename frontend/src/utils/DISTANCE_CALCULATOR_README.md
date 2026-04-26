# Distance Calculator Utility Module

## Overview

The Distance Calculator utility module provides a comprehensive set of functions for calculating distances between geographic coordinates using the Haversine formula and related distance statistics. This module is essential for the geo-tracking and travel allowance features of the Employee Management System.

## Features

- **Haversine Distance Calculation**: Accurate great-circle distance calculation between two geographic points
- **Total Distance Calculation**: Sum of distances across multiple waypoints
- **Distance Statistics**: Calculate min, max, average distances and segment counts
- **Travel Allowance Calculation**: Compute travel allowance based on distance and rate with min/max constraints
- **Average Speed Calculation**: Calculate average speed from distance and duration
- **Speed Anomaly Detection**: Identify journeys with unusually high speeds
- **Formatting Utilities**: Format distances and speeds for display

## API Reference

### Core Functions

#### `calculateHaversineDistance(point1: GeoPoint, point2: GeoPoint): number`

Calculates the great-circle distance between two geographic points using the Haversine formula.

**Parameters:**
- `point1`: First geographic point with `latitude` and `longitude`
- `point2`: Second geographic point with `latitude` and `longitude`

**Returns:** Distance in kilometers

**Example:**
```typescript
const distance = calculateHaversineDistance(
  { latitude: 40.7128, longitude: -74.0060 },
  { latitude: 34.0522, longitude: -118.2437 }
);
console.log(distance); // ~3944 km (NYC to LA)
```

**Properties:**
- Symmetric: `distance(A, B) === distance(B, A)`
- Non-negative: Always returns >= 0
- Zero for same point: `distance(P, P) === 0`
- Satisfies triangle inequality: `distance(A, C) <= distance(A, B) + distance(B, C)`

---

#### `calculateTotalDistance(waypoints: GeoPoint[]): number`

Calculates total distance traveled across multiple waypoints by summing distances between consecutive waypoint pairs.

**Parameters:**
- `waypoints`: Array of geographic points in order of travel

**Returns:** Total distance in kilometers

**Example:**
```typescript
const waypoints = [
  { latitude: 40.7128, longitude: -74.0060 },
  { latitude: 40.7580, longitude: -73.9855 },
  { latitude: 40.7489, longitude: -73.9680 }
];
const totalDistance = calculateTotalDistance(waypoints);
console.log(totalDistance); // ~9 km
```

**Edge Cases:**
- Empty array: Returns 0
- Single point: Returns 0
- Two or more points: Returns sum of consecutive distances

---

#### `calculateDistanceStats(waypoints: GeoPoint[]): DistanceStats`

Calculates comprehensive distance statistics from a set of waypoints.

**Parameters:**
- `waypoints`: Array of geographic points

**Returns:** Object with the following properties:
```typescript
{
  totalDistance: number;      // Sum of all segment distances
  averageDistance: number;    // Average distance per segment
  minDistance: number;        // Minimum distance between consecutive points
  maxDistance: number;        // Maximum distance between consecutive points
  segmentCount: number;       // Number of segments (waypoints - 1)
}
```

**Example:**
```typescript
const stats = calculateDistanceStats(waypoints);
console.log(stats);
// {
//   totalDistance: 15.5,
//   averageDistance: 5.17,
//   minDistance: 2.1,
//   maxDistance: 8.3,
//   segmentCount: 3
// }
```

---

#### `calculateTravelAllowance(distance: number, ratePerKm: number, minAllowance?: number, maxAllowance?: number): number`

Calculates travel allowance based on distance and rate with optional min/max constraints.

**Parameters:**
- `distance`: Distance traveled in kilometers
- `ratePerKm`: Allowance rate per kilometer
- `minAllowance`: Minimum allowance amount (optional)
- `maxAllowance`: Maximum allowance amount (optional)

**Returns:** Calculated allowance amount

**Example:**
```typescript
// Basic calculation
const allowance1 = calculateTravelAllowance(50, 5);
console.log(allowance1); // 250

// With constraints
const allowance2 = calculateTravelAllowance(50, 5, 100, 500);
console.log(allowance2); // 250 (within bounds)

const allowance3 = calculateTravelAllowance(10, 5, 100, 500);
console.log(allowance3); // 100 (below min, clamped to min)

const allowance4 = calculateTravelAllowance(100, 5, 100, 500);
console.log(allowance4); // 500 (above max, clamped to max)
```

---

#### `calculateAverageSpeed(distance: number, durationMinutes: number): number`

Calculates average speed based on distance and duration.

**Parameters:**
- `distance`: Distance traveled in kilometers
- `durationMinutes`: Duration of travel in minutes

**Returns:** Average speed in km/h

**Example:**
```typescript
const speed = calculateAverageSpeed(100, 60);
console.log(speed); // 100 km/h

const speed2 = calculateAverageSpeed(50, 30);
console.log(speed2); // 100 km/h
```

---

#### `detectSpeedAnomalies(waypoints: GeoPoint[], timestamps: number[], maxSpeedKmh?: number): number[]`

Detects anomalies in travel data based on speed thresholds.

**Parameters:**
- `waypoints`: Array of geographic points
- `timestamps`: Array of timestamps corresponding to waypoints (in milliseconds)
- `maxSpeedKmh`: Maximum expected speed in km/h (default: 120)

**Returns:** Array of segment indices with anomalies

**Example:**
```typescript
const waypoints = [
  { latitude: 0, longitude: 0 },
  { latitude: 0, longitude: 5 }
];
const timestamps = [0, 60000]; // 1 minute apart

const anomalies = detectSpeedAnomalies(waypoints, timestamps, 120);
console.log(anomalies); // [0] - segment 0 has anomaly (very high speed)
```

---

### Formatting Functions

#### `formatDistance(distance: number, decimals?: number): string`

Formats distance value with appropriate unit and precision.

**Parameters:**
- `distance`: Distance in kilometers
- `decimals`: Number of decimal places (default: 2)

**Returns:** Formatted distance string

**Example:**
```typescript
console.log(formatDistance(15.5));      // "15.50 km"
console.log(formatDistance(0.5, 1));    // "0.5 km"
console.log(formatDistance(1234.567));  // "1234.57 km"
```

---

#### `formatSpeed(speed: number, decimals?: number): string`

Formats speed value with appropriate unit and precision.

**Parameters:**
- `speed`: Speed in km/h
- `decimals`: Number of decimal places (default: 1)

**Returns:** Formatted speed string

**Example:**
```typescript
console.log(formatSpeed(45.5));    // "45.5 km/h"
console.log(formatSpeed(120.567)); // "120.6 km/h"
```

---

## Types

### `GeoPoint`

Represents a geographic coordinate.

```typescript
interface GeoPoint {
  latitude: number;   // Latitude in degrees (-90 to 90)
  longitude: number;  // Longitude in degrees (-180 to 180)
}
```

### `DistanceStats`

Contains distance statistics for a set of waypoints.

```typescript
interface DistanceStats {
  totalDistance: number;      // Sum of all segment distances (km)
  averageDistance: number;    // Average distance per segment (km)
  minDistance: number;        // Minimum distance between consecutive points (km)
  maxDistance: number;        // Maximum distance between consecutive points (km)
  segmentCount: number;       // Number of segments
}
```

## Usage Examples

### Example 1: Calculate Distance Between Two Cities

```typescript
import { calculateHaversineDistance, formatDistance } from '@/utils/distanceCalculator';

const newYork = { latitude: 40.7128, longitude: -74.0060 };
const losAngeles = { latitude: 34.0522, longitude: -118.2437 };

const distance = calculateHaversineDistance(newYork, losAngeles);
console.log(formatDistance(distance)); // "3944.00 km"
```

### Example 2: Calculate Travel Allowance for a Journey

```typescript
import { calculateTotalDistance, calculateTravelAllowance } from '@/utils/distanceCalculator';

const waypoints = [
  { latitude: 40.7128, longitude: -74.0060 },
  { latitude: 40.7580, longitude: -73.9855 },
  { latitude: 40.7489, longitude: -73.9680 }
];

const totalDistance = calculateTotalDistance(waypoints);
const allowance = calculateTravelAllowance(
  totalDistance,
  5,      // ₹5 per km
  100,    // Minimum ₹100
  500     // Maximum ₹500
);

console.log(`Distance: ${totalDistance.toFixed(2)} km`);
console.log(`Allowance: ₹${allowance.toFixed(2)}`);
```

### Example 3: Analyze Journey Statistics

```typescript
import { calculateDistanceStats, formatDistance } from '@/utils/distanceCalculator';

const waypoints = [
  { latitude: 40.7128, longitude: -74.0060 },
  { latitude: 40.7580, longitude: -73.9855 },
  { latitude: 40.7489, longitude: -73.9680 },
  { latitude: 40.7128, longitude: -74.0060 }
];

const stats = calculateDistanceStats(waypoints);

console.log(`Total Distance: ${formatDistance(stats.totalDistance)}`);
console.log(`Average Distance: ${formatDistance(stats.averageDistance)}`);
console.log(`Min Distance: ${formatDistance(stats.minDistance)}`);
console.log(`Max Distance: ${formatDistance(stats.maxDistance)}`);
console.log(`Segments: ${stats.segmentCount}`);
```

### Example 4: Detect Speed Anomalies

```typescript
import { detectSpeedAnomalies, calculateAverageSpeed } from '@/utils/distanceCalculator';

const waypoints = [
  { latitude: 0, longitude: 0 },
  { latitude: 0, longitude: 1 },
  { latitude: 0, longitude: 2 }
];

const timestamps = [
  0,
  60000,      // 1 minute
  120000      // 2 minutes
];

const anomalies = detectSpeedAnomalies(waypoints, timestamps, 100);

if (anomalies.length > 0) {
  console.log(`Found ${anomalies.length} anomalies at segments: ${anomalies.join(', ')}`);
}
```

## Mathematical Properties

### Haversine Formula

The Haversine formula calculates the great-circle distance between two points on a sphere given their latitudes and longitudes:

```
a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)
c = 2 × atan2(√a, √(1−a))
d = R × c
```

Where:
- `Δlat` = lat2 - lat1
- `Δlon` = lon2 - lon1
- `R` = Earth's radius (6,371 km)
- `d` = Distance

### Key Properties

1. **Symmetry**: Distance from A to B equals distance from B to A
2. **Non-negativity**: Distance is always >= 0
3. **Identity**: Distance from a point to itself is 0
4. **Triangle Inequality**: Distance(A, C) <= Distance(A, B) + Distance(B, C)
5. **Additivity**: Total distance = sum of segment distances

## Performance Considerations

- **Time Complexity**: O(n) for calculating total distance or statistics from n waypoints
- **Space Complexity**: O(1) for distance calculations (O(n) for anomaly detection)
- **Accuracy**: Accurate to within ~0.5% for Earth distances

## Testing

The module includes comprehensive unit tests covering:

- Basic distance calculations
- Edge cases (same point, antipodal points, poles)
- Mathematical properties (symmetry, triangle inequality)
- Statistics calculations
- Allowance calculations with constraints
- Speed anomaly detection
- Formatting functions

Run tests with:
```bash
npm test -- distanceCalculator.test.ts --run
```

## Integration with TravelStatistics Component

The `TravelStatistics` component uses these utilities to display:

- Total distance traveled
- Average, minimum, and maximum distances
- Average speed calculations
- Travel allowance summaries
- Speed anomaly detection and display

See `TravelStatistics.tsx` for component usage examples.

## Best Practices

1. **Always validate input**: Ensure waypoints are in valid coordinate ranges
2. **Handle edge cases**: Check for empty arrays or single points
3. **Use appropriate precision**: Format distances with 2 decimals, speeds with 1 decimal
4. **Consider constraints**: Apply min/max allowance constraints for business rules
5. **Monitor anomalies**: Flag unusual speeds for review

## References

- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)
- [Great-circle Distance](https://en.wikipedia.org/wiki/Great-circle_distance)
- [Geographic Coordinate System](https://en.wikipedia.org/wiki/Geographic_coordinate_system)
