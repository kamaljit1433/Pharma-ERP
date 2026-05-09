import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Edit, PlusCircle } from 'lucide-react';
import { payrollService } from '@/services/payrollService';
import { SalaryStructure } from '@/types/payroll';

interface SalaryStructureListProps {
  onSelect: (row: SalaryStructure) => void;
}

export const SalaryStructureList: React.FC<SalaryStructureListProps> = ({ onSelect }) => {
  const [rows, setRows] = useState<SalaryStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    payrollService
      .getAllSalaryStructures()
      .then((res) => {
        const data = Array.isArray(res) ? res : res?.data ?? [];
        setRows(data);
      })
      .catch((err) => setError(err.message ?? 'Failed to load salary structures'))
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (val?: number) =>
    val != null ? `₹${Number(val).toLocaleString('en-IN')}` : '—';

  const grossSalary = (row: SalaryStructure) => {
    if (!row.base_salary) return null;
    return (
      Number(row.base_salary ?? 0) +
      Number(row.hra ?? 0) +
      Number(row.dearness_allowance ?? 0) +
      Number(row.other_allowances ?? 0)
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Salary Structures</CardTitle>
        <CardDescription>
          Active salary configuration for each employee. Click a name to edit.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            Loading…
          </div>
        ) : error ? (
          <div className="text-sm text-red-500 py-4">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead className="text-right">Base</TableHead>
                  <TableHead className="text-right">HRA</TableHead>
                  <TableHead className="text-right">DA</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">PF %</TableHead>
                  <TableHead className="text-right">ESI %</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const configured = !!row.structure_id;
                  return (
                    <TableRow key={row.employee_uuid ?? row.employee_code} className="hover:bg-muted/50">
                      <TableCell>
                        <button
                          onClick={() => onSelect(row)}
                          className="font-medium text-primary hover:underline text-left"
                        >
                          {row.employee_name}
                        </button>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {row.employee_code}
                      </TableCell>
                      <TableCell className="capitalize text-sm">
                        {row.salary_mode ?? '—'}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {formatCurrency(row.base_salary)}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {formatCurrency(row.hra)}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {formatCurrency(row.dearness_allowance)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-sm">
                        {grossSalary(row) != null ? formatCurrency(grossSalary(row)!) : '—'}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {row.pf_contribution_rate != null ? `${row.pf_contribution_rate}%` : '—'}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {row.esi_contribution_rate != null ? `${row.esi_contribution_rate}%` : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={configured ? 'default' : 'outline'}>
                          {configured ? 'Configured' : 'Not set'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSelect(row)}
                          title={configured ? 'Edit salary structure' : 'Configure salary structure'}
                        >
                          {configured ? (
                            <Edit className="h-4 w-4" />
                          ) : (
                            <PlusCircle className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                      No active employees found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
