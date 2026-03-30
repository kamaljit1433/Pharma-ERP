import { Knex } from 'knex';
import { TrainingProgramRepository } from '../repositories/trainingProgramRepository';
import { TrainingEnrollmentRepository } from '../repositories/trainingEnrollmentRepository';
import { CertificationRepository } from '../repositories/certificationRepository';
import { SkillRepository } from '../repositories/skillRepository';
import { EmployeeSkillRepository } from '../repositories/employeeSkillRepository';
import {
  TrainingProgram,
  CreateTrainingProgramDTO,
  UpdateTrainingProgramDTO,
  TrainingEnrollment,
  CreateTrainingEnrollmentDTO,
  UpdateTrainingEnrollmentDTO,
  Certification,
  CreateCertificationDTO,
  UpdateCertificationDTO,
  Skill,
  CreateSkillDTO,
  EmployeeSkill,
  CreateEmployeeSkillDTO,
  UpdateEmployeeSkillDTO,
  SkillGapReport,
  SkillGap,
} from '../types/training';

export class TrainingService {
  private trainingProgramRepository: TrainingProgramRepository;
  private trainingEnrollmentRepository: TrainingEnrollmentRepository;
  private certificationRepository: CertificationRepository;
  private skillRepository: SkillRepository;
  private employeeSkillRepository: EmployeeSkillRepository;

  constructor(private db: Knex) {
    this.trainingProgramRepository = new TrainingProgramRepository(db);
    this.trainingEnrollmentRepository = new TrainingEnrollmentRepository(db);
    this.certificationRepository = new CertificationRepository(db);
    this.skillRepository = new SkillRepository(db);
    this.employeeSkillRepository = new EmployeeSkillRepository(db);
  }

  // Training Program Methods
  async createTrainingProgram(data: CreateTrainingProgramDTO): Promise<TrainingProgram> {
    return this.trainingProgramRepository.createTrainingProgram(data);
  }

  async getTrainingProgram(id: string): Promise<TrainingProgram | null> {
    return this.trainingProgramRepository.getTrainingProgramById(id);
  }

  async getAllTrainingPrograms(status?: string): Promise<TrainingProgram[]> {
    return this.trainingProgramRepository.getAllTrainingPrograms(status);
  }

  async getActiveTrainingPrograms(): Promise<TrainingProgram[]> {
    return this.trainingProgramRepository.getActiveTrainingPrograms();
  }

  async updateTrainingProgram(id: string, data: UpdateTrainingProgramDTO): Promise<TrainingProgram> {
    return this.trainingProgramRepository.updateTrainingProgram(id, data);
  }

  async deleteTrainingProgram(id: string): Promise<void> {
    return this.trainingProgramRepository.deleteTrainingProgram(id);
  }

  // Training Enrollment Methods
  async enrollEmployee(data: CreateTrainingEnrollmentDTO): Promise<TrainingEnrollment> {
    // Check if already enrolled
    const exists = await this.trainingEnrollmentRepository.checkEnrollmentExists(
      data.employee_id,
      data.training_program_id
    );

    if (exists) {
      throw new Error('Employee is already enrolled in this training program');
    }

    return this.trainingEnrollmentRepository.createTrainingEnrollment(data);
  }

  async getTrainingEnrollment(id: string): Promise<TrainingEnrollment | null> {
    return this.trainingEnrollmentRepository.getTrainingEnrollmentById(id);
  }

  async getEmployeeEnrollments(employeeId: string): Promise<TrainingEnrollment[]> {
    return this.trainingEnrollmentRepository.getEmployeeEnrollments(employeeId);
  }

  async getProgramEnrollments(programId: string): Promise<TrainingEnrollment[]> {
    return this.trainingEnrollmentRepository.getProgramEnrollments(programId);
  }

  async markEnrollmentComplete(enrollmentId: string): Promise<TrainingEnrollment> {
    const enrollment = await this.trainingEnrollmentRepository.getTrainingEnrollmentById(enrollmentId);

    if (!enrollment) {
      throw new Error('Training enrollment not found');
    }

    const updated = await this.trainingEnrollmentRepository.updateTrainingEnrollment(enrollmentId, {
      status: 'completed',
      completion_date: new Date(),
    });

    // Auto-update skills on training completion
    await this.autoUpdateSkillsOnCompletion(enrollment.employee_id, enrollment.training_program_id);

    return updated;
  }

  async updateTrainingEnrollment(id: string, data: UpdateTrainingEnrollmentDTO): Promise<TrainingEnrollment> {
    return this.trainingEnrollmentRepository.updateTrainingEnrollment(id, data);
  }

  async deleteTrainingEnrollment(id: string): Promise<void> {
    return this.trainingEnrollmentRepository.deleteTrainingEnrollment(id);
  }

  // Certification Methods
  async addCertification(data: CreateCertificationDTO): Promise<Certification> {
    return this.certificationRepository.createCertification(data);
  }

