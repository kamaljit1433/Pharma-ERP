import { Knex } from 'knex';
import { PIP, PIPCheckIn, CreatePIPDTO, CreatePIPCheckInDTO } from '../types/performance';

export class PIPRepository {
  constructor(private db: Knex) {}

  async createPIP(data: CreatePIPDTO & { initiatedBy: string }): Promise<PIP> {
    const ids = await this.db('pips').insert({
      employee_id: data.employeeId,
      initiated_by: data.initiatedBy,
      goals: JSON.stringify(data.goals),
      start_date: data.startDate,
      end_date: data.endDate,
      status: 'Active',
      created_at: new Date(),
      updated_at: new Date(),
    });

    const id = Array.isArray(ids) ? ids[0] : ids;
    if (!id) {
      throw new Error('Failed to create PIP');
    }
    return this.getPIPById(id.toString()) as Promise<PIP>;
  }

  async getPIPById(id: string): Promise<PIP | null> {
    const pip = await this.db('pips').where('id', id).first();

    if (!pip) {
      return null;
    }

    const checkIns = await this.getPIPCheckIns(id);

    return this.mapPIP(pip, checkIns);
  }

  async getPIPByEmployee(employeeId: string): Promise<PIP[]> {
    const pips = await this.db('pips')
      .where('employee_id', employeeId)
      .orderBy('created_at', 'desc');

    const result: PIP[] = [];
    for (const pip of pips) {
      const checkIns = await this.getPIPCheckIns(pip.id);
      result.push(this.mapPIP(pip, checkIns));
    }

    return result;
  }

  async getActivePIPs(): Promise<PIP[]> {
    const pips = await this.db('pips')
      .where('status', 'Active')
      .orderBy('created_at', 'desc');

    const result: PIP[] = [];
    for (const pip of pips) {
      const checkIns = await this.getPIPCheckIns(pip.id);
      result.push(this.mapPIP(pip, checkIns));
    }

    return result;
  }

  async createPIPCheckIn(data: CreatePIPCheckInDTO & { recordedBy: string }): Promise<PIPCheckIn> {
    const ids = await this.db('pip_check_ins').insert({
      pip_id: data.pipId,
      check_in_date: data.checkInDate,
      progress: data.progress,
      notes: data.notes,
      status: data.status,
      recorded_by: data.recordedBy,
      recorded_at: new Date(),
    });

    const id = Array.isArray(ids) ? ids[0] : ids;
    if (!id) {
      throw new Error('Failed to create PIP check-in');
    }
    return this.getPIPCheckInById(id.toString()) as Promise<PIPCheckIn>;
  }

  async getPIPCheckInById(id: string): Promise<PIPCheckIn | null> {
    const checkIn = await this.db('pip_check_ins').where('id', id).first();

    if (!checkIn) {
      return null;
    }

    return this.mapPIPCheckIn(checkIn);
  }

  async getPIPCheckIns(pipId: string): Promise<PIPCheckIn[]> {
    const checkIns = await this.db('pip_check_ins')
      .where('pip_id', pipId)
      .orderBy('check_in_date', 'asc');
    return checkIns.map((checkIn) => this.mapPIPCheckIn(checkIn));
  }

  async updatePIPStatus(id: string, status: string, outcome?: string): Promise<void> {
    const updateData: any = {
      status,
      updated_at: new Date(),
    };

    if (outcome) {
      updateData.outcome = outcome;
    }

    await this.db('pips').where('id', id).update(updateData);
  }

  async deletePIP(id: string): Promise<void> {
    await this.db('pip_check_ins').where('pip_id', id).delete();
    await this.db('pips').where('id', id).delete();
  }

  private mapPIP(dbPIP: any, checkIns: PIPCheckIn[]): PIP {
    return {
      id: dbPIP.id,
      employeeId: dbPIP.employee_id,
      initiatedBy: dbPIP.initiated_by,
      goals: dbPIP.goals ? JSON.parse(dbPIP.goals) : [],
      startDate: new Date(dbPIP.start_date),
      endDate: new Date(dbPIP.end_date),
      checkIns,
      outcome: dbPIP.outcome,
      status: dbPIP.status,
      createdAt: new Date(dbPIP.created_at),
      updatedAt: new Date(dbPIP.updated_at),
    };
  }

  private mapPIPCheckIn(dbCheckIn: any): PIPCheckIn {
    return {
      id: dbCheckIn.id,
      pipId: dbCheckIn.pip_id,
      checkInDate: new Date(dbCheckIn.check_in_date),
      progress: dbCheckIn.progress,
      notes: dbCheckIn.notes,
      status: dbCheckIn.status,
      recordedBy: dbCheckIn.recorded_by,
      recordedAt: new Date(dbCheckIn.recorded_at),
    };
  }
}
