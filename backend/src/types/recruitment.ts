export interface JobPosting {
  id: string;
  title: string;
  department_id: string;
  designation_id: string;
  description: string;
  positions_count: number;
  status: 'draft' | 'open' | 'closed' | 'on_hold';
  posted_date?: Date;
  closing_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateJobPostingDTO {
  title: string;
  department_id: string;
  designation_id: string;
  description: string;
  positions_count: number;
  posted_date?: Date;
  closing_date?: Date;
}

export interface UpdateJobPostingDTO {
  title?: string;
  description?: string;
  positions_count?: number;
  status?: 'draft' | 'open' | 'closed' | 'on_hold';
  posted_date?: Date;
  closing_date?: Date;
}

export interface JobPostingFilters {
  department_id?: string;
  status?: 'draft' | 'open' | 'closed' | 'on_hold';
  search?: string;
  limit?: number;
  offset?: number;
}

export interface Applicant {
  id: string;
  job_posting_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  resume_url?: string;
  cover_letter?: string;
  stage: 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Interview {
  id: string;
  applicant_id: string;
  interviewer_id?: string;
  type: 'phone' | 'video' | 'in_person';
  scheduled_at: Date;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface InterviewFeedback {
  id: string;
  interview_id: string;
  interviewer_id: string;
  rating: number;
  comments?: string;
  recommendation: 'hire' | 'maybe' | 'reject';
  created_at: Date;
}

export interface ApplicantNote {
  id: string;
  applicant_id: string;
  note: string;
  created_by: string;
  created_at: Date;
}

export interface OnboardingChecklist {
  id: string;
  employee_id: string;
  title: string;
  description?: string;
  items: OnboardingChecklistItem[];
  status: 'pending' | 'in_progress' | 'completed';
  target_completion_date?: Date;
  completed_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface OnboardingChecklistItem {
  id: string;
  checklist_id: string;
  title: string;
  description: string;
  assigned_to?: string;
  completed: boolean;
  completed_at?: Date;
  completed_by?: string;
}

export interface OfferLetter {
  id: string;
  applicant_id: string;
  position: string;
  department: string;
  salary: number;
  start_date: Date;
  terms: string;
  status: 'Draft' | 'Sent' | 'Signed' | 'Accepted' | 'Rejected';
  created_at: Date;
  updated_at: Date;
}

export interface CreateApplicantDTO {
  name: string;
  email: string;
  contact_number: string;
  resume_url: string;
}

export interface UpdateApplicantDTO {
  stage?: 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
}

export interface CreateInterviewDTO {
  applicant_id: string;
  scheduled_at: Date;
  type?: 'phone' | 'video' | 'in_person';
  mode?: 'In-Person' | 'Video' | 'Phone';
  interviewer_id?: string;
  interviewers?: string[];
  duration_minutes?: number;
}

export interface CreateInterviewFeedbackDTO {
  interview_id: string;
  interviewer_id: string;
  rating: number;
  comments?: string;
  recommendation: 'hire' | 'maybe' | 'reject';
}

export interface CreateOfferLetterDTO {
  applicant_id: string;
  position: string;
  department: string;
  salary: number;
  start_date: Date;
  terms: string;
}

export interface CreateOnboardingChecklistDTO {
  employee_id: string;
  items: Array<{
    title: string;
    description: string;
    assigned_to?: string;
  }>;
}
