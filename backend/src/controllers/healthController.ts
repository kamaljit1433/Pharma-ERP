/**
 * Health Check Controller
 * 
 * Provides endpoints for monitoring system health and resilience metrics
 */

import { Request, Response } from 'express';
import { getAllResilienceMetrics } from '../config/resilience';
import logger from '../utils/logger';

export class HealthController {
  /**
   * GET /health
   * Basic health check endpoint
   */
  static async getHealth(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    } catch (error: any) {
      logger.error('Health check error:', error.message);
      res.status(500).json({
        status: 'unhealthy',
        error: error.message,
      });
    }
  }

  /**
   * GET /health/resilience
   * Get resilience metrics for all external services
   */
  static async getResilienceMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = getAllResilienceMetrics();

      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: metrics,
      });
    } catch (error: any) {
      logger.error('Resilience metrics error:', error.message);
      res.status(500).json({
        status: 'error',
        error: error.message,
      });
    }
  }

  /**
   * GET /health/resilience/:serviceName
   * Get resilience metrics for a specific service
   */
  static async getServiceResilienceMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { serviceName } = req.params;
      const metrics = getAllResilienceMetrics();

      if (!metrics[serviceName]) {
        res.status(404).json({
          status: 'not_found',
          error: `Service "${serviceName}" not found`,
        });
        return;
      }

      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: serviceName,
        metrics: metrics[serviceName],
      });
    } catch (error: any) {
      logger.error('Service resilience metrics error:', error.message);
      res.status(500).json({
        status: 'error',
        error: error.message,
      });
    }
  }

  /**
   * GET /health/detailed
   * Comprehensive health check with all metrics
   */
  static async getDetailedHealth(req: Request, res: Response): Promise<void> {
    try {
      const resilienceMetrics = getAllResilienceMetrics();

      // Count services by state
      const stateCount = {
        CLOSED: 0,
        HALF_OPEN: 0,
        OPEN: 0,
      };

      for (const service of Object.values(resilienceMetrics)) {
        stateCount[service.circuitBreakerState as keyof typeof stateCount]++;
      }

      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        resilience: {
          summary: stateCount,
          services: resilienceMetrics,
        },
      });
    } catch (error: any) {
      logger.error('Detailed health check error:', error.message);
      res.status(500).json({
        status: 'error',
        error: error.message,
      });
    }
  }
}
