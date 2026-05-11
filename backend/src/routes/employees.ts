import { Router, RequestHandler } from 'express';
import * as employeeController from '../controllers/employeeController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// requireRole uses AuthenticatedRequest which is not directly assignable to RequestHandler
const role = (...roles: string[]) => requireRole(roles) as unknown as RequestHandler;

// All routes require authentication
router.use(authenticateToken as RequestHandler);

// ⚠️  Route ordering matters: /search MUST come before /:id or Express will route
//    "GET /search" into the /:id handler with id='search'. Do not reorder.
router.post('/', role('super_admin', 'hr_manager'), employeeController.createEmployee);
router.get('/', employeeController.getAllEmployees);

// /search, /import, /export before /:id — see ordering note above
router.get('/search', employeeController.searchEmployees);
router.post('/import', role('super_admin', 'hr_manager'), employeeController.upload.single('file'), employeeController.importEmployees);
router.get('/export', role('super_admin', 'hr_manager'), employeeController.exportEmployees);
// Photo upload — must come before /:id to avoid being swallowed by it
router.post('/:id/photo', role('super_admin', 'hr_manager'), employeeController.upload.single('photo'), employeeController.uploadEmployeePhoto);

// ⚠️  /audit-logs must precede /:id — see ordering note at top
router.get('/:id/audit-logs', employeeController.getEmployeeAuditLogs);

router.get('/:id', employeeController.getEmployee);
router.put('/:id', role('super_admin', 'hr_manager'), employeeController.updateEmployee);
router.put('/:id/status', role('super_admin', 'hr_manager', 'department_manager'), employeeController.updateEmployeeStatus);
router.delete('/:id', role('super_admin', 'hr_manager'), employeeController.deleteEmployee);

// Emergency Contact endpoints — contactId nested under employeeId for ownership enforcement
router.post('/:employeeId/emergency-contacts', role('super_admin', 'hr_manager', 'department_manager'), employeeController.addEmergencyContact);
router.get('/:employeeId/emergency-contacts', employeeController.getEmergencyContacts);
router.put('/:employeeId/emergency-contacts/:contactId', role('super_admin', 'hr_manager', 'department_manager'), employeeController.updateEmergencyContact);
router.delete('/:employeeId/emergency-contacts/:contactId', role('super_admin', 'hr_manager', 'department_manager'), employeeController.deleteEmergencyContact);

// Employment History endpoints
router.post('/:employeeId/employment-history', role('super_admin', 'hr_manager'), employeeController.addEmploymentHistory);
router.get('/:employeeId/employment-history', employeeController.getEmploymentHistory);

export default router;
