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

// Map snake_case backend Department to camelCase frontend Department
function mapDepartment(d: any): Department {
  return {
    id: d.id,
    name: d.name,
    description: d.description ?? undefined,
    parentDepartmentId: d.parent_department_id ?? undefined,
    createdAt: new Date(d.created_at),
    updatedAt: new Date(d.updated_at),
  };
}

// Recursively map backend OrgChartNode (snake_case) to frontend HierarchyNode (camelCase)
function mapOrgChartNode(d: any, managerId?: string): HierarchyNode {
  return {
    id: d.id,
    employeeId: d.employee_id ?? d.id,
    employeeName: d.employeeName ?? `${d.first_name ?? ''} ${d.last_name ?? ''}`.trim(),
    designationId: d.designationId ?? d.designation_id ?? '',
    designationName: d.designationName ?? d.designation ?? '',
    departmentId: d.departmentId ?? d.department_id ?? '',
    departmentName: d.departmentName ?? d.department ?? '',
    managerId: d.managerId ?? d.manager_id ?? managerId,
    managerName: d.managerName ?? d.manager_name,
    profilePhotoUrl: d.profilePhotoUrl ?? d.profile_photo_url,
    startDate: d.startDate ? new Date(d.startDate) : new Date(d.start_date ?? 0),
    endDate: d.endDate ?? d.end_date ? new Date(d.endDate ?? d.end_date) : undefined,
    isActive: d.isActive ?? d.is_active ?? true,
    children: Array.isArray(d.children)
      ? d.children.map((child: any) => mapOrgChartNode(child, d.id))
      : [],
  };
}

function countNodes(node: HierarchyNode): number {
  return 1 + (node.children ?? []).reduce((sum, c) => sum + countNodes(c), 0);
}

function collectDepartments(node: HierarchyNode, depts = new Set<string>()): Set<string> {
  if (node.departmentName) depts.add(node.departmentName);
  (node.children ?? []).forEach((c) => collectDepartments(c, depts));
  return depts;
}

// Map snake_case backend Designation to camelCase frontend Designation
function mapDesignation(d: any): Designation {
  return {
    id: d.id,
    name: d.name,
    description: d.description ?? undefined,
    departmentId: d.department_id ?? d.departmentId ?? '',
    level: typeof d.level === 'number' ? d.level : parseInt(d.level) || 1,
    createdAt: new Date(d.created_at),
    updatedAt: new Date(d.updated_at),
  };
}

class HierarchyService {
  // Department operations
  async createDepartment(data: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>) {
    const response = await apiClient.post('/hierarchy/departments', {
      name: data.name,
      description: data.description || undefined,
      parent_department_id: data.parentDepartmentId || undefined,
    });
    const raw = response.data?.data ?? response.data;
    return mapDepartment(raw);
  }

  async getDepartments(): Promise<Department[]> {
    const response = await apiClient.get('/hierarchy/departments');
    const raw: any[] = response.data?.data ?? response.data ?? [];
    return raw.map(mapDepartment);
  }

  async updateDepartment(id: string, data: Partial<Department>) {
    const response = await apiClient.put(`/hierarchy/departments/${id}`, {
      name: data.name,
      description: data.description,
      parent_department_id: data.parentDepartmentId || undefined,
    });
    const raw = response.data?.data ?? response.data;
    return mapDepartment(raw);
  }

  async deleteDepartment(id: string) {
    await apiClient.delete(`/hierarchy/departments/${id}`);
  }

  // Designation operations
  async createDesignation(data: Omit<Designation, 'id' | 'createdAt' | 'updatedAt'>) {
    const response = await apiClient.post('/hierarchy/designations', {
      name: data.name,
      description: data.description || undefined,
      level: String(data.level),
    });
    const raw = response.data?.data ?? response.data;
    return mapDesignation(raw);
  }

  async getDesignations(departmentId?: string): Promise<Designation[]> {
    const response = await apiClient.get('/hierarchy/designations', {
      params: { departmentId },
    });
    const raw: any[] = response.data?.data ?? response.data ?? [];
    return raw.map(mapDesignation);
  }

  async updateDesignation(id: string, data: Partial<Designation>) {
    const response = await apiClient.put(`/hierarchy/designations/${id}`, {
      name: data.name,
      description: data.description,
      level: data.level !== undefined ? String(data.level) : undefined,
    });
    const raw = response.data?.data ?? response.data;
    return mapDesignation(raw);
  }

  async deleteDesignation(id: string) {
    await apiClient.delete(`/hierarchy/designations/${id}`);
  }

  // Hierarchy operations
  async getOrgChart(rootEmployeeId?: string, departmentId?: string): Promise<OrgChartData | null> {
    const response = await apiClient.get('/hierarchy/org-chart', {
      params: { rootEmployeeId, departmentId },
    });
    const payload = response.data;
    const raw = payload && 'data' in payload ? payload.data : payload;
    if (!raw) return null;

    // Backend may return the wrapped shape already or a bare OrgChartNode
    if (raw.root) {
      const root = mapOrgChartNode(raw.root);
      return {
        root,
        totalEmployees: raw.totalEmployees ?? countNodes(root),
        totalDepartments: raw.totalDepartments ?? collectDepartments(root).size,
      };
    }
    // Bare OrgChartNode from backend
    const root = mapOrgChartNode(raw);
    return {
      root,
      totalEmployees: countNodes(root),
      totalDepartments: collectDepartments(root).size,
    };
  }

  async getEmployeeHierarchy(employeeId: string): Promise<HierarchyNode> {
    const response = await apiClient.get(`/hierarchy/employees/${employeeId}`);
    return response.data?.data ?? response.data;
  }

  async getDirectReports(managerId: string): Promise<HierarchyNode[]> {
    const response = await apiClient.get(`/hierarchy/managers/${managerId}/reports`);
    return response.data?.data ?? response.data ?? [];
  }

  async getReportingChain(employeeId: string): Promise<HierarchyNode[]> {
    const response = await apiClient.get(`/hierarchy/employees/${employeeId}/chain`);
    return response.data?.data ?? response.data ?? [];
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
    return response.data?.data ?? response.data;
  }
}

export default new HierarchyService();
