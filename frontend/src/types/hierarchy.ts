/**
 * Hierarchy and Organization Chart Types
 */

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

export interface EmployeePosition {
  designationId: string;
  departmentId: string;
  managerId?: string;
  startDate: Date;
}
