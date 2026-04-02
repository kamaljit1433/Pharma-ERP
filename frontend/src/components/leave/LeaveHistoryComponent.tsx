import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { useLeaveStore } from '../../store/leaveStore';
import { useToast } from '../../hooks/useToast';
import { leaveService } from '../../services/leaveService';
import { History, Trash2 } from 'lucide-react';

interface LeaveHistoryComponentProps {
  employeeId: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

export const LeaveHistoryComponent: React.FC<LeaveHistoryComponentProps> = ({
  employeeId,
}) => {
  const { leaves, leaveTypes, fetchLeaveBalance } = useLeaveStore();
  const { toast } = useToast();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter leaves for this employee
  const employeeLeaves = leaves.filter((leave) => leave.employee_id === employeeId);

  const handleCancelLeave = async (leaveId: string) => {
    setIsLoading(true);
    try {
      await leaveService.cancelLeave(leaveId);
      toast({
        type: 'success',
        message: 'Leave request cancelled successfully',
      });
      setCancellingId(null);
      // Refresh leave balance
      await fetchLeaveBalance(employeeId);
    } catch (error) {
      toast({
        type: 'error',
        message: (error as Error).message || 'Failed to cancel leave request',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getLeaveTypeName = (leaveTypeId: string): string => {
    return leaveTypes.find((lt) => lt.id === leaveTypeId)?.name || 'Unknown';
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Leave History
        </CardTitle>
        <CardDescription>View all your leave requests and their status</CardDescription>
      </CardHeader>
      <CardContent>
        {employeeLeaves.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No leave requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>From Date</TableHead>
                  <TableHead>To Date</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeLeaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell className="font-medium">
                      {getLeaveTypeName(leave.leave_type_id)}
                    </TableCell>
                    <TableCell>{formatDate(leave.from_date)}</TableCell>
                    <TableCell>{formatDate(leave.to_date)}</TableCell>
                    <TableCell>{leave.days_count}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[leave.status] || ''}>
                        {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {leave.reason || '-'}
                    </TableCell>
                    <TableCell>
                      {leave.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCancellingId(leave.id)}
                          className="text-destructive hover:text-destructive"
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

        {/* Cancel Confirmation Dialog */}
        <AlertDialog open={!!cancellingId} onOpenChange={(open) => !open && setCancellingId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Leave Request?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this leave request? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3">
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
      </CardContent>
    </Card>
  );
};
