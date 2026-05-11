import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { SearchableSelect } from '../ui/searchable-select';
import { recruitmentService } from '../../services/recruitmentService';
import hierarchyService, { Department } from '../../services/hierarchyService';
import { jobPostingSchema, type JobPostingFormData } from '../../utils/schemas';
import { Briefcase, Plus, X, AlertCircle } from 'lucide-react';
import { ZodError } from 'zod';

interface JobPostingFormProps {
  onSuccess?: () => void;
  initialData?: Partial<JobPostingFormData>;
  isEditing?: boolean;
}

export const JobPostingForm: React.FC<JobPostingFormProps> = ({ onSuccess, initialData, isEditing = false }) => {
  const [formData, setFormData] = useState<JobPostingFormData>({
    title: initialData?.title || '',
    department_id: initialData?.department_id || '',
    location: initialData?.location || '',
    description: initialData?.description || '',
    required_skills: initialData?.required_skills || [],
    experience_min: initialData?.experience_min || 0,
    experience_max: initialData?.experience_max || 0,
    positions_count: initialData?.positions_count || 1,
    application_deadline: initialData?.application_deadline || '',
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  useEffect(() => {
    hierarchyService.getDepartments().then(setDepartments).catch(() => {});
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes('experience') || name === 'positions_count' ? parseInt(value) || 0 : value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      const newSkills = [...formData.required_skills, skillInput.trim()];
      setFormData((prev) => ({
        ...prev,
        required_skills: newSkills,
      }));
      setSkillInput('');
      // Clear error for skills field
      if (errors.required_skills) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.required_skills;
          return newErrors;
        });
      }
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
    setErrors({});
    setGeneralError('');

    try {
      // Validate form data
      const validatedData = jobPostingSchema.parse(formData);
      
      // Submit to API
      await recruitmentService.createJobPosting(validatedData);
      
      // Reset form
      setFormData({
        title: '',
        department_id: '',
        location: '',
        description: '',
        required_skills: [],
        experience_min: 0,
        experience_max: 0,
        positions_count: 1,
        application_deadline: '',
      });
      onSuccess?.();
    } catch (err) {
      if (err instanceof ZodError) {
        // Handle validation errors
        const fieldErrors: Record<string, string> = {};
        if (err.issues) {
          err.issues.forEach((issue) => {
            const path = issue.path.join('.');
            fieldErrors[path] = issue.message;
          });
        }
        setErrors(fieldErrors);
      } else {
        setGeneralError((err as Error).message || 'Failed to create job posting');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          {isEditing ? 'Edit Job Posting' : 'Create Job Posting'}
        </CardTitle>
        <CardDescription>{isEditing ? 'Update job posting details' : 'Post a new job opening'}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {generalError && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Senior Developer"
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && <p className="text-destructive text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., New York, NY"
                className={errors.location ? 'border-destructive' : ''}
              />
              {errors.location && <p className="text-destructive text-sm mt-1">{errors.location}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="department_id">Department *</Label>
            <SearchableSelect
              options={departments}
              value={formData.department_id}
              onChange={(id) => {
                setFormData((prev) => ({ ...prev, department_id: id }));
                if (errors.department_id) {
                  setErrors((prev) => { const e = { ...prev }; delete e.department_id; return e; });
                }
              }}
              placeholder="Select department"
              className={errors.department_id ? '[&>button]:border-destructive' : ''}
            />
            {errors.department_id && <p className="text-destructive text-sm mt-1">{errors.department_id}</p>}
          </div>

          <div>
            <Label htmlFor="positions_count">Number of Positions *</Label>
            <Input
              id="positions_count"
              name="positions_count"
              type="number"
              value={formData.positions_count}
              onChange={handleInputChange}
              min="1"
              className={errors.positions_count ? 'border-destructive' : ''}
            />
            {errors.positions_count && <p className="text-destructive text-sm mt-1">{errors.positions_count}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="experience_min">Min Experience (years) *</Label>
              <Input
                id="experience_min"
                name="experience_min"
                type="number"
                value={formData.experience_min}
                onChange={handleInputChange}
                min="0"
                className={errors.experience_min ? 'border-destructive' : ''}
              />
              {errors.experience_min && <p className="text-destructive text-sm mt-1">{errors.experience_min}</p>}
            </div>

            <div>
              <Label htmlFor="experience_max">Max Experience (years) *</Label>
              <Input
                id="experience_max"
                name="experience_max"
                type="number"
                value={formData.experience_max}
                onChange={handleInputChange}
                min="0"
                className={errors.experience_max ? 'border-destructive' : ''}
              />
              {errors.experience_max && <p className="text-destructive text-sm mt-1">{errors.experience_max}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="application_deadline">Application Deadline *</Label>
            <Input
              id="application_deadline"
              name="application_deadline"
              type="date"
              value={formData.application_deadline}
              onChange={handleInputChange}
              className={errors.application_deadline ? 'border-destructive' : ''}
            />
            {errors.application_deadline && <p className="text-destructive text-sm mt-1">{errors.application_deadline}</p>}
          </div>

          <div>
            <Label htmlFor="description">Job Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the role, responsibilities, and requirements"
              rows={4}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && <p className="text-destructive text-sm mt-1">{errors.description}</p>}
          </div>

          <div>
            <Label>Required Skills * ({formData.required_skills.length})</Label>
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
            {errors.required_skills && <p className="text-destructive text-sm mb-2">{errors.required_skills}</p>}
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
            {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Job Posting' : 'Create Job Posting')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
