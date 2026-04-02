/**
 * Export Utilities
 * Handles exporting data in various formats (CSV, Excel, PDF)
 */

/**
 * Convert data to CSV format
 */
export const convertToCSV = (data: any[], headers?: string[]): string => {
  if (data.length === 0) {
    return '';
  }

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);

  // Create header row
  const headerRow = csvHeaders.map((h) => `"${h}"`).join(',');

  // Create data rows
  const dataRows = data.map((row) =>
    csvHeaders
      .map((header) => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma or newline
        if (value === null || value === undefined) {
          return '';
        }
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      })
      .join(',')
  );

  return [headerRow, ...dataRows].join('\n');
};

/**
 * Convert data to Excel format (XLSX)
 * Note: This requires the backend to handle Excel generation
 * or the xlsx library to be installed
 * For now, we fallback to CSV format
 */
export const convertToExcel = async (
  data: any[],
  filename: string,
  sheetName: string = 'Sheet1'
): Promise<Blob> => {
  // Fallback: convert to CSV and return as Excel-compatible format
  // In production, the backend would handle Excel generation
  const csv = convertToCSV(data);
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
};

/**
 * Convert data to PDF format
 * Note: This requires the backend to handle PDF generation
 * or the jspdf library to be installed
 * For now, we fallback to CSV format
 */
export const convertToPDF = async (
  data: any[],
  filename: string,
  title: string = 'Report'
): Promise<Blob> => {
  // Fallback: return CSV as PDF-like format
  // In production, the backend would handle PDF generation
  const csv = convertToCSV(data);
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
};

/**
 * Download blob as file
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Export data in specified format
 */
export const exportData = async (
  data: any[],
  format: 'csv' | 'excel' | 'pdf',
  filename: string,
  options?: {
    headers?: string[];
    sheetName?: string;
    title?: string;
  }
): Promise<Blob> => {
  switch (format) {
    case 'csv':
      const csv = convertToCSV(data, options?.headers);
      return new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    case 'excel':
      return convertToExcel(data, filename, options?.sheetName);

    case 'pdf':
      return convertToPDF(data, filename, options?.title);

    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

/**
 * Format attendance data for export
 */
export const formatAttendanceForExport = (records: any[]): any[] => {
  return records.map((record) => ({
    'Employee ID': record.employee_id,
    Date: new Date(record.date).toLocaleDateString(),
    'Check-in Time': record.check_in_time
      ? new Date(record.check_in_time).toLocaleTimeString()
      : '-',
    'Check-out Time': record.check_out_time
      ? new Date(record.check_out_time).toLocaleTimeString()
      : '-',
    'Working Hours': record.working_hours ? `${record.working_hours.toFixed(2)}h` : '-',
    Status: record.status || '-',
    Remarks: record.remarks || '-',
  }));
};

/**
 * Get file extension for format
 */
export const getFileExtension = (format: 'csv' | 'excel' | 'pdf'): string => {
  switch (format) {
    case 'csv':
      return 'csv';
    case 'excel':
      return 'xlsx';
    case 'pdf':
      return 'pdf';
    default:
      return 'txt';
  }
};

/**
 * Generate filename with timestamp
 */
export const generateFilename = (
  prefix: string,
  format: 'csv' | 'excel' | 'pdf',
  timestamp: boolean = true
): string => {
  const ext = getFileExtension(format);
  const ts = timestamp ? `-${new Date().toISOString().split('T')[0]}` : '';
  return `${prefix}${ts}.${ext}`;
};
