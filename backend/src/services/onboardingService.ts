import { Knex } from 'knex';
import { OnboardingRepository } from '../repositories/onboardingRepository';
import { EmployeeRepository } from '../repositories/employeeRepository';
import { OnboardingChecklist, OnboardingChecklistItem, CreateOnboardingChecklistDTO } from '../types/recruitment';
import { EmailService } from './emailService';
import { EmailTemplateType } from '../types/email';

export class OnboardingService {
  private onboardingRepository: OnboardingRepository;
  private employeeRepository: EmployeeRepository;
  private emailService: EmailService;
  private knex: Knex;

  constructor(knex: Knex) {
    this.knex = knex;
    this.onboardingRepository = new OnboardingRepository(knex);
    this.employeeRepository = new EmployeeRepository(knex);
    this.emailService = new EmailService();
  }

  async createOnboardingChecklist(data: CreateOnboardingChecklistDTO): Promise<OnboardingChecklist> {
    // Verify employee exists
    const employee = await this.employeeRepository.getEmployee(data.employee_id);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Create checklist
    const checklist = await this.onboardingRepository.createChecklist(data);

    // Send welcome email
    await this.emailService.sendWithTemplate(
      EmailTemplateType.ONBOARDING_CHECKLIST,
      employee.email,
      'Welcome to the Team - Onboarding Checklist',
      {
        employeeName: employee.first_name,
        startDate: employee.date_of_joining || new Date().toISOString().split('T')[0] || '2024-01-01',
        checklistItems: data.items.map(item => item.title),
        hrContactName: 'HR Team',
        hrContactEmail: 'hr@company.com',
      }
    );

    return checklist;
  }

  async completeChecklistItem(itemId: string, completedBy: string): Promise<OnboardingChecklistItem> {
    const item = await this.onboardingRepository.completeChecklistItem(itemId, completedBy);

    // Find the checklist that contains this item
    const checklists = await this.knex('onboarding_checklists').select('*');
    let checklist = null;
    
    for (const c of checklists) {
      const items = typeof c.items === 'string' 
        ? JSON.parse(c.items) 
        : c.items || [];
      
      if (items.some((i: any) => i.id === itemId)) {
        checklist = c;
        break;
      }
    }

    if (checklist && (await this.onboardingRepository.isChecklistComplete(checklist.id))) {
      // Complete the checklist
      await this.onboardingRepository.completeChecklist(checklist.id);

      // Send completion notification
      const employee = await this.employeeRepository.getEmployee(checklist.employee_id);
      if (employee) {
        await this.emailService.sendWithTemplate(
          EmailTemplateType.SYSTEM_NOTIFICATION,
          employee.email,
          'Onboarding Complete',
          {
            employeeName: employee.first_name,
            title: 'Onboarding Complete',
            message: 'Congratulations! Your onboarding checklist has been completed. Welcome to the team!',
          }
        );
      }
    }

    return item;
  }

  async getOnboardingChecklist(checklistId: string): Promise<OnboardingChecklist> {
    const checklist = await this.onboardingRepository.getChecklistById(checklistId);
    if (!checklist) {
      throw new Error('Onboarding checklist not found');
    }
    return checklist;
  }

  async getOnboardingChecklistByEmployee(employeeId: string): Promise<OnboardingChecklist | null> {
    return this.onboardingRepository.getChecklistByEmployee(employeeId);
  }

  async isChecklistComplete(checklistId: string): Promise<boolean> {
    return this.onboardingRepository.isChecklistComplete(checklistId);
  }

  async generateDefaultChecklist(employeeId: string, _departmentId: string): Promise<OnboardingChecklist> {
    // Default onboarding items based on department
    const defaultItems = [
      {
        title: 'IT Setup',
        description: 'Provide laptop, email, and system access',
      },
      {
        title: 'Office Access',
        description: 'Issue access card and keys',
      },
      {
        title: 'Orientation',
        description: 'Company overview and policies',
      },
      {
        title: 'Department Induction',
        description: 'Team introduction and role overview',
      },
      {
        title: 'Benefits Enrollment',
        description: 'Health insurance and benefits setup',
      },
      {
        title: 'Bank Details',
        description: 'Collect bank account information',
      },
    ];

    return this.createOnboardingChecklist({
      employee_id: employeeId,
      items: defaultItems,
    });
  }
}
