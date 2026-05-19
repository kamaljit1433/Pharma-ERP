import { Router } from 'express';
import { GeoTrackingController } from '../controllers/geoTrackingController';
import { authenticateToken } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { UserRole } from '../types/auth';
import { Knex } from 'knex';

export function createGeoTrackingRoutes(knex: Knex): Router {
  const router = Router();
  const ctrl = new GeoTrackingController(knex);

  // POST /api/v1/geo-tracking/track-location
  router.post('/track-location', authenticateToken as any, (req, res, next) =>
    ctrl.trackLocation(req, res, next)
  );

  // GET /api/v1/geo-tracking/daily-journey/:employeeId?date=YYYY-MM-DD
  router.get('/daily-journey/:employeeId', authenticateToken as any, (req, res, next) =>
    ctrl.getDailyJourney(req, res, next)
  );

  // GET /api/v1/geo-tracking/journeys/:employeeId?startDate=X&endDate=Y
  router.get('/journeys/:employeeId', authenticateToken as any, (req, res, next) =>
    ctrl.getJourneysByDateRange(req, res, next)
  );

  // PUT /api/v1/geo-tracking/journeys/:id/approve
  router.put(
    '/journeys/:id/approve',
    authenticateToken as any,
    authorize(['Manager', UserRole.HR_MANAGER, UserRole.SUPER_ADMIN]) as any,
    (req, res, next) => ctrl.approveJourney(req, res, next)
  );

  // PUT /api/v1/geo-tracking/journeys/:id/reject
  router.put(
    '/journeys/:id/reject',
    authenticateToken as any,
    authorize(['Manager', UserRole.HR_MANAGER, UserRole.SUPER_ADMIN]) as any,
    (req, res, next) => ctrl.rejectJourney(req, res, next)
  );

  // GET /api/v1/geo-tracking/export/:employeeId?startDate=X&endDate=Y&format=csv
  router.get('/export/:employeeId', authenticateToken as any, (req, res, next) =>
    ctrl.exportJourneyData(req, res, next)
  );

  // GET /api/v1/geo-tracking/monthly-allowance/:employeeId?month=X&year=Y
  router.get('/monthly-allowance/:employeeId', authenticateToken as any, (req, res, next) =>
    ctrl.getMonthlyAllowance(req, res, next)
  );

  // GET /api/v1/geo-tracking/yearly-stats/:employeeId?year=Y
  router.get('/yearly-stats/:employeeId', authenticateToken as any, (req, res, next) =>
    ctrl.getYearlyStats(req, res, next)
  );

  // GET /api/v1/geo-tracking/pending-approvals
  router.get(
    '/pending-approvals',
    authenticateToken as any,
    authorize(['Manager', UserRole.HR_MANAGER, UserRole.SUPER_ADMIN, UserRole.DEPARTMENT_MANAGER]) as any,
    (req, res, next) => ctrl.getPendingApprovals(req, res, next)
  );

  // GET /api/v1/geo-tracking/team-journeys/:managerId?startDate=X&endDate=Y
  router.get(
    '/team-journeys/:managerId',
    authenticateToken as any,
    authorize(['Manager', UserRole.HR_MANAGER, UserRole.SUPER_ADMIN, UserRole.DEPARTMENT_MANAGER]) as any,
    (req, res, next) => ctrl.getTeamJourneys(req, res, next)
  );

  // POST /api/v1/geo-tracking/geo-fences
  router.post(
    '/geo-fences',
    authenticateToken as any,
    authorize([UserRole.SUPER_ADMIN, UserRole.IT_ADMIN]) as any,
    (req, res, next) => ctrl.createGeoFence(req, res, next)
  );

  // GET /api/v1/geo-tracking/geo-fences
  router.get('/geo-fences', authenticateToken as any, (req, res, next) =>
    ctrl.getGeoFences(req, res, next)
  );

  // GET /api/v1/geo-tracking/geo-fences/:id
  router.get('/geo-fences/:id', authenticateToken as any, (req, res, next) =>
    ctrl.getGeoFenceById(req, res, next)
  );

  // PUT /api/v1/geo-tracking/geo-fences/:id
  router.put(
    '/geo-fences/:id',
    authenticateToken as any,
    authorize([UserRole.SUPER_ADMIN, UserRole.IT_ADMIN]) as any,
    (req, res, next) => ctrl.updateGeoFence(req, res, next)
  );

  // DELETE /api/v1/geo-tracking/geo-fences/:id
  router.delete(
    '/geo-fences/:id',
    authenticateToken as any,
    authorize([UserRole.SUPER_ADMIN, UserRole.IT_ADMIN]) as any,
    (req, res, next) => ctrl.deleteGeoFence(req, res, next)
  );

  // PUT /api/v1/geo-tracking/geo-fences/:id/toggle
  router.put(
    '/geo-fences/:id/toggle',
    authenticateToken as any,
    authorize([UserRole.SUPER_ADMIN, UserRole.IT_ADMIN]) as any,
    (req, res, next) => ctrl.toggleGeoFence(req, res, next)
  );

  return router;
}
