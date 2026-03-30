export interface FileUploadOptions {
  employeeId?: string;
  category: FileCategory;
  isPublic?: boolean;
  metadata?: Record<string, string>;
}

export interface FileMetadata {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  category: FileCategory;
  employeeId?: string;
  isPublic: boolean;
  url?: string;
  key: string;
  uploadedAt: Date;
  uploadedBy: string;
  metadata?: Record<string, string>;
}

export interface SignedUrlOptions {
  expiresIn?: number;
  responseContentType?: string;
  responseContentDisposition?: string;
}

export interface FileUploadResult {
  id: string;
  url: string;
  key: string;
  metadata: FileMetadata;
}

export interface MultipartUploadOptions {
  partSize?: number;
  queueSize?: number;
  leavePartsOnError?: boolean;
}

export interface MultipartUploadResult {
  uploadId: string;
  key: string;
  parts: Array<{
    partNumber: number;
    etag: string;
  }>;
}

export enum FileCategory {
  PROFILE_PHOTO = 'profile-photo',
  DOCUMENT = 'document',
  CERTIFICATE = 'certificate',
  PAYSLIP = 'payslip',
  CONTRACT = 'contract',
  TRAINING_MATERIAL = 'training-material',
  REIMBURSEMENT = 'reimbursement',
  OTHER = 'other'
}

export interface FileStorageProvider {
  uploadFile(file: Buffer, key: string, options: FileUploadOptions): Promise<FileUploadResult>;
  downloadFile(key: string): Promise<Buffer>;
  deleteFile(key: string): Promise<void>;
  deleteFiles?(keys: string[]): Promise<{ deleted: string[]; failed: Array<{ key: string; error: string }> }>;
  getSignedUrl(key: string, operation: 'getObject' | 'putObject', options?: SignedUrlOptions): Promise<string>;
  fileExists(key: string): Promise<boolean>;
  listFiles(prefix?: string): Promise<FileMetadata[]>;
  
  // Multipart upload support
  initiateMultipartUpload(key: string, options: FileUploadOptions): Promise<string>;
  uploadPart(uploadId: string, key: string, partNumber: number, body: Buffer): Promise<string>;
  completeMultipartUpload(uploadId: string, key: string, parts: Array<{ partNumber: number; etag: string }>): Promise<FileUploadResult>;
  abortMultipartUpload(uploadId: string, key: string): Promise<void>;
  
  // Cleanup support
  listMultipartUploads?(olderThanHours?: number): Promise<Array<{ uploadId: string; key: string; initiated: Date }>>;
  cleanupOrphanedMultipartUploads?(olderThanHours?: number): Promise<{ abortedCount: number; errors: Array<{ uploadId: string; error: string }> }>;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FileCleanupOptions {
  olderThan?: Date;
  category?: FileCategory;
  employeeId?: string;
  dryRun?: boolean;
}

export interface FileCleanupResult {
  deletedCount: number;
  deletedFiles: string[];
  errors: Array<{
    key: string;
    error: string;
  }>;
}