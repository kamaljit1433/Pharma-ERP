import { Knex } from 'knex';
import {
  SignatureEvent,
  SignatureEventType,
  SimpleSignatureEvent,
  CreateSignatureEventDTO,
} from '../types/esignature';
import { v4 as uuidv4 } from 'uuid';

export class SignatureEventRepository {
  constructor(private db: Knex) {}

  // ── New simple API (signature_events table) ────────────────────────────────

  async createEvent(data: CreateSignatureEventDTO): Promise<SimpleSignatureEvent> {
    const id = uuidv4();

    const [row] = await this.db('signature_events')
      .insert({
        id,
        request_id: data.request_id,
        signer_id: data.signer_id,
        event_type: data.event_type,
        timestamp: data.timestamp ?? new Date(),
        ip_address: data.ip_address ?? null,
        user_agent: data.user_agent ?? null,
      })
      .returning('*');

    return this.mapSimpleRow(row);
  }

  async getEventById(id: string): Promise<SimpleSignatureEvent | null> {
    const row = await this.db('signature_events').where('id', id).first();
    return row ? this.mapSimpleRow(row) : null;
  }

  async getEventsByRequest(requestId: string): Promise<SimpleSignatureEvent[]> {
    const rows = await this.db('signature_events')
      .where('request_id', requestId)
      .orderBy('created_at', 'asc');
    return rows.map((r: any) => this.mapSimpleRow(r));
  }

  async getEventsBySigner(signerId: string): Promise<SimpleSignatureEvent[]> {
    const rows = await this.db('signature_events')
      .where('signer_id', signerId)
      .orderBy('created_at', 'desc');
    return rows.map((r: any) => this.mapSimpleRow(r));
  }

  async getEventsByType(eventType: string): Promise<SimpleSignatureEvent[]> {
    const rows = await this.db('signature_events')
      .where('event_type', eventType)
      .orderBy('created_at', 'desc');
    return rows.map((r: any) => this.mapSimpleRow(r));
  }

  async deleteEvent(id: string): Promise<void> {
    await this.db('signature_events').where('id', id).delete();
  }

  private mapSimpleRow(row: any): SimpleSignatureEvent {
    return {
      id: row.id,
      request_id: row.request_id,
      signer_id: row.signer_id,
      event_type: row.event_type,
      timestamp: row.timestamp,
      ip_address: row.ip_address,
      user_agent: row.user_agent,
      created_at: row.created_at,
    };
  }

  // ── Legacy API (esignature_events table) ───────────────────────────────────

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
