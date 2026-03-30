import { Knex } from 'knex';
import { OnboardingChecklist, OnboardingChecklistItem, CreateOnboardingChecklistDTO } from '../types/recruitment';
import { v4 as uuidv4 } from 'uuid';

export class OnboardingRepository {
  constructor(private knex: Knex) {}

  async createChecklist(data: CreateOnboardingChecklistDTO): Promise<OnboardingChecklist> {
    const checklistId = uuidv4();
    
    // Create items with IDs
    const items: any[] = data.items.map(item => ({
      id: uuidv4(),
      checklist_id: checklistId,
      title: item.title,
      description: item.description,
      ...(item.assigned_to && { assigned_to: item.assigned_to }),
      completed: false,
    }));

    const checklist: OnboardingChecklist = {
      id: checklistId,
      employee_id: data.employee_id,
      title: 'Onboarding Checklist',
      status: 'pending',
      items: items as OnboardingChecklistItem[],
      created_at: new Date(),
      updated_at: new Date(),
    };

    await this.knex('onboarding_checklists').insert({
      id: checklistId,
      employee_id: data.employee_id,
      title: 'Onboarding Checklist',
      items: JSON.stringify(items),
      status: 'pending',
      created_at: checklist.created_at,
      updated_at: checklist.updated_at,
    });

    return checklist;
  }

  async getChecklistById(id: string): Promise<OnboardingChecklist | null> {
    const checklist = await this.knex('onboarding_checklists').where({ id }).first();
    if (!checklist) return null;

    const items = typeof checklist.items === 'string' 
      ? JSON.parse(checklist.items) 
      : checklist.items || [];

    return {
      ...checklist,
      items,
    };
  }

  async getChecklistByEmployee(employeeId: string): Promise<OnboardingChecklist | null> {
    const checklist = await this.knex('onboarding_checklists').where({ employee_id: employeeId }).first();
    if (!checklist) return null;

    const items = typeof checklist.items === 'string' 
      ? JSON.parse(checklist.items) 
      : checklist.items || [];

    return {
      ...checklist,
      items,
    };
  }

  async completeChecklistItem(itemId: string, completedBy: string): Promise<OnboardingChecklistItem> {
    // Get the checklist to find the item
    const checklists = await this.knex('onboarding_checklists').select('*');
    
    let targetChecklist = null;
    let targetItem = null;
    
    for (const checklist of checklists) {
      const items = typeof checklist.items === 'string' 
        ? JSON.parse(checklist.items) 
        : checklist.items || [];
      
      const item = items.find((i: any) => i.id === itemId);
      if (item) {
        targetChecklist = checklist;
        targetItem = item;
        break;
      }
    }

    if (!targetItem || !targetChecklist) {
      throw new Error('Checklist item not found');
    }

    // Update the item
    const now = new Date();
    targetItem.completed = true;
    targetItem.completed_at = now;
    targetItem.completed_by = completedBy;

    // Update the checklist with new items
    await this.knex('onboarding_checklists')
      .where({ id: targetChecklist.id })
      .update({
        items: JSON.stringify(targetChecklist.items),
        updated_at: now,
      });

    return targetItem;
  }

  async isChecklistComplete(checklistId: string): Promise<boolean> {
    const checklist = await this.knex('onboarding_checklists').where({ id: checklistId }).first();
    if (!checklist) return false;

    const items = typeof checklist.items === 'string' 
      ? JSON.parse(checklist.items) 
      : checklist.items || [];

    return items.every((item: any) => item.completed === true);
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
}
