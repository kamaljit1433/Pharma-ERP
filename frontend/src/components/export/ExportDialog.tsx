/**
 * Export Dialog Component
 * Provides UI for exporting data in multiple formats with progress tracking
 * 
 * Requirements: 26.1, 26.2, 26.3, 26.4
 */

import React, { useState } from 'react';
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
import { Download, Loader2 } from 'lucide-react';
import { ExportFormat, exportData, generateFilename, downloadBlob } from '@/utils/exportUtils';

export interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any[];
  filename: string;
  title?: string;
  onExportStart?: () => void;
  onExportComplete?: () => void;
  onExportError?: (error: Error) => void;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onOpenChange,
  data,
  filename,
  title = 'Export Data',
  onExportStart,
  onExportComplete,
  onExportError,
}) => {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExport = async () => {
    if (data.length === 0) {
      onExportError?.(new Error('No data to export'));
      return;
    }

    setIsExporting(true);
    setProgress(0);
    onExportStart?.();

    try {
      const blob = await exportData(data, format, filename, {
        onProgress: (p) => setProgress(p),
      });

      const exportFilename = generateFilename(filename, format);
      downloadBlob(blob, exportFilename);

      setProgress(100);
      onExportComplete?.();

      // Close dialog after a short delay
      setTimeout(() => {
        onOpenChange(false);
        setIsExporting(false);
        setProgress(0);
      }, 500);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Export failed');
      onExportError?.(err);
      setIsExporting(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Choose a format to export {data.length} records
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Export Format</Label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="format-csv"
                  name="format"
                  value="csv"
                  checked={format === 'csv'}
                  onChange={(e) => setFormat(e.target.value as ExportFormat)}
                  disabled={isExporting}
                  className="h-4 w-4"
                />
                <Label htmlFor="format-csv" className="font-normal cursor-pointer ml-2">
                  CSV (.csv) - Comma-separated values
                </Label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="format-excel"
                  name="format"
                  value="excel"
                  checked={format === 'excel'}
                  onChange={(e) => setFormat(e.target.value as ExportFormat)}
                  disabled={isExporting}
                  className="h-4 w-4"
                />
                <Label htmlFor="format-excel" className="font-normal cursor-pointer ml-2">
                  Excel (.xlsx) - Microsoft Excel format
                </Label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="format-pdf"
                  name="format"
                  value="pdf"
                  checked={format === 'pdf'}
                  onChange={(e) => setFormat(e.target.value as ExportFormat)}
                  disabled={isExporting}
                  className="h-4 w-4"
                />
                <Label htmlFor="format-pdf" className="font-normal cursor-pointer ml-2">
                  PDF (.pdf) - Portable Document Format
                </Label>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">Exporting...</Label>
                <span className="text-sm font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Cancel
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

export default ExportDialog;
