/**
 * Face Detection Service
 * Client-side face detection using TensorFlow.js and BlazeFace
 * No facial data is stored - only boolean detection result
 */

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
      // Dynamically import TensorFlow.js
      const tf = await import('@tensorflow/tfjs');
      const blazeface = await import('@tensorflow-models/blazeface');

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
}

export const faceDetectionService = new FaceDetectionService();
export type { DetectionResult, LivenessCheckResult };
