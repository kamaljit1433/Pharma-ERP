/**
 * Attendance API Routes
 * Handles check-in, check-out, and attendance management endpoints
 */

import { Router, Request, Response } from 'express';
import { attendanceService } from '../services/attendanceService';
import { shiftService } from '../services/shiftService';


const router = Router();

/**
 * POST /api/v1/attendance/check-in
 * Mark employee check-in with face detection and GPS validation
 */
router.post('/check-in', async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId, location, faceDetected, shiftId } = req.body;

    // Validate required fields
    if (!employeeId) {
      res.status(400).json({
        error: {
          code: 'MISSING_EMPLOYEE_ID',
          message: 'Employee ID is required',
          timestamp: new Date().toISOString(),
          requestId: (req as any).id,
        },
      });
      return;
    }

    if (!location) {
      res.status(400).json({
        error: {
          code: 'MISSING_LOCATION',
          message: 'GPS location is required',
          timestamp: new Date().toISOString(),
          requestId: (req as any).id,
        },
      });
      return;
    }

    if (faceDetected === undefined) {
      res.status(400).json({
        error: {
          code: 'MISSING_FACE_DETECTION',
          message: 'Face detection result is required',
          timestamp: new Date().toISOString(),
          requestId: (req as any).id,
        },
      });
      return;
    }

    // Perform check-in
    const attendance = await attendanceService.checkIn(
      employeeId,
      location,
      faceDetected,
      shiftId
    );

    res.status(201).json({
      success: true,
      data: attendance,
      timestamp: new Date().toISOString(),
      requestId: (req as any).id,
    });
  } catch (error: any) {
    res.status(400).json({
      error: {
        code: 'CHECK_IN_FAILED',
        message: error.message,
        timestamp: new Date().toISOString(),
        requestId: (req as any).id,
      },
    });
  }
});

/**
 * POST /api/v1/attendance/check-out
 * Mark employee check-out with GPS capture
 */
router.post('/check-out', async (req: Request, res: Response): Promise<void> => {
  try {
    const { attendanceId, location } = req.body;

    // Validate required fields
    if (!attendanceId) {
      res.status(400).json({
        error: {
          code: 'MISSING_ATTENDANCE_ID',
          message: 'Attendance ID is required',
          timestamp: new Date().toISOString(),
          requestId: (req as any).id,
        },
      });
      return;
    }

    if (!location) {
      res.status(400).json({
        error: {
          code: 'MISSING_LOCATION',
          message: 'GPS location is required',
          timestamp: new Date().toISOString(),
          requestId: (req as any).id,
        },
      });
      return;
    }

    // Perform check-out
    const attendance = await attendanceService.checkOut(attendanceId, location);

    res.status(200).json({
      success: true,
      data: attendance,
      timestamp: new Date().toISOString(),
      requestId: (req as any).id,
    });
  } catch (error: any) {
    res.status(400).json({
      error: {
        code: 'CHECK_OUT_FAILED',
        message: error.message,
        timestamp: new Date().toISOString(),
        requestId: (req as any).id,
      },
    });
  }
});

/**
 * GET /api/v1/attendance/monthly/:employeeId
 * Get monthly attendance summary for an employee
 */
router.get('/monthly/:employeeId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.query;

    // Validate required parameters
    if (!employeeId) {
      res.status(400).json({
        error: {
          code: 'MISSING_EMPLOYEE_ID',
          message: 'Employee ID is required',
          timestamp: new Date().toISOString(),
          requestId: (req as any).id,
        },
      });
      return;
    }

    if (!month || !year) {
      res.status(400).json({
        error: {
          code: 'MISSING_PERIOD',
          message: 'Month and year are required',
          timestamp: new Date().toISOString(),
          requestId: (req as any).id,
        },
      });
      return;
    }

    const monthNum = parseInt(month as string, 10);
    const yearNum = parseInt(year as string, 10);

    // Validate month and year
    if (monthNum < 1 || monthNum > 12) {
      res.status(400).json({
        error: {
          code: 'INVALID_MONTH',
          message: 'Month must be between 1 and 12',
          timestamp: new Date().toISOString(),
          requestId: (req as any).id,
        },
      });
      return;
    }

    // Get monthly attendance
    const attendance = await attendanceService.getMonthlyAttendance(
      employeeId,
      monthNum,
      yearNum
    );

    res.status(200).json({
      success: true,
      data: attendance,
      timestamp: new Date().toISOString(),
      requestId: (req as any).id,
    });
  } catch (error: any) {
    res.status(500).json({
      error: {
        code: 'FETCH_FAILED',
        message: error.message,
        timestamp: new Date().toISOString(),
        requestId: (req as any).id,
      },
    });
  }
});

