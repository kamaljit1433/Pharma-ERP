export interface JobPosting {
  id: string;
  title: string;
  department_id?: string;
  department_name?: string;
  designation_id?: string;
  description: string;
  positions_count: number;
  closing_date?: string;
  status: 'draft' | 'open' | 'closed' | 'on_hold';
  created_at: Date;
  updated_at: Date;
  form_id?: string;
  form_url?: string;
  form_status?: 'pending' | 'generated' | 'failed';
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
  interviewer_id?: string;
  type?: 'phone' | 'video' | 'in_person';
  mode?: string;
  interviewers?: string[];
  scheduled_at: Date;
  duration_minutes?: number;
  status: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface InterviewFeedback {
  id: string;
  interview_id: string;
  interviewer_id: string;
  rating: number;
  technical_score: number;
  communication_score: number;
  cultural_fit_score: number;
  overall_impression: string;
  recommendation: 'Strong Hire' | 'Hire' | 'Maybe' | 'No Hire';
  submitted_at: Date;
}

export interface CreateInterviewDTO {
  applicant_id: string;
  scheduled_at: Date;
  mode: 'In-Person' | 'Video' | 'Phone';
  interviewers: string[];
  location?: string;
  notes?: string;
}

export interface InterviewFeedbackDTO {
  rating: number;
  technical_score: number;
  communication_score: number;
  cultural_fit_score: number;
  overall_impression: string;
  recommendation: 'Strong Hire' | 'Hire' | 'Maybe' | 'No Hire';
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

export interface CandidateCommunication {
  id: string;
  applicant_id: string;
  sender_id: string;
  sender_name: string;
  subject: string;
  body: string;
  sent_at: Date;
  read_at?: Date;
}

export interface SendCommunicationDTO {
  applicant_id: string;
  subject: string;
  body: string;
}
