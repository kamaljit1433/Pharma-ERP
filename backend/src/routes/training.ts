import { Router } from 'express';
import { TrainingController } from '../controllers/trainingController';
import { authenticateToken } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { UserRole } from '../types/auth';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken as any);

router.post('/programs', authorize([UserRole.SUPER_ADMIN, UserRole.HR_MANAGER]) as any, TrainingController.createTrainingProgram);
router.get('/programs', TrainingController.getAllTrainingPrograms);
router.get('/programs/:id', TrainingController.getTrainingProgram);
router.put('/programs/:id', authorize([UserRole.SUPER_ADMIN, UserRole.HR_MANAGER]) as any, TrainingController.updateTrainingProgram);
router.delete('/programs/:id', authorize([UserRole.SUPER_ADMIN, UserRole.HR_MANAGER]) as any, TrainingController.deleteTrainingProgram);

// Training Enrollment Routes
router.post('/enroll', authorize([UserRole.SUPER_ADMIN, UserRole.HR_MANAGER, UserRole.EMPLOYEE]) as any, TrainingController.enrollEmployee);
router.get('/enrollments/:employeeId', TrainingController.getEmployeeEnrollments);
router.put('/enrollments/:enrollmentId/complete', authorize([UserRole.SUPER_ADMIN, UserRole.HR_MANAGER]) as any, TrainingController.markEnrollmentComplete);

// Certification Routes
router.post('/certifications', authorize([UserRole.SUPER_ADMIN, UserRole.HR_MANAGER, UserRole.EMPLOYEE]) as any, TrainingController.addCertification);
// Static routes MUST come before parameterized /:id routes to avoid Express matching them as the param
router.get('/certifications/expiring', authorize([UserRole.SUPER_ADMIN, UserRole.HR_MANAGER]) as any, TrainingController.getExpiringCertifications);
router.get('/certifications/inventory', authorize([UserRole.SUPER_ADMIN, UserRole.HR_MANAGER]) as any, TrainingController.getCertificationInventory);
router.get('/certifications/:employeeId', TrainingController.getEmployeeCertifications);
router.put('/certifications/:id', authorize([UserRole.SUPER_ADMIN, UserRole.HR_MANAGER, UserRole.EMPLOYEE]) as any, TrainingController.updateCertification);

// Skill Routes
router.post('/skills', authorize([UserRole.SUPER_ADMIN, UserRole.HR_MANAGER]) as any, TrainingController.createSkill);
router.get('/skills', TrainingController.getAllSkills);
router.get('/skills/category/:category', TrainingController.getSkillsByCategory);

// Employee Skill Routes
router.post('/employee-skills', authorize([UserRole.SUPER_ADMIN, UserRole.HR_MANAGER]) as any, TrainingController.addEmployeeSkill);
router.get('/employee-skills/:employeeId', TrainingController.getEmployeeSkills);
router.put('/employee-skills/:id', authorize([UserRole.SUPER_ADMIN, UserRole.HR_MANAGER]) as any, TrainingController.updateEmployeeSkill);

// Skill Gap Report
router.get('/skill-gap/:departmentId', authorize([UserRole.SUPER_ADMIN, UserRole.HR_MANAGER, UserRole.DEPARTMENT_MANAGER]) as any, TrainingController.generateSkillGapReport);

// Bulk enrollment
router.post('/bulk-enroll', authorize([UserRole.SUPER_ADMIN, UserRole.HR_MANAGER]) as any, TrainingController.bulkEnrollEmployees);

// Self-enrollment request
router.post('/self-enroll', authorize([UserRole.EMPLOYEE]) as any, TrainingController.requestSelfEnrollment);

// Training reminders (admin endpoint)
router.post('/reminders/send', authorize([UserRole.SUPER_ADMIN, UserRole.HR_MANAGER]) as any, TrainingController.sendTrainingReminders);

// Issue certificate
router.post('/enrollments/:enrollmentId/certificate', authorize([UserRole.SUPER_ADMIN, UserRole.HR_MANAGER]) as any, TrainingController.issueCertificate);

// Certification expiry alerts (admin endpoint)
router.post('/certifications/alerts/send', authorize([UserRole.SUPER_ADMIN, UserRole.HR_MANAGER]) as any, TrainingController.sendCertificationExpiryAlerts);

// Team skill matrix
router.get('/team-skills/:departmentId', authorize([UserRole.SUPER_ADMIN, UserRole.HR_MANAGER, UserRole.DEPARTMENT_MANAGER]) as any, TrainingController.getTeamSkillMatrix);

export default router;
