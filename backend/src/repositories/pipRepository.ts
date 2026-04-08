import { Knex } from 'knex';
import { randomUUID } from 'crypto';

export interface PIP {
  id: string;
  employee_id: string;
  title: string;
  description?: string;
  start_date: Date;
  end_date: Date;
  status: string;
  goals: string[];
  outcome_notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Checkpoint {
  id: string;
  pip_id: string;
  date: Date;
  notes: string;
  status: string;
  created_at: Date;
}

export interface CreatePIPInput {
  employee_id?: string;
  employeeId?: string;       // legacy camelCase alias
  title?: string;
  description?: string;
  start_date?: Date;
  startDate?: Date;          // legacy camelCase alias
  end_date?: Date;
  endDate?: Date;            // legacy camelCase alias
  status?: string;
  goals?: string[];
  initiated_by?: string;
  initiatedBy?: string;      // legacy camelCase alias
}

export interface UpdatePIPInput {
  title?: string;
  description?: string;
  start_date?: Date;
  end_date?: Date;
  status?: string;
  goals?: string[];
  outcome_notes?: string;
}

export interface CreateCheckpointInput {
  date: Date;
  notes: string;
  status: string;
}

export class PIPRepository {
  constructor(private db: Knex) {}

  async createPIP(data: CreatePIPInput): Promise<PIP> {
    const employeeId = data.employee_id || data.employeeId!;
    const startDate = data.start_date || data.startDate!;
    const endDate = data.end_date || data.endDate!;
    const initiatedBy = data.initiated_by || data.initiatedBy || employeeId;

    const [row] = await this.db('pips')
      .insert({
        employee_id: employeeId,
        initiated_by: initiatedBy,
        title: data.title || 'PIP',
        description: data.description || null,
        start_date: startDate,
        end_date: endDate,
        status: data.status || 'active',
        objectives: JSON.stringify(data.goals || []),
        checkpoints: JSON.stringify([]),
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');

    return this.mapPIP(row);
  }

  async getPIPById(id: string): Promise<PIP | null> {
    const row = await this.db('pips').where({ id }).first();
    return row ? this.mapPIP(row) : null;
  }

  async getPIPByEmployee(employeeId: string): Promise<PIP[]> {
    const rows = await this.db('pips')
      .where({ employee_id: employeeId })
      .orderBy('created_at', 'desc');
    return rows.map((r: any) => this.mapPIP(r));
  }

  async getPIPsByEmployee(employeeId: string): Promise<PIP[]> {
    return this.getPIPByEmployee(employeeId);
  }

  async getActivePIPs(): Promise<PIP[]> {
    const rows = await this.db('pips')
      .where({ status: 'active' })
      .orderBy('created_at', 'desc');
    return rows.map((r: any) => this.mapPIP(r));
  }

  async updatePIP(id: string, data: UpdatePIPInput): Promise<PIP> {
    const updateData: any = { updated_at: new Date() };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.start_date !== undefined) updateData.start_date = data.start_date;
    if (data.end_date !== undefined) updateData.end_date = data.end_date;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.goals !== undefined) updateData.objectives = JSON.stringify(data.goals);
    if (data.outcome_notes !== undefined) updateData.outcome_notes = data.outcome_notes;

    const [row] = await this.db('pips')
      .where({ id })
      .update(updateData)
      .returning('*');

    return this.mapPIP(row);
  }

  async addCheckpoint(pipId: string, data: CreateCheckpointInput): Promise<Checkpoint> {
    const pip = await this.db('pips').where({ id: pipId }).first();
    if (!pip) throw new Error('PIP not found');

    const existing: any[] = pip.checkpoints
      ? (typeof pip.checkpoints === 'string' ? JSON.parse(pip.checkpoints) : pip.checkpoints)
      : [];

    const checkpoint = {
      id: randomUUID(),
      pip_id: pipId,
      date: data.date.toISOString(),
      notes: data.notes,
      status: data.status,
      created_at: new Date().toISOString(),
    };

    existing.push(checkpoint);

    await this.db('pips')
      .where({ id: pipId })
      .update({ checkpoints: JSON.stringify(existing), updated_at: new Date() });

    return {
      ...checkpoint,
      date: new Date(checkpoint.date),
      created_at: new Date(checkpoint.created_at),
    };
  }

  async getCheckpoints(pipId: string): Promise<Checkpoint[]> {
    const pip = await this.db('pips').where({ id: pipId }).first();
    if (!pip) return [];

    const checkpoints: any[] = pip.checkpoints
      ? (typeof pip.checkpoints === 'string' ? JSON.parse(pip.checkpoints) : pip.checkpoints)
      : [];

    return checkpoints.map((c) => ({
      id: c.id,
      pip_id: c.pip_id,
      date: new Date(c.date),
      notes: c.notes,
      status: c.status,
      created_at: new Date(c.created_at),
    }));
  }

  // Legacy method used by pipService
  async createPIPCheckIn(data: { pipId: string; checkInDate: Date; progress: string; notes: string; status: string; recordedBy: string }): Promise<any> {
    return this.addCheckpoint(data.pipId, {
      date: data.checkInDate,
      notes: data.notes,
      status: data.status,
    });
  }

  async updatePIPStatus(id: string, status: string, outcome?: string): Promise<void> {
    const updateData: any = { status, updated_at: new Date() };
    if (outcome) updateData.outcome_notes = outcome;
    await this.db('pips').where({ id }).update(updateData);
  }

  async deletePIP(id: string): Promise<void> {
    await this.db('pips').where({ id }).delete();
  }

  private parseDate(value: any): Date {
    if (value instanceof Date) {
      return new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()));
    }
    const s = String(value);
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(s + 'T00:00:00.000Z');
    return new Date(value);
  }

  private mapPIP(row: any): PIP {
    return {
      id: row.id,
      employee_id: row.employee_id,
      title: row.title,
      description: row.description || undefined,
      start_date: this.parseDate(row.start_date),
      end_date: this.parseDate(row.end_date),
      status: row.status,
      goals: row.objectives
        ? (typeof row.objectives === 'string' ? JSON.parse(row.objectives) : row.objectives)
        : [],
      outcome_notes: row.outcome_notes || undefined,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }
}
