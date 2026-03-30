import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface ResignationFormProps {
  employeeId: string;
  onSubmit: (data: ResignationData) => Promise<void>;
  isLoading?: boolean;
}

interface ResignationData {
  resignation_date: Date;
  last_working_day: Date;
  reason?: string;
}

export const ResignationForm: React.FC<ResignationFormProps> = ({
  employeeId,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<ResignationData>({
    resignation_date: new Date(),
    last_working_day: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    reason: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleDateChange = (field: keyof ResignationData, value: string) => {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      setFormData((prev) => ({
        ...prev,
        [field]: date,
      }));
    }
  };

  const handleReasonChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      reason: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate dates
    if (formData.last_working_day <= formData.resignation_date) {
      setError('Last working day must be after resignation date');
      return;
    }

    try {
      await onSubmit(formData);
      setSuccess(true);
      setFormData({
        resignation_date: new Date(),
        last_working_day: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        reason: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit resignation');
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Submit Resignation</CardTitle>
        <CardDescription>
          Please provide your resignation details. This will trigger the offboarding process.
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
              <span className="text-sm">Resignation submitted successfully</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="resignation_date">Resignation Date</Label>
            <Input
              id="resignation_date"
              type="date"
              value={isNaN(formData.resignation_date.getTime()) ? '' : formData.resignation_date.toISOString().split('T')[0]}
              onChange={(e) => handleDateChange('resignation_date', e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              The date you are submitting your resignation
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_working_day">Last Working Day</Label>
            <Input
              id="last_working_day"
              type="date"
              value={isNaN(formData.last_working_day.getTime()) ? '' : formData.last_working_day.toISOString().split('T')[0]}
              onChange={(e) => handleDateChange('last_working_day', e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Your final day of work (notice period end date)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Resignation (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="Please share your reason for leaving..."
              value={formData.reason || ''}
              onChange={(e) => handleReasonChange(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Submitting...' : 'Submit Resignation'}
            </Button>
            <Button type="button" variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>

          <div className="p-3 bg-muted rounded-md text-sm">
            <p className="font-semibold mb-2">What happens next?</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Your resignation will be reviewed by HR</li>
              <li>An exit interview will be scheduled</li>
              <li>Asset recovery checklist will be generated</li>
              <li>Full & Final settlement will be calculated</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
