import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface TerminationFormProps {
  employeeId: string;
  onSubmit: (data: TerminationData) => Promise<void>;
  isLoading?: boolean;
}

interface TerminationData {
  termination_date: Date;
  reason: string;
  termination_type: 'voluntary' | 'involuntary' | 'retirement' | 'contract_end';
  final_settlement_date?: Date;
}

export const TerminationForm: React.FC<TerminationFormProps> = ({
  employeeId,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<TerminationData>({
    termination_date: new Date(),
    reason: '',
    termination_type: 'involuntary',
    final_settlement_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleDateChange = (field: keyof TerminationData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: new Date(value),
    }));
  };

  const handleReasonChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      reason: value,
    }));
  };

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      termination_type: value as TerminationData['termination_type'],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate required fields
    if (!formData.reason.trim()) {
      setError('Reason for termination is required');
      return;
    }

    if (formData.final_settlement_date && formData.final_settlement_date < formData.termination_date) {
      setError('Final settlement date must be on or after termination date');
      return;
    }

    try {
      await onSubmit(formData);
      setSuccess(true);
      setFormData({
        termination_date: new Date(),
        reason: '',
        termination_type: 'involuntary',
        final_settlement_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit termination');
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Initiate Employee Termination</CardTitle>
        <CardDescription>
          This action will initiate the employee termination process and trigger offboarding workflows.
          This is an HR-only operation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-success/10 text-success rounded-md">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm">Termination initiated successfully</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="termination_date">Termination Date</Label>
            <Input
              id="termination_date"
              type="date"
              value={formData.termination_date.toISOString().split('T')[0]}
              onChange={(e) => handleDateChange('termination_date', e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              The effective date of termination
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="termination_type">Termination Type</Label>
            <select
              id="termination_type"
              value={formData.termination_type}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              required
            >
              <option value="involuntary">Involuntary Termination</option>
              <option value="voluntary">Voluntary Termination</option>
              <option value="retirement">Retirement</option>
              <option value="contract_end">Contract End</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Select the type of termination
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Termination</Label>
            <Textarea
              id="reason"
              placeholder="Please provide the reason for termination..."
              value={formData.reason}
              onChange={(e) => handleReasonChange(e.target.value)}
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground">
              Provide detailed reason for termination (required)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="final_settlement_date">Final Settlement Date (Optional)</Label>
            <Input
              id="final_settlement_date"
              type="date"
              value={formData.final_settlement_date?.toISOString().split('T')[0] || ''}
              onChange={(e) => handleDateChange('final_settlement_date', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Expected date for final settlement payment
            </p>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Processing...' : 'Initiate Termination'}
            </Button>
            <Button type="button" variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>

          <div className="p-3 bg-muted rounded-md text-sm">
            <p className="font-semibold mb-2">Termination Process</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Employee status will be updated to "Terminated"</li>
              <li>Offboarding workflow will be automatically triggered</li>
              <li>Exit interview will be scheduled</li>
              <li>Asset recovery checklist will be generated</li>
              <li>Full & Final settlement will be calculated</li>
              <li>System access will be revoked on termination date</li>
            </ul>
          </div>

          <div className="p-3 bg-warning/10 border border-warning rounded-md text-sm">
            <p className="font-semibold text-warning mb-2">⚠️ Important</p>
            <p className="text-muted-foreground">
              This is a critical HR operation. Ensure all necessary approvals and documentation are in place
              before initiating termination. This action cannot be easily reversed.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
