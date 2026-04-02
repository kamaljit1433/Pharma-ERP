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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { useLeaveStore } from '../../store/leaveStore';
import { useToast } from '../../hooks/useToast';
import { leaveService } from '../../services/leaveService';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

export const LeaveApprovalPanel: React.FC = () => {
  const { leaves, leaveTypes, fetchLeaveBalance } = useLeaveStore();
  const { toast } = useToast();
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [selectedLeaveId, setSelectedLeaveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  // Filter pending leaves
  const pendingLeaves = leaves.filter((leave) => leave.status === 'pending');

  const handleApprove = async (leaveId: string) => {
    setIsLoading(true);
    try {
      await leaveService.approveLeave(leaveId);
      toast({
        type: 'success',
        message: 'Leave request approved successfully',
      });
      setSelectedLeaveId(null);
      setActionType(null);
    } catch (error) {
      toast({
        type: 'error',
        message: (error as Error).message || 'Failed to approve leave request',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (leaveId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        type: 'error',
        message: 'Please provide a reason for rejection',
      });
      return;
    }

    setIsLoading(true);
    try {
      await leaveService.rejectLeave(leaveId, rejectionReason);
      toast({
        type: 'success',
        message: 'Leave request rejected successfully',
      });
      setSelectedLeaveId(null);
      setActionType(null);
      setRejectionReason('');
    } catch (error) {
      toast({
        type: 'error',
        message: (error as Error).message || 'Failed to reject leave request',
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
          <Clock className="h-5 w-5" />
          Leave Approvals
        </CardTitle>
        <CardDescription>
          Review and approve/reject pending leave requests from your team
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pendingLeaves.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No pending leave requests</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>From Date</TableHead>
                  <TableHead>To Date</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingLeaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell className="font-medium">
                      {leave.employee_id}
                    </TableCell>
                    <TableCell>
                      {getLeaveTypeName(leave.leave_type_id)}
                    </TableCell>
                    <TableCell>{formatDate(leave.from_date)}</TableCell>
                    <TableCell>{formatDate(leave.to_date)}</TableCell>
                    <TableCell>{leave.days_count}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {leave.reason || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {/* Approve Button */}
                        <Dialog
                          open={selectedLeaveId === leave.id && actionType === 'approve'}
                          onOpenChange={(open) => {
                            if (!open) {
                              setSelectedLeaveId(null);
                              setActionType(null);
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => {
                                setSelectedLeaveId(leave.id);
                                setActionType('approve');
                              }}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Approve Leave Request?</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to approve this leave request?
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="bg-muted p-3 rounded-md space-y-2">
                                <p className="text-sm">
                                  <strong>Leave Type:</strong> {getLeaveTypeName(leave.leave_type_id)}
                                </p>
                                <p className="text-sm">
                                  <strong>Duration:</strong> {formatDate(leave.from_date)} to{' '}
                                  {formatDate(leave.to_date)} ({leave.days_count} days)
                                </p>
                                {leave.reason && (
                                  <p className="text-sm">
                                    <strong>Reason:</strong> {leave.reason}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-3">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedLeaveId(null);
                                    setActionType(null);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => handleApprove(leave.id)}
                                  disabled={isLoading}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {isLoading ? 'Approving...' : 'Approve'}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Reject Button */}
                        <Dialog
                          open={selectedLeaveId === leave.id && actionType === 'reject'}
                          onOpenChange={(open) => {
                            if (!open) {
                              setSelectedLeaveId(null);
                              setActionType(null);
                              setRejectionReason('');
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => {
                                setSelectedLeaveId(leave.id);
                                setActionType('reject');
                              }}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reject Leave Request?</DialogTitle>
                              <DialogDescription>
                                Please provide a reason for rejecting this leave request
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="bg-muted p-3 rounded-md space-y-2">
                                <p className="text-sm">
                                  <strong>Leave Type:</strong> {getLeaveTypeName(leave.leave_type_id)}
                                </p>
                                <p className="text-sm">
                                  <strong>Duration:</strong> {formatDate(leave.from_date)} to{' '}
                                  {formatDate(leave.to_date)} ({leave.days_count} days)
                                </p>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Rejection Reason *</label>
                                <Textarea
                                  placeholder="Enter reason for rejection"
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  rows={4}
                                  className="resize-none"
                                />
                              </div>
                              <div className="flex gap-3">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedLeaveId(null);
                                    setActionType(null);
                                    setRejectionReason('');
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => handleReject(leave.id)}
                                  disabled={isLoading || !rejectionReason.trim()}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  {isLoading ? 'Rejecting...' : 'Reject'}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
