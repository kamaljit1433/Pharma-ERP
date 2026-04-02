import { Router, RequestHandler } from 'express';
import * as employeeController from '../controllers/employeeController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// ⚠️  Route ordering matters: /search MUST come before /:id or Express will route
//    "GET /search" into the /:id handler with id='search'. Do not reorder.
router.post('/', requireRole(['super_admin', 'hr_manager']), employeeController.createEmployee);
router.get('/', employeeController.getAllEmployees);

// /search before /:id — see ordering note above
router.get('/search', employeeController.searchEmployees);
router.get('/:id', employeeController.getEmployee);
router.put('/:id', requireRole(['super_admin', 'hr_manager']), employeeController.updateEmployee);
router.put('/:id/status', requireRole(['super_admin', 'hr_manager', 'department_manager']), employeeController.updateEmployeeStatus as unknown as RequestHandler);

// Emergency Contact endpoints — contactId nested under employeeId for ownership enforcement
router.post('/:employeeId/emergency-contacts', employeeController.addEmergencyContact);
router.get('/:employeeId/emergency-contacts', employeeController.getEmergencyContacts);
router.put('/:employeeId/emergency-contacts/:contactId', employeeController.updateEmergencyContact);
router.delete('/:employeeId/emergency-contacts/:contactId', requireRole(['super_admin', 'hr_manager']), employeeController.deleteEmergencyContact as unknown as RequestHandler);

// Employment History endpoints
router.post('/:employeeId/employment-history', requireRole(['super_admin', 'hr_manager']), employeeController.addEmploymentHistory);
router.get('/:employeeId/employment-history', employeeController.getEmploymentHistory);

export default router;
