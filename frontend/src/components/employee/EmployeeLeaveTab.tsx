import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Calendar, AlertCircle } from 'lucide-react';
import { leaveService } from '@/services/leaveService';
import { useToast } from '@/hooks/useToast';
import { Leave, LeaveBalance } from '@/types/leave';

interface EmployeeLeaveTabProps {
  employeeId: string;
}

export const EmployeeLeaveTab: React.FC<EmployeeLeaveTabProps> = ({ employeeId }) => {
  const { toast } = useToast();
  const [leaveRequests, setLeaveRequests] = useState<Leave[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        setLoading(true);
        // Note: These endpoints may need to be adjusted based on actual backend API
        // For now, we'll fetch leave balance which is available
        const balances = await leaveService.getLeaveBalance(employeeId);
        setLeaveBalances(balances);
      } catch (error) {
        toast({
          type: 'error',
          message: 'Failed to load leave data',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveData();
  }, [employeeId, toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success text-success-foreground';
      case 'rejected':
        return 'bg-destructive text-destructive-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'cancelled':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Leave Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Leave Information
        </CardTitle>
        <CardDescription>Leave balance and recent requests</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Leave Balances */}
        {leaveBalances.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Leave Balances</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {leaveBalances.map((balance) => (
                <div
                  key={balance.leave_type_id}
                  className="p-3 border rounded-lg"
                >
                  <p className="font-medium text-sm">{balance.leave_type_name}</p>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-muted-foreground">
                      Available: <span className="font-semibold">{balance.available_balance}</span>
                    </span>
                    <span className="text-muted-foreground">
                      Used: <span className="font-semibold">{balance.used_balance}</span>
                    </span>
                  </div>
                  {balance.carry_forward_balance > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Carry Forward: {balance.carry_forward_balance}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {leaveBalances.length === 0 && (
          <p className="text-center text-muted-foreground py-4">No leave data available</p>
        )}
      </CardContent>
    </Card>
  );
};
