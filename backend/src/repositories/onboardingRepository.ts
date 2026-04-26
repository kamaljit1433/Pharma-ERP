import { Knex } from 'knex';
import {
  OnboardingChecklist,
  OnboardingChecklistItem,
  CreateOnboardingChecklistDTO,
  UpdateOnboardingChecklistDTO,
} from '../types/recruitment';
import { v4 as uuidv4 } from 'uuid';

export class OnboardingRepository {
  constructor(private knex: Knex) {}

  async createChecklist(data: CreateOnboardingChecklistDTO): Promise<OnboardingChecklist> {
    const checklistId = uuidv4();
    const now = new Date();

    const items: OnboardingChecklistItem[] = data.items.map((item) => ({
      id: uuidv4(),
      checklist_id: checklistId,
      task: item.task,
      completed: item.completed ?? false,
    }));

    await this.knex('onboarding_checklists').insert({
      id: checklistId,
      employee_id: data.employee_id,
      title: 'Onboarding Checklist',
      items: JSON.stringify(items),
      status: data.status ?? 'pending',
      created_at: now,
      updated_at: now,
    });

    return {
      id: checklistId,
      employee_id: data.employee_id,
      title: 'Onboarding Checklist',
      status: data.status ?? 'pending',
      items,
      created_at: now,
      updated_at: now,
    };
  }

  async getChecklistById(id: string): Promise<OnboardingChecklist | null> {
    const checklist = await this.knex('onboarding_checklists').where({ id }).first();
    if (!checklist) return null;
    return this.mapToChecklist(checklist);
  }

  async getChecklistByEmployee(employeeId: string): Promise<OnboardingChecklist | null> {
    const checklist = await this.knex('onboarding_checklists')
      .where({ employee_id: employeeId })
      .first();
    if (!checklist) return null;
    return this.mapToChecklist(checklist);
  }

  async updateChecklist(
    id: string,
    data: UpdateOnboardingChecklistDTO
  ): Promise<OnboardingChecklist> {
    const updateData: any = { updated_at: this.knex.fn.now() };

    if (data.status !== undefined) updateData.status = data.status;
    if (data.items !== undefined) {
      const items: OnboardingChecklistItem[] = data.items.map((item) => ({
        task: item.task,
        completed: item.completed ?? false,
      }));
      updateData.items = JSON.stringify(items);
    }

    await this.knex('onboarding_checklists').where({ id }).update(updateData);

    const updated = await this.getChecklistById(id);
    if (!updated) throw new Error(`Checklist with id ${id} not found`);
    return updated;
  }

  async completeItem(checklistId: string, itemIndex: number): Promise<OnboardingChecklist> {
    const checklist = await this.getChecklistById(checklistId);
    if (!checklist) throw new Error(`Checklist with id ${checklistId} not found`);

    const items = [...checklist.items];
    if (itemIndex < 0 || itemIndex >= items.length) {
      throw new Error(`Item index ${itemIndex} out of range`);
    }

    items[itemIndex] = { ...items[itemIndex]!, completed: true, completed_at: new Date() };

    await this.knex('onboarding_checklists')
      .where({ id: checklistId })
      .update({ items: JSON.stringify(items), updated_at: this.knex.fn.now() });

    return { ...checklist, items };
  }

  async deleteChecklist(id: string): Promise<void> {
    await this.knex('onboarding_checklists').where({ id }).del();
  }

  async completeChecklistItem(itemId: string, completedBy: string): Promise<OnboardingChecklistItem> {
    const checklists = await this.knex('onboarding_checklists').select('*');

    let targetChecklist = null;
    let targetItem: any = null;
    let targetItems: any[] = [];

    for (const checklist of checklists) {
      let items: any[] = [];
      try {
        items = typeof checklist.items === 'string'
          ? JSON.parse(checklist.items)
          : Array.isArray(checklist.items) ? checklist.items : [];
      } catch (e) {
        items = [];
      }

      const item = Array.isArray(items) ? items.find((i: any) => i.id === itemId) : null;
      if (item) {
        targetChecklist = checklist;
        targetItem = item;
        targetItems = items;
        break;
      }
    }

    if (!targetItem || !targetChecklist) {
      throw new Error('Checklist item not found');
    }

    const now = new Date();
    targetItem.completed = true;
    targetItem.completed_at = now;
    targetItem.completed_by = completedBy;
    targetItem.checklist_id = targetChecklist.id;

    await this.knex('onboarding_checklists')
      .where({ id: targetChecklist.id })
      .update({ items: JSON.stringify(targetItems), updated_at: now });

    return targetItem;
  }

  async isChecklistComplete(checklistId: string): Promise<boolean> {
    const checklist = await this.getChecklistById(checklistId);
    if (!checklist) return false;
    return checklist.items.every((item) => item.completed === true);
  }

  async completeChecklist(checklistId: string): Promise<OnboardingChecklist> {
    const now = new Date();
    await this.knex('onboarding_checklists').where({ id: checklistId }).update({
      status: 'completed',
      completed_date: now,
      updated_at: now,
    });

    const checklist = await this.getChecklistById(checklistId);
    if (!checklist) throw new Error('Checklist not found');
    return checklist;
  }

  private mapToChecklist(row: any): OnboardingChecklist {
    const items: OnboardingChecklistItem[] =
      typeof row.items === 'string'
        ? JSON.parse(row.items)
        : Array.isArray(row.items)
        ? row.items
        : [];

    return {
      id: row.id,
      employee_id: row.employee_id,
      title: row.title,
      description: row.description,
      status: row.status,
      items,
      target_completion_date: row.target_completion_date
        ? new Date(row.target_completion_date)
        : undefined,
      completed_date: row.completed_date ? new Date(row.completed_date) : undefined,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }
}
