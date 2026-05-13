import { Request, Response, NextFunction } from 'express';
import { SeparationService } from '../services/separationService';
import { getKnexInstance } from '../config/knex';

const db = getKnexInstance();
const separationService = new SeparationService(db);

/**
 * Submit resignation
 * POST /api/v1/separation/resignation
 */
export const submitResignation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = req.params['employeeId'] as string;
    const { resignation_date, last_working_day, reason } = req.body;

    if (!resignation_date || !last_working_day) {
      return res.status(400).json({
        success: false,
        message: 'resignation_date and last_working_day are required',
      });
    }

    const resignation = await separationService.submitResignation(employeeId, {
      resignation_date: new Date(resignation_date),
      last_working_day: new Date(last_working_day),
      reason,
    });

    res.status(201).json({
      success: true,
      data: resignation,
      message: 'Resignation submitted successfully',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Initiate termination
 * POST /api/v1/separation/termination
 */
export const initiateTermination = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = req.params['employeeId'] as string;
    const { termination_date, reason, termination_type, final_settlement_date } = req.body;

    if (!termination_date || !reason) {
      return res.status(400).json({
        success: false,
        message: 'termination_date and reason are required',
      });
    }

    const termination = await separationService.initiateTermination(
      employeeId,
      new Date(termination_date),
      reason,
      termination_type,
      final_settlement_date ? new Date(final_settlement_date) : undefined
    );

    res.status(201).json({
      success: true,
      data: termination,
      message: 'Termination initiated successfully',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get resignation
 * GET /api/v1/separation/resignation/:resignationId
 */
export const getResignation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resignationId = req.params['resignationId'] as string;
    const resignation = await separationService.getResignation(resignationId);

    if (!resignation) {
      return res.status(404).json({
        success: false,
        message: 'Resignation not found',
      });
    }

    res.status(200).json({
      success: true,
      data: resignation,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Accept resignation
 * PUT /api/v1/separation/resignation/:resignationId/accept
 */
export const acceptResignation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resignationId = req.params['resignationId'] as string;
    const { acceptedBy } = req.body;

    if (!acceptedBy) {
      return res.status(400).json({
        success: false,
        message: 'acceptedBy is required',
      });
    }

    const resignation = await separationService.acceptResignation(resignationId, acceptedBy);

    res.status(200).json({
      success: true,
      data: resignation,
      message: 'Resignation accepted successfully',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Reject resignation
 * PUT /api/v1/separation/resignation/:resignationId/reject
 */
export const rejectResignation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resignationId = req.params['resignationId'] as string;
    const resignation = await separationService.rejectResignation(resignationId);

    res.status(200).json({
      success: true,
      data: resignation,
      message: 'Resignation rejected successfully',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Schedule exit interview
 * POST /api/v1/separation/exit-interview
 */
export const scheduleExitInterview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = req.params['employeeId'] as string;
    const { scheduled_at } = req.body;

    if (!scheduled_at) {
      return res.status(400).json({
        success: false,
        message: 'scheduled_at is required',
      });
    }

    const exitInterview = await separationService.scheduleExitInterview(
      employeeId,
      new Date(scheduled_at)
    );

    res.status(201).json({
      success: true,
      data: exitInterview,
      message: 'Exit interview scheduled successfully',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get all exit interviews for an employee
 * GET /api/v1/separation/exit-interview/employee/:employeeId
 */
export const getExitInterviewsByEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = req.params['employeeId'] as string;
    const interviews = await separationService.getExitInterviewsByEmployeeId(employeeId);
    res.status(200).json({ success: true, data: interviews });
  } catch (error) {
    return next(error);
  }
};

/**
 * Complete exit interview
 * PUT /api/v1/separation/exit-interview/:exitInterviewId/complete
 */
export const completeExitInterview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const exitInterviewId = req.params['exitInterviewId'] as string;
    const { conducted_by, questionnaire_responses, feedback } = req.body;

    if (!conducted_by || !feedback) {
      return res.status(400).json({
        success: false,
        message: 'conducted_by and feedback are required',
      });
    }

    const exitInterview = await separationService.completeExitInterview(
      exitInterviewId,
      conducted_by,
      questionnaire_responses || {},
      feedback
    );

    res.status(200).json({
      success: true,
      data: exitInterview,
      message: 'Exit interview completed successfully',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Calculate F&F Settlement
 * GET /api/v1/separation/fnf/:employeeId
 */
export const calculateFnFSettlement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = req.params['employeeId'] as string;
    const fnfSettlement = await separationService.calculateFnFSettlement(employeeId);

    res.status(200).json({
      success: true,
      data: fnfSettlement,
      message: 'F&F settlement calculated successfully',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Submit F&F Settlement for Approval
 * PUT /api/v1/separation/fnf/:fnfSettlementId/submit
 */
export const submitFnFSettlementForApproval = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fnfSettlementId = req.params['fnfSettlementId'];
    
    if (!fnfSettlementId) {
      return res.status(400).json({
        success: false,
        message: 'fnfSettlementId is required',
      });
    }

    const fnfSettlement = await separationService.submitFnFSettlementForApproval(fnfSettlementId);

    res.status(200).json({
      success: true,
      data: fnfSettlement,
      message: 'F&F settlement submitted for approval successfully',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Approve F&F Settlement
 * PUT /api/v1/separation/fnf/:fnfSettlementId/approve
 */
export const approveFnFSettlement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fnfSettlementId = req.params['fnfSettlementId'];
    const { approvedBy } = req.body;

    if (!fnfSettlementId) {
      return res.status(400).json({
        success: false,
        message: 'fnfSettlementId is required',
      });
    }

    if (!approvedBy) {
      return res.status(400).json({
        success: false,
        message: 'approvedBy is required',
      });
    }

    const fnfSettlement = await separationService.approveFnFSettlement(fnfSettlementId, approvedBy);

    res.status(200).json({
      success: true,
      data: fnfSettlement,
      message: 'F&F settlement approved successfully',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update F&F Settlement (draft only)
 * PUT /api/v1/separation/fnf/:fnfSettlementId/update
 */
export const updateFnFSettlement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fnfSettlementId = req.params['fnfSettlementId'];
    const { bonus, other_benefits, other_deductions, pending_salary, leave_encashment, gratuity, advance_deduction } = req.body;

    const updated = await separationService.updateFnFDraft(fnfSettlementId, {
      bonus,
      other_benefits,
      other_deductions,
      pending_salary,
      leave_encashment,
      gratuity,
      advance_deduction,
    });

    res.status(200).json({ success: true, data: updated, message: 'F&F settlement updated successfully' });
  } catch (error) {
    return next(error);
  }
};

/**
 * Mark F&F Settlement as Paid
 * PUT /api/v1/separation/fnf/:fnfSettlementId/paid
 */
export const markFnFSettlementAsPaid = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fnfSettlementId = req.params['fnfSettlementId'];
    const paid = await separationService.markFnFSettlementAsPaid(fnfSettlementId);
    res.status(200).json({ success: true, data: paid, message: 'F&F settlement marked as paid' });
  } catch (error) {
    return next(error);
  }
};

/**
 * Reject F&F Settlement
 * PUT /api/v1/separation/fnf/:fnfSettlementId/reject
 */
export const rejectFnFSettlement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fnfSettlementId = req.params['fnfSettlementId'];
    const { rejectedBy, reason } = req.body;

    if (!fnfSettlementId) {
      return res.status(400).json({
        success: false,
        message: 'fnfSettlementId is required',
      });
    }

    if (!rejectedBy) {
      return res.status(400).json({
        success: false,
        message: 'rejectedBy is required',
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'reason is required',
      });
    }

    const fnfSettlement = await separationService.rejectFnFSettlement(fnfSettlementId, rejectedBy, reason);

    res.status(200).json({
      success: true,
      data: fnfSettlement,
      message: 'F&F settlement rejected successfully',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get asset recovery checklist
 * GET /api/v1/separation/asset-recovery/:employeeId
 */
export const getAssetRecoveryChecklist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = req.params['employeeId'] as string;
    const checklist = await separationService.getAssetRecoveryChecklist(employeeId);

    res.status(200).json({
      success: true,
      data: checklist,
      message: 'Asset recovery checklist retrieved successfully',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update asset recovery status
 * PUT /api/v1/separation/asset-recovery/:assetRecoveryId
 */
export const updateAssetRecoveryStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assetRecoveryId = req.params['assetRecoveryId'] as string;
    const { status, damage_cost } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'status is required',
      });
    }

    const updated = await separationService.updateAssetRecoveryStatus(
      assetRecoveryId,
      status,
      damage_cost
    );

    res.status(200).json({
      success: true,
      data: updated,
      message: 'Asset recovery status updated successfully',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Check offboarding preconditions
 * GET /api/v1/separation/offboarding-check/:employeeId
 */
export const checkOffboardingPreconditions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = req.params['employeeId'] as string;
    const preconditions = await separationService.checkOffboardingPreconditions(employeeId);

    res.status(200).json({
      success: true,
      data: preconditions,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get notice period status
 * GET /api/v1/separation/resignation/:resignationId/notice-period-status
 */
export const getNoticePeriodStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resignationId = req.params['resignationId'] as string;
    const status = await separationService.getNoticePeriodStatus(resignationId);

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update notice period status
 * PUT /api/v1/separation/resignation/:resignationId/notice-period-status
 */
export const updateNoticePeriodStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resignationId = req.params['resignationId'] as string;
    const resignation = await separationService.updateNoticePeriodStatus(resignationId);

    res.status(200).json({
      success: true,
      data: resignation,
      message: 'Notice period status updated successfully',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Deactivate employee
 * PUT /api/v1/separation/deactivate/:employeeId
 */
export const deactivateEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = req.params['employeeId'] as string;
    await separationService.deactivateEmployee(employeeId);

    res.status(200).json({
      success: true,
      message: 'Employee deactivated successfully',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Revoke system access for an employee
 * PUT /api/v1/separation/revoke-access/:employeeId
 */
export const revokeSystemAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = req.params['employeeId'] as string;
    await separationService.revokeSystemAccess(employeeId);

    res.status(200).json({
      success: true,
      message: 'System access revoked successfully',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Archive employee data for compliance
 * PUT /api/v1/separation/archive/:employeeId
 */
export const archiveEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = req.params['employeeId'] as string;
    const { reason } = req.body;
    await separationService.archiveEmployee(employeeId, reason || 'Employee Offboarding');

    res.status(200).json({
      success: true,
      message: 'Employee data archived successfully',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Create questionnaire template
 * POST /api/v1/separation/questionnaire-templates
 */
export const createQuestionnaireTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, questions } = req.body;

    if (!name || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'name and questions array (with at least one question) are required',
      });
    }

    const template = await separationService.createQuestionnaireTemplate({
      name,
      description,
      questions,
    });

    res.status(201).json({
      success: true,
      data: template,
      message: 'Questionnaire template created successfully',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get questionnaire template by ID
 * GET /api/v1/separation/questionnaire-templates/:id
 */
export const getQuestionnaireTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Template ID is required',
      });
    }

    const template = await separationService.getQuestionnaireTemplate(id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Questionnaire template not found',
      });
    }

    res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get all active questionnaire templates
 * GET /api/v1/separation/questionnaire-templates/active
 */
export const getActiveQuestionnaireTemplates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const templates = await separationService.getActiveQuestionnaireTemplates();

    res.status(200).json({
      success: true,
      data: templates,
      count: templates.length,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get all questionnaire templates
 * GET /api/v1/separation/questionnaire-templates
 */
export const getAllQuestionnaireTemplates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const templates = await separationService.getAllQuestionnaireTemplates();

    res.status(200).json({
      success: true,
      data: templates,
      count: templates.length,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update questionnaire template
 * PUT /api/v1/separation/questionnaire-templates/:id
 */
export const updateQuestionnaireTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description, questions, is_active } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Template ID is required',
      });
    }

    const template = await separationService.updateQuestionnaireTemplate(id, {
      name,
      description,
      questions,
      is_active,
    });

    res.status(200).json({
      success: true,
      data: template,
      message: 'Questionnaire template updated successfully',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Delete questionnaire template
 * DELETE /api/v1/separation/questionnaire-templates/:id
 */
export const deleteQuestionnaireTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Template ID is required',
      });
    }

    await separationService.deleteQuestionnaireTemplate(id);

    res.status(200).json({
      success: true,
      message: 'Questionnaire template deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Add question to template
 * POST /api/v1/separation/questionnaire-templates/:id/questions
 */
export const addQuestionToTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { question_text, question_type, options, is_required, order } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Template ID is required',
      });
    }

    if (!question_text || !question_type) {
      return res.status(400).json({
        success: false,
        message: 'question_text and question_type are required',
      });
    }

    // Get the repository from the service (we need to add a getter method)
    const { QuestionnaireTemplateRepository } = await import('../repositories/questionnaireTemplateRepository');
    const repo = new QuestionnaireTemplateRepository(db);
    
    const question = await repo.addQuestion(id, {
      question_text,
      question_type,
      options,
      is_required: is_required ?? true,
      order: order ?? 0,
    });

    res.status(201).json({
      success: true,
      data: question,
      message: 'Question added to template successfully',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update question in template
 * PUT /api/v1/separation/questionnaire-templates/:id/questions/:questionId
 */
export const updateQuestionInTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, questionId } = req.params;
    const { question_text, question_type, options, is_required, order } = req.body;

    if (!id || !questionId) {
      return res.status(400).json({
        success: false,
        message: 'Template ID and Question ID are required',
      });
    }

    const { QuestionnaireTemplateRepository } = await import('../repositories/questionnaireTemplateRepository');
    const repo = new QuestionnaireTemplateRepository(db);

    const question = await repo.updateQuestion(id, questionId, {
      question_text,
      question_type,
      options,
      is_required,
      order,
    });

    res.status(200).json({
      success: true,
      data: question,
      message: 'Question updated successfully',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Remove question from template
 * DELETE /api/v1/separation/questionnaire-templates/:id/questions/:questionId
 */
export const removeQuestionFromTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, questionId } = req.params;

    if (!id || !questionId) {
      return res.status(400).json({
        success: false,
        message: 'Template ID and Question ID are required',
      });
    }

    const { QuestionnaireTemplateRepository } = await import('../repositories/questionnaireTemplateRepository');
    const repo = new QuestionnaireTemplateRepository(db);

    await repo.removeQuestion(id, questionId);

    res.status(200).json({
      success: true,
      message: 'Question removed from template successfully',
    });
  } catch (error) {
    return next(error);
  }
};
