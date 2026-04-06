import { Knex } from 'knex';
import { GeoLog, GeoLocation } from '../types/geoTracking';
import { v4 as uuidv4 } from 'uuid';

export class GeoLogRepository {
  constructor(private knex: Knex) {}

  async create(data: {
    employeeId: string;
    latitude: number;
    longitude: number;
    accuracy?: number;
    altitude?: number;
    address?: string;
    action: 'CheckIn' | 'CheckOut' | 'Journey' | 'Manual';
    journeyId?: string;
    metadata?: Record<string, unknown>;
  }): Promise<GeoLog> {
    const id = uuidv4();
    const now = new Date();

    await this.knex('geo_logs').insert({
      id,
      employee_id: data.employeeId,
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy: data.accuracy,
      altitude: data.altitude,
      address: data.address,
      action: data.action,
      journey_id: data.journeyId,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      created_at: now,
    });

    return this.getById(id) as Promise<GeoLog>;
  }

  async getById(id: string): Promise<GeoLog | null> {
    const row = await this.knex('geo_logs').where('id', id).first();
    return row ? this.mapToGeoLog(row) : null;
  }

  async getByEmployeeAndDate(
    employeeId: string,
    date: Date
  ): Promise<GeoLog[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const rows = await this.knex('geo_logs')
      .where('employee_id', employeeId)
      .whereBetween('created_at', [startOfDay, endOfDay])
      .orderBy('created_at', 'asc');

    return rows.map((row) => this.mapToGeoLog(row));
  }

  async getByJourneyId(journeyId: string): Promise<GeoLog[]> {
    const rows = await this.knex('geo_logs')
      .where('journey_id', journeyId)
      .orderBy('created_at', 'asc');

    return rows.map((row) => this.mapToGeoLog(row));
  }

  async getByEmployeeAndDateRange(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<GeoLog[]> {
    const rows = await this.knex('geo_logs')
      .where('employee_id', employeeId)
      .whereBetween('created_at', [startDate, endDate])
      .orderBy('created_at', 'asc');

    return rows.map((row) => this.mapToGeoLog(row));
  }

  private mapToGeoLog(row: any): GeoLog {
    let metadata: Record<string, unknown> | undefined;
    if (row.metadata) {
      try {
        metadata = JSON.parse(row.metadata);
      } catch {
        // Return undefined rather than crashing on corrupted metadata
      }
    }

    return {
      id: row.id,
      employeeId: row.employee_id,
      location: {
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        accuracy: row.accuracy,
        altitude: row.altitude,
        timestamp: row.created_at,
        address: row.address,
      },
      action: row.action,
      journeyId: row.journey_id,
      metadata,
      createdAt: row.created_at,
    };
  }
}
