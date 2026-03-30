import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { recruitmentService } from '../../services/recruitmentService';
import { Award, Send } from 'lucide-react';

interface OfferLetterGeneratorProps {
  applicantId: string;
  applicantName: string;
  onSuccess?: () => void;
}

export const OfferLetterGenerator: React.FC<OfferLetterGeneratorProps> = ({ applicantId, applicantName, onSuccess }) => {
  const [formData, setFormData] = useState({
    position: '',
    department: '',
    salary: 0,
    start_date: '',
    terms: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [offerId, setOfferId] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'salary' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await recruitmentService.generateOfferLetter({
        applicant_id: applicantId,
        position: formData.position,
        department: formData.department,
        salary: formData.salary,
        start_date: new Date(formData.start_date),
        terms: formData.terms,
      });

      setOfferId(response.data?.id);
      setFormData({
        position: '',
        department: '',
        salary: 0,
        start_date: '',
        terms: '',
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOffer = async () => {
    if (!offerId) return;

    setLoading(true);
    try {
      await recruitmentService.sendOfferLetter(offerId);
      onSuccess?.();
      setOfferId(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          Generate Offer Letter
        </CardTitle>
        <CardDescription>Create an offer letter for {applicantName}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                placeholder="e.g., Senior Developer"
                required
              />
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                placeholder="e.g., Engineering"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salary">Annual Salary</Label>
              <Input
                id="salary"
                name="salary"
                type="number"
                value={formData.salary}
                onChange={handleInputChange}
                placeholder="0"
                required
              />
            </div>

            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="terms">Terms & Conditions</Label>
            <Textarea
              id="terms"
              name="terms"
              value={formData.terms}
              onChange={handleInputChange}
              placeholder="Enter offer terms and conditions"
              rows={4}
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Generating...' : 'Generate Offer Letter'}
          </Button>

          {offerId && (
            <Button type="button" onClick={handleSendOffer} disabled={loading} className="w-full" variant="default">
              <Send className="w-4 h-4 mr-2" />
              Send Offer Letter
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
