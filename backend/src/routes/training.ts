import { Router } from 'express';
import { TrainingController } from '../controllers/trainingController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Training Program Routes
router.post('/programs', authorize(['Super Admin', 'HR Manager']), TrainingController.createTrainingProgram);
router.get('/programs', TrainingController.getAllTrainingPrograms);
router.get('/programs/:id', TrainingController.getTrainingProgram);
router.put('/programs/:id', authorize(['Super Admin', 'HR Manager']), TrainingController.updateTrainingProgram);
router.delete('/programs/:id', authorize(['Super Admin', 'HR Manager']), TrainingController.deleteTrainingProgram);

// Training Enrollment Routes
router.post('/enroll', authorize(['Super Admin', 'HR Manager', 'Employee']), TrainingController.enrollEmployee);
router.get('/enrollments/:employeeId', TrainingController.getEmployeeEnrollments);
router.put('/enrollments/:enrollmentId/complete', authorize(['Super Admin', 'HR Manager']), TrainingController.markEnrollmentComplete);

// Certification Routes
router.post('/certifications', authorize(['Super Admin', 'HR Manager', 'Employee']), TrainingController.addCertification);
router.get('/certifications/:employeeId', TrainingController.getEmployeeCertifications);
router.get('/certifications/expiring', authorize(['Super Admin', 'HR Manager']), TrainingController.getExpiringCertifications);
router.put('/certifications/:id', authorize(['Super Admin', 'HR Manager', 'Employee']), TrainingController.updateCertification);

// Skill Routes
router.post('/skills', authorize(['Super Admin', 'HR Manager']), TrainingController.createSkill);
router.get('/skills', TrainingController.getAllSkills);
router.get('/skills/category/:category', TrainingController.getSkillsByCategory);

// Employee Skill Routes
router.post('/employee-skills', authorize(['Super Admin', 'HR Manager']), TrainingController.addEmployeeSkill);
router.get('/employee-skills/:employeeId', TrainingController.getEmployeeSkills);
router.put('/employee-skills/:id', authorize(['Super Admin', 'HR Manager']), TrainingController.updateEmployeeSkill);

// Skill Gap Report
router.get('/skill-gap/:departmentId', authorize(['Super Admin', 'HR Manager', 'Department Manager']), TrainingController.generateSkillGapReport);

// Bulk enrollment
router.post('/bulk-enroll', authorize(['Super Admin', 'HR Manager']), TrainingController.bulkEnrollEmployees);

// Self-enrollment request
router.post('/self-enroll', authorize(['Employee']), TrainingController.requestSelfEnrollment);

// Training reminders (admin endpoint)
router.post('/reminders/send', authorize(['Super Admin', 'HR Manager']), TrainingController.sendTrainingReminders);

// Issue certificate
router.post('/enrollments/:enrollmentId/certificate', authorize(['Super Admin', 'HR Manager']), TrainingController.issueCertificate);

// Certification expiry alerts (admin endpoint)
router.post('/certifications/alerts/send', authorize(['Super Admin', 'HR Manager']), TrainingController.sendCertificationExpiryAlerts);

// Certification inventory
router.get('/certifications/inventory', authorize(['Super Admin', 'HR Manager']), TrainingController.getCertificationInventory);

// Team skill matrix
router.get('/team-skills/:departmentId', authorize(['Super Admin', 'HR Manager', 'Department Manager']), TrainingController.getTeamSkillMatrix);

export default router;
