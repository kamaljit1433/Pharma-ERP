import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { usePerformanceStore } from '../../store/performanceStore';
import { AlertCircle, CheckCircle2, Star } from 'lucide-react';
import { EmployeeSearch } from './EmployeeSearch';

interface PerformanceReviewFormProps {
  onSuccess?: () => void;
}

export const PerformanceReviewForm: React.FC<PerformanceReviewFormProps> = ({ onSuccess }) => {
  const { submitReview, error, clearError, reviewCycles, fetchReviewCycles } =
    usePerformanceStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [formData, setFormData] = useState({
    cycleId: '',
    reviewType: '' as 'Self' | 'Manager' | 'Peer' | '',
    rating: '',
    comments: '',
  });

  useEffect(() => {
    fetchReviewCycles();
  }, [fetchReviewCycles]);

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getReviewTypeLabel = () => {
    switch (formData.reviewType) {
      case 'Self':
        return 'Self Assessment';
      case 'Manager':
        return 'Manager Review';
      case 'Peer':
        return 'Peer Review';
      default:
        return 'Performance Review';
    }
  };

  const validateForm = (): boolean => {
    if (!selectedEmployeeId) return false;
    if (!formData.cycleId) return false;
    if (!formData.reviewType) return false;
    if (!formData.rating) return false;
    if (!formData.comments.trim()) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      clearError();
      await submitReview({
        employeeId: selectedEmployeeId,
        cycleId: formData.cycleId,
        reviewType: formData.reviewType,
        rating: parseInt(formData.rating),
        comments: formData.comments,
      });
      setSuccess(true);
      setSelectedEmployeeId('');
      setFormData({ cycleId: '', reviewType: '', rating: '', comments: '' });
      setTimeout(() => setSuccess(false), 3000);
      onSuccess?.();
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5" />
          <div>
            <CardTitle>{getReviewTypeLabel()}</CardTitle>
            <CardDescription>Provide your performance assessment</CardDescription>
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
              <p className="text-sm text-success">Review submitted successfully</p>
            </div>
          )}

          <EmployeeSearch
            label="Employee Being Reviewed"
            placeholder="Search employee by name or ID..."
            onChange={(id) => setSelectedEmployeeId(id)}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cycleId">Review Cycle</Label>
              <Select
                value={formData.cycleId}
                onValueChange={(value: string) => handleSelectChange('cycleId', value)}
              >
                <SelectTrigger id="cycleId">
                  <SelectValue placeholder="Select cycle" />
                </SelectTrigger>
                <SelectContent>
                  {reviewCycles.length === 0 ? (
                    <SelectItem value="_none" disabled>
                      No cycles available
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

            <div>
              <Label htmlFor="reviewType">Review Type</Label>
              <Select
                value={formData.reviewType}
                onValueChange={(value: string) => handleSelectChange('reviewType', value)}
              >
                <SelectTrigger id="reviewType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Self">Self Assessment</SelectItem>
                  <SelectItem value="Manager">Manager Review</SelectItem>
                  <SelectItem value="Peer">Peer Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="rating">Rating (1-5 Stars)</Label>
            <Select value={formData.rating} onValueChange={(v: string) => handleSelectChange('rating', v)}>
              <SelectTrigger id="rating">
                <SelectValue placeholder="Select rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Star - Needs Improvement</SelectItem>
                <SelectItem value="2">2 Stars - Below Expectations</SelectItem>
                <SelectItem value="3">3 Stars - Meets Expectations</SelectItem>
                <SelectItem value="4">4 Stars - Exceeds Expectations</SelectItem>
                <SelectItem value="5">5 Stars - Outstanding</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.rating && (
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 ${
                    i < parseInt(formData.rating)
                      ? 'fill-warning text-warning'
                      : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>
          )}

          <div>
            <Label htmlFor="comments">Comments</Label>
            <Textarea
              id="comments"
              value={formData.comments}
              onChange={(e) => setFormData((prev) => ({ ...prev, comments: e.target.value }))}
              placeholder="Provide detailed feedback and comments about performance"
              rows={5}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.comments.length} characters
            </p>
          </div>

          <Button type="submit" disabled={loading || !validateForm()} className="w-full">
            {loading ? 'Submitting Review...' : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
