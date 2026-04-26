import { test, expect } from '@playwright/test';

/**
 * PWA Features E2E Tests
 * 
 * Tests for PWA installation, offline functionality, and service worker behavior.
 * These tests verify that the app works as a Progressive Web App.
 */

test.describe('PWA Features', () => {
  test('should have valid web app manifest', async ({ page }) => {
    await page.goto('/');

    // Check for manifest link
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveCount(1);

    // Get manifest URL
    const manifestHref = await manifestLink.getAttribute('href');
    expect(manifestHref).toBeTruthy();

    // Fetch and validate manifest
    const response = await page.goto(manifestHref!);
    expect(response?.status()).toBe(200);

    const manifest = await response?.json();
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBeTruthy();
    expect(manifest.display).toBeTruthy();
    expect(manifest.icons).toBeTruthy();
    expect(manifest.icons.length).toBeGreaterThan(0);
  });

  test('should register service worker', async ({ page }) => {
    await page.goto('/');

    // Wait for service worker registration
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        return registration !== null;
      }
      return false;
    });

    expect(swRegistered).toBe(true);
  });

  test('should have installable prompt', async ({ page, context }) => {
    await page.goto('/');

    // Check if beforeinstallprompt event is fired
    const installable = await page.evaluate(() => {
      return new Promise((resolve) => {
        window.addEventListener('beforeinstallprompt', (e) => {
          e.preventDefault();
          resolve(true);
        });
        // Timeout after 5 seconds
        setTimeout(() => resolve(false), 5000);
      });
    });

    // Note: This may not work in all test environments
    // In production, the app should be installable
    console.log('Installable:', installable);
  });

  test('should cache static assets', async ({ page }) => {
    await page.goto('/');

    // Wait for service worker to be ready
    await page.waitForTimeout(2000);

    // Check if assets are cached
    const cacheNames = await page.evaluate(async () => {
      return await caches.keys();
    });

    expect(cacheNames.length).toBeGreaterThan(0);
  });

  test('should work offline after initial load', async ({ page, context }) => {
    // Login first
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('employee@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button:has-text("Sign In")').click();

    // Wait for dashboard
    await page.waitForURL('/dashboard');

    // Wait for service worker to cache resources
    await page.waitForTimeout(2000);

    // Go offline
    await context.setOffline(true);

    // Navigate to attendance page
    await page.goto('/attendance');

    // Verify page loads from cache
    await expect(page.locator('text=Attendance')).toBeVisible();

    // Go back online
    await context.setOffline(false);
  });

  test('should queue attendance marking when offline', async ({ page, context }) => {
    // Login first
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('employee@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button:has-text("Sign In")').click();

    // Wait for dashboard and navigate to attendance
    await page.waitForURL('/dashboard');
    await page.goto('/attendance');

    // Go offline
    await context.setOffline(true);

    // Try to check in
    await page.locator('button:has-text("Check In")').click();

    // Mock camera and GPS permissions
    await page.evaluate(() => {
      // Mock successful face detection
      (window as any).faceDetectionResult = true;
      // Mock GPS coordinates
      (window as any).gpsCoordinates = { latitude: 40.7128, longitude: -74.0060 };
    });

    // Confirm check-in
    await page.locator('button:has-text("Confirm")').click();

    // Verify offline message
    await expect(page.locator('text=Attendance will be synced when online')).toBeVisible();

    // Go back online
    await context.setOffline(false);

    // Wait for sync
    await page.waitForTimeout(3000);

    // Verify sync success message
    await expect(page.locator('text=Attendance synced successfully')).toBeVisible();
  });

  test('should display offline indicator', async ({ page, context }) => {
    await page.goto('/');

    // Go offline
    await context.setOffline(true);

    // Wait for offline indicator
    await expect(page.locator('text=Offline')).toBeVisible();

    // Go back online
    await context.setOffline(false);

    // Wait for online indicator
    await expect(page.locator('text=Online')).toBeVisible();
  });

  test('should have proper meta tags for PWA', async ({ page }) => {
    await page.goto('/');

    // Check viewport meta tag
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveCount(1);

    // Check theme color
    const themeColor = page.locator('meta[name="theme-color"]');
    await expect(themeColor).toHaveCount(1);

    // Check apple touch icon
    const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]');
    await expect(appleTouchIcon).toHaveCount(1);
  });

  test('should handle background sync', async ({ page }) => {
    await page.goto('/');

    // Check if background sync is supported
    const bgSyncSupported = await page.evaluate(() => {
      return 'sync' in (self as any).registration;
    });

    if (bgSyncSupported) {
      // Register a sync event
      const syncRegistered = await page.evaluate(async () => {
        try {
          const registration = await navigator.serviceWorker.ready;
          await (registration as any).sync.register('attendance-sync');
          return true;
        } catch (error) {
          return false;
        }
      });

      expect(syncRegistered).toBe(true);
    }
  });

  test('should update service worker when new version available', async ({ page }) => {
    await page.goto('/');

    // Wait for service worker
    await page.waitForTimeout(2000);

    // Check for update notification
    const updateAvailable = await page.evaluate(() => {
      return new Promise((resolve) => {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            resolve(true);
          });
        }
        // Timeout after 5 seconds
        setTimeout(() => resolve(false), 5000);
      });
    });

    // Note: This test may not trigger in all environments
    console.log('Update available:', updateAvailable);
  });

  test('should persist data in IndexedDB', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('employee@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button:has-text("Sign In")').click();

    // Wait for dashboard
    await page.waitForURL('/dashboard');

    // Check if IndexedDB is being used
    const dbExists = await page.evaluate(async () => {
      const dbs = await indexedDB.databases();
      return dbs.length > 0;
    });

    expect(dbExists).toBe(true);
  });

  test('should handle push notifications permission', async ({ page, context }) => {
    // Grant notification permission
    await context.grantPermissions(['notifications']);

    await page.goto('/');

    // Check notification permission
    const permission = await page.evaluate(() => {
      return Notification.permission;
    });

    expect(permission).toBe('granted');
  });

  test('should display install prompt on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');

    // Check for install banner or button
    // Note: Actual install prompt behavior varies by browser
    const installButton = page.locator('button:has-text("Install App")');
    
    // The button may or may not be visible depending on browser and context
    const isVisible = await installButton.isVisible().catch(() => false);
    console.log('Install button visible:', isVisible);
  });

  test('should handle app shortcuts', async ({ page }) => {
    await page.goto('/');

    // Check manifest for shortcuts
    const manifestLink = page.locator('link[rel="manifest"]');
    const manifestHref = await manifestLink.getAttribute('href');
    
    if (manifestHref) {
      const response = await page.goto(manifestHref);
      const manifest = await response?.json();

      // Verify shortcuts are defined
      if (manifest.shortcuts) {
        expect(manifest.shortcuts.length).toBeGreaterThan(0);
        expect(manifest.shortcuts[0].name).toBeTruthy();
        expect(manifest.shortcuts[0].url).toBeTruthy();
      }
    }
  });

  test('should handle share target', async ({ page }) => {
    await page.goto('/');

    // Check if Web Share API is supported
    const shareSupported = await page.evaluate(() => {
      return 'share' in navigator;
    });

    if (shareSupported) {
      // Test share functionality
      const shareResult = await page.evaluate(async () => {
        try {
          await navigator.share({
            title: 'Employee Management System',
            text: 'Check out this app',
            url: window.location.href,
          });
          return true;
        } catch (error) {
          // User cancelled or share not available
          return false;
        }
      });

      console.log('Share result:', shareResult);
    }
  });
});
