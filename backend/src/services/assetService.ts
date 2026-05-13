import { Knex } from 'knex';
import { AssetRepository, Asset, CreateAssetDTO, UpdateAssetDTO, AssetFilters } from '../repositories/assetRepository';
import { EmployeeRepository } from '../repositories/employeeRepository';

export class AssetService {
  private assetRepo: AssetRepository;
  private employeeRepo: EmployeeRepository;

  constructor(private db: Knex) {
    this.assetRepo = new AssetRepository(db);
    this.employeeRepo = new EmployeeRepository(db);
  }

  async createAsset(data: CreateAssetDTO): Promise<Asset> {
    if (!data.asset_code?.trim()) throw new Error('asset_code is required');
    if (!data.name?.trim()) throw new Error('name is required');
    if (!data.category?.trim()) throw new Error('category is required');

    const taken = await this.assetRepo.isAssetCodeTaken(data.asset_code.trim());
    if (taken) throw new Error(`Asset code "${data.asset_code}" is already in use`);

    return this.assetRepo.create({ ...data, asset_code: data.asset_code.trim() });
  }

  async getAsset(id: string): Promise<Asset> {
    const asset = await this.assetRepo.findById(id);
    if (!asset) throw new Error('Asset not found');
    return asset;
  }

  async listAssets(filters: AssetFilters) {
    return this.assetRepo.findAll(filters);
  }

  async getAssetsByEmployee(employeeId: string): Promise<Asset[]> {
    const employee = await this.employeeRepo.getEmployee(employeeId);
    if (!employee) throw new Error('Employee not found');
    return this.assetRepo.findByEmployeeId(employeeId);
  }

  async updateAsset(id: string, data: UpdateAssetDTO): Promise<Asset> {
    const asset = await this.assetRepo.findById(id);
    if (!asset) throw new Error('Asset not found');
    return this.assetRepo.update(id, data);
  }

  async assignAsset(assetId: string, employeeId: string): Promise<Asset> {
    const asset = await this.assetRepo.findById(assetId);
    if (!asset) throw new Error('Asset not found');
    if (asset.status === 'assigned') throw new Error('Asset is already assigned to someone');
    if (asset.status === 'damaged' || asset.status === 'lost') {
      throw new Error(`Cannot assign an asset with status "${asset.status}"`);
    }

    const employee = await this.employeeRepo.getEmployee(employeeId);
    if (!employee) throw new Error('Employee not found');

    return this.assetRepo.assign(assetId, employeeId);
  }

  async unassignAsset(assetId: string): Promise<Asset> {
    const asset = await this.assetRepo.findById(assetId);
    if (!asset) throw new Error('Asset not found');
    if (asset.status !== 'assigned') throw new Error('Asset is not currently assigned');
    return this.assetRepo.unassign(assetId);
  }

  async deleteAsset(id: string): Promise<void> {
    const asset = await this.assetRepo.findById(id);
    if (!asset) throw new Error('Asset not found');
    if (asset.status === 'assigned') throw new Error('Cannot delete an assigned asset. Unassign it first.');
    await this.assetRepo.delete(id);
  }

  async getCategories(): Promise<string[]> {
    return this.assetRepo.getCategories();
  }
}
