import { Knex } from 'knex';
import { DepartmentRepository } from '../repositories/departmentRepository';
import { DesignationRepository } from '../repositories/designationRepository';
import { HierarchyNodeRepository } from '../repositories/hierarchyNodeRepository';
import { EmployeeRepository } from '../repositories/employeeRepository';
import {
  Department,
  Designation,
  HierarchyNode,
  CreateDepartmentDTO,
  UpdateDepartmentDTO,
  CreateDesignationDTO,
  UpdateDesignationDTO,
  AssignEmployeePositionDTO,
  OrgChartNode,
  ReportingChain,
  DirectReport,
  HierarchyAuditLog,
} from '../types/hierarchy';

export class HierarchyService {
  private departmentRepository: DepartmentRepository;
  private designationRepository: DesignationRepository;
  private hierarchyNodeRepository: HierarchyNodeRepository;
  private employeeRepository: EmployeeRepository;

  constructor(private db: Knex) {
    this.departmentRepository = new DepartmentRepository(db);
    this.designationRepository = new DesignationRepository(db);
    this.hierarchyNodeRepository = new HierarchyNodeRepository(db);
    this.employeeRepository = new EmployeeRepository(db);
  }

  // Department operations
  async createDepartment(data: CreateDepartmentDTO): Promise<Department> {
    if (!data.name || data.name.trim() === '') {
      throw new Error('Department name is required');
    }

    const existing = await this.departmentRepository.getDepartmentByName(data.name);
    if (existing) {
      throw new Error('Department with this name already exists');
    }

    return this.departmentRepository.createDepartment(data);
  }

  async getDepartment(id: string): Promise<Department> {
    const department = await this.departmentRepository.getDepartmentById(id);
    if (!department) {
      throw new Error('Department not found');
    }
    return department;
  }

  async updateDepartment(id: string, data: UpdateDepartmentDTO): Promise<Department> {
    const department = await this.departmentRepository.getDepartmentById(id);
    if (!department) {
      throw new Error('Department not found');
    }

    if (data.name && data.name.trim() === '') {
      throw new Error('Department name cannot be empty');
    }

    if (data.name && data.name !== department.name) {
      const existing = await this.departmentRepository.getDepartmentByName(data.name);
      if (existing) {
        throw new Error('Department with this name already exists');
      }
    }

    return this.departmentRepository.updateDepartment(id, data);
  }

  async deleteDepartment(id: string): Promise<void> {
    const department = await this.departmentRepository.getDepartmentById(id);
    if (!department) {
      throw new Error('Department not found');
    }

    // Check if any employees are assigned to this department
    const employees = await this.hierarchyNodeRepository.getEmployeesByDepartment(id);
    if (employees.length > 0) {
      throw new Error('Cannot delete department with assigned employees');
    }

    await this.departmentRepository.deleteDepartment(id);
  }

  async getAllDepartments(): Promise<Department[]> {
    return this.departmentRepository.getAllDepartments();
  }

  // Designation operations
  async createDesignation(data: CreateDesignationDTO): Promise<Designation> {
    if (!data.name || data.name.trim() === '') {
      throw new Error('Designation name is required');
    }

    const existing = await this.designationRepository.getDesignationByName(data.name);
    if (existing) {
      throw new Error('Designation with this name already exists');
    }

    return this.designationRepository.createDesignation(data);
  }

  async getDesignation(id: string): Promise<Designation> {
    const designation = await this.designationRepository.getDesignationById(id);
    if (!designation) {
      throw new Error('Designation not found');
    }
    return designation;
  }

  async updateDesignation(id: string, data: UpdateDesignationDTO): Promise<Designation> {
    const designation = await this.designationRepository.getDesignationById(id);
    if (!designation) {
      throw new Error('Designation not found');
    }

    if (data.name && data.name.trim() === '') {
      throw new Error('Designation name cannot be empty');
    }

    if (data.name && data.name !== designation.name) {
      const existing = await this.designationRepository.getDesignationByName(data.name);
      if (existing) {
        throw new Error('Designation with this name already exists');
      }
    }

    return this.designationRepository.updateDesignation(id, data);
  }

