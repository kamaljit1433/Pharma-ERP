/**
 * Large Export Dialog Component
 * Handles large exports using Web Workers
 * Provides download links for generated reports
 * 
 * Requirements: 26.9, 26.10
 */

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Download, Loader2, AlertCircle } from 'lucide-react';
import { useExportStore } from '@/store/exportStore';
import {
  exportLargeDataset,
  isLargeDataset,
  isWebWorkerSupported,
  createBlob,
  createDownloadUrl,
  getEstimatedProcessingTime,
} from '@/utils/largeExportUtils';
import { generateFilename } from '@/utils/exportUtils';
import { useToast } from '@/hooks/useToast';

export interface LargeExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any[];
  filename: string;
  title?: string;
  onExportStart?: () => void;
  onExportComplete?: () => void;
}

export const LargeExportDialog: React.FC<LargeExportDialogProps> = ({
  open,
  onOpenChange,
  data,
  filename,
  title = 'Export Data',
  onExportStart,
  onExportComplete,
}) => {
  const [format, setFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const { addJob, updateJobProgress, completeJob, failJob } = useExportStore();
  const { toast } = useToast();

  const isLarge = isLargeDataset(data);
  const estimatedTime = getEstimatedProcessingTime(data.length);
  const useWorker = isLarge && isWebWorkerSupported();

  const handleExport = useCallback(async () => {
    if (data.length === 0) {
      setError('No data to export');
      toast({
        title: 'Error',
        description: 'No data to export',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    setProgress(0);
    setError(null);
    onExportStart?.();

    const controller = new AbortController();
    setAbortController(controller);

    // Create export job
    const jobId = addJob({
      filename: generateFilename(filename, format),
      format,
      dataSize: data.length,
    });

    try {
      let csvData: string;

      if (useWorker) {
        // Use Web Worker for large exports
        csvData = await exportLargeDataset(data, format, jobId, {
          onProgress: (p) => {
            setProgress(p);
            updateJobProgress(jobId, p);
          },
          signal: controller.signal,
        });
      } else {
        // Fallback to main thread for small exports
        // Simulate progress updates
        setProgress(25);
        updateJobProgress(jobId, 25);

        // Convert to CSV (simplified)
        const headers = Object.keys(data[0] || {});
        const rows = data.map((row) =>
          headers.map((h) => {
            const value = row[h];
            if (value === null || value === undefined) return '';
            const str = String(value);
            if (str.includes(',') || str.includes('\n') || str.includes('"')) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          })
        );

        csvData = [headers.map((h) => `"${h}"`).join(','), ...rows.map((r) => r.join(','))].join(
          '\n'
        );

        setProgress(100);
        updateJobProgress(jobId, 100);
      }

      // Create blob and download URL
      const blob = createBlob(csvData, format);
      const downloadUrl = createDownloadUrl(blob);

      // Complete job
      completeJob(jobId, downloadUrl);

      setProgress(100);
      onExportComplete?.();

      toast({
        title: 'Success',
        description: `Export completed. File ready for download.`,
      });

      // Close dialog after a short delay
      setTimeout(() => {
        onOpenChange(false);
        setIsExporting(false);
        setProgress(0);
      }, 500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed';

      if (errorMessage !== 'Export cancelled') {
        setError(errorMessage);
        failJob(jobId, errorMessage);

        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }

      setIsExporting(false);
      setProgress(0);
    } finally {
      setAbortController(null);
    }
  }, [data, format, filename, useWorker, addJob, updateJobProgress, completeJob, failJob, onExportStart, onExportComplete, toast, onOpenChange]);

  const handleCancel = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setIsExporting(false);
    setProgress(0);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Export {data.length.toLocaleString()} records
            {isLarge && ` (Large dataset - using background processing)`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Export Format</Label>
            <div className="space-y-2">
              {(['csv', 'excel', 'pdf'] as const).map((fmt) => (
                <div key={fmt} className="flex items-center">
                  <input
                    type="radio"
                    id={`format-${fmt}`}
                    name="format"
                    value={fmt}
                    checked={format === fmt}
                    onChange={(e) => setFormat(e.target.value as typeof fmt)}
                    disabled={isExporting}
                    className="h-4 w-4"
                  />
                  <Label htmlFor={`format-${fmt}`} className="font-normal cursor-pointer ml-2">
                    {fmt === 'csv' && 'CSV (.csv) - Comma-separated values'}
                    {fmt === 'excel' && 'Excel (.xlsx) - Microsoft Excel format'}
                    {fmt === 'pdf' && 'PDF (.pdf) - Portable Document Format'}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Large Dataset Info */}
          {isLarge && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                <strong>Large Dataset:</strong> This export will be processed in the background
                to keep the UI responsive. Estimated time: ~{estimatedTime}ms.
              </p>
            </div>
          )}

          {/* Progress Indicator */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">
                  {progress < 100 ? 'Exporting...' : 'Finalizing...'}
                </Label>
                <span className="text-sm font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-900">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              if (isExporting) {
                handleCancel();
              } else {
                onOpenChange(false);
              }
            }}
          >
            {isExporting ? 'Cancel' : 'Close'}
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || data.length === 0}
            className="gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LargeExportDialog;
