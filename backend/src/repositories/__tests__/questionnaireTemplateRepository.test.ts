/**
 * Questionnaire Template Repository - Unit Tests
 * Tests for questionnaire template CRUD operations, question management,
 * and data validation
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { QuestionnaireTemplateRepository } from '../questionnaireTemplateRepository';
import db from '../../config/knex';
import { CreateQuestionnaireTemplateDTO, UpdateQuestionnaireTemplateDTO } from '../../types/separation';

describe('QuestionnaireTemplateRepository', () => {
  let repository: QuestionnaireTemplateRepository;
  let testTemplateId: string;

  beforeAll(async () => {
    repository = new QuestionnaireTemplateRepository(db);
    // Clean up test data
    await db('questionnaire_templates').del();
  });

  afterAll(async () => {
    await db('questionnaire_templates').del();
  });

  describe('createTemplate', () => {
    it('should create a template with valid data', async () => {
      const data: CreateQuestionnaireTemplateDTO = {
        name: 'Exit Interview Template',
        description: 'Standard exit interview questions',
        questions: [
          {
            question_text: 'Why are you leaving?',
            question_type: 'text',
            is_required: true,
            order: 1,
          },
          {
            question_text: 'How satisfied were you with your role?',
            question_type: 'rating',
            is_required: true,
            order: 2,
          },
        ],
      };

      const template = await repository.createTemplate(data);

      expect(template).toBeDefined();
      expect(template.id).toBeDefined();
      expect(template.name).toBe('Exit Interview Template');
      expect(template.description).toBe('Standard exit interview questions');
      expect(template.questions).toHaveLength(2);
      expect(template.is_active).toBe(true);
      expect(template.created_at).toBeDefined();
      expect(template.updated_at).toBeDefined();

      testTemplateId = template.id;
    });

    it('should create template with multiple choice questions', async () => {
      const data: CreateQuestionnaireTemplateDTO = {
        name: 'Multiple Choice Template',
        questions: [
          {
            question_text: 'What was your primary reason for leaving?',
            question_type: 'multiple_choice',
            options: ['Better opportunity', 'Relocation', 'Personal reasons', 'Other'],
            is_required: true,
            order: 1,
          },
        ],
      };

      const template = await repository.createTemplate(data);

      expect(template.questions).toBeDefined();
      expect(template.questions[0]?.question_type).toBe('multiple_choice');
      expect(template.questions[0]?.options).toEqual(['Better opportunity', 'Relocation', 'Personal reasons', 'Other']);

      await repository.deleteTemplate(template.id);
    });

    it('should create template with yes/no questions', async () => {
      const data: CreateQuestionnaireTemplateDTO = {
        name: 'Yes/No Template',
        questions: [
          {
            question_text: 'Would you recommend this company to others?',
            question_type: 'yes_no',
            is_required: true,
            order: 1,
          },
        ],
      };

      const template = await repository.createTemplate(data);

      expect(template.questions).toBeDefined();
      expect(template.questions[0]?.question_type).toBe('yes_no');

      await repository.deleteTemplate(template.id);
    });

    it('should generate unique IDs for questions', async () => {
      const data: CreateQuestionnaireTemplateDTO = {
        name: 'ID Test Template',
        questions: [
          {
            question_text: 'Question 1',
            question_type: 'text',
            is_required: true,
            order: 1,
          },
          {
            question_text: 'Question 2',
            question_type: 'text',
            is_required: true,
            order: 2,
          },
        ],
      };

      const template = await repository.createTemplate(data);

      expect(template.questions).toBeDefined();
      expect(template.questions[0]?.id).toBeDefined();
      expect(template.questions[1]?.id).toBeDefined();
      expect(template.questions[0]?.id).not.toBe(template.questions[1]?.id);

      await repository.deleteTemplate(template.id);
    });
  });

  describe('getTemplate', () => {
    it('should retrieve template by ID', async () => {
      const template = await repository.getTemplate(testTemplateId);

      expect(template).toBeDefined();
      expect(template?.id).toBe(testTemplateId);
      expect(template?.name).toBe('Exit Interview Template');
    });

    it('should return null for non-existent template', async () => {
      const template = await repository.getTemplate('00000000-0000-4000-a000-ffffffffffff');

      expect(template).toBeNull();
    });
  });

  describe('getActiveTemplates', () => {
    it('should retrieve only active templates', async () => {
      // Create an active template
      const activeData: CreateQuestionnaireTemplateDTO = {
        name: 'Active Template',
        questions: [
          {
            question_text: 'Test question',
            question_type: 'text',
            is_required: true,
            order: 1,
          },
        ],
      };

      const activeTemplate = await repository.createTemplate(activeData);

      // Create and deactivate a template
      const inactiveData: CreateQuestionnaireTemplateDTO = {
        name: 'Inactive Template',
        questions: [
          {
            question_text: 'Test question',
            question_type: 'text',
            is_required: true,
            order: 1,
          },
        ],
      };

      const inactiveTemplate = await repository.createTemplate(inactiveData);
      await repository.deactivateTemplate(inactiveTemplate.id);

      const activeTemplates = await repository.getActiveTemplates();

      expect(activeTemplates.length).toBeGreaterThan(0);
      expect(activeTemplates.some((t) => t.id === activeTemplate.id)).toBe(true);
      expect(activeTemplates.some((t) => t.id === inactiveTemplate.id)).toBe(false);

      await repository.deleteTemplate(activeTemplate.id);
      await repository.deleteTemplate(inactiveTemplate.id);
    });
  });

  describe('getAllTemplates', () => {
    it('should retrieve all templates including inactive ones', async () => {
      const data: CreateQuestionnaireTemplateDTO = {
        name: 'All Templates Test',
        questions: [
          {
            question_text: 'Test question',
            question_type: 'text',
            is_required: true,
            order: 1,
          },
        ],
      };

      const template = await repository.createTemplate(data);
      const allTemplates = await repository.getAllTemplates();

      expect(allTemplates.length).toBeGreaterThan(0);
      expect(allTemplates.some((t) => t.id === template.id)).toBe(true);

      await repository.deleteTemplate(template.id);
    });
  });

  describe('updateTemplate', () => {
    it('should update template name and description', async () => {
      const data: CreateQuestionnaireTemplateDTO = {
        name: 'Original Name',
        description: 'Original description',
        questions: [
          {
            question_text: 'Test question',
            question_type: 'text',
            is_required: true,
            order: 1,
          },
        ],
      };

      const template = await repository.createTemplate(data);

      const updated = await repository.updateTemplate(template.id, {
        name: 'Updated Name',
        description: 'Updated description',
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.description).toBe('Updated description');

      await repository.deleteTemplate(template.id);
    });

    it('should update template questions', async () => {
      const data: CreateQuestionnaireTemplateDTO = {
        name: 'Question Update Test',
        questions: [
          {
            question_text: 'Original question',
            question_type: 'text',
            is_required: true,
            order: 1,
          },
        ],
      };

      const template = await repository.createTemplate(data);

      const updated = await repository.updateTemplate(template.id, {
        questions: [
          {
            question_text: 'Updated question',
            question_type: 'text',
            is_required: true,
            order: 1,
          },
          {
            question_text: 'New question',
            question_type: 'rating',
            is_required: false,
            order: 2,
          },
        ],
      });

      expect(updated.questions).toHaveLength(2);
      expect(updated.questions[0]?.question_text).toBe('Updated question');
      expect(updated.questions[1]?.question_text).toBe('New question');

      await repository.deleteTemplate(template.id);
    });

    it('should update is_active status', async () => {
      const data: CreateQuestionnaireTemplateDTO = {
        name: 'Active Status Test',
        questions: [
          {
            question_text: 'Test question',
            question_type: 'text',
            is_required: true,
            order: 1,
          },
        ],
      };

      const template = await repository.createTemplate(data);
      expect(template.is_active).toBe(true);

      const updated = await repository.updateTemplate(template.id, {
        is_active: false,
      });

      expect(updated.is_active).toBe(false);

      await repository.deleteTemplate(template.id);
    });
  });

  describe('deactivateTemplate', () => {
    it('should deactivate a template', async () => {
      const data: CreateQuestionnaireTemplateDTO = {
        name: 'Deactivate Test',
        questions: [
          {
            question_text: 'Test question',
            question_type: 'text',
            is_required: true,
            order: 1,
          },
        ],
      };

      const template = await repository.createTemplate(data);
      const deactivated = await repository.deactivateTemplate(template.id);

      expect(deactivated.is_active).toBe(false);

      await repository.deleteTemplate(template.id);
    });
  });

  describe('addQuestion', () => {
    it('should add a question to template', async () => {
      const data: CreateQuestionnaireTemplateDTO = {
        name: 'Add Question Test',
        questions: [
          {
            question_text: 'Original question',
            question_type: 'text',
            is_required: true,
            order: 1,
          },
        ],
      };

      const template = await repository.createTemplate(data);
      const newQuestion = await repository.addQuestion(template.id, {
        question_text: 'New question',
        question_type: 'rating',
        is_required: true,
        order: 2,
      });

      expect(newQuestion.id).toBeDefined();
      expect(newQuestion.question_text).toBe('New question');

      const updated = await repository.getTemplate(template.id);
      expect(updated?.questions).toHaveLength(2);

      await repository.deleteTemplate(template.id);
    });

    it('should throw error when adding question to non-existent template', async () => {
      await expect(
        repository.addQuestion('00000000-0000-4000-a000-ffffffffffff', {
          question_text: 'Test',
          question_type: 'text',
          is_required: true,
          order: 1,
        })
      ).rejects.toThrow('Template not found');
    });
  });

  describe('updateQuestion', () => {
    it('should update a question in template', async () => {
      const data: CreateQuestionnaireTemplateDTO = {
        name: 'Update Question Test',
        questions: [
          {
            question_text: 'Original question',
            question_type: 'text',
            is_required: true,
            order: 1,
          },
        ],
      };

      const template = await repository.createTemplate(data);
      const questionId = template.questions[0]?.id;

      expect(questionId).toBeDefined();

      const updated = await repository.updateQuestion(template.id, questionId!, {
        question_text: 'Updated question',
        is_required: false,
      });

      expect(updated.question_text).toBe('Updated question');
      expect(updated.is_required).toBe(false);

      await repository.deleteTemplate(template.id);
    });

    it('should throw error when updating non-existent question', async () => {
      const data: CreateQuestionnaireTemplateDTO = {
        name: 'Error Test',
        questions: [
          {
            question_text: 'Test question',
            question_type: 'text',
            is_required: true,
            order: 1,
          },
        ],
      };

      const template = await repository.createTemplate(data);

      await expect(
        repository.updateQuestion(template.id, '00000000-0000-4000-a000-ffffffffffff', {
          question_text: 'Updated',
        })
      ).rejects.toThrow('Question not found in template');

      await repository.deleteTemplate(template.id);
    });
  });

  describe('removeQuestion', () => {
    it('should remove a question from template', async () => {
      const data: CreateQuestionnaireTemplateDTO = {
        name: 'Remove Question Test',
        questions: [
          {
            question_text: 'Question 1',
            question_type: 'text',
            is_required: true,
            order: 1,
          },
          {
            question_text: 'Question 2',
            question_type: 'text',
            is_required: true,
            order: 2,
          },
        ],
      };

      const template = await repository.createTemplate(data);
      const questionIdToRemove = template.questions[0]?.id;

      expect(questionIdToRemove).toBeDefined();

      await repository.removeQuestion(template.id, questionIdToRemove!);

      const updated = await repository.getTemplate(template.id);
      expect(updated?.questions).toHaveLength(1);
      expect(updated?.questions[0]?.id).not.toBe(questionIdToRemove);

      await repository.deleteTemplate(template.id);
    });

    it('should throw error when removing last question', async () => {
      const data: CreateQuestionnaireTemplateDTO = {
        name: 'Last Question Test',
        questions: [
          {
            question_text: 'Only question',
            question_type: 'text',
            is_required: true,
            order: 1,
          },
        ],
      };

      const template = await repository.createTemplate(data);
      const questionId = template.questions[0]?.id;

      expect(questionId).toBeDefined();

      await expect(
        repository.removeQuestion(template.id, questionId!)
      ).rejects.toThrow('Cannot remove the last question from a template');

      await repository.deleteTemplate(template.id);
    });
  });

  describe('deleteTemplate', () => {
    it('should delete a template', async () => {
      const data: CreateQuestionnaireTemplateDTO = {
        name: 'Delete Test',
        questions: [
          {
            question_text: 'Test question',
            question_type: 'text',
            is_required: true,
            order: 1,
          },
        ],
      };

      const template = await repository.createTemplate(data);
      await repository.deleteTemplate(template.id);

      const deleted = await repository.getTemplate(template.id);
      expect(deleted).toBeNull();
    });
  });
});
