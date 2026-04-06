import { Router } from 'express';
import * as separationController from '../controllers/separationController';
import { authenticateToken } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();

// All routes require authentication
router.use(authenticateToken as any);

/**
 * Resignation endpoints
 * POST /api/v1/separation/resignation - Submit resignation
 */
router.post('/resignation', authorize(['HR Manager', 'Employee']) as any, async (req, res, next) => {
  const { employeeId } = req.body;
  if (!employeeId) {
    return res.status(400).json({
      success: false,
      message: 'employeeId is required in request body',
    });
  }
  req.params.employeeId = employeeId;
  separationController.submitResignation(req, res, next);
});

// Get resignation
router.get('/resignation/:resignationId', authorize(['HR Manager', 'Super Admin']) as any, separationController.getResignation);

// Accept resignation
router.put(
  '/resignation/:resignationId/accept',
  authorize(['HR Manager', 'Super Admin']) as any,
  separationController.acceptResignation
);

// Reject resignation
router.put(
  '/resignation/:resignationId/reject',
  authorize(['HR Manager', 'Super Admin']) as any,
  separationController.rejectResignation
);

/**
 * Termination endpoints
 * POST /api/v1/separation/termination - Initiate termination
 */
router.post('/termination', authorize(['HR Manager', 'Super Admin']) as any, async (req, res, next) => {
  const { employeeId } = req.body;
  if (!employeeId) {
    return res.status(400).json({
      success: false,
      message: 'employeeId is required in request body',
    });
  }
  req.params.employeeId = employeeId;
  separationController.initiateTermination(req, res, next);
});

/**
 * Exit Interview endpoints
 * POST /api/v1/separation/exit-interview - Schedule exit interview
 */
router.post('/exit-interview', authorize(['HR Manager', 'Super Admin']) as any, async (req, res, next) => {
  const { employeeId } = req.body;
  if (!employeeId) {
    return res.status(400).json({
      success: false,
      message: 'employeeId is required in request body',
    });
  }
  req.params.employeeId = employeeId;
  separationController.scheduleExitInterview(req, res, next);
});

// Complete exit interview
router.put(
  '/exit-interview/:exitInterviewId/complete',
  authorize(['HR Manager', 'Super Admin']) as any,
  separationController.completeExitInterview
);

/**
 * F&F Settlement endpoints
 * GET /api/v1/separation/fnf/:employeeId - Calculate F&F
 * PUT /api/v1/separation/fnf/:id/submit - Submit for approval
 * PUT /api/v1/separation/fnf/:id/approve - Approve F&F
 * PUT /api/v1/separation/fnf/:id/reject - Reject F&F
 */
router.get(
  '/fnf/:employeeId',
  authorize(['Finance / Payroll', 'HR Manager', 'Super Admin']) as any,
  separationController.calculateFnFSettlement
);

router.put(
  '/fnf/:id/submit',
  authorize(['Finance / Payroll', 'HR Manager', 'Super Admin']) as any,
  async (req, res, next) => {
    req.params.fnfSettlementId = req.params.id;
    separationController.submitFnFSettlementForApproval(req, res, next);
  }
);

router.put(
  '/fnf/:id/approve',
  authorize(['Finance / Payroll', 'Super Admin']) as any,
  async (req, res, next) => {
    req.params.fnfSettlementId = req.params.id;
    separationController.approveFnFSettlement(req, res, next);
  }
);

router.put(
  '/fnf/:id/reject',
  authorize(['Finance / Payroll', 'Super Admin']) as any,
  async (req, res, next) => {
    req.params.fnfSettlementId = req.params.id;
    separationController.rejectFnFSettlement(req, res, next);
  }
);

/**
 * Asset Recovery endpoints
 * GET /api/v1/separation/asset-recovery/:employeeId - Get asset checklist
 */
router.get(
  '/asset-recovery/:employeeId',
  authorize(['HR Manager', 'Super Admin']) as any,
  separationController.getAssetRecoveryChecklist
);

// Update asset recovery status
router.put(
  '/asset-recovery/:assetRecoveryId',
  authorize(['HR Manager', 'Super Admin']) as any,
  separationController.updateAssetRecoveryStatus
);

/**
 * Offboarding endpoints
 */

// Check offboarding preconditions
router.get(
  '/offboarding-check/:employeeId',
  authorize(['HR Manager', 'Super Admin']) as any,
  separationController.checkOffboardingPreconditions
);

/**
 * Deactivate employee
 * PUT /api/v1/separation/deactivate/:employeeId - Deactivate employee
 */
router.put(
  '/deactivate/:employeeId',
  authorize(['HR Manager', 'Super Admin']) as any,
  separationController.deactivateEmployee
);

/**
 * Questionnaire Template endpoints
 * POST /api/v1/separation/questionnaire-templates - Create template
 * GET /api/v1/separation/questionnaire-templates - List templates
 * GET /api/v1/separation/questionnaire-templates/active - Get active templates
 * GET /api/v1/separation/questionnaire-templates/:id - Get template
 * PUT /api/v1/separation/questionnaire-templates/:id - Update template
 * DELETE /api/v1/separation/questionnaire-templates/:id - Delete template
 */
router.post(
  '/questionnaire-templates',
  authorize(['HR Manager', 'Super Admin']) as any,
  separationController.createQuestionnaireTemplate
);

router.get(
  '/questionnaire-templates/active',
  authorize(['HR Manager', 'Employee', 'Super Admin']) as any,
  separationController.getActiveQuestionnaireTemplates
);

router.get(
  '/questionnaire-templates',
  authorize(['HR Manager', 'Super Admin']) as any,
  separationController.getAllQuestionnaireTemplates
);

router.get(
  '/questionnaire-templates/:id',
  authorize(['HR Manager', 'Employee', 'Super Admin']) as any,
  separationController.getQuestionnaireTemplate
);

router.put(
  '/questionnaire-templates/:id',
  authorize(['HR Manager', 'Super Admin']) as any,
  separationController.updateQuestionnaireTemplate
);

router.delete(
  '/questionnaire-templates/:id',
  authorize(['HR Manager', 'Super Admin']) as any,
  separationController.deleteQuestionnaireTemplate
);

/**
 * Questionnaire Template Question endpoints
 * POST /api/v1/separation/questionnaire-templates/:id/questions - Add question
 * PUT /api/v1/separation/questionnaire-templates/:id/questions/:questionId - Update question
 * DELETE /api/v1/separation/questionnaire-templates/:id/questions/:questionId - Remove question
 */
router.post(
  '/questionnaire-templates/:id/questions',
  authorize(['HR Manager', 'Super Admin']) as any,
  separationController.addQuestionToTemplate
);

router.put(
  '/questionnaire-templates/:id/questions/:questionId',
  authorize(['HR Manager', 'Super Admin']) as any,
  separationController.updateQuestionInTemplate
);

router.delete(
  '/questionnaire-templates/:id/questions/:questionId',
  authorize(['HR Manager', 'Super Admin']) as any,
  separationController.removeQuestionFromTemplate
);

export default router;
