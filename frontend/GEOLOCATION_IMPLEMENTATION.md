# Geolocation Capture Implementation

## Overview

This document describes the implementation of geolocation capture functionality for the Employee Management System frontend application. The implementation provides a reusable, type-safe solution for capturing user location with permission handling, error management, and visual feedback.

## Requirements Met

- **28.1**: Request geolocation permission from user
- **28.2**: Capture current location when permission is granted
- **28.5**: Display location accuracy indicator
- **28.6**: Handle geolocation errors gracefully
- **28.10**: Respect user privacy and location permissions

## Components and Files Created

### 1. Custom Hook: `useGeolocation`
**File**: `frontend/src/hooks/useGeolocation.ts`

A custom React hook that encapsulates all geolocation logic with the following features:

#### Features:
- Requests geolocation permission from the browser
- Captures latitude, longitude, and accuracy
- Handles permission denied, timeout, and other errors
- Returns location state with loading and error states
- Provides callbacks for success and error scenarios
- Supports custom options (enableHighAccuracy, timeout, maximumAge)

#### API:
```typescript
const {
  coordinates,        // GeolocationCoordinates | null
  timestamp,          // Date | null
  loading,            // boolean
  error,              // string | null
  permissionStatus,   // 'prompt' | 'granted' | 'denied'
  captureLocation,    // () => Promise<{coordinates, timestamp}>
  clearLocation,      // () => void
  reset,              // () => void
} = useGeolocation(options);
```

#### Error Handling:
- Permission Denied (code 1): User denied location access
- Position Unavailable (code 2): GPS/location service unavailable
- Timeout (code 3): Location request timed out
- Not Supported: Browser doesn't support geolocation API

### 2. Component: `LocationAccuracyIndicator`
**File**: `frontend/src/components/geo-tracking/LocationAccuracyIndicator.tsx`

Displays location accuracy with color-coded visual feedback.

#### Features:
- Shows accuracy level (Excellent, Good, Fair, Poor)
- Color-coded badges based on accuracy threshold
- Accuracy bar visualization
- Descriptive guidance for users
- Configurable display options

#### Accuracy Levels:
- **Excellent** (< 10m): Very precise location - ideal for attendance marking
- **Good** (10-50m): Accurate location - suitable for attendance marking
- **Fair** (50-100m): Moderate accuracy - consider moving to open area
- **Poor** (> 100m): Low accuracy - move to open area with clear sky view

#### Props:
```typescript
interface LocationAccuracyIndicatorProps {
  accuracy: number;
  showDescription?: boolean;
  showMeters?: boolean;
  className?: string;
}
```

### 3. Component: `GeolocationCapture`
**File**: `frontend/src/components/geo-tracking/GeolocationCapture.tsx`

Complete UI component for requesting and displaying geolocation.

#### Features:
- Button to request geolocation
- Shows loading state while requesting permission
- Displays captured location with coordinates and accuracy
- Shows error messages if geolocation fails
- Respects user privacy by only requesting when needed
- Copy coordinates to clipboard functionality
- Clear location data functionality
- Displays timestamp of capture
- Shows additional info (speed, heading) if available

#### Props:
```typescript
interface GeolocationCaptureProps {
  onLocationCapture?: (coordinates: GeolocationCoordinates) => void;
  onError?: (error: string) => void;
  showCoordinates?: boolean;
  showCopyButton?: boolean;
  showMap?: boolean;
  className?: string;
}
```

## Type Definitions

### GeolocationCoordinates
```typescript
interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
}
```

### GeolocationState
```typescript
interface GeolocationState {
  coordinates: GeolocationCoordinates | null;
  timestamp: Date | null;
  loading: boolean;
  error: string | null;
  permissionStatus: 'prompt' | 'granted' | 'denied';
}
```

## Test Coverage

### Hook Tests: `frontend/src/hooks/__tests__/useGeolocation.test.ts`
- Initial state verification
- Permission status checking
- Successful location capture
- Callback execution
- Timestamp recording
- Error handling (permission denied, unavailable, timeout)
- Geolocation not supported
- Loading state management
- Location clearing
- State reset
- Custom options support

