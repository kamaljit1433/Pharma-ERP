/**
 * Report Template Component
 * Displays reports with metadata and print/download functionality
 * 
 * Requirements: 26.5, 26.6, 26.7, 26.8
 */

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Download, FileText } from 'lucide-react';
import {
  ReportData,
  formatReportMetadata,
  formatCellValue,
  generateReportHTML,
  generateReportCSV,
  downloadReport,
  printReport,
  generateReportFilename,
} from '@/utils/reportGenerator';
import { useToast } from '@/hooks/useToast';
import './report-styles.css';

export interface ReportTemplateProps {
  data: ReportData;
  pageSize?: 'A4' | 'Letter';
  onPrintStart?: () => void;
  onPrintComplete?: () => void;
  onDownloadStart?: () => void;
  onDownloadComplete?: () => void;
}

export const ReportTemplate: React.FC<ReportTemplateProps> = ({
  data,
  pageSize = 'A4',
  onPrintStart,
  onPrintComplete,
  onDownloadStart,
  onDownloadComplete,
}) => {
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);
  const { metadata, columns, rows, summary } = data;

  const handlePrint = () => {
    try {
      onPrintStart?.();
      const reportHTML = generateReportHTML(data);
      printReport(reportHTML, pageSize);
      toast({
        type: 'success',
        message: 'Report sent to printer',
      });
      onPrintComplete?.();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Print failed');
      toast({
        type: 'error',
        message: `Print failed: ${err.message}`,
      });
    }
  };

  const handleDownloadHTML = () => {
    try {
      onDownloadStart?.();
      const reportHTML = generateReportHTML(data);
      const filename = generateReportFilename(metadata.title, 'html');
      downloadReport(reportHTML, filename, 'html');
      toast({
        type: 'success',
        message: 'Report downloaded as HTML',
      });
      onDownloadComplete?.();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Download failed');
      toast({
        type: 'error',
        message: `Download failed: ${err.message}`,
      });
    }
  };

  const handleDownloadCSV = () => {
    try {
      onDownloadStart?.();
      const csv = generateReportCSV(data);
      const filename = generateReportFilename(metadata.title, 'csv');
      downloadReport(csv, filename, 'csv');
      toast({
        type: 'success',
        message: 'Report downloaded as CSV',
      });
      onDownloadComplete?.();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Download failed');
      toast({
        type: 'error',
        message: `Download failed: ${err.message}`,
      });
    }
  };

  const metadataText = formatReportMetadata(metadata);

  return (
    <div className="report-wrapper">
      {/* Print Controls */}
      <div className="report-controls no-print">
        <div className="controls-group">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadHTML}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download HTML
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadCSV}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Download CSV
          </Button>
        </div>
      </div>

      {/* Report Content */}
      <div ref={reportRef} className="report-container">
        {/* Report Header */}
        <div className="report-header">
          <h1 className="report-title">{metadata.title}</h1>
          {metadata.description && (
            <p className="report-description">{metadata.description}</p>
          )}
          <div className="report-metadata">
            {metadataText.split('\n').map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
        </div>

        {/* Report Content */}
        <div className="report-content">
          <table className="report-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.id}
                    style={{
                      textAlign: col.align || 'left',
                      width: col.width || 'auto',
                    }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {columns.map((col) => (
                    <td
                      key={`${rowIdx}-${col.id}`}
                      style={{ textAlign: col.align || 'left' }}
                    >
                      {formatCellValue(row[col.id], col)}
                    </td>
                  ))}
                </tr>
              ))}
              {summary && summary.length > 0 && (
                <>
                  <tr className="summary-row">
                    <td colSpan={columns.length} style={{ textAlign: 'right' }}>
                      {/* Empty row for spacing */}
                    </td>
                  </tr>
                  {summary.map((item, idx) => (
                    <tr key={`summary-${idx}`} className="summary-row">
                      <td colSpan={columns.length} style={{ textAlign: 'right' }}>
                        <strong>{item.label}:</strong> {item.value}
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Report Footer */}
        <div className="report-footer">
          <p>
            Page <span className="page-number">1</span> of{' '}
            <span className="page-count">1</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportTemplate;