/**
 * POST /api/v1/attendance/regularization
 * Request attendance regularization
 */
router.post('/regularization', async (req: Request, res: Response): Promise<void> => {
  try {
    const { attendanceId, employeeId, reason } = req.body;

    // Validate required fields
    if (!attendanceId || !employeeId || !reason) {
      res.status(400).json({
        error: {
          code: 'MISSING_FIELDS',
          message: 'Attendance ID, Employee ID, and reason are required',
          timestamp: new Date().toISOString(),
          requestId: (req as any).id,
        },
      });
      return;
    }

    // Create regularization request
    const request = await attendanceService.requestRegularization(
      attendanceId,
      employeeId,
      reason
    );

    res.status(201).json({
      success: true,
      data: request,
      timestamp: new Date().toISOString(),
      requestId: (req as any).id,
    });
  } catch (error: any) {
    res.status(400).json({
      error: {
        code: 'REGULARIZATION_FAILED',
        message: error.message,
        timestamp: new Date().toISOString(),
        requestId: (req as any).id,
      },
    });
  }
});

/**
 * PUT /api/v1/attendance/regularization/:id/approve
 * Approve attendance regularization request
 */
router.put('/regularization/:id/approve', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { approverId, comments } = req.body;

    // Validate required fields
    if (!id || !approverId) {
      res.status(400).json({
        error: {
          code: 'MISSING_FIELDS',
          message: 'Request ID and Approver ID are required',
          timestamp: new Date().toISOString(),
          requestId: (req as any).id,
        },
      });
      return;
    }

    // Approve regularization
    const request = await attendanceService.approveRegularization(
      id,
      approverId,
      comments
    );

    res.status(200).json({
      success: true,
      data: request,
      timestamp: new Date().toISOString(),
      requestId: (req as any).id,
    });
  } catch (error: any) {
    res.status(400).json({
      error: {
        code: 'APPROVAL_FAILED',
        message: error.message,
        timestamp: new Date().toISOString(),
        requestId: (req as any).id,
      },
    });
  }
});

/**
 * GET /api/v1/shifts
 * Get all shifts
 */
router.get('/shifts', async (req: Request, res: Response) => {
  try {
    const shifts = await shiftService.getAllShifts();

    res.status(200).json({
      success: true,
      data: shifts,
      timestamp: new Date().toISOString(),
      requestId: (req as any).id,
    });
  } catch (error: any) {
    res.status(500).json({
      error: {
        code: 'FETCH_FAILED',
        message: error.message,
        timestamp: new Date().toISOString(),
        requestId: (req as any).id,
      },
    });
  }
});

/**
 * POST /api/v1/shifts
 * Create a new shift
 */
router.post('/shifts', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, startTime, endTime, breakDuration, type } = req.body;

    // Validate required fields
    if (!name || !startTime || !endTime || breakDuration === undefined || !type) {
      res.status(400).json({
        error: {
          code: 'MISSING_FIELDS',
          message: 'Name, start time, end time, break duration, and type are required',
          timestamp: new Date().toISOString(),
          requestId: (req as any).id,
        },
      });
      return;
    }

    // Create shift
    const shift = await shiftService.createShift({
      name,
      startTime,
      endTime,
      breakDuration,
      type,
    });

    res.status(201).json({
      success: true,
      data: shift,
      timestamp: new Date().toISOString(),
      requestId: (req as any).id,
    });
  } catch (error: any) {
    res.status(400).json({
      error: {
        code: 'SHIFT_CREATION_FAILED',
        message: error.message,
        timestamp: new Date().toISOString(),
        requestId: (req as any).id,
      },
    });
  }
});

export default router;
