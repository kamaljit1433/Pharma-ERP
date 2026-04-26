import { Router, Request, Response } from 'express';
import { Knex } from 'knex';
import { DocumentController } from '../controllers/documentController';
import { authenticateToken } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { UserRole } from '../types/auth';
import { upload as fileUpload } from '../middleware/fileUpload';
import knex from '../config/knex';

export function createDocumentRoutes(database?: Knex): Router {
  const router = Router();
  const db = database || knex;
  const controller = new DocumentController(db);

  // Middleware: All routes require authentication
  router.use(authenticateToken as any);

  /**
   * GET /api/v1/documents/employee/:employeeId
   * Get all documents for a specific employee
   */
  router.get(
    '/employee/:employeeId',
    authorize(['Employee', UserRole.HR_MANAGER, UserRole.FINANCE, UserRole.SUPER_ADMIN, 'Department Manager']) as any,
    async (req: Request, res: Response) => {
      try {
        const { employeeId } = req.params;
        const docs = await db('documents')
          .select(
            'id',
            'file_name as name',
            'document_type as type',
            'file_url',
            'expiry_date',
            db.raw("'active' as status"),
            'created_at as uploaded_at'
          )
          .where('employee_id', employeeId)
          .where('is_active', true)
          .orderBy('created_at', 'desc');
        res.status(200).json({ success: true, data: docs });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    }
  );

  // ⚠️  /expiring MUST come before /:id or Express routes "GET /expiring" to /:id with id='expiring'
  /**
   * GET /api/v1/documents/expiring
   * Get expiring documents
   * Auth: Required (HR Manager, Finance, Super Admin)
   * Query: ?days=30 (optional, default 30)
   */
  router.get(
    '/expiring',
    authorize([UserRole.HR_MANAGER, UserRole.FINANCE, UserRole.SUPER_ADMIN]) as any,
    (req: Request, res: Response) => controller.getExpiringDocuments(req, res)
  );

  /**
   * POST /api/v1/documents
   * Upload a document
   * Auth: Required (Employee, HR Manager, Super Admin)
   */
  router.post(
    '/',
    authorize(['Employee', UserRole.HR_MANAGER, UserRole.SUPER_ADMIN]) as any,
    fileUpload.single('file'),
    (req: Request, res: Response) => controller.uploadDocument(req, res)
  );

  /**
   * GET /api/v1/documents/:id/download
   * Download a document (redirects to file URL)
   * Auth: Required
   */
  router.get(
    '/:id/download',
    authorize(['Employee', UserRole.HR_MANAGER, UserRole.FINANCE, UserRole.SUPER_ADMIN, 'Department Manager']) as any,
    (req: Request, res: Response) => controller.downloadDocument(req, res)
  );

  /**
   * DELETE /api/v1/documents/:id
   * Soft-delete a document
   * Auth: Required (Employee can delete own, HR/Admin can delete any)
   */
  router.delete(
    '/:id',
    authorize(['Employee', UserRole.HR_MANAGER, UserRole.SUPER_ADMIN]) as any,
    (req: Request, res: Response) => controller.deleteDocument(req, res)
  );

  /**
   * GET /api/v1/documents/:id
   * Get a specific document
   * Auth: Required (Employee can only view own, HR/Finance/Admin can view any)
   */
  router.get(
    '/:id',
    authorize(['Employee', UserRole.HR_MANAGER, UserRole.FINANCE, UserRole.SUPER_ADMIN, 'Department Manager']) as any,
    (req: Request, res: Response) => controller.getDocument(req, res)
  );

  return router;
}
