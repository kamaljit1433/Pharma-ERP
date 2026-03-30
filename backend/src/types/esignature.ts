export type SignatureMethod = 'drawn' | 'typed' | 'uploaded';
export type SignatureRequestStatus = 'pending' | 'signed' | 'rejected' | 'expired';
export type SignatureEventType = 'created' | 'viewed' | 'signed' | 'rejected' | 'reminder_sent' | 'expired';

export interface SignatureRequest {
  id: string;
  document_id: string;
  requested_by: string;
  signer_id: string;
  document_title: string;
  status: SignatureRequestStatus;
  expires_at: string;
  signed_at: string | null;
  signed_document_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SignatureEvent {
  id: string;
  esignature_request_id: string;
  event_type: SignatureEventType;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface SignatureData {
  method: SignatureMethod;
  signature_content: string; // Base64 encoded for drawn/uploaded, plain text for typed
  timestamp: Date;
  ip_address?: string;
  user_agent?: string;
}

export interface SignatureRequestDTO {
  document_id: string;
  signer_id: string;
  document_title: string;
  expires_in_days?: number; // Default 7 days
}

export interface SignatureStatus {
  id: string;
  status: SignatureRequestStatus;
  signer_id: string;
  signed_at: string | null;
  signed_document_url: string | null;
  expires_at: string;
  created_at: string;
}

export interface SignedDocumentResponse {
  id: string;
  document_title: string;
  signed_at: string;
  signer_name: string;
  document_url: string;
}
