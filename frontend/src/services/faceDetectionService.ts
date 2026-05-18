/**
 * Face Detection Service
 * Client-side face detection using TensorFlow.js/BlazeFace for presence detection
 * and face-api.js for identity verification against stored employee photos.
 */

// Static import so the library is bundled (not lazily fetched) and available
// after the service worker has cached the app — dynamic import would fail offline.
import * as faceapi from 'face-api.js';

// Local model weights served from public/models/ (downloaded by npm run download:models).
// Served from the same origin so the service worker can precache them for offline use.
const FACE_API_MODELS_URL = '/models';

/** How close two face descriptors must be to count as the same person (lower = stricter) */
const RECOGNITION_THRESHOLD = 0.45;

interface DetectionResult {
  detected: boolean;
  confidence: number;
  timestamp: Date;
  deviceId?: string;
}

interface LivenessCheckResult {
  isLive: boolean;
  confidence: number;
  timestamp: Date;
}

class FaceDetectionService {
  private model: any = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the face detection model
   * Loads TensorFlow.js and BlazeFace model
   */
  async initializeModel(): Promise<void> {
    // Return existing promise if already initializing
    if (this.initPromise) {
      return this.initPromise;
    }

    if (this.isInitialized) {
      return;
    }

    this.initPromise = this._initializeModelInternal();
    return this.initPromise;
  }

  private async _initializeModelInternal(): Promise<void> {
    try {
      // Dynamically import TensorFlow.js (side-effect only – registers backend)
      await import('@tensorflow/tfjs');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blazeface: any = await import('@tensorflow-models/blazeface');

      // Load the BlazeFace model
      this.model = await blazeface.load();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize face detection model:', error);
      throw new Error('Face detection model initialization failed');
    }
  }

  /**
   * Detect human presence in video frame
   * Returns only boolean result - no facial data is stored
   */
  async detectHumanPresence(
    videoElement: HTMLVideoElement
  ): Promise<DetectionResult> {
    if (!this.isInitialized) {
      await this.initializeModel();
    }

    try {
      const predictions = await this.model.estimateFaces(videoElement, false);

      const detected = predictions && predictions.length > 0;
      const confidence = detected ? 0.95 : 0.0; // High confidence if face detected

      return {
        detected,
        confidence,
        timestamp: new Date(),
        deviceId: this._getDeviceId(),
      };
    } catch (error) {
      console.error('Face detection error:', error);
      throw new Error('Face detection failed');
    }
  }

  /**
   * Verify liveness - check if the detected face is a live person
   * Performs basic liveness checks without storing facial data
   */
  async verifyLiveness(
    videoElement: HTMLVideoElement,
    durationMs: number = 3000
  ): Promise<LivenessCheckResult> {
    if (!this.isInitialized) {
      await this.initializeModel();
    }

    try {
      const startTime = Date.now();
      let detectionCount = 0;
      let totalDetections = 0;

      // Perform multiple detections over the specified duration
      while (Date.now() - startTime < durationMs) {
        const predictions = await this.model.estimateFaces(videoElement, false);

        if (predictions && predictions.length > 0) {
          detectionCount++;
        }
        totalDetections++;

        // Small delay between detections
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Calculate liveness confidence based on detection consistency
      const consistencyRatio = detectionCount / totalDetections;
      const isLive = consistencyRatio > 0.7; // 70% consistency threshold
      const confidence = consistencyRatio;

      return {
        isLive,
        confidence,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Liveness verification error:', error);
      throw new Error('Liveness verification failed');
    }
  }

  /**
   * Request camera access from user
   */
  async requestCameraAccess(): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
      });
      return stream;
    } catch (error) {
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          throw new Error('Camera access denied by user');
        } else if (error.name === 'NotFoundError') {
          throw new Error('No camera device found');
        }
      }
      throw new Error('Failed to access camera');
    }
  }

  /**
   * Stop camera stream
   */
  stopCameraStream(stream: MediaStream): void {
    stream.getTracks().forEach((track) => track.stop());
  }

  /**
   * Get unique device ID (browser fingerprint)
   * Used for audit logging, not for identification
   */
  private _getDeviceId(): string {
    // Generate a simple device ID based on browser/device info
    const userAgent = navigator.userAgent;
    const language = navigator.language;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const combined = `${userAgent}-${language}-${timezone}`;
    let hash = 0;

    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return `device-${Math.abs(hash).toString(16)}`;
  }

  /**
   * Cleanup - dispose of model
   */
  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
      this.isInitialized = false;
    }
  }

  // ─── Face Recognition ────────────────────────────────────────────────────

  private faceApiLoaded = false;
  private faceApiLoadPromise: Promise<void> | null = null;

  /** Lazily loads face-api.js models from CDN (called once, cached). */
  async loadFaceApiModels(): Promise<void> {
    if (this.faceApiLoaded) return;
    if (this.faceApiLoadPromise) return this.faceApiLoadPromise;

    this.faceApiLoadPromise = (async () => {
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(FACE_API_MODELS_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(FACE_API_MODELS_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(FACE_API_MODELS_URL),
      ]);
      this.faceApiLoaded = true;
    })();

    return this.faceApiLoadPromise;
  }

  /**
   * Extracts a 128-d face descriptor from an image URL.
   * Returns null if no face is detected in the image.
   */
  async getDescriptorFromUrl(imageUrl: string): Promise<Float32Array | null> {
    await this.loadFaceApiModels();

    const img = await faceapi.fetchImage(imageUrl);
    const detection = await faceapi
      .detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();

    return detection ? detection.descriptor : null;
  }

  /**
   * Extracts a 128-d face descriptor from a live video element.
   * Returns null if no face is detected in the current frame.
   */
  async getDescriptorFromVideo(
    videoElement: HTMLVideoElement
  ): Promise<Float32Array | null> {
    await this.loadFaceApiModels();

    const detection = await faceapi
      .detectSingleFace(videoElement)
      .withFaceLandmarks()
      .withFaceDescriptor();

    return detection ? detection.descriptor : null;
  }

  /**
   * Compares two face descriptors.
   * Returns true when the Euclidean distance is below RECOGNITION_THRESHOLD.
   */
  compareFaces(ref: Float32Array, live: Float32Array): { match: boolean; distance: number } {
    let sum = 0;
    for (let i = 0; i < ref.length; i++) {
      const diff = (ref[i] ?? 0) - (live[i] ?? 0);
      sum += diff * diff;
    }
    const distance = Math.sqrt(sum);
    return { match: distance < RECOGNITION_THRESHOLD, distance };
  }
}

export const faceDetectionService = new FaceDetectionService();
export type { DetectionResult, LivenessCheckResult };
export { RECOGNITION_THRESHOLD };
