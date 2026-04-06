import { Knex } from 'knex';
import {
  QuestionnaireTemplate,
  QuestionnaireQuestion,
  CreateQuestionnaireTemplateDTO,
  UpdateQuestionnaireTemplateDTO,
} from '../types/separation';

export class QuestionnaireTemplateRepository {
  constructor(private knex: Knex) {}

  /**
   * Create a new questionnaire template
   */
  async createTemplate(data: CreateQuestionnaireTemplateDTO): Promise<QuestionnaireTemplate> {
    const [template] = await this.knex('questionnaire_templates')
      .insert({
        name: data.name,
        description: data.description || null,
        questions: JSON.stringify(this.enrichQuestionsWithIds(data.questions)),
        is_active: true,
      })
      .returning('*');

    return this.mapToTemplate(template);
  }

  /**
   * Get template by ID
   */
  async getTemplate(id: string): Promise<QuestionnaireTemplate | null> {
    const template = await this.knex('questionnaire_templates')
      .where({ id })
      .first();

    return template ? this.mapToTemplate(template) : null;
  }

  /**
   * Get all active templates
   */
  async getActiveTemplates(): Promise<QuestionnaireTemplate[]> {
    const templates = await this.knex('questionnaire_templates')
      .where({ is_active: true })
      .orderBy('created_at', 'desc');

    return templates.map((t) => this.mapToTemplate(t));
  }

  /**
   * Get all templates (active and inactive)
   */
  async getAllTemplates(): Promise<QuestionnaireTemplate[]> {
    const templates = await this.knex('questionnaire_templates')
      .orderBy('created_at', 'desc');

    return templates.map((t) => this.mapToTemplate(t));
  }

  /**
   * Update template
   */
  async updateTemplate(
    id: string,
    data: UpdateQuestionnaireTemplateDTO
  ): Promise<QuestionnaireTemplate> {
    const updateData: any = {
      updated_at: this.knex.fn.now(),
    };

    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.description !== undefined) {
      updateData.description = data.description || null;
    }
    if (data.questions !== undefined) {
      updateData.questions = JSON.stringify(this.enrichQuestionsWithIds(data.questions));
    }
    if (data.is_active !== undefined) {
      updateData.is_active = data.is_active;
    }

    const [updated] = await this.knex('questionnaire_templates')
      .where({ id })
      .update(updateData)
      .returning('*');

    return this.mapToTemplate(updated);
  }

  /**
   * Deactivate template
   */
  async deactivateTemplate(id: string): Promise<QuestionnaireTemplate> {
    const [updated] = await this.knex('questionnaire_templates')
      .where({ id })
      .update({
        is_active: false,
        updated_at: this.knex.fn.now(),
      })
      .returning('*');

    return this.mapToTemplate(updated);
  }

  /**
   * Delete template
   */
  async deleteTemplate(id: string): Promise<void> {
    await this.knex('questionnaire_templates')
      .where({ id })
      .delete();
  }

  /**
   * Add question to template
   */
  async addQuestion(
    templateId: string,
    question: Omit<QuestionnaireQuestion, 'id'>
  ): Promise<QuestionnaireQuestion> {
    const template = await this.getTemplate(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const newQuestion: QuestionnaireQuestion = {
      id: this.generateQuestionId(),
      ...question,
    };

    const updatedQuestions = [...template.questions, newQuestion];

    await this.knex('questionnaire_templates')
      .where({ id: templateId })
      .update({
        questions: JSON.stringify(updatedQuestions),
        updated_at: this.knex.fn.now(),
      });

    return newQuestion;
  }

  /**
   * Update question in template
   */
  async updateQuestion(
    templateId: string,
    questionId: string,
    question: Partial<QuestionnaireQuestion>
  ): Promise<QuestionnaireQuestion> {
    const template = await this.getTemplate(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const questionIndex = template.questions.findIndex((q) => q.id === questionId);
    if (questionIndex === -1) {
      throw new Error('Question not found in template');
    }

    const existingQuestion = template.questions[questionIndex]!;
    const updatedQuestion: QuestionnaireQuestion = {
      id: questionId,
      question_text: question.question_text ?? existingQuestion.question_text,
      question_type: question.question_type ?? existingQuestion.question_type,
      is_required: question.is_required !== undefined ? question.is_required : existingQuestion.is_required,
      order: question.order !== undefined ? question.order : existingQuestion.order,
      options: question.options ?? existingQuestion.options,
    };

    template.questions[questionIndex] = updatedQuestion;

    await this.knex('questionnaire_templates')
      .where({ id: templateId })
      .update({
        questions: JSON.stringify(template.questions),
        updated_at: this.knex.fn.now(),
      });

    return updatedQuestion;
  }

  /**
   * Remove question from template
   */
  async removeQuestion(templateId: string, questionId: string): Promise<void> {
    const template = await this.getTemplate(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const updatedQuestions = template.questions.filter((q) => q.id !== questionId);

    if (updatedQuestions.length === 0) {
      throw new Error('Cannot remove the last question from a template');
    }

    await this.knex('questionnaire_templates')
      .where({ id: templateId })
      .update({
        questions: JSON.stringify(updatedQuestions),
        updated_at: this.knex.fn.now(),
      });
  }

  /**
   * Map database row to QuestionnaireTemplate
   */
  private mapToTemplate(row: any): QuestionnaireTemplate {
    const questions =
      typeof row.questions === 'string' ? JSON.parse(row.questions) : row.questions;

    return {
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      questions: questions || [],
      is_active: row.is_active,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }

  /**
   * Enrich questions with IDs if not present
   */
  private enrichQuestionsWithIds(
    questions: Omit<QuestionnaireQuestion, 'id'>[]
  ): QuestionnaireQuestion[] {
    return questions.map((q) => ({
      id: this.generateQuestionId(),
      ...q,
    }));
  }

  /**
   * Generate unique question ID
   */
  private generateQuestionId(): string {
    return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
