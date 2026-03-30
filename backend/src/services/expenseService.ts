import { Knex } from 'knex';
import { ApprovalRoutingService } from './approvalRoutingService';

export interface ExpenseClaim {
  id: string;
  employeeId: string;
  amount: number;
  category: string;
  description: string;
  receiptUrl?: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseClaimDTO {
  employeeId: string;
  amount: number;
  category: string;
  description: string;
  receiptUrl?: string;
}

export class ExpenseService {
  private approvalRoutingService: ApprovalRoutingService;

  constructor(private knex: Knex) {
    this.approvalRoutingService = new ApprovalRoutingService(knex);
  }

  /**
   * Submit an expense claim
   */
  async submitExpenseClaim(data: ExpenseClaimDTO): Promise<ExpenseClaim> {
    // Validate amount
    if (data.amount <= 0) {
      throw new Error('Expense amount must be greater than 0');
    }

    // Create expense claim record
    const expenseClaim: ExpenseClaim = {
      id: this.generateId(),
      employeeId: data.employeeId,
      amount: data.amount,
      category: data.category,
      description: data.description,
      receiptUrl: data.receiptUrl,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store in database
    await this.knex('expense_claims').insert({
      id: expenseClaim.id,
      employee_id: data.employeeId,
      amount: data.amount,
      category: data.category,
      description: data.description,
      receipt_url: data.receiptUrl,
      status: 'pending',
      created_at: expenseClaim.createdAt,
      updated_at: expenseClaim.updatedAt,
    });

    // Route approval through hierarchy
    try {
      await this.approvalRoutingService.routeApprovalRequest({
        requestType: 'expense',
        requestId: expenseClaim.id,
        employeeId: data.employeeId,
        requestData: expenseClaim,
      });
    } catch (error) {
      // Log error but don't fail the expense claim creation
      console.error('Failed to route expense approval:', error);
    }

    return expenseClaim;
  }

  /**
   * Get expense claim by ID
   */
  async getExpenseClaim(id: string): Promise<ExpenseClaim | null> {
    const record = await this.knex('expense_claims').where('id', id).first();

    if (!record) {
      return null;
    }

    return {
      id: record.id,
      employeeId: record.employee_id,
      amount: record.amount,
      category: record.category,
      description: record.description,
      receiptUrl: record.receipt_url,
      status: record.status,
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at),
    };
  }

  /**
   * Get expense claims for an employee
   */
  async getEmployeeExpenseClaims(employeeId: string): Promise<ExpenseClaim[]> {
    const records = await this.knex('expense_claims')
      .where('employee_id', employeeId)
      .orderBy('created_at', 'desc')
      .select('*');

    return records.map((record) => ({
      id: record.id,
      employeeId: record.employee_id,
      amount: record.amount,
      category: record.category,
      description: record.description,
      receiptUrl: record.receipt_url,
      status: record.status,
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at),
    }));
  }

  /**
   * Update expense claim status
   */
  async updateExpenseClaimStatus(
    id: string,
    status: 'approved' | 'rejected' | 'paid'
  ): Promise<void> {
    await this.knex('expense_claims')
      .where('id', id)
      .update({
        status,
        updated_at: new Date(),
      });
  }

  /**
   * Get pending expense claims for a manager
   */
  async getPendingExpenseClaimsForManager(managerId: string): Promise<ExpenseClaim[]> {
    // Get direct reports for the manager
    const directReports = await this.knex('hierarchy_nodes')
      .where('manager_id', managerId)
      .select('employee_id');

    const employeeIds = directReports.map((r) => r.employee_id);

    if (employeeIds.length === 0) {
      return [];
    }

    const records = await this.knex('expense_claims')
      .whereIn('employee_id', employeeIds)
      .where('status', 'pending')
      .orderBy('created_at', 'asc')
      .select('*');

    return records.map((record) => ({
      id: record.id,
      employeeId: record.employee_id,
      amount: record.amount,
      category: record.category,
      description: record.description,
      receiptUrl: record.receipt_url,
      status: record.status,
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at),
    }));
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
