import { Knex } from 'knex';
import { Resignation, CreateResignationDTO, UpdateResignationDTO } from '../types/separation';
import { v4 as uuidv4 } from 'uuid';

export class ResignationRepository {
  constructor(private db: Knex) {}

  async createResignation(employeeId: string, data: CreateResignationDTO): Promise<Resignation> {
    const id = uuidv4();

    const [resignation] = await this.db('resignations')
      .insert({
        id,
        employee_id: employeeId,
        resignation_date: data.resignation_date,
        last_working_day: data.last_working_day,
        reason: data.reason,
        status: 'pending',
      })
      .returning('*');

    return resignation;
  }

  async getResignation(id: string): Promise<Resignation | null> {
    return this.db('resignations').where('id', id).first();
  }

  async getResignationByEmployeeId(employeeId: string): Promise<Resignation | null> {
    return this.db('resignations')
      .where('employee_id', employeeId)
      .orderBy('created_at', 'desc')
      .first();
  }

  async updateResignation(id: string, data: UpdateResignationDTO): Promise<Resignation> {
    const [resignation] = await this.db('resignations')
      .where('id', id)
      .update({
        ...data,
        updated_at: this.db.fn.now(),
      })
      .returning('*');

    return resignation;
  }

  async acceptResignation(id: string, acceptedBy: string): Promise<Resignation> {
    const [resignation] = await this.db('resignations')
      .where('id', id)
      .update({
        status: 'accepted',
        accepted_by: acceptedBy,
        accepted_at: this.db.fn.now(),
        updated_at: this.db.fn.now(),
      })
      .returning('*');

    return resignation;
  }

  async rejectResignation(id: string): Promise<Resignation> {
    const [resignation] = await this.db('resignations')
      .where('id', id)
      .update({
        status: 'rejected',
        updated_at: this.db.fn.now(),
      })
      .returning('*');

    return resignation;
  }

  async withdrawResignation(id: string): Promise<Resignation> {
    const [resignation] = await this.db('resignations')
      .where('id', id)
      .update({
        status: 'withdrawn',
        updated_at: this.db.fn.now(),
      })
      .returning('*');

    return resignation;
  }

  async getResignationsByStatus(status: string): Promise<Resignation[]> {
    return this.db('resignations')
      .where('status', status)
      .orderBy('created_at', 'desc');
  }

  async getAllResignations(limit: number = 50, offset: number = 0): Promise<Resignation[]> {
    return this.db('resignations')
      .limit(limit)
      .offset(offset)
      .orderBy('created_at', 'desc');
  }

  async getResignationCount(): Promise<number> {
    const result = await this.db('resignations')
      .count('id as count')
      .first();
    return Number(result?.['count'] || 0);
  }
}
