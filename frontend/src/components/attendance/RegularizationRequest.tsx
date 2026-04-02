/**
 * Regularization Request Component
 * Allows employees to request attendance regularization
 */

import React, { useState } from 'react';
import { useAttendanceStore } from '../../store/attendanceStore';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface RegularizationRequestProps {
  employeeId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const RegularizationRequest: React.FC<RegularizationRequestProps> = ({
  employeeId,
  onSuccess,
  onError,
}) => {
  const [date, setDate] = useState('');
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { requestRegularization } = useAttendanceStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError(null);
      setIsLoading(true);

      if (!date) {
        setError('Please select a date');
        return;
      }

      if (!reason.trim()) {
        setError('Please provide a reason for regularization');
        return;
      }

      await requestRegularization({
        employee_id: employeeId,
        date,
        check_in_time: checkInTime || undefined,
        check_out_time: checkOutTime || undefined,
        reason: reason.trim(),
      });

      setSuccess(true);
      onSuccess?.();

      // Reset form after 2 seconds
      setTimeout(() => {
        resetForm();
      }, 2000);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to submit regularization request';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setDate('');
    setCheckInTime('');
    setCheckOutTime('');
    setReason('');
    setError(null);
    setSuccess(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Attendance Regularization</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date Field */}
          <div className="space-y-2">
            <label htmlFor="date" className="text-sm font-medium">
              Date <span className="text-destructive">*</span>
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isLoading || success}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Check-in Time Field */}
          <div className="space-y-2">
            <label htmlFor="checkInTime" className="text-sm font-medium">
              Check-in Time (Optional)
            </label>
            <input
              id="checkInTime"
              type="time"
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
              disabled={isLoading || success}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Check-out Time Field */}
          <div className="space-y-2">
            <label htmlFor="checkOutTime" className="text-sm font-medium">
              Check-out Time (Optional)
            </label>
            <input
              id="checkOutTime"
              type="time"
              value={checkOutTime}
              onChange={(e) => setCheckOutTime(e.target.value)}
              disabled={isLoading || success}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Reason Textarea */}
          <div className="space-y-2">
            <label htmlFor="reason" className="text-sm font-medium">
              Reason for Regularization <span className="text-destructive">*</span>
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain why you need attendance regularization..."
              disabled={isLoading || success}
              className="w-full min-h-24 p-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
              disabled={isLoading || success || !date || !reason.trim()}
              className="flex-1"
            >
              {isLoading ? 'Submitting...' : 'Submit Request'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={isLoading}
            >
              Clear
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
