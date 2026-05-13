import apiClient from './api';

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
  asset_name?: string;
  asset_code?: string;
  asset_category?: string;
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

export interface ExitInterview {
  id: string;
  employee_id: string;
  scheduled_at: Date;
  status: 'scheduled' | 'completed';
  conducted_by?: string;
  questionnaire_responses?: Record<string, string>;
  feedback?: string;
}

class SeparationService {
  async submitResignation(employeeId: string, data: ResignationData): Promise<any> {
    const response = await apiClient.post(`/separation/resignation`, {
      employee_id: employeeId,
      resignation_date: data.resignation_date,
      last_working_day: data.last_working_day,
      reason: data.reason,
    });
    return response.data;
  }

  async initiateTermination(employeeId: string, data: TerminationData): Promise<any> {
    const response = await apiClient.post(`/separation/termination`, {
      employee_id: employeeId,
      termination_date: data.termination_date,
      reason: data.reason,
      termination_type: data.termination_type,
      final_settlement_date: data.final_settlement_date,
    });
    return response.data;
  }

  async getExitInterviewsByEmployee(employeeId: string): Promise<ExitInterview[]> {
    const response = await apiClient.get(`/separation/exit-interview/employee/${employeeId}`);
    return response.data?.data ?? response.data ?? [];
  }

  async scheduleExitInterview(employeeId: string, date: Date): Promise<ExitInterview> {
    const response = await apiClient.post(`/separation/exit-interview`, {
      employee_id: employeeId,
      scheduled_at: date,
    });
    return response.data?.data ?? response.data;
  }

  async submitExitInterview(exitInterviewId: string, data: ExitInterviewData): Promise<any> {
    const response = await apiClient.put(
      `/separation/exit-interview/${exitInterviewId}/complete`,
      {
        conducted_by: data.conducted_by,
        questionnaire_responses: data.questionnaire_responses,
        feedback: data.feedback,
      }
    );
    return response.data;
  }

  async getFnFSettlement(employeeId: string): Promise<FnFSettlement> {
    const response = await apiClient.get(`/separation/fnf/${employeeId}`);
    return response.data?.data ?? response.data;
  }

  async submitFnFForApproval(fnfId: string): Promise<any> {
    const response = await apiClient.put(`/separation/fnf/${fnfId}/submit`, {});
    return response.data;
  }

  async updateFnFSettlement(fnfId: string, data: {
    bonus?: number;
    other_benefits?: number;
    other_deductions?: number;
    pending_salary?: number;
    leave_encashment?: number;
    gratuity?: number;
    advance_deduction?: number;
  }): Promise<any> {
    const response = await apiClient.put(`/separation/fnf/${fnfId}/update`, data);
    return response.data;
  }

  async approveFnFSettlement(fnfId: string, approvedBy: string): Promise<any> {
    const response = await apiClient.put(`/separation/fnf/${fnfId}/approve`, {
      approvedBy,
    });
    return response.data;
  }

  async markFnFAsPaid(fnfId: string): Promise<any> {
    const response = await apiClient.put(`/separation/fnf/${fnfId}/paid`, {});
    return response.data;
  }

  async rejectFnFSettlement(fnfId: string, rejectedBy: string, reason: string): Promise<any> {
    const response = await apiClient.put(`/separation/fnf/${fnfId}/reject`, {
      rejectedBy,
      reason,
    });
    return response.data;
  }

  async getAssetRecoveryChecklist(employeeId: string): Promise<AssetRecoveryItem[]> {
    const response = await apiClient.get(`/separation/asset-recovery/${employeeId}`);
    return response.data?.data ?? response.data ?? [];
  }

  async updateAssetRecoveryStatus(
    assetRecoveryId: string,
    status: string,
    damageCost?: number
  ): Promise<any> {
    const response = await apiClient.put(`/separation/asset-recovery/${assetRecoveryId}`, {
      status,
      damage_cost: damageCost,
    });
    return response.data;
  }

  async getOffboardingStatus(employeeId: string): Promise<OffboardingStatus> {
    const response = await apiClient.get(`/separation/offboarding-check/${employeeId}`);
    return response.data?.data ?? response.data;
  }

  async deactivateEmployee(employeeId: string): Promise<any> {
    const response = await apiClient.put(`/separation/deactivate/${employeeId}`, {});
    return response.data;
  }

  async revokeSystemAccess(employeeId: string): Promise<any> {
    const response = await apiClient.put(`/separation/revoke-access/${employeeId}`, {});
    return response.data;
  }

  async archiveEmployee(employeeId: string): Promise<any> {
    const response = await apiClient.put(`/separation/archive/${employeeId}`, {});
    return response.data;
  }
}

export const separationService = new SeparationService();
