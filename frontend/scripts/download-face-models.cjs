/**
 * Downloads face-api.js model weights from the vladmandic CDN into
 * public/models/ so they are served locally and precached by the SW.
 *
 * Run once before building:  node scripts/download-face-models.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
const OUT_DIR = path.join(__dirname, '..', 'public', 'models');

// The three nets used by faceDetectionService
const MANIFEST_FILES = [
  'ssd_mobilenetv1_model-weights_manifest.json',
  'face_landmark_68_model-weights_manifest.json',
  'face_recognition_model-weights_manifest.json',
];

function download(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const client = url.startsWith('https') ? https : http;

    client
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          file.close();
          fs.unlinkSync(destPath);
          return download(res.headers.location, destPath).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          file.close();
          fs.unlinkSync(destPath);
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
      })
      .on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
  });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

/** Extract binary shard filenames from a TF.js weights manifest */
function extractShards(manifest) {
  const shards = new Set();
  for (const entry of manifest) {
    // Standard TF.js format: top-level array of { paths, weights }
    if (Array.isArray(entry.paths)) {
      entry.paths.forEach((p) => shards.add(p));
    }
    // Graph-model format: { weightsManifest: [{ paths }] }
    if (Array.isArray(entry.weightsManifest)) {
      for (const wm of entry.weightsManifest) {
        if (Array.isArray(wm.paths)) wm.paths.forEach((p) => shards.add(p));
      }
    }
  }
  return [...shards];
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Saving models to: ${OUT_DIR}\n`);

  const allShards = new Set();

  // 1. Download each manifest and collect shard filenames
  for (const name of MANIFEST_FILES) {
    const dest = path.join(OUT_DIR, name);
    if (fs.existsSync(dest)) {
      console.log(`  [skip] ${name} (already exists)`);
    } else {
      process.stdout.write(`  Downloading ${name} ... `);
      await download(`${BASE_URL}/${name}`, dest);
      console.log('done');
    }
    extractShards(readJson(dest)).forEach((s) => allShards.add(s));
  }

  console.log(`\nFound ${allShards.size} shard file(s) across all manifests.`);

  // 2. Download every shard
  for (const shard of allShards) {
    const dest = path.join(OUT_DIR, shard);
    if (fs.existsSync(dest)) {
      console.log(`  [skip] ${shard} (already exists)`);
    } else {
      process.stdout.write(`  Downloading ${shard} ... `);
      await download(`${BASE_URL}/${shard}`, dest);
      console.log('done');
    }
  }

  console.log('\nAll face-api models downloaded successfully.');
  console.log('They will be served from /models and precached by the service worker.\n');
}

main().catch((err) => {
  console.error('Download failed:', err.message);
  process.exit(1);
});
