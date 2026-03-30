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
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

interface LeaveHistoryProps {
  leaves: Leave[];
  loading?: boolean;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return <Badge className="bg-orange-500">Pending</Badge>;
    case 'approved':
      return <Badge className="bg-emerald-500">Approved</Badge>;
    case 'rejected':
      return <Badge className="bg-rose-500">Rejected</Badge>;
    case 'cancelled':
      return <Badge variant="secondary">Cancelled</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'approved':
      return <CheckCircle2 className="h-4 w-4" />;
    case 'rejected':
      return <XCircle className="h-4 w-4" />;
    default:
      return null;
  }
};

export const LeaveHistory: React.FC<LeaveHistoryProps> = ({ leaves, loading }) => {
  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading leave history...</div>;
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From Date</TableHead>
                <TableHead>To Date</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaves.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell>{new Date(leave.from_date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(leave.to_date).toLocaleDateString()}</TableCell>
                  <TableCell>{leave.days_count}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(leave.status)}
                      {getStatusBadge(leave.status)}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {leave.reason || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
