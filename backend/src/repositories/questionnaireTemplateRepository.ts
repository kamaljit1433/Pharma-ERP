import { Knex } from 'knex';
import { QuestionnaireTemplate, CreateQuestionnaireTemplateDTO, UpdateQuestionnaireTemplateDTO } from '../types/separation';
import { v4 as uuidv4 } from 'uuid';

export class QuestionnaireTemplateRepository {
  constructor(private db: Knex) {}

  async createTemplate(data: CreateQuestionnaireTemplateDTO): Promise<QuestionnaireTemplate> {
    const id = uuidv4();

    const [template] = await this.db('questionnaire_templates')
      .insert({
        id,
        name: data.name,
        description: data.description,
        questions: JSON.stringify(data.questions),
        is_active: true,
      })
      .returning('*');

    return this.parseTemplate(template);
  }

  async getTemplate(id: string): Promise<QuestionnaireTemplate | null> {
    const template = await this.db('questionnaire_templates').where('id', id).first();
    return template ? this.parseTemplate(template) : null;
  }

  async getActiveTemplates(): Promise<QuestionnaireTemplate[]> {
    const templates = await this.db('questionnaire_templates')
      .where('is_active', true)
      .orderBy('created_at', 'desc');
    return templates.map(t => this.parseTemplate(t));
  }

  async getAllTemplates(): Promise<QuestionnaireTemplate[]> {
    const templates = await this.db('questionnaire_templates')
      .orderBy('created_at', 'desc');
    return templates.map(t => this.parseTemplate(t));
  }

  async updateTemplate(id: string, data: UpdateQuestionnaireTemplateDTO): Promise<QuestionnaireTemplate> {
    const updateData: any = {
      updated_at: this.db.fn.now(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.questions !== undefined) updateData.questions = JSON.stringify(data.questions);
    if (data.is_active !== undefined) updateData.is_active = data.is_active;

    const [template] = await this.db('questionnaire_templates')
      .where('id', id)
      .update(updateData)
      .returning('*');

    return this.parseTemplate(template);
  }

  async deactivateTemplate(id: string): Promise<QuestionnaireTemplate> {
    const [template] = await this.db('questionnaire_templates')
      .where('id', id)
      .update({
        is_active: false,
        updated_at: this.db.fn.now(),
      })
      .returning('*');

    return this.parseTemplate(template);
  }

  async deleteTemplate(id: string): Promise<void> {
    await this.db('questionnaire_templates').where('id', id).delete();
  }

  private parseTemplate(template: any): QuestionnaireTemplate {
    return {
      ...template,
      questions: typeof template.questions === 'string' ? JSON.parse(template.questions) : template.questions,
    };
  }
}
