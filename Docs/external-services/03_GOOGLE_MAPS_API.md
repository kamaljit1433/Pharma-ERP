# Google Maps API Setup

Used by: `backend/src/config/googleMaps.ts`  
and: `backend/src/services/geoTrackingService.ts`  
and: `backend/src/services/travelAllowanceService.ts`  
Controls: `GOOGLE_MAPS_ENABLED` in `.env`

---

## What Google Maps Does in This Project

- **Geo-tracking:** Records GPS waypoints for field employees during visits
- **Distance calculation:** Uses Distance Matrix API to compute kilometers traveled between locations
- **Travel allowance:** Auto-calculates travel reimbursements based on distance × `TRAVEL_ALLOWANCE_RATE`
- **Geo-fencing:** Detects whether an employee is within a set radius of a location (default: 100m)
- **Anomaly detection:** Flags impossible speeds (>120 km/h), location jumps, and time gaps >1 hour

> **Note:** Location capture (`navigator.geolocation`) happens on the frontend/mobile app. The backend only receives coordinates and calls Google Maps APIs to calculate distance.

---

## Current Status

Your `.env` already has API keys filled in:

```env
GOOGLE_MAPS_API_KEY=XXXXXXXXXXXXXXXXX
GOOGLE_MAPS_DISTANCE_MATRIX_API_KEY=XXXXXXXXXXXXXXXXX
GOOGLE_MAPS_ENABLED=true
GEO_TRACKING_ENABLED=true
```

If these are your own keys, verify they're working using the test in Step 5. If they are placeholder/expired keys, follow the steps below to create new ones.

---

## Step 1 — Create / Open a Google Cloud Project

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Sign in with your Google account
3. Top bar → click the project dropdown → **New Project**
4. Project name: `pharma-erp` → **Create**
5. Make sure you have **billing enabled** — Maps APIs require it even on free tier

### Enable billing (required):
1. Left sidebar → **Billing** → **Link a billing account**
2. Create a billing account with a credit card
3. Google gives $200 free credit/month — the APIs used here cost very little (~$0.005 per distance matrix request)

---

## Step 2 — Enable Required APIs

1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for and **Enable** each of these:

| API Name | Used for |
|----------|----------|
| **Maps JavaScript API** | Frontend map display |
| **Distance Matrix API** | Computing travel distances between waypoints |
| **Geocoding API** | Converting addresses to coordinates |
| **Directions API** | Route planning (optional, for future use) |

For each: click the API name → click **Enable**

---

## Step 3 — Create API Keys

You need **two keys**: one for the backend (server-to-server calls), one for the frontend (browser).

### Backend key (for Distance Matrix, Geocoding, Directions)

1. **APIs & Services** → **Credentials** → **Create Credentials** → **API key**
2. Copy the key shown
3. Click **Edit API key** (pencil icon) to restrict it:
   - **Application restrictions:** IP addresses (for backend server)
   - Add your server's IP address
   - **API restrictions:** Restrict to key → select: `Distance Matrix API`, `Geocoding API`, `Directions API`
4. Click **Save**
5. This key goes in `GOOGLE_MAPS_API_KEY` and `GOOGLE_MAPS_DISTANCE_MATRIX_API_KEY`

### Frontend key (for Maps JavaScript API)

1. Create another API key the same way
2. **Application restrictions:** HTTP referrers (websites)
3. Add: `http://localhost:5173/*` and your production domain
4. **API restrictions:** Maps JavaScript API only
5. This key goes in your frontend `.env` (e.g. `VITE_GOOGLE_MAPS_API_KEY`)

> For simplicity during development, you can use one unrestricted key for both. Add restrictions before going to production.

---

## Step 4 — Update `.env`

```env
# Google Maps API Configuration
GOOGLE_MAPS_API_KEY=AIzaSy...your_backend_key...
GOOGLE_MAPS_DISTANCE_MATRIX_API_KEY=AIzaSy...your_backend_key...
GOOGLE_MAPS_ENABLED=true
GEO_TRACKING_ENABLED=true

# Travel allowance rate per km
TRAVEL_ALLOWANCE_RATE=5
TRAVEL_ALLOWANCE_UNIT=per_km
```

