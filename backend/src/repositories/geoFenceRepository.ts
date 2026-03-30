import { Knex } from 'knex';
import { GeoFence, GeoLocation } from '../types/geoTracking';
import { v4 as uuidv4 } from 'uuid';

export class GeoFenceRepository {
  constructor(private knex: Knex) {}

  async create(data: {
    name: string;
    latitude: number;
    longitude: number;
    radius: number;
    type: 'Office' | 'Site' | 'Restricted' | 'Custom';
  }): Promise<GeoFence> {
    const id = uuidv4();
    const now = new Date();

    await this.knex('geo_fences').insert({
      id,
      name: data.name,
      latitude: data.latitude,
      longitude: data.longitude,
      radius: data.radius,
      type: data.type,
      enabled: true,
      created_at: now,
      updated_at: now,
    });

    return this.getById(id) as Promise<GeoFence>;
  }

  async getById(id: string): Promise<GeoFence | null> {
    const row = await this.knex('geo_fences').where('id', id).first();
    return row ? this.mapToGeoFence(row) : null;
  }

  async getAll(): Promise<GeoFence[]> {
    const rows = await this.knex('geo_fences').orderBy('created_at', 'desc');
    return rows.map((row) => this.mapToGeoFence(row));
  }

  async getEnabled(): Promise<GeoFence[]> {
    const rows = await this.knex('geo_fences')
      .where('enabled', true)
      .orderBy('created_at', 'desc');
    return rows.map((row) => this.mapToGeoFence(row));
  }

  async getByType(type: 'Office' | 'Site' | 'Restricted' | 'Custom'): Promise<GeoFence[]> {
    const rows = await this.knex('geo_fences')
      .where('type', type)
      .where('enabled', true)
      .orderBy('created_at', 'desc');
    return rows.map((row) => this.mapToGeoFence(row));
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      latitude: number;
      longitude: number;
      radius: number;
      type: 'Office' | 'Site' | 'Restricted' | 'Custom';
      enabled: boolean;
    }>
  ): Promise<GeoFence | null> {
    const now = new Date();

    await this.knex('geo_fences')
      .where('id', id)
      .update({
        ...data,
        updated_at: now,
      });

    return this.getById(id);
  }

  async delete(id: string): Promise<void> {
    await this.knex('geo_fences').where('id', id).delete();
  }

  private mapToGeoFence(row: any): GeoFence {
    return {
      id: row.id,
      name: row.name,
      center: {
        latitude: row.latitude,
        longitude: row.longitude,
        timestamp: row.created_at,
      },
      radius: row.radius,
      type: row.type,
      enabled: row.enabled,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
