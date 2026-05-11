import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { benefitsService } from '../../services/benefitsService';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface ReimbursementClaim {
  id: string;
  employee_id: string;
  claim_type: string;
  amount: number;
  description: string;
  status: string;
  claim_date: string;
  created_at: string;
}

interface ReimbursementApprovalProps {
  approverId: string;
}

export const ReimbursementApproval: React.FC<ReimbursementApprovalProps> = ({ approverId }) => {
  const [claims, setClaims] = useState<ReimbursementClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchPendingClaims();
  }, []);

  const fetchPendingClaims = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch claims for the manager's team
      // For now, we'll fetch all pending claims
      const response = await benefitsService.getPendingClaims();
      const pendingClaims = response.data?.filter((c: ReimbursementClaim) => c.status === 'pending') || [];
      setClaims(pendingClaims);
    } catch (error) {
      console.error('Failed to fetch claims:', error);
      setMessage({ type: 'error', text: 'Failed to load claims' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (claimId: string) => {
    try {
      setProcessing(true);
      await benefitsService.approveClaim(claimId, approverId, approvalNotes);
      setMessage({ type: 'success', text: 'Claim approved successfully' });
      setSelectedClaimId(null);
      setApprovalNotes('');
      fetchPendingClaims();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to approve claim',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (claimId: string) => {
    if (!approvalNotes.trim()) {
      setMessage({ type: 'error', text: 'Please provide rejection reason' });
      return;
    }

    try {
      setProcessing(true);
      await benefitsService.rejectClaim(claimId, approverId, approvalNotes);
      setMessage({ type: 'success', text: 'Claim rejected successfully' });
      setSelectedClaimId(null);
      setApprovalNotes('');
      fetchPendingClaims();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to reject claim',
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { className: string; label: string }> = {
      pending: { className: 'bg-warning', label: 'Pending' },
      approved: { className: 'bg-success', label: 'Approved' },
      rejected: { className: 'bg-destructive', label: 'Rejected' },
      paid: { className: 'bg-info', label: 'Paid' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (loading) {
    return <div className="text-center py-8">Loading claims...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Reimbursement Claim Approval</h2>

      {message && (
        <Card className={message.type === 'success' ? 'border-success' : 'border-destructive'}>
          <CardContent className="pt-6 flex gap-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            )}
            <p>{message.text}</p>
          </CardContent>
        </Card>
      )}

      {claims.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No pending claims to review
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <Card key={claim.id} className={selectedClaimId === claim.id ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{claim.claim_type} Claim</CardTitle>
                    <CardDescription>
                      Submitted on {new Date(claim.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  {getStatusBadge(claim.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="text-2xl font-bold">₹{claim.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Claim Date</p>
                      <p className="font-medium">{new Date(claim.claim_date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="p-2 bg-muted rounded">{claim.description}</p>
                  </div>

                  {selectedClaimId === claim.id && (
                    <div className="space-y-3 pt-4 border-t">
                      <div>
                        <Label htmlFor={`notes-${claim.id}`}>Approval Notes</Label>
                        <textarea
                          id={`notes-${claim.id}`}
                          placeholder="Add approval or rejection notes"
                          value={approvalNotes}
                          onChange={(e) => setApprovalNotes(e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(claim.id)}
                          disabled={processing}
                          className="gap-2 flex-1"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleReject(claim.id)}
                          disabled={processing}
                          variant="destructive"
                          className="gap-2 flex-1"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedClaimId(null);
                            setApprovalNotes('');
                          }}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedClaimId !== claim.id && claim.status === 'pending' && (
                    <Button
                      onClick={() => setSelectedClaimId(claim.id)}
                      variant="outline"
                      className="w-full"
                    >
                      Review Claim
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
