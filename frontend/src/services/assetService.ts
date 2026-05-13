import apiClient from './api';

export interface Asset {
  id: string;
  asset_code: string;
  name: string;
  category: string;
  assigned_to: string | null;
  assigned_date: string | null;
  status: 'available' | 'assigned' | 'damaged' | 'lost' | 'returned';
  value: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  assigned_employee_name?: string;
  assigned_employee_code?: string;
}

export interface AssetFilters {
  status?: string;
  category?: string;
  assigned_to?: string;
  search?: string;
  page?: number;
  limit?: number;
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

class AssetService {
  async list(filters: AssetFilters = {}): Promise<{ data: Asset[]; total: number }> {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.category) params.set('category', filters.category);
    if (filters.assigned_to) params.set('assigned_to', filters.assigned_to);
    if (filters.search) params.set('search', filters.search);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    const res = await apiClient.get(`/assets?${params.toString()}`);
    return { data: res.data.data ?? [], total: res.data.total ?? 0 };
  }

  async get(id: string): Promise<Asset> {
    const res = await apiClient.get(`/assets/${id}`);
    return res.data.data;
  }

  async getByEmployee(employeeId: string): Promise<Asset[]> {
    const res = await apiClient.get(`/assets/employee/${employeeId}`);
    return res.data.data ?? [];
  }

  async create(data: CreateAssetDTO): Promise<Asset> {
    const res = await apiClient.post('/assets', data);
    return res.data.data;
  }

  async update(id: string, data: UpdateAssetDTO): Promise<Asset> {
    const res = await apiClient.put(`/assets/${id}`, data);
    return res.data.data;
  }

  async assign(assetId: string, employeeId: string): Promise<Asset> {
    const res = await apiClient.post(`/assets/${assetId}/assign`, { employeeId });
    return res.data.data;
  }

  async unassign(assetId: string): Promise<Asset> {
    const res = await apiClient.post(`/assets/${assetId}/unassign`, {});
    return res.data.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/assets/${id}`);
  }

  async getCategories(): Promise<string[]> {
    const res = await apiClient.get('/assets/categories');
    return res.data.data ?? [];
  }
}

export const assetService = new AssetService();
