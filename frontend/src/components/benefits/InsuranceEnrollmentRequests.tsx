import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { benefitsService } from '../../services/benefitsService';
import { CheckCircle2, XCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react';

interface PendingEnrollment {
  id: string;
  employee_name: string;
  emp_code: string;
  plan_name: string;
  coverage_type: string;
  premium_amount: number;
  enrollment_date: string;
  created_at: string;
}

export const InsuranceEnrollmentRequests: React.FC = () => {
  const [requests, setRequests] = useState<PendingEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await benefitsService.getPendingEnrollmentRequests();
      setRequests(response.data || []);
    } catch (error) {
      console.error('Failed to fetch enrollment requests:', error);
      setMessage({ type: 'error', text: 'Failed to load enrollment requests' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setProcessing(id);
      await benefitsService.approveEnrollmentRequest(id);
      setMessage({ type: 'success', text: 'Enrollment approved successfully' });
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to approve enrollment' });
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setProcessing(id);
      await benefitsService.rejectEnrollmentRequest(id);
      setMessage({ type: 'success', text: 'Enrollment request rejected' });
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to reject enrollment' });
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading enrollment requests...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Pending Enrollment Requests</h3>
          {requests.length > 0 && (
            <Badge className="bg-yellow-100 text-yellow-800">
              <Clock className="w-3 h-3 mr-1" />
              {requests.length}
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={fetchRequests} className="gap-1 text-muted-foreground">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {message && (
        <Card className={message.type === 'success' ? 'border-green-400' : 'border-destructive'}>
          <CardContent className="pt-4 pb-4 flex gap-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            )}
            <p className="text-sm">{message.text}</p>
          </CardContent>
        </Card>
      )}

      {requests.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">No pending enrollment requests</p>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{req.employee_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{req.emp_code}</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Plan</p>
                    <p className="font-medium">{req.plan_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Coverage</p>
                    <p className="font-medium">{req.coverage_type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Premium</p>
                    <p className="font-medium">₹{req.premium_amount.toLocaleString()}/mo</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Requested on {new Date(req.created_at).toLocaleDateString()}
                </p>
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(req.id)}
                    disabled={processing === req.id}
                    className="gap-2 flex-1"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReject(req.id)}
                    disabled={processing === req.id}
                    className="gap-2 flex-1"
                  >
                    <XCircle className="w-4 h-4" /> Decline
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
