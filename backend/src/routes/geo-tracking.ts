import { Router } from 'express';
import { GeoTrackingController } from '../controllers/geoTrackingController';
import { authenticateToken } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { UserRole } from '../types/auth';
import { Knex } from 'knex';

export function createGeoTrackingRoutes(knex: Knex): Router {
  const router = Router();
  const geoTrackingController = new GeoTrackingController(knex);

  /**
   * POST /api/v1/geo/track - Log GPS waypoint
   * Requires: Employee role or higher
   */
  router.post('/track', authenticateToken as any, (req, res, next) =>
    geoTrackingController.trackLocation(req, res, next)
  );

  /**
   * GET /api/v1/geo/journey/:employeeId/:date - Get daily journey
   * Requires: Employee (own data) or Manager/HR (team data)
   */
  router.get('/journey/:employeeId/:date', authenticateToken as any, (req, res, next) =>
    geoTrackingController.getDailyJourney(req, res, next)
  );

  /**
   * PUT /api/v1/geo/journey/:id/approve - Approve travel log
   * Requires: Manager or HR role
   */
  router.put(
    '/journey/:id/approve',
    authenticateToken as any,
    authorize(['Manager', UserRole.HR_MANAGER, UserRole.SUPER_ADMIN]) as any,
    (req, res, next) => geoTrackingController.approveJourney(req, res, next)
  );

  /**
   * GET /api/v1/geo/allowance/:employeeId/:month - Get monthly allowance
   * Requires: Finance/Payroll or HR role
   */
  router.get(
    '/allowance/:employeeId/:month',
    authenticateToken as any,
    authorize(['Finance', UserRole.HR_MANAGER, UserRole.SUPER_ADMIN]) as any,
    (req, res, next) => geoTrackingController.getMonthlyAllowance(req, res, next)
  );

  /**
   * POST /api/v1/geo/geo-fences - Create geo-fence
   * Requires: Super Admin or IT Admin
   */
  router.post(
    '/geo-fences',
    authenticateToken as any,
    authorize([UserRole.SUPER_ADMIN, UserRole.IT_ADMIN]) as any,
    (req, res, next) => geoTrackingController.createGeoFence(req, res, next)
  );

  /**
   * GET /api/v1/geo/geo-fences - Get all geo-fences
   * Requires: Authenticated user
   */
  router.get('/geo-fences', authenticateToken as any, (req, res, next) =>
    geoTrackingController.getGeoFences(req, res, next)
  );

  return router;
}
