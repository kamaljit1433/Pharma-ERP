import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { DatePicker } from '../ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { benefitsService } from '../../services/benefitsService';
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';

const COVERAGE_TYPES = ['health', 'life', 'disability', 'dental', 'vision'] as const;

interface InsurancePlan {
  id: string;
  name: string;
  provider: string;
  coverage_type: string;
  premium_amount: number;
  enrollment_start_date: string;
  enrollment_end_date: string;
  is_active: boolean;
}

export const InsurancePlanManagement: React.FC = () => {
  const [plans, setPlans] = useState<InsurancePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    coverage_type: '',
    premium_amount: '',
    enrollment_start_date: '',
    enrollment_end_date: '',
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await benefitsService.getInsurancePlans();
      setPlans(response.data || []);
    } catch (err) {
      setError('Failed to fetch insurance plans');
      console.error('Failed to fetch insurance plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        premium_amount: parseFloat(formData.premium_amount),
      };
      if (editingId) {
        await benefitsService.updateInsurancePlan(editingId, payload);
      } else {
        await benefitsService.createInsurancePlan(payload);
      }
      resetForm();
      fetchPlans();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save insurance plan');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      provider: '',
      coverage_type: '',
      premium_amount: '',
      enrollment_start_date: '',
      enrollment_end_date: '',
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (plan: InsurancePlan) => {
    setFormData({
      name: plan.name,
      provider: plan.provider,
      coverage_type: plan.coverage_type,
      premium_amount: plan.premium_amount.toString(),
      enrollment_start_date: plan.enrollment_start_date?.split('T')[0] ?? '',
      enrollment_end_date: plan.enrollment_end_date?.split('T')[0] ?? '',
    });
    setEditingId(plan.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this insurance plan?')) {
      try {
        await benefitsService.deleteInsurancePlan(id);
        fetchPlans();
      } catch (err) {
        setError('Failed to delete insurance plan');
        console.error('Failed to delete insurance plan:', err);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading insurance plans...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive rounded-lg flex gap-2 items-center">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-destructive text-sm underline">
            Dismiss
          </button>
        </div>
      )}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Insurance Plan Management</h2>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Plan
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Insurance Plan' : 'Create Insurance Plan'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Plan Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="provider">Provider</Label>
                  <Input
                    id="provider"
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="coverage_type">Coverage Type</Label>
                  <Select
                    value={formData.coverage_type}
                    onValueChange={(v: string) => setFormData({ ...formData, coverage_type: v })}
                    required
                  >
                    <SelectTrigger id="coverage_type" className="mt-1">
                      <SelectValue placeholder="Select coverage type" />
                    </SelectTrigger>
                    <SelectContent>
                      {COVERAGE_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="premium_amount">Premium Amount</Label>
                  <Input
                    id="premium_amount"
                    type="number"
                    value={formData.premium_amount}
                    onChange={(e) => setFormData({ ...formData, premium_amount: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="enrollment_start_date">Enrollment Start Date</Label>
                  <DatePicker
                    id="enrollment_start_date"
                    value={formData.enrollment_start_date}
                    onChange={(v) => setFormData({ ...formData, enrollment_start_date: v })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="enrollment_end_date">Enrollment End Date</Label>
                  <DatePicker
                    id="enrollment_end_date"
                    value={formData.enrollment_end_date}
                    onChange={(v) => setFormData({ ...formData, enrollment_end_date: v })}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 col-span-2">
                <Button type="submit">Save Plan</Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.provider}</CardDescription>
                </div>
                <Badge className={plan.is_active ? 'bg-success' : 'bg-muted'}>
                  {plan.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Coverage Type</p>
                  <p className="font-medium">{plan.coverage_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Premium Amount</p>
                  <p className="font-medium">₹{plan.premium_amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Enrollment Window</p>
                  <p className="font-medium">
                    {new Date(plan.enrollment_start_date).toLocaleDateString()} -{' '}
                    {new Date(plan.enrollment_end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(plan)}
                  className="gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(plan.id)}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
