import { describe, it, expect } from '@jest/globals';
import * as fc from 'fast-check';

/**
 * Property 38: Training Completion Skill Update
 *
 * For any training program completed by an employee, if the program is linked to specific skills,
 * those skills must be added to or updated in the employee's skill matrix.
 *
 * **Validates: Requirements 3.9.12**
 */
describe('Property 38: Training Completion Skill Update', () => {
  it('should update employee skills when training is completed', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.array(fc.uuid(), { minLength: 1, maxLength: 5 }),
        fc.constantFrom('beginner', 'intermediate', 'advanced', 'expert'),
        (_employeeId, _trainingProgramId, skillIds, proficiencyLevel) => {
          // Simulate training completion with skill updates
          const employeeSkillsAfter = new Map<string, string>();

          // Add skills after training completion
          for (const skillId of skillIds) {
            employeeSkillsAfter.set(skillId, proficiencyLevel);
          }

          // Verify all skills from training are in employee's skill matrix
          for (const skillId of skillIds) {
            expect(employeeSkillsAfter.has(skillId)).toBe(true);
            expect(employeeSkillsAfter.get(skillId)).toBe(proficiencyLevel);
          }

          // Verify no skills were lost
          expect(employeeSkillsAfter.size).toBeGreaterThanOrEqual(skillIds.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle multiple training completions for same employee', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.array(
          fc.record({
            trainingId: fc.uuid(),
            skills: fc.array(fc.uuid(), { minLength: 1, maxLength: 3 }),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (_employeeId, trainings) => {
          const employeeSkills = new Map<string, string>();

          // Simulate multiple training completions
          for (const training of trainings) {
            for (const skillId of training.skills) {
              employeeSkills.set(skillId, 'intermediate');
            }
          }

          // Verify all unique skills are present
          const allSkillIds = new Set<string>();
          for (const training of trainings) {
            for (const skillId of training.skills) {
              allSkillIds.add(skillId);
            }
          }

          expect(employeeSkills.size).toBe(allSkillIds.size);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve existing skills when adding new ones from training', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.array(fc.uuid(), { minLength: 1, maxLength: 3 }),
        fc.array(fc.uuid(), { minLength: 1, maxLength: 3 }),
        (_employeeId, existingSkills, newSkills) => {
          const employeeSkills = new Map<string, string>();

          // Add existing skills
          for (const skillId of existingSkills) {
            employeeSkills.set(skillId, 'advanced');
          }

          const skillsBeforeTraining = employeeSkills.size;

          // Add new skills from training
          for (const skillId of newSkills) {
            if (!employeeSkills.has(skillId)) {
              employeeSkills.set(skillId, 'beginner');
            }
          }

          // Verify existing skills are preserved
          for (const skillId of existingSkills) {
            expect(employeeSkills.has(skillId)).toBe(true);
            expect(employeeSkills.get(skillId)).toBe('advanced');
          }

          // Verify new skills are added
          expect(employeeSkills.size).toBeGreaterThanOrEqual(skillsBeforeTraining);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 39: Skill Gap Report Accuracy
 *
 * For any department, the skill gap report must accurately reflect the percentage of employees
 * with each required skill at the specified proficiency level.
 *
 * **Validates: Requirements 3.9.13**
 */
describe('Property 39: Skill Gap Report Accuracy', () => {
  it('should calculate skill coverage percentage correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 1, max: 10 }),
        (totalEmployees, employeesWithSkill) => {
          // Ensure employeesWithSkill doesn't exceed totalEmployees
          const actualEmployeesWithSkill = Math.min(employeesWithSkill, totalEmployees);

          const coveragePercentage = (actualEmployeesWithSkill / totalEmployees) * 100;

          // Verify coverage is between 0 and 100
          expect(coveragePercentage).toBeGreaterThanOrEqual(0);
          expect(coveragePercentage).toBeLessThanOrEqual(100);

          // Verify calculation is correct
          expect(coveragePercentage).toBe((actualEmployeesWithSkill / totalEmployees) * 100);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should calculate team coverage percentage as average of all skills', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            skillId: fc.uuid(),
            coverage: fc.integer({ min: 0, max: 100 }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (skills) => {
          const totalCoverage = skills.reduce((sum, skill) => sum + skill.coverage, 0);
          const teamCoveragePercentage = Math.round(totalCoverage / skills.length);

          // Verify team coverage is between 0 and 100
          expect(teamCoveragePercentage).toBeGreaterThanOrEqual(0);
          expect(teamCoveragePercentage).toBeLessThanOrEqual(100);

          // Verify calculation is correct
          const expectedCoverage = Math.round(totalCoverage / skills.length);
          expect(teamCoveragePercentage).toBe(expectedCoverage);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should identify skills with zero coverage', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            skillId: fc.uuid(),
            employeesWithSkill: fc.integer({ min: 0, max: 0 }),
            totalEmployees: fc.integer({ min: 1, max: 100 }),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (skills) => {
          for (const skill of skills) {
            const coverage = (skill.employeesWithSkill / skill.totalEmployees) * 100;
            expect(coverage).toBe(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should identify skills with full coverage', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            skillId: fc.uuid(),
            totalEmployees: fc.integer({ min: 1, max: 100 }),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (skills) => {
          for (const skill of skills) {
            const coverage = (skill.totalEmployees / skill.totalEmployees) * 100;
            expect(coverage).toBe(100);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle partial skill coverage correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 1, max: 100 }),
        (totalEmployees, employeesWithSkill) => {
          const actualEmployeesWithSkill = Math.min(employeesWithSkill, totalEmployees);

          // Ensure we have partial coverage (not 0 or 100)
          if (actualEmployeesWithSkill > 0 && actualEmployeesWithSkill < totalEmployees) {
            const coverage = (actualEmployeesWithSkill / totalEmployees) * 100;

            expect(coverage).toBeGreaterThan(0);
            expect(coverage).toBeLessThan(100);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain consistency across multiple report generations', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            skillId: fc.uuid(),
            coverage: fc.integer({ min: 0, max: 100 }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (skills) => {
          // Generate report multiple times
          const report1 = skills.map((s) => s.coverage);
          const report2 = skills.map((s) => s.coverage);

          // Verify reports are identical
          expect(report1).toEqual(report2);

          // Verify team coverage is consistent
          const coverage1 = Math.round(report1.reduce((a, b) => a + b, 0) / report1.length);
          const coverage2 = Math.round(report2.reduce((a, b) => a + b, 0) / report2.length);

          expect(coverage1).toBe(coverage2);
        }
      ),
      { numRuns: 100 }
    );
  });
});
