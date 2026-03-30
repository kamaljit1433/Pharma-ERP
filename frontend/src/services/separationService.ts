import { api } from './api';

export interface ResignationData {
  resignation_date: Date;
  last_working_day: Date;
  reason?: string;
}

export interface TerminationData {
  termination_date: Date;
  reason: string;
  termination_type: 'voluntary' | 'involuntary' | 'retirement' | 'contract_end';
  final_settlement_date?: Date;
}

export interface ExitInterviewData {
  conducted_by: string;
  questionnaire_responses: Record<string, string>;
  feedback: string;
}

export interface FnFSettlement {
  id: string;
  employee_id: string;
  pending_salary: number;
  leave_encashment: number;
  gratuity: number;
  bonus: number;
  other_benefits: number;
  total_earnings: number;
  advance_deduction: number;
  asset_damage_deduction: number;
  other_deductions: number;
  total_deductions: number;
  net_settlement: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'paid';
  approved_by?: string;
  approved_at?: Date;
  paid_at?: Date;
}

export interface AssetRecoveryItem {
  id: string;
  employee_id: string;
  asset_id: string;
  status: 'pending' | 'returned' | 'damaged' | 'missing';
  damage_cost?: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface OffboardingStatus {
  canDeactivate: boolean;
  missingItems: string[];
  exitInterviewCompleted: boolean;
  fnfSettlementApproved: boolean;
  assetsRecovered: boolean;
  systemAccessRevoked: boolean;
  dataArchived: boolean;
}

class SeparationService {
  /**
   * Submit resignation for an employee
   */
  async submitResignation(employeeId: string, data: ResignationData): Promise<any> {
    const response = await api.post(`/separation/resignation`, {
      employee_id: employeeId,
      resignation_date: data.resignation_date,
      last_working_day: data.last_working_day,
      reason: data.reason,
    });
    return response.data;
  }

  /**
   * Initiate termination for an employee (HR only)
   */
  async initiateTermination(employeeId: string, data: TerminationData): Promise<any> {
    const response = await api.post(`/separation/termination`, {
      employee_id: employeeId,
      termination_date: data.termination_date,
      reason: data.reason,
      termination_type: data.termination_type,
      final_settlement_date: data.final_settlement_date,
    });
    return response.data;
  }

  /**
   * Schedule exit interview
   */
  async scheduleExitInterview(employeeId: string, date: Date): Promise<any> {
    const response = await api.post(`/separation/exit-interview`, {
      employee_id: employeeId,
      scheduled_date: date,
    });
    return response.data;
  }

  /**
   * Submit exit interview responses
   */
  async submitExitInterview(exitInterviewId: string, data: ExitInterviewData): Promise<any> {
    const response = await api.post(`/separation/exit-interview/${exitInterviewId}/submit`, {
      conducted_by: data.conducted_by,
      questionnaire_responses: data.questionnaire_responses,
      feedback: data.feedback,
    });
    return response.data;
  }

  /**
   * Get F&F settlement for an employee
   */
  async getFnFSettlement(employeeId: string): Promise<FnFSettlement> {
    const response = await api.get(`/separation/fnf/${employeeId}`);
    return response.data;
  }

  /**
   * Approve F&F settlement (Finance only)
   */
  async approveFnFSettlement(fnfId: string, approvedBy: string): Promise<any> {
    const response = await api.put(`/separation/fnf/${fnfId}/approve`, {
      approved_by: approvedBy,
    });
    return response.data;
  }

  /**
   * Get asset recovery checklist for an employee
   */
  async getAssetRecoveryChecklist(employeeId: string): Promise<AssetRecoveryItem[]> {
    const response = await api.get(`/separation/asset-recovery/${employeeId}`);
    return response.data;
  }

  /**
   * Update asset recovery status
   */
  async updateAssetRecoveryStatus(
    assetRecoveryId: string,
    status: string,
    damageCost?: number
  ): Promise<any> {
    const response = await api.put(`/separation/asset-recovery/${assetRecoveryId}`, {
      status,
      damage_cost: damageCost,
    });
    return response.data;
  }

  /**
   * Get offboarding status for an employee
   */
  async getOffboardingStatus(employeeId: string): Promise<OffboardingStatus> {
    const response = await api.get(`/separation/offboarding-status/${employeeId}`);
    return response.data;
  }

  /**
   * Deactivate employee (HR only)
   */
  async deactivateEmployee(employeeId: string): Promise<any> {
    const response = await api.put(`/separation/deactivate/${employeeId}`, {});
    return response.data;
  }
}

export const separationService = new SeparationService();
