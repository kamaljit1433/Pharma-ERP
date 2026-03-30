export interface JobPosting {
  id: string;
  title: string;
  department_id: string;
  location: string;
  description: string;
  required_skills: string[];
  experience_min: number;
  experience_max: number;
  application_deadline: Date;
  status: 'Open' | 'Closed' | 'On Hold';
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface Applicant {
  id: string;
  job_posting_id: string;
  name: string;
  email: string;
  contact_number: string;
  resume_url: string;
  current_stage: 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';
  applied_at: Date;
  updated_at: Date;
}

export interface Interview {
  id: string;
  applicant_id: string;
  scheduled_at: Date;
  mode: 'In-Person' | 'Video' | 'Phone';
  interviewers: string[];
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  created_at: Date;
  updated_at: Date;
}

export interface InterviewFeedback {
  id: string;
  interview_id: string;
  interviewer_id: string;
  rating: number;
  comments: string;
  recommendation: 'Strong Hire' | 'Hire' | 'Maybe' | 'No Hire';
  submitted_at: Date;
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

export interface OnboardingChecklist {
  id: string;
  employee_id: string;
  created_at: Date;
  completed_at?: Date;
  items: OnboardingChecklistItem[];
}
