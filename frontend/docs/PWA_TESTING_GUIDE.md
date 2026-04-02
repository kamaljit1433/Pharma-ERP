# PWA Testing Guide

This guide provides instructions for testing the Progressive Web App (PWA) functionality of the Employee Management System.

## Prerequisites

- Node.js 22+ installed
- Chrome, Edge, or Safari browser
- Mobile device (optional, for mobile testing)
- HTTPS connection (required for service workers in production)

## Testing Checklist

### 1. Service Worker Registration

**Test Steps:**
1. Start the development server: `npm run dev`
2. Open the app in Chrome: `http://localhost:5173`
3. Open DevTools (F12) → Application tab → Service Workers
4. Verify that the service worker is registered and activated

**Expected Result:**
- Service worker status shows "activated and is running"
- No errors in the console

### 2. Offline Functionality

**Test Steps:**
1. Load the app with internet connection
2. Navigate to a few pages (Dashboard, Employees, Attendance)
3. Open DevTools → Network tab
4. Check "Offline" checkbox to simulate offline mode
5. Navigate between previously visited pages
6. Try to access a new page

**Expected Result:**
- Previously visited pages load from cache
- Offline indicator appears at the top-left
- Cached data is displayed
- New pages show appropriate offline message

### 3. Caching Strategies

#### Static Assets (CacheFirst)

**Test Steps:**
1. Load the app
2. Open DevTools → Application → Cache Storage
3. Verify caches exist: `workbox-precache`, `image-cache`
4. Check that JS, CSS, and image files are cached

**Expected Result:**
- Static assets are cached on first load
- Subsequent loads serve from cache (check Network tab - "from ServiceWorker")

#### API Responses (NetworkFirst)

**Test Steps:**
1. Load the app and navigate to Employees page
2. Open DevTools → Application → Cache Storage → `api-cache`
3. Verify API responses are cached
4. Go offline and reload the page

**Expected Result:**
- API responses are cached after first request
- Offline mode serves cached API data
- Cache expires after 5 minutes

### 4. Offline Queue for Write Operations

**Test Steps:**
1. Go offline (DevTools → Network → Offline)
2. Try to mark attendance or submit a form
3. Open DevTools → Application → IndexedDB → `ems-offline` → `offline-queue`
4. Verify the operation is queued
5. Go back online
6. Wait a few seconds

**Expected Result:**
- Write operations are queued when offline
- Queue is visible in IndexedDB
- Operations sync automatically when back online
- Toast notification shows sync status
- Queue is cleared after successful sync

### 5. Update Notification

**Test Steps:**
1. Load the app
2. Make a change to the code (e.g., update a component)
3. Rebuild the app: `npm run build`
4. The service worker detects the update

**Expected Result:**
- Update notification appears in top-right corner
- Clicking "Reload Now" refreshes the app with new version
- Clicking "Later" dismisses the notification

### 6. Install Prompt

**Test Steps:**
1. Open the app in Chrome (desktop or mobile)
2. Wait for the install prompt to appear (bottom-right)
3. Click "Install" button

**Expected Result:**
- Install prompt appears after a few seconds
- Clicking "Install" triggers browser's install dialog
- App is installed and appears in app drawer/start menu
- Clicking "Later" dismisses the prompt

### 7. PWA Installation (Desktop)

**Test Steps:**
1. Open the app in Chrome
2. Look for install icon in address bar (⊕ or computer icon)
3. Click the install icon
4. Follow the installation prompts

**Expected Result:**
- App installs as standalone application
- App opens in its own window (no browser UI)
- App icon appears in Start Menu (Windows) or Applications (Mac)
- App can be launched like a native application

### 8. PWA Installation (Mobile)

**Test Steps:**
1. Open the app in Chrome on Android or Safari on iOS
2. Tap the browser menu (⋮ or share icon)
3. Select "Add to Home Screen" or "Install App"
4. Follow the installation prompts

