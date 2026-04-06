/**
 * Health Check Routes
 * 
 * Routes for monitoring system health and resilience metrics
 */

import { Router } from 'express';
import { HealthController } from '../controllers/healthController';

const router = Router();

/**
 * Basic health check
 * GET /health
 */
router.get('/', HealthController.getHealth);

/**
 * Get resilience metrics for all services
 * GET /health/resilience
 */
router.get('/resilience', HealthController.getResilienceMetrics);

/**
 * Get resilience metrics for a specific service
 * GET /health/resilience/:serviceName
 */
router.get('/resilience/:serviceName', HealthController.getServiceResilienceMetrics);

/**
 * Comprehensive health check with all metrics
 * GET /health/detailed
 */
router.get('/detailed', HealthController.getDetailedHealth);

export default router;
