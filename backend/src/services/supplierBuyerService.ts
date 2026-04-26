import { SupplierBuyerRepository } from '../repositories/supplierBuyerRepository';
import { VisitRepository } from '../repositories/visitRepository';
import {
  SupplierBuyer,
  Visit,
  CreateSupplierBuyerDTO,
  UpdateSupplierBuyerDTO,
  CreateVisitDTO,
  VisitHistoryEntry,
} from '../types/supplierBuyer';

export class SupplierBuyerService {
  constructor(
    private supplierBuyerRepository: SupplierBuyerRepository,
    private visitRepository: VisitRepository
  ) {}

  // Supplier/Buyer CRUD Operations
  async createSupplierBuyer(employeeId: string, data: CreateSupplierBuyerDTO): Promise<SupplierBuyer> {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Supplier/Buyer name is required');
    }

    if (!['supplier', 'buyer'].includes(data.type)) {
      throw new Error('Type must be either "supplier" or "buyer"');
    }

    return this.supplierBuyerRepository.createSupplierBuyer(employeeId, data);
  }

  async getSupplierBuyer(id: string): Promise<SupplierBuyer> {
    const supplierBuyer = await this.supplierBuyerRepository.getSupplierBuyerById(id);
    if (!supplierBuyer) {
      throw new Error(`Supplier/Buyer with ID ${id} not found`);
    }
    return supplierBuyer;
  }

  async updateSupplierBuyer(id: string, data: UpdateSupplierBuyerDTO): Promise<SupplierBuyer> {
    const supplierBuyer = await this.supplierBuyerRepository.getSupplierBuyerById(id);
    if (!supplierBuyer) {
      throw new Error(`Supplier/Buyer with ID ${id} not found`);
    }

    if (data.type && !['supplier', 'buyer'].includes(data.type)) {
      throw new Error('Type must be either "supplier" or "buyer"');
    }

    return this.supplierBuyerRepository.updateSupplierBuyer(id, data);
  }

  async deleteSupplierBuyer(id: string): Promise<void> {
    const supplierBuyer = await this.supplierBuyerRepository.getSupplierBuyerById(id);
    if (!supplierBuyer) {
      throw new Error(`Supplier/Buyer with ID ${id} not found`);
    }

    await this.supplierBuyerRepository.deleteSupplierBuyer(id);
  }

  async getSupplierBuyersByEmployee(employeeId: string): Promise<SupplierBuyer[]> {
    return this.supplierBuyerRepository.getSupplierBuyersByEmployee(employeeId);
  }

  async getSupplierBuyersByType(employeeId: string, type: 'supplier' | 'buyer'): Promise<SupplierBuyer[]> {
    if (!['supplier', 'buyer'].includes(type)) {
      throw new Error('Type must be either "supplier" or "buyer"');
    }
    return this.supplierBuyerRepository.getSupplierBuyersByType(employeeId, type);
  }

  async searchSupplierBuyers(employeeId: string, searchTerm: string): Promise<SupplierBuyer[]> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return this.supplierBuyerRepository.getSupplierBuyersByEmployee(employeeId);
    }
    return this.supplierBuyerRepository.searchSupplierBuyers(employeeId, searchTerm);
  }

  // Visit Operations
  async logVisit(
    supplierBuyerId: string,
    employeeId: string,
    data: CreateVisitDTO
  ): Promise<Visit> {
    const supplierBuyer = await this.supplierBuyerRepository.getSupplierBuyerById(supplierBuyerId);
    if (!supplierBuyer) {
      throw new Error(`Supplier/Buyer with ID ${supplierBuyerId} not found`);
    }

    if (supplierBuyer.employee_id !== employeeId) {
      throw new Error('Unauthorized: Employee can only log visits for their own supplier/buyer records');
    }

    if (!data.visit_date || (typeof data.visit_date === 'string' && data.visit_date.trim().length === 0)) {
      throw new Error('Visit date is required');
    }

    return this.visitRepository.createVisit({
      ...data,
      record_id: supplierBuyerId
    });
  }

  async getVisit(id: string): Promise<Visit> {
    const visit = await this.visitRepository.getVisitById(id);
    if (!visit) {
      throw new Error(`Visit with ID ${id} not found`);
    }
    return visit;
  }

  async getVisitHistory(supplierBuyerId: string): Promise<VisitHistoryEntry[]> {
    const supplierBuyer = await this.supplierBuyerRepository.getSupplierBuyerById(supplierBuyerId);
    if (!supplierBuyer) {
      throw new Error(`Supplier/Buyer with ID ${supplierBuyerId} not found`);
    }

    return this.visitRepository.getVisitHistory(supplierBuyerId);
  }

  async getRecentVisits(supplierBuyerId: string, limit: number = 10): Promise<Visit[]> {
    const supplierBuyer = await this.supplierBuyerRepository.getSupplierBuyerById(supplierBuyerId);
    if (!supplierBuyer) {
      throw new Error(`Supplier/Buyer with ID ${supplierBuyerId} not found`);
    }

    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    return this.visitRepository.getRecentVisits(supplierBuyerId, limit);
  }

  async getVisitsByDateRange(
    supplierBuyerId: string,
    startDate: string,
    endDate: string
  ): Promise<Visit[]> {
    const supplierBuyer = await this.supplierBuyerRepository.getSupplierBuyerById(supplierBuyerId);
    if (!supplierBuyer) {
      throw new Error(`Supplier/Buyer with ID ${supplierBuyerId} not found`);
    }

    return this.visitRepository.getVisitsByDateRange(startDate, endDate);
  }

  async updateVisit(id: string, data: Partial<CreateVisitDTO>): Promise<Visit> {
    const visit = await this.visitRepository.getVisitById(id);
    if (!visit) {
      throw new Error(`Visit with ID ${id} not found`);
    }

    return this.visitRepository.updateVisit(id, data);
  }

  async deleteVisit(id: string): Promise<void> {
    const visit = await this.visitRepository.getVisitById(id);
    if (!visit) {
      throw new Error(`Visit with ID ${id} not found`);
    }

    await this.visitRepository.deleteVisit(id);
  }

  async getVisitCount(supplierBuyerId: string): Promise<number> {
    const supplierBuyer = await this.supplierBuyerRepository.getSupplierBuyerById(supplierBuyerId);
    if (!supplierBuyer) {
      throw new Error(`Supplier/Buyer with ID ${supplierBuyerId} not found`);
    }

    return this.visitRepository.getVisitCount(supplierBuyerId);
  }

  async getSupplierBuyerCount(employeeId: string): Promise<number> {
    return this.supplierBuyerRepository.getSupplierBuyerCount(employeeId);
  }
}
