export type DocumentType = 'passport' | 'visa' | 'license' | 'certificate' | 'contract' | 'policy' | 'other';

export interface Document {
  id: string;
  employee_id: string;
  document_type: DocumentType;
  file_name: string;
  file_url: string;
  mime_type: string | null;
  file_size: number | null;
  issue_date: string | null;
  expiry_date: string | null;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  file_url: string;
  uploaded_by: string;
  created_at: string;
}

export interface DocumentUploadDTO {
  document_type: DocumentType;
  file: Buffer;
  file_name: string;
  mime_type: string;
  issue_date?: string;
  expiry_date?: string;
}

export interface UpdateDocumentDTO {
  document_type?: DocumentType;
  issue_date?: string;
  expiry_date?: string;
}

export interface DocumentAccessLog {
  id: string;
  document_id: string;
  accessed_by: string;
  access_type: 'view' | 'download' | 'delete';
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface ExpiringDocument {
  id: string;
  employee_id: string;
  document_type: DocumentType;
  file_name: string;
  expiry_date: string;
  days_until_expiry: number;
  employee_email: string;
  employee_name: string;
}