### Component Tests: `frontend/src/components/geo-tracking/__tests__/LocationAccuracyIndicator.test.tsx`
- Accuracy level display (Excellent, Good, Fair, Poor)
- Display options (description, meters)
- Accuracy bar rendering
- Accuracy descriptions
- CSS class application
- Precision handling

### Component Tests: `frontend/src/components/geo-tracking/__tests__/GeolocationCapture.test.tsx`
- Initial render
- Location capture success
- Callback execution
- Timestamp display
- Error handling (permission denied, unavailable)
- Permission denied alert
- Capture button disabling
- Coordinates display/hiding
- Copy functionality
- Clear functionality
- Accuracy indicator display
- CSS class application

## Integration with Existing Code

The implementation integrates seamlessly with existing components:

### AttendanceMarker Component
The `AttendanceMarker` component already uses geolocation for GPS check-in. The new `useGeolocation` hook can be used to refactor this component for better code reuse.

### Existing Types
The implementation uses existing types from `frontend/src/types/geoTracking.ts`:
- `GeoLocation`: Represents a geographic location
- `Journey`: Represents a travel journey
- `GeoFence`: Represents a geofence boundary

## Usage Examples

### Basic Usage
```typescript
import { GeolocationCapture } from '@/components/geo-tracking/GeolocationCapture';

export function AttendancePage() {
  const handleLocationCapture = (coordinates) => {
    console.log('Location captured:', coordinates);
    // Send to API
  };

  return (
    <GeolocationCapture
      onLocationCapture={handleLocationCapture}
      showCoordinates={true}
      showCopyButton={true}
    />
  );
}
```

### Hook Usage
```typescript
import { useGeolocation } from '@/hooks/useGeolocation';

export function LocationForm() {
  const {
    coordinates,
    loading,
    error,
    captureLocation,
  } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 10000,
  });

  return (
    <div>
      <button onClick={captureLocation} disabled={loading}>
        {loading ? 'Capturing...' : 'Capture Location'}
      </button>
      {error && <p className="error">{error}</p>}
      {coordinates && (
        <p>
          Lat: {coordinates.latitude}, Lon: {coordinates.longitude}
        </p>
      )}
    </div>
  );
}
```

## Privacy and Security Considerations

1. **Permission Handling**: The implementation respects browser permission APIs and only requests location when explicitly triggered by user action.

2. **Error Messages**: User-friendly error messages guide users to enable location access if needed.

3. **Data Handling**: Location data is only stored in component state and passed to callbacks - no automatic persistence.

4. **HTTPS Requirement**: Geolocation API requires HTTPS in production (except localhost for development).

5. **User Control**: Users can clear captured location data at any time.

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 13.3+)
- IE: Not supported

## Performance Considerations

- Geolocation requests are asynchronous and don't block UI
- Loading state prevents multiple simultaneous requests
- Accuracy bar uses CSS for smooth rendering
- No unnecessary re-renders with proper state management

## Future Enhancements

1. **Map Integration**: Display captured location on Google Maps
2. **Geofence Validation**: Check if location is within allowed geofences
3. **Travel History**: Track and display travel history on map
4. **Distance Calculation**: Calculate distance traveled between locations
5. **Offline Support**: Cache location data for offline use

## Testing

Run tests with:
```bash
npm test -- --run src/hooks/__tests__/useGeolocation.test.ts
npm test -- --run src/components/geo-tracking/__tests__/LocationAccuracyIndicator.test.tsx
npm test -- --run src/components/geo-tracking/__tests__/GeolocationCapture.test.tsx
```

## Files Summary

| File | Purpose | Lines |
|------|---------|-------|
| `useGeolocation.ts` | Custom hook for geolocation | ~200 |
| `LocationAccuracyIndicator.tsx` | Accuracy display component | ~150 |
| `GeolocationCapture.tsx` | Complete capture UI | ~250 |
| `useGeolocation.test.ts` | Hook tests | ~420 |
| `LocationAccuracyIndicator.test.tsx` | Accuracy indicator tests | ~200 |
| `GeolocationCapture.test.tsx` | Capture component tests | ~400 |

## Conclusion

The geolocation capture implementation provides a robust, type-safe, and user-friendly solution for capturing location data in the Employee Management System. It follows React best practices, includes comprehensive error handling, and respects user privacy while providing clear visual feedback about location accuracy.
