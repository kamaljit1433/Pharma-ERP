import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { benefitsService } from '../../services/benefitsService';
import { CheckCircle2, AlertCircle } from 'lucide-react';

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

  const claimTypes = ['Travel', 'Meals', 'Accommodation', 'Medical', 'Other'];

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
              <div className="grid grid-cols-2 gap-2 mt-2">
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
    </div>
  );
};
