import { DocumentService } from '../documentService';
import { DocumentRepository } from '../../repositories/documentRepository';
import { FileStorageService } from '../fileStorageService';
import { Document, DocumentUploadDTO, ExpiringDocument } from '../../types/document';
import { UserRole } from '../../types/auth';

describe('DocumentService', () => {
  let documentService: DocumentService;
  let mockDb: any;
  let mockFileStorageService: jest.Mocked<FileStorageService>;

  beforeEach(() => {
    mockDb = {};
    mockFileStorageService = {
      uploadFile: jest.fn().mockResolvedValue(undefined),
      getSignedUrl: jest.fn().mockResolvedValue('https://s3.example.com/signed-url'),
      downloadFile: jest.fn(),
      deleteFile: jest.fn(),
      deleteFiles: jest.fn(),
      fileExists: jest.fn(),
      listFiles: jest.fn(),
      listFilesByEmployee: jest.fn(),
      listFilesByCategory: jest.fn(),
      initiateMultipartUpload: jest.fn(),
      uploadPart: jest.fn(),
      completeMultipartUpload: jest.fn(),
      abortMultipartUpload: jest.fn(),
      cleanupFiles: jest.fn(),
      cleanupOrphanedMultipartUploads: jest.fn(),
      cleanupOrphanedFiles: jest.fn(),
    } as any;

    documentService = new DocumentService(mockDb, mockFileStorageService);
  });

  describe('uploadDocument', () => {
    it('should upload a document successfully', async () => {
      const employeeId = 'emp-123';
      const uploadedBy = 'emp-123';
      const userRole = UserRole.EMPLOYEE;

      const documentData: DocumentUploadDTO = {
        document_type: 'passport',
        file: Buffer.from('test file content'),
        file_name: 'passport.pdf',
        mime_type: 'application/pdf',
        issue_date: '2020-01-01',
        expiry_date: '2030-01-01',
      };

      const mockDocument: Document = {
        id: 'doc-123',
        employee_id: employeeId,
        document_type: 'passport',
        file_name: 'passport.pdf',
        file_url: 'https://s3.example.com/file',
        mime_type: 'application/pdf',
        file_size: 16,
        issue_date: '2020-01-01',
        expiry_date: '2030-01-01',
        version: 1,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      jest.spyOn(DocumentRepository.prototype, 'createDocument').mockResolvedValue(mockDocument);
      jest.spyOn(DocumentRepository.prototype, 'logDocumentAccess').mockResolvedValue({} as any);

      const result = await documentService.uploadDocument(employeeId, documentData, uploadedBy, userRole);

      expect(result).toEqual(mockDocument);
      expect(mockFileStorageService.uploadFile).toHaveBeenCalled();
      expect(mockFileStorageService.getSignedUrl).toHaveBeenCalled();
    });

    it('should reject file exceeding size limit', async () => {
      const employeeId = 'emp-123';
      const uploadedBy = 'emp-123';
      const userRole = UserRole.EMPLOYEE;

      const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
      const documentData: DocumentUploadDTO = {
        document_type: 'passport',
        file: largeBuffer,
        file_name: 'large.pdf',
        mime_type: 'application/pdf',
      };

      await expect(documentService.uploadDocument(employeeId, documentData, uploadedBy, userRole)).rejects.toThrow('File size exceeds maximum limit');
    });

    it('should reject unsupported file type', async () => {
      const employeeId = 'emp-123';
      const uploadedBy = 'emp-123';
      const userRole = UserRole.EMPLOYEE;

      const documentData: DocumentUploadDTO = {
        document_type: 'passport',
        file: Buffer.from('test'),
        file_name: 'file.exe',
        mime_type: 'application/x-msdownload',
      };

      await expect(documentService.uploadDocument(employeeId, documentData, uploadedBy, userRole)).rejects.toThrow('File type');
    });

    it('should reject employee uploading for another employee', async () => {
      const employeeId = 'emp-123';
      const uploadedBy = 'emp-456';
      const userRole = UserRole.EMPLOYEE;

      const documentData: DocumentUploadDTO = {
        document_type: 'passport',
        file: Buffer.from('test'),
        file_name: 'passport.pdf',
        mime_type: 'application/pdf',
      };

      await expect(documentService.uploadDocument(employeeId, documentData, uploadedBy, userRole)).rejects.toThrow('Employees can only upload their own documents');
    });

    it('should allow HR Manager to upload for any employee', async () => {
      const employeeId = 'emp-123';
      const uploadedBy = 'hr-001';
      const userRole = UserRole.HR_MANAGER;

      const documentData: DocumentUploadDTO = {
        document_type: 'passport',
        file: Buffer.from('test file content'),
        file_name: 'passport.pdf',
        mime_type: 'application/pdf',
      };

      const mockDocument: Document = {
        id: 'doc-123',
        employee_id: employeeId,
        document_type: 'passport',
        file_name: 'passport.pdf',
        file_url: 'https://s3.example.com/file',
        mime_type: 'application/pdf',
        file_size: 16,
        issue_date: null,
        expiry_date: null,
        version: 1,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      jest.spyOn(DocumentRepository.prototype, 'createDocument').mockResolvedValue(mockDocument);
      jest.spyOn(DocumentRepository.prototype, 'logDocumentAccess').mockResolvedValue({} as any);

      const result = await documentService.uploadDocument(employeeId, documentData, uploadedBy, userRole);

      expect(result).toEqual(mockDocument);
    });
  });

  describe('getDocument', () => {
    it('should retrieve a document successfully', async () => {
      const documentId = 'doc-123';
      const employeeId = 'emp-123';
      const requestedBy = 'emp-123';
      const userRole = UserRole.EMPLOYEE;

      const mockDocument: Document = {
        id: documentId,
        employee_id: employeeId,
        document_type: 'passport',
        file_name: 'passport.pdf',
        file_url: 'https://s3.example.com/file',
        mime_type: 'application/pdf',
        file_size: 1024,
        issue_date: '2020-01-01',
        expiry_date: '2030-01-01',
        version: 1,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      jest.spyOn(DocumentRepository.prototype, 'getDocument').mockResolvedValue(mockDocument);
      jest.spyOn(DocumentRepository.prototype, 'logDocumentAccess').mockResolvedValue({} as any);

      const result = await documentService.getDocument(documentId, requestedBy, userRole);

      expect(result).toEqual(mockDocument);
    });

    it('should reject access to another employee\'s document', async () => {
      const documentId = 'doc-123';
      const employeeId = 'emp-123';
      const requestedBy = 'emp-456';
      const userRole = UserRole.EMPLOYEE;

      const mockDocument: Document = {
        id: documentId,
        employee_id: employeeId,
        document_type: 'passport',
        file_name: 'passport.pdf',
        file_url: 'https://s3.example.com/file',
        mime_type: 'application/pdf',
        file_size: 1024,
        issue_date: null,
        expiry_date: null,
        version: 1,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      jest.spyOn(DocumentRepository.prototype, 'getDocument').mockResolvedValue(mockDocument);

      await expect(documentService.getDocument(documentId, requestedBy, userRole)).rejects.toThrow('Employees can only view their own documents');
    });

    it('should allow HR Manager to view any employee\'s document', async () => {
      const documentId = 'doc-123';
      const employeeId = 'emp-123';
      const requestedBy = 'hr-001';
      const userRole = UserRole.HR_MANAGER;

      const mockDocument: Document = {
        id: documentId,
        employee_id: employeeId,
        document_type: 'passport',
        file_name: 'passport.pdf',
        file_url: 'https://s3.example.com/file',
        mime_type: 'application/pdf',
        file_size: 1024,
        issue_date: null,
        expiry_date: null,
        version: 1,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      jest.spyOn(DocumentRepository.prototype, 'getDocument').mockResolvedValue(mockDocument);
      jest.spyOn(DocumentRepository.prototype, 'logDocumentAccess').mockResolvedValue({} as any);

      const result = await documentService.getDocument(documentId, requestedBy, userRole);

      expect(result).toEqual(mockDocument);
    });
  });

  describe('updateDocumentVersion', () => {
    it('should create a new version of document', async () => {
      const documentId = 'doc-123';
      const employeeId = 'emp-123';
      const uploadedBy = 'emp-123';
      const userRole = UserRole.EMPLOYEE;

      const oldDocument: Document = {
        id: documentId,
        employee_id: employeeId,
        document_type: 'passport',
        file_name: 'passport.pdf',
        file_url: 'https://s3.example.com/file-v1',
        mime_type: 'application/pdf',
        file_size: 1024,
        issue_date: '2020-01-01',
        expiry_date: '2030-01-01',
        version: 1,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const newDocument: Document = {
        ...oldDocument,
        file_url: 'https://s3.example.com/file-v2',
        version: 2,
      };

      const newDocumentData: DocumentUploadDTO = {
        document_type: 'passport',
        file: Buffer.from('updated content'),
        file_name: 'passport-updated.pdf',
        mime_type: 'application/pdf',
        issue_date: '2020-01-01',
        expiry_date: '2035-01-01',
      };

      jest.spyOn(DocumentRepository.prototype, 'getDocumentById').mockResolvedValue(oldDocument);
      jest.spyOn(DocumentRepository.prototype, 'updateDocumentVersion').mockResolvedValue(newDocument);
      jest.spyOn(DocumentRepository.prototype, 'logDocumentAccess').mockResolvedValue({} as any);

      const result = await documentService.updateDocumentVersion(documentId, newDocumentData, uploadedBy, userRole);

      expect(result.version).toBe(2);
      expect(result.file_url).toBe('https://s3.example.com/file-v2');
    });
  });

  describe('deleteDocument', () => {
    it('should soft delete a document', async () => {
      const documentId = 'doc-123';
      const employeeId = 'emp-123';
      const deletedBy = 'emp-123';
      const userRole = UserRole.EMPLOYEE;

      const mockDocument: Document = {
        id: documentId,
        employee_id: employeeId,
        document_type: 'passport',
        file_name: 'passport.pdf',
        file_url: 'https://s3.example.com/file',
        mime_type: 'application/pdf',
        file_size: 1024,
        issue_date: null,
        expiry_date: null,
        version: 1,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      jest.spyOn(DocumentRepository.prototype, 'getDocumentById').mockResolvedValue(mockDocument);
      jest.spyOn(DocumentRepository.prototype, 'softDeleteDocument').mockResolvedValue(undefined);
      jest.spyOn(DocumentRepository.prototype, 'logDocumentAccess').mockResolvedValue({} as any);

      await documentService.deleteDocument(documentId, deletedBy, userRole);

      expect(DocumentRepository.prototype.softDeleteDocument).toHaveBeenCalledWith(documentId);
    });
  });

  describe('checkExpiringDocuments', () => {
    it('should retrieve documents expiring within 30 days', async () => {
      const expiringDocs: ExpiringDocument[] = [
        {
          id: 'doc-1',
          employee_id: 'emp-1',
          document_type: 'passport',
          file_name: 'passport.pdf',
          expiry_date: '2026-04-05',
          days_until_expiry: 30,
          employee_email: 'emp1@example.com',
          employee_name: 'John Doe',
        },
      ];

      jest.spyOn(DocumentRepository.prototype, 'getExpiringDocuments').mockResolvedValue(expiringDocs);

      const result = await documentService.checkExpiringDocuments();

      expect(result).toEqual(expiringDocs);
      expect(result.length).toBe(1);
    });
  });

  describe('notifyExpiringDocuments', () => {
    it('should send notifications for expiring documents', async () => {
      const expiringDocs: ExpiringDocument[] = [
        {
          id: 'doc-1',
          employee_id: 'emp-1',
          document_type: 'passport',
          file_name: 'passport.pdf',
          expiry_date: '2026-04-05',
          days_until_expiry: 30,
          employee_email: 'emp1@example.com',
          employee_name: 'John Doe',
        },
      ];

      jest.spyOn(DocumentRepository.prototype, 'getExpiringDocuments').mockResolvedValue(expiringDocs);

      // Mock the notification service
      const notificationServiceSpy = jest.spyOn(require('../notificationService').default, 'sendNotification').mockResolvedValue(undefined);

      await documentService.notifyExpiringDocuments();

      expect(notificationServiceSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          employeeId: 'emp-1',
          title: expect.stringContaining('Document Expiring Soon'),
          type: 'certification_expiring',
        })
      );

      notificationServiceSpy.mockRestore();
    });
  });

  describe('getDocumentVersions', () => {
    it('should retrieve all versions of a document', async () => {
      const documentId = 'doc-123';
      const employeeId = 'emp-123';
      const requestedBy = 'emp-123';
      const userRole = UserRole.EMPLOYEE;

      const mockDocument: Document = {
        id: documentId,
        employee_id: employeeId,
        document_type: 'passport',
        file_name: 'passport.pdf',
        file_url: 'https://s3.example.com/file',
        mime_type: 'application/pdf',
        file_size: 1024,
        issue_date: null,
        expiry_date: null,
        version: 2,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockVersions = [
        {
          id: 'v-2',
          document_id: documentId,
          version_number: 2,
          file_url: 'https://s3.example.com/file-v2',
          uploaded_by: 'emp-123',
          created_at: new Date().toISOString(),
        },
        {
          id: 'v-1',
          document_id: documentId,
          version_number: 1,
          file_url: 'https://s3.example.com/file-v1',
          uploaded_by: 'emp-123',
          created_at: new Date().toISOString(),
        },
      ];

      jest.spyOn(DocumentRepository.prototype, 'getDocumentById').mockResolvedValue(mockDocument);
      jest.spyOn(DocumentRepository.prototype, 'getDocumentVersions').mockResolvedValue(mockVersions);

      const result = await documentService.getDocumentVersions(documentId, requestedBy, userRole);

      expect(result).toEqual(mockVersions);
      expect(result.length).toBe(2);
    });
  });

  describe('getEmployeeDocuments', () => {
    it('should retrieve all documents for an employee', async () => {
      const employeeId = 'emp-123';
      const requestedBy = 'emp-123';
      const userRole = UserRole.EMPLOYEE;

      const mockDocuments: Document[] = [
        {
          id: 'doc-1',
          employee_id: employeeId,
          document_type: 'passport',
          file_name: 'passport.pdf',
          file_url: 'https://s3.example.com/file1',
          mime_type: 'application/pdf',
          file_size: 1024,
          issue_date: null,
          expiry_date: null,
          version: 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'doc-2',
          employee_id: employeeId,
          document_type: 'visa',
          file_name: 'visa.pdf',
          file_url: 'https://s3.example.com/file2',
          mime_type: 'application/pdf',
          file_size: 2048,
          issue_date: null,
          expiry_date: null,
          version: 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      jest.spyOn(DocumentRepository.prototype, 'getEmployeeDocuments').mockResolvedValue(mockDocuments);

      const result = await documentService.getEmployeeDocuments(employeeId, requestedBy, userRole);

      expect(result).toEqual(mockDocuments);
      expect(result.length).toBe(2);
    });
  });

  describe('getDocumentsByType', () => {
    it('should retrieve documents of a specific type', async () => {
      const employeeId = 'emp-123';
      const documentType = 'passport';
      const requestedBy = 'emp-123';
      const userRole = UserRole.EMPLOYEE;

      const mockDocuments: Document[] = [
        {
          id: 'doc-1',
          employee_id: employeeId,
          document_type: 'passport',
          file_name: 'passport.pdf',
          file_url: 'https://s3.example.com/file1',
          mime_type: 'application/pdf',
          file_size: 1024,
          issue_date: null,
          expiry_date: null,
          version: 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      jest.spyOn(DocumentRepository.prototype, 'getDocumentsByType').mockResolvedValue(mockDocuments);

      const result = await documentService.getDocumentsByType(employeeId, documentType, requestedBy, userRole);

      expect(result).toEqual(mockDocuments);
      expect(result[0]?.document_type).toBe('passport');
    });
  });

  describe('updateDocument', () => {
    it('should update document metadata', async () => {
      const documentId = 'doc-123';
      const employeeId = 'emp-123';
      const updatedBy = 'emp-123';
      const userRole = UserRole.EMPLOYEE;

      const oldDocument: Document = {
        id: documentId,
        employee_id: employeeId,
        document_type: 'passport',
        file_name: 'passport.pdf',
        file_url: 'https://s3.example.com/file',
        mime_type: 'application/pdf',
        file_size: 1024,
        issue_date: '2020-01-01',
        expiry_date: '2030-01-01',
        version: 1,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const updatedDocument: Document = {
        ...oldDocument,
        expiry_date: '2035-01-01',
      };

      jest.spyOn(DocumentRepository.prototype, 'getDocumentById').mockResolvedValue(oldDocument);
      jest.spyOn(DocumentRepository.prototype, 'updateDocument').mockResolvedValue(updatedDocument);
      jest.spyOn(DocumentRepository.prototype, 'logDocumentAccess').mockResolvedValue({} as any);

      const result = await documentService.updateDocument(documentId, { expiry_date: '2035-01-01' }, updatedBy, userRole);

      expect(result.expiry_date).toBe('2035-01-01');
    });
  });
});
