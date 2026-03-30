import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useLeaveStore } from '../../store/leaveStore';
import { Leave } from '../../types/leave';
import { CheckCircle2, XCircle } from 'lucide-react';

interface LeaveApprovalProps {
  leave: Leave;
  onApprovalComplete?: () => void;
}

export const LeaveApproval: React.FC<LeaveApprovalProps> = ({
  leave,
  onApprovalComplete,
}) => {
  const { approveLeave, rejectLeave } = useLeaveStore();
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = async () => {
    await approveLeave(leave.id);
    setShowApproveDialog(false);
    onApprovalComplete?.();
  };

  const handleReject = async () => {
    await rejectLeave(leave.id, rejectReason);
    setShowRejectDialog(false);
    setRejectReason('');
    onApprovalComplete?.();
  };

  if (leave.status !== 'pending') {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Leave Approval</CardTitle>
          <CardDescription>Review and approve/reject leave request</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">From Date</p>
              <p className="font-medium">
                {new Date(leave.from_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">To Date</p>
              <p className="font-medium">
                {new Date(leave.to_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Days</p>
              <p className="font-medium">{leave.days_count}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className="bg-orange-500">Pending</Badge>
            </div>
          </div>

          {leave.reason && (
            <div>
              <p className="text-sm text-muted-foreground">Reason</p>
              <p className="text-sm">{leave.reason}</p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => setShowApproveDialog(true)}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              onClick={() => setShowRejectDialog(true)}
              variant="destructive"
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Leave Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this leave request?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} className="bg-emerald-500">
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Leave Request</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejection
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Reason for rejection"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="my-4"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject} className="bg-rose-500">
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
