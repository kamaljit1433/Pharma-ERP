import { Knex } from 'knex';
import logger from '../utils/logger';
import { SignatureRequest, SignatureRequestDTO, SignatureData, SignatureStatus, SignatureEvent } from '../types/esignature';
import { SignatureRequestRepository } from '../repositories/signatureRequestRepository';
import { SignatureEventRepository } from '../repositories/signatureEventRepository';
import { DocumentRepository } from '../repositories/documentRepository';
import { EmployeeRepository } from '../repositories/employeeRepository';
import { FileStorageService } from './fileStorageService';
import notificationService from './notificationService';
import { FileCategory } from '../types/fileStorage';

export class ESignatureService {
  private signatureRequestRepository: SignatureRequestRepository;
  private signatureEventRepository: SignatureEventRepository;
  private documentRepository: DocumentRepository;
  private employeeRepository: EmployeeRepository;
  private fileStorageService: FileStorageService;

  constructor(
    db: Knex,
    fileStorageService?: FileStorageService
  ) {
    this.signatureRequestRepository = new SignatureRequestRepository(db);
    this.signatureEventRepository = new SignatureEventRepository(db);
    this.documentRepository = new DocumentRepository(db);
    this.employeeRepository = new EmployeeRepository(db);
    this.fileStorageService = fileStorageService || new FileStorageService();
  }

  async createSignatureRequest(
    requestedBy: string,
    data: SignatureRequestDTO,
    ipAddress?: string,
    userAgent?: string
  ): Promise<SignatureRequest> {
    // Validate document exists
    const document = await this.documentRepository.getDocument(data.document_id);
    if (!document) {
      throw new Error('Document not found');
    }

    // Validate signer exists
    const signer = await this.employeeRepository.getEmployee(data.signer_id);
    if (!signer) {
      throw new Error('Signer not found');
    }

    // Create signature request
    const signatureRequest = await this.signatureRequestRepository.createSignatureRequest(requestedBy, data);

    // Log creation event
    await this.signatureEventRepository.createSignatureEvent(
      signatureRequest.id,
      'created',
      ipAddress,
      userAgent,
      {
        requestedBy,
        signerId: data.signer_id,
        documentTitle: data.document_title,
      }
    );

    // Send notification to signer
    await notificationService.sendNotification({
      employeeId: data.signer_id,
      title: 'Document Signature Request',
      message: `You have a new document to sign: ${data.document_title}`,
      type: 'info',
      channel: 'email',
      metadata: {
        signatureRequestId: signatureRequest.id,
        documentTitle: data.document_title,
      },
    } as any);

    return signatureRequest;
  }

  async signDocument(
    requestId: string,
    signature: SignatureData,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    // Get signature request
    const signatureRequest = await this.signatureRequestRepository.getSignatureRequest(requestId);
    if (!signatureRequest) {
      throw new Error('Signature request not found');
    }

    // Check if already signed
    if (signatureRequest.status !== 'pending') {
      throw new Error(`Cannot sign document with status: ${signatureRequest.status}`);
    }

    // Check if expired
    if (new Date(signatureRequest.expires_at) < new Date()) {
      await this.signatureRequestRepository.updateSignatureRequestStatus(requestId, 'expired');
      throw new Error('Signature request has expired');
    }

    // Log viewed event if not already logged
    const viewedEvents = await this.signatureEventRepository.getSignatureEventsByRequestAndType(requestId, 'viewed');
    if (viewedEvents.length === 0) {
      await this.signatureEventRepository.createSignatureEvent(
        requestId,
        'viewed',
        ipAddress,
        userAgent,
        { signerId: signatureRequest.signer_id }
      );
    }

    // Generate signed document
    const signedDocumentUrl = await this.generateSignedDocument(requestId, signature);

    // Update signature request status
    await this.signatureRequestRepository.updateSignatureRequestStatus(requestId, 'signed', signedDocumentUrl);

    // Log signed event
    await this.signatureEventRepository.createSignatureEvent(
      requestId,
      'signed',
      ipAddress,
      userAgent,
      {
        signerId: signatureRequest.signer_id,
        signatureMethod: signature.method,
        timestamp: signature.timestamp,
      }
    );

    // Lock document
    await this.lockDocument(signatureRequest.document_id);

    // Send notification to requester
    const requester = await this.employeeRepository.getEmployee(signatureRequest.requested_by);
    if (requester) {
      await notificationService.sendNotification({
        employeeId: signatureRequest.requested_by,
        title: 'Document Signed',
        message: `${signatureRequest.document_title} has been signed by the recipient`,
        type: 'success',
        channel: 'email',
        metadata: {
          signatureRequestId: requestId,
          documentTitle: signatureRequest.document_title,
        },
      } as any);
    }
  }

  async getSignatureStatus(requestId: string): Promise<SignatureStatus> {
    const signatureRequest = await this.signatureRequestRepository.getSignatureRequest(requestId);
    if (!signatureRequest) {
      throw new Error('Signature request not found');
    }

    return {
      id: signatureRequest.id,
      status: signatureRequest.status,
      signer_id: signatureRequest.signer_id,
      signed_at: signatureRequest.signed_at,
      signed_document_url: signatureRequest.signed_document_url,
      expires_at: signatureRequest.expires_at,
      created_at: signatureRequest.created_at,
    };
  }

