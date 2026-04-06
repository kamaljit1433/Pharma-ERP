import { Knex } from 'knex';
import { HierarchyNode, AssignEmployeePositionDTO } from '../types/hierarchy';

export class HierarchyNodeRepository {
  constructor(private db: Knex) {}

  async createHierarchyNode(data: AssignEmployeePositionDTO): Promise<HierarchyNode> {
    const [node] = await this.db('hierarchy_nodes')
      .insert({
        employee_id: data.employee_id,
        department_id: data.department_id,
        designation_id: data.designation_id,
        manager_id: data.manager_id || null,
        dotted_line_manager_id: data.dotted_line_manager_id || null,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');

    return node;
  }

  async getHierarchyNodeByEmployeeId(employeeId: string): Promise<HierarchyNode | null> {
    return this.db('hierarchy_nodes').where('employee_id', employeeId).first();
  }

  async getHierarchyNodeById(id: string): Promise<HierarchyNode | null> {
    return this.db('hierarchy_nodes').where('id', id).first();
  }

  async updateHierarchyNode(employeeId: string, data: Partial<AssignEmployeePositionDTO>): Promise<HierarchyNode> {
    // Filter out undefined properties to avoid overwriting valid columns
    const updatePayload: Record<string, any> = { updated_at: new Date() };
    if (data.department_id !== undefined) updatePayload['department_id'] = data.department_id;
    if (data.designation_id !== undefined) updatePayload['designation_id'] = data.designation_id;
    if (data.manager_id !== undefined) updatePayload['manager_id'] = data.manager_id || null;
    if (data.dotted_line_manager_id !== undefined) updatePayload['dotted_line_manager_id'] = data.dotted_line_manager_id || null;

    const [node] = await this.db('hierarchy_nodes')
      .where('employee_id', employeeId)
      .update(updatePayload)
      .returning('*');

    return node;
  }

  async deleteHierarchyNode(employeeId: string): Promise<void> {
    await this.db('hierarchy_nodes').where('employee_id', employeeId).delete();
  }

  async getDirectReports(managerId: string): Promise<HierarchyNode[]> {
    return this.db('hierarchy_nodes').where('manager_id', managerId);
  }

  async getDottedLineReports(managerId: string): Promise<HierarchyNode[]> {
    return this.db('hierarchy_nodes').where('dotted_line_manager_id', managerId);
  }

  async getEmployeesByDepartment(departmentId: string): Promise<HierarchyNode[]> {
    return this.db('hierarchy_nodes').where('department_id', departmentId);
  }

  async getEmployeesByDesignation(designationId: string): Promise<HierarchyNode[]> {
    return this.db('hierarchy_nodes').where('designation_id', designationId);
  }

  async getReportingChain(employeeId: string): Promise<string[]> {
    const chain: string[] = [];
    let currentEmployeeId: string | null = employeeId;
    // Track visited nodes to prevent infinite loops on circular hierarchies
    const visited = new Set<string>();

    while (currentEmployeeId) {
      if (visited.has(currentEmployeeId)) {
        throw new Error(
          `Circular hierarchy detected at employee ${currentEmployeeId}. Chain: ${chain.join(' -> ')}`
        );
      }
      visited.add(currentEmployeeId);

      const node = await this.getHierarchyNodeByEmployeeId(currentEmployeeId);
      if (!node || !node.manager_id) {
        break;
      }
      chain.push(node.manager_id);
      currentEmployeeId = node.manager_id;
    }

    return chain;
  }

  async getHierarchyNodesByDepartmentAndDesignation(
    departmentId: string,
    designationId: string
  ): Promise<HierarchyNode[]> {
    return this.db('hierarchy_nodes')
      .where('department_id', departmentId)
      .where('designation_id', designationId);
  }

  async getAllHierarchyNodes(): Promise<HierarchyNode[]> {
    return this.db('hierarchy_nodes');
  }
}
