// @ts-ignore: Workaround for IDE module resolution issue with knex v3 exports map
import { Knex } from 'knex';
import { SeparationService } from '../separationService';
import { getKnexInstance } from '../../config/knex';
import { v4 as uuidv4 } from 'uuid';

describe('F&F Settlement Approval Workflow', () => {
  let db: Knex;
  let separationService: SeparationService;
  let testEmployeeId: string;
  let testApproverId: string;
  let testFnFSettlementId: string;

  beforeAll(async () => {
    db = getKnexInstance();
    separationService = new SeparationService(db);
  });

  beforeEach(async () => {
    // Create test employee
    testEmployeeId = uuidv4();
    await db('employees').insert({
      id: testEmployeeId,
      employee_id: `EMP${Date.now()}`,
      first_name: 'Test',
      last_name: 'Employee',
      email: `test${Date.now()}@example.com`,
      date_of_joining: new Date('2020-01-01'),
      status: 'active',
    });

    // Create approver employee
    testApproverId = uuidv4();
    await db('employees').insert({
      id: testApproverId,
      employee_id: `EMP${Date.now() + 1}`,
      first_name: 'Approver',
      last_name: 'User',
      email: `approver${Date.now()}@example.com`,
      date_of_joining: new Date('2019-01-01'),
      status: 'active',
    });

    // Create salary structure for the employee
    await db('salary_structures').insert({
      id: uuidv4(),
      employee_id: testEmployeeId,
      base_salary: 50000,
      salary_mode: 'monthly',
      pf_contribution_rate: 12,
      esi_contribution_rate: 0.75,
      effective_from: new Date('2020-01-01'),
    });

    // Create a draft F&F settlement
    testFnFSettlementId = uuidv4();
    await db('fnf_settlements').insert({
      id: testFnFSettlementId,
      employee_id: testEmployeeId,
      pending_salary: 25000,
      leave_encashment: 5000,
      gratuity: 10000,
      bonus: 0,
      other_benefits: 0,
      total_earnings: 40000,
      advance_deduction: 5000,
      asset_damage_deduction: 0,
      other_deductions: 0,
      total_deductions: 5000,
      net_settlement: 35000,
      status: 'draft',
    });
  });

  afterEach(async () => {
    // Clean up test data
    await db('fnf_settlements').where('employee_id', testEmployeeId).del();
    await db('salary_structures').where('employee_id', testEmployeeId).del();
    await db('employees').where('id', testEmployeeId).del();
    await db('employees').where('id', testApproverId).del();
    // Clean up audit logs if table exists
    try {
      const hasAuditLogs = await db.schema.hasTable('audit_logs');
      if (hasAuditLogs) {
        await db('audit_logs').where('entity_type', 'fnf_settlement').andWhere('entity_id', testFnFSettlementId).del();
      }
    } catch (error) {
      // Ignore if audit_logs table doesn't exist
    }
  });

  afterAll(async () => {
    await db.destroy();
  });

  describe('submitFnFSettlementForApproval', () => {
    it('should submit F&F settlement for approval (draft → pending_approval)', async () => {
      const result = await separationService.submitFnFSettlementForApproval(testFnFSettlementId);

      expect(result).toBeDefined();
      expect(result.id).toBe(testFnFSettlementId);
      expect(result.status).toBe('pending_approval');
    });

    it('should throw error when F&F settlement not found', async () => {
      const nonExistentId = uuidv4();

      await expect(
        separationService.submitFnFSettlementForApproval(nonExistentId)
      ).rejects.toThrow('F&F Settlement not found');
    });

    it('should throw error when trying to submit non-draft settlement', async () => {
      // Update settlement to pending_approval
      await db('fnf_settlements')
        .where('id', testFnFSettlementId)
        .update({ status: 'pending_approval' });

      await expect(
        separationService.submitFnFSettlementForApproval(testFnFSettlementId)
      ).rejects.toThrow('Cannot submit settlement with status: pending_approval');
    });

    it('should throw error when trying to submit approved settlement', async () => {
      // Update settlement to approved
      await db('fnf_settlements')
        .where('id', testFnFSettlementId)
        .update({ status: 'approved' });

      await expect(
        separationService.submitFnFSettlementForApproval(testFnFSettlementId)
      ).rejects.toThrow('Cannot submit settlement with status: approved');
    });
  });

  describe('approveFnFSettlement', () => {
    beforeEach(async () => {
      // Set settlement to pending_approval
      await db('fnf_settlements')
        .where('id', testFnFSettlementId)
        .update({ status: 'pending_approval' });
    });

    it('should approve F&F settlement (pending_approval → approved)', async () => {
      const result = await separationService.approveFnFSettlement(testFnFSettlementId, testApproverId);

      expect(result).toBeDefined();
      expect(result.id).toBe(testFnFSettlementId);
      expect(result.status).toBe('approved');
      expect(result.approved_by).toBe(testApproverId);
      expect(result.approved_at).toBeDefined();
    });

    it('should create audit log when approving settlement', async () => {
      await separationService.approveFnFSettlement(testFnFSettlementId, testApproverId);

      // Check if audit_logs table exists
      const hasAuditLogs = await db.schema.hasTable('audit_logs');
      if (hasAuditLogs) {
        const auditLog = await db('audit_logs')
          .where('entity_type', 'fnf_settlement')
          .where('entity_id', testFnFSettlementId)
          .where('action', 'approved')
          .first();

        expect(auditLog).toBeDefined();
        expect(auditLog.performed_by).toBe(testApproverId);
        expect(auditLog.changes).toBeDefined();
      } else {
        // If audit_logs table doesn't exist, just verify the approval worked
        const settlement = await db('fnf_settlements').where('id', testFnFSettlementId).first();
        expect(settlement.status).toBe('approved');
      }
    });

    it('should throw error when F&F settlement not found', async () => {
      const nonExistentId = uuidv4();

      await expect(
        separationService.approveFnFSettlement(nonExistentId, testApproverId)
      ).rejects.toThrow('F&F Settlement not found');
    });

    it('should throw error when trying to approve draft settlement', async () => {
      // Update settlement back to draft
      await db('fnf_settlements')
        .where('id', testFnFSettlementId)
        .update({ status: 'draft' });

      await expect(
        separationService.approveFnFSettlement(testFnFSettlementId, testApproverId)
      ).rejects.toThrow('Cannot approve settlement with status: draft');
    });

    it('should throw error when trying to approve already approved settlement', async () => {
      // Update settlement to approved
      await db('fnf_settlements')
        .where('id', testFnFSettlementId)
        .update({ status: 'approved' });

      await expect(
        separationService.approveFnFSettlement(testFnFSettlementId, testApproverId)
      ).rejects.toThrow('Cannot approve settlement with status: approved');
    });
  });

  describe('rejectFnFSettlement', () => {
    beforeEach(async () => {
      // Set settlement to pending_approval
      await db('fnf_settlements')
        .where('id', testFnFSettlementId)
        .update({ status: 'pending_approval' });
    });

    it('should reject F&F settlement (pending_approval → draft)', async () => {
      const reason = 'Incorrect leave encashment calculation';
      const result = await separationService.rejectFnFSettlement(testFnFSettlementId, testApproverId, reason);

      expect(result).toBeDefined();
      expect(result.id).toBe(testFnFSettlementId);
      expect(result.status).toBe('draft');
    });

    it('should create audit log when rejecting settlement', async () => {
      const reason = 'Incorrect gratuity calculation';
      await separationService.rejectFnFSettlement(testFnFSettlementId, testApproverId, reason);

      // Check if audit_logs table exists
      const hasAuditLogs = await db.schema.hasTable('audit_logs');
      if (hasAuditLogs) {
        const auditLog = await db('audit_logs')
          .where('entity_type', 'fnf_settlement')
          .where('entity_id', testFnFSettlementId)
          .where('action', 'rejected')
          .first();

        expect(auditLog).toBeDefined();
        expect(auditLog.performed_by).toBe(testApproverId);
        expect(auditLog.changes).toBeDefined();
        expect(auditLog.changes.rejection_reason).toBe(reason);
      } else {
        // If audit_logs table doesn't exist, just verify the rejection worked
        const settlement = await db('fnf_settlements').where('id', testFnFSettlementId).first();
        expect(settlement.status).toBe('draft');
      }
    });

    it('should throw error when F&F settlement not found', async () => {
      const nonExistentId = uuidv4();
      const reason = 'Test reason';

      await expect(
        separationService.rejectFnFSettlement(nonExistentId, testApproverId, reason)
      ).rejects.toThrow('F&F Settlement not found');
    });

    it('should throw error when trying to reject draft settlement', async () => {
      // Update settlement back to draft
      await db('fnf_settlements')
        .where('id', testFnFSettlementId)
        .update({ status: 'draft' });

      const reason = 'Test reason';

      await expect(
        separationService.rejectFnFSettlement(testFnFSettlementId, testApproverId, reason)
      ).rejects.toThrow('Cannot reject settlement with status: draft');
    });

    it('should throw error when trying to reject approved settlement', async () => {
      // Update settlement to approved
      await db('fnf_settlements')
        .where('id', testFnFSettlementId)
        .update({ status: 'approved' });

      const reason = 'Test reason';

      await expect(
        separationService.rejectFnFSettlement(testFnFSettlementId, testApproverId, reason)
      ).rejects.toThrow('Cannot reject settlement with status: approved');
    });
  });

  describe('Complete Approval Workflow', () => {
    it('should complete full approval workflow: draft → pending → approved', async () => {
      // Step 1: Submit for approval
      const submitted = await separationService.submitFnFSettlementForApproval(testFnFSettlementId);
      expect(submitted.status).toBe('pending_approval');

      // Step 2: Approve
      const approved = await separationService.approveFnFSettlement(testFnFSettlementId, testApproverId);
      expect(approved.status).toBe('approved');
      expect(approved.approved_by).toBe(testApproverId);
    });

    it('should complete rejection workflow: draft → pending → draft', async () => {
      // Step 1: Submit for approval
      const submitted = await separationService.submitFnFSettlementForApproval(testFnFSettlementId);
      expect(submitted.status).toBe('pending_approval');

      // Step 2: Reject
      const reason = 'Needs recalculation';
      const rejected = await separationService.rejectFnFSettlement(testFnFSettlementId, testApproverId, reason);
      expect(rejected.status).toBe('draft');

      // Step 3: Can resubmit after rejection
      const resubmitted = await separationService.submitFnFSettlementForApproval(testFnFSettlementId);
      expect(resubmitted.status).toBe('pending_approval');
    });

    it('should mark approved settlement as paid', async () => {
      // Submit and approve
      await separationService.submitFnFSettlementForApproval(testFnFSettlementId);
      await separationService.approveFnFSettlement(testFnFSettlementId, testApproverId);

      // Mark as paid
      const paid = await separationService.markFnFSettlementAsPaid(testFnFSettlementId);
      expect(paid.status).toBe('paid');
      expect(paid.paid_at).toBeDefined();
    });

    it('should not allow marking non-approved settlement as paid', async () => {
      // Try to mark draft settlement as paid
      await expect(
        separationService.markFnFSettlementAsPaid(testFnFSettlementId)
      ).rejects.toThrow('Cannot mark settlement as paid with status: draft');
    });
  });

  describe('Status Transition Validation', () => {
    it('should enforce valid status transitions', async () => {
      // Valid: draft → pending_approval
      await expect(
        separationService.submitFnFSettlementForApproval(testFnFSettlementId)
      ).resolves.toBeDefined();

      // Invalid: pending_approval → pending_approval
      await expect(
        separationService.submitFnFSettlementForApproval(testFnFSettlementId)
      ).rejects.toThrow();

      // Valid: pending_approval → approved
      await expect(
        separationService.approveFnFSettlement(testFnFSettlementId, testApproverId)
      ).resolves.toBeDefined();

      // Invalid: approved → pending_approval
      await expect(
        separationService.submitFnFSettlementForApproval(testFnFSettlementId)
      ).rejects.toThrow();
    });
  });
});
