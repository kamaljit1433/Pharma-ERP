import { Request, Response } from 'express';
import { Knex } from 'knex';
import { DocumentService } from '../services/documentService';
import { FileStorageService } from '../services/fileStorageService';
import { UserRole } from '../types/auth';
import knex from '../config/knex';

export class DocumentController {
  private documentService: DocumentService;
  private fileStorageService: FileStorageService;

  constructor(database?: Knex) {
    const db = database || knex;
    this.fileStorageService = new FileStorageService();
    this.documentService = new DocumentService(db, this.fileStorageService);
  }

  /**
   * POST /api/v1/documents
   * Upload a document
   */
  async uploadDocument(req: Request, res: Response): Promise<void> {
    try {
      const uploadedBy = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      // Check if file is provided
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file provided',
        });
        return;
      }

      const { document_type, document_name, issue_date, expiry_date, employee_id } = req.body;

      // Validate required fields
      if (!document_type) {
        res.status(400).json({
          success: false,
          message: 'Missing required field: document_type',
        });
        return;
      }

      // HR/Admin can upload for a specific employee; others upload for themselves
      const employeeId = employee_id || uploadedBy;

      const document = await this.documentService.uploadDocument(
        employeeId,
        {
          document_type,
          file: req.file.buffer,
          file_name: document_name || req.file.originalname,
          mime_type: req.file.mimetype,
          issue_date: issue_date || undefined,
          expiry_date: expiry_date || undefined,
        },
        uploadedBy,
        userRole
      );

      res.status(201).json({
        success: true,
        data: document,
        message: 'Document uploaded successfully',
      });
    } catch (error: any) {
      if (error.message.includes('permission')) {
        res.status(403).json({
          success: false,
          message: error.message,
        });
      } else if (error.message.includes('File')) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: error.message || 'Failed to upload document',
        });
      }
    }
  }

  /**
   * GET /api/v1/documents/:id
   * Get a specific document
   */
  async getDocument(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;
      const requestedBy = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      const document = await this.documentService.getDocument(id, requestedBy, userRole);

      res.status(200).json({
        success: true,
        data: document,
      });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else if (error.message.includes('permission')) {
        res.status(403).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: error.message || 'Failed to fetch document',
        });
      }
    }
  }

  /**
   * DELETE /api/v1/documents/:id
   * Soft-delete a document
   */
  async deleteDocument(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;
      const deletedBy = (req as any).user.id as string;
      const userRole = (req as any).user.role;

      await this.documentService.deleteDocument(id, deletedBy, userRole);

      res.status(200).json({
        success: true,
        message: 'Document deleted successfully',
      });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        res.status(404).json({ success: false, message: error.message });
      } else if (error.message.includes('permission')) {
        res.status(403).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: error.message || 'Failed to delete document' });
      }
    }
  }

  /**
   * GET /api/v1/documents/:id/download
   * Redirect to the document's stored file URL
   */
  async downloadDocument(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;
      const requestedBy = (req as any).user.id as string;
      const userRole = (req as any).user.role;

      const doc = await this.documentService.getDocument(id, requestedBy, userRole);

      if (!doc.file_url) {
        res.status(404).json({ success: false, message: 'File not found for this document' });
        return;
      }

      res.redirect(doc.file_url);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        res.status(404).json({ success: false, message: error.message });
      } else if (error.message.includes('permission')) {
        res.status(403).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: error.message || 'Failed to download document' });
      }
    }
  }

  /**
   * GET /api/v1/documents/expiring
   * Get expiring documents (HR/Finance/Admin only)
   */
  async getExpiringDocuments(req: Request, res: Response): Promise<void> {
    try {
      const userRole = (req as any).user?.role;
      const days = req.query['days'] ? parseInt(req.query['days'] as string) : 30;

      // Validate days parameter
      if (isNaN(days) || days <= 0) {
        res.status(400).json({
          success: false,
          message: 'Days parameter must be a positive number',
        });
        return;
      }

      const expiringDocuments = await this.documentService.getExpiringDocuments(days);

      res.status(200).json({
        success: true,
        data: expiringDocuments,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch expiring documents',
      });
    }
  }
}

export default new DocumentController();
