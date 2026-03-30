import { Router } from 'express';
import * as employeeController from '../controllers/employeeController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken as any);

// Employee CRUD endpoints
router.post('/', employeeController.createEmployee);
router.get('/', employeeController.getAllEmployees);
router.get('/search', employeeController.searchEmployees);
router.get('/:id', employeeController.getEmployee);
router.put('/:id', employeeController.updateEmployee);
router.put('/:id/status', employeeController.updateEmployeeStatus);

// Emergency Contact endpoints
router.post('/:employeeId/emergency-contacts', employeeController.addEmergencyContact);
router.get('/:employeeId/emergency-contacts', employeeController.getEmergencyContacts);
router.put('/emergency-contacts/:contactId', employeeController.updateEmergencyContact);
router.delete('/emergency-contacts/:contactId', employeeController.deleteEmergencyContact);

// Employment History endpoints
router.post('/:employeeId/employment-history', employeeController.addEmploymentHistory);
router.get('/:employeeId/employment-history', employeeController.getEmploymentHistory);

export default router;