  async deleteDesignation(id: string): Promise<void> {
    const designation = await this.designationRepository.getDesignationById(id);
    if (!designation) {
      throw new Error('Designation not found');
    }

    // Check if any employees have this designation
    const employees = await this.hierarchyNodeRepository.getEmployeesByDesignation(id);
    if (employees.length > 0) {
      throw new Error('Cannot delete designation with assigned employees');
    }

    await this.designationRepository.deleteDesignation(id);
  }

  async getAllDesignations(): Promise<Designation[]> {
    return this.designationRepository.getAllDesignations();
  }

  // Employee position assignment
  async assignEmployeePosition(data: AssignEmployeePositionDTO, changedBy: string): Promise<HierarchyNode> {
    // Validate employee exists
    const employee = await this.employeeRepository.getEmployee(data.employee_id);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Validate department exists
    const department = await this.departmentRepository.getDepartmentById(data.department_id);
    if (!department) {
      throw new Error('Department not found');
    }

    // Validate designation exists
    const designation = await this.designationRepository.getDesignationById(data.designation_id);
    if (!designation) {
      throw new Error('Designation not found');
    }

    // Validate manager exists if provided
    if (data.manager_id) {
      const manager = await this.employeeRepository.getEmployee(data.manager_id);
      if (!manager) {
        throw new Error('Manager not found');
      }

      // Check for cycles: ensure the employee would not become their own ancestor
      if (data.manager_id === data.employee_id) {
        throw new Error('An employee cannot be their own manager');
      }
      const managerChain = await this.hierarchyNodeRepository.getReportingChain(data.manager_id);
      if (managerChain.includes(data.employee_id)) {
        throw new Error('Circular hierarchy detected: the selected manager already reports to this employee');
      }
    }

    // Validate dotted-line manager exists if provided
    if (data.dotted_line_manager_id) {
      const dottedLineManager = await this.employeeRepository.getEmployee(data.dotted_line_manager_id);
      if (!dottedLineManager) {
        throw new Error('Dotted-line manager not found');
      }
    }

    // Wrap position assignment + audit log in transaction
    return await this.db.transaction(async (trx) => {
      const txHierarchyRepo = new HierarchyNodeRepository(trx);

      // Check if employee already has a position
      const existingNode = await txHierarchyRepo.getHierarchyNodeByEmployeeId(data.employee_id);
      if (existingNode) {
        // Log the change
        await trx('hierarchy_audit_logs').insert({
          employee_id: data.employee_id,
          action: 'update',
          old_value: JSON.stringify(existingNode),
          new_value: JSON.stringify(data),
          changed_by: changedBy,
          created_at: new Date(),
        });
        return txHierarchyRepo.updateHierarchyNode(data.employee_id, data);
      }

      // Log the new assignment
      await trx('hierarchy_audit_logs').insert({
        employee_id: data.employee_id,
        action: 'assign',
        old_value: null,
        new_value: JSON.stringify(data),
        changed_by: changedBy,
        created_at: new Date(),
      });

      return txHierarchyRepo.createHierarchyNode(data);
    });
  }

