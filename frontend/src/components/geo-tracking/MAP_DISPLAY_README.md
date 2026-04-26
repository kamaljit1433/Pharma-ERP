# Map Display Components - Geo-tracking and Maps Integration

This document describes the implementation of map display components for the Employee Management System frontend, fulfilling requirements 28.3, 28.4, 28.7, and 28.9.

## Overview

The map display components provide comprehensive location visualization and geofence validation capabilities for the EMS frontend application. These components integrate with the Google Maps JavaScript API to display employee locations, travel history, and attendance records on interactive maps.

## Components

### 1. MapDisplay Component

**File:** `MapDisplay.tsx`

The core map display component that renders an interactive Google Map with support for:
- Current location display
- Geofence visualization and validation
- Travel history visualization
- Attendance records display

#### Features

- **Location Display**: Shows current employee location with accuracy indicator
- **Geofence Validation**: Validates if location is within allowed geofences
- **Travel History**: Displays journey paths with start/end markers and waypoints
- **Attendance Records**: Shows check-in and check-out locations
- **Interactive Markers**: Click markers to view detailed information
- **Map Legend**: Visual guide for different marker types
- **Responsive Design**: Adapts to different screen sizes
- **Error Handling**: Graceful error messages for API failures

#### Props

```typescript
interface MapDisplayProps {
  location?: GeoLocation;                    // Current location to display
  geofences?: GeoFence[];                    // Geofences to validate against
  journeys?: Journey[];                      // Travel history to display
  attendanceRecords?: Array<{...}>;          // Attendance records to display
  showGeofences?: boolean;                   // Show geofence circles
  showTravelHistory?: boolean;               // Show journey paths
  showAttendanceRecords?: boolean;           // Show attendance markers
  onGeofenceValidation?: (isValid, geofence) => void;  // Callback for validation
  className?: string;                       // Custom CSS classes
  height?: string;                          // Map container height
}
```

#### Usage Example

```typescript
import { MapDisplay } from '@/components/geo-tracking/MapDisplay';

export function LocationPage() {
  const [location, setLocation] = useState<GeoLocation>();
  const [geofences, setGeofences] = useState<GeoFence[]>([]);

  return (
    <MapDisplay
      location={location}
      geofences={geofences}
      showGeofences={true}
      onGeofenceValidation={(isValid, geofence) => {
        console.log(`Location valid: ${isValid}`);
      }}
      height="500px"
    />
  );
}
```

#### Marker Types

- **Blue Dot**: Current location
- **Green Dot**: Journey start point
- **Red Dot**: Journey end point
- **Yellow Dot**: Attendance check-in
- **Orange Dot**: Attendance check-out
- **Circles**: Geofence boundaries

### 2. TravelHistoryMap Component

**File:** `TravelHistoryMap.tsx`

Specialized component for visualizing travel history with statistics and filtering.

#### Features

- **Journey Visualization**: Display multiple journeys on map
- **Statistics**: Total distance, duration, average speed, journey count
- **Date Filtering**: Filter journeys by date
- **Journey Details**: View detailed information for selected journey
- **Travel Allowance**: Display calculated travel allowance per journey
- **Status Tracking**: Show journey approval status

#### Props

```typescript
interface TravelHistoryMapProps {
  journeys: Journey[];                       // Array of journeys to display
  onJourneySelect?: (journey: Journey) => void;  // Callback when journey selected
  className?: string;                       // Custom CSS classes
}
```

#### Usage Example

```typescript
import { TravelHistoryMap } from '@/components/geo-tracking/TravelHistoryMap';

export function TravelHistoryPage() {
  const [journeys, setJourneys] = useState<Journey[]>([]);

  useEffect(() => {
    // Fetch journeys from API
    geoTrackingService.getJourneysByDateRange(
      employeeId,
      startDate,
      endDate
    ).then(setJourneys);
  }, []);

  return (
    <TravelHistoryMap
      journeys={journeys}
      onJourneySelect={(journey) => {
        console.log('Selected journey:', journey);
      }}
    />
  );
}
```

### 3. AttendanceRecordsMap Component

**File:** `AttendanceRecordsMap.tsx`

Specialized component for visualizing location-based attendance records.

#### Features

- **Attendance Visualization**: Display check-in and check-out locations
- **Statistics**: Present/absent/half-day counts, average working hours
- **Date Filtering**: Filter records by date
- **Status Filtering**: Filter by attendance status
- **Record Details**: View detailed information for selected record
- **Location Accuracy**: Display GPS accuracy for each location

#### Props

```typescript
interface AttendanceRecordsMapProps {
  records: AttendanceRecord[];               // Array of attendance records
  onRecordSelect?: (record: AttendanceRecord) => void;  // Callback when record selected
  className?: string;                       // Custom CSS classes
}
```

#### Usage Example

```typescript
import { AttendanceRecordsMap } from '@/components/geo-tracking/AttendanceRecordsMap';

export function AttendanceHistoryPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    // Fetch attendance records from API
    attendanceService.getRecords(employeeId).then(setRecords);
  }, []);

  return (
    <AttendanceRecordsMap
      records={records}
      onRecordSelect={(record) => {
        console.log('Selected record:', record);
      }}
    />
  );
}
```

## Hooks

### useGoogleMaps Hook

**File:** `hooks/useGoogleMaps.ts`

Custom hook for Google Maps API integration and utility functions.

#### Features

- **API Loading**: Manages Google Maps API script loading
- **Error Handling**: Handles API loading failures
- **Utility Functions**: Helper functions for map operations

