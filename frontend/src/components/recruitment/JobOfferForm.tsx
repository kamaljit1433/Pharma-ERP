import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useRecruitmentStore } from '../../store/recruitmentStore';
import { OfferLetter } from '../../types/recruitment';
import { Award, Send, AlertCircle } from 'lucide-react';

interface JobOfferFormProps {
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const JobOfferForm: React.FC<JobOfferFormProps> = ({
  applicantId,
  applicantName,
  applicantEmail,
  onSuccess,
  onCancel,
}) => {
  const { generateOffer, sendOffer, loading, error } = useRecruitmentStore();

  const [formData, setFormData] = useState({
    position: '',
    department: '',
    salary: '',
    start_date: '',
    terms: '',
  });

  const [generatedOfferId, setGeneratedOfferId] = useState<string | null>(null);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setLocalError('');
  };

  const validateForm = (): boolean => {
    if (!formData.position.trim()) {
      setLocalError('Position is required');
      return false;
    }
    if (!formData.department.trim()) {
      setLocalError('Department is required');
      return false;
    }
    if (!formData.salary || parseFloat(formData.salary) <= 0) {
      setLocalError('Valid salary is required');
      return false;
    }
    if (!formData.start_date) {
      setLocalError('Start date is required');
      return false;
    }
    if (!formData.terms.trim()) {
      setLocalError('Terms and conditions are required');
      return false;
    }
    return true;
  };

  const handleGenerateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLocalError('');
    setSuccessMessage('');

    try {
      const response = await generateOffer({
        applicant_id: applicantId,
        position: formData.position,
        department: formData.department,
        salary: parseFloat(formData.salary),
        start_date: new Date(formData.start_date),
        terms: formData.terms,
      });

      setGeneratedOfferId(response.id);
      setSuccessMessage('Offer letter generated successfully');
    } catch (err) {
      setLocalError((err as Error).message || 'Failed to generate offer letter');
    }
  };

  const handleSendOffer = async () => {
    if (!generatedOfferId) return;

    setLocalError('');
    setSuccessMessage('');

    try {
      await sendOffer(generatedOfferId);
      setSuccessMessage('Offer letter sent successfully to ' + applicantEmail);
      setFormData({
        position: '',
        department: '',
        salary: '',
        start_date: '',
        terms: '',
      });
      setGeneratedOfferId(null);
      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch (err) {
      setLocalError((err as Error).message || 'Failed to send offer letter');
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          Create Job Offer
        </CardTitle>
        <CardDescription>Create and send a job offer to {applicantName}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleGenerateOffer} className="space-y-4">
          {/* Error Alert */}
          {(localError || error) && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{localError || error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm flex items-start gap-2">
              <Award className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Candidate Info */}
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm">
              <span className="font-medium">Candidate:</span> {applicantName}
            </p>
            <p className="text-sm">
              <span className="font-medium">Email:</span> {applicantEmail}
            </p>
          </div>

          {/* Position and Department */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="position">Position *</Label>
              <Input
                id="position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                placeholder="e.g., Senior Developer"
                disabled={loading || !!generatedOfferId}
              />
            </div>

            <div>
              <Label htmlFor="department">Department *</Label>
              <Input
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                placeholder="e.g., Engineering"
                disabled={loading || !!generatedOfferId}
              />
            </div>
          </div>

          {/* Salary and Start Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salary">Annual Salary (₹) *</Label>
              <Input
                id="salary"
                name="salary"
                type="number"
                value={formData.salary}
                onChange={handleInputChange}
                placeholder="0"
                disabled={loading || !!generatedOfferId}
              />
            </div>

            <div>
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleInputChange}
                disabled={loading || !!generatedOfferId}
              />
            </div>
          </div>

          {/* Terms and Conditions */}
          <div>
            <Label htmlFor="terms">Terms & Conditions *</Label>
            <Textarea
              id="terms"
              name="terms"
              value={formData.terms}
              onChange={handleInputChange}
              placeholder="Enter offer terms and conditions (e.g., probation period, benefits, etc.)"
              rows={4}
              disabled={loading || !!generatedOfferId}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            {!generatedOfferId ? (
              <>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Generating...' : 'Generate Offer Letter'}
                </Button>
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  type="button"
                  onClick={handleSendOffer}
                  disabled={loading}
                  className="flex-1"
                  variant="default"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? 'Sending...' : 'Send Offer Letter'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setGeneratedOfferId(null);
                    setFormData({
                      position: '',
                      department: '',
                      salary: '',
                      start_date: '',
                      terms: '',
                    });
                  }}
                  disabled={loading}
                >
                  Create Another
                </Button>
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
