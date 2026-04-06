import { Router, Request, Response } from 'express';
import { Knex } from 'knex';
import { DocumentController } from '../controllers/documentController';
import { authenticateToken } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { fileUpload } from '../middleware/fileUpload';
import knex from '../config/knex';

export function createDocumentRoutes(database?: Knex): Router {
  const router = Router();
  const db = database || knex;
  const controller = new DocumentController(db);

  // Middleware: All routes require authentication
  router.use(authenticateToken as any);

  /**
   * POST /api/v1/documents
   * Upload a document
   * Auth: Required (Employee, HR Manager, Super Admin)
   */
  router.post(
    '/',
    authorize(['Employee', 'HR Manager', 'Super Admin']) as any,
    fileUpload.single('file'),
    (req: Request, res: Response) => controller.uploadDocument(req, res)
  );

  /**
   * GET /api/v1/documents/:id
   * Get a specific document
   * Auth: Required (Employee can only view own, HR/Finance/Admin can view any)
   */
  router.get(
    '/:id',
    authorize(['Employee', 'HR Manager', 'Finance', 'Super Admin', 'Department Manager']) as any,
    (req: Request, res: Response) => controller.getDocument(req, res)
  );

  /**
   * GET /api/v1/documents/expiring
   * Get expiring documents
   * Auth: Required (HR Manager, Finance, Super Admin)
   * Query: ?days=30 (optional, default 30)
   */
  router.get(
    '/expiring',
    authorize(['HR Manager', 'Finance', 'Super Admin']) as any,
    (req: Request, res: Response) => controller.getExpiringDocuments(req, res)
  );

  return router;
}
