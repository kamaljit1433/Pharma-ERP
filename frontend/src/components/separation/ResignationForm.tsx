import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface ResignationData {
  resignation_date: Date;
  last_working_day: Date;
  reason?: string;
}

interface ResignationFormProps {
  employeeId: string;
  onSubmit: (data: ResignationData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const toDateString = (d: Date) => {
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

export const ResignationForm: React.FC<ResignationFormProps> = ({
  employeeId,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<ResignationData>({
    resignation_date: new Date(),
    last_working_day: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    reason: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleDateChange = (field: 'resignation_date' | 'last_working_day', value: string) => {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      setFormData((prev) => ({ ...prev, [field]: date }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (formData.last_working_day <= formData.resignation_date) {
      setError('Last working day must be after the resignation date');
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
    } catch (err: any) {
      setError(err?.message || 'Failed to submit resignation');
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="flex flex-col items-center py-12 gap-4 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
          <p className="text-lg font-semibold">Resignation Submitted</p>
          <p className="text-muted-foreground">
            Your resignation has been submitted and is under HR review.
          </p>
          <Button variant="outline" onClick={() => setSuccess(false)}>
            Submit Another
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Submit Resignation</CardTitle>
        <CardDescription>
          This will trigger the offboarding process. Employee ID: {employeeId}
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

          <div className="space-y-2">
            <Label htmlFor="resignation_date">Resignation Date</Label>
            <Input
              id="resignation_date"
              type="date"
              value={toDateString(formData.resignation_date)}
              onChange={(e) => handleDateChange('resignation_date', e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">The date you are submitting your resignation</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_working_day">Last Working Day</Label>
            <Input
              id="last_working_day"
              type="date"
              value={toDateString(formData.last_working_day)}
              onChange={(e) => handleDateChange('last_working_day', e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">Your final day of work (end of notice period)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Resignation (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="Please share your reason for leaving..."
              value={formData.reason || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
              rows={4}
            />
          </div>

          <div className="p-3 bg-muted rounded-md text-sm">
            <p className="font-semibold mb-1">What happens next?</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Your resignation will be reviewed by HR</li>
              <li>An exit interview will be scheduled</li>
              <li>Asset recovery checklist will be generated</li>
              <li>Full &amp; Final settlement will be calculated</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {isLoading ? 'Submitting...' : 'Submit Resignation'}
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
