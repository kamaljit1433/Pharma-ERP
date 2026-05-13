import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, Send, Pencil, X, Banknote } from 'lucide-react';
import { separationService, FnFSettlement } from '../../services/separationService';
import { useAuth } from '../../hooks/useAuth';

interface FnFCalculationProps {
  employeeId: string;
  onUpdate?: (fnfId: string, data: any) => Promise<void>;
  onApprove?: (fnfId: string, approvedBy: string) => Promise<void>;
  onMarkPaid?: (fnfId: string) => Promise<void>;
  onSubmitForApproval?: (fnfId: string) => Promise<void>;
  isLoading?: boolean;
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const STATUS_BADGE: Record<string, string> = {
  draft: 'secondary',
  pending_approval: 'outline',
  approved: 'default',
  paid: 'default',
};

interface EditableAmounts {
  bonus: number;
  other_benefits: number;
  other_deductions: number;
}

export const FnFCalculation: React.FC<FnFCalculationProps> = ({
  employeeId,
  onUpdate,
  onApprove,
  onMarkPaid,
  onSubmitForApproval,
  isLoading = false,
}) => {
  const { user } = useAuth();
  const [fnfSettlement, setFnfSettlement] = useState<FnFSettlement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noData, setNoData] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editValues, setEditValues] = useState<EditableAmounts>({ bonus: 0, other_benefits: 0, other_deductions: 0 });
  const [saveLoading, setSaveLoading] = useState(false);

  const [submitLoading, setSubmitLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [paidLoading, setPaidLoading] = useState(false);

  const fetchFnFSettlement = useCallback(async () => {
    if (!employeeId) return;
    try {
      setLoading(true);
      setError(null);
      setNoData(false);
      const data = await separationService.getFnFSettlement(employeeId);
      setFnfSettlement(data);
    } catch (err: any) {
      if (err?.response?.status === 404 || err?.message?.includes('not found')) {
        setNoData(true);
      } else {
        setError(err?.message || 'Failed to fetch F&F settlement');
      }
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => { fetchFnFSettlement(); }, [fetchFnFSettlement]);

  const startEditing = () => {
    if (!fnfSettlement) return;
    setEditValues({
      bonus: fnfSettlement.bonus,
      other_benefits: fnfSettlement.other_benefits,
      other_deductions: fnfSettlement.other_deductions,
    });
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!fnfSettlement || !onUpdate) return;
    try {
      setSaveLoading(true);
      await onUpdate(fnfSettlement.id, editValues);
      setEditing(false);
      await fetchFnFSettlement();
    } catch {
      // error handled by parent
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!fnfSettlement) return;
    try {
      setSubmitLoading(true);
      if (onSubmitForApproval) await onSubmitForApproval(fnfSettlement.id);
      await fetchFnFSettlement();
    } catch {
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!fnfSettlement || !user?.employeeId) return;
    try {
      setApproveLoading(true);
      if (onApprove) await onApprove(fnfSettlement.id, user.employeeId);
      await fetchFnFSettlement();
    } catch {
    } finally {
      setApproveLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!fnfSettlement) return;
    try {
      setPaidLoading(true);
      if (onMarkPaid) await onMarkPaid(fnfSettlement.id);
      await fetchFnFSettlement();
    } catch {
    } finally {
      setPaidLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (noData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Full &amp; Final Settlement</CardTitle>
          <CardDescription>Employee ID: {employeeId}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-8 gap-3 text-center">
          <p className="text-muted-foreground">
            No F&amp;F settlement found. A settlement is generated once the separation process begins.
          </p>
          <Button variant="outline" size="sm" onClick={fetchFnFSettlement}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (error && !fnfSettlement) {
    return (
      <Card className="w-full">
        <CardContent className="py-8 space-y-4">
          <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" onClick={fetchFnFSettlement} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!fnfSettlement) return null;

  const isDraft = fnfSettlement.status === 'draft';
  const canEdit = isDraft && !!onUpdate;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Full &amp; Final Settlement</CardTitle>
            <CardDescription>Employee ID: {employeeId}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={STATUS_BADGE[fnfSettlement.status] as any}>
              {fnfSettlement.status.replace(/_/g, ' ').toUpperCase()}
            </Badge>
            <Button variant="ghost" size="sm" onClick={fetchFnFSettlement} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Earnings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Earnings</h3>
            {canEdit && !editing && (
              <Button variant="outline" size="sm" onClick={startEditing}>
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                Edit Adjustments
              </Button>
            )}
            {editing && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditing(false)} disabled={saveLoading}>
                  <X className="h-3.5 w-3.5 mr-1.5" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveEdit} disabled={saveLoading}>
                  {saveLoading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : null}
                  Save
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Pending Salary', value: fnfSettlement.pending_salary },
              { label: 'Leave Encashment', value: fnfSettlement.leave_encashment },
              { label: 'Gratuity', value: fnfSettlement.gratuity },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between p-3 bg-muted rounded-md">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="font-semibold">{formatCurrency(value)}</span>
              </div>
            ))}

            {/* Editable: Bonus */}
            <div className="flex justify-between p-3 bg-muted rounded-md items-center">
              <span className="text-sm text-muted-foreground">Bonus</span>
              {editing ? (
                <Input
                  type="number"
                  min={0}
                  value={editValues.bonus}
                  onChange={(e) => setEditValues((p) => ({ ...p, bonus: Number(e.target.value) }))}
                  className="w-32 h-7 text-right text-sm"
                />
              ) : (
                <span className="font-semibold">{formatCurrency(fnfSettlement.bonus)}</span>
              )}
            </div>

            {/* Editable: Other Benefits */}
            <div className="flex justify-between p-3 bg-muted rounded-md items-center">
              <span className="text-sm text-muted-foreground">Other Benefits</span>
              {editing ? (
                <Input
                  type="number"
                  min={0}
                  value={editValues.other_benefits}
                  onChange={(e) => setEditValues((p) => ({ ...p, other_benefits: Number(e.target.value) }))}
                  className="w-32 h-7 text-right text-sm"
                />
              ) : (
                <span className="font-semibold">{formatCurrency(fnfSettlement.other_benefits)}</span>
              )}
            </div>
          </div>

          <div className="flex justify-between p-3 bg-green-50 border border-green-200 rounded-md font-semibold">
            <span>Total Earnings</span>
            <span className="text-green-700">
              {editing
                ? formatCurrency(
                    fnfSettlement.pending_salary +
                    fnfSettlement.leave_encashment +
                    fnfSettlement.gratuity +
                    editValues.bonus +
                    editValues.other_benefits
                  )
                : formatCurrency(fnfSettlement.total_earnings)}
            </span>
          </div>
        </div>

        {/* Deductions */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Deductions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Advance Deduction', value: fnfSettlement.advance_deduction },
              { label: 'Asset Damage', value: fnfSettlement.asset_damage_deduction },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between p-3 bg-muted rounded-md">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="font-semibold">{formatCurrency(value)}</span>
              </div>
            ))}

            {/* Editable: Other Deductions */}
            <div className="flex justify-between p-3 bg-muted rounded-md items-center">
              <span className="text-sm text-muted-foreground">Other Deductions</span>
              {editing ? (
                <Input
                  type="number"
                  min={0}
                  value={editValues.other_deductions}
                  onChange={(e) => setEditValues((p) => ({ ...p, other_deductions: Number(e.target.value) }))}
                  className="w-32 h-7 text-right text-sm"
                />
              ) : (
                <span className="font-semibold">{formatCurrency(fnfSettlement.other_deductions)}</span>
              )}
            </div>
          </div>

          <div className="flex justify-between p-3 bg-red-50 border border-red-200 rounded-md font-semibold">
            <span>Total Deductions</span>
            <span className="text-red-700">
              {editing
                ? formatCurrency(
                    fnfSettlement.advance_deduction +
                    fnfSettlement.asset_damage_deduction +
                    editValues.other_deductions
                  )
                : formatCurrency(fnfSettlement.total_deductions)}
            </span>
          </div>
        </div>

        {/* Net Settlement */}
        <div className="flex justify-between p-4 bg-primary/10 border border-primary/20 rounded-lg font-bold text-lg">
          <span>Net Settlement Amount</span>
          <span className="text-primary">{formatCurrency(fnfSettlement.net_settlement)}</span>
        </div>

        {/* Submit for Approval (draft) */}
        {isDraft && onSubmitForApproval && !editing && (
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <h3 className="font-semibold">Submit for Approval</h3>
            <p className="text-sm text-muted-foreground">
              Submit this settlement to Finance/Payroll for approval.
            </p>
            <Button onClick={handleSubmitForApproval} disabled={submitLoading || isLoading} className="w-full" variant="outline">
              {submitLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              {submitLoading ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          </div>
        )}

        {/* Approve (pending_approval) */}
        {fnfSettlement.status === 'pending_approval' && onApprove && (
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <h3 className="font-semibold">Approve Settlement</h3>
            <div className="flex items-center gap-2 px-3 py-2 bg-background border border-input rounded-md text-sm">
              <span className="font-medium">{user?.email}</span>
              {user?.employeeId && (
                <span className="text-xs text-muted-foreground">· {user.employeeId}</span>
              )}
            </div>
            <Button onClick={handleApprove} disabled={approveLoading || isLoading || !user?.employeeId} className="w-full">
              {approveLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              {approveLoading ? 'Approving...' : 'Approve Settlement'}
            </Button>
          </div>
        )}

        {/* Mark as Paid (approved) */}
        {fnfSettlement.status === 'approved' && onMarkPaid && (
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <h3 className="font-semibold">Mark as Paid</h3>
            <p className="text-sm text-muted-foreground">
              Confirm that the settlement amount of{' '}
              <span className="font-semibold text-foreground">{formatCurrency(fnfSettlement.net_settlement)}</span>{' '}
              has been disbursed to the employee.
            </p>
            <Button onClick={handleMarkPaid} disabled={paidLoading || isLoading} className="w-full">
              {paidLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Banknote className="h-4 w-4 mr-2" />}
              {paidLoading ? 'Processing...' : 'Mark as Paid'}
            </Button>
          </div>
        )}

        {/* Approved confirmation */}
        {fnfSettlement.status === 'approved' && (
          <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 border border-green-200 rounded-md">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="text-sm">
              Approved{fnfSettlement.approved_by ? ` by ${fnfSettlement.approved_by}` : ''}
              {fnfSettlement.approved_at
                ? ` on ${new Date(fnfSettlement.approved_at).toLocaleDateString()}`
                : ''}
            </span>
          </div>
        )}

        {/* Paid confirmation */}
        {fnfSettlement.status === 'paid' && (
          <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 border border-green-200 rounded-md">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="text-sm">
              Settlement paid
              {fnfSettlement.paid_at
                ? ` on ${new Date(fnfSettlement.paid_at).toLocaleDateString()}`
                : ''}
            </span>
          </div>
        )}

        {/* Label for editable fields */}
        {canEdit && isDraft && (
          <p className="text-xs text-muted-foreground text-center">
            Bonus, Other Benefits, and Other Deductions can be adjusted before submitting for approval.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
