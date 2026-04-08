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
      const employeeId = (req as any).user?.id;
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

      const { document_type, issue_date, expiry_date } = req.body;

      // Validate required fields
      if (!document_type) {
        res.status(400).json({
          success: false,
          message: 'Missing required field: document_type',
        });
        return;
      }

      const document = await this.documentService.uploadDocument(
        employeeId,
        {
          document_type,
          file: req.file.buffer,
          file_name: req.file.originalname,
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
