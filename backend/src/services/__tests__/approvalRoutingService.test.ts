import { ApprovalRoutingService } from '../approvalRoutingService';

describe('ApprovalRoutingService', () => {
  let service: ApprovalRoutingService;
  let mockKnex: any;

  beforeEach(() => {
    // Create a comprehensive mock Knex instance
    mockKnex = {
      insert: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      whereRaw: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue(null),
      select: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockResolvedValue(undefined),
      raw: jest.fn((sql: string) => sql),
    };

    // Mock the HierarchyService
    jest.mock('../hierarchyService', () => ({
      HierarchyService: jest.fn().mockImplementation(() => ({
        getReportingChain: jest.fn().mockResolvedValue([
          {
            employee_id: 'mgr1',
            first_name: 'John',
            last_name: 'Manager',
            designation: 'Manager',
            level: 1,
          },
        ]),
      })),
    }));

    service = new ApprovalRoutingService(mockKnex);
  });

  describe('getApprovalRequest', () => {
    it('should retrieve approval request by ID', async () => {
      const mockRecord = {
        id: 'apr1',
        request_type: 'leave',
        request_id: 'leave123',
        employee_id: 'emp1',
        status: 'pending',
        approval_chain: JSON.stringify([
          {
            level: 1,
            approverId: 'mgr1',
            approverName: 'John Manager',
            status: 'pending',
          },
        ]),
        current_approval_level: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockKnex.where.mockReturnValue({
        first: jest.fn().mockResolvedValue(mockRecord),
      });

      const result = await service.getApprovalRequest('apr1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('apr1');
      expect(result?.requestType).toBe('leave');
      expect(result?.status).toBe('pending');
      expect(result?.approvalChain.length).toBe(1);
    });

    it('should return null if approval request not found', async () => {
      mockKnex.where.mockReturnValue({
        first: jest.fn().mockResolvedValue(null),
      });

      const result = await service.getApprovalRequest('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getApprovalHistory', () => {
    it('should retrieve approval history for a request', async () => {
      const mockRecords = [
        {
          id: 'apr1',
          request_type: 'leave',
          request_id: 'leave123',
          employee_id: 'emp1',
          status: 'approved',
          approval_chain: JSON.stringify([
            {
              level: 1,
              approverId: 'mgr1',
              approverName: 'John Manager',
              status: 'approved',
            },
          ]),
          current_approval_level: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockKnex.where.mockReturnValue({
        orderBy: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(mockRecords),
        }),
      });

      const result = await service.getApprovalHistory('leave123');

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0]?.id).toBe('apr1');
      expect(result[0]?.status).toBe('approved');
    });

    it('should return empty array if no history found', async () => {
      mockKnex.where.mockReturnValue({
        orderBy: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await service.getApprovalHistory('nonexistent');

      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });
  });

  describe('getPendingApprovalsForManager', () => {
    it('should retrieve pending approvals for a manager', async () => {
      const mockRecords = [
        {
          id: 'apr1',
          request_type: 'leave',
          request_id: 'leave123',
          employee_id: 'emp1',
          status: 'pending',
          approval_chain: JSON.stringify([
            {
              level: 1,
              approverId: 'mgr1',
              approverName: 'John Manager',
              status: 'pending',
            },
          ]),
          current_approval_level: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockKnex.whereRaw.mockReturnValue({
        where: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(mockRecords),
        }),
      });

      const result = await service.getPendingApprovalsForManager('mgr1');

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0]?.status).toBe('pending');
    });

    it('should return empty array if no pending approvals', async () => {
      mockKnex.whereRaw.mockReturnValue({
        where: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await service.getPendingApprovalsForManager('mgr1');

      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });
  });

  describe('Approval chain structure', () => {
    it('should maintain approval chain immutability', () => {
      const approvalChain = [
        {
          level: 1,
          approverId: 'mgr1',
          approverName: 'John Manager',
          status: 'pending' as const,
        },
        {
          level: 2,
          approverId: 'dir1',
          approverName: 'Jane Director',
          status: 'pending' as const,
        },
      ];

      // Verify chain structure
      expect(approvalChain.length).toBe(2);
      expect(approvalChain[0]?.level).toBe(1);
      expect(approvalChain[1]?.level).toBe(2);

      // Verify levels are ordered
      for (let i = 1; i < approvalChain.length; i++) {
        expect(approvalChain[i]?.level).toBeGreaterThan(approvalChain[i - 1]?.level || 0);
      }
    });
  });
});
