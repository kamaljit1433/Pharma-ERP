/**
 * Regularization Request Component
 * Allows employees to request attendance regularization
 */

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface RegularizationRequestProps {
  attendanceId: string;
  employeeId: string;
  date: string;
  onSuccess?: (request: any) => void;
  onError?: (error: string) => void;
}

export const RegularizationRequest: React.FC<RegularizationRequestProps> = ({
  attendanceId,
  employeeId,
  date,
  onSuccess,
  onError,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError(null);
      setIsLoading(true);

      if (!reason.trim()) {
        setError('Please provide a reason for regularization');
        return;
      }

      const response = await fetch('/api/v1/attendance/regularization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attendanceId,
          employeeId,
          reason: reason.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to submit request');
      }

      const data = await response.json();
      setSuccess(true);
      onSuccess?.(data.data);

      // Close dialog after 2 seconds
      setTimeout(() => {
        setIsOpen(false);
        resetForm();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit regularization request');
      onError?.(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setReason('');
    setError(null);
    setSuccess(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        Request Regularization
      </Button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Attendance Regularization</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date Display */}
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Date</div>
              <div className="font-semibold">{date}</div>
            </div>

            {/* Reason Textarea */}
            <div className="space-y-2">
              <label htmlFor="reason" className="text-sm font-medium">
                Reason for Regularization
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please explain why you need attendance regularization..."
                className="w-full min-h-24 p-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isLoading || success}
              />
              <div className="text-xs text-muted-foreground">
                {reason.length}/500 characters
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex gap-2 p-3 bg-success/10 border border-success/20 rounded-md">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <p className="text-sm text-success">Request submitted successfully!</p>
              </div>
            )}

            {/* Status Badge */}
            {success && (
              <div className="flex justify-center">
                <Badge className="bg-info text-info-foreground">Status: Pending</Badge>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={isLoading || success || !reason.trim()}
                className="flex-1"
              >
                {isLoading ? 'Submitting...' : 'Submit Request'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
