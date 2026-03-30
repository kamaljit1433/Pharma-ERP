import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
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

interface GoalSettingProps {
  employeeId: string;
  cycleId: string;
  onSuccess?: () => void;
}

export const GoalSetting: React.FC<GoalSettingProps> = ({ employeeId, cycleId, onSuccess }) => {
  const { createGoal, error, clearError } = usePerformanceStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    type: 'OKR' as 'OKR' | 'KPI',
    title: '',
    description: '',
    targetValue: '',
    unit: '',
    weight: '',
    dueDate: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      clearError();
      return false;
    }
    if (!formData.targetValue || parseFloat(formData.targetValue) <= 0) {
      clearError();
      return false;
    }
    if (!formData.weight || parseFloat(formData.weight) < 0 || parseFloat(formData.weight) > 100) {
      clearError();
      return false;
    }
    if (!formData.dueDate) {
      clearError();
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      clearError();
      await createGoal({
        employeeId,
        cycleId,
        type: formData.type,
        title: formData.title,
        description: formData.description,
        targetValue: parseFloat(formData.targetValue),
        unit: formData.unit,
        weight: parseFloat(formData.weight),
        dueDate: formData.dueDate,
      });
      setSuccess(true);
      setFormData({
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          <div>
            <CardTitle>Create Goal</CardTitle>
            <CardDescription>Set OKR or KPI for this review cycle</CardDescription>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Goal Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
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
                aria-label="Goal weight percentage"
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
              aria-label="Goal title"
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
              aria-label="Goal description"
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
                aria-label="Target value"
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
                aria-label="Measurement unit"
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
                aria-label="Goal due date"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating Goal...' : 'Create Goal'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
