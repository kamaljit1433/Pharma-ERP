import { Knex } from 'knex';
import { Journey, GeoLocation } from '../types/geoTracking';
import { v4 as uuidv4 } from 'uuid';

export class JourneyRepository {
  constructor(private knex: Knex) {}

  async create(data: {
    employeeId: string;
    startLocation: GeoLocation;
    endLocation: GeoLocation;
    waypoints: GeoLocation[];
    totalDistance: number;
    totalDuration: number;
    purpose?: string;
    travelAllowance: number;
  }): Promise<Journey> {
    const id = uuidv4();
    const now = new Date();

    await this.knex('journeys').insert({
      id,
      employee_id: data.employeeId,
      start_latitude: data.startLocation.latitude,
      start_longitude: data.startLocation.longitude,
      end_latitude: data.endLocation.latitude,
      end_longitude: data.endLocation.longitude,
      waypoints: JSON.stringify(data.waypoints),
      total_distance: data.totalDistance,
      total_duration: data.totalDuration,
      start_time: data.startLocation.timestamp,
      end_time: data.endLocation.timestamp,
      purpose: data.purpose,
      travel_allowance: data.travelAllowance,
      status: 'In Progress',
      created_at: now,
      updated_at: now,
    });

    return this.getById(id) as Promise<Journey>;
  }

  async getById(id: string): Promise<Journey | null> {
    const row = await this.knex('journeys').where('id', id).first();
    return row ? this.mapToJourney(row) : null;
  }

  async getByEmployeeAndDate(
    employeeId: string,
    date: Date
  ): Promise<Journey[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const rows = await this.knex('journeys')
      .where('employee_id', employeeId)
      .whereBetween('start_time', [startOfDay, endOfDay])
      .orderBy('start_time', 'asc');

    return rows.map((row) => this.mapToJourney(row));
  }

  async getByEmployeeAndMonth(
    employeeId: string,
    month: number,
    year: number
  ): Promise<Journey[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const rows = await this.knex('journeys')
      .where('employee_id', employeeId)
      .where('status', 'Completed')
      .whereBetween('start_time', [startDate, endDate])
      .orderBy('start_time', 'asc');

    return rows.map((row) => this.mapToJourney(row));
  }

  async updateStatus(
    id: string,
    status: 'In Progress' | 'Completed' | 'Cancelled'
  ): Promise<Journey | null> {
    const now = new Date();

    await this.knex('journeys')
      .where('id', id)
      .update({
        status,
        updated_at: now,
      });

    return this.getById(id);
  }

  async approve(
    id: string,
    approvedBy: string,
    notes?: string
  ): Promise<Journey | null> {
    const now = new Date();

    await this.knex('journeys')
      .where('id', id)
      .update({
        status: 'Completed',
        approved_by: approvedBy,
        approved_at: now,
        approval_notes: notes,
        updated_at: now,
      });

    return this.getById(id);
  }

  private mapToJourney(row: any): Journey {
    let waypoints: any[] = [];
    if (row.waypoints) {
      try {
        waypoints = JSON.parse(row.waypoints);
      } catch {
        // Return empty array rather than crashing on corrupted waypoints
      }
    }

    return {
      id: row.id,
      employeeId: row.employee_id,
      startLocation: {
        latitude: Number(row.start_latitude),
        longitude: Number(row.start_longitude),
        timestamp: row.start_time,
      },
      endLocation: {
        latitude: Number(row.end_latitude),
        longitude: Number(row.end_longitude),
        timestamp: row.end_time,
      },
      waypoints,
      totalDistance: Number(row.total_distance),
      totalDuration: Number(row.total_duration),
      startTime: row.start_time,
      endTime: row.end_time,
      purpose: row.purpose,
      travelAllowance: Number(row.travel_allowance),
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
