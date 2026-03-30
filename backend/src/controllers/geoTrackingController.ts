import { Request, Response, NextFunction } from 'express';
import { Knex } from 'knex';
import { GeoLogRepository } from '../repositories/geoLogRepository';
import { GeoFenceRepository } from '../repositories/geoFenceRepository';
import { JourneyRepository } from '../repositories/journeyRepository';
import { GeoTrackingService } from '../services/geoTrackingService';
import { TravelAllowanceService } from '../services/travelAllowanceService';
import { NotificationService } from '../services/notificationService';

export class GeoTrackingController {
  private geoLogRepository: GeoLogRepository;
  private geoFenceRepository: GeoFenceRepository;
  private journeyRepository: JourneyRepository;
  private geoTrackingService: any;
  private travelAllowanceService: TravelAllowanceService;
  private notificationService: NotificationService;

  constructor(private knex: Knex) {
    this.geoLogRepository = new GeoLogRepository(knex);
    this.geoFenceRepository = new GeoFenceRepository(knex);
    this.journeyRepository = new JourneyRepository(knex);
    this.geoTrackingService = new GeoTrackingService();
    this.travelAllowanceService = new TravelAllowanceService(knex);
    this.notificationService = new NotificationService(knex);
  }

  /**
   * POST /api/v1/geo/track - Log GPS waypoint
   */
  async trackLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId, latitude, longitude, timestamp, accuracy } = req.body;

      // Validate coordinates
      if (
        !latitude ||
        !longitude ||
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

      const geoLog = await this.geoLogRepository.create({
        employeeId,
        latitude,
        longitude,
        accuracy,
        action: 'Manual',
        timestamp: new Date(timestamp),
      });

      // Audit logging
      await this.knex('audit_logs').insert({
        id: require('uuid').v4(),
        user_id: (req as any).user?.id,
        action: 'GEO_TRACK_LOG',
        resource_type: 'GeoLog',
        resource_id: geoLog.id,
        changes: JSON.stringify({ employeeId, latitude, longitude }),
        created_at: new Date(),
      });

      res.status(201).json({
        id: geoLog.id,
        employeeId: geoLog.employeeId,
        latitude: geoLog.location.latitude,
        longitude: geoLog.location.longitude,
        timestamp: geoLog.location.timestamp,
        accuracy: geoLog.location.accuracy,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/geo/journey/:employeeId/:date - Get daily journey
   */
  async getDailyJourney(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId, date } = req.params;

      // Parse date
      const journeyDate = new Date(date);
      if (isNaN(journeyDate.getTime())) {
        return res.status(400).json({
          error: 'Invalid date format',
          message: 'Date must be in ISO 8601 format (YYYY-MM-DD)',
        });
      }

      const journeys = await this.journeyRepository.getByEmployeeAndDate(
        employeeId,
        journeyDate
      );

      const geoLogs = await this.geoLogRepository.getByEmployeeAndDate(
        employeeId,
        journeyDate
      );

      let totalDistance = 0;
      for (const journey of journeys) {
        totalDistance += journey.totalDistance;
      }

      res.json({
        employeeId,
        date: journeyDate.toISOString().split('T')[0],
        journeys: journeys.map((j) => ({
          id: j.id,
          startLocation: j.startLocation,
          endLocation: j.endLocation,
          totalDistance: j.totalDistance,
          totalDuration: j.totalDuration,
          purpose: j.purpose,
          travelAllowance: j.travelAllowance,
          status: j.status,
        })),
        waypoints: geoLogs.map((log) => ({
          latitude: log.location.latitude,
          longitude: log.location.longitude,
          timestamp: log.location.timestamp,
          accuracy: log.location.accuracy,
        })),
        totalDistance,
        status: journeys.length > 0 ? journeys[0].status : 'pending',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/geo/journey/:id/approve - Approve travel log
   */
  async approveJourney(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { approvedBy, notes } = req.body;
      const approverId = (req as any).user?.id;

      const journey = await this.journeyRepository.getById(id);
      if (!journey) {
        return res.status(404).json({
          error: 'Journey not found',
        });
      }

      const approvedJourney = await this.journeyRepository.approve(
        id,
        approverId,
        notes
      );

      // Audit logging
      await this.knex('audit_logs').insert({
        id: require('uuid').v4(),
        user_id: approverId,
        action: 'GEO_JOURNEY_APPROVE',
        resource_type: 'Journey',
        resource_id: id,
        changes: JSON.stringify({ status: 'Completed', notes }),
        created_at: new Date(),
      });

      // Send notification to employee
      await this.notificationService.sendNotification({
        employeeId: journey.employeeId,
        type: 'TRAVEL_APPROVED',
        title: 'Travel Log Approved',
        message: `Your travel log for ${journey.startTime.toDateString()} has been approved.`,
        data: { journeyId: id },
      });

      res.json({
        id: approvedJourney?.id,
        status: approvedJourney?.status,
        approvedBy: approverId,
        approvedAt: new Date(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/geo/allowance/:employeeId/:month - Get monthly allowance
   */
  async getMonthlyAllowance(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId, month } = req.params;
      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();

      const monthNum = parseInt(month);
      if (monthNum < 1 || monthNum > 12) {
        return res.status(400).json({
          error: 'Invalid month',
          message: 'Month must be between 1 and 12',
        });
      }

      const allowance = await this.travelAllowanceService.calculateMonthlyAllowance(
        employeeId,
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
    } catch (error) {
      next(error);
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
        id: require('uuid').v4(),
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
      next(error);
    }
  }

  /**
   * GET /api/v1/geo/geo-fences - Get all geo-fences
   */
  async getGeoFences(req: Request, res: Response, next: NextFunction) {
    try {
      const enabledOnly = req.query.enabled === 'true';
      const type = req.query.type as string | undefined;

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
      next(error);
    }
  }
}
