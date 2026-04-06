import { Router, Request, Response } from 'express';
import { ESignatureController } from '../controllers/esignatureController';
import { authenticateToken } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { Knex } from 'knex';

export function createESignatureRoutes(db: Knex): Router {
  const router = Router();
  const controller = new ESignatureController(db);

  // Create signature request (HR Manager, Super Admin)
  router.post(
    '/requests',
    authenticateToken as any,
    authorize(['HR_MANAGER', 'SUPER_ADMIN']) as any,
    (req: Request, res: Response) => controller.createSignatureRequest(req, res)
  );

  // Sign document (Any authenticated user)
  router.post(
    '/sign/:requestId',
    authenticateToken as any,
    (req: Request, res: Response) => controller.signDocument(req, res)
  );

  // Get signature status (Any authenticated user)
  router.get(
    '/requests/:id',
    authenticateToken as any,
    (req: Request, res: Response) => controller.getSignatureStatus(req, res)
  );

  // Get signed document (Any authenticated user)
  router.get(
    '/document/:requestId',
    authenticateToken as any,
    (req: Request, res: Response) => controller.getSignedDocument(req, res)
  );

  // Get audit trail (HR Manager, Super Admin, or requester)
  router.get(
    '/audit/:requestId',
    authenticateToken as any,
    (req: Request, res: Response) => controller.getAuditTrail(req, res)
  );

  // Send reminder (HR Manager, Super Admin)
  router.post(
    '/reminder/:requestId',
    authenticateToken as any,
    authorize(['HR_MANAGER', 'SUPER_ADMIN']) as any,
    (req: Request, res: Response) => controller.sendReminder(req, res)
  );

  // Get signature requests for current user as signer
  router.get(
    '/my-requests/to-sign',
    authenticateToken as any,
    (req: Request, res: Response) => controller.getSignatureRequestsBySigner(req, res)
  );

  // Get signature requests for current user as requester
  router.get(
    '/my-requests/requested',
    authenticateToken as any,
    (req: Request, res: Response) => controller.getSignatureRequestsByRequester(req, res)
  );

  // Get all pending signature requests (Super Admin, HR Manager)
  router.get(
    '/pending',
    authenticateToken as any,
    authorize(['HR_MANAGER', 'SUPER_ADMIN']) as any,
    (req: Request, res: Response) => controller.getPendingSignatureRequests(req, res)
  );

  return router;
}
