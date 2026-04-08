/**
 * Skill Repository - Unit Tests
 * Tests for skill CRUD operations
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { SkillRepository } from '../skillRepository';
import db from '../../config/knex';

describe('SkillRepository', () => {
  let repository: SkillRepository;
  let testSkillId: string;

  beforeAll(async () => {
    repository = new SkillRepository(db);
    await db('skills').del();
  });

  afterAll(async () => {
    await db('skills').del();
  });

  describe('createSkill', () => {
    it('should create a skill with valid data', async () => {
      const skill = await repository.createSkill({
        name: 'TypeScript',
        category: 'Programming',
        description: 'TypeScript programming language',
        proficiency_levels: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      });

      expect(skill).toBeDefined();
      expect(skill.id).toBeDefined();
      expect(skill.name).toBe('TypeScript');
      expect(skill.category).toBe('Programming');

      testSkillId = skill.id;
    });

    it('should create skills with different categories', async () => {
      const categories = ['Programming', 'Design', 'Management', 'Communication'];

      for (const category of categories) {
        const skill = await repository.createSkill({
          name: `${category} Skill`,
          category,
          description: `${category} skill`,
          proficiency_levels: ['Beginner', 'Intermediate', 'Advanced'],
        });

        expect(skill.category).toBe(category);
      }
    });
  });

  describe('getSkillById', () => {
    it('should retrieve skill by ID', async () => {
      const skill = await repository.getSkillById(testSkillId);

      expect(skill).toBeDefined();
      expect(skill?.id).toBe(testSkillId);
      expect(skill?.name).toBe('TypeScript');
    });

    it('should return null for non-existent ID', async () => {
      const skill = await repository.getSkillById('00000000-0000-4000-a000-ffffffffffff');
      expect(skill).toBeNull();
    });
  });

  describe('getSkillByName', () => {
    it('should retrieve skill by name', async () => {
      const skill = await repository.getSkillByName('TypeScript');

      expect(skill).toBeDefined();
      expect(skill?.name).toBe('TypeScript');
    });

    it('should return null for non-existent name', async () => {
      const skill = await repository.getSkillByName('Non Existent Skill');
      expect(skill).toBeNull();
    });
  });

  describe('getAllSkills', () => {
    it('should retrieve all skills', async () => {
      const skills = await repository.getAllSkills();

      expect(Array.isArray(skills)).toBe(true);
      expect(skills.length).toBeGreaterThan(0);
    });
  });

  describe('getSkillsByCategory', () => {
    it('should retrieve skills by category', async () => {
      const skills = await repository.getSkillsByCategory('Programming');

      expect(Array.isArray(skills)).toBe(true);
      skills.forEach((s) => {
        expect(s.category).toBe('Programming');
      });
    });

    it('should return empty array for non-existent category', async () => {
      const skills = await repository.getSkillsByCategory('Non Existent');
      expect(skills).toEqual([]);
    });
  });

  describe('updateSkill', () => {
    it('should update skill properties', async () => {
      const updated = await repository.updateSkill(testSkillId, {
        description: 'Updated TypeScript description',
      });

      expect(updated.description).toBe('Updated TypeScript description');
    });

    it('should update proficiency levels', async () => {
      const newLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'];
      const updated = await repository.updateSkill(testSkillId, {
        proficiency_levels: newLevels,
      });

      expect(updated.proficiency_levels.length).toBe(5);
    });
  });

  describe('deleteSkill', () => {
    it('should delete a skill', async () => {
      const skill = await repository.createSkill({
        name: 'Skill to Delete',
        category: 'Programming',
        description: 'Test',
        proficiency_levels: ['Beginner', 'Advanced'],
      });

      await repository.deleteSkill(skill.id);

      const deleted = await repository.getSkillById(skill.id);
      expect(deleted).toBeNull();
    });
  });

  describe('CRUD operations', () => {
    it('should support full CRUD lifecycle', async () => {
      // Create
      const created = await repository.createSkill({
        name: 'CRUD Test Skill',
        category: 'Programming',
        description: 'CRUD test',
        proficiency_levels: ['Beginner', 'Advanced'],
      });

      expect(created.id).toBeDefined();

      // Read
      const read = await repository.getSkillById(created.id);
      expect(read?.name).toBe('CRUD Test Skill');

      // Update
      const updated = await repository.updateSkill(created.id, {
        description: 'Updated CRUD test',
      });

      expect(updated.description).toBe('Updated CRUD test');

      // Delete
      await repository.deleteSkill(created.id);
      const deleted = await repository.getSkillById(created.id);
      expect(deleted).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle many proficiency levels', async () => {
      const levels = Array.from({ length: 10 }, (_, i) => `Level ${i + 1}`);

      const skill = await repository.createSkill({
        name: 'Many Levels Skill',
        category: 'Programming',
        description: 'Test',
        proficiency_levels: levels,
      });

      expect(skill.proficiency_levels.length).toBe(10);
    });

    it('should handle single proficiency level', async () => {
      const skill = await repository.createSkill({
        name: 'Single Level Skill',
        category: 'Programming',
        description: 'Test',
        proficiency_levels: ['Proficient'],
      });

      expect(skill.proficiency_levels.length).toBe(1);
    });

    it('should handle long descriptions', async () => {
      const longDescription = 'A'.repeat(5000);

      const skill = await repository.createSkill({
        name: 'Long Description Skill',
        category: 'Programming',
        description: longDescription,
        proficiency_levels: ['Beginner', 'Advanced'],
      });

      expect(skill.description?.length).toBe(5000);
    });
  });
});
