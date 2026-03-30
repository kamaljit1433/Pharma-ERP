import { Request, Response } from 'express';
import { BankDetailsService } from '../services/bankDetailsService';
import { UserRole } from '../types/auth';

export class BankDetailsController {
  private bankDetailsService: BankDetailsService;

  constructor() {
    this.bankDetailsService = new BankDetailsService();
  }

  /**
   * POST /api/v1/bank-details
   * Add a new bank account for an employee
   */
  async addBankAccount(req: Request, res: Response): Promise<void> {
    try {
      const { account_holder_name, bank_name, account_number, ifsc_code, account_type } = req.body;
      const employeeId = (req as any).user?.id;
      const performedBy = (req as any).user?.id;

      // Validate required fields
      if (!account_holder_name || !bank_name || !account_number || !ifsc_code || !account_type) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: account_holder_name, bank_name, account_number, ifsc_code, account_type',
        });
        return;
      }

      const maskedAccount = await this.bankDetailsService.addBankAccount(
        employeeId,
        { account_holder_name, bank_name, account_number, ifsc_code, account_type },
        performedBy
      );

      res.status(201).json({
        success: true,
        data: maskedAccount,
        message: 'Bank account added successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to add bank account',
      });
    }
  }

  /**
   * PUT /api/v1/bank-details/:id
   * Update an existing bank account
   */
  async updateBankAccount(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const employeeId = (req as any).user?.id;
      const performedBy = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Bank account ID is required',
        });
        return;
      }

      // Check authorization: Employee can only update own, HR/Admin can update any
      if (userRole === UserRole.EMPLOYEE) {
        // Verify the account belongs to the employee
        const account = await (this.bankDetailsService as any).getBankAccountById?.(id);
        if (account && account.employee_id !== employeeId) {
          res.status(403).json({
            success: false,
            message: 'Unauthorized: You can only update your own bank accounts',
          });
          return;
        }
      }

      const maskedAccount = await this.bankDetailsService.updateBankAccount(
        id,
        employeeId || '',
        req.body,
        performedBy || ''
      );

      res.status(200).json({
        success: true,
        data: maskedAccount,
        message: 'Bank account updated successfully',
      });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else if (error.message.includes('Unauthorized')) {
        res.status(403).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(400).json({
          success: false,
          message: error.message || 'Failed to update bank account',
        });
      }
    }
  }

  /**
   * PUT /api/v1/bank-details/:id/set-primary
   * Set a bank account as primary
   */
  async setPrimaryAccount(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const employeeId = (req as any).user?.id;
      const performedBy = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Bank account ID is required',
        });
        return;
      }

      // Check authorization
      if (userRole === UserRole.EMPLOYEE) {
        const account = await (this.bankDetailsService as any).getBankAccountById?.(id);
        if (account && account.employee_id !== employeeId) {
          res.status(403).json({
            success: false,
            message: 'Unauthorized: You can only set your own bank accounts as primary',
          });
          return;
        }
      }

      const maskedAccount = await this.bankDetailsService.setPrimaryAccount(id, employeeId || '', performedBy || '');

      res.status(200).json({
        success: true,
        data: maskedAccount,
        message: 'Bank account set as primary successfully',
      });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else if (error.message.includes('Unauthorized')) {
        res.status(403).json({
          success: false,
          message: error.message,
        });
      } else if (error.message.includes('verified')) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(400).json({
          success: false,
          message: error.message || 'Failed to set primary bank account',
        });
      }
    }
  }

  /**
   * PUT /api/v1/bank-details/:id/verify
   * Verify a bank account (Finance/Admin only)
   */
  async verifyBankAccount(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const verifiedBy = (req as any).user?.id;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Bank account ID is required',
        });
        return;
      }

      const maskedAccount = await this.bankDetailsService.verifyBankAccount(id, verifiedBy || '');

      res.status(200).json({
        success: true,
        data: maskedAccount,
        message: 'Bank account verified successfully',
      });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(400).json({
          success: false,
          message: error.message || 'Failed to verify bank account',
        });
      }
    }
  }

  /**
   * GET /api/v1/bank-details/:employeeId
   * Get all bank accounts for an employee (masked)
   */
  async getBankAccounts(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;
      const requestedBy = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      if (!employeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
        });
        return;
      }

      // Check authorization: Employee can only view own, HR/Finance/Admin can view any
      if (userRole === UserRole.EMPLOYEE && employeeId !== requestedBy) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized: You can only view your own bank accounts',
        });
        return;
      }

      const accounts = await this.bankDetailsService.getBankAccounts(employeeId);

      res.status(200).json({
        success: true,
        data: accounts,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch bank accounts',
      });
    }
  }
}

export default new BankDetailsController();
