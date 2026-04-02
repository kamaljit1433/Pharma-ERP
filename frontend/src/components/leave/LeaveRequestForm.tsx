import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { useLeaveStore } from '../../store/leaveStore';
import { useToast } from '../../hooks/useToast';
import { CalendarDays, AlertCircle } from 'lucide-react';

interface LeaveRequestFormProps {
  employeeId: string;
  onSuccess?: () => void;
}

export const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({
  employeeId,
  onSuccess,
}) => {
  const { leaveTypes, leaveBalances, fetchLeaveTypes, fetchLeaveBalance, applyLeave } =
    useLeaveStore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [daysCount, setDaysCount] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch leave types and balances on mount
  useEffect(() => {
    fetchLeaveTypes();
    fetchLeaveBalance(employeeId);
  }, [employeeId, fetchLeaveTypes, fetchLeaveBalance]);

  // Calculate days count when dates change
  useEffect(() => {
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      const days = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      setDaysCount(Math.max(0, days));
    } else {
      setDaysCount(0);
    }
  }, [fromDate, toDate]);

  // Get selected leave type details
  const selectedType = leaveTypes.find((lt) => lt.id === selectedLeaveType);
  const selectedBalance = leaveBalances.find(
    (lb) => lb.leave_type_id === selectedLeaveType
  );

  // Check if sufficient balance
  const hasSufficientBalance =
    selectedBalance && selectedBalance.available_balance >= daysCount;

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedLeaveType) {
      newErrors.leave_type_id = 'Leave type is required';
    }
    if (!fromDate) {
      newErrors.from_date = 'From date is required';
    }
    if (!toDate) {
      newErrors.to_date = 'To date is required';
    }
    if (fromDate && toDate) {
      if (new Date(toDate) < new Date(fromDate)) {
        newErrors.to_date = 'End date must be after or equal to start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Validate balance
    if (!hasSufficientBalance && daysCount > 0) {
      toast({
        type: 'error',
        message: `Insufficient leave balance. Available: ${selectedBalance?.available_balance || 0} days, Requested: ${daysCount} days`,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await applyLeave({
        employee_id: employeeId,
        leave_type_id: selectedLeaveType,
        from_date: fromDate,
        to_date: toDate,
        reason: reason || undefined,
      });

      toast({
        type: 'success',
        message: 'Leave request submitted successfully',
      });

      // Reset form
      setSelectedLeaveType('');
      setFromDate('');
      setToDate('');
      setReason('');
      setDaysCount(0);
      setErrors({});

      // Refresh leave balance
      await fetchLeaveBalance(employeeId);

      onSuccess?.();
    } catch (error) {
      toast({
        type: 'error',
        message: (error as Error).message || 'Failed to submit leave request',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Request Leave
        </CardTitle>
        <CardDescription>Submit a new leave request for approval</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Leave Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Leave Type *</label>
            <Select
              value={selectedLeaveType}
              onValueChange={(value) => {
                setSelectedLeaveType(value);
                setErrors({ ...errors, leave_type_id: '' });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.leave_type_id && (
              <p className="text-sm text-destructive">{errors.leave_type_id}</p>
            )}
          </div>

          {/* Leave Balance Info */}
          {selectedBalance && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Available balance: <strong>{selectedBalance.available_balance}</strong> days
                {selectedBalance.carry_forward_balance > 0 && (
                  <>
                    {' '}
                    (Carry forward: {selectedBalance.carry_forward_balance} days)
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* From Date */}
          <div className="space-y-2">
            <label htmlFor="from-date" className="text-sm font-medium">From Date *</label>
            <Input
              id="from-date"
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setErrors({ ...errors, from_date: '' });
              }}
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.from_date && (
              <p className="text-sm text-destructive">{errors.from_date}</p>
            )}
            <p className="text-xs text-muted-foreground">Start date of your leave</p>
          </div>

          {/* To Date */}
          <div className="space-y-2">
            <label htmlFor="to-date" className="text-sm font-medium">To Date *</label>
            <Input
              id="to-date"
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setErrors({ ...errors, to_date: '' });
              }}
              min={fromDate || new Date().toISOString().split('T')[0]}
            />
            {errors.to_date && (
              <p className="text-sm text-destructive">{errors.to_date}</p>
            )}
            <p className="text-xs text-muted-foreground">End date of your leave</p>
          </div>

          {/* Days Count Display */}
          {daysCount > 0 && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">
                Total Days: <span className="text-lg">{daysCount}</span>
              </p>
              {!hasSufficientBalance && selectedBalance && (
                <p className="text-sm text-destructive mt-1">
                  ⚠️ Insufficient balance. You need {daysCount - selectedBalance.available_balance} more days.
                </p>
              )}
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <label htmlFor="reason" className="text-sm font-medium">Reason (Optional)</label>
            <Textarea
              id="reason"
              placeholder="Enter reason for leave request"
              className="resize-none"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Provide additional context for your leave request</p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !hasSufficientBalance}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Leave Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
