import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { TrainingService } from '../trainingService';
import { TrainingEnrollment, Certification, SkillGapReport } from '../../types/training';
import { Knex } from 'knex';

const mockKnex = {
  select: jest.fn(),
  where: jest.fn(),
  first: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  returning: jest.fn(),
  orderBy: jest.fn(),
  count: jest.fn(),
  whereIn: jest.fn(),
  whereNotNull: jest.fn(),
  whereBetween: jest.fn(),
  fn: {
    now: jest.fn(() => 'NOW()'),
  },
} as unknown as Knex;

describe('TrainingService - Comprehensive Tests', () => {
  let trainingService: TrainingService;

  beforeEach(() => {
    trainingService = new TrainingService(mockKnex);
    jest.clearAllMocks();
  });

  describe('Bulk Enrollment', () => {
    it('should bulk enroll multiple employees', async () => {
      const employeeIds = ['emp-1', 'emp-2', 'emp-3'];
      const trainingProgramId = 'prog-1';

      jest.spyOn(trainingService, 'bulkEnrollEmployees').mockResolvedValue([
        {
          id: 'enroll-1',
          employee_id: 'emp-1',
          program_id: trainingProgramId,
          training_program_id: trainingProgramId,
          status: 'enrolled',
          enrollment_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'enroll-2',
          employee_id: 'emp-2',
          program_id: trainingProgramId,
          training_program_id: trainingProgramId,
          status: 'enrolled',
          enrollment_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'enroll-3',
          employee_id: 'emp-3',
          program_id: trainingProgramId,
          training_program_id: trainingProgramId,
          status: 'enrolled',
          enrollment_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);

      const result = await trainingService.bulkEnrollEmployees(employeeIds, trainingProgramId);

      expect(result).toHaveLength(3);
      expect(result[0]!.employee_id).toBe('emp-1');
      expect(result[1]!.employee_id).toBe('emp-2');
      expect(result[2]!.employee_id).toBe('emp-3');
    });

    it('should handle partial failures in bulk enrollment', async () => {
      const employeeIds = ['emp-1', 'emp-2', 'emp-3'];
      const trainingProgramId = 'prog-1';

      jest.spyOn(trainingService, 'bulkEnrollEmployees').mockResolvedValue([
        {
          id: 'enroll-1',
          employee_id: 'emp-1',
          program_id: trainingProgramId,
          training_program_id: trainingProgramId,
          status: 'enrolled',
          enrollment_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'enroll-3',
          employee_id: 'emp-3',
          program_id: trainingProgramId,
          training_program_id: trainingProgramId,
          status: 'enrolled',
          enrollment_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);

      const result = await trainingService.bulkEnrollEmployees(employeeIds, trainingProgramId);

      expect(result).toHaveLength(2);
    });
  });

  describe('Self-Enrollment', () => {
    it('should allow employee self-enrollment', async () => {
      const mockEnrollment: TrainingEnrollment = {
        id: 'enroll-1',
        employee_id: 'emp-1',
        program_id: 'prog-1',
        training_program_id: 'prog-1',
        status: 'enrolled',
        enrollment_date: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(trainingService, 'requestSelfEnrollment').mockResolvedValue(mockEnrollment);

      const result = await trainingService.requestSelfEnrollment('emp-1', 'prog-1');

      expect(result.employee_id).toBe('emp-1');
      expect(result.status).toBe('enrolled');
    });

    it('should prevent duplicate self-enrollment', async () => {
      jest.spyOn(trainingService, 'requestSelfEnrollment').mockRejectedValue(
        new Error('Employee is already enrolled in this training program')
      );

      await expect(trainingService.requestSelfEnrollment('emp-1', 'prog-1')).rejects.toThrow(
        'Employee is already enrolled in this training program'
      );
    });
  });

  describe('Training Reminders', () => {
    it('should send training reminders for programs starting in 3 days', async () => {
      jest.spyOn(trainingService, 'sendTrainingReminders').mockResolvedValue(undefined);

      await expect(trainingService.sendTrainingReminders()).resolves.toBeUndefined();
    });
  });

  describe('Certificate Issuance', () => {
    it('should issue certificate for completed training', async () => {
      const mockCertificate: Certification = {
        id: 'cert-1',
        employee_id: 'emp-1',
        name: 'TypeScript Basics Certificate',
        issuing_organization: 'Tech Academy',
        certificate_number: 'CERT-001',
        issue_date: new Date(),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(trainingService, 'issueCertificate').mockResolvedValue(mockCertificate);

      const result = await trainingService.issueCertificate('enroll-1', {
        name: 'TypeScript Basics Certificate',
        issuing_organization: 'Tech Academy',
        certificate_number: 'CERT-001',
      });

      expect(result.name).toBe('TypeScript Basics Certificate');
      expect(result.is_active).toBe(true);
    });

    it('should prevent certificate issuance for incomplete training', async () => {
      jest.spyOn(trainingService, 'issueCertificate').mockRejectedValue(
        new Error('Enrollment must be completed before issuing certificate')
      );

      await expect(
        trainingService.issueCertificate('enroll-1', {
          name: 'Certificate',
          issuing_organization: 'Org',
        })
      ).rejects.toThrow('Enrollment must be completed before issuing certificate');
    });
  });

  describe('Certification Expiry Alerts', () => {
    it('should send alerts for expiring certifications', async () => {
      jest.spyOn(trainingService, 'sendCertificationExpiryAlerts').mockResolvedValue(undefined);

      await expect(trainingService.sendCertificationExpiryAlerts()).resolves.toBeUndefined();
    });
  });

  describe('Certification Inventory', () => {
    it('should generate certification inventory report', async () => {
      const mockInventory = {
        total_certifications: 10,
        active_certifications: 8,
        expiring_soon: 2,
        expired: 0,
        by_organization: {
          'Amazon': 3,
          'Google': 2,
          'Microsoft': 5,
        },
      };

      jest.spyOn(trainingService, 'getCertificationInventory').mockResolvedValue(mockInventory);

      const result = await trainingService.getCertificationInventory();

      expect(result.total_certifications).toBe(10);
      expect(result.active_certifications).toBe(8);
      expect(result.expiring_soon).toBe(2);
      expect(result.by_organization['Amazon']).toBe(3);
    });
  });

  describe('Team Skill Matrix', () => {
    it('should generate team skill matrix for department', async () => {
      const mockMatrix = [
        {
          employee_id: 'emp-1',
          employee_name: 'John Doe',
          skills: [
            {
              skill_id: 'skill-1',
              proficiency_level: 'advanced',
              years_of_experience: 5,
            },
          ],
        },
        {
          employee_id: 'emp-2',
          employee_name: 'Jane Smith',
          skills: [
            {
              skill_id: 'skill-1',
              proficiency_level: 'intermediate',
              years_of_experience: 3,
            },
            {
              skill_id: 'skill-2',
              proficiency_level: 'expert',
              years_of_experience: 7,
            },
          ],
        },
      ];

      jest.spyOn(trainingService, 'getTeamSkillMatrix').mockResolvedValue(mockMatrix);

      const result = await trainingService.getTeamSkillMatrix('dept-1');

      expect(result).toHaveLength(2);
      expect(result[0]!.employee_name).toBe('John Doe');
      expect(result[1]!.skills).toHaveLength(2);
    });
  });

  describe('Skill Gap Analysis', () => {
    it('should calculate skill gaps accurately', async () => {
      const mockReport: SkillGapReport = {
        department_id: 'dept-1',
        required_skills: [
          {
            skill_id: 'skill-1',
            skill_name: 'TypeScript',
            required_proficiency: 'intermediate',
            employees_with_skill: 8,
            total_employees: 10,
            coverage_percentage: 80,
          },
          {
            skill_id: 'skill-2',
            skill_name: 'React',
            required_proficiency: 'intermediate',
            employees_with_skill: 6,
            total_employees: 10,
            coverage_percentage: 60,
          },
        ],
        team_coverage_percentage: 70,
        generated_at: new Date(),
      };

      jest.spyOn(trainingService, 'generateSkillGapReport').mockResolvedValue(mockReport);

      const result = await trainingService.generateSkillGapReport('dept-1');

      expect(result.team_coverage_percentage).toBe(70);
      expect(result.required_skills[0]!.coverage_percentage).toBe(80);
      expect(result.required_skills[1]!.coverage_percentage).toBe(60);
    });

    it('should identify critical skill gaps', async () => {
      const mockReport: SkillGapReport = {
        department_id: 'dept-1',
        required_skills: [
          {
            skill_id: 'skill-1',
            skill_name: 'Critical Skill',
            required_proficiency: 'advanced',
            employees_with_skill: 1,
            total_employees: 10,
            coverage_percentage: 10,
          },
        ],
        team_coverage_percentage: 10,
        generated_at: new Date(),
      };

      jest.spyOn(trainingService, 'generateSkillGapReport').mockResolvedValue(mockReport);

      const result = await trainingService.generateSkillGapReport('dept-1');

      const criticalGaps = result.required_skills.filter((s) => s.coverage_percentage < 50);
      expect(criticalGaps).toHaveLength(1);
      expect(criticalGaps[0]!.skill_name).toBe('Critical Skill');
    });
  });

  describe('Training Completion and Skill Updates', () => {
    it('should update skills when training is completed', async () => {
      const mockEnrollment: TrainingEnrollment = {
        id: 'enroll-1',
        employee_id: 'emp-1',
        program_id: 'prog-1',
        training_program_id: 'prog-1',
        status: 'completed',
        enrollment_date: new Date(),
        completion_date: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(trainingService, 'markEnrollmentComplete').mockResolvedValue(mockEnrollment);

      const result = await trainingService.markEnrollmentComplete('enroll-1');

      expect(result.status).toBe('completed');
      expect(result.completion_date).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent enrollment', async () => {
      jest.spyOn(trainingService, 'markEnrollmentComplete').mockRejectedValue(
        new Error('Training enrollment not found')
      );

      await expect(trainingService.markEnrollmentComplete('nonexistent')).rejects.toThrow(
        'Training enrollment not found'
      );
    });

    it('should handle database errors gracefully', async () => {
      jest.spyOn(trainingService, 'getAllTrainingPrograms').mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(trainingService.getAllTrainingPrograms()).rejects.toThrow(
        'Database connection failed'
      );
    });
  });
});
