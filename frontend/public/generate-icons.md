# PWA Icon Generation Guide

## Required Icons

The PWA requires the following icons:

1. **pwa-192x192.png** - 192x192px icon for mobile devices
2. **pwa-512x512.png** - 512x512px icon for desktop and high-res displays
3. **apple-touch-icon.png** - 180x180px icon for iOS devices
4. **favicon.ico** - 32x32px favicon for browsers

## Icon Requirements

- **Format**: PNG with transparent background
- **Design**: Simple, recognizable logo that works at small sizes
- **Colors**: Use brand colors (primary: #000000, accent: #2563eb)
- **Safe Zone**: Keep important elements within 80% of the canvas to account for masking

## Generation Methods

### Method 1: Using Design Tools

1. Create your icon design in Figma, Adobe Illustrator, or similar tool
2. Export at the required sizes:
   - 192x192px
   - 512x512px
   - 180x180px (for Apple)
3. Optimize with tools like [TinyPNG](https://tinypng.com/) or [Squoosh](https://squoosh.app/)

### Method 2: Using Online Generators

1. Visit [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
2. Upload a high-resolution logo (at least 512x512px)
3. Download the generated icon pack
4. Place icons in the `frontend/public/` directory

### Method 3: Using CLI Tools

```bash
# Install pwa-asset-generator
npm install -g pwa-asset-generator

# Generate icons from a source image
pwa-asset-generator logo.svg public/ --icon-only --background "#ffffff"
```

## Icon Naming Convention

Place the generated icons in `frontend/public/` with these names:

- `pwa-192x192.png` - Standard icon (192x192)
- `pwa-512x512.png` - Large icon (512x512)
- `apple-touch-icon.png` - iOS icon (180x180)
- `favicon.ico` - Browser favicon (32x32)

## Maskable Icons (Optional)

For better Android support, create maskable icons:

1. Use [Maskable.app](https://maskable.app/) to test your icon
2. Ensure important content is within the safe zone
3. Export as `pwa-maskable-192x192.png` and `pwa-maskable-512x512.png`

## Current Status

⚠️ **Placeholder icons are currently in use.** Replace them with actual brand icons before production deployment.

To generate placeholder icons for development, you can use the following SVG as a base:

```svg
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#000000"/>
  <text x="256" y="280" font-family="Arial, sans-serif" font-size="200" font-weight="bold" fill="#ffffff" text-anchor="middle">EMS</text>
</svg>
```

Save this as `logo.svg` and use Method 3 above to generate all required icons.
