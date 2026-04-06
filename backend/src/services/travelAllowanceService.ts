import { Knex } from 'knex';
import logger from '../utils/logger';
import { JourneyRepository } from '../repositories/journeyRepository';
import { GeoTrackingService } from './geoTrackingService';
import { ApprovalRoutingService } from './approvalRoutingService';

export interface TravelAllowanceConfig {
  ratePerKm: number;
  minDistance: number; // Minimum distance to qualify for allowance
  maxAllowancePerDay: number;
  currency: string;
}

export interface TravelLog {
  id: string;
  employeeId: string;
  journeyId: string;
  distance: number;
  allowance: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

export class TravelAllowanceService {
  private journeyRepository: JourneyRepository;
  private geoTrackingService: any;
  private approvalRoutingService: ApprovalRoutingService;
  private config: TravelAllowanceConfig;

  constructor(private knex: Knex) {
    this.journeyRepository = new JourneyRepository(knex);
    this.geoTrackingService = new GeoTrackingService();
    this.approvalRoutingService = new ApprovalRoutingService(knex);
    this.config = {
      ratePerKm: parseFloat(process.env['TRAVEL_ALLOWANCE_RATE_PER_KM'] || '10'),
      minDistance: parseFloat(process.env['TRAVEL_ALLOWANCE_MIN_DISTANCE'] || '5'),
      maxAllowancePerDay: parseFloat(process.env['TRAVEL_ALLOWANCE_MAX_PER_DAY'] || '500'),
      currency: process.env['TRAVEL_ALLOWANCE_CURRENCY'] || 'INR',
    };
  }

  /**
   * Log travel and route for approval
   */
  async logTravel(
    employeeId: string,
    journeyId: string,
    distance: number
  ): Promise<TravelLog> {
    const allowance = this.calculateJourneyAllowance(distance);

    // Create travel log record
    const travelLog: TravelLog = {
      id: this.generateId(),
      employeeId,
      journeyId,
      distance,
      allowance,
      status: 'pending',
      createdAt: new Date(),
    };

    // Store in database
    await this.knex('travel_logs').insert({
      id: travelLog.id,
      employee_id: employeeId,
      journey_id: journeyId,
      distance,
      allowance,
      status: 'pending',
      created_at: travelLog.createdAt,
    });

    // Route approval through hierarchy
    try {
      await this.approvalRoutingService.routeApprovalRequest({
        requestType: 'travel',
        requestId: travelLog.id,
        employeeId,
        requestData: travelLog,
      });
    } catch (error) {
      // Log error but don't fail the travel log creation
      logger.error('Failed to route travel approval', { error: error instanceof Error ? error.message : String(error) });
    }

    return travelLog;
  }

  /**
   * Calculate travel allowance for a single journey
   */
  calculateJourneyAllowance(distance: number): number {
    if (distance < this.config.minDistance) {
      return 0;
    }

    const allowance = distance * this.config.ratePerKm;
    return Math.min(allowance, this.config.maxAllowancePerDay);
  }

  /**
   * Calculate monthly travel allowance for an employee
   */
  async calculateMonthlyAllowance(
    employeeId: string,
    month: number,
    year: number
  ): Promise<{
    employeeId: string;
    month: number;
    year: number;
    totalDistance: number;
    totalAllowance: number;
    journeyCount: number;
    rate: number;
    currency: string;
  }> {
    const journeys = await this.journeyRepository.getByEmployeeAndMonth(
      employeeId,
      month,
      year
    );

    let totalDistance = 0;
    let totalAllowance = 0;

    for (const journey of journeys) {
      totalDistance += journey.totalDistance;
      totalAllowance += this.calculateJourneyAllowance(journey.totalDistance);
    }

    return {
      employeeId,
      month,
      year,
      totalDistance,
      totalAllowance,
      journeyCount: journeys.length,
      rate: this.config.ratePerKm,
      currency: this.config.currency,
    };
  }

  /**
   * Get travel allowance summary for a date range
   */
  async getTravelAllowanceSummary(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    employeeId: string;
    period: { startDate: Date; endDate: Date };
    totalDistance: number;
    totalAllowance: number;
    journeyCount: number;
    averageDistancePerJourney: number;
    rate: number;
    currency: string;
  }> {
    const journeys = await this.knex('journeys')
      .where('employee_id', employeeId)
      .where('status', 'Completed')
      .whereBetween('start_time', [startDate, endDate])
      .select('*');

    let totalDistance = 0;
    let totalAllowance = 0;

    for (const journey of journeys) {
      totalDistance += journey.total_distance;
      totalAllowance += this.calculateJourneyAllowance(journey.total_distance);
    }

    const averageDistance =
      journeys.length > 0 ? totalDistance / journeys.length : 0;

    return {
      employeeId,
      period: { startDate, endDate },
      totalDistance,
      totalAllowance,
      journeyCount: journeys.length,
      averageDistancePerJourney: averageDistance,
      rate: this.config.ratePerKm,
      currency: this.config.currency,
    };
  }

  /**
   * Update travel allowance configuration
   */
  updateConfig(config: Partial<TravelAllowanceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): TravelAllowanceConfig {
    return { ...this.config };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}
