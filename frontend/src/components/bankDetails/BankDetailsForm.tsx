import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { bankDetailsService } from '../../services/bankDetailsService';
import { CheckCircle2, AlertCircle, Lock, Plus, Trash2 } from 'lucide-react';

interface BankAccount {
  id: string;
  bank_name: string;
  account_holder_name: string;
  account_number: string;
  ifsc_code: string;
  branch_name: string;
  account_type: 'savings' | 'current';
  is_primary: boolean;
  verified: boolean;
  created_at: string;
}

interface BankDetailsFormProps {
  employeeId: string;
  onSuccess?: () => void;
}

export const BankDetailsForm: React.FC<BankDetailsFormProps> = ({ employeeId, onSuccess }) => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    bank_name: '',
    account_holder_name: '',
    account_number: '',
    ifsc_code: '',
    branch_name: '',
    account_type: 'savings' as 'savings' | 'current',
  });

  useEffect(() => {
    fetchBankDetails();
  }, [employeeId]);

  const fetchBankDetails = async () => {
    try {
      const data = await bankDetailsService.getBankDetails(employeeId);
      setBankAccounts(data);
    } catch (error) {
      console.error('Failed to fetch bank details:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.bank_name || !formData.account_holder_name || !formData.account_number || !formData.ifsc_code) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    // Check account limit (max 2)
    if (bankAccounts.length >= 2) {
      setMessage({ type: 'error', text: 'You can only add up to 2 bank accounts' });
      return;
    }

    // Validate account number (basic check)
    if (formData.account_number.length < 9 || formData.account_number.length > 18) {
      setMessage({ type: 'error', text: 'Account number must be between 9 and 18 digits' });
      return;
    }

    // Validate IFSC code
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc_code)) {
      setMessage({ type: 'error', text: 'Invalid IFSC code format' });
      return;
    }

    try {
      setLoading(true);
      await bankDetailsService.addBankAccount({
        employee_id: employeeId,
        ...formData,
      });

      setMessage({ type: 'success', text: 'Bank account added successfully. Awaiting verification.' });
      setFormData({
        bank_name: '',
        account_holder_name: '',
        account_number: '',
        ifsc_code: '',
        branch_name: '',
        account_type: 'savings',
      });
      setShowForm(false);

      await fetchBankDetails();

      if (onSuccess) {
        setTimeout(onSuccess, 1500);
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to add bank account',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrimary = async (accountId: string) => {
    try {
      setLoading(true);
      await bankDetailsService.setBankAccountPrimary(accountId);
      setMessage({ type: 'success', text: 'Primary account updated successfully' });
      await fetchBankDetails();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update primary account',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (accountId: string) => {
    if (!window.confirm('Are you sure you want to delete this bank account?')) {
      return;
    }

    try {
      setLoading(true);
      await bankDetailsService.deleteBankAccount(accountId);
      setMessage({ type: 'success', text: 'Bank account deleted successfully' });
      await fetchBankDetails();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to delete bank account',
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
      <h2 className="text-2xl font-bold">Bank Account Details</h2>

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

      {/* Bank Accounts List */}
      <div className="space-y-4">
        {bankAccounts.length > 0 ? (
          bankAccounts.map((account) => (
            <Card key={account.id} className="border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{account.bank_name}</h3>
                      {account.is_primary && (
                        <Badge className="bg-success text-success-foreground">Primary</Badge>
                      )}
                      {account.verified ? (
                        <Badge className="bg-approved text-approved-foreground">Verified</Badge>
                      ) : (
                        <Badge className="bg-pending text-pending-foreground">Pending Verification</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{account.branch_name}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Account Holder</p>
                        <p className="font-medium">{account.account_holder_name}</p>
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
                      <div>
                        <p className="text-muted-foreground">Account Type</p>
                        <p className="font-medium capitalize">{account.account_type}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {!account.is_primary && account.verified && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetPrimary(account.id)}
                        disabled={loading}
                      >
                        Set Primary
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(account.id)}
                      disabled={loading}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-muted/50">
            <CardContent className="pt-6 text-center text-muted-foreground">
              <p>No bank accounts added yet</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Account Button */}
      {bankAccounts.length < 2 && (
        <Button
          onClick={() => setShowForm(!showForm)}
          className="w-full"
          variant={showForm ? 'outline' : 'default'}
        >
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'Add Bank Account'}
        </Button>
      )}

      {/* Add Account Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Bank Account</CardTitle>
            <CardDescription>
              Add your bank account details for salary disbursement. Your account will be verified by the finance team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bank_name">Bank Name *</Label>
                  <Input
                    id="bank_name"
                    placeholder="e.g., HDFC Bank"
                    value={formData.bank_name}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="branch_name">Branch Name *</Label>
                  <Input
                    id="branch_name"
                    placeholder="e.g., Mumbai Main Branch"
                    value={formData.branch_name}
                    onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="account_holder_name">Account Holder Name *</Label>
                <Input
                  id="account_holder_name"
                  placeholder="Full name as per bank records"
                  value={formData.account_holder_name}
                  onChange={(e) => setFormData({ ...formData, account_holder_name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="account_number">Account Number *</Label>
                  <Input
                    id="account_number"
                    placeholder="9-18 digits"
                    value={formData.account_number}
                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="ifsc_code">IFSC Code *</Label>
                  <Input
                    id="ifsc_code"
                    placeholder="e.g., HDFC0000001"
                    value={formData.ifsc_code}
                    onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="account_type">Account Type *</Label>
                <select
                  id="account_type"
                  value={formData.account_type}
                  onChange={(e) => setFormData({ ...formData, account_type: e.target.value as 'savings' | 'current' })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="savings">Savings</option>
                  <option value="current">Current</option>
                </select>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Adding Account...' : 'Add Account'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Important Information</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>• Your bank details are encrypted and securely stored</p>
          <p>• Only the last 4 digits of your account number are visible</p>
          <p>• New accounts require verification by the finance team</p>
          <p>• You can maintain up to 2 bank accounts</p>
          <p>• Salary will be credited to your primary account</p>
        </CardContent>
      </Card>
    </div>
  );
};
