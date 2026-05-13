import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';

export interface Asset {
  id: string;
  asset_code: string;
  name: string;
  category: string;
  assigned_to: string | null;
  assigned_date: Date | null;
  status: 'available' | 'assigned' | 'damaged' | 'lost' | 'returned';
  value: number | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  // joined
  assigned_employee_name?: string;
  assigned_employee_code?: string;
}

export interface CreateAssetDTO {
  asset_code: string;
  name: string;
  category: string;
  value?: number;
  notes?: string;
}

export interface UpdateAssetDTO {
  name?: string;
  category?: string;
  value?: number;
  notes?: string;
  status?: Asset['status'];
}

export interface AssetFilters {
  status?: string;
  category?: string;
  assigned_to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class AssetRepository {
  constructor(private db: Knex) {}

  async create(data: CreateAssetDTO): Promise<Asset> {
    const [asset] = await this.db('assets')
      .insert({
        id: uuidv4(),
        asset_code: data.asset_code,
        name: data.name,
        category: data.category,
        value: data.value ?? null,
        notes: data.notes ?? null,
        status: 'available',
      })
      .returning('*');
    return asset;
  }

  async findById(id: string): Promise<Asset | null> {
    const asset = await this.db('assets as a')
      .leftJoin('employees as e', 'a.assigned_to', 'e.id')
      .where('a.id', id)
      .select(
        'a.*',
        this.db.raw("CONCAT(e.first_name, ' ', e.last_name) as assigned_employee_name"),
        'e.employee_id as assigned_employee_code'
      )
      .first();
    return asset ?? null;
  }

  async findAll(filters: AssetFilters = {}): Promise<{ data: Asset[]; total: number }> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const offset = (page - 1) * limit;

    const baseQuery = () => {
      const q = this.db('assets as a')
        .leftJoin('employees as e', 'a.assigned_to', 'e.id');

      if (filters.status) q.where('a.status', filters.status);
      if (filters.category) q.where('a.category', filters.category);
      if (filters.assigned_to) q.where('a.assigned_to', filters.assigned_to);
      if (filters.search) {
        q.where((b) =>
          b
            .whereILike('a.name', `%${filters.search}%`)
            .orWhereILike('a.asset_code', `%${filters.search}%`)
            .orWhereILike('a.category', `%${filters.search}%`)
        );
      }
      return q;
    };

    const [{ count }] = await baseQuery().count('a.id as count');
    const data = await baseQuery()
      .select(
        'a.*',
        this.db.raw("CONCAT(e.first_name, ' ', e.last_name) as assigned_employee_name"),
        'e.employee_id as assigned_employee_code'
      )
      .orderBy('a.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return { data, total: Number(count) };
  }

  async findByEmployeeId(employeeId: string): Promise<Asset[]> {
    return this.db('assets').where('assigned_to', employeeId).orderBy('assigned_date', 'desc');
  }

  async update(id: string, data: UpdateAssetDTO): Promise<Asset> {
    const [asset] = await this.db('assets')
      .where('id', id)
      .update({ ...data, updated_at: this.db.fn.now() })
      .returning('*');
    return asset;
  }

  async assign(id: string, employeeId: string): Promise<Asset> {
    const [asset] = await this.db('assets')
      .where('id', id)
      .update({
        assigned_to: employeeId,
        assigned_date: this.db.fn.now(),
        status: 'assigned',
        updated_at: this.db.fn.now(),
      })
      .returning('*');
    return asset;
  }

  async unassign(id: string): Promise<Asset> {
    const [asset] = await this.db('assets')
      .where('id', id)
      .update({
        assigned_to: null,
        assigned_date: null,
        status: 'available',
        updated_at: this.db.fn.now(),
      })
      .returning('*');
    return asset;
  }

  async delete(id: string): Promise<void> {
    await this.db('assets').where('id', id).delete();
  }

  async getCategories(): Promise<string[]> {
    const rows = await this.db('assets').distinct('category').orderBy('category');
    return rows.map((r: any) => r.category);
  }

  async isAssetCodeTaken(code: string, excludeId?: string): Promise<boolean> {
    const q = this.db('assets').where('asset_code', code);
    if (excludeId) q.whereNot('id', excludeId);
    const row = await q.first();
    return !!row;
  }
}
