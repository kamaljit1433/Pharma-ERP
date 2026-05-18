import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { useRecruitmentStore } from '../../store/recruitmentStore';
import { Award, Send, AlertCircle } from 'lucide-react';
import { SearchableSelect } from '../ui/searchable-select';
import { DatePicker } from '../ui/date-picker';
import hierarchyService, { Department } from '../../services/hierarchyService';

interface JobOfferFormProps {
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  initialDepartment?: string;
  initialPosition?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const JobOfferForm: React.FC<JobOfferFormProps> = ({
  applicantId,
  applicantName,
  applicantEmail,
  initialDepartment = '',
  initialPosition = '',
  onSuccess,
  onCancel,
}) => {
  const { generateOffer, sendOffer, loading, error } = useRecruitmentStore();

  const [formData, setFormData] = useState({
    position: initialPosition,
    department: initialDepartment,
    salary: '',
    start_date: '',
    terms: '',
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [generatedOfferId, setGeneratedOfferId] = useState<string | null>(null);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    hierarchyService.getDepartments().then(setDepartments).catch(() => {});
  }, []);

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
      setSuccessMessage('Offer letter generated! You can send it now or later from Job Offer Tracker.');
      // Move candidate to Offer stage immediately after generation
      onSuccess?.();
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <SearchableSelect
                options={departments}
                value={departments.find((d) => d.name === formData.department)?.id ?? ''}
                onChange={(id) => {
                  const name = departments.find((d) => d.id === id)?.name ?? '';
                  setFormData((p) => ({ ...p, department: name }));
                  setLocalError('');
                }}
                placeholder="Search department..."
                disabled={loading || !!generatedOfferId}
              />
            </div>
          </div>

          {/* Salary and Start Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <DatePicker
                id="start_date"
                value={formData.start_date}
                onChange={(val) => { setFormData((p) => ({ ...p, start_date: val })); setLocalError(''); }}
                placeholder="Select start date"
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
