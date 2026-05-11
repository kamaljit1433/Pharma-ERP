import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';
import { usePerformanceStore } from '../../store/performanceStore';
import { AlertCircle, CheckCircle2, Target } from 'lucide-react';
import { EmployeeSearch } from './EmployeeSearch';

interface GoalSettingProps {
  onSuccess?: () => void;
}

export const GoalSetting: React.FC<GoalSettingProps> = ({ onSuccess }) => {
  const { createGoal, error, clearError, reviewCycles, fetchReviewCycles } = usePerformanceStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [formData, setFormData] = useState({
    cycleId: '',
    type: 'OKR' as 'OKR' | 'KPI',
    title: '',
    description: '',
    targetValue: '',
    unit: '',
    weight: '',
    dueDate: '',
  });

  useEffect(() => {
    fetchReviewCycles();
  }, [fetchReviewCycles]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): string | null => {
    if (!selectedEmployeeId) return 'Please select an employee';
    if (!formData.cycleId) return 'Please select a review cycle';
    if (!formData.title.trim()) return 'Goal title is required';
    if (!formData.targetValue || parseFloat(formData.targetValue) <= 0)
      return 'Target value must be greater than 0';
    if (
      !formData.weight ||
      parseFloat(formData.weight) < 0 ||
      parseFloat(formData.weight) > 100
    )
      return 'Weight must be between 0 and 100';
    if (!formData.dueDate) return 'Due date is required';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      return;
    }

    try {
      setLoading(true);
      clearError();
      await createGoal({
        employeeId: selectedEmployeeId,
        cycleId: formData.cycleId,
        type: formData.type,
        title: formData.title,
        description: formData.description,
        targetValue: parseFloat(formData.targetValue),
        unit: formData.unit,
        weight: parseFloat(formData.weight),
        dueDate: formData.dueDate,
      });
      setSuccess(true);
      setSelectedEmployeeId('');
      setFormData({
        cycleId: '',
        type: 'OKR',
        title: '',
        description: '',
        targetValue: '',
        unit: '',
        weight: '',
        dueDate: '',
      });
      setTimeout(() => setSuccess(false), 3000);
      onSuccess?.();
    } catch (err) {
      console.error('Failed to create goal:', err);
    } finally {
      setLoading(false);
    }
  };

  const validationError = validateForm();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          <div>
            <CardTitle>Create Goal</CardTitle>
            <CardDescription>Set OKR or KPI for a review cycle</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex gap-2 p-3 bg-success/10 border border-success/20 rounded-md">
              <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <p className="text-sm text-success">Goal created successfully</p>
            </div>
          )}

          <EmployeeSearch
            label="Employee"
            placeholder="Search employee by name or ID..."
            onChange={(id) => setSelectedEmployeeId(id)}
          />

          <div>
            <Label htmlFor="cycleId">Review Cycle</Label>
            <Select
              value={formData.cycleId}
              onValueChange={(value: string) => handleSelectChange('cycleId', value)}
            >
              <SelectTrigger id="cycleId">
                <SelectValue placeholder="Select review cycle" />
              </SelectTrigger>
              <SelectContent>
                {reviewCycles.length === 0 ? (
                  <SelectItem value="_none" disabled>
                    No review cycles available
                  </SelectItem>
                ) : (
                  reviewCycles.map((cycle) => (
                    <SelectItem key={cycle.id} value={cycle.id}>
                      {cycle.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Goal Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: string) => handleSelectChange('type', value)}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OKR">OKR (Objective & Key Result)</SelectItem>
                  <SelectItem value="KPI">KPI (Key Performance Indicator)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="weight">Weight (%)</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                min="0"
                max="100"
                step="1"
                value={formData.weight}
                onChange={handleChange}
                placeholder="0-100"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="title">Goal Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Increase sales by 20%"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide context and details about this goal"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="targetValue">Target Value</Label>
              <Input
                id="targetValue"
                name="targetValue"
                type="number"
                step="0.01"
                value={formData.targetValue}
                onChange={handleChange}
                placeholder="e.g., 100"
              />
            </div>

            <div>
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="e.g., units, %"
              />
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <Button type="submit" disabled={loading || !!validationError} className="w-full">
            {loading ? 'Creating Goal...' : 'Create Goal'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
