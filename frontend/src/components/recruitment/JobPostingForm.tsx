import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { recruitmentService } from '../../services/recruitmentService';
import { Briefcase, Plus, X } from 'lucide-react';

interface JobPostingFormProps {
  onSuccess?: () => void;
}

export const JobPostingForm: React.FC<JobPostingFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    department_id: '',
    location: '',
    description: '',
    required_skills: [] as string[],
    experience_min: 0,
    experience_max: 0,
    application_deadline: '',
  });

  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes('experience') ? parseInt(value) : value,
    }));
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        required_skills: [...prev.required_skills, skillInput.trim()],
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      required_skills: prev.required_skills.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await recruitmentService.createJobPosting(formData);
      setFormData({
        title: '',
        department_id: '',
        location: '',
        description: '',
        required_skills: [],
        experience_min: 0,
        experience_max: 0,
        application_deadline: '',
      });
      onSuccess?.();
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
          <Briefcase className="w-5 h-5" />
          Create Job Posting
        </CardTitle>
        <CardDescription>Post a new job opening</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Senior Developer"
                required
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., New York, NY"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="experience_min">Min Experience (years)</Label>
              <Input
                id="experience_min"
                name="experience_min"
                type="number"
                value={formData.experience_min}
                onChange={handleInputChange}
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="experience_max">Max Experience (years)</Label>
              <Input
                id="experience_max"
                name="experience_max"
                type="number"
                value={formData.experience_max}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="application_deadline">Application Deadline</Label>
            <Input
              id="application_deadline"
              name="application_deadline"
              type="date"
              value={formData.application_deadline}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Job Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the role, responsibilities, and requirements"
              rows={4}
              required
            />
          </div>

          <div>
            <Label>Required Skills</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Add a skill"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button type="button" onClick={addSkill} variant="outline" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.required_skills.map((skill, index) => (
                <div key={index} className="bg-muted px-3 py-1 rounded-full flex items-center gap-2 text-sm">
                  {skill}
                  <button type="button" onClick={() => removeSkill(index)} className="hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating...' : 'Create Job Posting'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
