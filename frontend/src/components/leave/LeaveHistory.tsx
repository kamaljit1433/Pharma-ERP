import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Leave } from '../../types/leave';
import { useLeaveStore } from '../../store/leaveStore';
import { useToast } from '../../hooks/useToast';
import { Clock, CheckCircle2, XCircle, AlertCircle, Trash2 } from 'lucide-react';

interface LeaveHistoryProps {
  leaves: Leave[];
  loading?: boolean;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return (
        <Badge className="bg-orange-500 hover:bg-orange-600">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    case 'approved':
      return (
        <Badge className="bg-emerald-500 hover:bg-emerald-600">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Approved
        </Badge>
      );
    case 'rejected':
      return (
        <Badge className="bg-rose-500 hover:bg-rose-600">
          <XCircle className="h-3 w-3 mr-1" />
          Rejected
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge variant="secondary">
          <AlertCircle className="h-3 w-3 mr-1" />
          Cancelled
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const LeaveHistory: React.FC<LeaveHistoryProps> = ({ leaves, loading }) => {
  const { cancelLeave, leaveTypes } = useLeaveStore();
  const { toast } = useToast();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const canCancelLeave = (leave: Leave): boolean => {
    // Can cancel if status is pending
    if (leave.status === 'pending') {
      return true;
    }
    // Can cancel if approved and start date is in the future
    if (leave.status === 'approved') {
      const startDate = new Date(leave.from_date);
      return startDate > new Date();
    }
    return false;
  };

  const handleCancelLeave = async (leaveId: string) => {
    setIsLoading(true);
    try {
      await cancelLeave(leaveId);
      toast({
        type: 'success',
        message: 'Leave request cancelled successfully',
      });
      setCancellingId(null);
    } catch (error) {
      toast({
        type: 'error',
        message: (error as Error).message || 'Failed to cancel leave request',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Loading leave history...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Leave History</CardTitle>
          <CardDescription>Your leave requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {leaves.length === 0 ? (
            <p className="text-sm text-muted-foreground">No leave requests found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From Date</TableHead>
                    <TableHead>To Date</TableHead>
                    <TableHead className="text-center">Days</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Rejection Reason</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaves.map((leave) => (
                    <TableRow key={leave.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {formatDate(leave.from_date)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatDate(leave.to_date)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{leave.days_count}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {leave.leave_type_name ||
                            leaveTypes.find((lt) => lt.id === leave.leave_type_id)?.name ||
                            leave.leave_type_id}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(leave.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {leave.reason || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-destructive max-w-xs truncate">
                        {leave.status === 'rejected' ? (leave.approval_notes || '-') : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {canCancelLeave(leave) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCancellingId(leave.id)}
                            className="text-destructive hover:text-destructive"
                            title="Cancel this leave request"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={!!cancellingId} onOpenChange={(open) => !open && setCancellingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Leave Request?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this leave request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Keep Request</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancellingId && handleCancelLeave(cancellingId)}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Cancelling...' : 'Cancel Request'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
