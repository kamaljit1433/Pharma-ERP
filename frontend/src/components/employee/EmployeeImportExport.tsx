import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Upload, Download, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { parseCSV, validateEmployeeCSV, generateEmployeeCSV, downloadCSV } from '@/utils/csvParser';
import employeeService from '@/services/employeeService';

export interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    column: string;
    message: string;
  }>;
}

interface EmployeeImportExportProps {
  onImportComplete?: (result: ImportResult) => void;
  onExportComplete?: () => void;
  employees?: any[];
}

export const EmployeeImportExport: React.FC<EmployeeImportExportProps> = ({
  onImportComplete,
  onExportComplete,
  employees = [],
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [showImportResult, setShowImportResult] = useState(false);

  /**
   * Handle file selection for import
   */
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      setImportError('Please select a CSV file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImportError('File size must be less than 5MB');
      return;
    }

    await handleImport(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Handle CSV import
   */
  const handleImport = async (file: File) => {
    setImportLoading(true);
    setImportError(null);
    setImportResult(null);

    try {
      // Read file
      const fileContent = await file.text();

      // Parse CSV
      const parseResult = parseCSV(fileContent);
      if (parseResult.errors.length > 0) {
        setImportError('CSV parsing failed');
        setImportResult({
          success: 0,
          failed: parseResult.data.length,
          errors: parseResult.errors,
        });
        setShowImportResult(true);
        return;
      }

      // Validate data
      const validationResult = validateEmployeeCSV(parseResult.data);
      if (validationResult.errors.length > 0) {
        setImportError('CSV validation failed');
        setImportResult({
          success: validationResult.valid.length,
          failed: parseResult.data.length - validationResult.valid.length,
          errors: validationResult.errors,
        });
        setShowImportResult(true);
        return;
      }

      // Upload to server
      const result = await employeeService.importCSV(file);

      setImportResult({
        success: result.success,
        failed: result.failed,
        errors: result.errors || [],
      });
      setShowImportResult(true);

      if (result.failed === 0) {
        setImportError(null);
      }

      onImportComplete?.(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Import failed';
      setImportError(message);
      setImportResult({
        success: 0,
        failed: 0,
        errors: [
          {
            row: 0,
            column: 'general',
            message,
          },
        ],
      });
      setShowImportResult(true);
    } finally {
      setImportLoading(false);
    }
  };

  /**
   * Handle CSV export
   */
  const handleExport = async () => {
    setExportLoading(true);
    setImportError(null);

    try {
      // Generate CSV from employees
      const csvContent = generateEmployeeCSV(employees);

      if (!csvContent) {
        setImportError('No employees to export');
        return;
      }

      // Download CSV
      const timestamp = new Date().toISOString().split('T')[0];
      downloadCSV(csvContent, `employees_${timestamp}.csv`);

      onExportComplete?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Export failed';
      setImportError(message);
    } finally {
      setExportLoading(false);
    }
  };

  /**
   * Download sample CSV template
   */
  const handleDownloadTemplate = () => {
    const sampleData = [
      {
        employee_id: 'EMP001',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        date_of_birth: '1990-01-15',
        gender: 'male',
        department_id: 'DEPT001',
        designation_id: 'DES001',
        reporting_manager_id: 'EMP000',
        date_of_joining: '2023-01-15',
        employment_type: 'permanent',
        status: 'active',
      },
    ];

    const csvContent = generateEmployeeCSV(sampleData);
    downloadCSV(csvContent, 'employee_template.csv');
  };

  return (
    <div className="space-y-4">
      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Employees
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Upload a CSV file to import multiple employees at once. Maximum file size: 5MB.
            </p>

            {/* File Input */}
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                disabled={importLoading}
                className="hidden"
                aria-label="Select CSV file for import"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={importLoading}
                variant="outline"
                className="gap-2"
              >
                {importLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Select CSV File
                  </>
                )}
              </Button>
              <Button
                onClick={handleDownloadTemplate}
                variant="ghost"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download Template
              </Button>
            </div>

            {/* Error Message */}
            {importError && (
              <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    {importError}
                  </p>
                </div>
              </div>
            )}

            {/* Import Result */}
            {showImportResult && importResult && (
              <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-md">
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Successful
                      </p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {importResult.success}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Failed
                      </p>
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">
                        {importResult.failed}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Error Details */}
                {importResult.errors.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Errors:
                    </p>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {importResult.errors.slice(0, 10).map((error, index) => (
                        <div
                          key={index}
                          className="text-xs text-gray-600 dark:text-gray-400 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                        >
                          <span className="font-mono">Row {error.row}</span>
                          {error.column !== 'general' && (
                            <span className="font-mono"> - {error.column}</span>
                          )}
                          : {error.message}
                        </div>
                      ))}
                      {importResult.errors.length > 10 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 p-2">
                          ... and {importResult.errors.length - 10} more errors
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => setShowImportResult(false)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Employees
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Export all employees to a CSV file for backup or external processing.
          </p>

          <Button
            onClick={handleExport}
            disabled={exportLoading || employees.length === 0}
            className="gap-2"
          >
            {exportLoading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export to CSV
              </>
            )}
          </Button>

          {employees.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No employees to export
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
