import { Request, Response } from 'express';
import { TrainingService } from '../services/trainingService';
import knex from '../config/knex';

const trainingService = new TrainingService(knex);

export class TrainingController {
  // Training Program Endpoints
  static async createTrainingProgram(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, provider, start_date, end_date, duration_hours, max_participants } = req.body;

      if (!name || !start_date || !end_date || !duration_hours) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const program = await trainingService.createTrainingProgram({
        name,
        description,
        provider,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        duration_hours,
        max_participants,
      });

      res.status(201).json(program);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async getTrainingProgram(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;
      const program = await trainingService.getTrainingProgram(id);

      if (!program) {
        res.status(404).json({ error: 'Training program not found' });
        return;
      }

      res.json(program);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async getAllTrainingPrograms(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.query;
      const programs = await trainingService.getAllTrainingPrograms(status as string);
      res.json(programs);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async updateTrainingProgram(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;
      const program = await trainingService.updateTrainingProgram(id, req.body);
      res.json(program);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async deleteTrainingProgram(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;
      await trainingService.deleteTrainingProgram(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  // Training Enrollment Endpoints
  static async enrollEmployee(req: Request, res: Response): Promise<void> {
    try {
      const { employee_id, training_program_id, enrollment_date } = req.body;

      if (!employee_id || !training_program_id || !enrollment_date) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const enrollment = await trainingService.enrollEmployee({
        employee_id,
        training_program_id,
        enrollment_date: new Date(enrollment_date),
      });

      res.status(201).json(enrollment);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  static async getEmployeeEnrollments(req: Request, res: Response): Promise<void> {
    try {
      const employeeId = req.params['employeeId'] as string;
      const enrollments = await trainingService.getEmployeeEnrollments(employeeId);
      res.json(enrollments);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async getProgramEnrollments(req: Request, res: Response): Promise<void> {
    try {
      const programId = req.params['id'] as string;
      const enrollments = await trainingService.getProgramEnrollments(programId);
      res.json(enrollments);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async deleteTrainingEnrollment(req: Request, res: Response): Promise<void> {
    try {
      const enrollmentId = req.params['enrollmentId'] as string;
      await trainingService.deleteTrainingEnrollment(enrollmentId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async markEnrollmentComplete(req: Request, res: Response): Promise<void> {
    try {
      const enrollmentId = req.params['enrollmentId'] as string;
      const enrollment = await trainingService.markEnrollmentComplete(enrollmentId);
      res.json(enrollment);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  // Certification Endpoints
  static async addCertification(req: Request, res: Response): Promise<void> {
    try {
      const { employee_id, name, issuing_organization, certificate_number, issue_date, expiry_date, certificate_url } =
        req.body;

      if (!employee_id || !name || !issuing_organization || !issue_date) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const certification = await trainingService.addCertification({
        employee_id,
        name,
        issuing_organization,
        certificate_number,
        issue_date: new Date(issue_date),
        expiry_date: expiry_date ? new Date(expiry_date) : undefined,
        certificate_url,
      });

      res.status(201).json(certification);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async getEmployeeCertifications(req: Request, res: Response): Promise<void> {
    try {
      const employeeId = req.params['employeeId'] as string;
      const certifications = await trainingService.getEmployeeCertifications(employeeId);
      res.json(certifications);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async getExpiringCertifications(req: Request, res: Response): Promise<void> {
    try {
      const { daysBeforeExpiry } = req.query;
      const certifications = await trainingService.getExpiringCertifications(
        daysBeforeExpiry ? parseInt(daysBeforeExpiry as string) : 30
      );
      res.json(certifications);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async updateCertification(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;
      const certification = await trainingService.updateCertification(id, req.body);
      res.json(certification);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  // Skill Endpoints
  static async createSkill(req: Request, res: Response): Promise<void> {
    try {
      const { name, category, description } = req.body;

      if (!name || !category) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const skill = await trainingService.createSkill({
        name,
        category,
        description,
      });

      res.status(201).json(skill);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async getAllSkills(req: Request, res: Response): Promise<void> {
    try {
      const skills = await trainingService.getAllSkills();
      res.json(skills);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async getSkillsByCategory(req: Request, res: Response): Promise<void> {
    try {
      const category = req.params['category'] as string;
      const skills = await trainingService.getSkillsByCategory(category);
      res.json(skills);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  // Employee Skill Endpoints
  static async addEmployeeSkill(req: Request, res: Response): Promise<void> {
    try {
      const { employee_id, skill_id, proficiency_level, years_of_experience } = req.body;

      if (!employee_id || !skill_id || !proficiency_level) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const employeeSkill = await trainingService.addEmployeeSkill({
        employee_id,
        skill_id,
        proficiency_level,
        years_of_experience,
      });

      res.status(201).json(employeeSkill);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async getEmployeeSkills(req: Request, res: Response): Promise<void> {
    try {
      const employeeId = req.params['employeeId'] as string;
      const skills = await trainingService.getEmployeeSkills(employeeId);
      res.json(skills);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async updateEmployeeSkill(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;
      const employeeSkill = await trainingService.updateEmployeeSkill(id, req.body);
      res.json(employeeSkill);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  // Skill Gap Report
  static async generateSkillGapReport(req: Request, res: Response): Promise<void> {
    try {
      const departmentId = req.params['departmentId'] as string;
      const report = await trainingService.generateSkillGapReport(departmentId);
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  // Bulk enrollment
  static async bulkEnrollEmployees(req: Request, res: Response): Promise<void> {
    try {
      const { employee_ids, training_program_id } = req.body;

      if (!employee_ids || !Array.isArray(employee_ids) || !training_program_id) {
        res.status(400).json({ error: 'Missing required fields: employee_ids (array) and training_program_id' });
        return;
      }

      const enrollments = await trainingService.bulkEnrollEmployees(employee_ids, training_program_id);
      res.status(201).json({ enrolled: enrollments.length, enrollments });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  // Self-enrollment request
  static async requestSelfEnrollment(req: Request, res: Response): Promise<void> {
    try {
      const { employee_id, training_program_id } = req.body;

      if (!employee_id || !training_program_id) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const enrollment = await trainingService.requestSelfEnrollment(employee_id, training_program_id);
      res.status(201).json(enrollment);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  // Send training reminders
  static async sendTrainingReminders(req: Request, res: Response): Promise<void> {
    try {
      await trainingService.sendTrainingReminders();
      res.json({ message: 'Training reminders sent successfully' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  // Issue certificate
  static async issueCertificate(req: Request, res: Response): Promise<void> {
    try {
      const enrollmentId = req.params['enrollmentId'] as string;
      const { name, issuing_organization, certificate_number } = req.body;

      if (!name || !issuing_organization) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const certificate = await trainingService.issueCertificate(enrollmentId, {
        name,
        issuing_organization,
        certificate_number,
      });

      res.status(201).json(certificate);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  // Send certification expiry alerts
  static async sendCertificationExpiryAlerts(req: Request, res: Response): Promise<void> {
    try {
      await trainingService.sendCertificationExpiryAlerts();
      res.json({ message: 'Certification expiry alerts sent successfully' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  // Get certification inventory
  static async getCertificationInventory(req: Request, res: Response): Promise<void> {
    try {
      const inventory = await trainingService.getCertificationInventory();
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  // Get team skill matrix
  static async getTeamSkillMatrix(req: Request, res: Response): Promise<void> {
    try {
      const departmentId = req.params['departmentId'] as string;
      const skillMatrix = await trainingService.getTeamSkillMatrix(departmentId);
      res.json(skillMatrix);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
