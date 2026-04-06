import { Request, Response } from 'express';
import { Knex } from 'knex';
import { InsuranceService } from '../services/insuranceService';
import { PFService } from '../services/pfService';
import { GratuityService } from '../services/gratuityService';
import { ReimbursementService } from '../services/reimbursementService';
import { RewardService } from '../services/rewardService';

export class BenefitsController {
  private insuranceService: InsuranceService;
  private pfService: PFService;
  private gratuityService: GratuityService;
  private reimbursementService: ReimbursementService;
  private rewardService: RewardService;

  constructor(knex: Knex) {
    this.insuranceService = new InsuranceService(knex);
    this.pfService = new PFService(knex);
    this.gratuityService = new GratuityService(knex);
    this.reimbursementService = new ReimbursementService(knex);
    this.rewardService = new RewardService(knex);
  }

  // ============ Insurance Plans ============

  async createInsurancePlan(req: Request, res: Response): Promise<void> {
    try {
      const plan = await this.insuranceService.createInsurancePlan(req.body);
      res.status(201).json({
        success: true,
        data: plan,
        message: 'Insurance plan created successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create insurance plan',
      });
    }
  }

  async getInsurancePlans(req: Request, res: Response): Promise<void> {
    try {
      const isActive = (req.query as any).active === 'true';
      const plans = await this.insuranceService.getAllInsurancePlans(isActive);
      res.status(200).json({
        success: true,
        data: plans,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch insurance plans',
      });
    }
  }

  async getInsurancePlan(req: Request, res: Response): Promise<void> {
    try {
      const plan = await this.insuranceService.getInsurancePlan((req.params as any).id);
      res.status(200).json({
        success: true,
        data: plan,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Insurance plan not found',
      });
    }
  }

  async updateInsurancePlan(req: Request, res: Response): Promise<void> {
    try {
      const plan = await this.insuranceService.updateInsurancePlan((req.params as any).id, req.body);
      res.status(200).json({
        success: true,
        data: plan,
        message: 'Insurance plan updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update insurance plan',
      });
    }
  }

  async deleteInsurancePlan(req: Request, res: Response): Promise<void> {
    try {
      await this.insuranceService.deleteInsurancePlan((req.params as any).id);
      res.status(200).json({
        success: true,
        message: 'Insurance plan deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete insurance plan',
      });
    }
  }

  // ============ Insurance Enrollment ============

  async enrollInInsurance(req: Request, res: Response): Promise<void> {
    try {
      const enrollment = await this.insuranceService.enrollEmployee(req.body);
      res.status(201).json({
        success: true,
        data: enrollment,
        message: 'Employee enrolled in insurance plan successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to enroll in insurance plan',
      });
    }
  }

  async getEmployeeEnrollments(req: Request, res: Response): Promise<void> {
    try {
      const enrollments = await this.insuranceService.getEmployeeEnrollments((req.params as any).employeeId);
      res.status(200).json({
        success: true,
        data: enrollments,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch enrollments',
      });
    }
  }

  // ============ PF Details ============

  async getPFDetails(req: Request, res: Response): Promise<void> {
    try {
      const account = await this.pfService.getPFAccount((req.params as any).employeeId);
      const contributions = await this.pfService.getPFContributions((req.params as any).employeeId);
      const balance = await this.pfService.getPFBalance((req.params as any).employeeId);

      res.status(200).json({
        success: true,
        data: {
          account,
          contributions,
          balance,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch PF details',
      });
    }
  }

  async getPFStatement(req: Request, res: Response): Promise<void> {
    try {
      const { fromMonth, fromYear, toMonth, toYear } = req.query;
      const statement = await this.pfService.generatePFStatement(
        (req.params as any).employeeId,
        parseInt(fromMonth as string),
        parseInt(fromYear as string),
        parseInt(toMonth as string),
        parseInt(toYear as string)
      );

      res.status(200).json({
        success: true,
        data: statement,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate PF statement',
      });
    }
  }

  // ============ Gratuity ============

  async calculateGratuity(req: Request, res: Response): Promise<void> {
    try {
      const { lastDrawnSalary } = req.body;
      const gratuityAmount = await this.gratuityService.getGratuityAmount(
        (req.params as any).employeeId,
        lastDrawnSalary
      );
      const isEligible = await this.gratuityService.isEligible((req.params as any).employeeId);
      const yearsOfService = await this.gratuityService.getYearsOfService((req.params as any).employeeId);

      res.status(200).json({
        success: true,
        data: {
          gratuity_amount: gratuityAmount,
          is_eligible: isEligible,
          years_of_service: yearsOfService,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to calculate gratuity',
      });
    }
  }

  async getGratuityReport(req: Request, res: Response): Promise<void> {
    try {
      const { lastDrawnSalary } = req.body;
      const report = await this.gratuityService.generateGratuityReport(
        (req.params as any).employeeId,
        lastDrawnSalary
      );

      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate gratuity report',
      });
    }
  }

