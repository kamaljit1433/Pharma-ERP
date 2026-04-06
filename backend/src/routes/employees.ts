import { Router, RequestHandler } from 'express';
import * as employeeController from '../controllers/employeeController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// ⚠️  Route ordering matters: /search MUST come before /:id or Express will route
//    "GET /search" into the /:id handler with id='search'. Do not reorder.
router.post('/', requireRole(['super_admin', 'hr_manager']) as unknown as RequestHandler, employeeController.createEmployee as unknown as RequestHandler);
router.get('/', employeeController.getAllEmployees as unknown as RequestHandler);

// /search before /:id — see ordering note above
router.get('/search', employeeController.searchEmployees as unknown as RequestHandler);
router.get('/:id', employeeController.getEmployee as unknown as RequestHandler);
router.put('/:id', requireRole(['super_admin', 'hr_manager']) as unknown as RequestHandler, employeeController.updateEmployee as unknown as RequestHandler);
router.put('/:id/status', requireRole(['super_admin', 'hr_manager', 'department_manager']) as unknown as RequestHandler, employeeController.updateEmployeeStatus as unknown as RequestHandler);

// Emergency Contact endpoints — contactId nested under employeeId for ownership enforcement
router.post('/:employeeId/emergency-contacts', employeeController.addEmergencyContact as unknown as RequestHandler);
router.get('/:employeeId/emergency-contacts', employeeController.getEmergencyContacts as unknown as RequestHandler);
router.put('/:employeeId/emergency-contacts/:contactId', employeeController.updateEmergencyContact as unknown as RequestHandler);
router.delete('/:employeeId/emergency-contacts/:contactId', requireRole(['super_admin', 'hr_manager']) as unknown as RequestHandler, employeeController.deleteEmergencyContact as unknown as RequestHandler);

// Employment History endpoints
router.post('/:employeeId/employment-history', requireRole(['super_admin', 'hr_manager']) as unknown as RequestHandler, employeeController.addEmploymentHistory as unknown as RequestHandler);
router.get('/:employeeId/employment-history', employeeController.getEmploymentHistory as unknown as RequestHandler);

export default router;
