import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployeeStore } from '@/store/employeeStore';
import { useAuthStore } from '@/store/authStore';
import { EmployeeList } from '@/components/employee/EmployeeList';
import { UserRole } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, Download, Upload, ChevronDown, FileSpreadsheet, FileText } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export const Employees: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const {
    items: employees,
    loading,
    error,
    fetchItems,
    deleteItem,
    importCSV,
    exportEmployees,
  } = useEmployeeStore();

  const [isImporting, setIsImporting] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Fetch employees on mount
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast({
        type: 'error',
        message: error,
      });
    }
  }, [error, toast]);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Check if user can manage employees (HR Manager or Super Admin)
  const canManageEmployees =
    user?.role === UserRole.HR_MANAGER || user?.role === UserRole.SUPER_ADMIN;

  const handleAddEmployee = useCallback(() => {
    navigate('/employees/new');
  }, [navigate]);

  const handleEditEmployee = useCallback(
    (employeeId: string) => {
      navigate(`/employees/${employeeId}/edit`);
    },
    [navigate]
  );

  const handleDeleteEmployee = useCallback(
    async (employeeId: string) => {
      if (window.confirm('Are you sure you want to delete this employee?')) {
        try {
          await deleteItem(employeeId);
          toast({
            type: 'success',
            message: 'Employee deleted successfully',
          });
        } catch (err) {
          toast({
            type: 'error',
            message: 'Failed to delete employee',
          });
        }
      }
    },
    [deleteItem, toast]
  );

  const handleImportCSV = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsImporting(true);
      try {
        const result = await importCSV(file);
        toast({
          type: 'success',
          message: `Imported ${result.success} employees successfully${
            result.failed > 0 ? ` (${result.failed} failed)` : ''
          }`,
        });
      } catch (err) {
        toast({
          type: 'error',
          message: 'Failed to import employees',
        });
      } finally {
        setIsImporting(false);
        // Reset file input
        event.target.value = '';
      }
    },
    [importCSV, toast]
  );

  const EXPORT_EXTENSIONS: Record<string, string> = { csv: 'csv', excel: 'xlsx', pdf: 'pdf' };

  const handleExport = useCallback(
    async (format: 'csv' | 'excel' | 'pdf') => {
      setExportMenuOpen(false);
      try {
        const blob = await exportEmployees(format);
        const ext = EXPORT_EXTENSIONS[format];
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `employees-${new Date().toISOString().split('T')[0]}.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast({ type: 'success', message: `Employees exported as ${format.toUpperCase()} successfully` });
      } catch {
        toast({ type: 'error', message: 'Failed to export employees' });
      }
    },
    [exportEmployees, toast]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8" />
            Employees
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage employee records and information
          </p>
        </div>
        {canManageEmployees && (
          <div className="flex gap-2">
            {/* Export dropdown */}
            <div className="relative" ref={exportMenuRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExportMenuOpen((v) => !v)}
                disabled={loading || employees.length === 0}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export
                <ChevronDown className="h-3 w-3" />
              </Button>
              {exportMenuOpen && (
                <div className="absolute right-0 mt-1 w-44 rounded-md border bg-white shadow-lg z-50">
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                    onClick={() => handleExport('csv')}
                  >
                    <Download className="h-4 w-4 text-green-600" />
                    CSV (.csv)
                  </button>
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                    onClick={() => handleExport('excel')}
                  >
                    <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                    Excel (.xlsx)
                  </button>
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                    onClick={() => handleExport('pdf')}
                  >
                    <FileText className="h-4 w-4 text-red-600" />
                    PDF (.pdf)
                  </button>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={isImporting}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              <label className="cursor-pointer">
                Import
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  className="hidden"
                  disabled={isImporting}
                />
              </label>
            </Button>
            <Button
              onClick={handleAddEmployee}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add Employee
            </Button>
          </div>
        )}
      </div>

      {/* Employee List */}
      <EmployeeList
        employees={employees}
        loading={loading}
        {...(canManageEmployees && { onEdit: handleEditEmployee, onDelete: handleDeleteEmployee })}
      />
    </div>
  );
};

export default Employees;
