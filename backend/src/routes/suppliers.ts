import { Router, Request, Response } from 'express';
import { Knex } from 'knex';
import { SupplierBuyerController } from '../controllers/supplierBuyerController';
import { authenticateToken } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

export function createSuppliersRoutes(knex: Knex): Router {
  const router = Router();
  const controller = new SupplierBuyerController(knex);

  // Middleware
  router.use(authenticateToken as any);

  // ============ Supplier/Buyer CRUD ============

  // Create supplier/buyer
  router.post('/', (req: Request, res: Response) =>
    controller.createSupplierBuyer(req, res)
  );

  // Get supplier/buyer by ID
  router.get('/:id', (req: Request, res: Response) =>
    controller.getSupplierBuyer(req, res)
  );

  // Get all supplier/buyers for current employee
  router.get('/', (req: Request, res: Response) =>
    controller.getSupplierBuyersByEmployee(req, res)
  );

  // Update supplier/buyer
  router.put('/:id', (req: Request, res: Response) =>
    controller.updateSupplierBuyer(req, res)
  );

  // Delete supplier/buyer
  router.delete('/:id', (req: Request, res: Response) =>
    controller.deleteSupplierBuyer(req, res)
  );

  // Search supplier/buyers
  router.get('/search', (req: Request, res: Response) =>
    controller.searchSupplierBuyers(req, res)
  );

  // Get supplier/buyer count
  router.get('/count', (req: Request, res: Response) =>
    controller.getSupplierBuyerCount(req, res)
  );

  // ============ Visit Management ============

  // Log visit for supplier/buyer
  router.post('/:id/visits', (req: Request, res: Response) =>
    controller.logVisit(req, res)
  );

  // Get visit history for supplier/buyer
  router.get('/:id/visits', (req: Request, res: Response) =>
    controller.getVisitHistory(req, res)
  );

  // Get recent visits for supplier/buyer
  router.get('/:id/visits/recent', (req: Request, res: Response) =>
    controller.getRecentVisits(req, res)
  );

  // Get visits by date range
  router.get('/:id/visits/date-range', (req: Request, res: Response) =>
    controller.getVisitsByDateRange(req, res)
  );

  // Get visit count for supplier/buyer
  router.get('/:id/visits/count', (req: Request, res: Response) =>
    controller.getVisitCount(req, res)
  );

  return router;
}
