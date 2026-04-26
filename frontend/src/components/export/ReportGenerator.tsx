/**
 * Report Generator Component
 * Integrates report generation with existing data export functionality
 * 
 * Requirements: 26.5, 26.6, 26.7, 26.8
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
import { Label } from '@/components/ui/label';
import { FileText, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import {
  ReportData,
  ReportColumn,
  ReportMetadata,
  generateReportHTML,
  generateReportCSV,
  downloadReport,
  printReport,
  generateReportFilename,
} from '@/utils/reportGenerator';
import { useToast } from '@/hooks/useToast';

export interface ReportGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  data: any[];
  columns: ReportColumn[];
  filters?: Record<string, any>;
  summary?: { label: string; value: string | number }[];
  pageSize?: 'A4' | 'Letter';
  onGenerateStart?: () => void;
  onGenerateComplete?: () => void;
  onGenerateError?: (error: Error) => void;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  open,
  onOpenChange,
  title,
  description,
  data,
  columns,
  filters,
  summary,
  pageSize = 'A4',
  onGenerateStart,
  onGenerateComplete,
  onGenerateError,
}) => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [format, setFormat] = useState<'html' | 'csv' | 'print'>('html');

  const createReportData = (): ReportData => {
    const metadata: ReportMetadata = {
      title,
      description,
      generatedDate: new Date(),
      generatedBy: user?.email || 'System',
      filters,
      pageSize,
    };

    return {
      metadata,
      columns,
      rows: data,
      summary,
    };
  };

  const handleGenerate = async () => {
    if (data.length === 0) {
      onGenerateError?.(new Error('No data to generate report'));
      return;
    }

    setIsGenerating(true);
    onGenerateStart?.();

    try {
      const reportData = createReportData();

      if (format === 'print') {
        const reportHTML = generateReportHTML(reportData);
        printReport(reportHTML, pageSize);
        toast({
          type: 'success',
          message: 'Report sent to printer',
        });
      } else if (format === 'html') {
        const reportHTML = generateReportHTML(reportData);
        const filename = generateReportFilename(title, 'html');
        downloadReport(reportHTML, filename, 'html');
        toast({
          type: 'success',
          message: 'Report downloaded as HTML',
        });
      } else if (format === 'csv') {
        const csv = generateReportCSV(reportData);
        const filename = generateReportFilename(title, 'csv');
        downloadReport(csv, filename, 'csv');
        toast({
          type: 'success',
          message: 'Report downloaded as CSV',
        });
      }

      onGenerateComplete?.();

      // Close dialog after a short delay
      setTimeout(() => {
        onOpenChange(false);
        setIsGenerating(false);
      }, 500);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Report generation failed');
      onGenerateError?.(err);
      toast({
        type: 'error',
        message: `Report generation failed: ${err.message}`,
      });
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Report</DialogTitle>
          <DialogDescription>
            Generate a formatted report with {data.length} records
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Report Info */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Report Title</Label>
            <p className="text-sm text-muted-foreground">{title}</p>
            {description && (
              <>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground">{description}</p>
              </>
            )}
          </div>

          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Report Format</Label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="format-html"
                  name="format"
                  value="html"
                  checked={format === 'html'}
                  onChange={(e) => setFormat(e.target.value as 'html' | 'csv' | 'print')}
                  disabled={isGenerating}
                  className="h-4 w-4"
                />
                <Label htmlFor="format-html" className="font-normal cursor-pointer ml-2">
                  Download as HTML - Formatted document for viewing and printing
                </Label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="format-csv"
                  name="format"
                  value="csv"
                  checked={format === 'csv'}
                  onChange={(e) => setFormat(e.target.value as 'html' | 'csv' | 'print')}
                  disabled={isGenerating}
                  className="h-4 w-4"
                />
                <Label htmlFor="format-csv" className="font-normal cursor-pointer ml-2">
                  Download as CSV - Spreadsheet format for data analysis
                </Label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="format-print"
                  name="format"
                  value="print"
                  checked={format === 'print'}
                  onChange={(e) => setFormat(e.target.value as 'html' | 'csv' | 'print')}
                  disabled={isGenerating}
                  className="h-4 w-4"
                />
                <Label htmlFor="format-print" className="font-normal cursor-pointer ml-2">
                  Print - Send directly to printer
                </Label>
              </div>
            </div>
          </div>

          {/* Page Size Selection (for print/HTML) */}
          {(format === 'html' || format === 'print') && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Paper Size</Label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="size-a4"
                    name="pageSize"
                    value="A4"
                    checked={pageSize === 'A4'}
                    disabled={isGenerating}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="size-a4" className="font-normal cursor-pointer ml-2">
                    A4 (210 × 297 mm)
                  </Label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="size-letter"
                    name="pageSize"
                    value="Letter"
                    checked={pageSize === 'Letter'}
                    disabled={isGenerating}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="size-letter" className="font-normal cursor-pointer ml-2">
                    Letter (8.5 × 11 in)
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Report Metadata Preview */}
          <div className="space-y-2 p-3 bg-muted rounded-md">
            <Label className="text-sm font-medium">Report Metadata</Label>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Generated: {new Date().toLocaleString()}</p>
              <p>Generated By: {user?.email || 'System'}</p>
              {filters && Object.keys(filters).length > 0 && (
                <p>
                  Filters: {Object.entries(filters)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isGenerating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || data.length === 0}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportGenerator;
