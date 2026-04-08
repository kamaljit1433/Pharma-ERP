import { Knex } from 'knex';
import { Document, DocumentVersion, DocumentUploadDTO, CreateDocumentDTO, UpdateDocumentDTO, DocumentAccessLog, ExpiringDocument } from '../types/document';
import { v4 as uuidv4 } from 'uuid';

export class DocumentRepository {
  constructor(private db: Knex) {}

  async createDocument(data: CreateDocumentDTO): Promise<Document> {
    const [document] = await this.db('documents')
      .insert({
        employee_id: data.employee_id,
        document_type: data.document_type,
        file_name: data.document_name,
        file_url: data.file_url,
        mime_type: null,
        file_size: null,
        issue_date: data.issue_date || null,
        expiry_date: data.expiry_date || null,
        version: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');

    return this.mapRow(document);
  }

  async createDocumentWithFile(employeeId: string, data: DocumentUploadDTO & { file_url: string; uploaded_by: string }): Promise<Document> {
    const id = uuidv4();

    const [document] = await this.db('documents')
      .insert({
        id,
        employee_id: employeeId,
        document_type: data.document_type,
        file_name: data.file_name,
        file_url: data.file_url,
        mime_type: data.mime_type,
        file_size: data.file.length,
        issue_date: data.issue_date || null,
        expiry_date: data.expiry_date || null,
        version: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');

    await this.createVersion(id, data.file_url, 1, data.uploaded_by);

    return this.mapRow(document);
  }

  private toDateString(value: any): string {
    // pg returns date columns as Date objects at midnight local time; use local methods
    const d = value instanceof Date ? value : new Date(value);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private mapRow(row: any): Document & { document_name: string } {
    return {
      ...row,
      document_name: row.file_name,
      expiry_date: row.expiry_date ? this.toDateString(row.expiry_date) : null,
      issue_date: row.issue_date ? this.toDateString(row.issue_date) : null,
    };
  }

  async getDocument(id: string): Promise<Document | null> {
    const row = await this.db('documents').where('id', id).first();
    return row ? this.mapRow(row) : null;
  }

  async getDocumentById(id: string): Promise<Document | null> {
    return this.getDocument(id);
  }

  async getEmployeeDocuments(employeeId: string, limit: number = 50, offset: number = 0): Promise<Document[]> {
    const rows = await this.db('documents')
      .where('employee_id', employeeId)
      .where('is_active', true)
      .limit(limit)
      .offset(offset)
      .orderBy('created_at', 'desc');
    return rows.map((r: any) => this.mapRow(r));
  }

  async getDocumentsByType(documentType: string, employeeId?: string): Promise<Document[]> {
    let query = this.db('documents')
      .where('document_type', documentType)
      .where('is_active', true)
      .orderBy('created_at', 'desc');

    if (employeeId) {
      query = query.where('employee_id', employeeId);
    }

    const rows = await query;
    return rows.map((r: any) => this.mapRow(r));
  }

  async updateDocument(id: string, data: UpdateDocumentDTO): Promise<Document> {
    const updateData: Record<string, any> = { updated_at: new Date() };
    if (data.document_type !== undefined) updateData['document_type'] = data.document_type;
    if (data.document_name !== undefined) updateData['file_name'] = data.document_name;
    if (data.issue_date !== undefined) updateData['issue_date'] = data.issue_date;
    if (data.expiry_date !== undefined) updateData['expiry_date'] = data.expiry_date;

    const [document] = await this.db('documents')
      .where('id', id)
      .update(updateData)
      .returning('*');

    if (!document) throw new Error('Document not found');
    return this.mapRow(document);
  }

  async deleteDocument(id: string): Promise<void> {
    await this.db('documents').where('id', id).delete();
  }

  async softDeleteDocument(id: string): Promise<void> {
    await this.db('documents')
      .where('id', id)
      .update({ is_active: false, updated_at: new Date() });
  }

  async hardDeleteDocument(id: string): Promise<void> {
    await this.db('documents').where('id', id).delete();
  }

  async updateDocumentVersion(id: string, newFileUrl: string, uploadedBy: string): Promise<Document> {
    const document = await this.getDocumentById(id);
    if (!document) throw new Error('Document not found');

    const newVersion = document.version + 1;
    await this.createVersion(id, newFileUrl, newVersion, uploadedBy);

    const [updated] = await this.db('documents')
      .where('id', id)
      .update({ file_url: newFileUrl, version: newVersion, updated_at: new Date() })
      .returning('*');

    return this.mapRow(updated);
  }

  async searchDocuments(query: string, employeeId?: string): Promise<Document[]> {
    let q = this.db('documents')
      .where('is_active', true)
      .where('file_name', 'ilike', `%${query}%`)
      .orderBy('created_at', 'desc');

    if (employeeId) {
      q = q.where('employee_id', employeeId);
    }

    const rows = await q;
    return rows.map((r: any) => this.mapRow(r));
  }

  async getDocumentCount(employeeId: string): Promise<number> {
    const result = await this.db('documents')
      .where('employee_id', employeeId)
      .where('is_active', true)
      .count('id as count')
      .first();
    return Number(result?.['count'] || 0);
  }

  async getExpiringDocuments(daysThreshold: number = 30): Promise<ExpiringDocument[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysThreshold);

    return this.db('documents')
      .select(
        'documents.id',
        'documents.employee_id',
        'documents.document_type',
        'documents.file_name',
        'documents.expiry_date',
        'employees.email as employee_email',
        this.db.raw("CONCAT(employees.first_name, ' ', employees.last_name) as employee_name"),
        this.db.raw(`(documents.expiry_date - CURRENT_DATE)::int as days_until_expiry`)
      )
      .join('employees', 'documents.employee_id', 'employees.id')
      .where('documents.is_active', true)
      .whereNotNull('documents.expiry_date')
      .where('documents.expiry_date', '<=', futureDate)
      .where('documents.expiry_date', '>', new Date())
      .orderBy('documents.expiry_date', 'asc');
  }

  async getExpiredDocuments(): Promise<Document[]> {
    const rows = await this.db('documents')
      .where('is_active', true)
      .whereNotNull('expiry_date')
      .where('expiry_date', '<', new Date())
      .orderBy('expiry_date', 'asc');
    return rows.map((r: any) => this.mapRow(r));
  }

  async getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
    return this.db('document_versions')
      .where('document_id', documentId)
      .orderBy('version_number', 'desc');
  }

  async getDocumentVersion(documentId: string, versionNumber: number): Promise<DocumentVersion | null> {
    return this.db('document_versions')
      .where('document_id', documentId)
      .where('version_number', versionNumber)
      .first();
  }

  private async createVersion(documentId: string, fileUrl: string, versionNumber: number, uploadedBy: string): Promise<DocumentVersion> {
    const id = uuidv4();

    const [version] = await this.db('document_versions')
      .insert({
        id,
        document_id: documentId,
        version_number: versionNumber,
        file_url: fileUrl,
        uploaded_by: uploadedBy,
        created_at: new Date(),
      })
      .returning('*');

    return version;
  }

  async logDocumentAccess(documentId: string, accessedBy: string, accessType: 'view' | 'download' | 'delete', ipAddress?: string, userAgent?: string): Promise<DocumentAccessLog> {
    const id = uuidv4();

    const [log] = await this.db('document_access_logs')
      .insert({
        id,
        document_id: documentId,
        accessed_by: accessedBy,
        access_type: accessType,
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
        created_at: new Date(),
      })
      .returning('*');

    return log;
  }

  async getDocumentAccessLogs(documentId: string, limit: number = 50): Promise<DocumentAccessLog[]> {
    return this.db('document_access_logs')
      .where('document_id', documentId)
      .limit(limit)
      .orderBy('created_at', 'desc');
  }

  async getDocumentsByEmployeeAndType(employeeId: string, documentType: string): Promise<Document[]> {
    const rows = await this.db('documents')
      .where('employee_id', employeeId)
      .where('document_type', documentType)
      .where('is_active', true)
      .orderBy('created_at', 'desc');
    return rows.map((r: any) => this.mapRow(r));
  }
}
