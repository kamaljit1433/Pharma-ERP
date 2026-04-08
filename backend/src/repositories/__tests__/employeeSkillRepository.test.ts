/**
 * Employee Skill Repository - Unit Tests
 * Tests for employee skill CRUD operations
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import db from '../../config/knex';

describe('Employee Skill Operations', () => {
  const testEmployeeId = 'a0000000-0000-4000-a000-000000000001';
  const testSkillId = 'e0000000-0000-4000-c000-000000000001';
  let testEmployeeSkillId: string;

  beforeAll(async () => {
    await db('employee_skills').del();
    // Create test employee (FK requirement)
    await db('employees')
      .insert({
        id: testEmployeeId,
        employee_id: 'EMP-TEST-001',
        first_name: 'Test',
        last_name: 'Employee',
        email: 'test.employee@example.com',
        phone: '+1234567890',
        date_of_joining: new Date(),
        employment_type: 'permanent',
        status: 'active',
      })
      .onConflict('id')
      .ignore();
  });

  afterAll(async () => {
    await db('employees').del();
    await db('employee_skills').del();
  });

  describe('Create Employee Skill', () => {
    it('should assign skill to employee', async () => {
      const [empSkill] = await db('employee_skills')
        .insert({
          employee_id: testEmployeeId,
          skill_id: testSkillId,
          proficiency_level: 'expert',
          years_of_experience: 5,
          last_used_date: new Date().toISOString().split('T')[0],
        })
        .returning('*');

      expect(empSkill).toBeDefined();
      expect(empSkill.id).toBeDefined();
      expect(empSkill.employee_id).toBe(testEmployeeId);
      expect(empSkill.skill_id).toBe(testSkillId);
      expect(empSkill.proficiency_level).toBe('expert');

      testEmployeeSkillId = empSkill.id;
    });

    it('should support different proficiency levels', async () => {
      const levels = ['beginner', 'intermediate', 'advanced', 'expert'];

      for (const level of levels) {
        const [empSkill] = await db('employee_skills')
          .insert({
            employee_id: testEmployeeId,
            skill_id: `skill-${level}`,
            proficiency_level: level,
          })
          .returning('*');

        expect(empSkill.proficiency_level).toBe(level);
      }
    });
  });

  describe('Retrieve Employee Skill', () => {
    it('should retrieve skill by ID', async () => {
      const empSkill = await db('employee_skills')
        .where({ id: testEmployeeSkillId })
        .first();

      expect(empSkill).toBeDefined();
      expect(empSkill.id).toBe(testEmployeeSkillId);
    });

    it('should retrieve all skills for employee', async () => {
      const skills = await db('employee_skills')
        .where({ employee_id: testEmployeeId });

      expect(Array.isArray(skills)).toBe(true);
      expect(skills.length).toBeGreaterThan(0);
      expect(skills.every((s) => s.employee_id === testEmployeeId)).toBe(true);
    });

    it('should retrieve employees with specific skill', async () => {
      const employees = await db('employee_skills')
        .where({ skill_id: testSkillId });

      expect(Array.isArray(employees)).toBe(true);
    });

    it('should return empty array for employee with no skills', async () => {
      const skills = await db('employee_skills')
        .where({ employee_id: 'emp-no-skills' });

      expect(Array.isArray(skills)).toBe(true);
      expect(skills.length).toBe(0);
    });
  });

  describe('Update Employee Skill', () => {
    it('should update proficiency level', async () => {
      await db('employee_skills').where({ id: testEmployeeSkillId }).update({
        proficiency_level: 'advanced',
      });

      const updated = await db('employee_skills')
        .where({ id: testEmployeeSkillId })
        .first();

      expect(updated.proficiency_level).toBe('advanced');
    });

    it('should update years of experience', async () => {
      await db('employee_skills').where({ id: testEmployeeSkillId }).update({
        years_of_experience: 7,
      });

      const updated = await db('employee_skills')
        .where({ id: testEmployeeSkillId })
        .first();

      expect(updated.years_of_experience).toBe(7);
    });

    it('should update last used date', async () => {
      const today = new Date().toISOString().split('T')[0];
      await db('employee_skills').where({ id: testEmployeeSkillId }).update({
        last_used_date: today,
      });

      const updated = await db('employee_skills')
        .where({ id: testEmployeeSkillId })
        .first();

      expect(updated.last_used_date).toBe(today);
    });
  });

  describe('Delete Employee Skill', () => {
    it('should remove skill from employee', async () => {
      const [empSkill] = await db('employee_skills')
        .insert({
          employee_id: testEmployeeId,
          skill_id: 'e0000000-0000-4000-c000-000000000099',
          proficiency_level: 'beginner',
        })
        .returning('*');

      await db('employee_skills').where({ id: empSkill.id }).del();

      const deleted = await db('employee_skills')
        .where({ id: empSkill.id })
        .first();

      expect(deleted).toBeUndefined();
    });
  });

  describe('Query Employee Skills', () => {
    it('should retrieve skills by proficiency level', async () => {
      const skills = await db('employee_skills')
        .where({ proficiency_level: 'expert' });

      expect(Array.isArray(skills)).toBe(true);
      expect(skills.every((s) => s.proficiency_level === 'expert')).toBe(true);
    });

    it('should count skills per employee', async () => {
      const result = await db('employee_skills')
        .where({ employee_id: testEmployeeId })
        .count('* as count')
        .first();

      expect(result?.count).toBeGreaterThan(0);
    });

    it('should find employees with multiple skills', async () => {
      const result = await db('employee_skills')
        .select('employee_id')
        .count('* as skill_count')
        .groupBy('employee_id')
        .having(db.raw('count(*) > 1'));

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Skill Gap Analysis', () => {
    it('should identify missing skills', async () => {
      const allSkills = await db('skills');
      const employeeSkills = await db('employee_skills')
        .where({ employee_id: testEmployeeId });

      const employeeSkillIds = employeeSkills.map((s) => s.skill_id);
      const missingSkills = allSkills.filter((s) => !employeeSkillIds.includes(s.id));

      expect(Array.isArray(missingSkills)).toBe(true);
    });

    it('should identify low proficiency skills', async () => {
      const skills = await db('employee_skills')
        .where({ employee_id: testEmployeeId })
        .whereIn('proficiency_level', ['beginner', 'intermediate']);

      expect(Array.isArray(skills)).toBe(true);
    });
  });
});
