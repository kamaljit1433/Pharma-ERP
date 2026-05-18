/**
 * FaceVerificationModal
 * Opens the webcam, loads the employee's reference photo, and verifies identity
 * using face-api.js descriptor comparison before attendance can be marked.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AlertCircle, Camera, CheckCircle2, Loader2, ScanFace, ShieldCheck, WifiOff } from 'lucide-react';
import { faceDetectionService } from '../../services/faceDetectionService';

export type VerificationStatus =
  | 'idle'
  | 'offline'
  | 'camera_starting'
  | 'models_loading'
  | 'ready'
  | 'scanning'
  | 'verified'
  | 'failed'
  | 'no_face'
  | 'error';

interface FaceVerificationModalProps {
  open: boolean;
  employeePhotoUrl: string | null | undefined;
  onVerified: () => void;
  onCancel: () => void;
}

export const FaceVerificationModal: React.FC<FaceVerificationModalProps> = ({
  open,
  employeePhotoUrl,
  onVerified,
  onCancel,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const refDescriptorRef = useRef<Float32Array | null>(null);

  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      faceDetectionService.stopCameraStream(streamRef.current);
      streamRef.current = null;
    }
  }, []);

  // Start camera + load models + extract reference descriptor when modal opens
  useEffect(() => {
    if (!open) {
      stopCamera();
      setStatus('idle');
      setErrorMsg(null);
      setDistance(null);
      refDescriptorRef.current = null;
      return;
    }

    let cancelled = false;

    const initialize = async () => {
      // If the device is offline, face verification can't load model weights
      // from the CDN. Offer a bypass so the check-in can still be queued.
      if (!navigator.onLine) {
        setStatus('offline');
        return;
      }

      try {
        setStatus('camera_starting');

        const stream = await faceDetectionService.requestCameraAccess();
        if (cancelled) { faceDetectionService.stopCameraStream(stream); return; }
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await new Promise<void>((resolve) => {
            videoRef.current!.onloadedmetadata = () => resolve();
          });
        }

        setStatus('models_loading');
        try {
          await faceDetectionService.loadFaceApiModels();
        } catch {
          // Model weights couldn't be fetched (offline / CDN unreachable).
          // Fall back to the same offline bypass path.
          if (!cancelled) setStatus('offline');
          return;
        }
        if (cancelled) return;

        // Load reference descriptor from employee photo
        if (employeePhotoUrl) {
          const descriptor = await faceDetectionService.getDescriptorFromUrl(employeePhotoUrl);
          if (cancelled) return;
          if (!descriptor) {
            // Photo exists but no face detected — block verification entirely
            setStatus('error');
            setErrorMsg(
              'No face detected in your stored profile photo. Please ask HR to upload a clear, front-facing photo before marking attendance.'
            );
            return;
          }
          refDescriptorRef.current = descriptor;
        }

        if (!cancelled) setStatus('ready');
      } catch (err: any) {
        if (!cancelled) {
          setStatus('error');
          setErrorMsg(err?.message || 'Initialization failed');
        }
      }
    };

    initialize();
    return () => { cancelled = true; stopCamera(); };
  }, [open, employeePhotoUrl, stopCamera]);

  const handleVerify = async () => {
    if (!videoRef.current) return;
    setStatus('scanning');
    setErrorMsg(null);

    try {
      const liveDescriptor = await faceDetectionService.getDescriptorFromVideo(videoRef.current);

      if (!liveDescriptor) {
        setStatus('no_face');
        setErrorMsg('No face detected in camera. Position your face clearly in front of the camera.');
        return;
      }

      // A stored photo is mandatory for attendance — no liveness-only bypass
      if (!refDescriptorRef.current) {
        setStatus('error');
        setErrorMsg('Identity cannot be verified: no reference photo on record. Contact HR to upload your profile photo.');
        return;
      }

      const { match, distance: dist } = faceDetectionService.compareFaces(
        refDescriptorRef.current,
        liveDescriptor
      );
      setDistance(dist);

      if (match) {
        setStatus('verified');
        setTimeout(onVerified, 1200);
      } else {
        setStatus('failed');
        setErrorMsg('Face does not match employee record. Please try again or contact HR.');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err?.message || 'Verification failed');
    }
  };

  const statusBadge = () => {
    switch (status) {
      case 'offline':
        return <Badge variant="secondary" className="gap-1"><WifiOff className="w-3 h-3" />Offline</Badge>;
      case 'camera_starting':
      case 'models_loading':
        return <Badge variant="secondary" className="gap-1"><Loader2 className="w-3 h-3 animate-spin" />{status === 'models_loading' ? 'Loading models…' : 'Starting camera…'}</Badge>;
      case 'ready':
        return <Badge variant="secondary" className="gap-1"><Camera className="w-3 h-3" />Ready</Badge>;
      case 'scanning':
        return <Badge className="gap-1 bg-blue-500 text-white"><Loader2 className="w-3 h-3 animate-spin" />Scanning…</Badge>;
      case 'verified':
        return <Badge className="gap-1 bg-green-600 text-white"><ShieldCheck className="w-3 h-3" />Identity Verified</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="w-3 h-3" />Not Recognised</Badge>;
      case 'no_face':
        return <Badge variant="destructive" className="gap-1"><ScanFace className="w-3 h-3" />No Face Detected</Badge>;
      default:
        return null;
    }
  };

  const isOffline = status === 'offline';
  const isInitializing = status === 'idle' || status === 'camera_starting' || status === 'models_loading';
  const canScan = status === 'ready' || status === 'no_face' || status === 'failed';

  return (
    <Dialog open={open} onOpenChange={(isOpen: boolean) => { if (!isOpen) onCancel(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanFace className="w-5 h-5" />
            Identity Verification
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your face must be verified before marking attendance. Look directly at the camera and click <strong>Verify</strong>.
          </p>

          {/* Camera Feed */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Scanning overlay */}
            {status === 'scanning' && (
              <div className="absolute inset-0 border-4 border-blue-400 rounded-lg animate-pulse pointer-events-none" />
            )}
            {status === 'verified' && (
              <div className="absolute inset-0 border-4 border-green-500 rounded-lg pointer-events-none flex items-center justify-center bg-green-500/20">
                <CheckCircle2 className="w-16 h-16 text-green-400" />
              </div>
            )}
            {isInitializing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status</span>
            {statusBadge()}
          </div>

          {/* Match score (dev info) */}
          {distance !== null && (
            <p className="text-xs text-muted-foreground">
              Similarity distance: {distance.toFixed(3)} (threshold 0.45)
            </p>
          )}

          {/* Offline notice */}
          {isOffline && (
            <div className="flex gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <WifiOff className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                Face verification requires an internet connection to load its models.
                You can still check in — your attendance will be saved and synced when you're back online.
              </p>
            </div>
          )}

          {/* Error */}
          {errorMsg && (
            <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{errorMsg}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {isOffline && (
              <Button onClick={onVerified} className="flex-1 gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Continue Check-In
              </Button>
            )}
            {canScan && (
              <Button onClick={handleVerify} className="flex-1 gap-2">
                <ScanFace className="w-4 h-4" />
                {status === 'failed' || status === 'no_face' ? 'Retry Verification' : 'Verify Identity'}
              </Button>
            )}
            {status === 'verified' && (
              <Button className="flex-1 gap-2 bg-green-600 hover:bg-green-700" disabled>
                <CheckCircle2 className="w-4 h-4" />
                Verified
              </Button>
            )}
            <Button variant="outline" onClick={onCancel} disabled={status === 'scanning' || status === 'verified'}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
