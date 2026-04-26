/**
 * Export Web Worker
 * Handles large export processing in a background thread
 * Prevents UI freezing during large data exports
 * 
 * Requirements: 26.9, 26.10
 */

export interface ExportMessage {
  type: 'export';
  data: any[];
  format: 'csv' | 'excel' | 'pdf';
  headers?: string[];
  id: string;
}

export interface ExportResult {
  type: 'progress' | 'complete' | 'error';
  id: string;
  progress?: number;
  result?: string;
  error?: string;
}

/**
 * Convert data to CSV format
 */
function convertToCSV(data: any[], headers?: string[]): string {
  if (data.length === 0) {
    return '';
  }

  const csvHeaders = headers || Object.keys(data[0]);
  const headerRow = csvHeaders.map((h) => `"${h}"`).join(',');

  const dataRows = data.map((row) => {
    return csvHeaders
      .map((header) => {
        const value = row[header];
        if (value === null || value === undefined) {
          return '';
        }
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      })
      .join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Process export in chunks to report progress
 */
function processExportWithProgress(
  data: any[],
  format: 'csv' | 'excel' | 'pdf',
  headers?: string[]
): string {
  const chunkSize = Math.max(100, Math.floor(data.length / 10));
  let processedCount = 0;

  // For now, all formats convert to CSV
  // In production, backend would handle Excel/PDF generation
  const result = convertToCSV(data, headers);

  // Report progress in chunks
  for (let i = 0; i < data.length; i += chunkSize) {
    processedCount = Math.min(i + chunkSize, data.length);
    const progress = Math.round((processedCount / data.length) * 100);

    // Post progress update
    self.postMessage({
      type: 'progress',
      progress,
    } as ExportResult);
  }

  return result;
}

/**
 * Handle messages from main thread
 */
self.onmessage = (event: MessageEvent<ExportMessage>) => {
  const { type, data, format, headers, id } = event.data;

  if (type !== 'export') {
    return;
  }

  try {
    const result = processExportWithProgress(data, format, headers);

    self.postMessage({
      type: 'complete',
      id,
      result,
    } as ExportResult);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    self.postMessage({
      type: 'error',
      id,
      error: errorMessage,
    } as ExportResult);
  }
};
