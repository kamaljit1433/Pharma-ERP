import { Knex } from 'knex';
import { InsuranceEnrollment, CreateInsuranceEnrollmentDTO, UpdateInsuranceEnrollmentDTO } from '../types/insurance';
import { v4 as uuidv4 } from 'uuid';

export class InsuranceEnrollmentRepository {
  constructor(private db: Knex) {}

  async createInsuranceEnrollment(data: CreateInsuranceEnrollmentDTO): Promise<InsuranceEnrollment> {
    const id = uuidv4();

    const [enrollment] = await this.db('insurance_enrollments')
      .insert({
        id,
        employee_id: data.employee_id,
        insurance_plan_id: data.insurance_plan_id,
        enrollment_date: data.enrollment_date,
        effective_from: data.effective_from,
        status: 'active',
      })
      .returning('*');

    return this.mapToInsuranceEnrollment(enrollment);
  }

  async getInsuranceEnrollmentById(id: string): Promise<InsuranceEnrollment | null> {
    const enrollment = await this.db('insurance_enrollments').where('id', id).first();
    return enrollment ? this.mapToInsuranceEnrollment(enrollment) : null;
  }

  async getEmployeeEnrollments(employeeId: string): Promise<InsuranceEnrollment[]> {
    const enrollments = await this.db('insurance_enrollments')
      .where('employee_id', employeeId)
      .orderBy('created_at', 'desc');

    return enrollments.map((e) => this.mapToInsuranceEnrollment(e));
  }

  async getActiveEmployeeEnrollments(employeeId: string): Promise<InsuranceEnrollment[]> {
    const enrollments = await this.db('insurance_enrollments')
      .where('employee_id', employeeId)
      .where('status', 'active')
      .orderBy('created_at', 'desc');

    return enrollments.map((e) => this.mapToInsuranceEnrollment(e));
  }

  async getEnrollmentByEmployeeAndPlan(
    employeeId: string,
    insurancePlanId: string
  ): Promise<InsuranceEnrollment | null> {
    const enrollment = await this.db('insurance_enrollments')
      .where('employee_id', employeeId)
      .where('insurance_plan_id', insurancePlanId)
      .first();

    return enrollment ? this.mapToInsuranceEnrollment(enrollment) : null;
  }

  async getPlanEnrollments(insurancePlanId: string): Promise<InsuranceEnrollment[]> {
    const enrollments = await this.db('insurance_enrollments')
      .where('insurance_plan_id', insurancePlanId)
      .orderBy('created_at', 'desc');

    return enrollments.map((e) => this.mapToInsuranceEnrollment(e));
  }

  async getActivePlanEnrollments(insurancePlanId: string): Promise<InsuranceEnrollment[]> {
    const enrollments = await this.db('insurance_enrollments')
      .where('insurance_plan_id', insurancePlanId)
      .where('status', 'active')
      .orderBy('created_at', 'desc');

    return enrollments.map((e) => this.mapToInsuranceEnrollment(e));
  }

  async updateInsuranceEnrollment(
    id: string,
    data: UpdateInsuranceEnrollmentDTO
  ): Promise<InsuranceEnrollment> {
    const [enrollment] = await this.db('insurance_enrollments')
      .where('id', id)
      .update({
        ...data,
        updated_at: this.db.fn.now(),
      })
      .returning('*');

    return this.mapToInsuranceEnrollment(enrollment);
  }

  async cancelInsuranceEnrollment(id: string, effectiveTo: Date): Promise<InsuranceEnrollment> {
    const [enrollment] = await this.db('insurance_enrollments')
      .where('id', id)
      .update({
        status: 'cancelled',
        effective_to: effectiveTo,
        updated_at: this.db.fn.now(),
      })
      .returning('*');

    return this.mapToInsuranceEnrollment(enrollment);
  }

  async deleteInsuranceEnrollment(id: string): Promise<void> {
    await this.db('insurance_enrollments').where('id', id).delete();
  }

  private mapToInsuranceEnrollment(row: any): InsuranceEnrollment {
    return {
      id: row.id,
      employee_id: row.employee_id,
      insurance_plan_id: row.insurance_plan_id,
      enrollment_date: new Date(row.enrollment_date),
      effective_from: new Date(row.effective_from),
      effective_to: row.effective_to ? new Date(row.effective_to) : undefined,
      status: row.status,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }
}
