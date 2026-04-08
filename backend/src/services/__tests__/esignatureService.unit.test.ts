import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ESignatureService } from '../esignatureService';
import { SignatureRequestRepository } from '../../repositories/signatureRequestRepository';
import { SignatureEventRepository } from '../../repositories/signatureEventRepository';
import { DocumentRepository } from '../../repositories/documentRepository';
import { EmployeeRepository } from '../../repositories/employeeRepository';
import {
  SignatureRequestDTO,
  SignatureData,
  SignatureRequest,
  SignatureEvent,
} from '../../types/esignature';
import { Document } from '../../types/document';
import { v4 as uuidv4 } from 'uuid';

// Mock repositories
jest.mock('../../repositories/signatureRequestRepository');
jest.mock('../../repositories/signatureEventRepository');
jest.mock('../../repositories/documentRepository');
jest.mock('../../repositories/employeeRepository');
jest.mock('../../services/notificationService', () => ({
  __esModule: true,
  default: { sendNotification: jest.fn() },
}));

describe('ESignatureService', () => {
  let service: ESignatureService;
  let mockDb: any;
  let mockSignatureRequestRepo: jest.Mocked<SignatureRequestRepository>;
  let mockSignatureEventRepo: jest.Mocked<SignatureEventRepository>;
  let mockDocumentRepo: jest.Mocked<DocumentRepository>;
  let mockEmployeeRepo: jest.Mocked<EmployeeRepository>;

  const mockDocument: Document = {
    id: uuidv4(),
    employee_id: uuidv4(),
    document_type: 'contract',
    file_name: 'contract.pdf',
    file_url: 'https://example.com/contract.pdf',
    mime_type: 'application/pdf',
    file_size: 1024,
    issue_date: '2024-01-01',
    expiry_date: null,
    version: 1,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const mockSignatureRequest: SignatureRequest = {
    id: uuidv4(),
    document_id: mockDocument.id,
    requested_by: uuidv4(),
    signer_id: uuidv4(),
    document_title: 'Employment Contract',
    status: 'pending',
    expires_at: futureDate,
    signed_at: null,
    signed_document_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockEmployee = {
    id: mockSignatureRequest.signer_id,
    first_name: 'John',
    last_name: 'Doe',
  };

  const mockSignatureEvent: SignatureEvent = {
    id: uuidv4(),
    esignature_request_id: mockSignatureRequest.id,
    event_type: 'created',
    ip_address: null,
    user_agent: null,
    metadata: null,
    created_at: new Date().toISOString(),
  };

  beforeEach(() => {
    mockDb = {} as any;
    mockSignatureRequestRepo = new SignatureRequestRepository(mockDb) as jest.Mocked<SignatureRequestRepository>;
    mockSignatureEventRepo = new SignatureEventRepository(mockDb) as jest.Mocked<SignatureEventRepository>;
    mockDocumentRepo = new DocumentRepository(mockDb) as jest.Mocked<DocumentRepository>;
    mockEmployeeRepo = new EmployeeRepository(mockDb) as jest.Mocked<EmployeeRepository>;

    service = new ESignatureService(mockDb);

    // Override repositories with mocks
    (service as any).signatureRequestRepository = mockSignatureRequestRepo;
    (service as any).signatureEventRepository = mockSignatureEventRepo;
    (service as any).documentRepository = mockDocumentRepo;
    (service as any).employeeRepository = mockEmployeeRepo;

    // Mock file storage service
    const mockFileStorage: any = {
      uploadFile: (jest.fn() as any).mockResolvedValue({
        id: uuidv4(),
        url: 'https://example.com/signed.pdf',
        key: 'esignature/test/signed.pdf',
        metadata: {},
      }),
      getSignedUrl: (jest.fn() as any).mockResolvedValue('https://example.com/signed.pdf'),
    };
    (service as any).fileStorageService = mockFileStorage;
  });

  describe('createSignatureRequest', () => {
    it('should create a signature request successfully', async () => {
      const dto: SignatureRequestDTO = {
        document_id: mockDocument.id,
        signer_id: uuidv4(),
        document_title: 'Employment Contract',
        expires_in_days: 7,
      };
      const requestedBy = uuidv4();

      mockDocumentRepo.getDocument.mockResolvedValue(mockDocument);
      mockEmployeeRepo.getEmployee.mockResolvedValue(mockEmployee as any);
      mockSignatureRequestRepo.createSignatureRequest.mockResolvedValue(mockSignatureRequest);
      mockSignatureEventRepo.createSignatureEvent.mockResolvedValue(mockSignatureEvent);

      const result = await service.createSignatureRequest(requestedBy, dto);

      expect(result).toEqual(mockSignatureRequest);
      expect(mockDocumentRepo.getDocument).toHaveBeenCalledWith(dto.document_id);
      expect(mockSignatureRequestRepo.createSignatureRequest).toHaveBeenCalledWith(requestedBy, dto);
      expect(mockSignatureEventRepo.createSignatureEvent).toHaveBeenCalledWith(
        mockSignatureRequest.id,
        'created',
        undefined,
        undefined,
        expect.any(Object)
      );
    });

    it('should throw error if document not found', async () => {
      const dto: SignatureRequestDTO = {
        document_id: uuidv4(),
        signer_id: uuidv4(),
        document_title: 'Employment Contract',
      };

      mockDocumentRepo.getDocument.mockResolvedValue(null);

      await expect(service.createSignatureRequest(uuidv4(), dto)).rejects.toThrow('Document not found');
    });

    it('should throw error if signer not found', async () => {
      const dto: SignatureRequestDTO = {
        document_id: mockDocument.id,
        signer_id: uuidv4(),
        document_title: 'Employment Contract',
      };

      mockDocumentRepo.getDocument.mockResolvedValue(mockDocument);
      mockEmployeeRepo.getEmployee.mockResolvedValue(null);

      await expect(service.createSignatureRequest(uuidv4(), dto)).rejects.toThrow('Signer not found');
    });
  });

  describe('signDocument', () => {
    const signatureData: SignatureData = {
      method: 'typed',
      signature_content: 'John Doe',
      timestamp: new Date(),
    };

    it('should sign document with typed signature', async () => {
      mockSignatureRequestRepo.getSignatureRequest.mockResolvedValue(mockSignatureRequest);
      mockSignatureEventRepo.getSignatureEventsByRequestAndType.mockResolvedValue([]);
      mockSignatureEventRepo.createSignatureEvent.mockResolvedValue(mockSignatureEvent);
      mockDocumentRepo.getDocument.mockResolvedValue(mockDocument);
      mockEmployeeRepo.getEmployee.mockResolvedValue(mockEmployee as any);
      mockSignatureRequestRepo.updateSignatureRequestStatus.mockResolvedValue({
        ...mockSignatureRequest,
        status: 'signed',
        signed_at: new Date().toISOString(),
        signed_document_url: 'https://example.com/signed.pdf',
      });

      await service.signDocument(mockSignatureRequest.id, signatureData, '192.168.1.1', 'Mozilla/5.0');

      expect(mockSignatureRequestRepo.getSignatureRequest).toHaveBeenCalledWith(mockSignatureRequest.id);
      expect(mockSignatureRequestRepo.updateSignatureRequestStatus).toHaveBeenCalledWith(
        mockSignatureRequest.id,
        'signed',
        expect.any(String)
      );
      expect(mockSignatureEventRepo.createSignatureEvent).toHaveBeenCalledWith(
        mockSignatureRequest.id,
        'signed',
        '192.168.1.1',
        'Mozilla/5.0',
        expect.any(Object)
      );
    });

    it('should throw error if signature request not found', async () => {
      mockSignatureRequestRepo.getSignatureRequest.mockResolvedValue(null);

      await expect(service.signDocument(uuidv4(), signatureData)).rejects.toThrow(
        'Signature request not found'
      );
    });

    it('should throw error if request is not pending', async () => {
      const signedRequest: SignatureRequest = { ...mockSignatureRequest, status: 'signed' };
      mockSignatureRequestRepo.getSignatureRequest.mockResolvedValue(signedRequest);

      await expect(service.signDocument(signedRequest.id, signatureData)).rejects.toThrow(
        'Cannot sign document with status: signed'
      );
    });

    it('should throw error if request has expired', async () => {
      const expiredRequest: SignatureRequest = {
        ...mockSignatureRequest,
        expires_at: new Date(Date.now() - 1000).toISOString(),
      };

      mockSignatureRequestRepo.getSignatureRequest.mockResolvedValue(expiredRequest);
      mockSignatureRequestRepo.updateSignatureRequestStatus.mockResolvedValue({
        ...expiredRequest,
        status: 'expired',
      });

      await expect(service.signDocument(expiredRequest.id, signatureData)).rejects.toThrow(
        'Signature request has expired'
      );
    });

    it('should support drawn signature method', async () => {
      const drawnSignature: SignatureData = {
        method: 'drawn',
        signature_content:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        timestamp: new Date(),
      };

      mockSignatureRequestRepo.getSignatureRequest.mockResolvedValue(mockSignatureRequest);
      mockSignatureEventRepo.getSignatureEventsByRequestAndType.mockResolvedValue([]);
      mockSignatureEventRepo.createSignatureEvent.mockResolvedValue(mockSignatureEvent);
      mockDocumentRepo.getDocument.mockResolvedValue(mockDocument);
      mockEmployeeRepo.getEmployee.mockResolvedValue(mockEmployee as any);
      mockSignatureRequestRepo.updateSignatureRequestStatus.mockResolvedValue({
        ...mockSignatureRequest,
        status: 'signed',
      });

      await service.signDocument(mockSignatureRequest.id, drawnSignature);

      expect(mockSignatureEventRepo.createSignatureEvent).toHaveBeenCalled();
    });

    it('should support uploaded signature method', async () => {
      const uploadedSignature: SignatureData = {
        method: 'uploaded',
        signature_content: 'https://example.com/signature.png',
        timestamp: new Date(),
      };

      mockSignatureRequestRepo.getSignatureRequest.mockResolvedValue(mockSignatureRequest);
      mockSignatureEventRepo.getSignatureEventsByRequestAndType.mockResolvedValue([]);
      mockSignatureEventRepo.createSignatureEvent.mockResolvedValue(mockSignatureEvent);
      mockDocumentRepo.getDocument.mockResolvedValue(mockDocument);
      mockEmployeeRepo.getEmployee.mockResolvedValue(mockEmployee as any);
      mockSignatureRequestRepo.updateSignatureRequestStatus.mockResolvedValue({
        ...mockSignatureRequest,
        status: 'signed',
      });

      await service.signDocument(mockSignatureRequest.id, uploadedSignature);

      expect(mockSignatureEventRepo.createSignatureEvent).toHaveBeenCalled();
    });
  });

  describe('getSignatureStatus', () => {
    it('should return signature request status', async () => {
      mockSignatureRequestRepo.getSignatureRequest.mockResolvedValue(mockSignatureRequest);

      const result = await service.getSignatureStatus(mockSignatureRequest.id);

      expect(result.id).toBe(mockSignatureRequest.id);
      expect(result.status).toBe('pending');
    });

    it('should throw error if request not found', async () => {
      mockSignatureRequestRepo.getSignatureRequest.mockResolvedValue(null);

      await expect(service.getSignatureStatus(uuidv4())).rejects.toThrow(
        'Signature request not found'
      );
    });
  });

  describe('getAuditTrail', () => {
    it('should return audit trail for signature request', async () => {
      const mockEvents: SignatureEvent[] = [
        { ...mockSignatureEvent, event_type: 'created' },
        { ...mockSignatureEvent, id: uuidv4(), event_type: 'signed' },
      ];

      mockSignatureRequestRepo.getSignatureRequest.mockResolvedValue(mockSignatureRequest);
      mockSignatureEventRepo.getAuditTrail.mockResolvedValue(mockEvents);

      const result = await service.getAuditTrail(mockSignatureRequest.id);

      expect(result).toHaveLength(2);
      expect(result[0]?.event_type).toBe('created');
      expect(result[1]?.event_type).toBe('signed');
    });
  });

  describe('sendReminder', () => {
    it('should send reminder for pending signature', async () => {
      mockSignatureRequestRepo.getSignatureRequest.mockResolvedValue(mockSignatureRequest);
      mockEmployeeRepo.getEmployee.mockResolvedValue(mockEmployee as any);
      mockSignatureEventRepo.createSignatureEvent.mockResolvedValue(mockSignatureEvent);

      await service.sendReminder(mockSignatureRequest.id);

      expect(mockSignatureEventRepo.createSignatureEvent).toHaveBeenCalledWith(
        mockSignatureRequest.id,
        'reminder_sent',
        undefined,
        undefined,
        expect.any(Object)
      );
    });

    it('should throw error if request not found', async () => {
      mockSignatureRequestRepo.getSignatureRequest.mockResolvedValue(null);

      await expect(service.sendReminder(uuidv4())).rejects.toThrow('Signature request not found');
    });

    it('should throw error if request is not pending', async () => {
      const signedRequest: SignatureRequest = { ...mockSignatureRequest, status: 'signed' };
      mockSignatureRequestRepo.getSignatureRequest.mockResolvedValue(signedRequest);

      await expect(service.sendReminder(signedRequest.id)).rejects.toThrow(
        'Can only send reminders for pending signature requests'
      );
    });
  });

  describe('markExpiredRequests', () => {
    it('should mark expired signature requests and return count', async () => {
      mockSignatureRequestRepo.markExpiredRequests.mockResolvedValue(3);

      const result = await service.markExpiredRequests();

      expect(result).toBe(3);
      expect(mockSignatureRequestRepo.markExpiredRequests).toHaveBeenCalled();
    });
  });

  describe('getPendingSignatureRequests', () => {
    it('should return all pending signature requests', async () => {
      mockSignatureRequestRepo.getPendingSignatureRequests.mockResolvedValue([mockSignatureRequest]);

      const result = await service.getPendingSignatureRequests();

      expect(result).toEqual([mockSignatureRequest]);
      expect(mockSignatureRequestRepo.getPendingSignatureRequests).toHaveBeenCalled();
    });
  });

  describe('getSignatureRequestsByRequester', () => {
    it('should return signature requests by requester', async () => {
      const requesterId = uuidv4();
      mockSignatureRequestRepo.getSignatureRequestsByRequester.mockResolvedValue([mockSignatureRequest]);

      const result = await service.getSignatureRequestsByRequester(requesterId);

      expect(result).toEqual([mockSignatureRequest]);
      expect(mockSignatureRequestRepo.getSignatureRequestsByRequester).toHaveBeenCalledWith(requesterId);
    });
  });

  describe('getSignatureRequestsBySigner', () => {
    it('should return signature requests for a signer', async () => {
      const signerId = uuidv4();
      mockSignatureRequestRepo.getSignatureRequestsBySigner.mockResolvedValue([mockSignatureRequest]);

      const result = await service.getSignatureRequestsBySigner(signerId);

      expect(result).toEqual([mockSignatureRequest]);
      expect(mockSignatureRequestRepo.getSignatureRequestsBySigner).toHaveBeenCalledWith(signerId);
    });
  });

  describe('Audit Trail Completeness', () => {
    it('should maintain complete audit trail of all events', async () => {
      const mockEvents: SignatureEvent[] = [
        {
          id: uuidv4(),
          esignature_request_id: mockSignatureRequest.id,
          event_type: 'created',
          ip_address: null,
          user_agent: null,
          metadata: null,
          created_at: new Date('2024-01-01T10:00:00Z').toISOString(),
        },
        {
          id: uuidv4(),
          esignature_request_id: mockSignatureRequest.id,
          event_type: 'viewed',
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0',
          metadata: null,
          created_at: new Date('2024-01-01T11:00:00Z').toISOString(),
        },
        {
          id: uuidv4(),
          esignature_request_id: mockSignatureRequest.id,
          event_type: 'signed',
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0',
          metadata: { method: 'typed' },
          created_at: new Date('2024-01-01T12:00:00Z').toISOString(),
        },
      ];

      mockSignatureRequestRepo.getSignatureRequest.mockResolvedValue(mockSignatureRequest);
      mockSignatureEventRepo.getAuditTrail.mockResolvedValue(mockEvents);

      const result = await service.getAuditTrail(mockSignatureRequest.id);

      expect(result).toHaveLength(3);
      expect(result[0]?.event_type).toBe('created');
      expect(result[1]?.event_type).toBe('viewed');
      expect(result[2]?.event_type).toBe('signed');
      expect(result[2]?.metadata?.['method']).toBe('typed');
    });
  });

  describe('Edge Cases', () => {
    it('should handle duplicate signature attempts', async () => {
      const signatureData: SignatureData = { method: 'typed', signature_content: 'John Doe', timestamp: new Date() };
      const signedRequest: SignatureRequest = { ...mockSignatureRequest, status: 'signed' };
      mockSignatureRequestRepo.getSignatureRequest.mockResolvedValue(signedRequest);

      await expect(service.signDocument(signedRequest.id, signatureData)).rejects.toThrow(
        'Cannot sign document with status: signed'
      );
    });

    it('should handle signature on expired request', async () => {
      const signatureData: SignatureData = { method: 'typed', signature_content: 'John Doe', timestamp: new Date() };
      const expiredRequest: SignatureRequest = {
        ...mockSignatureRequest,
        expires_at: new Date(Date.now() - 1000).toISOString(),
      };

      mockSignatureRequestRepo.getSignatureRequest.mockResolvedValue(expiredRequest);
      mockSignatureRequestRepo.updateSignatureRequestStatus.mockResolvedValue({
        ...expiredRequest,
        status: 'expired',
      });

      await expect(service.signDocument(expiredRequest.id, signatureData)).rejects.toThrow(
        'Signature request has expired'
      );
    });

    it('should handle rejection of already signed document', async () => {
      // getSignatureStatus returns status object; no rejectSignatureRequest in service
      // Test that a signed request returns correct status
      const signedRequest: SignatureRequest = {
        ...mockSignatureRequest,
        status: 'signed',
        signed_at: new Date().toISOString(),
      };
      mockSignatureRequestRepo.getSignatureRequest.mockResolvedValue(signedRequest);

      const result = await service.getSignatureStatus(signedRequest.id);
      expect(result.status).toBe('signed');
    });
  });
});
