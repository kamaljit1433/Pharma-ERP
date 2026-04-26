import { AuditLogService } from '../auditLogService';
import { auditLogRepository } from '../../repositories/auditLogRepository';
import { Role } from '../../types/rbac';

jest.mock('../../repositories/auditLogRepository');

describe('AuditLogService', () => {
  let auditLogService: AuditLogService;

  beforeEach(() => {
    jest.clearAllMocks();
    auditLogService = new AuditLogService();
  });

  describe('logAccess', () => {
    it('should log successful access', async () => {
      const logData = {
        userId: 'user-1',
        userRole: Role.SUPER_ADMIN,
        action: 'view_employee',
        entity_type: 'employee',
        entity_id: 'emp-1',
        resourceType: 'employee',
        resourceId: 'emp-1',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      const mockLog = {
        id: 'log-1',
        ...logData,
        status: 'success',
        timestamp: new Date(),
      };

      (auditLogRepository.create as jest.Mock).mockResolvedValue(mockLog);

      const result = await auditLogService.logAccess(logData);

      expect(result).toEqual(mockLog);
      expect(auditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: logData.action,
          entity_type: logData.entity_type,
          entity_id: logData.entity_id,
          status: 'success',
        })
      );
    });
  });

  describe('logAccessDenied', () => {
    it('should log failed access attempt', async () => {
      const logData = {
        userId: 'user-1',
        userRole: Role.EMPLOYEE,
        action: 'view_payroll',
        entity_type: 'payroll',
        entity_id: 'payroll-1',
        resourceType: 'payroll',
        resourceId: 'payroll-1',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      const mockLog = {
        id: 'log-1',
        ...logData,
        status: 'failure',
        timestamp: new Date(),
      };

      (auditLogRepository.create as jest.Mock).mockResolvedValue(mockLog);

      const result = await auditLogService.logAccessDenied(logData);

      expect(result).toEqual(mockLog);
      expect(auditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: logData.action,
          entity_type: logData.entity_type,
          entity_id: logData.entity_id,
          status: 'failure',
        })
      );
    });
  });

  describe('logEmployeeCreated', () => {
    it('should log employee creation', async () => {
      const mockLog = {
        id: 'log-1',
        userId: 'user-1',
        userRole: Role.SUPER_ADMIN,
        action: 'create_employee',
        resourceType: 'employee',
        resourceId: 'emp-1',
        changes: { first_name: 'John', last_name: 'Doe' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        status: 'success',
        timestamp: new Date(),
      };

      (auditLogRepository.create as jest.Mock).mockResolvedValue(mockLog);

      const result = await auditLogService.logEmployeeCreated(
        'user-1',
        Role.SUPER_ADMIN,
        'emp-1',
        { first_name: 'John', last_name: 'Doe' },
        '192.168.1.1',
        'Mozilla/5.0'
      );

      expect(result).toEqual(mockLog);
      expect(auditLogRepository.create).toHaveBeenCalled();
    });
  });

  describe('logEmployeeUpdated', () => {
    it('should log employee update', async () => {
      const mockLog = {
        id: 'log-1',
        userId: 'user-1',
        userRole: Role.SUPER_ADMIN,
        action: 'update_employee',
        resourceType: 'employee',
        resourceId: 'emp-1',
        changes: { status: 'active' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        status: 'success',
        timestamp: new Date(),
      };

      (auditLogRepository.create as jest.Mock).mockResolvedValue(mockLog);

      const result = await auditLogService.logEmployeeUpdated(
        'user-1',
        Role.SUPER_ADMIN,
        'emp-1',
        { status: 'active' },
        '192.168.1.1',
        'Mozilla/5.0'
      );

      expect(result).toEqual(mockLog);
      expect(auditLogRepository.create).toHaveBeenCalled();
    });
  });

  describe('logEmployeeDeleted', () => {
    it('should log employee deletion', async () => {
      const mockLog = {
        id: 'log-1',
        userId: 'user-1',
        userRole: Role.SUPER_ADMIN,
        action: 'delete_employee',
        resourceType: 'employee',
        resourceId: 'emp-1',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        status: 'success',
        timestamp: new Date(),
      };

      (auditLogRepository.create as jest.Mock).mockResolvedValue(mockLog);

      const result = await auditLogService.logEmployeeDeleted(
        'user-1',
        Role.SUPER_ADMIN,
        'emp-1',
        '192.168.1.1',
        'Mozilla/5.0'
      );

      expect(result).toEqual(mockLog);
      expect(auditLogRepository.create).toHaveBeenCalled();
    });
  });

  describe('logPayrollProcessed', () => {
    it('should log payroll processing', async () => {
      const mockLog = {
        id: 'log-1',
        userId: 'user-1',
        userRole: Role.FINANCE_PAYROLL,
        action: 'process_payroll',
        resourceType: 'payroll',
        resourceId: '2024-01',
        changes: { employeeCount: 50, totalAmount: 500000 },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        status: 'success',
        timestamp: new Date(),
      };

      (auditLogRepository.create as jest.Mock).mockResolvedValue(mockLog);

      const result = await auditLogService.logPayrollProcessed(
        'user-1',
        Role.FINANCE_PAYROLL,
        1,
        2024,
        50,
        500000,
        '192.168.1.1',
        'Mozilla/5.0'
      );

      expect(result).toEqual(mockLog);
      expect(auditLogRepository.create).toHaveBeenCalled();
    });
  });

  describe('logPayrollLocked', () => {
    it('should log payroll lock', async () => {
      const mockLog = {
        id: 'log-1',
        userId: 'user-1',
        userRole: Role.FINANCE_PAYROLL,
        action: 'lock_payroll',
        resourceType: 'payroll',
        resourceId: 'payroll-1',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        status: 'success',
        timestamp: new Date(),
      };

      (auditLogRepository.create as jest.Mock).mockResolvedValue(mockLog);

      const result = await auditLogService.logPayrollLocked(
        'user-1',
        Role.FINANCE_PAYROLL,
        'payroll-1',
        '192.168.1.1',
        'Mozilla/5.0'
      );

      expect(result).toEqual(mockLog);
      expect(auditLogRepository.create).toHaveBeenCalled();
    });
  });

  describe('logLeaveApproved', () => {
    it('should log leave approval', async () => {
      const mockLog = {
        id: 'log-1',
        userId: 'user-1',
        userRole: Role.DEPARTMENT_MANAGER,
        action: 'approve_leave',
        resourceType: 'leave',
        resourceId: 'leave-1',
        changes: { employeeId: 'emp-1', approvedBy: 'user-1' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        status: 'success',
        timestamp: new Date(),
      };

      (auditLogRepository.create as jest.Mock).mockResolvedValue(mockLog);

      const result = await auditLogService.logLeaveApproved(
        'user-1',
        Role.DEPARTMENT_MANAGER,
        'leave-1',
        'emp-1',
        '192.168.1.1',
        'Mozilla/5.0'
      );

      expect(result).toEqual(mockLog);
      expect(auditLogRepository.create).toHaveBeenCalled();
    });
  });

  describe('logLeaveRejected', () => {
    it('should log leave rejection', async () => {
      const mockLog = {
        id: 'log-1',
        userId: 'user-1',
        userRole: Role.DEPARTMENT_MANAGER,
        action: 'reject_leave',
        resourceType: 'leave',
        resourceId: 'leave-1',
        changes: { employeeId: 'emp-1', rejectedBy: 'user-1', reason: 'Insufficient balance' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        status: 'success',
        timestamp: new Date(),
      };

      (auditLogRepository.create as jest.Mock).mockResolvedValue(mockLog);

      const result = await auditLogService.logLeaveRejected(
        'user-1',
        Role.DEPARTMENT_MANAGER,
        'leave-1',
        'emp-1',
        'Insufficient balance',
        '192.168.1.1',
        'Mozilla/5.0'
      );

      expect(result).toEqual(mockLog);
      expect(auditLogRepository.create).toHaveBeenCalled();
    });
  });

  describe('logBankDetailsUpdated', () => {
    it('should log bank details update', async () => {
      const mockLog = {
        id: 'log-1',
        userId: 'user-1',
        userRole: Role.EMPLOYEE,
        action: 'update_bank_details',
        resourceType: 'bank_account',
        resourceId: 'account-1',
        changes: { employeeId: 'emp-1', accountNumber: '****1234' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        status: 'success',
        timestamp: new Date(),
      };

      (auditLogRepository.create as jest.Mock).mockResolvedValue(mockLog);

      const result = await auditLogService.logBankDetailsUpdated(
        'user-1',
        Role.EMPLOYEE,
        'emp-1',
        'account-1',
        { accountNumber: '****1234' },
        '192.168.1.1',
        'Mozilla/5.0'
      );

      expect(result).toEqual(mockLog);
      expect(auditLogRepository.create).toHaveBeenCalled();
    });
  });

  describe('logBankDetailsVerified', () => {
    it('should log bank details verification', async () => {
      const mockLog = {
        id: 'log-1',
        userId: 'user-1',
        userRole: Role.FINANCE_PAYROLL,
        action: 'verify_bank_details',
        resourceType: 'bank_account',
        resourceId: 'account-1',
        changes: { employeeId: 'emp-1', verifiedBy: 'user-1' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        status: 'success',
        timestamp: new Date(),
      };

      (auditLogRepository.create as jest.Mock).mockResolvedValue(mockLog);

      const result = await auditLogService.logBankDetailsVerified(
        'user-1',
        Role.FINANCE_PAYROLL,
        'account-1',
        'emp-1',
        '192.168.1.1',
        'Mozilla/5.0'
      );

      expect(result).toEqual(mockLog);
      expect(auditLogRepository.create).toHaveBeenCalled();
    });
  });

  describe('logDocumentUploaded', () => {
    it('should log document upload', async () => {
      const mockLog = {
        id: 'log-1',
        userId: 'user-1',
        userRole: Role.EMPLOYEE,
        action: 'upload_document',
        resourceType: 'document',
        resourceId: 'doc-1',
        changes: { employeeId: 'emp-1', documentType: 'certificate' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        status: 'success',
        timestamp: new Date(),
      };

      (auditLogRepository.create as jest.Mock).mockResolvedValue(mockLog);

      const result = await auditLogService.logDocumentUploaded(
        'user-1',
        Role.EMPLOYEE,
        'doc-1',
        'emp-1',
        'certificate',
        '192.168.1.1',
        'Mozilla/5.0'
      );

      expect(result).toEqual(mockLog);
      expect(auditLogRepository.create).toHaveBeenCalled();
    });
  });

  describe('logDocumentDeleted', () => {
    it('should log document deletion', async () => {
      const mockLog = {
        id: 'log-1',
        userId: 'user-1',
        userRole: Role.EMPLOYEE,
        action: 'delete_document',
        resourceType: 'document',
        resourceId: 'doc-1',
        changes: { employeeId: 'emp-1' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        status: 'success',
        timestamp: new Date(),
      };

      (auditLogRepository.create as jest.Mock).mockResolvedValue(mockLog);

      const result = await auditLogService.logDocumentDeleted(
        'user-1',
        Role.EMPLOYEE,
        'doc-1',
        'emp-1',
        '192.168.1.1',
        'Mozilla/5.0'
      );

      expect(result).toEqual(mockLog);
      expect(auditLogRepository.create).toHaveBeenCalled();
    });
  });

  describe('getUserAuditLogs', () => {
    it('should get audit logs for user', async () => {
      const mockLogs = [
        { id: 'log-1', action: 'view_employee' },
        { id: 'log-2', action: 'update_employee' },
      ];

      (auditLogRepository.getByUserId as jest.Mock).mockResolvedValue(mockLogs);

      const result = await auditLogService.getUserAuditLogs('user-1', 100, 0);

      expect(result).toEqual(mockLogs);
      expect(auditLogRepository.getByUserId).toHaveBeenCalledWith('user-1', 100, 0);
    });
  });

  describe('getResourceAuditLogs', () => {
    it('should get audit logs for resource', async () => {
      const mockLogs = [
        { id: 'log-1', action: 'create_employee' },
        { id: 'log-2', action: 'update_employee' },
      ];

      (auditLogRepository.getByResource as jest.Mock).mockResolvedValue(mockLogs);

      const result = await auditLogService.getResourceAuditLogs('employee', 'emp-1', 100, 0);

      expect(result).toEqual(mockLogs);
      expect(auditLogRepository.getByResource).toHaveBeenCalledWith('employee', 'emp-1');
    });
  });

  describe('searchAuditLogs', () => {
    it('should search audit logs', async () => {
      const filters = { action: 'create_employee' };
      const mockResult = {
        logs: [{ id: 'log-1', action: 'create_employee' }],
        total: 1,
      };

      (auditLogRepository.search as jest.Mock).mockResolvedValue(mockResult);

      const result = await auditLogService.searchAuditLogs(filters);

      expect(result).toEqual(mockResult);
      expect(auditLogRepository.search).toHaveBeenCalledWith(filters);
    });
  });

  describe('getFailedAccessAttempts', () => {
    it('should get failed access attempts', async () => {
      const mockLogs = [
        { id: 'log-1', status: 'failure' },
        { id: 'log-2', status: 'failure' },
      ];

      (auditLogRepository.getFailedAccessAttempts as jest.Mock).mockResolvedValue(mockLogs);

      const result = await auditLogService.getFailedAccessAttempts('user-1', 100);

      expect(result).toEqual(mockLogs);
      expect(auditLogRepository.getFailedAccessAttempts).toHaveBeenCalledWith('user-1', 100);
    });
  });

  describe('getSensitiveOperations', () => {
    it('should get sensitive operations', async () => {
      const mockLogs = [
        { id: 'log-1', action: 'delete_employee' },
        { id: 'log-2', action: 'lock_payroll' },
      ];

      (auditLogRepository.getSensitiveOperations as jest.Mock).mockResolvedValue(mockLogs);

      const result = await auditLogService.getSensitiveOperations('employee', 100, 0);

      expect(result).toEqual(mockLogs);
      expect(auditLogRepository.getSensitiveOperations).toHaveBeenCalledWith(
        'employee',
        100,
        0
      );
    });
  });

  describe('cleanupOldLogs', () => {
    it('should cleanup old logs', async () => {
      (auditLogRepository.deleteOlderThan as jest.Mock).mockResolvedValue(150);

      const result = await auditLogService.cleanupOldLogs(90);

      expect(result).toBe(150);
      expect(auditLogRepository.deleteOlderThan).toHaveBeenCalledWith(90);
    });
  });
});
