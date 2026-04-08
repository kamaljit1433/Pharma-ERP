import { ExpenseService, ExpenseClaimDTO } from '../expenseService';
import { Knex } from 'knex';

jest.mock('../approvalRoutingService');

describe('ExpenseService', () => {
  let service: ExpenseService;
  let mockKnex: jest.Mocked<Knex>;

  beforeEach(() => {
    const queryBuilder = {
      insert: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      whereIn: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      first: jest.fn(),
      select: jest.fn(),
      update: jest.fn().mockReturnThis(),
    };
    mockKnex = Object.assign(jest.fn().mockReturnValue(queryBuilder), queryBuilder) as any;

    service = new ExpenseService(mockKnex);
  });

  describe('submitExpenseClaim', () => {
    it('should create an expense claim with pending status', async () => {
      const dto: ExpenseClaimDTO = {
        employeeId: 'emp1',
        amount: 500,
        category: 'Travel',
        description: 'Client meeting travel',
        receiptUrl: 'https://example.com/receipt.pdf',
      };

      mockKnex.insert.mockResolvedValue(undefined);

      const result = await service.submitExpenseClaim(dto);

      expect(result).toBeDefined();
      expect(result.employeeId).toBe('emp1');
      expect(result.amount).toBe(500);
      expect(result.status).toBe('pending');
      expect(result.category).toBe('Travel');
    });

    it('should throw error for zero amount', async () => {
      const dto: ExpenseClaimDTO = {
        employeeId: 'emp1',
        amount: 0,
        category: 'Travel',
        description: 'Client meeting travel',
      };

      await expect(service.submitExpenseClaim(dto)).rejects.toThrow(
        'Expense amount must be greater than 0'
      );
    });

    it('should throw error for negative amount', async () => {
      const dto: ExpenseClaimDTO = {
        employeeId: 'emp1',
        amount: -100,
        category: 'Travel',
        description: 'Client meeting travel',
      };

      await expect(service.submitExpenseClaim(dto)).rejects.toThrow(
        'Expense amount must be greater than 0'
      );
    });

    it('should route approval through hierarchy', async () => {
      const dto: ExpenseClaimDTO = {
        employeeId: 'emp1',
        amount: 500,
        category: 'Travel',
        description: 'Client meeting travel',
      };

      mockKnex.insert.mockResolvedValue(undefined);

      const result = await service.submitExpenseClaim(dto);

      expect(result).toBeDefined();
      expect(mockKnex.insert).toHaveBeenCalled();
    });
  });

  describe('getExpenseClaim', () => {
    it('should retrieve expense claim by ID', async () => {
      const mockRecord = {
        id: 'exp1',
        employee_id: 'emp1',
        amount: 500,
        category: 'Travel',
        description: 'Client meeting travel',
        receipt_url: 'https://example.com/receipt.pdf',
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockKnex.where.mockReturnValue({
        first: jest.fn().mockResolvedValue(mockRecord),
      } as any);

      const result = await service.getExpenseClaim('exp1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('exp1');
      expect(result?.amount).toBe(500);
      expect(result?.status).toBe('pending');
    });

    it('should return null if expense claim not found', async () => {
      mockKnex.where.mockReturnValue({
        first: jest.fn().mockResolvedValue(null),
      } as any);

      const result = await service.getExpenseClaim('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getEmployeeExpenseClaims', () => {
    it('should retrieve all expense claims for an employee', async () => {
      const mockRecords = [
        {
          id: 'exp1',
          employee_id: 'emp1',
          amount: 500,
          category: 'Travel',
          description: 'Client meeting travel',
          receipt_url: 'https://example.com/receipt.pdf',
          status: 'pending',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'exp2',
          employee_id: 'emp1',
          amount: 200,
          category: 'Meals',
          description: 'Team lunch',
          receipt_url: 'https://example.com/receipt2.pdf',
          status: 'approved',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockKnex.where.mockReturnValue({
        orderBy: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(mockRecords),
        }),
      } as any);

      const result = await service.getEmployeeExpenseClaims('emp1');

      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0]!.id).toBe('exp1');
      expect(result[1]!.id).toBe('exp2');
    });

    it('should return empty array if employee has no claims', async () => {
      mockKnex.where.mockReturnValue({
        orderBy: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue([]),
        }),
      } as any);

      const result = await service.getEmployeeExpenseClaims('emp1');

      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });
  });

  describe('updateExpenseClaimStatus', () => {
    it('should update expense claim status to approved', async () => {
      mockKnex.where.mockReturnValue({
        update: jest.fn().mockResolvedValue(undefined),
      } as any);

      await service.updateExpenseClaimStatus('exp1', 'approved');

      expect(mockKnex.where).toHaveBeenCalledWith('id', 'exp1');
      expect(mockKnex.update).toHaveBeenCalled();
    });

    it('should update expense claim status to rejected', async () => {
      mockKnex.where.mockReturnValue({
        update: jest.fn().mockResolvedValue(undefined),
      } as any);

      await service.updateExpenseClaimStatus('exp1', 'rejected');

      expect(mockKnex.where).toHaveBeenCalledWith('id', 'exp1');
      expect(mockKnex.update).toHaveBeenCalled();
    });

    it('should update expense claim status to paid', async () => {
      mockKnex.where.mockReturnValue({
        update: jest.fn().mockResolvedValue(undefined),
      } as any);

      await service.updateExpenseClaimStatus('exp1', 'paid');

      expect(mockKnex.where).toHaveBeenCalledWith('id', 'exp1');
      expect(mockKnex.update).toHaveBeenCalled();
    });
  });

  describe('getPendingExpenseClaimsForManager', () => {
    it('should retrieve pending expense claims for manager direct reports', async () => {
      const mockDirectReports = [
        { employee_id: 'emp1' },
        { employee_id: 'emp2' },
      ];

      const mockExpenseClaims = [
        {
          id: 'exp1',
          employee_id: 'emp1',
          amount: 500,
          category: 'Travel',
          description: 'Client meeting travel',
          receipt_url: 'https://example.com/receipt.pdf',
          status: 'pending',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockKnex.where.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockDirectReports),
      } as any);

      mockKnex.whereIn.mockReturnValue({
        where: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue(mockExpenseClaims),
          }),
        }),
      } as any);

      const result = await service.getPendingExpenseClaimsForManager('mgr1');

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return empty array if manager has no direct reports', async () => {
      mockKnex.where.mockReturnValue({
        select: jest.fn().mockResolvedValue([]),
      } as any);

      mockKnex.whereIn.mockReturnValue({
        where: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      const result = await service.getPendingExpenseClaimsForManager('mgr1');

      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });
  });
});
