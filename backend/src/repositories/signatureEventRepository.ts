import { Knex } from 'knex';
import { SignatureEvent, SignatureEventType } from '../types/esignature';
import { v4 as uuidv4 } from 'uuid';

export class SignatureEventRepository {
  constructor(private db: Knex) {}

  async createSignatureEvent(
    esignatureRequestId: string,
    eventType: SignatureEventType,
    ipAddress?: string,
    userAgent?: string,
    metadata?: Record<string, any>
  ): Promise<SignatureEvent> {
    const id = uuidv4();

    const [event] = await this.db('esignature_events')
      .insert({
        id,
        esignature_request_id: esignatureRequestId,
        event_type: eventType,
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
        metadata: metadata || null,
        created_at: new Date(),
      })
      .returning('*');

    return event;
  }

  async getSignatureEvent(id: string): Promise<SignatureEvent | null> {
    return this.db('esignature_events').where('id', id).first();
  }

  async getSignatureEventsByRequest(esignatureRequestId: string): Promise<SignatureEvent[]> {
    return this.db('esignature_events')
      .where('esignature_request_id', esignatureRequestId)
      .orderBy('created_at', 'asc');
  }

  async getSignatureEventsByType(eventType: SignatureEventType): Promise<SignatureEvent[]> {
    return this.db('esignature_events')
      .where('event_type', eventType)
      .orderBy('created_at', 'desc');
  }

  async getSignatureEventsByRequestAndType(
    esignatureRequestId: string,
    eventType: SignatureEventType
  ): Promise<SignatureEvent[]> {
    return this.db('esignature_events')
      .where('esignature_request_id', esignatureRequestId)
      .where('event_type', eventType)
      .orderBy('created_at', 'asc');
  }

  async getAuditTrail(esignatureRequestId: string): Promise<SignatureEvent[]> {
    return this.db('esignature_events')
      .where('esignature_request_id', esignatureRequestId)
      .orderBy('created_at', 'asc');
  }

  async getEventCount(esignatureRequestId: string): Promise<number> {
    const result = await this.db('esignature_events')
      .where('esignature_request_id', esignatureRequestId)
      .count('id as count')
      .first();
    return Number(result?.['count'] || 0);
  }

  async getEventCountByType(esignatureRequestId: string, eventType: SignatureEventType): Promise<number> {
    const result = await this.db('esignature_events')
      .where('esignature_request_id', esignatureRequestId)
      .where('event_type', eventType)
      .count('id as count')
      .first();
    return Number(result?.['count'] || 0);
  }

  async getEventsByDateRange(startDate: Date, endDate: Date): Promise<SignatureEvent[]> {
    return this.db('esignature_events')
      .where('created_at', '>=', startDate)
      .where('created_at', '<=', endDate)
      .orderBy('created_at', 'desc');
  }

  async getLatestEvent(esignatureRequestId: string): Promise<SignatureEvent | null> {
    return this.db('esignature_events')
      .where('esignature_request_id', esignatureRequestId)
      .orderBy('created_at', 'desc')
      .first();
  }

  async deleteEventsByRequest(esignatureRequestId: string): Promise<number> {
    return this.db('esignature_events')
      .where('esignature_request_id', esignatureRequestId)
      .delete();
  }
}
