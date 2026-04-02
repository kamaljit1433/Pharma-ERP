import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Leave } from '../../types/leave';
import { Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

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
                      <span className="text-sm">{leave.leave_type_id}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(leave.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {leave.reason || '-'}
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