  async getCertification(id: string): Promise<Certification | null> {
    return this.certificationRepository.getCertificationById(id);
  }

  async getEmployeeCertifications(employeeId: string): Promise<Certification[]> {
    return this.certificationRepository.getEmployeeCertifications(employeeId);
  }

  async getExpiringCertifications(daysBeforeExpiry?: number): Promise<Certification[]> {
    return this.certificationRepository.getExpiringCertifications(daysBeforeExpiry);
  }

  async getExpiredCertifications(): Promise<Certification[]> {
    return this.certificationRepository.getExpiredCertifications();
  }

  async updateCertification(id: string, data: UpdateCertificationDTO): Promise<Certification> {
    return this.certificationRepository.updateCertification(id, data);
  }

  async deleteCertification(id: string): Promise<void> {
    return this.certificationRepository.deleteCertification(id);
  }

  // Skill Methods
  async createSkill(data: CreateSkillDTO): Promise<Skill> {
    return this.skillRepository.createSkill(data);
  }

  async getSkill(id: string): Promise<Skill | null> {
    return this.skillRepository.getSkillById(id);
  }

  async getAllSkills(): Promise<Skill[]> {
    return this.skillRepository.getAllSkills();
  }

  async getSkillsByCategory(category: string): Promise<Skill[]> {
    return this.skillRepository.getSkillsByCategory(category);
  }

  async deleteSkill(id: string): Promise<void> {
    return this.skillRepository.deleteSkill(id);
  }

  // Employee Skill Methods
  async addEmployeeSkill(data: CreateEmployeeSkillDTO): Promise<EmployeeSkill> {
    return this.employeeSkillRepository.createEmployeeSkill(data);
  }

  async getEmployeeSkill(id: string): Promise<EmployeeSkill | null> {
    return this.employeeSkillRepository.getEmployeeSkillById(id);
  }

  async getEmployeeSkills(employeeId: string): Promise<EmployeeSkill[]> {
    return this.employeeSkillRepository.getEmployeeSkills(employeeId);
  }

  async updateEmployeeSkill(id: string, data: UpdateEmployeeSkillDTO): Promise<EmployeeSkill> {
    return this.employeeSkillRepository.updateEmployeeSkill(id, data);
  }

  async deleteEmployeeSkill(id: string): Promise<void> {
    return this.employeeSkillRepository.deleteEmployeeSkill(id);
  }

  // Skill Gap Analysis
  async generateSkillGapReport(departmentId: string): Promise<SkillGapReport> {
    // Get all employees in department
    const employees = await this.db('employees')
      .where('department_id', departmentId)
      .select('id');

    if (employees.length === 0) {
      return {
        department_id: departmentId,
        required_skills: [],
        team_coverage_percentage: 0,
        generated_at: new Date(),
      };
    }

    const employeeIds = employees.map((e) => e.id);

    // Get all skills
    const allSkills = await this.skillRepository.getAllSkills();

    // Calculate coverage for each skill
    const skillGaps: SkillGap[] = [];

    for (const skill of allSkills) {
      const employeesWithSkill = await this.db('employee_skills')
        .where('skill_id', skill.id)
        .whereIn('employee_id', employeeIds)
        .count('* as count')
        .first();

      const count = (employeesWithSkill?.['count'] as number) || 0;
      const coveragePercentage = (count / employeeIds.length) * 100;

      skillGaps.push({
        skill_id: skill.id,
        skill_name: skill.name,
        required_proficiency: 'intermediate',
        employees_with_skill: count,
        total_employees: employeeIds.length,
        coverage_percentage: Math.round(coveragePercentage),
      });
    }

    // Calculate overall team coverage
    const totalCoverage = skillGaps.reduce((sum, gap) => sum + gap.coverage_percentage, 0);
    const teamCoveragePercentage = allSkills.length > 0 ? Math.round(totalCoverage / allSkills.length) : 0;

    return {
      department_id: departmentId,
      required_skills: skillGaps,
      team_coverage_percentage: teamCoveragePercentage,
      generated_at: new Date(),
    };
  }

  // Helper method to auto-update skills on training completion
  private async autoUpdateSkillsOnCompletion(_employeeId: string, _trainingProgramId: string): Promise<void> {
    // This is a placeholder for linking training programs to skills
    // In a real implementation, you would have a training_program_skills junction table
    // For now, this method can be extended when that relationship is defined
  }

  // Bulk enrollment
  async bulkEnrollEmployees(employeeIds: string[], trainingProgramId: string): Promise<TrainingEnrollment[]> {
    const enrollments: TrainingEnrollment[] = [];
    const enrollmentDate = new Date();

    for (const employeeId of employeeIds) {
      try {
        const exists = await this.trainingEnrollmentRepository.checkEnrollmentExists(
          employeeId,
          trainingProgramId
        );

        if (!exists) {
          const enrollment = await this.trainingEnrollmentRepository.createTrainingEnrollment({
            employee_id: employeeId,
            training_program_id: trainingProgramId,
            enrollment_date: enrollmentDate,
          });
          enrollments.push(enrollment);
        }
      } catch (error) {
        // Continue with next employee if one fails
        console.error(`Failed to enroll employee ${employeeId}:`, error);
      }
    }

    return enrollments;
  }

