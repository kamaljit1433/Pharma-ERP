import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export interface Department {
  id: string;
  name: string;
  description?: string;
  parentDepartmentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Designation {
  id: string;
  name: string;
  description?: string;
  departmentId: string;
  level: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface HierarchyNode {
  id: string;
  employeeId: string;
  employeeName: string;
  designationId: string;
  designationName: string;
  departmentId: string;
  departmentName: string;
  managerId?: string;
  managerName?: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  children?: HierarchyNode[];
}

export interface OrgChartData {
  root: HierarchyNode;
  totalEmployees: number;
  totalDepartments: number;
}

class HierarchyService {
  // Department operations
  async createDepartment(data: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>) {
    const response = await axios.post(`${API_BASE_URL}/hierarchy/departments`, data);
    return response.data;
  }

  async getDepartments() {
    const response = await axios.get(`${API_BASE_URL}/hierarchy/departments`);
    return response.data;
  }

  async updateDepartment(id: string, data: Partial<Department>) {
    const response = await axios.put(`${API_BASE_URL}/hierarchy/departments/${id}`, data);
    return response.data;
  }

  async deleteDepartment(id: string) {
    await axios.delete(`${API_BASE_URL}/hierarchy/departments/${id}`);
  }

  // Designation operations
  async createDesignation(data: Omit<Designation, 'id' | 'createdAt' | 'updatedAt'>) {
    const response = await axios.post(`${API_BASE_URL}/hierarchy/designations`, data);
    return response.data;
  }

  async getDesignations(departmentId?: string) {
    const response = await axios.get(`${API_BASE_URL}/hierarchy/designations`, {
      params: { departmentId },
    });
    return response.data;
  }

  async updateDesignation(id: string, data: Partial<Designation>) {
    const response = await axios.put(`${API_BASE_URL}/hierarchy/designations/${id}`, data);
    return response.data;
  }

  async deleteDesignation(id: string) {
    await axios.delete(`${API_BASE_URL}/hierarchy/designations/${id}`);
  }

  // Hierarchy operations
  async getOrgChart(rootEmployeeId?: string): Promise<OrgChartData> {
    const response = await axios.get(`${API_BASE_URL}/hierarchy/org-chart`, {
      params: { rootEmployeeId },
    });
    return response.data;
  }

  async getEmployeeHierarchy(employeeId: string): Promise<HierarchyNode> {
    const response = await axios.get(`${API_BASE_URL}/hierarchy/employees/${employeeId}`);
    return response.data;
  }

  async getDirectReports(managerId: string): Promise<HierarchyNode[]> {
    const response = await axios.get(`${API_BASE_URL}/hierarchy/managers/${managerId}/reports`);
    return response.data;
  }

  async getReportingChain(employeeId: string): Promise<HierarchyNode[]> {
    const response = await axios.get(`${API_BASE_URL}/hierarchy/employees/${employeeId}/chain`);
    return response.data;
  }

  async updateEmployeePosition(employeeId: string, data: {
    designationId: string;
    departmentId: string;
    managerId?: string;
    startDate: Date;
  }) {
    const response = await axios.put(
      `${API_BASE_URL}/hierarchy/employees/${employeeId}/position`,
      data
    );
    return response.data;
  }
}

export default new HierarchyService();
