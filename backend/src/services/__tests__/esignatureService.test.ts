import { ESignatureService } from '../esignatureService';
import { SignatureRequestRepository } from '../../repositories/signatureRequestRepository';
import { SignatureEventRepository } from '../../repositories/signatureEventRepository';
import { DocumentRepository } from '../../repositories/documentRepository';
import { EmployeeRepository } from '../../repositories/employeeRepository';

describe('ESignatureService', () => {
  let service: ESignatureService;
  let mockDb: any;
  let mockFileStorageService: any;

  beforeEach(() => {
    mockDb = {} as any;
    mockFileStorageService = {
      uploadFile: jest.fn().mockResolvedValue(undefined),
      getSignedUrl: jest.fn().mockResolvedValue('https://signed-url.example.com'),
    } as any;

    service = new ESignatureService(mockDb, mockFileStorageService);

    // Mock repositories
    jest.spyOn(SignatureRequestRepository.prototype, 'createSignatureRequest').mockResolvedValue({
      id: 'req-1',
      document_id: 'doc-1',
      requested_by: 'emp-1',
      signer_id: 'emp-2',
      document_title: 'Test Document',
      status: 'pending',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      signed_at: null,
      signed_document_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any);

    jest.spyOn(SignatureEventRepository.prototype, 'createSignatureEvent').mockResolvedValue({
      id: 'event-1',
      esignature_request_id: 'req-1',
      event_type: 'created',
      ip_address: null,
      user_agent: null,
      metadata: null,
      created_at: new Date().toISOString(),
    } as any);

    jest.spyOn(DocumentRepository.prototype, 'getDocument').mockResolvedValue({
      id: 'doc-1',
      employee_id: 'emp-1',
      document_type: 'contract',
      file_name: 'contract.pdf',
      file_url: 'https://example.com/contract.pdf',
      mime_type: 'application/pdf',
      file_size: 1024,
      issue_date: null,
      expiry_date: null,
      version: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any);

    jest.spyOn(EmployeeRepository.prototype, 'getEmployee').mockResolvedValue({
      id: 'emp-2',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      date_of_birth: '1990-01-01',
      gender: 'male',
      blood_group: 'O+',
      employee_id: 'EMP002',
      status: 'active',
      department_id: 'dept-1',
      designation_id: 'des-1',
      date_of_joining: '2020-01-01',
      employment_type: 'permanent',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any);
  });

  describe('createSignatureRequest', () => {
    it('should create a signature request successfully', async () => {
      const result = await service.createSignatureRequest(
        'emp-1',
        {
          document_id: 'doc-1',
          signer_id: 'emp-2',
          document_title: 'Test Document',
          expires_in_days: 7,
        },
        '192.168.1.1',
        'Mozilla/5.0'
      );

      expect(result).toBeDefined();
      expect(result.id).toBe('req-1');
      expect(result.status).toBe('pending');
    });

    it('should throw error if document not found', async () => {
      jest.spyOn(DocumentRepository.prototype, 'getDocument').mockResolvedValueOnce(null);

      await expect(
        service.createSignatureRequest('emp-1', {
          document_id: 'doc-invalid',
          signer_id: 'emp-2',
          document_title: 'Test Document',
        })
      ).rejects.toThrow('Document not found');
    });

    it('should throw error if signer not found', async () => {
      jest.spyOn(EmployeeRepository.prototype, 'getEmployee').mockResolvedValueOnce(null);

      await expect(
        service.createSignatureRequest('emp-1', {
          document_id: 'doc-1',
          signer_id: 'emp-invalid',
          document_title: 'Test Document',
        })
      ).rejects.toThrow('Signer not found');
    });
  });

  describe('signDocument', () => {
    it('should sign document successfully', async () => {
      jest.spyOn(SignatureRequestRepository.prototype, 'getSignatureRequest').mockResolvedValueOnce({
        id: 'req-1',
        document_id: 'doc-1',
        requested_by: 'emp-1',
        signer_id: 'emp-2',
        document_title: 'Test Document',
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        signed_at: null,
        signed_document_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any);

      jest.spyOn(SignatureEventRepository.prototype, 'getSignatureEventsByRequestAndType').mockResolvedValueOnce([]);

      jest.spyOn(SignatureRequestRepository.prototype, 'updateSignatureRequestStatus').mockResolvedValueOnce({
        id: 'req-1',
        document_id: 'doc-1',
        requested_by: 'emp-1',
        signer_id: 'emp-2',
        document_title: 'Test Document',
        status: 'signed',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        signed_at: new Date().toISOString(),
        signed_document_url: 'https://signed-url.example.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any);

      // Mock the second call to getSignatureRequest in generateSignedDocument
      jest.spyOn(SignatureRequestRepository.prototype, 'getSignatureRequest').mockResolvedValueOnce({
        id: 'req-1',
        document_id: 'doc-1',
        requested_by: 'emp-1',
        signer_id: 'emp-2',
        document_title: 'Test Document',
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        signed_at: null,
        signed_document_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any);

      await service.signDocument('req-1', {
        method: 'drawn',
        signature_content: 'base64-encoded-signature',
        timestamp: new Date(),
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0',
      });

      expect(SignatureRequestRepository.prototype.updateSignatureRequestStatus).toHaveBeenCalledWith(
        'req-1',
        'signed',
        expect.any(String)
      );
    });

    it('should throw error if signature request not found', async () => {
      jest.spyOn(SignatureRequestRepository.prototype, 'getSignatureRequest').mockResolvedValueOnce(null);

      await expect(
        service.signDocument('req-invalid', {
          method: 'typed',
          signature_content: 'John Doe',
          timestamp: new Date(),
        })
      ).rejects.toThrow('Signature request not found');
    });

    it('should throw error if document already signed', async () => {
      jest.spyOn(SignatureRequestRepository.prototype, 'getSignatureRequest').mockResolvedValueOnce({
        id: 'req-1',
        document_id: 'doc-1',
        requested_by: 'emp-1',
        signer_id: 'emp-2',
        document_title: 'Test Document',
        status: 'signed',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        signed_at: new Date().toISOString(),
        signed_document_url: 'https://signed-url.example.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any);

      await expect(
        service.signDocument('req-1', {
          method: 'typed',
          signature_content: 'John Doe',
          timestamp: new Date(),
        })
      ).rejects.toThrow('Cannot sign document with status: signed');
    });
  });

  describe('getSignatureStatus', () => {
    it('should return signature status', async () => {
      jest.spyOn(SignatureRequestRepository.prototype, 'getSignatureRequest').mockResolvedValueOnce({
        id: 'req-1',
        document_id: 'doc-1',
        requested_by: 'emp-1',
        signer_id: 'emp-2',
        document_title: 'Test Document',
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        signed_at: null,
        signed_document_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any);

      const result = await service.getSignatureStatus('req-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('req-1');
      expect(result.status).toBe('pending');
    });

    it('should throw error if signature request not found', async () => {
      jest.spyOn(SignatureRequestRepository.prototype, 'getSignatureRequest').mockResolvedValueOnce(null);

      await expect(service.getSignatureStatus('req-invalid')).rejects.toThrow('Signature request not found');
    });
  });

  describe('getAuditTrail', () => {
    it('should return audit trail for signature request', async () => {
      jest.spyOn(SignatureRequestRepository.prototype, 'getSignatureRequest').mockResolvedValueOnce({
        id: 'req-1',
        document_id: 'doc-1',
        requested_by: 'emp-1',
        signer_id: 'emp-2',
        document_title: 'Test Document',
        status: 'signed',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        signed_at: new Date().toISOString(),
        signed_document_url: 'https://signed-url.example.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any);

      jest.spyOn(SignatureEventRepository.prototype, 'getAuditTrail').mockResolvedValueOnce([
        {
          id: 'event-1',
          esignature_request_id: 'req-1',
          event_type: 'created',
          ip_address: null,
          user_agent: null,
          metadata: null,
          created_at: new Date().toISOString(),
        },
        {
          id: 'event-2',
          esignature_request_id: 'req-1',
          event_type: 'viewed',
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0',
          metadata: null,
          created_at: new Date().toISOString(),
        },
        {
          id: 'event-3',
          esignature_request_id: 'req-1',
          event_type: 'signed',
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0',
          metadata: { signatureMethod: 'drawn' },
          created_at: new Date().toISOString(),
        },
      ] as any);

      const result = await service.getAuditTrail('req-1');

      expect(result).toBeDefined();
      expect(result.length).toBe(3);
      expect(result[0]?.event_type).toBe('created');
      expect(result[1]?.event_type).toBe('viewed');
      expect(result[2]?.event_type).toBe('signed');
    });

    it('should throw error if signature request not found', async () => {
      jest.spyOn(SignatureRequestRepository.prototype, 'getSignatureRequest').mockResolvedValueOnce(null);

      await expect(service.getAuditTrail('req-invalid')).rejects.toThrow('Signature request not found');
    });
  });

  describe('sendReminder', () => {
    it('should send reminder notification', async () => {
      jest.spyOn(SignatureRequestRepository.prototype, 'getSignatureRequest').mockResolvedValueOnce({
        id: 'req-1',
        document_id: 'doc-1',
        requested_by: 'emp-1',
        signer_id: 'emp-2',
        document_title: 'Test Document',
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        signed_at: null,
        signed_document_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any);

      await service.sendReminder('req-1');

      expect(SignatureEventRepository.prototype.createSignatureEvent).toHaveBeenCalledWith(
        'req-1',
        'reminder_sent',
        undefined,
        undefined,
        expect.any(Object)
      );
    });

    it('should throw error if signature request not found', async () => {
      jest.spyOn(SignatureRequestRepository.prototype, 'getSignatureRequest').mockResolvedValueOnce(null);

      await expect(service.sendReminder('req-invalid')).rejects.toThrow('Signature request not found');
    });

    it('should throw error if signature request not pending', async () => {
      jest.spyOn(SignatureRequestRepository.prototype, 'getSignatureRequest').mockResolvedValueOnce({
        id: 'req-1',
        document_id: 'doc-1',
        requested_by: 'emp-1',
        signer_id: 'emp-2',
        document_title: 'Test Document',
        status: 'signed',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        signed_at: new Date().toISOString(),
        signed_document_url: 'https://signed-url.example.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any);

      await expect(service.sendReminder('req-1')).rejects.toThrow(
        'Can only send reminders for pending signature requests'
      );
    });
  });

  describe('markExpiredRequests', () => {
    it('should mark expired signature requests', async () => {
      jest.spyOn(SignatureRequestRepository.prototype, 'markExpiredRequests').mockResolvedValueOnce(2);

      const result = await service.markExpiredRequests();

      expect(result).toBe(2);
      expect(SignatureRequestRepository.prototype.markExpiredRequests).toHaveBeenCalled();
    });
  });

  describe('getSignatureRequestsBySigner', () => {
    it('should return signature requests for a signer', async () => {
      const mockRequests: any[] = [
        {
          id: 'req-1',
          document_id: 'doc-1',
          requested_by: 'emp-1',
          signer_id: 'emp-2',
          document_title: 'Test Document',
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          signed_at: null,
          signed_document_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      jest.spyOn(SignatureRequestRepository.prototype, 'getSignatureRequestsBySigner').mockResolvedValueOnce(
        mockRequests
      );

      const result = await service.getSignatureRequestsBySigner('emp-2');

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0]?.signer_id).toBe('emp-2');
    });
  });

  describe('getPendingSignatureRequests', () => {
    it('should return pending signature requests', async () => {
      const mockRequests: any[] = [
        {
          id: 'req-1',
          document_id: 'doc-1',
          requested_by: 'emp-1',
          signer_id: 'emp-2',
          document_title: 'Test Document',
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          signed_at: null,
          signed_document_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      jest.spyOn(SignatureRequestRepository.prototype, 'getPendingSignatureRequests').mockResolvedValueOnce(
        mockRequests
      );

      const result = await service.getPendingSignatureRequests();

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0]?.status).toBe('pending');
    });
  });
});
