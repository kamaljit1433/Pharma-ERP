import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { bankDetailsService } from '../../services/bankDetailsService';
import { CheckCircle2, AlertCircle, Clock, Lock } from 'lucide-react';

interface BankVerificationRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  bank_name: string;
  account_holder_name: string;
  account_number: string;
  ifsc_code: string;
  branch_name: string;
  account_type: string;
  is_primary: boolean;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

interface BankDetailsVerificationProps {
  approverId: string;
}

export const BankDetailsVerification: React.FC<BankDetailsVerificationProps> = ({ approverId }) => {
  const [pendingAccounts, setPendingAccounts] = useState<BankVerificationRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    try {
      const data = await bankDetailsService.getPendingVerifications();
      setPendingAccounts(data);
    } catch (error) {
      console.error('Failed to fetch pending verifications:', error);
    }
  };

  const handleApprove = async (accountId: string) => {
    try {
      setLoading(true);
      await bankDetailsService.approveBankVerification(accountId, approverId);
      setMessage({ type: 'success', text: 'Bank account verified successfully' });
      await fetchPendingVerifications();
      setSelectedAccount(null);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to verify bank account',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (accountId: string) => {
    if (!rejectionReason.trim()) {
      setMessage({ type: 'error', text: 'Please provide a reason for rejection' });
      return;
    }

    try {
      setLoading(true);
      await bankDetailsService.rejectBankVerification(accountId, approverId, rejectionReason);
      setMessage({ type: 'success', text: 'Bank account rejected successfully' });
      await fetchPendingVerifications();
      setSelectedAccount(null);
      setRejectionReason('');
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to reject bank account',
      });
    } finally {
      setLoading(false);
    }
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (accountNumber.length <= 4) return accountNumber;
    return '*'.repeat(accountNumber.length - 4) + accountNumber.slice(-4);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Bank Account Verification</h2>
        <p className="text-muted-foreground mt-1">Review and verify employee bank account details</p>
      </div>

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

      {/* Pending Verifications */}
      {pendingAccounts.length > 0 ? (
        <div className="space-y-4">
          {pendingAccounts.map((account) => (
            <Card key={account.id} className="border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{account.employee_name}</h3>
                      <Badge className="bg-pending text-pending-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending Verification
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Submitted on {new Date(account.created_at).toLocaleDateString()}
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-muted-foreground">Bank Name</p>
                        <p className="font-medium">{account.bank_name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Branch</p>
                        <p className="font-medium">{account.branch_name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Account Holder</p>
                        <p className="font-medium">{account.account_holder_name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Account Type</p>
                        <p className="font-medium capitalize">{account.account_type}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Account Number</p>
                        <p className="font-mono font-medium flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          {maskAccountNumber(account.account_number)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">IFSC Code</p>
                        <p className="font-mono font-medium">{account.ifsc_code}</p>
                      </div>
                    </div>

                    {account.is_primary && (
                      <div className="bg-info/10 border border-info/30 rounded-md p-3 mb-4">
                        <p className="text-sm text-info">
                          This account is marked as primary for salary disbursement
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedAccount === account.id ? (
                  <div className="space-y-4 border-t border-border pt-4">
                    <div>
                      <Label htmlFor={`reason-${account.id}`}>Rejection Reason (if rejecting)</Label>
                      <textarea
                        id={`reason-${account.id}`}
                        placeholder="Provide a reason for rejection (optional if approving)"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApprove(account.id)}
                        disabled={loading}
                        className="flex-1 bg-success hover:bg-success/90"
                      >
                        {loading ? 'Processing...' : 'Approve'}
                      </Button>
                      <Button
                        onClick={() => handleReject(account.id)}
                        disabled={loading}
                        variant="destructive"
                        className="flex-1"
                      >
                        {loading ? 'Processing...' : 'Reject'}
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedAccount(null);
                          setRejectionReason('');
                        }}
                        variant="outline"
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => setSelectedAccount(account.id)}
                    className="w-full"
                    variant="outline"
                  >
                    Review & Verify
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-muted/50">
          <CardContent className="pt-6 text-center text-muted-foreground">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-success" />
            <p className="font-medium">All bank accounts verified</p>
            <p className="text-sm">No pending verifications at this time</p>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Verification Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>• Verify that the account holder name matches employee records</p>
          <p>• Confirm IFSC code is valid for the specified bank and branch</p>
          <p>• Check account number format (9-18 digits)</p>
          <p>• Approved accounts will be activated for salary disbursement</p>
          <p>• Rejected accounts will notify the employee with the reason</p>
        </CardContent>
      </Card>
    </div>
  );
};
