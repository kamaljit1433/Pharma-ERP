/**
 * Export Utilities
 * Handles exporting data in various formats (CSV, Excel, PDF)
 */

import * as XLSX from 'xlsx';

export type ExportFormat = 'csv' | 'excel' | 'pdf';

export interface ExportOptions {
  headers?: string[];
  sheetName?: string;
  title?: string;
  metadata?: {
    generatedDate?: Date;
    user?: string;
    filters?: Record<string, any>;
  };
  onProgress?: (progress: number) => void;
}

// ── Time / date helpers ───────────────────────────────────────────────────────

/** Format a PostgreSQL TIME value ("HH:MM:SS") or ISO datetime string. */
const formatTimeValue = (t: string | undefined | null): string => {
  if (!t) return '-';
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(t)) {
    const parts = t.split(':');
    const h = parseInt(parts[0] ?? '0', 10);
    const m = parseInt(parts[1] ?? '0', 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
  }
  const d = new Date(t);
  return isNaN(d.getTime())
    ? t
    : d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

/** Normalise a PostgreSQL DATE value (Date object or string) to YYYY-MM-DD. */
const normaliseDateStr = (d: any): string => {
  if (!d) return '';
  if (d instanceof Date) return d.toISOString().split('T')[0]!;
  const s = String(d);
  return s.includes('T') ? s.split('T')[0]! : s;
};

// ── CSV ───────────────────────────────────────────────────────────────────────

export const convertToCSV = (
  data: any[],
  headers?: string[],
  onProgress?: (progress: number) => void
): string => {
  if (data.length === 0) return '';

  const cols = headers || Object.keys(data[0]);
  const headerRow = cols.map((h) => `"${h}"`).join(',');

  const dataRows = data.map((row, i) => {
    if (onProgress && i % Math.max(1, Math.floor(data.length / 10)) === 0) {
      onProgress((i / data.length) * 100);
    }
    return cols
      .map((col) => {
        const v = row[col];
        if (v === null || v === undefined) return '';
        const s = String(v);
        return s.includes(',') || s.includes('\n') || s.includes('"')
          ? `"${s.replace(/"/g, '""')}"`
          : s;
      })
      .join(',');
  });

  if (onProgress) onProgress(100);
  // BOM prefix so Excel opens UTF-8 CSV without garbled characters
  return '﻿' + [headerRow, ...dataRows].join('\n');
};

// ── Excel (XLSX via SheetJS) ──────────────────────────────────────────────────

export const convertToExcel = async (
  data: any[],
  options?: ExportOptions
): Promise<Blob> => {
  const ws = XLSX.utils.json_to_sheet(data);

  // Auto-size columns based on content
  const cols = data.length > 0 ? Object.keys(data[0]) : (options?.headers ?? []);
  ws['!cols'] = cols.map((key) => ({
    wch: Math.max(
      key.length,
      ...data.slice(0, 100).map((r) => String(r[key] ?? '').length)
    ) + 2,
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, options?.sheetName || 'Sheet1');

  if (options?.title) {
    wb.Props = { Title: options.title };
  }

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
};

// ── PDF (browser print window) ────────────────────────────────────────────────

export const openPrintWindow = (data: any[], options?: ExportOptions): void => {
  const cols = options?.headers || (data.length > 0 ? Object.keys(data[0]) : []);
  const title = options?.title || 'Report';
  const generated = new Date().toLocaleString();

  const tableRows = data
    .map(
      (row) =>
        `<tr>${cols.map((c) => `<td>${row[c] ?? ''}</td>`).join('')}</tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; padding: 20px; color: #111; }
    h1 { font-size: 15px; margin-bottom: 4px; }
    .meta { font-size: 10px; color: #666; margin-bottom: 12px; }
    table { border-collapse: collapse; width: 100%; margin-top: 8px; }
    th { background: #e8e8e8; font-weight: bold; text-align: left; padding: 5px 8px; border: 1px solid #bbb; }
    td { padding: 4px 8px; border: 1px solid #ccc; }
    tr:nth-child(even) td { background: #f7f7f7; }
    @media print {
      body { padding: 0; }
      button { display: none; }
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="meta">Generated: ${generated} &nbsp;|&nbsp; ${data.length} record(s)</p>
  <table>
    <thead><tr>${cols.map((c) => `<th>${c}</th>`).join('')}</tr></thead>
    <tbody>${tableRows}</tbody>
  </table>
  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
};

// ── Main export dispatcher ────────────────────────────────────────────────────

/**
 * Export data in specified format.
 * For PDF: opens a print window (returns an empty blob — caller should not
 * call downloadBlob for PDF).
 */
export const exportData = async (
  data: any[],
  format: ExportFormat,
  _filename: string,
  options?: ExportOptions
): Promise<Blob | null> => {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        if (format === 'csv') {
          const csv = convertToCSV(data, options?.headers, options?.onProgress);
          resolve(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
        } else if (format === 'excel') {
          resolve(await convertToExcel(data, options));
        } else if (format === 'pdf') {
          openPrintWindow(data, options);
          resolve(null); // No blob to download — print dialog handles it
        } else {
          reject(new Error(`Unsupported export format: ${format}`));
        }
      } catch (e) {
        reject(e);
      }
    }, 0);
  });
};

// ── Download helper ───────────────────────────────────────────────────────────

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

// ── Data formatters ───────────────────────────────────────────────────────────

export const formatAttendanceForExport = (records: any[]): any[] =>
  records.map((r) => ({
    'Employee ID': r.employee_id ?? '-',
    Date: normaliseDateStr(r.date) || '-',
    'Check-in Time': formatTimeValue(r.check_in_time),
    'Check-out Time': formatTimeValue(r.check_out_time),
    'Working Hours': r.working_hours != null ? `${Number(r.working_hours).toFixed(2)}h` : '-',
    Status: r.status ?? '-',
    Remarks: r.notes ?? r.remarks ?? '-',
  }));

export const formatEmployeeForExport = (employees: any[]): any[] =>
  employees.map((emp) => ({
    'Employee ID': emp.employee_id,
    'First Name': emp.first_name,
    'Last Name': emp.last_name,
    Email: emp.email,
    Phone: emp.phone || '-',
    'Date of Birth': emp.date_of_birth ? normaliseDateStr(emp.date_of_birth) : '-',
    Gender: emp.gender || '-',
    'Employment Type': emp.employment_type,
    Status: emp.status,
    'Date of Joining': normaliseDateStr(emp.date_of_joining) || '-',
  }));

// ── Misc helpers ──────────────────────────────────────────────────────────────

export const getFileExtension = (format: ExportFormat): string =>
  ({ csv: 'csv', excel: 'xlsx', pdf: 'pdf' })[format] ?? 'txt';

export const generateFilename = (
  prefix: string,
  format: ExportFormat,
  timestamp = true
): string => {
  const ext = getFileExtension(format);
  const ts = timestamp ? `-${new Date().toISOString().split('T')[0]}` : '';
  return `${prefix}${ts}.${ext}`;
};

export const createExportMetadata = (options?: ExportOptions): string[] => {
  const out: string[] = [];
  if (options?.metadata?.generatedDate)
    out.push(`Generated: ${options.metadata.generatedDate.toLocaleString()}`);
  if (options?.metadata?.user) out.push(`User: ${options.metadata.user}`);
  if (options?.metadata?.filters && Object.keys(options.metadata.filters).length > 0) {
    out.push(
      `Filters: ${Object.entries(options.metadata.filters)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ')}`
    );
  }
  return out;
};