  // Get reporting chain (all managers up the hierarchy)
  async getReportingChain(employeeId: string): Promise<ReportingChain[]> {
    const employee = await this.employeeRepository.getEmployee(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    const managerIds = await this.hierarchyNodeRepository.getReportingChain(employeeId);
    const chain: ReportingChain[] = [];

    for (let i = 0; i < managerIds.length; i++) {
      const managerId = managerIds[i];
      if (!managerId) continue;

      const manager = await this.employeeRepository.getEmployee(managerId);
      if (manager) {
        const node = await this.hierarchyNodeRepository.getHierarchyNodeByEmployeeId(managerId);
        const designation = node ? await this.designationRepository.getDesignationById(node.designation_id) : null;

        chain.push({
          id: manager.id,
          employee_id: manager.employee_id,
          first_name: manager.first_name,
          last_name: manager.last_name,
          designation: designation?.name || 'Unknown',
          level: i + 1,
        });
      }
    }

    return chain;
  }

  // Get direct reports (all employees reporting to a manager)
  async getDirectReports(managerId: string): Promise<DirectReport[]> {
    const manager = await this.employeeRepository.getEmployee(managerId);
    if (!manager) {
      throw new Error('Manager not found');
    }

    const directReportNodes = await this.hierarchyNodeRepository.getDirectReports(managerId);
    const reports: DirectReport[] = [];

    for (const node of directReportNodes) {
      const employee = await this.employeeRepository.getEmployee(node.employee_id);
      const designation = await this.designationRepository.getDesignationById(node.designation_id);
      const department = await this.departmentRepository.getDepartmentById(node.department_id);

      if (employee) {
        reports.push({
          id: employee.id,
          employee_id: employee.employee_id,
          first_name: employee.first_name,
          last_name: employee.last_name,
          designation: designation?.name || 'Unknown',
          department: department?.name || 'Unknown',
          is_dotted_line: false,
        });
      }
    }

    // Add dotted-line reports
    const dottedLineNodes = await this.hierarchyNodeRepository.getDottedLineReports(managerId);
    for (const node of dottedLineNodes) {
      const employee = await this.employeeRepository.getEmployee(node.employee_id);
      const designation = await this.designationRepository.getDesignationById(node.designation_id);
      const department = await this.departmentRepository.getDepartmentById(node.department_id);

      if (employee) {
        reports.push({
          id: employee.id,
          employee_id: employee.employee_id,
          first_name: employee.first_name,
          last_name: employee.last_name,
          designation: designation?.name || 'Unknown',
          department: department?.name || 'Unknown',
          is_dotted_line: true,
        });
      }
    }

    return reports;
  }

  // Generate organizational chart
  async generateOrgChart(rootEmployeeId?: string): Promise<OrgChartNode | null> {
    if (rootEmployeeId) {
      const employee = await this.employeeRepository.getEmployee(rootEmployeeId);
      if (!employee) throw new Error('Employee not found');
      return this.buildOrgChartNode(rootEmployeeId);
    }

    // Try hierarchy_nodes table first
    const allNodes = await this.hierarchyNodeRepository.getAllHierarchyNodes();
    if (allNodes.length > 0) {
      const topLevelNode = allNodes.find((n) => !n.manager_id) ?? null;
      if (topLevelNode) {
        return this.buildOrgChartNode(topLevelNode.employee_id);
      }
    }

    // Fall back to building from employees table via reporting_manager_id
    return this.buildOrgChartFromEmployees();
  }

  private async buildOrgChartFromEmployees(): Promise<OrgChartNode | null> {
    const employees = await this.db('employees')
      .whereNull('archived_at')
      .where('status', 'active')
      .select('id', 'employee_id', 'first_name', 'last_name', 'reporting_manager_id', 'department_id', 'designation_id');

    if (employees.length === 0) return null;

    // Load departments and designations for name lookups
    const departments = await this.db('departments').select('id', 'name');
    const designations = await this.db('designations').select('id', 'name');

    const deptMap: Record<string, string> = {};
    departments.forEach((d: any) => { deptMap[d.id] = d.name; });

    const desigMap: Record<string, string> = {};
    designations.forEach((d: any) => { desigMap[d.id] = d.name; });

    // Build tree recursively by employee id
    const buildNode = (emp: any, visited: Set<string>): OrgChartNode => {
      visited.add(emp.id);
      const children = employees
        .filter((e: any) => e.reporting_manager_id === emp.id && !visited.has(e.id))
        .map((e: any) => buildNode(e, new Set(visited)));

      return {
        id: emp.id,
        employee_id: emp.employee_id,
        first_name: emp.first_name,
        last_name: emp.last_name,
        designation: desigMap[emp.designation_id] ?? 'Unknown',
        department: deptMap[emp.department_id] ?? 'Unknown',
        department_id: emp.department_id ?? undefined,
        designation_id: emp.designation_id ?? undefined,
        children,
      };
    };

    // Find roots: employees whose reporting_manager_id is null or points to nobody active
    const activeIds = new Set(employees.map((e: any) => e.id));
    const roots = employees.filter(
      (e: any) => !e.reporting_manager_id || !activeIds.has(e.reporting_manager_id)
    );

    if (roots.length === 0) return null;

    if (roots.length === 1) {
      return buildNode(roots[0], new Set());
    }

    // Multiple top-level employees: wrap in a virtual root
    const children = roots.map((r: any) => buildNode(r, new Set()));
    return {
      id: 'virtual-root',
      employee_id: '',
      first_name: 'Organization',
      last_name: '',
      designation: '',
      department: '',
      children,
    };
  }

  private async buildOrgChartNode(
    employeeId: string,
    visited: Set<string> = new Set(),
    depth: number = 0,
    maxDepth: number = 50
  ): Promise<OrgChartNode> {
    if (depth > maxDepth) {
      throw new Error(`Org chart depth limit (${maxDepth}) exceeded at employee ${employeeId} — possible circular hierarchy`);
    }
    if (visited.has(employeeId)) {
      throw new Error(`Circular hierarchy detected at employee ${employeeId} while building org chart`);
    }
    visited.add(employeeId);

    const employee = await this.employeeRepository.getEmployee(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    const node = await this.hierarchyNodeRepository.getHierarchyNodeByEmployeeId(employeeId);
    const designation = node ? await this.designationRepository.getDesignationById(node.designation_id) : null;

    const directReports = await this.hierarchyNodeRepository.getDirectReports(employeeId);
    const children: OrgChartNode[] = [];

    for (const report of directReports) {
      const child = await this.buildOrgChartNode(report.employee_id, visited, depth + 1, maxDepth);
      children.push(child);
    }

    const department = node ? await this.departmentRepository.getDepartmentById(node.department_id) : null;

    return {
      id: employee.id,
      employee_id: employee.employee_id,
      first_name: employee.first_name,
      last_name: employee.last_name,
      designation: designation?.name || 'Unknown',
      department: department?.name || 'Unknown',
      department_id: node?.department_id ?? undefined,
      designation_id: node?.designation_id ?? undefined,
      children,
    };
  }

  // Hierarchy change audit logging
  private async logHierarchyChange(
    employeeId: string,
    action: 'assign' | 'update' | 'remove',
    oldValue: any,
    newValue: any,
    changedBy: string
  ): Promise<void> {
    await this.db('hierarchy_audit_logs').insert({
      employee_id: employeeId,
      action,
      old_value: oldValue ? JSON.stringify(oldValue) : null,
      new_value: JSON.stringify(newValue),
      changed_by: changedBy,
      created_at: new Date(),
    });
  }

  async getHierarchyAuditLogs(employeeId: string): Promise<HierarchyAuditLog[]> {
    const logs = await this.db('hierarchy_audit_logs')
      .where('employee_id', employeeId)
      .orderBy('created_at', 'desc');

    return logs.map((log: any) => {
      let oldValue: any;
      let newValue: any;
      try {
        oldValue = log.old_value ? JSON.parse(log.old_value) : undefined;
      } catch {
        oldValue = log.old_value; // Return raw string if parse fails
      }
      try {
        newValue = JSON.parse(log.new_value);
      } catch {
        newValue = log.new_value;
      }
      return {
        id: log.id,
        employee_id: log.employee_id,
        action: log.action,
        old_value: oldValue,
        new_value: newValue,
        changed_by: log.changed_by,
        created_at: log.created_at,
      };
    });
  }
}
