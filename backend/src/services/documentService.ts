import { Knex } from 'knex';
import { DocumentRepository } from '../repositories/documentRepository';
import { FileStorageService } from './fileStorageService';
import notificationService from './notificationService';
import { Document, DocumentUploadDTO, UpdateDocumentDTO, ExpiringDocument, DocumentVersion } from '../types/document';
import { UserRole } from '../types/auth';
import { FileCategory } from '../types/fileStorage';
import { NotificationType, NotificationChannel } from '../types/notification';

export class DocumentService {
  private documentRepository: DocumentRepository;
  private fileStorageService: FileStorageService;

  constructor(
    db: Knex,
    fileStorageService?: FileStorageService
  ) {
    this.documentRepository = new DocumentRepository(db);
    this.fileStorageService = fileStorageService || new FileStorageService();
  }

  async uploadDocument(
    employeeId: string,
    data: DocumentUploadDTO,
    uploadedBy: string,
    userRole: UserRole
  ): Promise<Document> {
    // Validate file
    this.validateFile(data);

    // Check access control
    this.checkUploadAccess(employeeId, uploadedBy, userRole);

    // Upload file to S3
    const fileKey = `documents/${employeeId}/${data.document_type}/${Date.now()}-${data.file_name}`;
    await this.fileStorageService.uploadFile(data.file, fileKey, {
      category: FileCategory.DOCUMENT,
      metadata: {
        employeeId,
        documentType: data.document_type,
        uploadedBy,
      },
    });

    // Get signed URL for file
    const fileUrl = await this.fileStorageService.getSignedUrl(fileKey, 'getObject', { expiresIn: 3600 });

    // Create document record
    const document = await this.documentRepository.createDocumentWithFile(employeeId, {
      ...data,
      file_url: fileUrl,
      uploaded_by: uploadedBy,
    });

    // Log access
    await this.documentRepository.logDocumentAccess(document.id, uploadedBy, 'view');

    return document;
  }

