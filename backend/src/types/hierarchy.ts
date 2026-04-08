export interface Department {
  id: string;
  name: string;
  description?: string;
  parent_department_id?: string;
  head_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Designation {
  id: string;
  name: string;
  description?: string;
  level?: string;
  created_at: string;
  updated_at: string;
}

export interface HierarchyNode {
  id: string;
  employee_id: string;
  department_id: string;
  designation_id: string;
  manager_id?: string;
  dotted_line_manager_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDepartmentDTO {
  name: string;
  description?: string;
  parent_department_id?: string;
  head_id?: string;
}

export interface UpdateDepartmentDTO {
  name?: string;
  description?: string;
  parent_department_id?: string;
  head_id?: string;
}

export interface CreateDesignationDTO {
  name: string;
  description?: string;
  level?: string;
}

export interface UpdateDesignationDTO {
  name?: string;
  description?: string;
  level?: string;
}

export interface AssignEmployeePositionDTO {
  employee_id: string;
  department_id: string;
  designation_id: string;
  manager_id?: string;
  dotted_line_manager_id?: string;
}

export interface OrgChartNode {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  designation: string;
  department: string;
  children: OrgChartNode[];
}

export interface HierarchyAuditLog {
  id: string;
  employee_id: string;
  action: 'assign' | 'update' | 'remove';
  old_value?: Record<string, any>;
  new_value?: Record<string, any>;
  changed_by: string;
  created_at: string;
}

export interface ReportingChain {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  designation: string;
  level: number;
}

export interface DirectReport {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  designation: string;
  department: string;
  is_dotted_line: boolean;
}
