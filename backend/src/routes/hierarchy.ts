import { Router, Request, Response } from 'express';
import { Knex } from 'knex';
import { HierarchyController } from '../controllers/hierarchyController';
import { authenticateToken } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

export function createHierarchyRoutes(knex: Knex): Router {
  const router = Router();
  const controller = new HierarchyController(knex);

  // Middleware
  router.use(authenticateToken as any);

  // ============ Department Management ============

  // Create department (Super Admin, HR Manager)
  router.post('/departments', authorize(['Super Admin', 'HR Manager']) as any, (req: Request, res: Response) =>
    controller.createDepartment(req, res)
  );

  // Get all departments
  router.get('/departments', (req: Request, res: Response) =>
    controller.getAllDepartments(req, res)
  );

  // Get specific department
  router.get('/departments/:id', (req: Request, res: Response) =>
    controller.getDepartment(req, res)
  );

  // Update department (Super Admin, HR Manager)
  router.put('/departments/:id', authorize(['Super Admin', 'HR Manager']) as any, (req: Request, res: Response) =>
    controller.updateDepartment(req, res)
  );

  // Delete department (Super Admin, HR Manager)
  router.delete('/departments/:id', authorize(['Super Admin', 'HR Manager']) as any, (req: Request, res: Response) =>
    controller.deleteDepartment(req, res)
  );

  // ============ Designation Management ============

  // Create designation (Super Admin, HR Manager)
  router.post('/designations', authorize(['Super Admin', 'HR Manager']) as any, (req: Request, res: Response) =>
    controller.createDesignation(req, res)
  );

  // Get all designations
  router.get('/designations', (req: Request, res: Response) =>
    controller.getAllDesignations(req, res)
  );

  // Get specific designation
  router.get('/designations/:id', (req: Request, res: Response) =>
    controller.getDesignation(req, res)
  );

  // Update designation (Super Admin, HR Manager)
  router.put('/designations/:id', authorize(['Super Admin', 'HR Manager']) as any, (req: Request, res: Response) =>
    controller.updateDesignation(req, res)
  );

  // Delete designation (Super Admin, HR Manager)
  router.delete('/designations/:id', authorize(['Super Admin', 'HR Manager']) as any, (req: Request, res: Response) =>
    controller.deleteDesignation(req, res)
  );

  // ============ Employee Position Assignment ============

  // Assign employee position (Super Admin, HR Manager)
  router.put('/assign', authorize(['Super Admin', 'HR Manager']) as any, (req: Request, res: Response) =>
    controller.assignEmployeePosition(req, res)
  );

  // ============ Hierarchy Queries ============

  // Get reporting chain for employee
  router.get('/reporting-chain/:employeeId', (req: Request, res: Response) =>
    controller.getReportingChain(req, res)
  );

  // Get direct reports for manager
  router.get('/direct-reports/:managerId', (req: Request, res: Response) =>
    controller.getDirectReports(req, res)
  );

  // Get org chart
  router.get('/org-chart', (req: Request, res: Response) =>
    controller.getOrgChart(req, res)
  );

  // Get hierarchy audit logs
  router.get('/audit-logs/:employeeId', authorize(['Super Admin', 'HR Manager']) as any, (req: Request, res: Response) =>
    controller.getHierarchyAuditLogs(req, res)
  );

  return router;
}
