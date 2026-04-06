import { Router } from 'express';
import { LeaveController } from '../controllers/leaveController';
import { authenticateToken } from '../middleware/auth';
import { Knex } from 'knex';

export function createLeaveRoutes(knex: Knex): Router {
  const router = Router();
  const leaveController = new LeaveController(knex);

  // Leave Type routes
  router.post('/leave-types', authenticateToken as any, (req, res, next) =>
    leaveController.createLeaveType(req, res, next)
  );

  router.get('/leave-types', authenticateToken as any, (req, res, next) =>
    leaveController.getLeaveTypes(req, res, next)
  );

  router.get('/leave-types/:id', authenticateToken as any, (req, res, next) =>
    leaveController.getLeaveType(req, res, next)
  );

  router.put('/leave-types/:id', authenticateToken as any, (req, res, next) =>
    leaveController.updateLeaveType(req, res, next)
  );

  router.delete('/leave-types/:id', authenticateToken as any, (req, res, next) =>
    leaveController.deleteLeaveType(req, res, next)
  );

  // Holiday routes
  router.post('/holidays', authenticateToken as any, (req, res, next) =>
    leaveController.createHoliday(req, res, next)
  );

  router.get('/holidays', authenticateToken as any, (req, res, next) =>
    leaveController.getHolidays(req, res, next)
  );

  router.get('/holidays/:id', authenticateToken as any, (req, res, next) =>
    leaveController.getHoliday(req, res, next)
  );

  router.put('/holidays/:id', authenticateToken as any, (req, res, next) =>
    leaveController.updateHoliday(req, res, next)
  );

  router.delete('/holidays/:id', authenticateToken as any, (req, res, next) =>
    leaveController.deleteHoliday(req, res, next)
  );

  // Leave request routes
  router.post('/leaves', authenticateToken as any, (req, res, next) =>
    leaveController.applyLeave(req, res, next)
  );

  router.put('/leaves/:id/approve', authenticateToken as any, (req, res, next) =>
    leaveController.approveLeave(req, res, next)
  );

  router.put('/leaves/:id/reject', authenticateToken as any, (req, res, next) =>
    leaveController.rejectLeave(req, res, next)
  );

  router.get('/leaves/balance/:employeeId', authenticateToken as any, (req, res, next) =>
    leaveController.getLeaveBalance(req, res, next)
  );

  router.get('/leaves/team-calendar', authenticateToken as any, (req, res, next) =>
    leaveController.getTeamLeaveCalendar(req, res, next)
  );

  return router;
}
