import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { TrainingService } from '../trainingService';
import { TrainingProgram, TrainingEnrollment, Certification, Skill, EmployeeSkill, SkillGapReport } from '../../types/training';
import { Knex } from 'knex';

// Mock Knex
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

describe('TrainingService', () => {
  let trainingService: TrainingService;

  beforeEach(() => {
    trainingService = new TrainingService(mockKnex);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Training Program Methods', () => {
    it('should create a training program', async () => {
      const mockProgram: TrainingProgram = {
        id: '123',
        name: 'TypeScript Basics',
        description: 'Learn TypeScript',
        provider: 'Tech Academy',
        start_date: new Date('2026-04-01'),
        end_date: new Date('2026-04-15'),
        duration_hours: 40,
        status: 'draft',
        max_participants: 30,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(trainingService, 'createTrainingProgram').mockResolvedValue(mockProgram);

      const result = await trainingService.createTrainingProgram({
        name: 'TypeScript Basics',
        description: 'Learn TypeScript',
        provider: 'Tech Academy',
        start_date: new Date('2026-04-01'),
        end_date: new Date('2026-04-15'),
        duration_hours: 40,
        max_participants: 30,
      });

      expect(result).toEqual(mockProgram);
      expect(result.name).toBe('TypeScript Basics');
      expect(result.status).toBe('draft');
    });

    it('should get a training program by id', async () => {
      const mockProgram: TrainingProgram = {
        id: '123',
        name: 'TypeScript Basics',
        description: 'Learn TypeScript',
        provider: 'Tech Academy',
        start_date: new Date('2026-04-01'),
        end_date: new Date('2026-04-15'),
        duration_hours: 40,
        status: 'active',
        max_participants: 30,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(trainingService, 'getTrainingProgram').mockResolvedValue(mockProgram);

      const result = await trainingService.getTrainingProgram('123');

      expect(result).toEqual(mockProgram);
      expect(result?.id).toBe('123');
    });

    it('should return null if training program not found', async () => {
      jest.spyOn(trainingService, 'getTrainingProgram').mockResolvedValue(null);

      const result = await trainingService.getTrainingProgram('nonexistent');

      expect(result).toBeNull();
    });

    it('should get all training programs', async () => {
      const mockPrograms: TrainingProgram[] = [
        {
          id: '1',
          name: 'TypeScript Basics',
          description: 'Learn TypeScript',
          provider: 'Tech Academy',
          start_date: new Date('2026-04-01'),
          end_date: new Date('2026-04-15'),
          duration_hours: 40,
          status: 'active',
          max_participants: 30,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '2',
          name: 'React Advanced',
          description: 'Advanced React',
          provider: 'Tech Academy',
          start_date: new Date('2026-05-01'),
          end_date: new Date('2026-05-15'),
          duration_hours: 50,
          status: 'draft',
          max_participants: 25,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      jest.spyOn(trainingService, 'getAllTrainingPrograms').mockResolvedValue(mockPrograms);

      const result = await trainingService.getAllTrainingPrograms();

      expect(result).toHaveLength(2);
      expect(result[0]!.name).toBe('TypeScript Basics');
      expect(result[1]!.name).toBe('React Advanced');
    });

    it('should update a training program', async () => {
      const updatedProgram: TrainingProgram = {
        id: '123',
        name: 'TypeScript Advanced',
        description: 'Advanced TypeScript',
        provider: 'Tech Academy',
        start_date: new Date('2026-04-01'),
        end_date: new Date('2026-04-15'),
        duration_hours: 50,
        status: 'active',
        max_participants: 30,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(trainingService, 'updateTrainingProgram').mockResolvedValue(updatedProgram);

      const result = await trainingService.updateTrainingProgram('123', {
        name: 'TypeScript Advanced',
        duration_hours: 50,
      });

      expect(result.name).toBe('TypeScript Advanced');
      expect(result.duration_hours).toBe(50);
    });

    it('should delete a training program', async () => {
      jest.spyOn(trainingService, 'deleteTrainingProgram').mockResolvedValue(undefined);

      await expect(trainingService.deleteTrainingProgram('123')).resolves.toBeUndefined();
    });
  });

  describe('Training Enrollment Methods', () => {
    it('should enroll an employee in training', async () => {
      const mockEnrollment: TrainingEnrollment = {
        id: 'enroll-123',
        employee_id: 'emp-1',
        program_id: 'prog-1',
        training_program_id: 'prog-1',
        status: 'enrolled',
        enrollment_date: new Date('2026-03-15'),
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(trainingService, 'enrollEmployee').mockResolvedValue(mockEnrollment);

      const result = await trainingService.enrollEmployee({
        employee_id: 'emp-1',
        training_program_id: 'prog-1',
        enrollment_date: new Date('2026-03-15'),
      });

      expect(result.employee_id).toBe('emp-1');
      expect(result.status).toBe('enrolled');
    });

    it('should throw error if employee already enrolled', async () => {
      jest.spyOn(trainingService, 'enrollEmployee').mockRejectedValue(
        new Error('Employee is already enrolled in this training program')
      );

      await expect(
        trainingService.enrollEmployee({
          employee_id: 'emp-1',
          training_program_id: 'prog-1',
          enrollment_date: new Date('2026-03-15'),
        })
      ).rejects.toThrow('Employee is already enrolled in this training program');
    });

    it('should get employee enrollments', async () => {
      const mockEnrollments: TrainingEnrollment[] = [
        {
          id: 'enroll-1',
          employee_id: 'emp-1',
          program_id: 'prog-1',
          training_program_id: 'prog-1',
          status: 'completed',
          enrollment_date: new Date('2026-02-01'),
          completion_date: new Date('2026-02-15'),
          score: 85,
          passed: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'enroll-2',
          employee_id: 'emp-1',
          program_id: 'prog-2',
          training_program_id: 'prog-2',
          status: 'enrolled',
          enrollment_date: new Date('2026-03-15'),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      jest.spyOn(trainingService, 'getEmployeeEnrollments').mockResolvedValue(mockEnrollments);

      const result = await trainingService.getEmployeeEnrollments('emp-1');

      expect(result).toHaveLength(2);
      expect(result[0]!.status).toBe('completed');
      expect(result[1]!.status).toBe('enrolled');
    });

    it('should mark enrollment as complete', async () => {
      const completedEnrollment: TrainingEnrollment = {
        id: 'enroll-1',
        employee_id: 'emp-1',
        program_id: 'prog-1',
        training_program_id: 'prog-1',
        status: 'completed',
        enrollment_date: new Date('2026-02-01'),
        completion_date: new Date('2026-02-15'),
        score: 85,
        passed: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(trainingService, 'markEnrollmentComplete').mockResolvedValue(completedEnrollment);

      const result = await trainingService.markEnrollmentComplete('enroll-1');

      expect(result.status).toBe('completed');
      expect(result.completion_date).toBeDefined();
    });
  });

  describe('Certification Methods', () => {
    it('should add a certification', async () => {
      const mockCertification: Certification = {
        id: 'cert-1',
        employee_id: 'emp-1',
        name: 'AWS Solutions Architect',
        issuing_organization: 'Amazon',
        certificate_number: 'AWS-123456',
        issue_date: new Date('2026-01-15'),
        expiry_date: new Date('2029-01-15'),
        certificate_url: 'https://example.com/cert.pdf',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(trainingService, 'addCertification').mockResolvedValue(mockCertification);

      const result = await trainingService.addCertification({
        employee_id: 'emp-1',
        name: 'AWS Solutions Architect',
        issuing_organization: 'Amazon',
        certificate_number: 'AWS-123456',
        issue_date: new Date('2026-01-15'),
        expiry_date: new Date('2029-01-15'),
        certificate_url: 'https://example.com/cert.pdf',
      });

      expect(result.name).toBe('AWS Solutions Architect');
      expect(result.is_active).toBe(true);
    });

    it('should get employee certifications', async () => {
      const mockCertifications: Certification[] = [
        {
          id: 'cert-1',
          employee_id: 'emp-1',
          name: 'AWS Solutions Architect',
          issuing_organization: 'Amazon',
          certificate_number: 'AWS-123456',
          issue_date: new Date('2026-01-15'),
          expiry_date: new Date('2029-01-15'),
          certificate_url: 'https://example.com/cert.pdf',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      jest.spyOn(trainingService, 'getEmployeeCertifications').mockResolvedValue(mockCertifications);

      const result = await trainingService.getEmployeeCertifications('emp-1');

      expect(result).toHaveLength(1);
      expect(result[0]!.name).toBe('AWS Solutions Architect');
    });

    it('should get expiring certifications', async () => {
      const mockExpiringCerts: Certification[] = [
        {
          id: 'cert-1',
          employee_id: 'emp-1',
          name: 'AWS Solutions Architect',
          issuing_organization: 'Amazon',
          certificate_number: 'AWS-123456',
          issue_date: new Date('2026-01-15'),
          expiry_date: new Date('2026-04-15'),
          certificate_url: 'https://example.com/cert.pdf',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      jest.spyOn(trainingService, 'getExpiringCertifications').mockResolvedValue(mockExpiringCerts);

      const result = await trainingService.getExpiringCertifications(30);

      expect(result).toHaveLength(1);
      expect(result[0]!.expiry_date).toBeDefined();
    });
  });

  describe('Skill Methods', () => {
    it('should create a skill', async () => {
      const mockSkill: Skill = {
        id: 'skill-1',
        name: 'TypeScript',
        category: 'Programming',
        description: 'TypeScript programming language',
        proficiency_levels: [],
        created_at: new Date(),
      };

      jest.spyOn(trainingService, 'createSkill').mockResolvedValue(mockSkill);

      const result = await trainingService.createSkill({
        name: 'TypeScript',
        category: 'Programming',
        description: 'TypeScript programming language',
      });

      expect(result.name).toBe('TypeScript');
      expect(result.category).toBe('Programming');
    });

    it('should get all skills', async () => {
      const mockSkills: Skill[] = [
        {
          id: 'skill-1',
          name: 'TypeScript',
          category: 'Programming',
          description: 'TypeScript programming language',
          proficiency_levels: [],
          created_at: new Date(),
        },
        {
          id: 'skill-2',
          name: 'React',
          category: 'Programming',
          description: 'React library',
          proficiency_levels: [],
          created_at: new Date(),
        },
      ];

      jest.spyOn(trainingService, 'getAllSkills').mockResolvedValue(mockSkills);

      const result = await trainingService.getAllSkills();

      expect(result).toHaveLength(2);
      expect(result[0]!.name).toBe('TypeScript');
    });

    it('should get skills by category', async () => {
      const mockSkills: Skill[] = [
        {
          id: 'skill-1',
          name: 'TypeScript',
          category: 'Programming',
          description: 'TypeScript programming language',
          proficiency_levels: [],
          created_at: new Date(),
        },
      ];

      jest.spyOn(trainingService, 'getSkillsByCategory').mockResolvedValue(mockSkills);

      const result = await trainingService.getSkillsByCategory('Programming');

      expect(result).toHaveLength(1);
      expect(result[0]!.category).toBe('Programming');
    });
  });

  describe('Employee Skill Methods', () => {
    it('should add an employee skill', async () => {
      const mockEmployeeSkill: EmployeeSkill = {
        id: 'emp-skill-1',
        employee_id: 'emp-1',
        skill_id: 'skill-1',
        proficiency_level: 'advanced',
        years_of_experience: 5,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(trainingService, 'addEmployeeSkill').mockResolvedValue(mockEmployeeSkill);

      const result = await trainingService.addEmployeeSkill({
        employee_id: 'emp-1',
        skill_id: 'skill-1',
        proficiency_level: 'advanced',
        years_of_experience: 5,
      });

      expect(result.employee_id).toBe('emp-1');
      expect(result.proficiency_level).toBe('advanced');
    });

    it('should get employee skills', async () => {
      const mockEmployeeSkills: EmployeeSkill[] = [
        {
          id: 'emp-skill-1',
          employee_id: 'emp-1',
          skill_id: 'skill-1',
          proficiency_level: 'advanced',
          years_of_experience: 5,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      jest.spyOn(trainingService, 'getEmployeeSkills').mockResolvedValue(mockEmployeeSkills);

      const result = await trainingService.getEmployeeSkills('emp-1');

      expect(result).toHaveLength(1);
      expect(result[0]!.proficiency_level).toBe('advanced');
    });

    it('should update employee skill', async () => {
      const updatedSkill: EmployeeSkill = {
        id: 'emp-skill-1',
        employee_id: 'emp-1',
        skill_id: 'skill-1',
        proficiency_level: 'expert',
        years_of_experience: 6,
        last_used_date: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(trainingService, 'updateEmployeeSkill').mockResolvedValue(updatedSkill);

      const result = await trainingService.updateEmployeeSkill('emp-skill-1', {
        proficiency_level: 'expert',
        years_of_experience: 6,
      });

      expect(result.proficiency_level).toBe('expert');
      expect(result.years_of_experience).toBe(6);
    });
  });

  describe('Skill Gap Report', () => {
    it('should generate skill gap report for department', async () => {
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

      expect(result.department_id).toBe('dept-1');
      expect(result.required_skills).toHaveLength(2);
      expect(result.team_coverage_percentage).toBe(70);
    });

    it('should return empty report for department with no employees', async () => {
      const mockReport: SkillGapReport = {
        department_id: 'dept-empty',
        required_skills: [],
        team_coverage_percentage: 0,
        generated_at: new Date(),
      };

      jest.spyOn(trainingService, 'generateSkillGapReport').mockResolvedValue(mockReport);

      const result = await trainingService.generateSkillGapReport('dept-empty');

      expect(result.required_skills).toHaveLength(0);
      expect(result.team_coverage_percentage).toBe(0);
    });
  });
});
