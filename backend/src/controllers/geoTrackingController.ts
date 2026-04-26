import { Request, Response, NextFunction } from 'express';
import { Knex } from 'knex';
import { GeoLogRepository } from '../repositories/geoLogRepository';
import { GeoFenceRepository } from '../repositories/geoFenceRepository';
import { JourneyRepository } from '../repositories/journeyRepository';
import { GeoTrackingService } from '../services/geoTrackingService';
import { v4 as uuidv4 } from 'uuid';
import { TravelAllowanceService } from '../services/travelAllowanceService';
import { NotificationService } from '../services/notificationService';
import { NotificationRepository } from '../repositories/notificationRepository';
import { NotificationType } from '../types/notification';

export class GeoTrackingController {
  private geoLogRepository: GeoLogRepository;
  private geoFenceRepository: GeoFenceRepository;
  private journeyRepository: JourneyRepository;
  private geoTrackingService: GeoTrackingService;
  private travelAllowanceService: TravelAllowanceService;
  private notificationService: NotificationService;

  constructor(private knex: Knex) {
    this.geoLogRepository = new GeoLogRepository(knex);
    this.geoFenceRepository = new GeoFenceRepository(knex);
    this.journeyRepository = new JourneyRepository(knex);
    this.geoTrackingService = new GeoTrackingService();
    this.travelAllowanceService = new TravelAllowanceService(knex);
    this.notificationService = new NotificationService(new NotificationRepository(knex));
  }

