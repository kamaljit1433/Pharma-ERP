import React, { useState } from 'react';
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

interface PerformanceReviewFormProps {
  employeeId: string;
  cycleId: string;
  reviewType: 'self' | 'manager' | 'peer';
  onSuccess?: () => void;
}

export const PerformanceReviewForm: React.FC<PerformanceReviewFormProps> = ({
  employeeId,
  cycleId,
  reviewType,
  onSuccess,
}) => {
  const { submitReview, error, clearError } = usePerformanceStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    rating: '',
    comments: '',
  });

  const getReviewTypeLabel = () => {
    switch (reviewType) {
      case 'self':
        return 'Self Assessment';
      case 'manager':
        return 'Manager Review';
      case 'peer':
        return 'Peer Review';
      default:
        return 'Performance Review';
    }
  };

  const handleRatingChange = (value: string) => {
    setFormData((prev) => ({ ...prev, rating: value }));
  };

  const handleCommentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, comments: e.target.value }));
  };

  const validateForm = (): boolean => {
    if (!formData.rating) {
      return false;
    }
    if (!formData.comments.trim()) {
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
      await submitReview({
        employeeId,
        cycleId,
        reviewType,
        rating: parseInt(formData.rating),
        comments: formData.comments,
      });
      setSuccess(true);
      setFormData({ rating: '', comments: '' });
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

          <div>
            <Label htmlFor="rating">Rating (1-5 Stars)</Label>
            <Select value={formData.rating} onValueChange={handleRatingChange}>
              <SelectTrigger id="rating">
                <SelectValue placeholder="Select rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">
                  <div className="flex items-center gap-2">
                    <span>1 Star - Needs Improvement</span>
                  </div>
                </SelectItem>
                <SelectItem value="2">
                  <div className="flex items-center gap-2">
                    <span>2 Stars - Below Expectations</span>
                  </div>
                </SelectItem>
                <SelectItem value="3">
                  <div className="flex items-center gap-2">
                    <span>3 Stars - Meets Expectations</span>
                  </div>
                </SelectItem>
                <SelectItem value="4">
                  <div className="flex items-center gap-2">
                    <span>4 Stars - Exceeds Expectations</span>
                  </div>
                </SelectItem>
                <SelectItem value="5">
                  <div className="flex items-center gap-2">
                    <span>5 Stars - Outstanding</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Star Display */}
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
              onChange={handleCommentsChange}
              placeholder="Provide detailed feedback and comments about performance"
              rows={5}
              aria-label="Review comments"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.comments.length} characters
            </p>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Submitting Review...' : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
