import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { benefitsService } from '../../services/benefitsService';
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';

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
    } catch (error) {
      console.error('Failed to fetch insurance plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await benefitsService.updateInsurancePlan(editingId, formData);
      } else {
        await benefitsService.createInsurancePlan(formData);
      }
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
      fetchPlans();
    } catch (error) {
      console.error('Failed to save insurance plan:', error);
    }
  };

  const handleEdit = (plan: InsurancePlan) => {
    setFormData({
      name: plan.name,
      provider: plan.provider,
      coverage_type: plan.coverage_type,
      premium_amount: plan.premium_amount.toString(),
      enrollment_start_date: plan.enrollment_start_date,
      enrollment_end_date: plan.enrollment_end_date,
    });
    setEditingId(plan.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this insurance plan?')) {
      try {
        await benefitsService.deleteInsurancePlan(id);
        fetchPlans();
      } catch (error) {
        console.error('Failed to delete insurance plan:', error);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading insurance plans...</div>;
  }

  return (
    <div className="space-y-6">
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
                  <Input
                    id="coverage_type"
                    value={formData.coverage_type}
                    onChange={(e) => setFormData({ ...formData, coverage_type: e.target.value })}
                    required
                  />
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
                  <Input
                    id="enrollment_start_date"
                    type="date"
                    value={formData.enrollment_start_date}
                    onChange={(e) => setFormData({ ...formData, enrollment_start_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="enrollment_end_date">Enrollment End Date</Label>
                  <Input
                    id="enrollment_end_date"
                    type="date"
                    value={formData.enrollment_end_date}
                    onChange={(e) => setFormData({ ...formData, enrollment_end_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Save Plan</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({
                      name: '',
                      provider: '',
                      coverage_type: '',
                      premium_amount: '',
                      enrollment_start_date: '',
                      enrollment_end_date: '',
                    });
                  }}
                >
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