  /**
   * POST /api/v1/geo/track - Log GPS waypoint
   */
  async trackLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId, latitude, longitude, timestamp, accuracy } = req.body;

      // Validate coordinates - parse as numbers first
      const lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
      const lng = typeof longitude === 'string' ? parseFloat(longitude) : longitude;

      if (
        lat === undefined || lat === null || isNaN(lat) ||
        lng === undefined || lng === null || isNaN(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
      ) {
        return res.status(400).json({
          error: 'Invalid coordinates',
          message: 'Latitude must be between -90 and 90, longitude between -180 and 180',
        });
      }

      const geoLog = await this.geoLogRepository.create({
        employeeId,
        latitude,
        longitude,
        accuracy,
        action: 'Manual',
        timestamp: new Date(timestamp),
      } as any);

      // Audit logging
      await this.knex('audit_logs').insert({
        id: uuidv4(),
        user_id: (req as any).user?.id,
        action: 'GEO_TRACK_LOG',
        resource_type: 'GeoLog',
        resource_id: geoLog.id,
        changes: JSON.stringify({ employeeId, latitude, longitude }),
        created_at: new Date(),
      });

      return res.status(201).json({
        id: geoLog.id,
        employeeId: geoLog.employeeId,
        latitude: geoLog.location.latitude,
        longitude: geoLog.location.longitude,
        timestamp: geoLog.location.timestamp,
        accuracy: geoLog.location.accuracy,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /api/v1/geo/journey/:employeeId/:date - Get daily journey
   */
  async getDailyJourney(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId, date } = req.params;

      // Parse date
      const journeyDate = new Date(date as string);
      if (isNaN(journeyDate.getTime())) {
        return res.status(400).json({
          error: 'Invalid date format',
          message: 'Date must be in ISO 8601 format (YYYY-MM-DD)',
        });
      }

      const journeys = await this.journeyRepository.getJourneysByDateRange(
        journeyDate,
        journeyDate
      );

      const geoLogs = await this.geoLogRepository.getByEmployeeAndDate(
        employeeId as string,
        journeyDate
      );

        let totalDistance = 0;
      for (const journey of journeys) {
        totalDistance += journey.distance || 0;
      }

      res.json({
        employeeId,
        date: journeyDate.toISOString().split('T')[0],
        journeys: journeys.map((j: any) => ({
          id: j.id,
          startLocation: j.start_location,
          endLocation: j.end_location,
          totalDistance: j.distance,
          totalDuration: j.duration,
          purpose: j.purpose,
          travelAllowance: j.distance ? (j.distance * 5) : 0,
          status: 'pending',
        })),
        waypoints: geoLogs.map((log) => ({
          latitude: log.location.latitude,
          longitude: log.location.longitude,
          timestamp: log.location.timestamp,
          accuracy: log.location.accuracy,
        })),
        totalDistance,
        status: journeys.length > 0 ? 'pending' : 'pending',
      });
      return;
    } catch (error) {
      return next(error);
    }
  }

  /**
   * PUT /api/v1/geo/journey/:id/approve - Approve travel log
   */
  async approveJourney(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;
      const { approvedBy, notes } = req.body;
      const approverId = (req as any).user?.id || 'system';

      const journey = await this.journeyRepository.getJourneyById(id as string);
      if (!journey) {
        return res.status(404).json({
          error: 'Journey not found',
        });
      }

      const approvedJourney = await this.journeyRepository.updateJourney(
        id as string,
        { duration: 0 }
      );

      // Audit logging
      await this.knex('audit_logs').insert({
        id: uuidv4(),
        user_id: approverId,
        action: 'GEO_JOURNEY_APPROVE',
        resource_type: 'Journey',
        resource_id: id,
        changes: JSON.stringify({ status: 'Completed', notes }),
        created_at: new Date(),
      });

      // Send notification to employee
      await this.notificationService.sendNotification({
        employeeId: journey.employee_id,
        type: 'system_notification' as NotificationType,
        title: 'Travel Log Approved',
        body: "Your travel log has been approved.",
        data: { journeyId: id },
      });

      return res.json({
        id: approvedJourney?.id as string,
        status: 'pending',
        approvedBy: approverId,
        approvedAt: new Date(),
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /api/v1/geo/allowance/:employeeId/:month - Get monthly allowance
   */
  async getMonthlyAllowance(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId, month } = req.params;
      const yearStr = req.query['year'] as string | undefined;
      const year = yearStr ? parseInt(yearStr) : new Date().getFullYear();

      const monthNum = parseInt(month as string);
      if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        return res.status(400).json({
          error: 'Invalid month',
          message: 'Month must be a number between 1 and 12',
        });
      }

      if (isNaN(year)) {
        return res.status(400).json({
          error: 'Invalid year',
          message: 'Year must be a valid number',
        });
      }

      const allowance = await this.travelAllowanceService.calculateMonthlyAllowance(
        employeeId as string,
        monthNum,
        year
      );

      res.json({
        employeeId,
        month: monthNum,
        year,
        totalDistance: allowance.totalDistance,
        allowanceRate: allowance.rate,
        totalAllowance: allowance.totalAllowance,
        journeyCount: allowance.journeyCount,
        currency: allowance.currency,
        status: 'calculated',
      });
      return;
    } catch (error) {
      return next(error);
    }
  }

  /**
   * POST /api/v1/geo/geo-fences - Create geo-fence (admin only)
   */
  async createGeoFence(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, latitude, longitude, radius, type } = req.body;

      // Validate input
      if (!name || !latitude || !longitude || !radius || !type) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'name, latitude, longitude, radius, and type are required',
        });
      }

      if (
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        return res.status(400).json({
          error: 'Invalid coordinates',
          message: 'Latitude must be between -90 and 90, longitude between -180 and 180',
        });
      }

      if (radius <= 0) {
        return res.status(400).json({
          error: 'Invalid radius',
          message: 'Radius must be greater than 0',
        });
      }

      const geoFence = await this.geoFenceRepository.create({
        name,
        latitude,
        longitude,
        radius,
        type,
      });

      // Audit logging
      await this.knex('audit_logs').insert({
        id: uuidv4(),
        user_id: (req as any).user?.id,
        action: 'GEO_FENCE_CREATE',
        resource_type: 'GeoFence',
        resource_id: geoFence.id,
        changes: JSON.stringify({ name, latitude, longitude, radius, type }),
        created_at: new Date(),
      });

      res.status(201).json({
        id: geoFence.id,
        name: geoFence.name,
        latitude: geoFence.center.latitude,
        longitude: geoFence.center.longitude,
        radius: geoFence.radius,
        type: geoFence.type,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /api/v1/geo/geo-fences - Get all geo-fences
   */
  async getGeoFences(req: Request, res: Response, next: NextFunction) {
    try {
      const enabledOnly = req.query['enabled'] === 'true';
      const type = req.query['type'] as string | undefined;

      let geoFences;
      if (type) {
        geoFences = await this.geoFenceRepository.getByType(
          type as 'Office' | 'Site' | 'Restricted' | 'Custom'
        );
      } else if (enabledOnly) {
        geoFences = await this.geoFenceRepository.getEnabled();
      } else {
        geoFences = await this.geoFenceRepository.getAll();
      }

      res.json(
        geoFences.map((gf) => ({
          id: gf.id,
          name: gf.name,
          latitude: gf.center.latitude,
          longitude: gf.center.longitude,
          radius: gf.radius,
          type: gf.type,
          enabled: gf.enabled,
        }))
      );
    } catch (error) {
      return next(error);
    }
  }
}
