import { Request, Response } from 'express';
import { ESignatureService } from '../services/esignatureService';
import { SignatureRequestDTO, SignatureData } from '../types/esignature';
import { Knex } from 'knex';

export class ESignatureController {
  private esignatureService: ESignatureService;

  constructor(db: Knex) {
    this.esignatureService = new ESignatureService(db);
  }

  async createSignatureRequest(req: Request, res: Response): Promise<void> {
    try {
      const { document_id, signer_id, document_title, expires_in_days } = req.body;
      const requestedBy = (req as any).user?.id;

      if (!requestedBy) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!document_id || !signer_id || !document_title) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const data: SignatureRequestDTO = {
        document_id,
        signer_id,
        document_title,
        expires_in_days,
      };

      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('user-agent');

      const signatureRequest = await this.esignatureService.createSignatureRequest(
        requestedBy,
        data,
        ipAddress,
        userAgent
      );

      res.status(201).json({
        success: true,
        data: signatureRequest,
      });
    } catch (error: any) {
      res.status(500).json({
        error: error.message || 'Failed to create signature request',
      });
    }
  }

  async signDocument(req: Request, res: Response): Promise<void> {
    try {
      const { requestId } = req.params;
      const { method, signature_content } = req.body;

      if (!requestId || !method || !signature_content) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const validMethods = ['drawn', 'typed', 'uploaded'];
      if (!validMethods.includes(method)) {
        res.status(400).json({ error: 'Invalid signature method' });
        return;
      }

      const signature: SignatureData = {
        method,
        signature_content,
        timestamp: new Date(),
        ip_address: req.ip || req.connection.remoteAddress,
        user_agent: req.get('user-agent'),
      };

      await this.esignatureService.signDocument(requestId, signature);

      res.status(200).json({
        success: true,
        message: 'Document signed successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        error: error.message || 'Failed to sign document',
      });
    }
  }

  async getSignatureStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ error: 'Signature request ID is required' });
        return;
      }

      const status = await this.esignatureService.getSignatureStatus(id);

      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error: any) {
      res.status(500).json({
        error: error.message || 'Failed to get signature status',
      });
    }
  }

  async getSignedDocument(req: Request, res: Response): Promise<void> {
    try {
      const { requestId } = req.params;

      if (!requestId) {
        res.status(400).json({ error: 'Signature request ID is required' });
        return;
      }

      const status = await this.esignatureService.getSignatureStatus(requestId);

      if (!status.signed_document_url) {
        res.status(404).json({ error: 'Signed document not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          document_url: status.signed_document_url,
          signed_at: status.signed_at,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        error: error.message || 'Failed to get signed document',
      });
    }
  }

  async getAuditTrail(req: Request, res: Response): Promise<void> {
    try {
      const { requestId } = req.params;

      if (!requestId) {
        res.status(400).json({ error: 'Signature request ID is required' });
        return;
      }

      const auditTrail = await this.esignatureService.getAuditTrail(requestId);

      res.status(200).json({
        success: true,
        data: auditTrail,
      });
    } catch (error: any) {
      res.status(500).json({
        error: error.message || 'Failed to get audit trail',
      });
    }
  }

  async sendReminder(req: Request, res: Response): Promise<void> {
    try {
      const { requestId } = req.params;

      if (!requestId) {
        res.status(400).json({ error: 'Signature request ID is required' });
        return;
      }

      await this.esignatureService.sendReminder(requestId);

      res.status(200).json({
        success: true,
        message: 'Reminder sent successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        error: error.message || 'Failed to send reminder',
      });
    }
  }

  async getSignatureRequestsBySigner(req: Request, res: Response): Promise<void> {
    try {
      const signerId = (req as any).user?.id;

      if (!signerId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const requests = await this.esignatureService.getSignatureRequestsBySigner(signerId);

      res.status(200).json({
        success: true,
        data: requests,
      });
    } catch (error: any) {
      res.status(500).json({
        error: error.message || 'Failed to get signature requests',
      });
    }
  }

  async getSignatureRequestsByRequester(req: Request, res: Response): Promise<void> {
    try {
      const requesterId = (req as any).user?.id;

      if (!requesterId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const requests = await this.esignatureService.getSignatureRequestsByRequester(requesterId);

      res.status(200).json({
        success: true,
        data: requests,
      });
    } catch (error: any) {
      res.status(500).json({
        error: error.message || 'Failed to get signature requests',
      });
    }
  }

  async getPendingSignatureRequests(req: Request, res: Response): Promise<void> {
    try {
      const requests = await this.esignatureService.getPendingSignatureRequests();

      res.status(200).json({
        success: true,
        data: requests,
      });
    } catch (error: any) {
      res.status(500).json({
        error: error.message || 'Failed to get pending signature requests',
      });
    }
  }
}
