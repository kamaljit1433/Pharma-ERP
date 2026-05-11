import { z } from 'zod';

// Job Posting Schema
export const jobPostingSchema = z.object({
  title: z
    .string()
    .min(1, 'Job title is required')
    .min(3, 'Job title must be at least 3 characters')
    .max(100, 'Job title must not exceed 100 characters'),
  department_id: z
    .string()
    .min(1, 'Department is required'),
  location: z
    .string()
    .min(1, 'Location is required')
    .min(2, 'Location must be at least 2 characters'),
  description: z
    .string()
    .min(1, 'Job description is required')
    .min(10, 'Job description must be at least 10 characters')
    .max(5000, 'Job description must not exceed 5000 characters'),
  required_skills: z
    .array(z.string())
    .min(1, 'At least one skill is required')
    .max(20, 'Maximum 20 skills allowed'),
  experience_min: z
    .number()
    .min(0, 'Minimum experience cannot be negative')
    .max(100, 'Minimum experience cannot exceed 100 years'),
  experience_max: z
    .number()
    .min(0, 'Maximum experience cannot be negative')
    .max(100, 'Maximum experience cannot exceed 100 years'),
  positions_count: z
    .number()
    .int('Positions count must be a whole number')
    .min(1, 'At least 1 position is required'),
  application_deadline: z
    .string()
    .min(1, 'Application deadline is required')
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, 'Application deadline must be in the future'),
}).refine(
  (data) => data.experience_max >= data.experience_min,
  {
    message: 'Maximum experience must be greater than or equal to minimum experience',
    path: ['experience_max'],
  }
);

export type JobPostingFormData = z.infer<typeof jobPostingSchema>;
