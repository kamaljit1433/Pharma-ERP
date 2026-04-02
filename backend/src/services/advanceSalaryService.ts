import { Knex } from 'knex';
import { AdvanceSalaryRepository } from '../repositories/advanceSalaryRepository';
import {
  AdvanceSalaryRequest,
  CreateAdvanceSalaryDTO,
} from '../types/payroll';

export class AdvanceSalaryService {
  private advanceSalaryRepository: AdvanceSalaryRepository;

  constructor(private knex: Knex) {
    this.advanceSalaryRepository = new AdvanceSalaryRepository(knex);
  }

  async requestAdvanceSalary(
    data: CreateAdvanceSalaryDTO
  ): Promise<AdvanceSalaryRequest> {
    // Validate amount first (before database queries)
    if (data.amount <= 0) {
      throw new Error('Advance amount must be greater than 0');
    }

    // Validate and default deduction_months
    if (data.deduction_months === undefined || data.deduction_months === null) {
      data = { ...data, deduction_months: 1 };
    } else if (!Number.isInteger(data.deduction_months) || data.deduction_months < 1 || data.deduction_months > 12) {
      throw new Error('deduction_months must be a whole number between 1 and 12');
    }

    // Validate employee exists
    const employee = await this.knex('employees')
      .where({ id: data.employee_id })
      .first();

    if (!employee) {
      throw new Error(`Employee with ID ${data.employee_id} not found`);
    }

    // Get salary structure to validate against gross salary
    const salaryStructure = await this.knex('salary_structures')
      .where({ employee_id: data.employee_id, is_active: true })
      .first();

    if (!salaryStructure) {
      throw new Error('No active salary structure found for employee');
    }

    const grossSalary =
      Number(salaryStructure.base_salary) +
      Number(salaryStructure.hra) +
      Number(salaryStructure.dearness_allowance) +
      Number(salaryStructure.other_allowances);

    if (data.amount > grossSalary) {
      throw new Error('Advance amount cannot exceed gross salary');
    }

    // Check for pending advance requests
    const pendingAdvances = await this.knex('advance_salary_requests')
      .where({
        employee_id: data.employee_id,
        status: 'pending',
      })
      .count('* as count')
      .first();

    if (pendingAdvances && Number(pendingAdvances['count']) > 0) {
      throw new Error('Employee already has a pending advance request');
    }

    return this.advanceSalaryRepository.createAdvanceRequest(data);
  }

  async getAdvanceRequest(id: string): Promise<AdvanceSalaryRequest | null> {
    return this.advanceSalaryRepository.getAdvanceRequestById(id);
  }

  async getAdvanceRequestsByEmployee(
    employeeId: string
  ): Promise<AdvanceSalaryRequest[]> {
    return this.advanceSalaryRepository.getAdvanceRequestsByEmployee(employeeId);
  }

  async getPendingAdvanceRequests(): Promise<AdvanceSalaryRequest[]> {
    return this.advanceSalaryRepository.getPendingAdvanceRequests();
  }

  async approveAdvanceRequest(
    id: string,
    approvedBy: string,
    notes?: string
  ): Promise<AdvanceSalaryRequest> {
    const request = await this.advanceSalaryRepository.getAdvanceRequestById(id);

    if (!request) {
      throw new Error(`Advance request with ID ${id} not found`);
    }

    if (request.status !== 'pending') {
      throw new Error('Only pending requests can be approved');
    }

    return this.advanceSalaryRepository.approveAdvanceRequest(
      id,
      approvedBy,
      notes
    );
  }

  async rejectAdvanceRequest(
    id: string,
    approvedBy: string,
    notes?: string
  ): Promise<AdvanceSalaryRequest> {
    const request = await this.advanceSalaryRepository.getAdvanceRequestById(id);

    if (!request) {
      throw new Error(`Advance request with ID ${id} not found`);
    }

    if (request.status !== 'pending') {
      throw new Error('Only pending requests can be rejected');
    }

    return this.advanceSalaryRepository.rejectAdvanceRequest(
      id,
      approvedBy,
      notes
    );
  }
}
