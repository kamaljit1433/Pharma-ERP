export interface TrainingProgram {
  id: string;
  name: string;
  description?: string;
  provider?: string;
  start_date: Date;
  end_date: Date;
  duration_hours: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  max_participants?: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTrainingProgramDTO {
  name: string;
  description?: string;
  provider?: string;
  start_date: Date;
  end_date: Date;
  duration_hours: number;
  max_participants?: number;
}

export interface UpdateTrainingProgramDTO {
  name?: string;
  description?: string;
  provider?: string;
  start_date?: Date;
  end_date?: Date;
  duration_hours?: number;
  status?: 'draft' | 'active' | 'completed' | 'cancelled';
  max_participants?: number;
}

export interface TrainingEnrollment {
  id: string;
  employee_id: string;
  training_program_id: string;
  status: 'enrolled' | 'in_progress' | 'completed' | 'cancelled';
  enrollment_date: Date;
  completion_date?: Date;
  score?: number;
  passed?: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTrainingEnrollmentDTO {
  employee_id: string;
  training_program_id: string;
  enrollment_date: Date;
}

export interface UpdateTrainingEnrollmentDTO {
  status?: 'enrolled' | 'in_progress' | 'completed' | 'cancelled';
  completion_date?: Date;
  score?: number;
  passed?: boolean;
}

export interface Certification {
  id: string;
  employee_id: string;
  name: string;
  issuing_organization: string;
  certificate_number?: string;
  issue_date: Date;
  expiry_date?: Date;
  certificate_url?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCertificationDTO {
  employee_id: string;
  name: string;
  issuing_organization: string;
  certificate_number?: string;
  issue_date: Date;
  expiry_date?: Date;
  certificate_url?: string;
}

export interface UpdateCertificationDTO {
  name?: string;
  issuing_organization?: string;
  certificate_number?: string;
  issue_date?: Date;
  expiry_date?: Date;
  certificate_url?: string;
  is_active?: boolean;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string;
  created_at: Date;
}

export interface CreateSkillDTO {
  name: string;
  category: string;
  description?: string;
}

export interface EmployeeSkill {
  id: string;
  employee_id: string;
  skill_id: string;
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years_of_experience?: number;
  last_used_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateEmployeeSkillDTO {
  employee_id: string;
  skill_id: string;
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years_of_experience?: number;
}

export interface UpdateEmployeeSkillDTO {
  proficiency_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years_of_experience?: number;
  last_used_date?: Date;
}

export interface SkillGapReport {
  department_id: string;
  required_skills: SkillGap[];
  team_coverage_percentage: number;
  generated_at: Date;
}

export interface SkillGap {
  skill_id: string;
  skill_name: string;
  required_proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  employees_with_skill: number;
  total_employees: number;
  coverage_percentage: number;
}
