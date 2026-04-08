import { Knex } from 'knex';
import {
  SignatureRequest,
  SignatureRequestDTO,
  SignatureRequestStatus,
  SimpleSignatureRequest,
  CreateSignatureRequestDTO,
  UpdateSignatureRequestDTO,
} from '../types/esignature';
import { v4 as uuidv4 } from 'uuid';

export class SignatureRequestRepository {
  constructor(private db: Knex) {}

  // ── New simple API (signature_requests table) ──────────────────────────────

  async createRequest(data: CreateSignatureRequestDTO): Promise<SimpleSignatureRequest> {
    const id = uuidv4();

    const [row] = await this.db('signature_requests')
      .insert({
        id,
        document_id: data.document_id,
        requester_id: data.requester_id,
        signers: JSON.stringify(data.signers),
        status: data.status ?? 'pending',
      })
      .returning('*');

    return this.mapSimpleRow(row);
  }

  async getRequestById(id: string): Promise<SimpleSignatureRequest | null> {
    const row = await this.db('signature_requests').where('id', id).first();
    return row ? this.mapSimpleRow(row) : null;
  }

  async getRequestsByDocument(documentId: string): Promise<SimpleSignatureRequest[]> {
    const rows = await this.db('signature_requests')
      .where('document_id', documentId)
      .orderBy('created_at', 'desc');
    return rows.map((r: any) => this.mapSimpleRow(r));
  }

  async getRequestsByRequester(requesterId: string): Promise<SimpleSignatureRequest[]> {
    const rows = await this.db('signature_requests')
      .where('requester_id', requesterId)
      .orderBy('created_at', 'desc');
    return rows.map((r: any) => this.mapSimpleRow(r));
  }

  async getRequestsByStatus(status: string): Promise<SimpleSignatureRequest[]> {
    const rows = await this.db('signature_requests')
      .where('status', status)
      .orderBy('created_at', 'desc');
    return rows.map((r: any) => this.mapSimpleRow(r));
  }

  async getPendingRequests(): Promise<SimpleSignatureRequest[]> {
    const rows = await this.db('signature_requests')
      .whereIn('status', ['pending', 'in_progress'])
      .orderBy('created_at', 'desc');
    return rows.map((r: any) => this.mapSimpleRow(r));
  }

  async updateRequest(id: string, data: UpdateSignatureRequestDTO): Promise<SimpleSignatureRequest> {
    const updateData: Record<string, unknown> = { updated_at: this.db.fn.now() };

    if (data.status !== undefined) updateData['status'] = data.status;
    if (data.signers !== undefined) updateData['signers'] = JSON.stringify(data.signers);

    const [row] = await this.db('signature_requests')
      .where('id', id)
      .update(updateData)
      .returning('*');

    return this.mapSimpleRow(row);
  }

  async deleteRequest(id: string): Promise<void> {
    await this.db('signature_requests').where('id', id).delete();
  }

  private mapSimpleRow(row: any): SimpleSignatureRequest {
    return {
      id: row.id,
      document_id: row.document_id,
      requester_id: row.requester_id,
      signers: Array.isArray(row.signers)
        ? row.signers
        : (row.signers ? JSON.parse(row.signers) : []),
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  // ── Legacy API (esignature_requests table) ─────────────────────────────────

  async createSignatureRequest(requestedBy: string, data: SignatureRequestDTO): Promise<SignatureRequest> {
    const id = uuidv4();
    const expiresInDays = data.expires_in_days || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const [request] = await this.db('esignature_requests')
      .insert({
        id,
        document_id: data.document_id,
        requested_by: requestedBy,
        signer_id: data.signer_id,
        document_title: data.document_title,
        status: 'pending',
        expires_at: expiresAt,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');

    return request;
  }

  async getSignatureRequest(id: string): Promise<SignatureRequest | null> {
    return this.db('esignature_requests').where('id', id).first();
  }

  async getSignatureRequestsByDocument(documentId: string): Promise<SignatureRequest[]> {
    return this.db('esignature_requests')
      .where('document_id', documentId)
      .orderBy('created_at', 'desc');
  }

  async getSignatureRequestsBySigner(signerId: string, status?: SignatureRequestStatus): Promise<SignatureRequest[]> {
    let query = this.db('esignature_requests').where('signer_id', signerId);
    if (status) query = query.where('status', status);
    return query.orderBy('created_at', 'desc');
  }

  async getSignatureRequestsByRequester(requesterId: string): Promise<SignatureRequest[]> {
    return this.db('esignature_requests')
      .where('requested_by', requesterId)
      .orderBy('created_at', 'desc');
  }

  async updateSignatureRequestStatus(
    id: string,
    status: SignatureRequestStatus,
    signedDocumentUrl?: string
  ): Promise<SignatureRequest> {
    const updateData: any = { status, updated_at: new Date() };
    if (status === 'signed') {
      updateData.signed_at = new Date();
      if (signedDocumentUrl) updateData.signed_document_url = signedDocumentUrl;
    }

    const [request] = await this.db('esignature_requests')
      .where('id', id)
      .update(updateData)
      .returning('*');

    return request;
  }

  async getPendingSignatureRequests(): Promise<SignatureRequest[]> {
    return this.db('esignature_requests')
      .where('status', 'pending')
      .where('expires_at', '>', new Date())
      .orderBy('expires_at', 'asc');
  }

  async getExpiredSignatureRequests(): Promise<SignatureRequest[]> {
    return this.db('esignature_requests')
      .where('status', 'pending')
      .where('expires_at', '<=', new Date())
      .orderBy('expires_at', 'asc');
  }

  async markExpiredRequests(): Promise<number> {
    return this.db('esignature_requests')
      .where('status', 'pending')
      .where('expires_at', '<=', new Date())
      .update({ status: 'expired', updated_at: new Date() });
  }

  async getSignatureRequestsNeedingReminder(hoursBeforeExpiry: number = 48): Promise<SignatureRequest[]> {
    const reminderTime = new Date();
    reminderTime.setHours(reminderTime.getHours() + hoursBeforeExpiry);

    return this.db('esignature_requests')
      .where('status', 'pending')
      .where('expires_at', '<=', reminderTime)
      .where('expires_at', '>', new Date())
      .orderBy('expires_at', 'asc');
  }

  async getSignatureRequestCount(signerId: string, status?: SignatureRequestStatus): Promise<number> {
    let query = this.db('esignature_requests').where('signer_id', signerId);
    if (status) query = query.where('status', status);
    const result = await query.count('id as count').first();
    return Number(result?.['count'] || 0);
  }

  async getSignatureRequestsByDateRange(startDate: Date, endDate: Date): Promise<SignatureRequest[]> {
    return this.db('esignature_requests')
      .where('created_at', '>=', startDate)
      .where('created_at', '<=', endDate)
      .orderBy('created_at', 'desc');
  }
}
