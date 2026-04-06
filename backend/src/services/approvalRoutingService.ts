import { Knex } from 'knex';
import { HierarchyService } from './hierarchyService';
import notificationService from './notificationService';

export interface ApprovalRequest {
  id: string;
  requestType: 'leave' | 'travel' | 'expense';
  requestId: string;
  employeeId: string;
  status: 'pending' | 'approved' | 'rejected';
  approvalChain: ApprovalStep[];
  currentApprovalLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalStep {
  level: number;
  approverId: string;
  approverName: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: Date;
  rejectionReason?: string;
}

export interface ApprovalRoutingDTO {
  requestType: 'leave' | 'travel' | 'expense';
  requestId: string;
  employeeId: string;
  requestData: Record<string, any>;
}

export interface ApprovalDecisionDTO {
  approvalRequestId: string;
  approverId: string;
  decision: 'approved' | 'rejected';
  reason?: string;
}

export class ApprovalRoutingService {
  private hierarchyService: HierarchyService;

  constructor(private knex: Knex) {
    this.hierarchyService = new HierarchyService(knex);
  }

  /**
   * Route an approval request through the hierarchy
   */
  async routeApprovalRequest(data: ApprovalRoutingDTO): Promise<ApprovalRequest> {
    // Get the reporting chain for the employee
    const reportingChain = await this.hierarchyService.getReportingChain(
      data.employeeId
    );

    if (!reportingChain || reportingChain.length === 0) {
      throw new Error(
        'No reporting chain found for employee. Cannot route approval.'
      );
    }

    // Create approval steps for each level in the hierarchy
    const approvalSteps: ApprovalStep[] = reportingChain.map((manager, index) => ({
      level: index + 1,
      approverId: manager.employee_id,
      approverName: `${manager.first_name} ${manager.last_name}`,
      status: 'pending',
    }));

    // Create approval request record
    const approvalRequest: ApprovalRequest = {
      id: this.generateId(),
      requestType: data.requestType,
      requestId: data.requestId,
      employeeId: data.employeeId,
      status: 'pending',
      approvalChain: approvalSteps,
      currentApprovalLevel: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store in database
    await this.knex('approval_requests').insert({
      id: approvalRequest.id,
      request_type: data.requestType,
      request_id: data.requestId,
      employee_id: data.employeeId,
      status: 'pending',
      approval_chain: JSON.stringify(approvalSteps),
      current_approval_level: 1,
      created_at: approvalRequest.createdAt,
      updated_at: approvalRequest.updatedAt,
    });

    // Notify the first approver
    const firstApprover = approvalSteps[0];
    if (firstApprover) {
      await this.notifyApprover(
        firstApprover.approverId,
        data.requestType,
        data.requestId,
        approvalRequest.id
      );
    }

    // Log audit trail
    await this.logAuditTrail(
      approvalRequest.id,
      'created',
      null,
      firstApprover || null,
      data.employeeId
    );

    return approvalRequest;
  }

  /**
   * Process an approval decision
   */
  async processApprovalDecision(data: ApprovalDecisionDTO): Promise<void> {
    // Get the approval request
    const approvalRequest = await this.getApprovalRequest(data.approvalRequestId);

    if (!approvalRequest) {
      throw new Error('Approval request not found');
    }

    if (approvalRequest.status !== 'pending') {
      throw new Error('Approval request is no longer pending');
    }

    const currentStep = approvalRequest.approvalChain[approvalRequest.currentApprovalLevel - 1];

    if (!currentStep) {
      throw new Error('Invalid approval level');
    }

    if (currentStep.approverId !== data.approverId) {
      throw new Error('Only the assigned approver can make this decision');
    }

    // Update the current approval step
    currentStep.status = data.decision;
    currentStep.approvedAt = new Date();
    if (data.decision === 'rejected' && data.reason) {
      currentStep.rejectionReason = data.reason;
    }

    // Handle rejection
    if (data.decision === 'rejected') {
      approvalRequest.status = 'rejected';
      approvalRequest.updatedAt = new Date();

      await this.knex('approval_requests')
        .where('id', data.approvalRequestId)
        .update({
          status: 'rejected',
          approval_chain: JSON.stringify(approvalRequest.approvalChain),
          updated_at: approvalRequest.updatedAt,
        });

      // Notify employee of rejection
      await this.notifyRejection(
        approvalRequest.employeeId,
        approvalRequest.requestType,
        approvalRequest.requestId,
        currentStep.rejectionReason
      );

      // Log audit trail
      const previousStep = approvalRequest.currentApprovalLevel > 1 
        ? approvalRequest.approvalChain[approvalRequest.currentApprovalLevel - 2] || null
        : null;
      await this.logAuditTrail(
        data.approvalRequestId,
        'rejected',
        previousStep,
        currentStep,
        data.approverId
      );

      return;
    }

    // Handle approval
    const isLastLevel = approvalRequest.currentApprovalLevel === approvalRequest.approvalChain.length;

    if (isLastLevel) {
      // All approvals complete
      approvalRequest.status = 'approved';
      approvalRequest.updatedAt = new Date();

      await this.knex('approval_requests')
        .where('id', data.approvalRequestId)
        .update({
          status: 'approved',
          approval_chain: JSON.stringify(approvalRequest.approvalChain),
          updated_at: approvalRequest.updatedAt,
        });

      // Notify employee of final approval
      await this.notifyApprovalComplete(
        approvalRequest.employeeId,
        approvalRequest.requestType,
        approvalRequest.requestId
      );

      // Log audit trail
      const previousStep = approvalRequest.currentApprovalLevel > 1 
        ? approvalRequest.approvalChain[approvalRequest.currentApprovalLevel - 2] || null
        : null;
      await this.logAuditTrail(
        data.approvalRequestId,
        'approved_final',
        previousStep,
        currentStep,
        data.approverId
      );
    } else {
      // Move to next approval level
      approvalRequest.currentApprovalLevel += 1;
      approvalRequest.updatedAt = new Date();

      await this.knex('approval_requests')
        .where('id', data.approvalRequestId)
        .update({
          approval_chain: JSON.stringify(approvalRequest.approvalChain),
          current_approval_level: approvalRequest.currentApprovalLevel,
          updated_at: approvalRequest.updatedAt,
        });

      // Notify next approver
      const nextStep = approvalRequest.approvalChain[approvalRequest.currentApprovalLevel - 1];
      if (nextStep) {
        await this.notifyApprover(
          nextStep.approverId,
          approvalRequest.requestType,
          approvalRequest.requestId,
          data.approvalRequestId
        );
      }

      // Log audit trail
      const previousStep = approvalRequest.currentApprovalLevel > 1 
        ? approvalRequest.approvalChain[approvalRequest.currentApprovalLevel - 2] || null
        : null;
      await this.logAuditTrail(
        data.approvalRequestId,
        'approved_level',
        previousStep,
        currentStep,
        data.approverId
      );
    }
  }

  /**
   * Get approval request details
   */
  async getApprovalRequest(approvalRequestId: string): Promise<ApprovalRequest | null> {
    const record = await this.knex('approval_requests')
      .where('id', approvalRequestId)
      .first();

    if (!record) {
      return null;
    }

    return {
      id: record.id,
      requestType: record.request_type,
      requestId: record.request_id,
      employeeId: record.employee_id,
      status: record.status,
      approvalChain: JSON.parse(record.approval_chain),
      currentApprovalLevel: record.current_approval_level,
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at),
    };
  }

