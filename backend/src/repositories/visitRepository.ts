import { Knex } from 'knex';
import { Visit, CreateVisitDTO, VisitHistoryEntry } from '../types/supplierBuyer';
import { v4 as uuidv4 } from 'uuid';

export class VisitRepository {
  constructor(private db: Knex) {}

  async createVisit(data: CreateVisitDTO): Promise<Visit> {
    const id = uuidv4();

    const [visit] = await this.db('visits')
      .insert({
        id,
        record_id: data.record_id,
        supplier_buyer_id: data.record_id,
        visit_date: data.visit_date,
        latitude: data.location?.latitude ?? data.latitude,
        longitude: data.location?.longitude ?? data.longitude,
        purpose: data.purpose,
        notes: data.notes,
        duration_minutes: data.duration_minutes,
        document_url: data.document_url,
      })
      .returning('*');

    return visit;
  }

  async getVisitById(id: string): Promise<Visit | null> {
    const visit = await this.db('visits').where('id', id).first();
    return visit ?? null;
  }

  async getVisitsByRecord(recordId: string): Promise<Visit[]> {
    return this.db('visits')
      .where('record_id', recordId)
      .orderBy('visit_date', 'desc');
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

  async getVisitsByDateRange(startDate: Date | string, endDate: Date | string): Promise<Visit[]> {
    return this.db('visits')
      .whereBetween('visit_date', [startDate, endDate])
      .orderBy('visit_date', 'desc');
  }

  async updateVisit(id: string, data: Partial<CreateVisitDTO>): Promise<Visit> {
    const updateData: Record<string, unknown> = {};

    if (data.visit_date !== undefined) updateData['visit_date'] = data.visit_date;
    if (data.location !== undefined) {
      updateData['latitude'] = data.location.latitude;
      updateData['longitude'] = data.location.longitude;
    }
    if (data.latitude !== undefined) updateData['latitude'] = data.latitude;
    if (data.longitude !== undefined) updateData['longitude'] = data.longitude;
    if (data.purpose !== undefined) updateData['purpose'] = data.purpose;
    if (data.notes !== undefined) updateData['notes'] = data.notes;
    if (data.duration_minutes !== undefined) updateData['duration_minutes'] = data.duration_minutes;
    if (data.document_url !== undefined) updateData['document_url'] = data.document_url;

    const [visit] = await this.db('visits')
      .where('id', id)
      .update(updateData)
      .returning('*');

    return visit;
  }

  async deleteVisit(id: string): Promise<void> {
    await this.db('visits').where('id', id).delete();
  }

  async getVisitHistory(recordId: string): Promise<VisitHistoryEntry[]> {
    return this.db('visits')
      .where('record_id', recordId)
      .select('id', 'visit_date', 'purpose', 'notes', 'latitude', 'longitude', 'document_url', 'created_at')
      .orderBy('visit_date', 'desc');
  }

  async getVisitCount(recordId: string): Promise<number> {
    const result = await this.db('visits')
      .where('record_id', recordId)
      .count('id as count')
      .first();
    return Number(result?.['count'] || 0);
  }

  async getRecentVisits(recordId: string, limit: number = 10): Promise<Visit[]> {
    return this.db('visits')
      .where('record_id', recordId)
      .orderBy('visit_date', 'desc')
      .limit(limit);
  }
}
