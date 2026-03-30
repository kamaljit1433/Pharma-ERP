import { Knex } from 'knex';
import { AssetRecoveryChecklist, CreateAssetRecoveryDTO, UpdateAssetRecoveryDTO } from '../types/separation';
import { v4 as uuidv4 } from 'uuid';

export class AssetRecoveryRepository {
  constructor(private db: Knex) {}

  async createAssetRecovery(employeeId: string, data: CreateAssetRecoveryDTO): Promise<AssetRecoveryChecklist> {
    const id = uuidv4();

    const [recovery] = await this.db('asset_recovery_checklists')
      .insert({
        id,
        employee_id: employeeId,
        asset_id: data.asset_id,
        status: data.status || 'pending',
        damage_cost: data.damage_cost,
        notes: data.notes,
      })
      .returning('*');

    return recovery;
  }

  async getAssetRecovery(id: string): Promise<AssetRecoveryChecklist | null> {
    return this.db('asset_recovery_checklists').where('id', id).first();
  }

  async getAssetRecoveriesByEmployeeId(employeeId: string): Promise<AssetRecoveryChecklist[]> {
    return this.db('asset_recovery_checklists')
      .where('employee_id', employeeId)
      .orderBy('created_at', 'desc');
  }

  async updateAssetRecovery(id: string, data: UpdateAssetRecoveryDTO): Promise<AssetRecoveryChecklist> {
    const [recovery] = await this.db('asset_recovery_checklists')
      .where('id', id)
      .update({
        ...data,
        updated_at: this.db.fn.now(),
      })
      .returning('*');

    return recovery;
  }

  async markAssetAsReturned(id: string): Promise<AssetRecoveryChecklist> {
    const [recovery] = await this.db('asset_recovery_checklists')
      .where('id', id)
      .update({
        status: 'returned',
        damage_cost: 0,
        updated_at: this.db.fn.now(),
      })
      .returning('*');

    return recovery;
  }

  async markAssetAsDamaged(id: string, damageCost: number): Promise<AssetRecoveryChecklist> {
    const [recovery] = await this.db('asset_recovery_checklists')
      .where('id', id)
      .update({
        status: 'damaged',
        damage_cost: damageCost,
        updated_at: this.db.fn.now(),
      })
      .returning('*');

    return recovery;
  }

  async markAssetAsMissing(id: string): Promise<AssetRecoveryChecklist> {
    const [recovery] = await this.db('asset_recovery_checklists')
      .where('id', id)
      .update({
        status: 'missing',
        updated_at: this.db.fn.now(),
      })
      .returning('*');

    return recovery;
  }

  async getAssetRecoveriesByStatus(employeeId: string, status: string): Promise<AssetRecoveryChecklist[]> {
    return this.db('asset_recovery_checklists')
      .where('employee_id', employeeId)
      .where('status', status)
      .orderBy('created_at', 'desc');
  }

  async getUnreturnedAssets(employeeId: string): Promise<AssetRecoveryChecklist[]> {
    return this.db('asset_recovery_checklists')
      .where('employee_id', employeeId)
      .whereIn('status', ['damaged', 'missing'])
      .orderBy('created_at', 'desc');
  }

  async getTotalDamageCost(employeeId: string): Promise<number> {
    const result = await this.db('asset_recovery_checklists')
      .where('employee_id', employeeId)
      .sum('damage_cost as total')
      .first();
    return Number(result?.['total'] || 0);
  }

  async getAllAssetRecoveries(limit: number = 50, offset: number = 0): Promise<AssetRecoveryChecklist[]> {
    return this.db('asset_recovery_checklists')
      .limit(limit)
      .offset(offset)
      .orderBy('created_at', 'desc');
  }

  async getAssetRecoveryCount(): Promise<number> {
    const result = await this.db('asset_recovery_checklists')
      .count('id as count')
      .first();
    return Number(result?.['count'] || 0);
  }

  async deleteAssetRecovery(id: string): Promise<void> {
    await this.db('asset_recovery_checklists').where('id', id).delete();
  }
}