  // Self-enrollment with approval
  async requestSelfEnrollment(employeeId: string, trainingProgramId: string): Promise<TrainingEnrollment> {
    // Check if already enrolled
    const exists = await this.trainingEnrollmentRepository.checkEnrollmentExists(
      employeeId,
      trainingProgramId
    );

    if (exists) {
      throw new Error('Employee is already enrolled in this training program');
    }

    // Create enrollment with pending status (requires approval)
    return this.trainingEnrollmentRepository.createTrainingEnrollment({
      employee_id: employeeId,
      training_program_id: trainingProgramId,
      enrollment_date: new Date(),
    });
  }

  // Send training reminders (3 days before)
  async sendTrainingReminders(): Promise<void> {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    // Get all training programs starting in 3 days
    const programs = await this.db('training_programs')
      .where('start_date', '<=', threeDaysFromNow)
      .where('start_date', '>=', new Date())
      .select('*');

    for (const program of programs) {
      // Get all enrolled employees
      const enrollments = await this.trainingEnrollmentRepository.getProgramEnrollments(program.id);

      for (const enrollment of enrollments) {
        // Send reminder notification (integrate with notification service)
        console.log(`Reminder: Training ${program.name} starts in 3 days for employee ${enrollment.employee_id}`);
      }
    }
  }

  // Issue completion certificates
  async issueCertificate(enrollmentId: string, certificateData: {
    name: string;
    issuing_organization: string;
    certificate_number?: string;
  }): Promise<Certification> {
    const enrollment = await this.trainingEnrollmentRepository.getTrainingEnrollmentById(enrollmentId);

    if (!enrollment) {
      throw new Error('Training enrollment not found');
    }

    if (enrollment.status !== 'completed') {
      throw new Error('Enrollment must be completed before issuing certificate');
    }

    // Create certification record
    const certData: CreateCertificationDTO = {
      employee_id: enrollment.employee_id,
      name: certificateData.name,
      issuing_organization: certificateData.issuing_organization,
      issue_date: new Date(),
    };

    if (certificateData.certificate_number) {
      certData.certificate_number = certificateData.certificate_number;
    }

    return this.certificationRepository.createCertification(certData);
  }

  // Send certification expiry alerts (30 days before)
  async sendCertificationExpiryAlerts(): Promise<void> {
    const expiringCerts = await this.certificationRepository.getExpiringCertifications(30);

    for (const cert of expiringCerts) {
      // Send alert notification (integrate with notification service)
      console.log(`Alert: Certification ${cert.name} expires on ${cert.expiry_date} for employee ${cert.employee_id}`);
    }
  }

  // Get certification inventory
  async getCertificationInventory(): Promise<any> {
    const certifications = await this.db('certifications')
      .select('*')
      .where('is_active', true);

    const inventory = {
      total_certifications: certifications.length,
      active_certifications: certifications.filter((c: any) => !c.expiry_date || new Date(c.expiry_date) > new Date()).length,
      expiring_soon: certifications.filter((c: any) => {
        if (!c.expiry_date) return false;
        const expiryDate = new Date(c.expiry_date);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return expiryDate <= thirtyDaysFromNow && expiryDate > new Date();
      }).length,
      expired: certifications.filter((c: any) => c.expiry_date && new Date(c.expiry_date) <= new Date()).length,
      by_organization: {} as Record<string, number>,
    };

    // Count by organization
    for (const cert of certifications) {
      const org = cert.issuing_organization;
      inventory.by_organization[org] = (inventory.by_organization[org] || 0) + 1;
    }

    return inventory;
  }

  // Link certifications to role competencies
  async linkCertificationToRole(certificationId: string, roleId: string): Promise<void> {
    // This would require a certifications_role_competencies junction table
    // For now, this is a placeholder
    console.log(`Linking certification ${certificationId} to role ${roleId}`);
  }

  // Team skill matrix view
  async getTeamSkillMatrix(departmentId: string): Promise<any> {
    const employees = await this.db('employees')
      .where('department_id', departmentId)
      .select('id', 'first_name', 'last_name');

    const skillMatrix: any[] = [];

    for (const employee of employees) {
      const skills = await this.employeeSkillRepository.getEmployeeSkills(employee.id);
      skillMatrix.push({
        employee_id: employee.id,
        employee_name: `${employee.first_name} ${employee.last_name}`,
        skills: skills.map((s) => ({
          skill_id: s.skill_id,
          proficiency_level: s.proficiency_level,
          years_of_experience: s.years_of_experience,
        })),
      });
    }

    return skillMatrix;
  }
}