  // ============ Reimbursement Claims ============

  async submitReimbursementClaim(req: Request, res: Response): Promise<void> {
    try {
      const claim = await this.reimbursementService.submitReimbursementClaim(req.body);
      res.status(201).json({
        success: true,
        data: claim,
        message: 'Reimbursement claim submitted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to submit reimbursement claim',
      });
    }
  }

  async getReimbursementClaim(req: Request, res: Response): Promise<void> {
    try {
      const claim = await this.reimbursementService.getClaimById((req.params as any).id);
      if (!claim) {
        res.status(404).json({
          success: false,
          message: 'Reimbursement claim not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: claim,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch reimbursement claim',
      });
    }
  }

  async getEmployeeClaims(req: Request, res: Response): Promise<void> {
    try {
      const claims = await this.reimbursementService.getEmployeeClaims((req.params as any).employeeId);
      res.status(200).json({
        success: true,
        data: claims,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch employee claims',
      });
    }
  }

  async approveClaim(req: Request, res: Response): Promise<void> {
    try {
      const { approverId, approvalNotes } = req.body;
      const claim = await this.reimbursementService.approveClaim(
        (req.params as any).id,
        approverId,
        approvalNotes
      );

      res.status(200).json({
        success: true,
        data: claim,
        message: 'Reimbursement claim approved successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to approve reimbursement claim',
      });
    }
  }

  async rejectClaim(req: Request, res: Response): Promise<void> {
    try {
      const { approverId, approvalNotes } = req.body;
      const claim = await this.reimbursementService.rejectClaim(
        (req.params as any).id,
        approverId,
        approvalNotes
      );

      res.status(200).json({
        success: true,
        data: claim,
        message: 'Reimbursement claim rejected successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to reject reimbursement claim',
      });
    }
  }

  // ============ Rewards ============

  async awardReward(req: Request, res: Response): Promise<void> {
    try {
      const reward = await this.rewardService.awardReward(req.body);
      res.status(201).json({
        success: true,
        data: reward,
        message: 'Reward awarded successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to award reward',
      });
    }
  }

  async getReward(req: Request, res: Response): Promise<void> {
    try {
      const reward = await this.rewardService.getReward((req.params as any).id);
      if (!reward) {
        res.status(404).json({
          success: false,
          message: 'Reward not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: reward,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch reward',
      });
    }
  }

  async getEmployeeRewards(req: Request, res: Response): Promise<void> {
    try {
      const rewards = await this.rewardService.getEmployeeRewards((req.params as any).employeeId);
      res.status(200).json({
        success: true,
        data: rewards,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch employee rewards',
      });
    }
  }

  async getPublicRewards(_req: Request, res: Response): Promise<void> {
    try {
      const rewards = await this.rewardService.getPublicRewards();
      res.status(200).json({
        success: true,
        data: rewards,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch public rewards',
      });
    }
  }

  async updateReward(req: Request, res: Response): Promise<void> {
    try {
      const reward = await this.rewardService.updateReward((req.params as any).id, req.body);
      res.status(200).json({
        success: true,
        data: reward,
        message: 'Reward updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update reward',
      });
    }
  }

  async deleteReward(req: Request, res: Response): Promise<void> {
    try {
      await this.rewardService.deleteReward((req.params as any).id);
      res.status(200).json({
        success: true,
        message: 'Reward deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete reward',
      });
    }
  }
}
