import { Request, Response } from 'express';
import { Knex } from 'knex';
import { HierarchyService } from '../services/hierarchyService';
import {
  CreateDepartmentDTO,
  UpdateDepartmentDTO,
  CreateDesignationDTO,
  UpdateDesignationDTO,
  AssignEmployeePositionDTO,
} from '../types/hierarchy';

export class HierarchyController {
  private hierarchyService: HierarchyService;

  constructor(private knex: Knex) {
    this.hierarchyService = new HierarchyService(knex);
  }

  // ============ Department Management ============

  async createDepartment(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateDepartmentDTO = req.body;

      if (!data.name || data.name.trim().length === 0) {
        res.status(400).json({ error: 'Department name is required' });
        return;
      }

      const department = await this.hierarchyService.createDepartment(data);

      res.status(201).json({
        success: true,
        data: department,
        message: 'Department created successfully',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create department';
      res.status(500).json({ error: message });
    }
  }

  async getDepartment(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;

      const department = await this.hierarchyService.getDepartment(id);

      res.status(200).json({
        success: true,
        data: department,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get department';
      res.status(error instanceof Error && message.includes('not found') ? 404 : 500).json({ error: message });
    }
  }

  async getAllDepartments(req: Request, res: Response): Promise<void> {
    try {
      const departments = await this.hierarchyService.getAllDepartments();

      res.status(200).json({
        success: true,
        data: departments,
        count: departments.length,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get departments';
      res.status(500).json({ error: message });
    }
  }

  async updateDepartment(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;
      const data: UpdateDepartmentDTO = req.body;

      const department = await this.hierarchyService.updateDepartment(id, data);

      res.status(200).json({
        success: true,
        data: department,
        message: 'Department updated successfully',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update department';
      res.status(error instanceof Error && message.includes('not found') ? 404 : 500).json({ error: message });
    }
  }

  async deleteDepartment(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;

      await this.hierarchyService.deleteDepartment(id);

      res.status(200).json({
        success: true,
        message: 'Department deleted successfully',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete department';
      res.status(error instanceof Error && message.includes('not found') ? 404 : 500).json({ error: message });
    }
  }

  // ============ Designation Management ============

  async createDesignation(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateDesignationDTO = req.body;

      if (!data.name || data.name.trim().length === 0) {
        res.status(400).json({ error: 'Designation name is required' });
        return;
      }

      const designation = await this.hierarchyService.createDesignation(data);

      res.status(201).json({
        success: true,
        data: designation,
        message: 'Designation created successfully',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create designation';
      res.status(500).json({ error: message });
    }
  }

  async getDesignation(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;

      const designation = await this.hierarchyService.getDesignation(id);

      res.status(200).json({
        success: true,
        data: designation,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get designation';
      res.status(error instanceof Error && message.includes('not found') ? 404 : 500).json({ error: message });
    }
  }

  async getAllDesignations(req: Request, res: Response): Promise<void> {
    try {
      const designations = await this.hierarchyService.getAllDesignations();

      res.status(200).json({
        success: true,
        data: designations,
        count: designations.length,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get designations';
      res.status(500).json({ error: message });
    }
  }

  async updateDesignation(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;
      const data: UpdateDesignationDTO = req.body;

      const designation = await this.hierarchyService.updateDesignation(id, data);

      res.status(200).json({
        success: true,
        data: designation,
        message: 'Designation updated successfully',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update designation';
      res.status(error instanceof Error && message.includes('not found') ? 404 : 500).json({ error: message });
    }
  }

  async deleteDesignation(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;

      await this.hierarchyService.deleteDesignation(id);

      res.status(200).json({
        success: true,
        message: 'Designation deleted successfully',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete designation';
      res.status(error instanceof Error && message.includes('not found') ? 404 : 500).json({ error: message });
    }
  }

  // ============ Employee Position Assignment ============

  async assignEmployeePosition(req: Request, res: Response): Promise<void> {
    try {
      const data: AssignEmployeePositionDTO = req.body;
      const userId = (req as any).user?.id;

      if (!data.employee_id || !data.designation_id || !data.department_id) {
        res.status(400).json({ error: 'employee_id, designation_id, and department_id are required' });
        return;
      }

      const hierarchyNode = await this.hierarchyService.assignEmployeePosition(data, userId);

      res.status(201).json({
        success: true,
        data: hierarchyNode,
        message: 'Employee position assigned successfully',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to assign employee position';
      res.status(500).json({ error: message });
    }
  }

  // ============ Hierarchy Queries ============

  async getReportingChain(req: Request, res: Response): Promise<void> {
    try {
      const employeeId = req.params['employeeId'] as string;

      const reportingChain = await this.hierarchyService.getReportingChain(employeeId);

      res.status(200).json({
        success: true,
        data: reportingChain,
        count: reportingChain.length,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get reporting chain';
      res.status(500).json({ error: message });
    }
  }

  async getDirectReports(req: Request, res: Response): Promise<void> {
    try {
      const managerId = req.params['managerId'] as string;

      const directReports = await this.hierarchyService.getDirectReports(managerId);

      res.status(200).json({
        success: true,
        data: directReports,
        count: directReports.length,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get direct reports';
      res.status(500).json({ error: message });
    }
  }

  async getOrgChart(req: Request, res: Response): Promise<void> {
    try {
      const { rootEmployeeId } = req.query;

      const orgChart = await this.hierarchyService.generateOrgChart(rootEmployeeId as string | undefined);

      res.status(200).json({
        success: true,
        data: orgChart,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate org chart';
      res.status(500).json({ error: message });
    }
  }

  async getHierarchyAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      const employeeId = req.params['employeeId'] as string;

      const auditLogs = await this.hierarchyService.getHierarchyAuditLogs(employeeId);

      res.status(200).json({
        success: true,
        data: auditLogs,
        count: auditLogs.length,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get audit logs';
      res.status(500).json({ error: message });
    }
  }
}
