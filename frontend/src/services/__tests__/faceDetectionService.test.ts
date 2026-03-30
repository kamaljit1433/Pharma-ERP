/**
 * Unit Tests for Face Detection Service
 */

import { faceDetectionService } from '../faceDetectionService';

// Mock TensorFlow and BlazeFace
jest.mock('@tensorflow/tfjs', () => ({
  __esModule: true,
}));

jest.mock('@tensorflow-models/blazeface', () => ({
  __esModule: true,
  load: jest.fn().mockResolvedValue({
    estimateFaces: jest.fn(),
    dispose: jest.fn(),
  }),
}));

describe('FaceDetectionService', () => {
  let mockVideoElement: HTMLVideoElement;

  beforeEach(() => {
    // Create mock video element
    mockVideoElement = document.createElement('video');
    jest.clearAllMocks();
  });

  afterEach(() => {
    faceDetectionService.dispose();
  });

  describe('initializeModel', () => {
    it('should initialize the model successfully', async () => {
      await faceDetectionService.initializeModel();
      // If no error is thrown, initialization was successful
      expect(true).toBe(true);
    });

    it('should handle initialization errors gracefully', async () => {
      const blazeface = require('@tensorflow-models/blazeface');
      blazeface.load.mockRejectedValueOnce(new Error('Model load failed'));

      await expect(faceDetectionService.initializeModel()).rejects.toThrow(
        'Face detection model initialization failed'
      );
    });

    it('should not reinitialize if already initialized', async () => {
      const blazeface = require('@tensorflow-models/blazeface');
      const loadSpy = jest.spyOn(blazeface, 'load');

      await faceDetectionService.initializeModel();
      const firstCallCount = loadSpy.mock.calls.length;

      await faceDetectionService.initializeModel();
      const secondCallCount = loadSpy.mock.calls.length;

      expect(secondCallCount).toBe(firstCallCount);
    });
  });

  describe('detectHumanPresence', () => {
    beforeEach(async () => {
      await faceDetectionService.initializeModel();
    });

    it('should detect human presence when face is present', async () => {
      const blazeface = require('@tensorflow-models/blazeface');
      const mockModel = await blazeface.load();
      mockModel.estimateFaces.mockResolvedValueOnce([
        {
          start: [10, 20],
          end: [100, 200],
        },
      ]);

      const result = await faceDetectionService.detectHumanPresence(
        mockVideoElement
      );

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.9);
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.deviceId).toBeDefined();
    });

    it('should not detect human presence when face is absent', async () => {
      const blazeface = require('@tensorflow-models/blazeface');
      const mockModel = await blazeface.load();
      mockModel.estimateFaces.mockResolvedValueOnce([]);

      const result = await faceDetectionService.detectHumanPresence(
        mockVideoElement
      );

      expect(result.detected).toBe(false);
      expect(result.confidence).toBe(0.0);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should handle detection errors gracefully', async () => {
      const blazeface = require('@tensorflow-models/blazeface');
      const mockModel = await blazeface.load();
      mockModel.estimateFaces.mockRejectedValueOnce(
        new Error('Detection failed')
      );

      await expect(
        faceDetectionService.detectHumanPresence(mockVideoElement)
      ).rejects.toThrow('Face detection failed');
    });

    it('should return consistent timestamp format', async () => {
      const blazeface = require('@tensorflow-models/blazeface');
      const mockModel = await blazeface.load();
      mockModel.estimateFaces.mockResolvedValueOnce([]);

      const result = await faceDetectionService.detectHumanPresence(
        mockVideoElement
      );

      expect(result.timestamp.getTime()).toBeLessThanOrEqual(Date.now());
      expect(result.timestamp.getTime()).toBeGreaterThan(Date.now() - 1000);
    });
  });

  describe('verifyLiveness', () => {
    beforeEach(async () => {
      await faceDetectionService.initializeModel();
    });

    it('should verify liveness when face is consistently detected', async () => {
      const blazeface = require('@tensorflow-models/blazeface');
      const mockModel = await blazeface.load();

      // Mock consistent detections
      mockModel.estimateFaces.mockResolvedValue([
        {
          start: [10, 20],
          end: [100, 200],
        },
      ]);

      const result = await faceDetectionService.verifyLiveness(
        mockVideoElement,
        500
      );

      expect(result.isLive).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should fail liveness check when face is inconsistently detected', async () => {
      const blazeface = require('@tensorflow-models/blazeface');
      const mockModel = await blazeface.load();

      // Mock inconsistent detections
      let callCount = 0;
      mockModel.estimateFaces.mockImplementation(() => {
        callCount++;
        return Promise.resolve(callCount % 3 === 0 ? [] : [{ start: [10, 20] }]);
      });

      const result = await faceDetectionService.verifyLiveness(
        mockVideoElement,
        500
      );

      expect(result.isLive).toBe(false);
      expect(result.confidence).toBeLessThan(0.7);
    });

    it('should handle liveness verification errors', async () => {
      const blazeface = require('@tensorflow-models/blazeface');
      const mockModel = await blazeface.load();
      mockModel.estimateFaces.mockRejectedValueOnce(
        new Error('Verification failed')
      );

      await expect(
        faceDetectionService.verifyLiveness(mockVideoElement, 500)
      ).rejects.toThrow('Liveness verification failed');
    });
  });

  describe('requestCameraAccess', () => {
    it('should request camera access successfully', async () => {
      const mockStream = {
        getTracks: jest.fn().mockReturnValue([]),
      } as unknown as MediaStream;

      navigator.mediaDevices.getUserMedia = jest
        .fn()
        .mockResolvedValueOnce(mockStream);

      const stream = await faceDetectionService.requestCameraAccess();

      expect(stream).toBe(mockStream);
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
      });
    });

    it('should handle camera access denied error', async () => {
      const error = new DOMException('Permission denied', 'NotAllowedError');
      navigator.mediaDevices.getUserMedia = jest
        .fn()
        .mockRejectedValueOnce(error);

      await expect(faceDetectionService.requestCameraAccess()).rejects.toThrow(
        'Camera access denied by user'
      );
    });

    it('should handle no camera device error', async () => {
      const error = new DOMException('No device found', 'NotFoundError');
      navigator.mediaDevices.getUserMedia = jest
        .fn()
        .mockRejectedValueOnce(error);

      await expect(faceDetectionService.requestCameraAccess()).rejects.toThrow(
        'No camera device found'
      );
    });

    it('should handle generic camera access errors', async () => {
      navigator.mediaDevices.getUserMedia = jest
        .fn()
        .mockRejectedValueOnce(new Error('Generic error'));

      await expect(faceDetectionService.requestCameraAccess()).rejects.toThrow(
        'Failed to access camera'
      );
    });
  });

  describe('stopCameraStream', () => {
    it('should stop all tracks in the stream', () => {
      const mockTrack1 = { stop: jest.fn() };
      const mockTrack2 = { stop: jest.fn() };
      const mockStream = {
        getTracks: jest.fn().mockReturnValue([mockTrack1, mockTrack2]),
      } as unknown as MediaStream;

      faceDetectionService.stopCameraStream(mockStream);

      expect(mockTrack1.stop).toHaveBeenCalled();
      expect(mockTrack2.stop).toHaveBeenCalled();
    });
  });

  describe('dispose', () => {
    it('should dispose of the model', async () => {
      await faceDetectionService.initializeModel();
      const blazeface = require('@tensorflow-models/blazeface');
      const mockModel = await blazeface.load();

      faceDetectionService.dispose();

      expect(mockModel.dispose).toHaveBeenCalled();
    });
  });

  describe('No facial data storage', () => {
    it('should only return boolean detection result, not facial data', async () => {
      await faceDetectionService.initializeModel();
      const blazeface = require('@tensorflow-models/blazeface');
      const mockModel = await blazeface.load();
      mockModel.estimateFaces.mockResolvedValueOnce([
        {
          start: [10, 20],
          end: [100, 200],
          landmarks: [[50, 50]],
        },
      ]);

      const result = await faceDetectionService.detectHumanPresence(
        mockVideoElement
      );

      // Verify only boolean result is returned
      expect(result).toHaveProperty('detected');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('deviceId');

      // Verify no facial landmarks or features are stored
      expect(result).not.toHaveProperty('landmarks');
      expect(result).not.toHaveProperty('features');
      expect(result).not.toHaveProperty('faceData');
    });
  });
});
