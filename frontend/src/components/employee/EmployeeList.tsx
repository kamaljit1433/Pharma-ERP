import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Pencil, Trash2, Search, ChevronLeft, ChevronRight, Archive } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuthStore } from '@/store/authStore';
import { canEditEmployees, canDeleteEmployees } from '@/utils/permissions';

export interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department_id?: string;
  designation_id?: string;
  employment_type: 'permanent' | 'contract' | 'temporary' | 'intern';
  status: 'active' | 'on_leave' | 'suspended' | 'resigned' | 'terminated';
  date_of_joining: string;
  archived_at?: string;
  archive_reason?: string;
}

interface EmployeeListProps {
  employees: Employee[];
  loading?: boolean;
  onEdit?: (employeeId: string) => void;
  onDelete?: (employeeId: string) => void;
  onAdd?: () => void;
  onFilterChange?: (filters: EmployeeFilters) => void;
  includeArchived?: boolean;
  onIncludeArchivedChange?: (value: boolean) => void;
}

export interface EmployeeFilters {
  search?: string;
  status?: string;
  employment_type?: string;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  loading = false,
  onEdit,
  onDelete,
  onFilterChange,
  includeArchived = false,
  onIncludeArchivedChange,
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterEmploymentType, setFilterEmploymentType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'id' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const itemsPerPage = 10;

  // Check permissions
  const userRole = user?.role;
  const canEdit = userRole ? canEditEmployees(userRole) : false;
  const canDelete = userRole ? canDeleteEmployees(userRole) : false;

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Notify parent of filter changes
  useEffect(() => {
    const filters: EmployeeFilters = { search: debouncedSearchTerm };
    if (filterStatus !== 'all') filters.status = filterStatus;
    if (filterEmploymentType !== 'all') filters.employment_type = filterEmploymentType;
    onFilterChange?.(filters);
  }, [debouncedSearchTerm, filterStatus, filterEmploymentType, onFilterChange]);

  // Filter and sort employees
  const filteredAndSortedEmployees = useMemo(() => {
    let filtered = employees.filter((emp) => {
      const matchesSearch =
        !debouncedSearchTerm ||
        emp.first_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        emp.last_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        emp.employee_id.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === 'all' || emp.status === filterStatus;

      const matchesEmploymentType =
        filterEmploymentType === 'all' || emp.employment_type === filterEmploymentType;

      return matchesSearch && matchesStatus && matchesEmploymentType;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal: string | Date;
      let bVal: string | Date;

      switch (sortBy) {
        case 'name':
          aVal = `${a.first_name} ${a.last_name}`;
          bVal = `${b.first_name} ${b.last_name}`;
          break;
        case 'id':
          aVal = a.employee_id;
          bVal = b.employee_id;
          break;
        case 'date':
          aVal = new Date(a.date_of_joining);
          bVal = new Date(b.date_of_joining);
          break;
        default:
          aVal = a.first_name;
          bVal = b.first_name;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [employees, debouncedSearchTerm, filterStatus, filterEmploymentType, sortBy, sortOrder]);

  // Paginate
  const totalPages = Math.ceil(filteredAndSortedEmployees.length / itemsPerPage);
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedEmployees.slice(start, start + itemsPerPage);
  }, [filteredAndSortedEmployees, currentPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterStatus, filterEmploymentType]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'on_leave':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'resigned':
      case 'terminated':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getEmploymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      permanent: 'Permanent',
      contract: 'Contract',
      temporary: 'Temporary',
      intern: 'Intern',
    };
    return labels[type] || type;
  };

  const handleSort = (column: 'name' | 'id' | 'date') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const SortIndicator = ({ column }: { column: 'name' | 'id' | 'date' }) => {
    if (sortBy !== column) return null;
    return <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                aria-label="Search employees"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-sm"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="on_leave">On Leave</option>
              <option value="suspended">Suspended</option>
              <option value="resigned">Resigned</option>
              <option value="terminated">Terminated</option>
            </select>
            <select
              value={filterEmploymentType}
              onChange={(e) => setFilterEmploymentType(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-sm"
              aria-label="Filter by employment type"
            >
              <option value="all">All Types</option>
              <option value="permanent">Permanent</option>
              <option value="contract">Contract</option>
              <option value="temporary">Temporary</option>
              <option value="intern">Intern</option>
            </select>
            {onIncludeArchivedChange && (
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={includeArchived}
                  onChange={(e) => onIncludeArchivedChange(e.target.checked)}
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                <Archive className="h-4 w-4 text-muted-foreground" />
                Show archived
              </label>
            )}
          </div>

          {/* Results count */}
          <div className="text-sm text-muted-foreground">
            Showing {paginatedEmployees.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredAndSortedEmployees.length)} of{' '}
            {filteredAndSortedEmployees.length} employees
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/80 text-muted-foreground"
                    onClick={() => handleSort('id')}
                  >
                    Employee ID <SortIndicator column="id" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/80 text-muted-foreground"
                    onClick={() => handleSort('name')}
                  >
                    Name <SortIndicator column="name" />
                  </TableHead>
                  <TableHead className="text-muted-foreground">Email</TableHead>
                  <TableHead className="text-muted-foreground">Employment Type</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/80 text-muted-foreground"
                    onClick={() => handleSort('date')}
                  >
                    Joining Date <SortIndicator column="date" />
                  </TableHead>
                  <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Loading employees...
                    </TableCell>
                  </TableRow>
                ) : paginatedEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {filteredAndSortedEmployees.length === 0 && employees.length > 0
                        ? 'No employees match your filters'
                        : 'No employees found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedEmployees.map((employee) => (
                    <TableRow
                      key={employee.id}
                      className={`hover:bg-muted/50 cursor-pointer${employee.archived_at ? ' opacity-60' : ''}`}
                      onClick={() => navigate(`/employees/${employee.id}`)}
                    >
                      <TableCell className="font-mono text-sm">{employee.employee_id}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {employee.first_name} {employee.last_name}
                          {employee.archived_at && (
                            <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-xs gap-1">
                              <Archive className="h-3 w-3" />
                              Archived
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{employee.email}</TableCell>
                      <TableCell className="text-sm">
                        {getEmploymentTypeLabel(employee.employment_type)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(employee.status)}>
                          {employee.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(employee.date_of_joining).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          {canEdit && onEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(employee.id)}
                              className="h-8 w-8 p-0"
                              aria-label={`Edit ${employee.first_name} ${employee.last_name}`}
                              title="Edit employee"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && onDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteTarget(employee)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              aria-label={`Delete ${employee.first_name} ${employee.last_name}`}
                              title="Delete employee"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold">
                {deleteTarget?.first_name} {deleteTarget?.last_name}
              </span>{' '}
              ({deleteTarget?.employee_id})? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget && onDelete) {
                  onDelete(deleteTarget.id);
                }
                setDeleteTarget(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
