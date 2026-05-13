import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { benefitsService } from '../../services/benefitsService';
import { CheckCircle2, AlertCircle, Clock, XCircle, BadgeCheck, Banknote, X, Eye, Plus } from 'lucide-react';

interface PastClaim {
  id: string;
  claim_type: string;
  amount: number;
  description: string;
  status: string;
  claim_date: string;
  created_at: string;
  approval_notes?: string | null;
  approved_at?: string | null;
}

interface ReimbursementClaimFormProps {
  employeeId: string;
  onSuccess?: () => void;
}

const statusConfig: Record<string, { label: string; icon: React.ReactNode; bg: string; text: string; border: string }> = {
  pending:  { label: 'Pending Review', icon: <Clock className="w-4 h-4" />,      bg: 'bg-yellow-50',  text: 'text-yellow-800', border: 'border-yellow-200' },
  approved: { label: 'Approved',       icon: <BadgeCheck className="w-4 h-4" />, bg: 'bg-green-50',   text: 'text-green-800',  border: 'border-green-200'  },
  rejected: { label: 'Rejected',       icon: <XCircle className="w-4 h-4" />,    bg: 'bg-red-50',     text: 'text-red-800',    border: 'border-red-200'    },
  paid:     { label: 'Paid',           icon: <Banknote className="w-4 h-4" />,   bg: 'bg-blue-50',    text: 'text-blue-800',   border: 'border-blue-200'   },
};

// ── Claim Detail Modal ────────────────────────────────────────────────────────
const ClaimDetailModal: React.FC<{ claim: PastClaim; onClose: () => void }> = ({ claim, onClose }) => {
  const cfg = statusConfig[claim.status] ?? statusConfig.pending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">{claim.claim_type} Claim</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Submitted on {new Date(claim.created_at).toLocaleDateString()}
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status banner */}
        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
          {cfg.icon}
          <span className="font-semibold">{cfg.label}</span>
          {claim.approved_at && (
            <span className="ml-auto text-xs opacity-75">
              {new Date(claim.approved_at).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Amount</p>
            <p className="font-bold text-xl">₹{claim.amount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Claim Date</p>
            <p className="font-medium">
              {claim.claim_date ? new Date(claim.claim_date).toLocaleDateString() : '—'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Type</p>
            <p className="font-medium">{claim.claim_type}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Claim ID</p>
            <p className="font-mono text-xs truncate">{claim.id}</p>
          </div>
        </div>

        {/* Description */}
        <div className="text-sm">
          <p className="text-muted-foreground mb-1">Description</p>
          <p className="p-3 bg-muted rounded-lg">{claim.description}</p>
        </div>

        {/* Approval / rejection notes */}
        {claim.status === 'approved' && claim.approval_notes && (
          <div className="text-sm">
            <p className="text-muted-foreground mb-1">Approval Notes</p>
            <p className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
              {claim.approval_notes}
            </p>
          </div>
        )}

        {claim.status === 'rejected' && (
          <div className="text-sm">
            <p className="text-muted-foreground mb-1">Rejection Reason</p>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{claim.approval_notes || 'No reason provided'}</span>
            </div>
          </div>
        )}

        <Button variant="outline" className="w-full" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
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
  const [selectedClaim, setSelectedClaim] = useState<PastClaim | null>(null);
  const [showForm, setShowForm] = useState(false);

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
      setTimeout(() => { setShowForm(false); setMessage(null); }, 1500);

      if (onSuccess) setTimeout(onSuccess, 1500);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to submit claim',
      });
    } finally {
      setLoading(false);
    }
  };

  const closeForm = () => { setShowForm(false); setMessage(null); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reimbursements</h2>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Claim
        </Button>
      </div>

      {/* Submit Claim Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeForm} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Submit Reimbursement Claim</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Fill in the details of your claim</p>
              </div>
              <button onClick={closeForm} className="text-muted-foreground hover:text-foreground transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {message && (
              <div className={`flex gap-2 p-3 rounded-lg border text-sm ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                {message.type === 'success'
                  ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                <p>{message.text}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Claim Type *</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {claimTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, claim_type: type })}
                      className={`p-2 rounded-lg border transition text-sm ${
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
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={closeForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Submitting...' : 'Submit Claim'}
                </Button>
              </div>
            </form>

            <div className="text-xs text-muted-foreground space-y-1 pt-1 border-t">
              <p>• Claims will be reviewed by your manager and finance team</p>
              <p>• Approved claims will be added to your next payroll</p>
              <p>• Claims must be submitted within 30 days of the expense</p>
            </div>
          </div>
        </div>
      )}

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
            <div className="space-y-2">
              {pastClaims.map((claim) => {
                const cfg = statusConfig[claim.status] ?? statusConfig.pending;
                return (
                  <div
                    key={claim.id}
                    className="flex items-center justify-between px-4 py-3 border rounded-lg hover:bg-muted/40 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-1.5 rounded-full ${cfg.bg} ${cfg.text}`}>{cfg.icon}</div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{claim.claim_type}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(claim.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <div className="text-right">
                        <p className="font-semibold text-sm">₹{claim.amount.toLocaleString()}</p>
                        <span className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => setSelectedClaim(claim)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedClaim && (
        <ClaimDetailModal claim={selectedClaim} onClose={() => setSelectedClaim(null)} />
      )}
    </div>
  );
};