  async getDocument(documentId: string, requestedBy: string, userRole: UserRole): Promise<Document> {
    const document = await this.documentRepository.getDocument(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Check access control
    this.checkViewAccess(document.employee_id, requestedBy, userRole);

    // Log access
    await this.documentRepository.logDocumentAccess(documentId, requestedBy, 'view');

    return document;
  }

  async getEmployeeDocuments(employeeId: string, requestedBy: string, userRole: UserRole, limit: number = 50, offset: number = 0): Promise<Document[]> {
    // Check access control
    this.checkViewAccess(employeeId, requestedBy, userRole);

    return this.documentRepository.getEmployeeDocuments(employeeId, limit, offset);
  }

  async getDocumentsByType(employeeId: string, documentType: string, requestedBy: string, userRole: UserRole): Promise<Document[]> {
    // Check access control
    this.checkViewAccess(employeeId, requestedBy, userRole);

    return this.documentRepository.getDocumentsByType(employeeId, documentType);
  }

  async updateDocument(documentId: string, data: UpdateDocumentDTO, updatedBy: string, userRole: UserRole): Promise<Document> {
    const document = await this.documentRepository.getDocumentById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Check access control
    this.checkUpdateAccess(document.employee_id, updatedBy, userRole);

    const updated = await this.documentRepository.updateDocument(documentId, data);

    // Log access
    await this.documentRepository.logDocumentAccess(documentId, updatedBy, 'view');

    return updated;
  }

  async updateDocumentVersion(
    documentId: string,
    newDocumentData: DocumentUploadDTO,
    uploadedBy: string,
    userRole: UserRole
  ): Promise<Document> {
    const document = await this.documentRepository.getDocumentById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Check access control
    this.checkUpdateAccess(document.employee_id, uploadedBy, userRole);

    // Validate file
    this.validateFile(newDocumentData);

    // Upload new version to S3
    const fileKey = `documents/${document.employee_id}/${newDocumentData.document_type}/${Date.now()}-${newDocumentData.file_name}`;
    await this.fileStorageService.uploadFile(newDocumentData.file, fileKey, {
      category: FileCategory.DOCUMENT,
      metadata: {
        employeeId: document.employee_id,
        documentType: newDocumentData.document_type,
        uploadedBy,
      },
    });

    // Get signed URL for new file
    const fileUrl = await this.fileStorageService.getSignedUrl(fileKey, 'getObject', { expiresIn: 3600 });

    // Update document with new version
    const updated = await this.documentRepository.updateDocumentVersion(documentId, fileUrl, uploadedBy);

    // Log access
    await this.documentRepository.logDocumentAccess(documentId, uploadedBy, 'view');

    return updated;
  }

  async deleteDocument(documentId: string, deletedBy: string, userRole: UserRole): Promise<void> {
    const document = await this.documentRepository.getDocumentById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Check access control
    this.checkDeleteAccess(document.employee_id, deletedBy, userRole);

    // Log access
    await this.documentRepository.logDocumentAccess(documentId, deletedBy, 'delete');

    // Soft delete
    await this.documentRepository.softDeleteDocument(documentId);
  }

  async getDocumentVersions(documentId: string, requestedBy: string, userRole: UserRole): Promise<DocumentVersion[]> {
    const document = await this.documentRepository.getDocumentById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Check access control
    this.checkViewAccess(document.employee_id, requestedBy, userRole);

    return this.documentRepository.getDocumentVersions(documentId);
  }

  async getDocumentVersion(documentId: string, versionNumber: number, requestedBy: string, userRole: UserRole): Promise<DocumentVersion> {
    const document = await this.documentRepository.getDocumentById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Check access control
    this.checkViewAccess(document.employee_id, requestedBy, userRole);

    const version = await this.documentRepository.getDocumentVersion(documentId, versionNumber);
    if (!version) {
      throw new Error('Document version not found');
    }

    // Log access
    await this.documentRepository.logDocumentAccess(documentId, requestedBy, 'download');

    return version;
  }

  async checkExpiringDocuments(): Promise<ExpiringDocument[]> {
    return this.documentRepository.getExpiringDocuments(30);
  }

  async notifyExpiringDocuments(): Promise<void> {
    const expiringDocuments = await this.checkExpiringDocuments();

    for (const doc of expiringDocuments) {
      await notificationService.sendNotification({
        employeeId: doc.employee_id,
        type: NotificationType.CERTIFICATION_EXPIRING,
        title: `Document Expiring Soon: ${doc.document_type}`,
        body: `Your ${doc.document_type} (${doc.file_name}) will expire on ${doc.expiry_date}. Please renew it.`,
        channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
        data: {
          documentId: doc.id,
          documentType: doc.document_type,
          expiryDate: doc.expiry_date,
          daysUntilExpiry: doc.days_until_expiry.toString(),
        },
      });
    }
  }

  async getExpiringDocuments(daysThreshold: number = 30): Promise<ExpiringDocument[]> {
    return this.documentRepository.getExpiringDocuments(daysThreshold);
  }

  async getExpiredDocuments(): Promise<Document[]> {
    return this.documentRepository.getExpiredDocuments();
  }

  private validateFile(data: DocumentUploadDTO): void {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if (data.file.length > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum limit of 10MB`);
    }

    if (!ALLOWED_MIME_TYPES.includes(data.mime_type)) {
      throw new Error(`File type ${data.mime_type} is not allowed`);
    }

    if (!data.file_name || data.file_name.trim().length === 0) {
      throw new Error('File name is required');
    }
  }

  private checkUploadAccess(employeeId: string, uploadedBy: string, userRole: UserRole): void {
    // Employees can only upload their own documents
    // HR Manager and Super Admin can upload for any employee
    if (userRole === UserRole.EMPLOYEE && employeeId !== uploadedBy) {
      throw new Error('Employees can only upload their own documents');
    }

    if (![UserRole.EMPLOYEE, UserRole.HR_MANAGER, UserRole.SUPER_ADMIN].includes(userRole)) {
      throw new Error('You do not have permission to upload documents');
    }
  }

  private checkViewAccess(employeeId: string, requestedBy: string, userRole: UserRole): void {
    // Employees can only view their own documents
    // HR Manager, Finance, and Super Admin can view any employee's documents
    if (userRole === UserRole.EMPLOYEE && employeeId !== requestedBy) {
      throw new Error('Employees can only view their own documents');
    }

    if (![UserRole.EMPLOYEE, UserRole.HR_MANAGER, UserRole.FINANCE, UserRole.SUPER_ADMIN, UserRole.DEPARTMENT_MANAGER].includes(userRole)) {
      throw new Error('You do not have permission to view documents');
    }
  }

  private checkUpdateAccess(employeeId: string, updatedBy: string, userRole: UserRole): void {
    // Employees can only update their own documents
    // HR Manager and Super Admin can update any employee's documents
    if (userRole === UserRole.EMPLOYEE && employeeId !== updatedBy) {
      throw new Error('Employees can only update their own documents');
    }

    if (![UserRole.EMPLOYEE, UserRole.HR_MANAGER, UserRole.SUPER_ADMIN].includes(userRole)) {
      throw new Error('You do not have permission to update documents');
    }
  }

  private checkDeleteAccess(employeeId: string, deletedBy: string, userRole: UserRole): void {
    // Employees can only delete their own documents
    // HR Manager and Super Admin can delete any employee's documents
    if (userRole === UserRole.EMPLOYEE && employeeId !== deletedBy) {
      throw new Error('Employees can only delete their own documents');
    }

    if (![UserRole.EMPLOYEE, UserRole.HR_MANAGER, UserRole.SUPER_ADMIN].includes(userRole)) {
      throw new Error('You do not have permission to delete documents');
    }
  }
}
