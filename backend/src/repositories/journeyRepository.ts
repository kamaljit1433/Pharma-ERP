import { Knex } from 'knex';

export interface Journey {
  id: string;
  employee_id: string;
  supplier_buyer_id: string;
  start_location: { latitude: number; longitude: number } | null;
  end_location: { latitude: number; longitude: number } | null;
  distance: number;
  duration: number;
  travel_date: Date;
  purpose: string | null;
  notes: string | null;
  created_at: Date;
}

export interface CreateJourneyDTO {
  employee_id: string;
  supplier_buyer_id: string;
  start_location?: { latitude: number; longitude: number };
  end_location?: { latitude: number; longitude: number };
  distance?: number;
  duration?: number;
  travel_date: Date;
  purpose?: string;
  notes?: string;
}

export interface UpdateJourneyDTO {
  start_location?: { latitude: number; longitude: number };
  end_location?: { latitude: number; longitude: number };
  distance?: number;
  duration?: number;
  travel_date?: Date;
  purpose?: string;
  notes?: string;
}

export class JourneyRepository {
  constructor(private knex: Knex) {}

  private mapRow(row: any): Journey {
    return {
      id: row.id,
      employee_id: row.employee_id,
      supplier_buyer_id: row.supplier_buyer_id,
      start_location: row.latitude != null
        ? { latitude: Number(row.latitude), longitude: Number(row.longitude) }
        : null,
      end_location: row.end_latitude != null
        ? { latitude: Number(row.end_latitude), longitude: Number(row.end_longitude) }
        : null,
      distance: Number(row.distance ?? 0),
      duration: Number(row.duration_minutes ?? 0),
      travel_date: row.visit_date,
      purpose: row.purpose,
      notes: row.notes,
      created_at: row.created_at,
    };
  }

  async createJourney(data: CreateJourneyDTO): Promise<Journey> {
    const [row] = await this.knex('visits')
      .insert({
        employee_id: data.employee_id,
        supplier_buyer_id: data.supplier_buyer_id,
        visit_date: data.travel_date,
        latitude: data.start_location?.latitude ?? null,
        longitude: data.start_location?.longitude ?? null,
        purpose: data.purpose ?? null,
        notes: data.notes ?? null,
        duration_minutes: data.duration ?? 0,
      })
      .returning('*');

    return this.mapRow({ ...row, distance: data.distance ?? 0 });
  }

  async getJourneyById(id: string): Promise<Journey | null> {
    const row = await this.knex('visits').where({ id }).first();
    return row ? this.mapRow(row) : null;
  }

  async getJourneysByEmployee(employeeId: string): Promise<Journey[]> {
    const rows = await this.knex('visits')
      .where({ employee_id: employeeId })
      .orderBy('visit_date', 'desc');
    return rows.map((r) => this.mapRow(r));
  }

  async getJourneysByDateRange(startDate: Date, endDate: Date): Promise<Journey[]> {
    const rows = await this.knex('visits')
      .whereBetween('visit_date', [startDate, endDate])
      .orderBy('visit_date', 'asc');
    return rows.map((r) => this.mapRow(r));
  }

  async updateJourney(id: string, data: UpdateJourneyDTO): Promise<Journey> {
    const updateData: Record<string, any> = {};
    if (data.start_location) {
      updateData['latitude'] = data.start_location.latitude;
      updateData['longitude'] = data.start_location.longitude;
    }
    if (data.travel_date !== undefined) updateData['visit_date'] = data.travel_date;
    if (data.purpose !== undefined) updateData['purpose'] = data.purpose;
    if (data.notes !== undefined) updateData['notes'] = data.notes;
    if (data.duration !== undefined) updateData['duration_minutes'] = data.duration;

    const [row] = await this.knex('visits')
      .where({ id })
      .update(updateData)
      .returning('*');

    if (!row) throw new Error(`Journey with id ${id} not found`);

    return this.mapRow({ ...row, distance: data.distance ?? 0 });
  }

  async deleteJourney(id: string): Promise<void> {
    await this.knex('visits').where({ id }).delete();
  }
}
