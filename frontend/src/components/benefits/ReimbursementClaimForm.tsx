import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { benefitsService } from '../../services/benefitsService';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface PastClaim {
  id: string;
  claim_type: string;
  amount: number;
  description: string;
  status: string;
  claim_date: string;
  created_at: string;
}

interface ReimbursementClaimFormProps {
  employeeId: string;
  onSuccess?: () => void;
}

export const ReimbursementClaimForm: React.FC<ReimbursementClaimFormProps> = ({
  employeeId,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    claim_type: '',
    amount: '',
    description: '',
    claim_date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pastClaims, setPastClaims] = useState<PastClaim[]>([]);
  const [loadingClaims, setLoadingClaims] = useState(false);

  const claimTypes = ['Travel', 'Meals', 'Accommodation', 'Medical', 'Other'];

  useEffect(() => {
    if (employeeId) fetchPastClaims();
  }, [employeeId]);

  const fetchPastClaims = async () => {
    try {
      setLoadingClaims(true);
      const response = await benefitsService.getEmployeeClaims(employeeId);
      setPastClaims(response.data || []);
    } catch (error) {
      console.error('Failed to fetch past claims:', error);
    } finally {
      setLoadingClaims(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.claim_type || !formData.amount || !formData.description) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      setMessage({ type: 'error', text: 'Amount must be greater than 0' });
      return;
    }

    try {
      setLoading(true);
      await benefitsService.submitReimbursementClaim({
        employee_id: employeeId,
        claim_type: formData.claim_type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        claim_date: formData.claim_date,
      });

      setMessage({ type: 'success', text: 'Reimbursement claim submitted successfully' });
      setFormData({
        claim_type: '',
        amount: '',
        description: '',
        claim_date: new Date().toISOString().split('T')[0],
      });
      fetchPastClaims();

      if (onSuccess) {
        setTimeout(onSuccess, 1500);
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to submit claim',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    if (status === 'approved') return 'bg-green-100 text-green-800';
    if (status === 'rejected') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Submit Reimbursement Claim</h2>

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

      <Card>
        <CardHeader>
          <CardTitle>Claim Details</CardTitle>
          <CardDescription>Fill in the details of your reimbursement claim</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="claim_type">Claim Type *</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {claimTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, claim_type: type })}
                    className={`p-2 rounded-lg border transition ${
                      formData.claim_type === type
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="amount">Amount (₹) *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter claim amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <Label htmlFor="claim_date">Claim Date *</Label>
              <Input
                id="claim_date"
                type="date"
                value={formData.claim_date}
                onChange={(e) => setFormData({ ...formData, claim_date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                placeholder="Describe the expense and reason for reimbursement"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                rows={4}
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Submitting...' : 'Submit Claim'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Important Information</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>• Claims will be reviewed by your manager and finance team</p>
          <p>• Approved claims will be added to your next payroll</p>
          <p>• Keep supporting documents ready for verification</p>
          <p>• Claims must be submitted within 30 days of the expense</p>
        </CardContent>
      </Card>

      {/* Past Claims */}
      <Card>
        <CardHeader>
          <CardTitle>Your Past Claims</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingClaims ? (
            <p className="text-center text-muted-foreground py-4">Loading claims...</p>
          ) : pastClaims.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No claims submitted yet</p>
          ) : (
            <div className="space-y-3">
              {pastClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="p-3 border rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{claim.claim_type}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(claim.claim_date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {claim.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="font-bold">₹{claim.amount.toLocaleString()}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${getStatusStyle(claim.status)}`}
                    >
                      {claim.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
