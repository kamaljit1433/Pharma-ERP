import { Knex } from 'knex';

export interface DeviceToken {
  id: string;
  employee_id: string;
  token: string;
  device_type: 'web' | 'mobile' | 'desktop';
  is_active: boolean;
  last_used_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export class DeviceTokenRepository {
  constructor(private knex: Knex) {}

  async upsert(
    employeeId: string,
    token: string,
    deviceType: 'web' | 'mobile' | 'desktop' = 'web'
  ): Promise<DeviceToken> {
    const existing = await this.knex('employee_device_tokens')
      .where({ employee_id: employeeId, token })
      .first();

    if (existing) {
      const [updated] = await this.knex('employee_device_tokens')
        .where({ employee_id: employeeId, token })
        .update({ is_active: true, device_type: deviceType, last_used_at: new Date(), updated_at: new Date() })
        .returning('*');
      return updated;
    }

    const [created] = await this.knex('employee_device_tokens')
      .insert({
        employee_id: employeeId,
        token,
        device_type: deviceType,
        is_active: true,
        last_used_at: new Date(),
      })
      .returning('*');
    return created;
  }

  async getActiveByEmployeeId(employeeId: string): Promise<DeviceToken[]> {
    return this.knex('employee_device_tokens')
      .where({ employee_id: employeeId, is_active: true })
      .orderBy('last_used_at', 'desc');
  }

  async getActiveByEmployeeIds(employeeIds: string[]): Promise<DeviceToken[]> {
    return this.knex('employee_device_tokens')
      .whereIn('employee_id', employeeIds)
      .where('is_active', true);
  }

  async deactivate(employeeId: string, token: string): Promise<number> {
    return this.knex('employee_device_tokens')
      .where({ employee_id: employeeId, token })
      .update({ is_active: false, updated_at: new Date() });
  }

  async deactivateAll(employeeId: string): Promise<number> {
    return this.knex('employee_device_tokens')
      .where({ employee_id: employeeId })
      .update({ is_active: false, updated_at: new Date() });
  }

  async updateLastUsed(token: string): Promise<void> {
    await this.knex('employee_device_tokens')
      .where({ token })
      .update({ last_used_at: new Date(), updated_at: new Date() });
  }

  async pruneStale(daysInactive: number = 90): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysInactive);
    return this.knex('employee_device_tokens')
      .where('last_used_at', '<', cutoff)
      .orWhereNull('last_used_at')
      .where('is_active', true)
      .update({ is_active: false, updated_at: new Date() });
  }
}
