import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { resolveEmployeeUUID as resolveUUID } from '../utils/resolveEmployeeId';

export interface InsuranceEnrollmentRecord {
  id: string;
  employee_id: string;
  plan_id: string;
  enrollment_date: Date;
  status: 'active' | 'pending' | 'cancelled' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface CreateEnrollmentDTO {
  employee_id: string;
  plan_id: string;
  enrollment_date: Date;
  status: 'active' | 'pending' | 'cancelled' | 'inactive';
}

export interface UpdateEnrollmentDTO {
  status?: 'active' | 'pending' | 'cancelled' | 'inactive';
  enrollment_date?: Date;
}

export class InsuranceEnrollmentRepository {
  constructor(private db: Knex) {}

  async createEnrollment(data: CreateEnrollmentDTO): Promise<InsuranceEnrollmentRecord> {
    const id = uuidv4();
    const resolvedEmployeeId = await this.resolveEmployeeUUID(data.employee_id);
    if (!resolvedEmployeeId) throw new Error(`Employee not found: ${data.employee_id}`);

    const [enrollment] = await this.db('insurance_enrollments')
      .insert({
        id,
        employee_id: resolvedEmployeeId,
        insurance_plan_id: data.plan_id,
        enrollment_date: data.enrollment_date,
        effective_from: data.enrollment_date,
        status: data.status,
      })
      .returning('*');

    return this.mapRow(enrollment);
  }

  private resolveEmployeeUUID(employeeId: string): Promise<string | null> {
    return resolveUUID(this.db, employeeId);
  }

  async getEnrollmentById(id: string): Promise<InsuranceEnrollmentRecord | null> {
    const row = await this.db('insurance_enrollments').where('id', id).first();
    return row ? this.mapRow(row) : null;
  }

  async getEnrollmentsByEmployee(employeeId: string): Promise<InsuranceEnrollmentRecord[]> {
    const resolvedId = await this.resolveEmployeeUUID(employeeId);
    if (!resolvedId) return [];

    const rows = await this.db('insurance_enrollments')
      .where('employee_id', resolvedId)
      .orderBy('created_at', 'desc');

    return rows.map((r: any) => this.mapRow(r));
  }

  async getEnrollmentsByPlan(planId: string): Promise<InsuranceEnrollmentRecord[]> {
    const rows = await this.db('insurance_enrollments')
      .where('insurance_plan_id', planId)
      .orderBy('created_at', 'desc');

    return rows.map((r: any) => this.mapRow(r));
  }

  async getActiveEnrollments(): Promise<InsuranceEnrollmentRecord[]> {
    const rows = await this.db('insurance_enrollments')
      .where('status', 'active')
      .orderBy('created_at', 'desc');

    return rows.map((r: any) => this.mapRow(r));
  }

  async updateEnrollment(id: string, data: UpdateEnrollmentDTO): Promise<InsuranceEnrollmentRecord> {
    const updateData: Record<string, any> = { updated_at: this.db.fn.now() };
    if (data.status !== undefined) updateData['status'] = data.status;
    if (data.enrollment_date !== undefined) updateData['enrollment_date'] = data.enrollment_date;

    const [enrollment] = await this.db('insurance_enrollments')
      .where('id', id)
      .update(updateData)
      .returning('*');

    return this.mapRow(enrollment);
  }

  async deleteEnrollment(id: string): Promise<void> {
    await this.db('insurance_enrollments').where('id', id).delete();
  }

  // Legacy methods kept for backward compatibility
  async getEnrollmentByEmployeeAndPlan(
    employeeId: string,
    insurancePlanId: string
  ): Promise<InsuranceEnrollmentRecord | null> {
    const resolvedId = await this.resolveEmployeeUUID(employeeId);
    if (!resolvedId) return null;

    const row = await this.db('insurance_enrollments')
      .where('employee_id', resolvedId)
      .where('insurance_plan_id', insurancePlanId)
      .first();

    return row ? this.mapRow(row) : null;
  }

  async getActivePlanEnrollments(insurancePlanId: string): Promise<InsuranceEnrollmentRecord[]> {
    const rows = await this.db('insurance_enrollments')
      .where('insurance_plan_id', insurancePlanId)
      .where('status', 'active')
      .orderBy('created_at', 'desc');

    return rows.map((r: any) => this.mapRow(r));
  }

  private mapRow(row: any): InsuranceEnrollmentRecord {
    return {
      id: row.id,
      employee_id: row.employee_id,
      plan_id: row.insurance_plan_id,
      enrollment_date: new Date(row.enrollment_date),
      status: row.status,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }
}