  async generateSignedDocument(requestId: string, signature: SignatureData): Promise<string> {
    const signatureRequest = await this.signatureRequestRepository.getSignatureRequest(requestId);
    if (!signatureRequest) {
      throw new Error('Signature request not found');
    }

    // Get original document
    const document = await this.documentRepository.getDocument(signatureRequest.document_id);
    if (!document) {
      throw new Error('Document not found');
    }

    // Get signer info
    const signer = await this.employeeRepository.getEmployee(signatureRequest.signer_id);
    if (!signer) {
      throw new Error('Signer not found');
    }

    // Create signed document metadata
    const signedDocumentMetadata = {
      originalDocumentId: document.id,
      signatureRequestId: requestId,
      signerId: signer.id,
      signerName: `${signer.first_name} ${signer.last_name}`,
      signatureMethod: signature.method,
      signedAt: signature.timestamp,
      ipAddress: signature.ip_address,
    };

    // Store signed document in file storage
    const fileKey = `signed-documents/${requestId}/${Date.now()}-signed-${document.file_name}`;
    
    // For now, we'll store the signature metadata as a JSON file
    // In production, you'd generate an actual PDF with embedded signature
    const signedDocumentBuffer = Buffer.from(JSON.stringify(signedDocumentMetadata, null, 2));

    await this.fileStorageService.uploadFile(signedDocumentBuffer, fileKey, {
      category: FileCategory.CONTRACT,
      metadata: {
        originalDocumentId: document.id,
        signatureRequestId: requestId,
        signerId: signer.id,
        signerName: `${signer.first_name} ${signer.last_name}`,
        signatureMethod: signature.method,
      },
    });

    // Get signed URL
    const signedUrl = await this.fileStorageService.getSignedUrl(fileKey, 'getObject', { expiresIn: 86400 * 30 }); // 30 days

    return signedUrl;
  }

  async getAuditTrail(requestId: string): Promise<SignatureEvent[]> {
    const signatureRequest = await this.signatureRequestRepository.getSignatureRequest(requestId);
    if (!signatureRequest) {
      throw new Error('Signature request not found');
    }

    return this.signatureEventRepository.getAuditTrail(requestId);
  }

  async sendReminder(requestId: string): Promise<void> {
    const signatureRequest = await this.signatureRequestRepository.getSignatureRequest(requestId);
    if (!signatureRequest) {
      throw new Error('Signature request not found');
    }

    if (signatureRequest.status !== 'pending') {
      throw new Error('Can only send reminders for pending signature requests');
    }

    // Get signer
    const signer = await this.employeeRepository.getEmployee(signatureRequest.signer_id);
    if (!signer) {
      throw new Error('Signer not found');
    }

    // Send reminder notification
    await notificationService.sendNotification({
      employeeId: signatureRequest.signer_id,
      title: 'Signature Reminder',
      message: `Reminder: Please sign the document "${signatureRequest.document_title}" before it expires on ${new Date(signatureRequest.expires_at).toLocaleDateString()}`,
      type: 'warning',
      channel: 'email',
      metadata: {
        signatureRequestId: requestId,
        documentTitle: signatureRequest.document_title,
        expiresAt: signatureRequest.expires_at,
      },
    } as any);

    // Log reminder event
    await this.signatureEventRepository.createSignatureEvent(
      requestId,
      'reminder_sent',
      undefined,
      undefined,
      { signerId: signatureRequest.signer_id }
    );
  }

  async processReminderScheduling(hoursBeforeExpiry: number = 48): Promise<void> {
    const requestsNeedingReminder = await this.signatureRequestRepository.getSignatureRequestsNeedingReminder(hoursBeforeExpiry);

    for (const request of requestsNeedingReminder) {
      try {
        // Check if reminder already sent
        const reminderEvents = await this.signatureEventRepository.getSignatureEventsByRequestAndType(request.id, 'reminder_sent');
        if (reminderEvents.length === 0) {
          await this.sendReminder(request.id);
        }
      } catch (error) {
        logger.error('Failed to send reminder for signature request', { requestId: request.id, error: error instanceof Error ? error.message : String(error) });
      }
    }
  }

  async markExpiredRequests(): Promise<number> {
    return this.signatureRequestRepository.markExpiredRequests();
  }

  async getSignatureRequestsBySigner(signerId: string): Promise<SignatureRequest[]> {
    return this.signatureRequestRepository.getSignatureRequestsBySigner(signerId);
  }

  async getSignatureRequestsByRequester(requesterId: string): Promise<SignatureRequest[]> {
    return this.signatureRequestRepository.getSignatureRequestsByRequester(requesterId);
  }

  async getPendingSignatureRequests(): Promise<SignatureRequest[]> {
    return this.signatureRequestRepository.getPendingSignatureRequests();
  }

  private async lockDocument(documentId: string): Promise<void> {
    // Mark document as locked by updating metadata or creating a lock record
    // For now, we'll just log this action
    // In a full implementation, you might add a 'locked' field to documents table
    logger.info('Document locked after signature completion', { documentId });
  }
}