#### Utility Functions

```typescript
// Create map instance
createMapInstance(container, options): google.maps.Map

// Create marker
createMarker(map, position, options): google.maps.Marker

// Create polyline (for journey paths)
createPolyline(map, path, options): google.maps.Polyline

// Create circle (for geofences)
createCircle(map, center, radius, options): google.maps.Circle

// Calculate distance between two points (in km)
calculateDistance(point1, point2): number

// Check if point is within geofence
isPointInGeofence(point, center, radiusKm): boolean

// Fit map bounds to show all markers
fitBoundsToMarkers(map, markers): void
```

#### Usage Example

```typescript
import { useGoogleMaps, createMapInstance, createMarker } from '@/hooks/useGoogleMaps';

export function MyMapComponent() {
  const mapRef = useRef<HTMLDivElement>(null);
  const { isLoaded, error } = useGoogleMaps({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places', 'geometry'],
  });

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const map = createMapInstance(mapRef.current, {
      center: { lat: 40.7128, lng: -74.006 },
      zoom: 15,
    });

    const marker = createMarker(map, {
      lat: 40.7128,
      lng: -74.006,
    }, {
      title: 'My Location',
    });
  }, [isLoaded]);

  return <div ref={mapRef} style={{ height: '500px' }} />;
}
```

## Configuration

### Environment Variables

Add the following environment variable to your `.env` file:

```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geometry Library
4. Create an API key
5. Add the API key to your `.env` file

## Data Types

### GeoLocation

```typescript
interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;           // Accuracy in meters
  altitude?: number;           // Altitude in meters
  timestamp: Date;
  address?: string;
}
```

### GeoFence

```typescript
interface GeoFence {
  id: string;
  name: string;
  center: GeoLocation;
  radius: number;              // Radius in meters
  type: 'Office' | 'Site' | 'Restricted' | 'Custom';
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Journey

```typescript
interface Journey {
  id: string;
  employeeId: string;
  startLocation: GeoLocation;
  endLocation: GeoLocation;
  waypoints: GeoLocation[];
  totalDistance: number;       // Distance in km
  totalDuration: number;       // Duration in seconds
  startTime: Date;
  endTime: Date;
  purpose?: string;
  travelAllowance: number;     // Allowance in currency
  status: 'In Progress' | 'Completed' | 'Cancelled' | 'Pending' | 'Approved' | 'Rejected';
  createdAt: Date;
  updatedAt: Date;
}
```

## Testing

### Unit Tests

Comprehensive unit tests are provided for all components:

- `MapDisplay.test.tsx`: Tests for map display, geofence validation, and marker rendering
- `TravelHistoryMap.test.tsx`: Tests for travel history visualization and filtering
- `AttendanceRecordsMap.test.tsx`: Tests for attendance records visualization
- `useGoogleMaps.test.ts`: Tests for utility functions and distance calculations

### Running Tests

```bash
npm test -- --run
```

### Test Coverage

- MapDisplay: 12 test cases
- TravelHistoryMap: 20 test cases
- AttendanceRecordsMap: 25 test cases
- useGoogleMaps: 30 test cases

## Accessibility

All components follow WCAG 2.1 AA compliance standards:

- Keyboard navigation support
- ARIA labels for interactive elements
- Color contrast ratios meet minimum requirements
- Screen reader friendly
- Semantic HTML structure

## Performance Considerations

1. **Lazy Loading**: Map components are lazy-loaded with React Router
2. **Marker Clustering**: For large datasets, consider using marker clustering
3. **Debouncing**: Filter and search operations are debounced
4. **Memoization**: Components use React.memo and useMemo for optimization
5. **API Caching**: API responses are cached in Zustand stores

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### Map Not Displaying

1. Check if Google Maps API key is valid
2. Verify API key has Maps JavaScript API enabled
3. Check browser console for errors
4. Ensure container element has defined height

### Geofence Validation Not Working

1. Verify geofence data is provided
2. Check if location coordinates are valid
3. Ensure radius is in meters
4. Verify callback function is provided

### Markers Not Showing

1. Check if location data is provided
2. Verify coordinates are within valid ranges
3. Check if map instance is initialized
4. Ensure marker icons are accessible

## Future Enhancements

1. **Marker Clustering**: Implement marker clustering for large datasets
2. **Heatmaps**: Add heatmap visualization for attendance patterns
3. **Route Optimization**: Calculate optimal routes for multiple journeys
4. **Real-time Tracking**: Add real-time location tracking with WebSocket
5. **Offline Support**: Cache map tiles for offline viewing
6. **Custom Styling**: Allow custom map styling and themes
7. **Export**: Export maps as images or PDFs

## Requirements Met

✅ **28.3**: Display location on Google Maps
✅ **28.4**: Validate location against allowed geofences
✅ **28.7**: Display travel history on a map
✅ **28.9**: Display location-based attendance records

## Related Components

- `GeolocationCapture.tsx`: Captures current location
- `LocationAccuracyIndicator.tsx`: Shows location accuracy
- `GeoFenceManagement.tsx`: Manages geofences
- `TravelLogViewer.tsx`: Views travel logs in table format

## API Integration

The components integrate with the following API endpoints:

- `GET /geo-tracking/geo-fences`: Get all geofences
- `GET /geo-tracking/journeys/{employeeId}`: Get employee journeys
- `GET /geo-tracking/daily-journey/{employeeId}`: Get daily journey
- `GET /attendance/records`: Get attendance records

## Support

For issues or questions, please refer to the main documentation or contact the development team.
