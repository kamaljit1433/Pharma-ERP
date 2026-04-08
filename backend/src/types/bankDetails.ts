/**
 * Bank Details Types
 * Defines interfaces for bank account management with encryption support
 */

export interface BankAccount {
  id: string;
  employee_id: string;
  account_holder_name: string;
  bank_name: string;
  account_number_encrypted: string;
  ifsc_code: string;
  account_type: 'savings' | 'current' | 'salary';
  is_primary: boolean;
  verification_status: 'pending' | 'verified' | 'failed';
  verified_by?: string;
  verified_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface BankAccountDTO {
  employee_id?: string;
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  account_type: 'savings' | 'current' | 'salary';
  is_primary?: boolean;
}

export interface UpdateBankAccountDTO {
  account_holder_name?: string;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  account_type?: 'savings' | 'current' | 'salary';
}

export interface BankAccountMasked {
  id: string;
  employee_id: string;
  account_holder_name: string;
  bank_name: string;
  account_number_masked: string;
  ifsc_code: string;
  account_type: 'savings' | 'current' | 'salary';
  is_primary: boolean;
  verification_status: 'pending' | 'verified' | 'failed';
  verified_by?: string;
  verified_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface EncryptedData {
  iv: string;
  encryptedData: string;
  authTag: string;
}

export interface AuditLog {
  id: string;
  bank_account_id: string;
  employee_id: string;
  action: 'create' | 'update' | 'delete' | 'verify' | 'set_primary';
  changes?: Record<string, unknown>;
  performed_by: string;
  created_at: Date;
}
