# Google Maps API - Complete Guide

## Overview

The EMS uses Google Maps APIs for geo tracking and travel allowance calculation. This guide covers setup, configuration, usage, and best practices.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Setup Guide](#setup-guide)
3. [Configuration](#configuration)
4. [API Usage](#api-usage)
5. [Common Use Cases](#common-use-cases)
6. [Quotas and Limits](#quotas-and-limits)
7. [Troubleshooting](#troubleshooting)
8. [Security](#security)
9. [Optimization Tips](#optimization-tips)

---

## Quick Start

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top
3. Click "NEW PROJECT"
4. Enter project name: `Employee Management System - Geo Tracking`
5. Click "CREATE"

### 2. Enable Required APIs

In the Google Cloud Console:

1. Go to **APIs & Services** > **Library**
2. Search for and enable:
   - Distance Matrix API
   - Geocoding API
   - Directions API
   - Maps JavaScript API (for frontend)

### 3. Create API Keys

1. Go to **APIs & Services** > **Credentials**
2. Click "CREATE CREDENTIALS" > "API Key"
3. Configure restrictions:
   - **Application restrictions**: HTTP referrers (web sites)
   - **Website restrictions**: Add your domain(s)
   - **API restrictions**: Select specific APIs
4. Copy the API key

### 4. Configure Environment

Add to `backend/.env`:

```bash
GOOGLE_MAPS_API_KEY=your_backend_api_key_here
GOOGLE_MAPS_DISTANCE_MATRIX_API_KEY=your_distance_matrix_api_key_here
GOOGLE_MAPS_ENABLED=true
GEO_TRACKING_ENABLED=true
TRAVEL_ALLOWANCE_RATE=5
TRAVEL_ALLOWANCE_UNIT=per_km
```

Add to `frontend/.env`:

```bash
VITE_GOOGLE_MAPS_API_KEY=your_frontend_api_key_here
VITE_GEO_TRACKING_ENABLED=true
```

### 5. Test Configuration

```bash
curl -X POST http://localhost:3000/api/v1/geo/test \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "40.7128,-74.0060",
    "destination": "40.7580,-73.9855"
  }'
```

---

## Setup Guide

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top
3. Click "NEW PROJECT"
4. Enter project name: `Employee Management System - Geo Tracking`
5. Click "CREATE"
6. Wait for the project to be created and select it

### Step 2: Enable Required APIs

In the Google Cloud Console:

1. Go to **APIs & Services** > **Library**
2. Search for and enable each of these APIs:
   - **Distance Matrix API** - Click on it, then "ENABLE"
   - **Geocoding API** - Click on it, then "ENABLE"
   - **Directions API** - Click on it, then "ENABLE"
   - **Maps JavaScript API** - Click on it, then "ENABLE"

### Step 3: Create API Keys

#### Backend API Key (Server-side)

1. Go to **APIs & Services** > **Credentials**
2. Click "CREATE CREDENTIALS" > "API Key"
3. Copy the generated API key
4. Click the edit icon (pencil) to configure restrictions:
   - **Application restrictions**: Select "HTTP referrers (web sites)"
   - **Website restrictions**: Add your backend domain(s):
     - `http://localhost:3000/*` (development)
     - `https://yourdomain.com/*` (production)
   - **API restrictions**: Select "Restrict key" and choose:
     - Distance Matrix API
     - Geocoding API
     - Directions API
5. Click "SAVE"
6. Copy this key to `GOOGLE_MAPS_API_KEY` in `.env`

#### Distance Matrix API Key (Optional - Separate Key)

For better quota management, create a separate key:

1. Repeat the process above
2. In API restrictions, select only "Distance Matrix API"
3. Copy this key to `GOOGLE_MAPS_DISTANCE_MATRIX_API_KEY` in `.env`

#### Frontend API Key (Maps JavaScript)

1. Create another API key following the same process
2. **Application restrictions**: Select "HTTP referrers (web sites)"
3. **Website restrictions**: Add your frontend domain(s):
   - `http://localhost:5173/*` (development)
   - `https://yourdomain.com/*` (production)
4. **API restrictions**: Select only "Maps JavaScript API"
5. Add this key to your frontend `.env`:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_frontend_api_key_here
   ```

### Step 4: Set Up Billing

Google Maps APIs require billing to be enabled:

1. Go to **Billing** in Google Cloud Console
2. Click "CREATE ACCOUNT" if you don't have one
3. Add a payment method
4. Set up a budget alert:
   - Go to **Budgets & alerts**
   - Click "CREATE BUDGET"
   - Set a monthly budget (e.g., $200)
   - Add email alerts

### Step 5: Configure Environment Variables

#### Backend (.env)

```bash
# Google Maps API Configuration
GOOGLE_MAPS_API_KEY=your_backend_api_key_here
GOOGLE_MAPS_DISTANCE_MATRIX_API_KEY=your_distance_matrix_api_key_here
GOOGLE_MAPS_ENABLED=true
GEO_TRACKING_ENABLED=true

# Travel Allowance Configuration
TRAVEL_ALLOWANCE_RATE=5          # Amount per km/mile
TRAVEL_ALLOWANCE_UNIT=per_km     # per_km or per_mile
```

#### Frontend (.env)

```bash
VITE_GOOGLE_MAPS_API_KEY=your_frontend_api_key_here
VITE_GEO_TRACKING_ENABLED=true
```

### Step 6: Verify API Configuration

Run the verification script:

```bash
cd backend
npm run verify:google-maps
```

This will check:
- API keys are configured
- APIs are enabled in Google Cloud
- Network connectivity to Google Maps services

### Step 7: Test the Setup

#### Backend Test

```bash
# Start the backend
npm run dev

# In another terminal, test the geo tracking endpoint
curl -X POST http://localhost:3000/api/v1/geo/test \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "40.7128,-74.0060",
    "destination": "40.7580,-73.9855"
  }'
```

Expected response:
```json
{
  "distance": {
    "text": "5.2 km",
    "value": 5200
  },
  "duration": {
    "text": "15 mins",
    "value": 900
  },
  "travelAllowance": 26
}
```

#### Frontend Test

In your React component:

```typescript
import { useGeoTracking } from '@/hooks/useGeoTracking';

export function GeoTrackingTest() {
  const { captureLocation, calculateDistance } = useGeoTracking();

  const handleTest = async () => {
    const location = await captureLocation();
    console.log('Current location:', location);
  };

  return <button onClick={handleTest}>Test Geo Tracking</button>;
}
```

---

## Configuration

### Environment Variables

#### Backend

```bash
# Google Maps API Configuration
GOOGLE_MAPS_API_KEY=your_backend_api_key_here
GOOGLE_MAPS_DISTANCE_MATRIX_API_KEY=your_distance_matrix_api_key_here
GOOGLE_MAPS_ENABLED=true
GEO_TRACKING_ENABLED=true

# Travel Allowance Configuration
TRAVEL_ALLOWANCE_RATE=5          # Amount per km/mile
TRAVEL_ALLOWANCE_UNIT=per_km     # per_km or per_mile
```

#### Frontend

```bash
VITE_GOOGLE_MAPS_API_KEY=your_frontend_api_key_here
VITE_GEO_TRACKING_ENABLED=true
```

---

## API Usage

### Calculate Distance

```typescript
import googleMapsClient from '@/utils/googleMapsClient';

const origin = {
  latitude: 40.7128,
  longitude: -74.0060,
  timestamp: new Date(),
};

const destination = {
  latitude: 40.7580,
  longitude: -73.9855,
  timestamp: new Date(),
};

const result = await googleMapsClient.calculateDistance(origin, destination);
console.log(`Distance: ${result.distance.text}`);
console.log(`Duration: ${result.duration.text}`);
```

### Calculate Distance with Waypoints

```typescript
const waypoints = [
  { latitude: 40.7200, longitude: -74.0050, timestamp: new Date() },
  { latitude: 40.7300, longitude: -73.9950, timestamp: new Date() },
];

const result = await googleMapsClient.calculateDistanceWithWaypoints(
  origin,
  destination,
  waypoints
);
```

### Geocode Coordinates to Address

```typescript
const location = {
  latitude: 40.7128,
  longitude: -74.0060,
  timestamp: new Date(),
};

const address = await googleMapsClient.geocodeCoordinates(location);
console.log(`Address: ${address}`);
```

### Reverse Geocode Address to Coordinates

```typescript
const location = await googleMapsClient.reverseGeocodeAddress(
  '1600 Pennsylvania Avenue NW, Washington, DC'
);
console.log(`Coordinates: ${location?.latitude}, ${location?.longitude}`);
```

### Check Geo-Fence

```typescript
const isInside = googleMapsClient.isLocationWithinGeoFence(
  currentLocation,
  officeFenceCenter,
  100 // 100 meters radius
);
```

### Detect Anomalies

```typescript
const anomalies = googleMapsClient.detectAnomalies(
  waypoints,
  totalDistance,
  totalDuration
);

anomalies.forEach((anomaly) => {
  console.log(`${anomaly.type} (${anomaly.severity}): ${anomaly.description}`);
});
```

---

## Common Use Cases

### 1. Track Employee Journey

```typescript
// Capture start location
const startLocation = await captureLocation();

// ... employee travels ...

// Capture end location
const endLocation = await captureLocation();

// Calculate distance and travel allowance
const distance = await googleMapsClient.calculateDistance(
  startLocation,
  endLocation
);

const allowance = (distance.distance.value / 1000) * 5; // 5 per km
```

### 2. Validate Office Geo-Fence

```typescript
const officeLocation = {
  latitude: 40.7128,
  longitude: -74.0060,
  timestamp: new Date(),
};

const isAtOffice = googleMapsClient.isLocationWithinGeoFence(
  currentLocation,
  officeLocation,
  500 // 500 meters
);

if (!isAtOffice) {
  console.log('Employee is not at office');
}
```

### 3. Calculate Travel Allowance

```typescript
const distance = await googleMapsClient.calculateDistance(origin, destination);
const distanceKm = distance.distance.value / 1000;
const allowanceRate = 5; // per km
const totalAllowance = distanceKm * allowanceRate;

console.log(`Travel Allowance: ${totalAllowance}`);
```

---

## Quotas and Limits

### Free Tier Limits (per month)

- **Distance Matrix API**: 25,000 requests
- **Geocoding API**: 40,000 requests
- **Directions API**: 25,000 requests
- **Maps JavaScript API**: Unlimited

### Paid Tier

After free tier is exhausted, you'll be charged per request. Typical pricing:
- Distance Matrix: $5 per 1,000 requests
- Geocoding: $5 per 1,000 requests
- Directions: $5 per 1,000 requests

---

## Troubleshooting

### "Invalid API Key" Error

- Verify the key is copied correctly
- Check API restrictions match your domain
- Ensure the API is enabled in Google Cloud Console
- Wait 5-10 minutes for changes to propagate

### "REQUEST_DENIED" Error

- Verify billing is enabled
- Check API restrictions are not too strict
- Ensure the API is enabled for the project

### "ZERO_RESULTS" Error

- Verify the coordinates/addresses are valid
- Check the location is within the supported region
- Try with a different location format

### High API Costs

- Implement caching for distance calculations
- Batch multiple requests into single API calls
- Use the Distance Matrix API instead of multiple Directions API calls
- Set up budget alerts to monitor usage

---

## Security

### Best Practices

1. **Never expose API keys in frontend code** - Use backend proxy
2. **Use API key restrictions** - Limit by domain and API
3. **Rotate keys regularly** - Create new keys and deprecate old ones
4. **Monitor usage** - Set up alerts for unusual activity
5. **Use separate keys** - Different keys for backend, frontend, and testing

### Production Deployment

### Before Going Live

1. Create production API keys with production domain restrictions
2. Enable billing with a production payment method
3. Set up monitoring and alerts
4. Test with production data
5. Document API key rotation procedures

### Monitoring

Set up monitoring in Google Cloud Console:
- Go to **Monitoring** > **Dashboards**
- Create a dashboard for API usage
- Set up alerts for quota thresholds

---

## Optimization Tips

### 1. Implement Caching

```typescript
// Cache distance calculations
const cache = new Map();

async function getCachedDistance(origin, destination) {
  const key = `${origin.latitude},${origin.longitude}-${destination.latitude},${destination.longitude}`;
  
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const result = await googleMapsClient.calculateDistance(origin, destination);
  cache.set(key, result);
  return result;
}
```

### 2. Batch Requests

```typescript
// Use Distance Matrix API for multiple origins/destinations
const result = await googleMapsClient.calculateDistanceMatrix(
  [origin1, origin2, origin3],
  [destination1, destination2, destination3]
);
```

### 3. Limit Precision

```typescript
// Round coordinates to reduce unique requests
function roundCoordinates(lat, lon, precision = 4) {
  return {
    latitude: Math.round(lat * Math.pow(10, precision)) / Math.pow(10, precision),
    longitude: Math.round(lon * Math.pow(10, precision)) / Math.pow(10, precision),
  };
}
```

### 4. Implement Rate Limiting

```typescript
// Prevent excessive API calls from the frontend
const rateLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 60000, // 1 minute
});

app.post('/api/v1/geo/distance', rateLimiter.middleware, async (req, res) => {
  // Handle request
});
```

---

## Additional Resources

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Distance Matrix API Guide](https://developers.google.com/maps/documentation/distance-matrix)
- [Geocoding API Guide](https://developers.google.com/maps/documentation/geocoding)
- [Directions API Guide](https://developers.google.com/maps/documentation/directions)
- [Maps JavaScript API Guide](https://developers.google.com/maps/documentation/javascript)

---

## Support

For issues or questions:
1. Check the [Google Maps Platform Support](https://developers.google.com/maps/support)
2. Review error messages in Google Cloud Console logs
3. Check API quotas and usage in the Quotas page
4. Contact Google Cloud Support for billing issues

---

## Conclusion

Google Maps API is production-ready with comprehensive geo tracking and travel allowance calculation support. Follow the setup steps above and test with your specific use cases.

**Status: READY FOR PRODUCTION** ✅
