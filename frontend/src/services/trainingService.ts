import apiClient from './api';

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

export interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string;
  created_at: Date;
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

class TrainingService {
  // Training Program Methods
  async createTrainingProgram(data: Omit<TrainingProgram, 'id' | 'created_at' | 'updated_at'>): Promise<TrainingProgram> {
    const response = await apiClient.post('/training/programs', data);
    return response.data;
  }

  async getTrainingProgram(id: string): Promise<TrainingProgram> {
    const response = await apiClient.get(`/training/programs/${id}`);
    return response.data;
  }

  async getAllTrainingPrograms(status?: string): Promise<TrainingProgram[]> {
    const response = await apiClient.get('/training/programs', { params: { status } });
    return response.data;
  }

  async updateTrainingProgram(id: string, data: Partial<TrainingProgram>): Promise<TrainingProgram> {
    const response = await apiClient.put(`/training/programs/${id}`, data);
    return response.data;
  }

  async deleteTrainingProgram(id: string): Promise<void> {
    await apiClient.delete(`/training/programs/${id}`);
  }

  // Training Enrollment Methods
  async enrollEmployee(employeeId: string, trainingProgramId: string, enrollmentDate: Date): Promise<TrainingEnrollment> {
    const response = await apiClient.post('/training/enroll', {
      employee_id: employeeId,
      training_program_id: trainingProgramId,
      enrollment_date: enrollmentDate,
    });
    return response.data;
  }

  async getEmployeeEnrollments(employeeId: string): Promise<TrainingEnrollment[]> {
    const response = await apiClient.get(`/training/enrollments/${employeeId}`);
    return response.data;
  }

  async getProgramEnrollments(programId: string): Promise<TrainingEnrollment[]> {
    const response = await apiClient.get(`/training/programs/${programId}/enrollments`);
    return response.data;
  }

  async deleteEnrollment(enrollmentId: string): Promise<void> {
    await apiClient.delete(`/training/enrollments/${enrollmentId}`);
  }

  async markEnrollmentComplete(enrollmentId: string): Promise<TrainingEnrollment> {
    const response = await apiClient.put(`/training/enrollments/${enrollmentId}/complete`);
    return response.data;
  }

  // Certification Methods
  async addCertification(data: Omit<Certification, 'id' | 'created_at' | 'updated_at'>): Promise<Certification> {
    const response = await apiClient.post('/training/certifications', data);
    return response.data;
  }

  async getEmployeeCertifications(employeeId: string): Promise<Certification[]> {
    const response = await apiClient.get(`/training/certifications/${employeeId}`);
    return response.data;
  }

  async getExpiringCertifications(daysBeforeExpiry: number = 30): Promise<Certification[]> {
    const response = await apiClient.get('/training/certifications/expiring', {
      params: { daysBeforeExpiry },
    });
    return response.data;
  }

  async updateCertification(id: string, data: Partial<Certification>): Promise<Certification> {
    const response = await apiClient.put(`/training/certifications/${id}`, data);
    return response.data;
  }

  // Skill Methods
  async createSkill(data: Omit<Skill, 'id' | 'created_at'>): Promise<Skill> {
    const response = await apiClient.post('/training/skills', data);
    return response.data;
  }

  async getAllSkills(): Promise<Skill[]> {
    const response = await apiClient.get('/training/skills');
    return response.data;
  }

  async getSkillsByCategory(category: string): Promise<Skill[]> {
    const response = await apiClient.get(`/training/skills/category/${category}`);
    return response.data;
  }

  // Employee Skill Methods
  async addEmployeeSkill(data: Omit<EmployeeSkill, 'id' | 'created_at' | 'updated_at'>): Promise<EmployeeSkill> {
    const response = await apiClient.post('/training/employee-skills', data);
    return response.data;
  }

  async getEmployeeSkills(employeeId: string): Promise<EmployeeSkill[]> {
    const response = await apiClient.get(`/training/employee-skills/${employeeId}`);
    return response.data;
  }

  async updateEmployeeSkill(id: string, data: Partial<EmployeeSkill>): Promise<EmployeeSkill> {
    const response = await apiClient.put(`/training/employee-skills/${id}`, data);
    return response.data;
  }

  // Skill Gap Report
  async generateSkillGapReport(departmentId: string): Promise<SkillGapReport> {
    const response = await apiClient.get(`/training/skill-gap/${departmentId}`);
    return response.data;
  }

  // Bulk enrollment
  async bulkEnrollEmployees(employeeIds: string[], trainingProgramId: string): Promise<any> {
    const response = await apiClient.post('/training/bulk-enroll', {
      employee_ids: employeeIds,
      training_program_id: trainingProgramId,
    });
    return response.data;
  }

  // Self-enrollment request
  async requestSelfEnrollment(employeeId: string, trainingProgramId: string): Promise<TrainingEnrollment> {
    const response = await apiClient.post('/training/self-enroll', {
      employee_id: employeeId,
      training_program_id: trainingProgramId,
    });
    return response.data;
  }

  // Send training reminders
  async sendTrainingReminders(): Promise<any> {
    const response = await apiClient.post('/training/reminders/send');
    return response.data;
  }

  // Issue certificate
  async issueCertificate(enrollmentId: string, data: any): Promise<Certification> {
    const response = await apiClient.post(`/training/enrollments/${enrollmentId}/certificate`, data);
    return response.data;
  }

  // Send certification expiry alerts
  async sendCertificationExpiryAlerts(): Promise<any> {
    const response = await apiClient.post('/training/certifications/alerts/send');
    return response.data;
  }

  // Get certification inventory
  async getCertificationInventory(): Promise<any> {
    const response = await apiClient.get('/training/certifications/inventory');
    return response.data;
  }

  // Get team skill matrix
  async getTeamSkillMatrix(departmentId: string): Promise<any> {
    const response = await apiClient.get(`/training/team-skills/${departmentId}`);
    return response.data;
  }

  // Delete employee skill
  async deleteEmployeeSkill(id: string): Promise<void> {
    await apiClient.delete(`/training/employee-skills/${id}`);
  }
}

export default new TrainingService();
