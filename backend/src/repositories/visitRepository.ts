import { Knex } from 'knex';
import { Visit, CreateVisitDTO, VisitHistoryEntry } from '../types/supplierBuyer';
import { v4 as uuidv4 } from 'uuid';

export class VisitRepository {
  constructor(private db: Knex) {}

  async createVisit(supplierBuyerId: string, employeeId: string, data: CreateVisitDTO): Promise<Visit> {
    const id = uuidv4();

    const [visit] = await this.db('visits')
      .insert({
        id,
        supplier_buyer_id: supplierBuyerId,
        employee_id: employeeId,
        visit_date: data.visit_date,
        latitude: data.latitude,
        longitude: data.longitude,
        purpose: data.purpose,
        notes: data.notes,
        document_url: data.document_url,
      })
      .returning('*');

    return visit;
  }

  async getVisitById(id: string): Promise<Visit | null> {
    return this.db('visits').where('id', id).first();
  }

  async getVisitsBySupplierBuyer(supplierBuyerId: string): Promise<Visit[]> {
    return this.db('visits')
      .where('supplier_buyer_id', supplierBuyerId)
      .orderBy('visit_date', 'desc');
  }

  async getVisitsByEmployee(employeeId: string): Promise<Visit[]> {
    return this.db('visits')
      .where('employee_id', employeeId)
      .orderBy('visit_date', 'desc');
  }

  async getVisitsByDateRange(
    supplierBuyerId: string,
    startDate: string,
    endDate: string
  ): Promise<Visit[]> {
    return this.db('visits')
      .where('supplier_buyer_id', supplierBuyerId)
      .whereBetween('visit_date', [startDate, endDate])
      .orderBy('visit_date', 'desc');
  }

  async updateVisit(id: string, data: Partial<CreateVisitDTO>): Promise<Visit> {
    const [visit] = await this.db('visits')
      .where('id', id)
      .update(data)
      .returning('*');

    return visit;
  }

  async deleteVisit(id: string): Promise<void> {
    await this.db('visits').where('id', id).delete();
  }

  async getVisitHistory(supplierBuyerId: string): Promise<VisitHistoryEntry[]> {
    return this.db('visits')
      .where('supplier_buyer_id', supplierBuyerId)
      .select('id', 'visit_date', 'purpose', 'notes', 'latitude', 'longitude', 'document_url', 'created_at')
      .orderBy('visit_date', 'desc');
  }

  async getVisitCount(supplierBuyerId: string): Promise<number> {
    const result = await this.db('visits')
      .where('supplier_buyer_id', supplierBuyerId)
      .count('id as count')
      .first();
    return Number(result?.['count'] || 0);
  }

  async getRecentVisits(supplierBuyerId: string, limit: number = 10): Promise<Visit[]> {
    return this.db('visits')
      .where('supplier_buyer_id', supplierBuyerId)
      .orderBy('visit_date', 'desc')
      .limit(limit);
  }
}
