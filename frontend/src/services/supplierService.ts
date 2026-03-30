import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export interface SupplierBuyer {
  id: string;
  employeeId: string;
  name: string;
  type: 'supplier' | 'buyer';
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Visit {
  id: string;
  supplierBuyerId: string;
  employeeId: string;
  visitDate: Date;
  latitude: number;
  longitude: number;
  accuracy: number;
  notes?: string;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface VisitSummary {
  totalVisits: number;
  lastVisit?: Visit;
  averageVisitDuration?: number;
  visitHistory: Visit[];
}

class SupplierService {
  // Supplier/Buyer operations
  async createSupplierBuyer(data: Omit<SupplierBuyer, 'id' | 'createdAt' | 'updatedAt'>) {
    const response = await axios.post(`${API_BASE_URL}/suppliers-buyers`, data);
    return response.data;
  }

  async getSuppliersBuyers(employeeId: string) {
    const response = await axios.get(`${API_BASE_URL}/suppliers-buyers`, {
      params: { employeeId },
    });
    return response.data;
  }

  async getSupplierBuyer(id: string): Promise<SupplierBuyer> {
    const response = await axios.get(`${API_BASE_URL}/suppliers-buyers/${id}`);
    return response.data;
  }

  async updateSupplierBuyer(id: string, data: Partial<SupplierBuyer>) {
    const response = await axios.put(`${API_BASE_URL}/suppliers-buyers/${id}`, data);
    return response.data;
  }

  async deleteSupplierBuyer(id: string) {
    await axios.delete(`${API_BASE_URL}/suppliers-buyers/${id}`);
  }

  // Visit operations
  async logVisit(data: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>) {
    const response = await axios.post(`${API_BASE_URL}/suppliers-buyers/visits`, data);
    return response.data;
  }

  async getVisitHistory(supplierBuyerId: string): Promise<Visit[]> {
    const response = await axios.get(
      `${API_BASE_URL}/suppliers-buyers/${supplierBuyerId}/visits`
    );
    return response.data;
  }

  async getVisitSummary(supplierBuyerId: string): Promise<VisitSummary> {
    const response = await axios.get(
      `${API_BASE_URL}/suppliers-buyers/${supplierBuyerId}/visits/summary`
    );
    return response.data;
  }

  async getEmployeeVisits(employeeId: string, startDate?: Date, endDate?: Date) {
    const response = await axios.get(`${API_BASE_URL}/suppliers-buyers/employee/${employeeId}/visits`, {
      params: {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      },
    });
    return response.data;
  }

  async updateVisit(id: string, data: Partial<Visit>) {
    const response = await axios.put(`${API_BASE_URL}/suppliers-buyers/visits/${id}`, data);
    return response.data;
  }

  async deleteVisit(id: string) {
    await axios.delete(`${API_BASE_URL}/suppliers-buyers/visits/${id}`);
  }
}

export default new SupplierService();
