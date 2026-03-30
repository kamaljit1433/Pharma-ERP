import { Knex } from 'knex';
import { Gratuity, CreateGratuityDTO } from '../types/benefits';
import { v4 as uuidv4 } from 'uuid';

export class GratuityRepository {
  constructor(private knex: Knex) {}

  async createGratuity(data: CreateGratuityDTO & { years_of_service: number; gratuity_amount: number; is_eligible: boolean }): Promise<Gratuity> {
    const id = uuidv4();
    const eligibilityDate = new Date();

    const [gratuity] = await this.knex('gratuities')
      .insert({
        id,
        employee_id: data.employee_id,
        eligibility_date: eligibilityDate,
        years_of_service: data.years_of_service,
        last_drawn_salary: data.last_drawn_salary,
        gratuity_amount: data.gratuity_amount,
        is_eligible: data.is_eligible,
        calculation_date: eligibilityDate,
      })
      .returning('*');

    return this.mapToGratuity(gratuity);
  }

  async getGratuity(employeeId: string): Promise<Gratuity | null> {
    const gratuity = await this.knex('gratuities')
      .where('employee_id', employeeId)
      .orderBy('calculation_date', 'desc')
      .first();

    return gratuity ? this.mapToGratuity(gratuity) : null;
  }

  async getGratuityById(id: string): Promise<Gratuity | null> {
    const gratuity = await this.knex('gratuities')
      .where('id', id)
      .first();

    return gratuity ? this.mapToGratuity(gratuity) : null;
  }

  async updateGratuity(
    id: string,
    data: Partial<{
      years_of_service: number;
      last_drawn_salary: number;
      gratuity_amount: number;
      is_eligible: boolean;
    }>
  ): Promise<Gratuity> {
    const [gratuity] = await this.knex('gratuities')
      .where('id', id)
      .update({
        ...data,
        calculation_date: this.knex.fn.now(),
        updated_at: this.knex.fn.now(),
      })
      .returning('*');

    return this.mapToGratuity(gratuity);
  }

  async getGratuityByEmployeeAndDate(employeeId: string, date: Date): Promise<Gratuity | null> {
    const gratuity = await this.knex('gratuities')
      .where('employee_id', employeeId)
      .where('calculation_date', '<=', date)
      .orderBy('calculation_date', 'desc')
      .first();

    return gratuity ? this.mapToGratuity(gratuity) : null;
  }

  async getEligibleGratuities(): Promise<Gratuity[]> {
    const gratuities = await this.knex('gratuities')
      .where('is_eligible', true)
      .orderBy('calculation_date', 'desc');

    return gratuities.map((g) => this.mapToGratuity(g));
  }

  async getGratuityHistory(employeeId: string): Promise<Gratuity[]> {
    const gratuities = await this.knex('gratuities')
      .where('employee_id', employeeId)
      .orderBy('calculation_date', 'desc');

    return gratuities.map((g) => this.mapToGratuity(g));
  }

  private mapToGratuity(row: any): Gratuity {
    return {
      id: row.id,
      employee_id: row.employee_id,
      eligibility_date: new Date(row.eligibility_date),
      years_of_service: row.years_of_service,
      last_drawn_salary: parseFloat(row.last_drawn_salary),
      gratuity_amount: parseFloat(row.gratuity_amount),
      is_eligible: row.is_eligible,
      calculation_date: new Date(row.calculation_date),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }
}
