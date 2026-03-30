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
    const { employeeId } = req.params;
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
    next(error);
  }
};

/**
 * Initiate termination
 * POST /api/v1/separation/termination
 */
export const initiateTermination = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeId } = req.params;
    const { termination_date, reason } = req.body;

    if (!termination_date || !reason) {
      return res.status(400).json({
        success: false,
        message: 'termination_date and reason are required',
      });
    }

    const termination = await separationService.initiateTermination(
      employeeId,
      new Date(termination_date),
      reason
    );

    res.status(201).json({
      success: true,
      data: termination,
      message: 'Termination initiated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get resignation
 * GET /api/v1/separation/resignation/:resignationId
 */
export const getResignation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resignationId } = req.params;
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
    next(error);
  }
};

/**
 * Accept resignation
 * PUT /api/v1/separation/resignation/:resignationId/accept
 */
export const acceptResignation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resignationId } = req.params;
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
    next(error);
  }
};

/**
 * Reject resignation
 * PUT /api/v1/separation/resignation/:resignationId/reject
 */
export const rejectResignation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resignationId } = req.params;
    const resignation = await separationService.rejectResignation(resignationId);

    res.status(200).json({
      success: true,
      data: resignation,
      message: 'Resignation rejected successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Schedule exit interview
 * POST /api/v1/separation/exit-interview
 */
export const scheduleExitInterview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeId } = req.params;
    const { scheduled_at } = req.body;

    if (!scheduled_at) {
      return res.status(400).json({
        success: false,
        message: 'scheduled_at is required',
      });
    }

    const exitInterview = await separationService.scheduleExitInterview(employeeId, {
      scheduled_at: new Date(scheduled_at),
    });

    res.status(201).json({
      success: true,
      data: exitInterview,
      message: 'Exit interview scheduled successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete exit interview
 * PUT /api/v1/separation/exit-interview/:exitInterviewId/complete
 */
export const completeExitInterview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { exitInterviewId } = req.params;
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
    next(error);
  }
};

/**
 * Calculate F&F Settlement
 * GET /api/v1/separation/fnf/:employeeId
 */
export const calculateFnFSettlement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeId } = req.params;
    const fnfSettlement = await separationService.calculateFnFSettlement(employeeId);

    res.status(200).json({
      success: true,
      data: fnfSettlement,
      message: 'F&F settlement calculated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve F&F Settlement
 * PUT /api/v1/separation/fnf/:fnfSettlementId/approve
 */
export const approveFnFSettlement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fnfSettlementId } = req.params;
    const { approvedBy } = req.body;

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
    next(error);
  }
};

/**
 * Get asset recovery checklist
 * GET /api/v1/separation/asset-recovery/:employeeId
 */
export const getAssetRecoveryChecklist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeId } = req.params;
    const checklist = await separationService.getAssetRecoveryChecklist(employeeId);

    res.status(200).json({
      success: true,
      data: checklist,
      message: 'Asset recovery checklist retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update asset recovery status
 * PUT /api/v1/separation/asset-recovery/:assetRecoveryId
 */
export const updateAssetRecoveryStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { assetRecoveryId } = req.params;
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
    next(error);
  }
};

/**
 * Check offboarding preconditions
 * GET /api/v1/separation/offboarding-check/:employeeId
 */
export const checkOffboardingPreconditions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeId } = req.params;
    const preconditions = await separationService.checkOffboardingPreconditions(employeeId);

    res.status(200).json({
      success: true,
      data: preconditions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deactivate employee
 * PUT /api/v1/separation/deactivate/:employeeId
 */
export const deactivateEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeId } = req.params;
    await separationService.deactivateEmployee(employeeId);

    res.status(200).json({
      success: true,
      message: 'Employee deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};
