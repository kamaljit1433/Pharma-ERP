import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { EmployeeSearch } from '../performance/EmployeeSearch';
import { Employee } from '../../services/employeeService';

interface TerminationData {
  termination_date: Date;
  reason: string;
  termination_type: 'voluntary' | 'involuntary' | 'retirement' | 'contract_end';
  final_settlement_date?: Date;
}

interface TerminationFormProps {
  onSubmit: (targetEmployeeId: string, data: TerminationData) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
  initialEmployee?: Employee | null;
}

const toDateString = (d: Date) => d.toISOString().split('T')[0];

export const TerminationForm: React.FC<TerminationFormProps> = ({
  onSubmit,
  isLoading = false,
  onCancel,
  initialEmployee = null,
}) => {
  const [targetEmployeeId, setTargetEmployeeId] = useState(initialEmployee?.id ?? '');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(initialEmployee);
  const [formData, setFormData] = useState<TerminationData>({
    termination_date: new Date(),
    reason: '',
    termination_type: 'involuntary',
    final_settlement_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setTargetEmployeeId(initialEmployee?.id ?? '');
    setSelectedEmployee(initialEmployee ?? null);
  }, [initialEmployee?.id]);

  const handleDateChange = (field: 'termination_date' | 'final_settlement_date', value: string) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) return;
    if (field === 'termination_date') {
      setFormData((prev) => ({
        ...prev,
        termination_date: date,
        // Keep final_settlement_date at least 30 days after new termination date
        final_settlement_date:
          !prev.final_settlement_date || prev.final_settlement_date < date
            ? new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000)
            : prev.final_settlement_date,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: date }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!targetEmployeeId) {
      setError('Please search and select an employee to terminate');
      return;
    }
    if (!formData.reason.trim()) {
      setError('Reason for termination is required');
      return;
    }
    if (
      formData.final_settlement_date &&
      formData.final_settlement_date < formData.termination_date
    ) {
      setError('Final settlement date must be on or after termination date');
      return;
    }

    try {
      await onSubmit(targetEmployeeId.trim(), formData);
      setSuccess(true);
      setTargetEmployeeId('');
      setSelectedEmployee(null);
      setFormData({
        termination_date: new Date(),
        reason: '',
        termination_type: 'involuntary',
        final_settlement_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to initiate termination');
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Initiate Employee Termination</CardTitle>
        <CardDescription>
          HR-only operation. This will trigger the offboarding workflow for the specified employee.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 border border-green-200 rounded-md">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span className="text-sm">Termination initiated successfully</span>
            </div>
          )}

          <div className="space-y-2">
            {selectedEmployee ? (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-md text-sm">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">Employee to Terminate</p>
                  <p className="font-medium truncate">
                    {selectedEmployee.first_name} {selectedEmployee.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedEmployee.employee_id}
                    {selectedEmployee.email ? ` · ${selectedEmployee.email}` : ''}
                  </p>
                </div>
              </div>
            ) : (
              <EmployeeSearch
                label="Employee to Terminate"
                placeholder="Search by name or employee ID..."
                onChange={(id, emp) => {
                  setTargetEmployeeId(id);
                  setSelectedEmployee(emp);
                }}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="termination_date">Termination Date</Label>
            <Input
              id="termination_date"
              type="date"
              value={toDateString(formData.termination_date)}
              onChange={(e) => handleDateChange('termination_date', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="termination_type">Termination Type</Label>
            <select
              id="termination_type"
              value={formData.termination_type}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  termination_type: e.target.value as TerminationData['termination_type'],
                }))
              }
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
              required
            >
              <option value="involuntary">Involuntary Termination</option>
              <option value="voluntary">Voluntary Termination</option>
              <option value="retirement">Retirement</option>
              <option value="contract_end">Contract End</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Termination</Label>
            <Textarea
              id="reason"
              placeholder="Provide a detailed reason for termination..."
              value={formData.reason}
              onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="final_settlement_date">Final Settlement Date (Optional)</Label>
            <Input
              id="final_settlement_date"
              type="date"
              value={
                formData.final_settlement_date ? toDateString(formData.final_settlement_date) : ''
              }
              onChange={(e) => handleDateChange('final_settlement_date', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Expected date for final settlement payment</p>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-sm">
            <p className="font-semibold text-amber-800 mb-1">Important</p>
            <p className="text-amber-700">
              This action triggers the full offboarding workflow including asset recovery, exit
              interview, and F&amp;F settlement. Ensure all approvals are in place before proceeding.
            </p>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading} variant="destructive" className="flex-1">
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {isLoading ? 'Processing...' : 'Initiate Termination'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
