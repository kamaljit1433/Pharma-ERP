/**
 * Generate placeholder PWA icons for development
 * Replace these with actual brand icons before production
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '..', 'public');

// SVG template for placeholder icons
const generateSVG = (size, text = 'EMS') => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#000000;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)"/>
  <text 
    x="${size / 2}" 
    y="${size / 2 + size * 0.1}" 
    font-family="Arial, sans-serif" 
    font-size="${size * 0.35}" 
    font-weight="bold" 
    fill="#ffffff" 
    text-anchor="middle"
  >${text}</text>
</svg>
`.trim();

// Generate maskable icon with safe zone
const generateMaskableSVG = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)"/>
  <circle 
    cx="${size / 2}" 
    cy="${size / 2}" 
    r="${size * 0.3}" 
    fill="rgba(255,255,255,0.2)"
  />
  <text 
    x="${size / 2}" 
    y="${size / 2 + size * 0.08}" 
    font-family="Arial, sans-serif" 
    font-size="${size * 0.25}" 
    font-weight="bold" 
    fill="#ffffff" 
    text-anchor="middle"
  >EMS</text>
</svg>
`.trim();

// Icon configurations
const icons = [
  { name: 'pwa-192x192.png', size: 192, type: 'standard' },
  { name: 'pwa-512x512.png', size: 512, type: 'standard' },
  { name: 'apple-touch-icon.png', size: 180, type: 'standard' },
  { name: 'pwa-maskable-192x192.png', size: 192, type: 'maskable' },
  { name: 'pwa-maskable-512x512.png', size: 512, type: 'maskable' },
];

console.log('Generating placeholder PWA icons...\n');

icons.forEach(({ name, size, type }) => {
  const svg = type === 'maskable' ? generateMaskableSVG(size) : generateSVG(size);
  const svgPath = join(publicDir, name.replace('.png', '.svg'));
  
  writeFileSync(svgPath, svg);
  console.log(`✓ Generated ${name.replace('.png', '.svg')} (${size}x${size})`);
});

console.log('\n⚠️  Note: These are placeholder SVG icons for development.');
console.log('   Convert them to PNG using an online tool or image editor.');
console.log('   Replace with actual brand icons before production.\n');
console.log('   Recommended tools:');
console.log('   - https://svgtopng.com/');
console.log('   - https://www.pwabuilder.com/imageGenerator');
console.log('   - https://realfavicongenerator.net/\n');
