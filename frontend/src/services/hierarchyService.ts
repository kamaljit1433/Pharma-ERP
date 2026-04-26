import apiClient from './api';

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
  profilePhotoUrl?: string;
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
    const response = await apiClient.post('/hierarchy/departments', data);
    return response.data;
  }

  async getDepartments() {
    const response = await apiClient.get('/hierarchy/departments');
    return response.data;
  }

  async updateDepartment(id: string, data: Partial<Department>) {
    const response = await apiClient.put(`/hierarchy/departments/${id}`, data);
    return response.data;
  }

  async deleteDepartment(id: string) {
    await apiClient.delete(`/hierarchy/departments/${id}`);
  }

  // Designation operations
  async createDesignation(data: Omit<Designation, 'id' | 'createdAt' | 'updatedAt'>) {
    const response = await apiClient.post('/hierarchy/designations', data);
    return response.data;
  }

  async getDesignations(departmentId?: string) {
    const response = await apiClient.get('/hierarchy/designations', {
      params: { departmentId },
    });
    return response.data;
  }

  async updateDesignation(id: string, data: Partial<Designation>) {
    const response = await apiClient.put(`/hierarchy/designations/${id}`, data);
    return response.data;
  }

  async deleteDesignation(id: string) {
    await apiClient.delete(`/hierarchy/designations/${id}`);
  }

  // Hierarchy operations
  async getOrgChart(rootEmployeeId?: string, departmentId?: string): Promise<OrgChartData> {
    const response = await apiClient.get('/hierarchy/org-chart', {
      params: { rootEmployeeId, departmentId },
    });
    return response.data;
  }

  async getEmployeeHierarchy(employeeId: string): Promise<HierarchyNode> {
    const response = await apiClient.get(`/hierarchy/employees/${employeeId}`);
    return response.data;
  }

  async getDirectReports(managerId: string): Promise<HierarchyNode[]> {
    const response = await apiClient.get(`/hierarchy/managers/${managerId}/reports`);
    return response.data;
  }

  async getReportingChain(employeeId: string): Promise<HierarchyNode[]> {
    const response = await apiClient.get(`/hierarchy/employees/${employeeId}/chain`);
    return response.data;
  }

  async updateEmployeePosition(employeeId: string, data: {
    designationId: string;
    departmentId: string;
    managerId?: string;
    startDate: Date;
  }) {
    const response = await apiClient.put(
      `/hierarchy/employees/${employeeId}/position`,
      data
    );
    return response.data;
  }
}

export default new HierarchyService();