**Expected Result:**
- App installs to home screen
- App icon appears on home screen
- Tapping icon opens app in standalone mode
- App behaves like a native app (no browser UI)

### 9. Manifest Validation

**Test Steps:**
1. Open the app in Chrome
2. Open DevTools → Application → Manifest
3. Review manifest properties

**Expected Result:**
- Manifest loads without errors
- All properties are correctly displayed:
  - Name: "Employee Management System"
  - Short name: "EMS"
  - Theme color: #000000
  - Icons: 192x192 and 512x512
  - Display: standalone
  - Shortcuts: Mark Attendance, Request Leave

### 10. Lighthouse PWA Audit

**Test Steps:**
1. Open the app in Chrome
2. Open DevTools → Lighthouse tab
3. Select "Progressive Web App" category
4. Click "Generate report"

**Expected Result:**
- PWA score: 90+ (ideally 100)
- All PWA checks pass:
  - ✓ Installable
  - ✓ PWA optimized
  - ✓ Works offline
  - ✓ Fast and reliable
  - ✓ Configured for a custom splash screen

### 11. Network Resilience

**Test Steps:**
1. Load the app
2. Open DevTools → Network tab
3. Throttle network to "Slow 3G"
4. Navigate between pages
5. Submit forms

**Expected Result:**
- App remains responsive on slow connections
- Loading states are displayed
- Cached content loads quickly
- Write operations queue if network fails

### 12. Background Sync (Advanced)

**Test Steps:**
1. Mark attendance while offline
2. Close the browser tab
3. Go back online
4. Reopen the app

**Expected Result:**
- Queued operations sync in background
- Sync status is visible when app reopens
- No data loss occurs

## Testing Tools

### Chrome DevTools

- **Application Tab**: View service workers, cache storage, IndexedDB
- **Network Tab**: Simulate offline mode, throttle network
- **Lighthouse**: Run PWA audits

### Browser Extensions

- **Lighthouse**: Automated PWA testing
- **Workbox**: Debug service worker caching

### Online Tools

- **PWA Builder**: https://www.pwabuilder.com/
- **Manifest Validator**: https://manifest-validator.appspot.com/

## Common Issues and Solutions

### Service Worker Not Registering

**Issue**: Service worker fails to register
**Solution**: 
- Check console for errors
- Ensure HTTPS in production (localhost is exempt)
- Clear browser cache and reload

### Offline Mode Not Working

**Issue**: App doesn't work offline
**Solution**:
- Verify service worker is activated
- Check cache storage contains required assets
- Ensure NetworkFirst strategy is configured for API

### Install Prompt Not Showing

**Issue**: Install prompt doesn't appear
**Solution**:
- Check manifest.json is valid
- Ensure all required icons exist
- Verify HTTPS connection
- Clear site data and reload

### Update Not Detected

**Issue**: New version doesn't trigger update notification
**Solution**:
- Force service worker update in DevTools
- Check service worker update interval
- Verify build generates new service worker

## Production Testing

Before deploying to production:

1. ✅ Test on multiple browsers (Chrome, Edge, Safari, Firefox)
2. ✅ Test on multiple devices (desktop, tablet, mobile)
3. ✅ Test on different network conditions (4G, 3G, offline)
4. ✅ Verify HTTPS is enabled
5. ✅ Run Lighthouse audit (score 90+)
6. ✅ Test install flow on all platforms
7. ✅ Verify offline queue syncs correctly
8. ✅ Test update notification flow
9. ✅ Validate manifest with online tools
10. ✅ Test with real user scenarios

## Automated Testing

### Unit Tests

```bash
npm test -- src/components/pwa
npm test -- src/utils/pwaRegister
npm test -- src/utils/offlineQueue
```

### E2E Tests (Playwright)

```bash
npm run test:e2e -- pwa.spec.ts
```

## Monitoring

After deployment, monitor:

- Service worker registration rate
- Offline usage patterns
- Install conversion rate
- Update adoption rate
- Sync queue success/failure rate

## Resources

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
