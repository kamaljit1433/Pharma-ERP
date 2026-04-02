/**
 * CSV Parser Utility
 * Handles CSV parsing, validation, and generation for employee data
 */

export interface CSVRow {
  [key: string]: string;
}

export interface ParseResult {
  data: CSVRow[];
  errors: ParseError[];
}

export interface ParseError {
  row: number;
  column: string;
  message: string;
}

/**
 * Parse CSV string into rows
 */
export const parseCSV = (csvContent: string): ParseResult => {
  const lines = csvContent.trim().split('\n');
  const errors: ParseError[] = [];

  if (lines.length < 2) {
    errors.push({
      row: 1,
      column: 'general',
      message: 'CSV file must contain at least a header row and one data row',
    });
    return { data: [], errors };
  }

  // Parse header
  const headers = parseCSVLine(lines[0]);
  if (headers.length === 0) {
    errors.push({
      row: 1,
      column: 'general',
      message: 'CSV header is empty or invalid',
    });
    return { data: [], errors };
  }

  // Parse data rows
  const data: CSVRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    const values = parseCSVLine(line);
    if (values.length !== headers.length) {
      errors.push({
        row: i + 1,
        column: 'general',
        message: `Row has ${values.length} columns but expected ${headers.length}`,
      });
      continue;
    }

    const row: CSVRow = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    data.push(row);
  }

  return { data, errors };
};

/**
 * Parse a single CSV line handling quoted values
 */
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current.trim());

  return result;
};

/**
 * Validate employee CSV data
 */
export const validateEmployeeCSV = (
  data: CSVRow[]
): { valid: CSVRow[]; errors: ParseError[] } => {
  const errors: ParseError[] = [];
  const valid: CSVRow[] = [];

  const requiredFields = [
    'employee_id',
    'first_name',
    'last_name',
    'email',
    'date_of_joining',
    'employment_type',
  ];

  const validEmploymentTypes = ['permanent', 'contract', 'temporary', 'intern'];
  const validStatuses = ['active', 'on_leave', 'suspended', 'resigned', 'terminated'];

  data.forEach((row, index) => {
    const rowErrors: ParseError[] = [];

    // Check required fields
    requiredFields.forEach((field) => {
      if (!row[field] || row[field].trim() === '') {
        rowErrors.push({
          row: index + 2, // +2 because of header and 0-indexing
          column: field,
          message: `${field} is required`,
        });
      }
    });

    // Validate email format
    if (row.email && !isValidEmail(row.email)) {
      rowErrors.push({
        row: index + 2,
        column: 'email',
        message: 'Invalid email format',
      });
    }

    // Validate employment type
    if (row.employment_type && !validEmploymentTypes.includes(row.employment_type)) {
      rowErrors.push({
        row: index + 2,
        column: 'employment_type',
        message: `employment_type must be one of: ${validEmploymentTypes.join(', ')}`,
      });
    }

    // Validate status if provided
    if (row.status && !validStatuses.includes(row.status)) {
      rowErrors.push({
        row: index + 2,
        column: 'status',
        message: `status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    // Validate date format
    if (row.date_of_joining && !isValidDate(row.date_of_joining)) {
      rowErrors.push({
        row: index + 2,
        column: 'date_of_joining',
        message: 'date_of_joining must be in YYYY-MM-DD format',
      });
    }

    // Validate phone format if provided
    if (row.phone && !isValidPhone(row.phone)) {
      rowErrors.push({
        row: index + 2,
        column: 'phone',
        message: 'Invalid phone number format',
      });
    }

    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
    } else {
      valid.push(row);
    }
  });

  return { valid, errors };
};

/**
 * Validate email format
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate date format (YYYY-MM-DD)
 */
const isValidDate = (dateString: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Validate phone number format
 */
const isValidPhone = (phone: string): boolean => {
  // Allow various phone formats: +1234567890, 1234567890, (123) 456-7890, etc.
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

/**
 * Generate CSV content from employee data
 */
export const generateEmployeeCSV = (employees: any[]): string => {
  if (employees.length === 0) {
    return '';
  }

  // Define columns to export
  const columns = [
    'employee_id',
    'first_name',
    'last_name',
    'email',
    'phone',
    'date_of_birth',
    'gender',
    'department_id',
    'designation_id',
    'reporting_manager_id',
    'date_of_joining',
    'employment_type',
    'status',
  ];

  // Create header row
  const header = columns.join(',');

  // Create data rows
  const rows = employees.map((emp) => {
    return columns
      .map((col) => {
        const value = emp[col] || '';
        // Escape quotes and wrap in quotes if contains comma or quote
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(',');
  });

  return [header, ...rows].join('\n');
};

/**
 * Convert CSV to Blob for download
 */
export const csvToBlob = (csvContent: string): Blob => {
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
};

/**
 * Download CSV file
 */
export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = csvToBlob(csvContent);
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
