import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Knex } from 'knex';
import { ESignatureService } from '../esignatureService';
import { SignatureRequestRepository } from '../../repositories/signatureRequestRepository';
import { SignatureEventRepository } from '../../repositories/signatureEventRepository';
import { DocumentRepository } from '../../repositories/documentRepository';
import {
  SignatureStatus,
  SignatureMethod,
  SignatureEventType,
  CreateSignatureRequestDTO,
} from '../../types/esignature';
import { Document } from '../../types/document';
import { v4 as uuidv4 } from 'uuid';

// Mock repositories
jest.mock('../../repositories/signatureRequestRepository');
jest.mock('../../repositories/signatureEventRepository');
jest.mock('../../repositories/documentRepository');
jest.mock('../../services/storage/s3StorageProvider');

describe('ESignatureService', () => {
  let service: ESignatureService;
  let mockDb: jest.Mocked<Knex>;
  let mockSignatureRequestRepo: jest.Mocked<SignatureRequestRepository>;
  let mockSignatureEventRepo: jest.Mocked<SignatureEventRepository>;
  let mockDocumentRepo: jest.Mocked<DocumentRepository>;

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

  const mockSignatureRequest = {
    id: uuidv4(),
    document_id: mockDocument.id,
    requested_by: uuidv4(),
    signer_id: uuidv4(),
    document_title: 'Employment Contract',
    status: SignatureStatus.PENDING,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    signed_at: null,
    signed_document_url: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(() => {
    mockDb = {} as jest.Mocked<Knex>;
    mockSignatureRequestRepo = new SignatureRequestRepository(mockDb) as jest.Mocked<SignatureRequestRepository>;
    mockSignatureEventRepo = new SignatureEventRepository(mockDb) as jest.Mocked<SignatureEventRepository>;
    mockDocumentRepo = new DocumentRepository(mockDb) as jest.Mocked<DocumentRepository>;

    service = new ESignatureService(mockDb);

    // Override repositories with mocks
    (service as any).signatureRequestRepository = mockSignatureRequestRepo;
    (service as any).signatureEventRepository = mockSignatureEventRepo;
    (service as any).documentRepository = mockDocumentRepo;

    // Mock file storage service with explicit any type
    const mockFileStorage: any = {
      uploadFile: jest.fn(),
      getSignedUrl: jest.fn(),
    };
    mockFileStorage.uploadFile.mockResolvedValue({
      id: uuidv4(),
      url: 'https://example.com/signed.pdf',
      key: 'esignature/test/signed.pdf',
      metadata: {},
    });
    mockFileStorage.getSignedUrl.mockResolvedValue('https://example.com/signed.pdf');
    (service as any).fileStorageService = mockFileStorage;
  });

  describe('createSignatureRequest', () => {
    it('should create a signature request successfully', async () => {
      const dto: CreateSignatureRequestDTO = {
        document_id: mockDocument.id,
        signer_id: uuidv4(),
        document_title: 'Employment Contract',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      mockDocumentRepo.getDocumentById.mockResolvedValue(mockDocument);
      mockSignatureRequestRepo.createSignatureRequest.mockResolvedValue(mockSignatureRequest);
      mockSignatureEventRepo.createEvent.mockResolvedValue({
        id: uuidv4(),
        esignature_request_id: mockSignatureRequest.id,
        event_type: SignatureEventType.CREATED,
        ip_address: null,
        user_agent: null,
        metadata: null,
        created_at: new Date(),
      });

      const result = await service.createSignatureRequest(dto);

      expect(result).toEqual(mockSignatureRequest);
      expect(mockDocumentRepo.getDocumentById).toHaveBeenCalledWith(dto.document_id);
      expect(mockSignatureRequestRepo.createSignatureRequest).toHaveBeenCalled();
      expect(mockSignatureEventRepo.createEvent).toHaveBeenCalledWith(
        mockSignatureRequest.id,
        SignatureEventType.CREATED,
        undefined,
        undefined,
        expect.any(Object)
      );
    });

    it('should throw error if document not found', async () => {
      const dto: CreateSignatureRequestDTO = {
        document_id: uuidv4(),
        signer_id: uuidv4(),
        document_title: 'Employment Contract',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      mockDocumentRepo.getDocumentById.mockResolvedValue(null);

      await expect(service.createSignatureRequest(dto)).rejects.toThrow(
        'Document not found'
      );
    });

    it('should throw error if expiry date is in the past', async () => {
      const dto: CreateSignatureRequestDTO = {
        document_id: mockDocument.id,
        signer_id: uuidv4(),
        document_title: 'Employment Contract',
        expires_at: new Date(Date.now() - 1000), // 1 second ago
      };

      mockDocumentRepo.getDocumentById.mockResolvedValue(mockDocument);

      await expect(service.createSignatureRequest(dto)).rejects.toThrow(
        'Expiry date must be in the future'
      );
    });
  });

  describe('signDocument', () => {
    it('should sign document with typed signature', async () => {
      const signatureData = {
        method: SignatureMethod.TYPED,
        data: 'John Doe',
        timestamp: new Date(),
      };

      mockSignatureRequestRepo.getSignatureRequest.mockResolvedValue(mockSignatureRequest);
      mockSignatureEventRepo.createEvent.mockResolvedValue({
        id: uuidv4(),
        esignature_request_id: mockSignatureRequest.id,
        event_type: SignatureEventType.SIGNED,
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0',
        metadata: null,
        created_at: new Date(),
      });
      mockSignatureRequestRepo.updateSignatureStatus.mockResolvedValue({
        ...mockSignatureRequest,
        status: SignatureStatus.SIGNED,
        signed_at: new Date(),
        signed_document_url: 'https://example.com/signed.pdf',
      });

      await service.signDocument(
        mockSignatureRequest.id,
        signatureData,
        '192.168.1.1',
        'Mozilla/5.0'
      );

      expect(mockSignatureRequestRepo.getSignatureRequest).toHaveBeenCalledWith(
        mockSignatureRequest.id
      );
      expect(mockSignatureEventRepo.createEvent).toHaveBeenCalledWith(
        mockSignatureRequest.id,
        SignatureEventType.SIGNED,
        '192.168.1.1',
        'Mozilla/5.0',
        expect.any(Object)
      );
      expect(mockSignatureRequestRepo.updateSignatureStatus).toHaveBeenCalled();
    });

    it('should throw error if signature request not found', async () => {
      const signatureData = {
        method: SignatureMethod.TYPED,
        data: 'John Doe',
        timestamp: new Date(),
      };

      mockSignatureRequestRepo.getSignatureRequest.mockResolvedValue(null);

      await expect(
        service.signDocument(uuidv4(), signatureData)
      ).rejects.toThrow('Signature request not found');
    });

    it('should throw error if request is not pending', async () => {
      const signatureData = {
        method: SignatureMethod.TYPED,
        data: 'John Doe',
        timestamp: new Date(),
      };

      const signedRequest = {
        ...mockSignatureRequest,
        status: SignatureStatus.SIGNED,
      };

      mockSignatureRequestRepo.getSignatureRequest.mockResolvedValue(signedRequest);

      await expect(
        service.signDocument(signedRequest.id, signatureData)
      ).rejects.toThrow('Cannot sign document with status: signed');
    });

    it('should throw error if request has expired', async () => {
      const signatureData = {
        method: SignatureMethod.TYPED,
        data: 'John Doe',
        timestamp: new Date(),
      };

      const expiredRequest = {
        ...mockSignatureRequest,
        expires_at: new Date(Date.now() - 1000),
      };

      mockSignatureRequestRepo.getSignatureRequest.mockResolvedValue(expiredRequest);
      mockSignatureRequestRepo.markAsExpired.mockResolvedValue({
        ...expiredRequest,
        status: SignatureStatus.EXPIRED,
      });

      await expect(
        service.signDocument(expiredRequest.id, signatureData)
      ).rejects.toThrow('Signature request has expired');
    });

    it('should throw error if signature data is empty', async () => {
      const signatureData = {
        method: SignatureMethod.TYPED,
        data: '',
        timestamp: new Date(),
      };

      mockSignatureRequestRepo.getSignatureRequest.mockResolvedValue(mockSignatureRequest);

      await expect(
        service.signDocument(mockSignatureRequest.id, signatureData)
      ).rejects.toThrow('Signature data is required');
    });

    it('should support drawn signature method', async () => {
      const signatureData = {
        method: SignatureMethod.DRAWN,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        timestamp: new Date(),
      };

      mockSignatureRequestRepo.getSignatureRequest.mockResolvedValue(mockSignatureRequest);
      mockSignatureEventRepo.createEvent.mockResolvedValue({
        id: uuidv4(),
        esignature_request_id: mockSignatureRequest.id,
        event_type: SignatureEventType.SIGNED,
        ip_address: null,
        user_agent: null,
        metadata: null,
        created_at: new Date(),
      });
      mockSignatureRequestRepo.updateSignatureStatus.mockResolvedValue({
        ...mockSignatureRequest,
        status: SignatureStatus.SIGNED,
      });

      await service.signDocument(mockSignatureRequest.id, signatureData);

      expect(mockSignatureEventRepo.createEvent).toHaveBeenCalled();
    });

    it('should support uploaded signature method', async () => {
      const signatureData = {
        method: SignatureMethod.UPLOADED,
        data: 'https://example.com/signature.png',
        timestamp: new Date(),
      };

      mockSignatureRequestRepo.getSignatureRequest.mockResolvedValue(mockSignatureRequest);
      mockSignatureEventRepo.createEvent.mockResolvedValue({
        id: uuidv4(),
        esignature_request_id: mockSignatureRequest.id,
        event_type: SignatureEventType.SIGNED,
        ip_address: null,
        user_agent: null,
        metadata: null,
        created_at: new Date(),
      });
      mockSignatureRequestRepo.updateSignatureStatus.mockResolvedValue({
        ...mockSignatureRequest,
        status: SignatureStatus.SIGNED,
      });

      await service.signDocument(mockSignatureRequest.id, signatureData);

      expect(mockSignatureEventRepo.createEvent).toHaveBeenCalled();
    });
  });

  describe('rejectSignatureRequest', () => {
    it('should reject signature request successfully', async () => {
      mockSignatureRequestRepo.getSignatureRequest.mockResolvedValue(mockSignatureRequest);
      mockSignatureEventRepo.createEvent.mockResolvedValue({
        id: uuidv4(),
        esignature_request_id: mockSignatureRequest.id,
        event_type: SignatureEventType.REJECTED,
        ip_address: null,
        user_agent: null,
        metadata: null,
        created_at: new Date(),
      });
      mockSignatureRequestRepo.updateSignatureStatus.mockResolvedValue({
        ...mockSignatureRequest,
        status: SignatureStatus.REJECTED,
      });

      await service.rejectSignatureRequest(mockSignatureRequest.id, 'Need modifications');

      expect(mockSignatureEventRepo.createEvent).toHaveBeenCalledWith(
        mockSignatureRequest.id,
        SignatureEventType.REJECTED,
        undefined,
        undefined,
        expect.objectContaining({ reason: 'Need modifications' })
      );
      expect(mockSignatureRequestRepo.updateSignatureStatus).toHaveBeenCalledWith(
        mockSignatureRequest.id,
        SignatureStatus.REJECTED
      );
    });

    it('should throw error if request not found', async () => {
      mockSignatureRequestRepo.getSignatureRequest.mockResolvedValue(null);

      await expect(
        service.rejectSignatureRequest(uuidv4())
      ).rejects.toThrow('Signature request not found');
    });

    it('should throw error if request is not pending', async () => {
      const signedRequest = {
        ...mockSignatureRequest,
        status: SignatureStatus.SIGNED,
      };

      mockSignatureRequestRepo.getSignatureRequest.mockResolvedValue(signedRequest);

      await expect(
        service.rejectSignatureRequest(signedRequest.id)
      ).rejects.toThrow('Cannot reject document with status: signed');
    });
  });

  describe('getSignatureStatus', () => {
    it('should return signature request status', async () => {
      mockSignatureRequestRepo.getSignatureRequest.mockResolvedValue(mockSignatureRequest);

      const result = await service.getSignatureStatus(mockSignatureRequest.id);

      expect(result).toEqual(mockSignatureRequest);
    });

    it('should throw error if request not found', async () => {
      mockSignatureRequestRepo.getSignatureRequest.mockResolvedValue(null);

      await expect(service.getSignatureStatus(uuidv4())).rejects.toThrow(
        'Signature request not found'
      );
    });

    it('should mark request as expired if expiry date passed', async () => {
      const expiredRequest = {
        ...mockSignatureRequest,
        expires_at: new Date(Date.now() - 1000),
      };

      mockSignatureRequestRepo.getSignatureRequest
        .mockResolvedValueOnce(expiredRequest)
        .mockResolvedValueOnce({
          ...expiredRequest,
          status: SignatureStatus.EXPIRED,
        });
      mockSignatureRequestRepo.markAsExpired.mockResolvedValue({
        ...expiredRequest,
        status: SignatureStatus.EXPIRED,
      });

      await service.getSignatureStatus(expiredRequest.id);

      expect(mockSignatureRequestRepo.markAsExpired).toHaveBeenCalledWith(expiredRequest.id);
    });
  });

  describe('getAuditTrail', () => {
    it('should return audit trail for signature request', async () => {
      const mockEvents = [
        {
          id: uuidv4(),
          esignature_request_id: mockSignatureRequest.id,
          event_type: SignatureEventType.CREATED,
          ip_address: null,
          user_agent: null,
          metadata: null,
          created_at: new Date(),
        },
        {
          id: uuidv4(),
          esignature_request_id: mockSignatureRequest.id,
          event_type: SignatureEventType.SIGNED,
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0',
          metadata: { method: 'typed' },
          created_at: new Date(),
        },
      ];

      mockSignatureEventRepo.getAuditTrail.mockResolvedValue(mockEvents);

      const result = await service.getAuditTrail(mockSignatureRequest.id);

      expect(result).toHaveLength(2);
      expect(result[0]?.event_type).toBe(SignatureEventType.CREATED);
      expect(result[1]?.event_type).toBe(SignatureEventType.SIGNED);
    });
  });

  describe('sendReminder', () => {
    it('should send reminder for pending signature', async () => {
      mockSignatureRequestRepo.getSignatureRequest.mockResolvedValue(mockSignatureRequest);
      mockSignatureEventRepo.hasReminderBeenSent.mockResolvedValue(false);
      mockSignatureEventRepo.createEvent.mockResolvedValue({
        id: uuidv4(),
        esignature_request_id: mockSignatureRequest.id,
        event_type: SignatureEventType.REMINDER_SENT,
        ip_address: null,
        user_agent: null,
        metadata: null,
        created_at: new Date(),
      });

      await service.sendReminder(mockSignatureRequest.id);

      expect(mockSignatureEventRepo.createEvent).toHaveBeenCalledWith(
        mockSignatureRequest.id,
        SignatureEventType.REMINDER_SENT,
        undefined,
        undefined,
        expect.any(Object)
      );
    });

    it('should throw error if reminder already sent', async () => {
      mockSignatureRequestRepo.getSignatureRequest.mockResolvedValue(mockSignatureRequest);
      mockSignatureEventRepo.hasReminderBeenSent.mockResolvedValue(true);

      await expect(service.sendReminder(mockSignatureRequest.id)).rejects.toThrow(
        'Reminder already sent for this request'
      );
    });
  });

  describe('scheduleReminders', () => {
    it('should schedule reminders for requests expiring within 48 hours', async () => {
      const requestsExpiring = [mockSignatureRequest];

      mockSignatureRequestRepo.getSignatureRequestsExpiringWithin.mockResolvedValue(
        requestsExpiring
      );
      mockSignatureEventRepo.hasReminderBeenSent.mockResolvedValue(false);
      
      // Mock sendReminder to avoid the error
      jest.spyOn(service, 'sendReminder').mockResolvedValue(undefined);

      const result = await service.scheduleReminders();

      expect(result).toBe(1);
      expect(mockSignatureRequestRepo.getSignatureRequestsExpiringWithin).toHaveBeenCalledWith(48);
    });
  });

  describe('markExpiredRequests', () => {
    it('should mark expired signature requests', async () => {
      const expiredRequest = {
        ...mockSignatureRequest,
        expires_at: new Date(Date.now() - 1000),
      };

      mockSignatureRequestRepo.getExpiredSignatureRequests.mockResolvedValue([expiredRequest]);
      mockSignatureRequestRepo.markAsExpired.mockResolvedValue({
        ...expiredRequest,
        status: SignatureStatus.EXPIRED,
      });
      mockSignatureEventRepo.createEvent.mockResolvedValue({
        id: uuidv4(),
        esignature_request_id: expiredRequest.id,
        event_type: SignatureEventType.EXPIRED,
        ip_address: null,
        user_agent: null,
        metadata: null,
        created_at: new Date(),
      });

      const result = await service.markExpiredRequests();

      expect(result).toBe(1);
      expect(mockSignatureRequestRepo.markAsExpired).toHaveBeenCalledWith(expiredRequest.id);
    });
  });

  describe('getPendingSignatures', () => {
    it('should return pending signatures for a signer', async () => {
      const signerId = uuidv4();
      const pendingRequests = [mockSignatureRequest];

      mockSignatureRequestRepo.getPendingSignatureRequests.mockResolvedValue(pendingRequests);

      const result = await service.getPendingSignatures(signerId);

      expect(result).toEqual(pendingRequests);
      expect(mockSignatureRequestRepo.getPendingSignatureRequests).toHaveBeenCalledWith(signerId);
    });
  });

  describe('getSignatureRequestsByRequester', () => {
    it('should return signature requests by requester', async () => {
      const requesterId = uuidv4();
      const requests = [mockSignatureRequest];

      mockSignatureRequestRepo.getSignatureRequestsByRequester.mockResolvedValue(requests);

      const result = await service.getSignatureRequestsByRequester(requesterId);

      expect(result).toEqual(requests);
      expect(mockSignatureRequestRepo.getSignatureRequestsByRequester).toHaveBeenCalledWith(
        requesterId
      );
    });
  });

  describe('getSignatureRequestCount', () => {
    it('should return count of signature requests for a signer', async () => {
      const signerId = uuidv4();

      mockSignatureRequestRepo.getSignatureRequestCount.mockResolvedValue(5);

      const result = await service.getSignatureRequestCount(signerId);

      expect(result).toBe(5);
      expect(mockSignatureRequestRepo.getSignatureRequestCount).toHaveBeenCalledWith(
        signerId,
        undefined
      );
    });

    it('should return count filtered by status', async () => {
      const signerId = uuidv4();

      mockSignatureRequestRepo.getSignatureRequestCount.mockResolvedValue(2);

      const result = await service.getSignatureRequestCount(signerId, SignatureStatus.PENDING);

      expect(result).toBe(2);
      expect(mockSignatureRequestRepo.getSignatureRequestCount).toHaveBeenCalledWith(
        signerId,
        SignatureStatus.PENDING
      );
    });
  });

  describe('Document Locking', () => {
    it('should lock document after signature', async () => {
      const signatureData = {
        method: SignatureMethod.TYPED,
        data: 'John Doe',
        timestamp: new Date(),
      };

      mockSignatureRequestRepo.getSignatureRequest.mockResolvedValue(mockSignatureRequest);
      mockSignatureEventRepo.createEvent.mockResolvedValue({
        id: uuidv4(),
        esignature_request_id: mockSignatureRequest.id,
        event_type: SignatureEventType.SIGNED,
        ip_address: null,
        user_agent: null,
        metadata: null,
        created_at: new Date(),
      });
      mockSignatureRequestRepo.updateSignatureStatus.mockResolvedValue({
        ...mockSignatureRequest,
        status: SignatureStatus.SIGNED,
      });
      mockSignatureRequestRepo.lockDocument.mockResolvedValue();

      await service.signDocument(mockSignatureRequest.id, signatureData);

      expect(mockSignatureRequestRepo.lockDocument).toHaveBeenCalledWith(mockSignatureRequest.id);
    });
  });

  describe('Audit Trail Completeness', () => {
    it('should maintain complete audit trail of all events', async () => {
      const mockEvents = [
        {
          id: uuidv4(),
          esignature_request_id: mockSignatureRequest.id,
          event_type: SignatureEventType.CREATED,
          ip_address: null,
          user_agent: null,
          metadata: null,
          created_at: new Date('2024-01-01T10:00:00Z'),
        },
        {
          id: uuidv4(),
          esignature_request_id: mockSignatureRequest.id,
          event_type: SignatureEventType.VIEWED,
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0',
          metadata: null,
          created_at: new Date('2024-01-01T11:00:00Z'),
        },
        {
          id: uuidv4(),
          esignature_request_id: mockSignatureRequest.id,
          event_type: SignatureEventType.SIGNED,
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0',
          metadata: { method: 'typed' },
          created_at: new Date('2024-01-01T12:00:00Z'),
        },
      ];

      mockSignatureEventRepo.getAuditTrail.mockResolvedValue(mockEvents);

      const result = await service.getAuditTrail(mockSignatureRequest.id);

      expect(result).toHaveLength(3);
      expect(result[0]?.event_type).toBe(SignatureEventType.CREATED);
      expect(result[1]?.event_type).toBe(SignatureEventType.VIEWED);
      expect(result[2]?.event_type).toBe(SignatureEventType.SIGNED);
      expect(result[2]?.metadata?.['method']).toBe('typed');
    });
  });

  describe('Edge Cases', () => {
    it('should handle duplicate signature attempts', async () => {
      const signatureData = {
        method: SignatureMethod.TYPED,
        data: 'John Doe',
        timestamp: new Date(),
      };

      const signedRequest = {
        ...mockSignatureRequest,
        status: SignatureStatus.SIGNED,
      };

      mockSignatureRequestRepo.getSignatureRequest.mockResolvedValue(signedRequest);

      await expect(
        service.signDocument(signedRequest.id, signatureData)
      ).rejects.toThrow('Cannot sign document with status: signed');
    });

    it('should handle signature on expired request', async () => {
      const signatureData = {
        method: SignatureMethod.TYPED,
        data: 'John Doe',
        timestamp: new Date(),
      };

      const expiredRequest = {
        ...mockSignatureRequest,
        expires_at: new Date(Date.now() - 1000),
      };

      mockSignatureRequestRepo.getSignatureRequest.mockResolvedValue(expiredRequest);
      mockSignatureRequestRepo.markAsExpired.mockResolvedValue({
        ...expiredRequest,
        status: SignatureStatus.EXPIRED,
      });

      await expect(
        service.signDocument(expiredRequest.id, signatureData)
      ).rejects.toThrow('Signature request has expired');
    });

    it('should handle rejection of already signed document', async () => {
      const signedRequest = {
        ...mockSignatureRequest,
        status: SignatureStatus.SIGNED,
      };

      mockSignatureRequestRepo.getSignatureRequest.mockResolvedValue(signedRequest);

      await expect(
        service.rejectSignatureRequest(signedRequest.id)
      ).rejects.toThrow('Cannot reject document with status: signed');
    });
  });
});