> You can use the same key for both `GOOGLE_MAPS_API_KEY` and `GOOGLE_MAPS_DISTANCE_MATRIX_API_KEY`. They're separate in the config to allow different restrictions in production.

---

## Step 5 — Test the API Key

Run this from the `backend/` directory:

```bash
node -e "
const https = require('https');
const fs = require('fs');
const path = require('path');

const lines = fs.readFileSync(path.join(__dirname, '.env'), 'utf-8').split('\n');
const env = {};
for (const line of lines) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const [k, ...v] = t.split('=');
  env[k] = v.join('=').trim();
}

const key = env.GOOGLE_MAPS_DISTANCE_MATRIX_API_KEY;
const url = \`https://maps.googleapis.com/maps/api/distancematrix/json?origins=Mumbai&destinations=Pune&key=\${key}\`;

https.get(url, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const json = JSON.parse(data);
    if (json.status === 'OK') {
      console.log('SUCCESS! Distance:', json.rows[0].elements[0].distance.text);
    } else {
      console.error('FAILED:', json.status, json.error_message || '');
    }
  });
}).on('error', e => console.error('Network error:', e.message));
"
```

Expected output:
```
SUCCESS! Distance: 149 km
```

---

## Configuration Reference

These values are set in `backend/.env` and read by `backend/src/config/googleMaps.ts`:

```env
# Enable/disable the entire Google Maps integration
GOOGLE_MAPS_ENABLED=true

# Enable/disable GPS waypoint recording for employees
GEO_TRACKING_ENABLED=true

# Travel allowance calculation
TRAVEL_ALLOWANCE_RATE=5          # Amount paid per unit (e.g. ₹5)
TRAVEL_ALLOWANCE_UNIT=per_km     # per_km or per_mile
```

### Geo-fencing defaults (hardcoded in `googleMaps.ts`, change in code if needed):

| Setting | Default | Meaning |
|---------|---------|---------|
| `defaultRadius` | 100 meters | Employee must be within this radius to be "at location" |
| `maxRadius` | 5000 meters | Maximum allowed geo-fence size |
| `maxSpeedThreshold` | 120 km/h | Journeys above this speed are flagged as anomalies |
| `minDistanceThreshold` | 0.1 km | Distances below this are ignored |
| `maxTimeGap` | 1 hour | Gap between waypoints above this is flagged |

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `REQUEST_DENIED` with `API key not valid` | Key doesn't exist or was deleted | Create a new key in Google Cloud Console |
| `REQUEST_DENIED` without error message | Billing not enabled | Enable billing on your Google Cloud project |
| `API_NOT_ACTIVATED` | API not enabled | Go to APIs & Services → Library → enable the specific API |
| `OVER_DAILY_LIMIT` | Daily quota exceeded | Check Quotas in Google Cloud Console, or upgrade billing account |
| `OVER_QUERY_LIMIT` | Too many requests per second | The config has `retries: 3` and `retryDelay: 1000ms` built in |
| Key works in test but not in app | API restriction mismatch | If key is IP-restricted, add your dev machine's IP in Cloud Console |

---

## Cost Estimate

Google Maps has a $200 free credit per month. Typical usage:

| API | Cost | Free tier equivalent |
|-----|------|----------------------|
| Distance Matrix | $5 per 1,000 elements | 40,000 requests/month free |
| Geocoding | $5 per 1,000 requests | 40,000 requests/month free |
| Maps JavaScript | $7 per 1,000 loads | 28,571 map loads/month free |

A small deployment with 50 field employees tracking 5 journeys/day ≈ **~$0–2/month**.

---

## Disabling Google Maps

If you don't need geo-tracking or travel allowance:

```env
GOOGLE_MAPS_ENABLED=false
GEO_TRACKING_ENABLED=false
```

The `validateGoogleMapsConfig()` function in `googleMaps.ts` returns `true` when disabled, so no errors are thrown.
