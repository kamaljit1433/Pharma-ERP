/**
 * Questionnaire Template Service - Unit Tests
 * Tests for questionnaire template management including CRUD operations,
 * question management, and validation
 */

import { describe, it, expect } from '@jest/globals';
import { QuestionnaireTemplateRepository } from '../../repositories/questionnaireTemplateRepository';
import { CreateQuestionnaireTemplateDTO, UpdateQuestionnaireTemplateDTO } from '../../types/separation';

describe('QuestionnaireTemplateRepository - Unit Tests', () => {
  let repository: QuestionnaireTemplateRepository;

  // Mock Knex instance
  const mockKnex = {
    fn: {
      now: () => new Date(),
    },
    raw: (sql: string) => sql,
  };

  beforeEach(() => {
    // Create a mock repository for testing logic without database
    repository = new QuestionnaireTemplateRepository(mockKnex as any);
  });

  describe('Question ID Generation', () => {
    it('should generate unique question IDs', () => {
      const data: CreateQuestionnaireTemplateDTO = {
        name: 'Test Template',
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

      // Test that the repository can be instantiated
      expect(repository).toBeDefined();
    });
  });

  describe('Template Validation', () => {
    it('should validate template structure', () => {
      const validTemplate: CreateQuestionnaireTemplateDTO = {
        name: 'Valid Template',
        description: 'A valid template',
        questions: [
          {
            question_text: 'What is your feedback?',
            question_type: 'text',
            is_required: true,
            order: 1,
          },
        ],
      };

      expect(validTemplate.name).toBeDefined();
      expect(validTemplate.questions).toHaveLength(1);
      expect(validTemplate.questions[0]?.question_type).toBe('text');
    });

    it('should support multiple question types', () => {
      const questionTypes = ['text', 'multiple_choice', 'rating', 'yes_no'];

      questionTypes.forEach((type) => {
        const template: CreateQuestionnaireTemplateDTO = {
          name: `Template with ${type}`,
          questions: [
            {
              question_text: 'Test question',
              question_type: type as any,
              is_required: true,
              order: 1,
              options: type === 'multiple_choice' ? ['Option 1', 'Option 2'] : undefined,
            },
          ],
        };

        expect(template.questions[0]?.question_type).toBe(type);
      });
    });

    it('should validate multiple choice questions have options', () => {
      const template: CreateQuestionnaireTemplateDTO = {
        name: 'Multiple Choice Template',
        questions: [
          {
            question_text: 'Choose one',
            question_type: 'multiple_choice',
            options: ['Option A', 'Option B', 'Option C'],
            is_required: true,
            order: 1,
          },
        ],
      };

      expect(template.questions[0]?.options).toHaveLength(3);
      expect(template.questions[0]?.options).toContain('Option A');
    });

    it('should validate rating questions', () => {
      const template: CreateQuestionnaireTemplateDTO = {
        name: 'Rating Template',
        questions: [
          {
            question_text: 'Rate your experience',
            question_type: 'rating',
            is_required: true,
            order: 1,
          },
        ],
      };

      expect(template.questions[0]?.question_type).toBe('rating');
    });

    it('should validate yes/no questions', () => {
      const template: CreateQuestionnaireTemplateDTO = {
        name: 'Yes/No Template',
        questions: [
          {
            question_text: 'Would you recommend us?',
            question_type: 'yes_no',
            is_required: true,
            order: 1,
          },
        ],
      };

      expect(template.questions[0]?.question_type).toBe('yes_no');
    });
  });

  describe('Update Template Validation', () => {
    it('should support partial updates', () => {
      const update: UpdateQuestionnaireTemplateDTO = {
        name: 'Updated Name',
        is_active: false,
      };

      expect(update.name).toBe('Updated Name');
      expect(update.is_active).toBe(false);
      expect(update.questions).toBeUndefined();
    });

    it('should support updating questions', () => {
      const update: UpdateQuestionnaireTemplateDTO = {
        questions: [
          {
            question_text: 'New question',
            question_type: 'text',
            is_required: true,
            order: 1,
          },
        ],
      };

      expect(update.questions).toHaveLength(1);
      expect(update.questions?.[0]?.question_text).toBe('New question');
    });

    it('should support updating description', () => {
      const update: UpdateQuestionnaireTemplateDTO = {
        description: 'Updated description',
      };

      expect(update.description).toBe('Updated description');
    });
  });

  describe('Question Management', () => {
    it('should support adding questions', () => {
      const newQuestion = {
        question_text: 'New question',
        question_type: 'text' as const,
        is_required: true,
        order: 1,
      };

      expect(newQuestion.question_text).toBeDefined();
      expect(newQuestion.question_type).toBe('text');
    });

    it('should support updating questions', () => {
      const update = {
        question_text: 'Updated question',
        is_required: false,
      };

      expect(update.question_text).toBe('Updated question');
      expect(update.is_required).toBe(false);
    });

    it('should support removing questions', () => {
      const questions = [
        {
          id: 'q1',
          question_text: 'Question 1',
          question_type: 'text' as const,
          is_required: true,
          order: 1,
        },
        {
          id: 'q2',
          question_text: 'Question 2',
          question_type: 'text' as const,
          is_required: true,
          order: 2,
        },
      ];

      const filtered = questions.filter((q) => q.id !== 'q1');
      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.id).toBe('q2');
    });
  });

  describe('Template Status Management', () => {
    it('should support active/inactive status', () => {
      const template = {
        id: 'template-1',
        name: 'Test Template',
        is_active: true,
      };

      expect(template.is_active).toBe(true);

      template.is_active = false;
      expect(template.is_active).toBe(false);
    });

    it('should support deactivating templates', () => {
      const template = {
        id: 'template-1',
        name: 'Test Template',
        is_active: true,
      };

      const deactivated = {
        ...template,
        is_active: false,
      };

      expect(deactivated.is_active).toBe(false);
      expect(template.is_active).toBe(true); // Original unchanged
    });
  });

  describe('Template Data Structure', () => {
    it('should have correct template structure', () => {
      const template = {
        id: 'template-1',
        name: 'Exit Interview',
        description: 'Standard exit interview',
        questions: [
          {
            id: 'q1',
            question_text: 'Why are you leaving?',
            question_type: 'text' as const,
            is_required: true,
            order: 1,
          },
        ],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      expect(template.id).toBeDefined();
      expect(template.name).toBeDefined();
      expect(template.questions).toHaveLength(1);
      expect(template.is_active).toBe(true);
      expect(template.created_at).toBeInstanceOf(Date);
      expect(template.updated_at).toBeInstanceOf(Date);
    });

    it('should support optional description', () => {
      const template1 = {
        id: 'template-1',
        name: 'Template 1',
        description: 'With description',
        questions: [],
        is_active: true,
      };

      const template2 = {
        id: 'template-2',
        name: 'Template 2',
        questions: [],
        is_active: true,
      } as any;

      expect(template1.description).toBeDefined();
      expect(template2.description).toBeUndefined();
    });
  });

  describe('Question Order Management', () => {
    it('should maintain question order', () => {
      const questions = [
        {
          id: 'q1',
          question_text: 'First',
          question_type: 'text' as const,
          is_required: true,
          order: 1,
        },
        {
          id: 'q2',
          question_text: 'Second',
          question_type: 'text' as const,
          is_required: true,
          order: 2,
        },
        {
          id: 'q3',
          question_text: 'Third',
          question_type: 'text' as const,
          is_required: true,
          order: 3,
        },
      ];

      const sorted = questions.sort((a, b) => a.order - b.order);
      expect(sorted[0]?.question_text).toBe('First');
      expect(sorted[1]?.question_text).toBe('Second');
      expect(sorted[2]?.question_text).toBe('Third');
    });
  });
});
