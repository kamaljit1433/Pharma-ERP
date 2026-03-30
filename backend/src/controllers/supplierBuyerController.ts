import { Request, Response } from 'express';
import { Knex } from 'knex';
import { SupplierBuyerService } from '../services/supplierBuyerService';
import { SupplierBuyerRepository } from '../repositories/supplierBuyerRepository';
import { VisitRepository } from '../repositories/visitRepository';
import { CreateSupplierBuyerDTO, UpdateSupplierBuyerDTO, CreateVisitDTO } from '../types/supplierBuyer';

export class SupplierBuyerController {
  private supplierBuyerService: SupplierBuyerService;

  constructor(private knex: Knex) {
    const supplierBuyerRepository = new SupplierBuyerRepository(knex);
    const visitRepository = new VisitRepository(knex);
    this.supplierBuyerService = new SupplierBuyerService(supplierBuyerRepository, visitRepository);
  }

  // ============ Supplier/Buyer CRUD ============

  async createSupplierBuyer(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateSupplierBuyerDTO = req.body;
      const employeeId = (req as any).user?.id;

      if (!employeeId) {
        res.status(401).json({ error: 'Unauthorized: Employee ID required' });
        return;
      }

      if (!data.name || data.name.trim().length === 0) {
        res.status(400).json({ error: 'Supplier/Buyer name is required' });
        return;
      }

      if (!['supplier', 'buyer'].includes(data.type)) {
        res.status(400).json({ error: 'Type must be either "supplier" or "buyer"' });
        return;
      }

      const supplierBuyer = await this.supplierBuyerService.createSupplierBuyer(employeeId, data);

      res.status(201).json({
        success: true,
        data: supplierBuyer,
        message: 'Supplier/Buyer created successfully',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create supplier/buyer';
      res.status(500).json({ error: message });
    }
  }

  async getSupplierBuyer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const supplierBuyer = await this.supplierBuyerService.getSupplierBuyer(id);

      res.status(200).json({
        success: true,
        data: supplierBuyer,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get supplier/buyer';
      res.status(error instanceof Error && message.includes('not found') ? 404 : 500).json({ error: message });
    }
  }

  async getSupplierBuyersByEmployee(req: Request, res: Response): Promise<void> {
    try {
      const employeeId = (req as any).user?.id;

      if (!employeeId) {
        res.status(401).json({ error: 'Unauthorized: Employee ID required' });
        return;
      }

      const supplierBuyers = await this.supplierBuyerService.getSupplierBuyersByEmployee(employeeId);

      res.status(200).json({
        success: true,
        data: supplierBuyers,
        count: supplierBuyers.length,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get supplier/buyers';
      res.status(500).json({ error: message });
    }
  }

  async updateSupplierBuyer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateSupplierBuyerDTO = req.body;
      const employeeId = (req as any).user?.id;

      const supplierBuyer = await this.supplierBuyerService.getSupplierBuyer(id);

      if (supplierBuyer.employee_id !== employeeId) {
        res.status(403).json({ error: 'Forbidden: You can only update your own supplier/buyer records' });
        return;
      }

      const updated = await this.supplierBuyerService.updateSupplierBuyer(id, data);

      res.status(200).json({
        success: true,
        data: updated,
        message: 'Supplier/Buyer updated successfully',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update supplier/buyer';
      res.status(error instanceof Error && message.includes('not found') ? 404 : 500).json({ error: message });
    }
  }

  async deleteSupplierBuyer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const employeeId = (req as any).user?.id;

      const supplierBuyer = await this.supplierBuyerService.getSupplierBuyer(id);

      if (supplierBuyer.employee_id !== employeeId) {
        res.status(403).json({ error: 'Forbidden: You can only delete your own supplier/buyer records' });
        return;
      }

      await this.supplierBuyerService.deleteSupplierBuyer(id);

      res.status(200).json({
        success: true,
        message: 'Supplier/Buyer deleted successfully',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete supplier/buyer';
      res.status(error instanceof Error && message.includes('not found') ? 404 : 500).json({ error: message });
    }
  }

  async searchSupplierBuyers(req: Request, res: Response): Promise<void> {
    try {
      const { searchTerm } = req.query;
      const employeeId = (req as any).user?.id;

      if (!employeeId) {
        res.status(401).json({ error: 'Unauthorized: Employee ID required' });
        return;
      }

      const results = await this.supplierBuyerService.searchSupplierBuyers(
        employeeId,
        (searchTerm as string) || ''
      );

      res.status(200).json({
        success: true,
        data: results,
        count: results.length,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to search supplier/buyers';
      res.status(500).json({ error: message });
    }
  }

  // ============ Visit Management ============

  async logVisit(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: CreateVisitDTO = req.body;
      const employeeId = (req as any).user?.id;

      if (!employeeId) {
        res.status(401).json({ error: 'Unauthorized: Employee ID required' });
        return;
      }

      if (!data.visit_date || data.visit_date.trim().length === 0) {
        res.status(400).json({ error: 'Visit date is required' });
        return;
      }

      const visit = await this.supplierBuyerService.logVisit(id, employeeId, data);

      res.status(201).json({
        success: true,
        data: visit,
        message: 'Visit logged successfully',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to log visit';
      res.status(error instanceof Error && message.includes('not found') ? 404 : error instanceof Error && message.includes('Unauthorized') ? 403 : 500).json({ error: message });
    }
  }

  async getVisitHistory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const visitHistory = await this.supplierBuyerService.getVisitHistory(id);

      res.status(200).json({
        success: true,
        data: visitHistory,
        count: visitHistory.length,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get visit history';
      res.status(error instanceof Error && message.includes('not found') ? 404 : 500).json({ error: message });
    }
  }

  async getRecentVisits(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { limit } = req.query;

      const visits = await this.supplierBuyerService.getRecentVisits(id, limit ? parseInt(limit as string) : 10);

      res.status(200).json({
        success: true,
        data: visits,
        count: visits.length,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get recent visits';
      res.status(error instanceof Error && message.includes('not found') ? 404 : 500).json({ error: message });
    }
  }

  async getVisitsByDateRange(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({ error: 'startDate and endDate are required' });
        return;
      }

      const visits = await this.supplierBuyerService.getVisitsByDateRange(
        id,
        startDate as string,
        endDate as string
      );

      res.status(200).json({
        success: true,
        data: visits,
        count: visits.length,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get visits by date range';
      res.status(error instanceof Error && message.includes('not found') ? 404 : 500).json({ error: message });
    }
  }

  async getVisitCount(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const count = await this.supplierBuyerService.getVisitCount(id);

      res.status(200).json({
        success: true,
        data: { count },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get visit count';
      res.status(error instanceof Error && message.includes('not found') ? 404 : 500).json({ error: message });
    }
  }

  async getSupplierBuyerCount(req: Request, res: Response): Promise<void> {
    try {
      const employeeId = (req as any).user?.id;

      if (!employeeId) {
        res.status(401).json({ error: 'Unauthorized: Employee ID required' });
        return;
      }

      const count = await this.supplierBuyerService.getSupplierBuyerCount(employeeId);

      res.status(200).json({
        success: true,
        data: { count },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get supplier/buyer count';
      res.status(500).json({ error: message });
    }
  }
}