  /**
   * Get pending approvals for a manager
   */
  async getPendingApprovalsForManager(managerId: string): Promise<ApprovalRequest[]> {
    const records = await this.knex('approval_requests')
      .whereRaw(
        `approval_chain->?->'approverId' = ?`,
        [this.knex.raw('current_approval_level - 1'), managerId]
      )
      .where('status', 'pending')
      .select('*');

    return records.map((record) => ({
      id: record.id,
      requestType: record.request_type,
      requestId: record.request_id,
      employeeId: record.employee_id,
      status: record.status,
      approvalChain: JSON.parse(record.approval_chain),
      currentApprovalLevel: record.current_approval_level,
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at),
    }));
  }

  /**
   * Get approval history for a request
   */
  async getApprovalHistory(requestId: string): Promise<ApprovalRequest[]> {
    const records = await this.knex('approval_requests')
      .where('request_id', requestId)
      .orderBy('created_at', 'desc')
      .select('*');

    return records.map((record) => ({
      id: record.id,
      requestType: record.request_type,
      requestId: record.request_id,
      employeeId: record.employee_id,
      status: record.status,
      approvalChain: JSON.parse(record.approval_chain),
      currentApprovalLevel: record.current_approval_level,
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at),
    }));
  }

  /**
   * Notify approver of pending approval
   */
  private async notifyApprover(
    approverId: string,
    requestType: string,
    requestId: string,
    _approvalRequestId: string
  ): Promise<void> {
    const message = `New ${requestType} approval request pending. Request ID: ${requestId}`;

    await notificationService.sendNotification({
      employeeId: approverId,
      type: 'system_notification' as any,
      title: `${requestType.charAt(0).toUpperCase() + requestType.slice(1)} Approval Required`,
      body: message,
      channels: ['email' as any],
    });
  }

  /**
   * Notify employee of rejection
   */
  private async notifyRejection(
    employeeId: string,
    requestType: string,
    requestId: string,
    reason?: string
  ): Promise<void> {
    const message = `Your ${requestType} request (ID: ${requestId}) has been rejected.${
      reason ? ` Reason: ${reason}` : ''
    }`;

    await notificationService.sendNotification({
      employeeId,
      type: 'system_notification' as any,
      title: `${requestType.charAt(0).toUpperCase() + requestType.slice(1)} Request Rejected`,
      body: message,
      channels: ['email' as any],
    });
  }

  /**
   * Notify employee of approval completion
   */
  private async notifyApprovalComplete(
    employeeId: string,
    requestType: string,
    requestId: string
  ): Promise<void> {
    const message = `Your ${requestType} request (ID: ${requestId}) has been approved.`;

    await notificationService.sendNotification({
      employeeId,
      type: 'system_notification' as any,
      title: `${requestType.charAt(0).toUpperCase() + requestType.slice(1)} Request Approved`,
      body: message,
      channels: ['email' as any],
    });
  }

  /**
   * Log audit trail for approval actions
   */
  private async logAuditTrail(
    approvalRequestId: string,
    action: string,
    previousStep: ApprovalStep | null,
    currentStep: ApprovalStep | null,
    userId: string
  ): Promise<void> {
    await this.knex('approval_audit_logs').insert({
      id: this.generateId(),
      approval_request_id: approvalRequestId,
      action,
      previous_value: previousStep ? JSON.stringify(previousStep) : null,
      new_value: currentStep ? JSON.stringify(currentStep) : null,
      changed_by: userId,
      created_at: new Date(),
    });
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}
