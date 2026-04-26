import { DashboardService } from '../dashboardService';
import { Knex } from 'knex';

describe('DashboardService', () => {
  let dashboardService: DashboardService;
  let mockKnex: any;

  beforeEach(() => {
    // Must be callable as mockKnex('tableName') returning itself for chaining
    // All chained methods return mockKnex (self) so that .first() can be overridden per-test
    // Create a thenable mock that resolves to [] by default when awaited,
    // but all chainable methods return itself for further chaining.
    // .first() is overridden per-test to return specific values.
    const thenableMock: any = Object.assign(
      jest.fn().mockImplementation(() => thenableMock),
      {
        then: (resolve: Function) => resolve([]),
        catch: (reject: Function) => Promise.resolve([]),
        select: null as any,
        count: null as any,
        where: null as any,
        whereNot: null as any,
        whereIn: null as any,
        join: null as any,
        leftJoin: null as any,
        groupBy: null as any,
        orderBy: null as any,
        limit: null as any,
        sum: null as any,
        avg: null as any,
        whereNull: null as any,
        max: null as any,
        min: null as any,
        raw: null as any,
        first: null as any,
      }
    );
    thenableMock.select = jest.fn().mockReturnValue(thenableMock);
    thenableMock.count = jest.fn().mockReturnValue(thenableMock);
    thenableMock.where = jest.fn().mockReturnValue(thenableMock);
    thenableMock.whereNot = jest.fn().mockReturnValue(thenableMock);
    thenableMock.whereIn = jest.fn().mockReturnValue(thenableMock);
    thenableMock.join = jest.fn().mockReturnValue(thenableMock);
    thenableMock.leftJoin = jest.fn().mockReturnValue(thenableMock);
    thenableMock.groupBy = jest.fn().mockReturnValue(thenableMock);
    thenableMock.orderBy = jest.fn().mockReturnValue(thenableMock);
    thenableMock.limit = jest.fn().mockReturnValue(thenableMock);
    thenableMock.sum = jest.fn().mockReturnValue(thenableMock);
    thenableMock.avg = jest.fn().mockReturnValue(thenableMock);
    thenableMock.whereNull = jest.fn().mockReturnValue(thenableMock);
    thenableMock.max = jest.fn().mockReturnValue(thenableMock);
    thenableMock.min = jest.fn().mockReturnValue(thenableMock);
    thenableMock.raw = jest.fn().mockReturnValue(thenableMock);
    thenableMock.first = jest.fn();
    mockKnex = thenableMock;

    dashboardService = new DashboardService(mockKnex as Knex);
  });

  describe('getDashboardStats', () => {
    it('should return complete dashboard statistics', async () => {
      mockKnex.first.mockResolvedValue({ count: 100 });

      const stats = await dashboardService.getDashboardStats();

      expect(stats).toHaveProperty('employees');
      expect(stats).toHaveProperty('attendance');
      expect(stats).toHaveProperty('leaves');
      expect(stats).toHaveProperty('payroll');
      expect(stats).toHaveProperty('recruitment');
      expect(stats).toHaveProperty('generatedAt');
      expect(stats.generatedAt).toBeInstanceOf(Date);
    });
  });

  describe('getEmployeeStatistics', () => {
    it('should calculate employee statistics correctly', async () => {
      mockKnex.first.mockResolvedValueOnce({ count: 100 }); // total
      mockKnex.first.mockResolvedValueOnce(undefined); // new hires
      mockKnex.first.mockResolvedValueOnce(undefined); // separations

      const stats = await dashboardService['getEmployeeStatistics']();

      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('active');
      expect(stats).toHaveProperty('onLeave');
      expect(stats).toHaveProperty('suspended');
      expect(stats).toHaveProperty('resigned');
      expect(stats).toHaveProperty('terminated');
      expect(stats).toHaveProperty('byDepartment');
      expect(stats).toHaveProperty('byDesignation');
      expect(stats).toHaveProperty('newHiresThisMonth');
      expect(stats).toHaveProperty('separationsThisMonth');
    });

    it('should handle zero employees', async () => {
      mockKnex.first.mockResolvedValue({ count: 0 });

      const stats = await dashboardService['getEmployeeStatistics']();

      expect(stats.total).toBe(0);
      expect(stats.active).toBe(0);
    });
  });

  describe('getAttendanceStatistics', () => {
    it('should calculate attendance statistics correctly', async () => {
      mockKnex.first.mockResolvedValueOnce({ count: 100 }); // total employees
      mockKnex.first.mockResolvedValueOnce({ count: 70 }); // monthly present
      mockKnex.first.mockResolvedValueOnce({ count: 100 }); // monthly total
      mockKnex.first.mockResolvedValueOnce({ count: 80 }); // late check-ins
      mockKnex.first.mockResolvedValueOnce({ count: 5 }); // incomplete check-outs

      const stats = await dashboardService['getAttendanceStatistics']();

      expect(stats).toHaveProperty('totalEmployees');
      expect(stats).toHaveProperty('presentToday');
      expect(stats).toHaveProperty('absentToday');
      expect(stats).toHaveProperty('attendanceRate');
      expect(stats).toHaveProperty('monthlyAttendanceRate');
      expect(stats).toHaveProperty('lateCheckIns');
      expect(stats).toHaveProperty('incompleteCheckOuts');
      expect(stats).toHaveProperty('topAbsentees');
    });

    it('should calculate attendance rate correctly', async () => {
      mockKnex.first.mockResolvedValueOnce({ count: 100 }); // total employees
      mockKnex.first.mockResolvedValueOnce({ count: 70 }); // monthly present
      mockKnex.first.mockResolvedValueOnce({ count: 100 }); // monthly total
      mockKnex.first.mockResolvedValueOnce({ count: 80 }); // late check-ins
      mockKnex.first.mockResolvedValueOnce({ count: 5 }); // incomplete check-outs

      const stats = await dashboardService['getAttendanceStatistics']();

      expect(stats.attendanceRate).toBeGreaterThanOrEqual(0);
      expect(stats.attendanceRate).toBeLessThanOrEqual(100);
      expect(stats.monthlyAttendanceRate).toBeGreaterThanOrEqual(0);
      expect(stats.monthlyAttendanceRate).toBeLessThanOrEqual(100);
    });
  });

  describe('getLeaveStatistics', () => {
    it('should calculate leave statistics correctly', async () => {
      mockKnex.first.mockResolvedValueOnce({ count: 50 }); // total leaves
      mockKnex.first.mockResolvedValueOnce({ count: 10 }); // pending
      mockKnex.first.mockResolvedValueOnce({ count: 30 }); // approved this month
      mockKnex.first.mockResolvedValueOnce({ count: 5 }); // rejected this month
      mockKnex.first.mockResolvedValueOnce({ count: 2 }); // cancelled this month
      mockKnex.first.mockResolvedValueOnce({ count: 15 }); // on leave today

      const stats = await dashboardService['getLeaveStatistics']();

      expect(stats).toHaveProperty('totalLeaveRequests');
      expect(stats).toHaveProperty('pendingApprovals');
      expect(stats).toHaveProperty('approvedThisMonth');
      expect(stats).toHaveProperty('rejectedThisMonth');
      expect(stats).toHaveProperty('cancelledThisMonth');
      expect(stats).toHaveProperty('leaveTypeBreakdown');
      expect(stats).toHaveProperty('employeesOnLeaveToday');
      expect(stats).toHaveProperty('upcomingLeaves');
    });
  });

  describe('getPayrollStatistics', () => {
    it('should calculate payroll statistics correctly', async () => {
      mockKnex.first.mockResolvedValueOnce({ count: 100 }); // total employees
      mockKnex.first.mockResolvedValueOnce({ count: 80 }); // processed this month
      mockKnex.first.mockResolvedValueOnce({ count: 20 }); // pending
      mockKnex.first.mockResolvedValueOnce({ total: 500000 }); // total payroll
      mockKnex.first.mockResolvedValueOnce({ average: 6250 }); // average salary
      mockKnex.first.mockResolvedValueOnce({ total: 100000 }); // total deductions
      mockKnex.first.mockResolvedValueOnce({ total: 600000 }); // total earnings
      mockKnex.first.mockResolvedValueOnce({ count: 5 }); // advance requests
      mockKnex.first.mockResolvedValueOnce({ count: 3 }); // reimbursement claims

      const stats = await dashboardService['getPayrollStatistics']();

      expect(stats).toHaveProperty('totalEmployees');
      expect(stats).toHaveProperty('processedThisMonth');
      expect(stats).toHaveProperty('pendingProcessing');
      expect(stats).toHaveProperty('totalPayrollAmount');
      expect(stats).toHaveProperty('averageSalary');
      expect(stats).toHaveProperty('totalDeductions');
      expect(stats).toHaveProperty('totalEarnings');
      expect(stats).toHaveProperty('payrollByStatus');
      expect(stats).toHaveProperty('advanceSalaryRequests');
      expect(stats).toHaveProperty('reimbursementClaims');
    });

    it('should handle zero payroll data', async () => {
      mockKnex.first.mockResolvedValue({ count: 0, total: 0, average: 0 });

      const stats = await dashboardService['getPayrollStatistics']();

      expect(stats.totalPayrollAmount).toBe(0);
      expect(stats.averageSalary).toBe(0);
    });
  });

  describe('getRecruitmentStatistics', () => {
    it('should calculate recruitment statistics correctly', async () => {
      mockKnex.first.mockResolvedValueOnce({ count: 5 }); // open positions
      mockKnex.first.mockResolvedValueOnce({ count: 50 }); // total applicants
      mockKnex.first.mockResolvedValueOnce({ count: 3 }); // offers extended
      mockKnex.first.mockResolvedValueOnce({ count: 2 }); // offers accepted
      mockKnex.first.mockResolvedValueOnce({ count: 1 }); // offers rejected
      mockKnex.first.mockResolvedValueOnce({ avg_days: 30 }); // avg time to hire

      const stats = await dashboardService['getRecruitmentStatistics']();

      expect(stats).toHaveProperty('openPositions');
      expect(stats).toHaveProperty('totalApplicants');
      expect(stats).toHaveProperty('applicantsByStage');
      expect(stats).toHaveProperty('offersExtended');
      expect(stats).toHaveProperty('offersAccepted');
      expect(stats).toHaveProperty('offersRejected');
      expect(stats).toHaveProperty('averageTimeToHire');
      expect(stats).toHaveProperty('topSourceOfApplicants');
      expect(stats).toHaveProperty('recentHires');
    });

    it('should handle zero recruitment data', async () => {
      mockKnex.first.mockResolvedValue({ count: 0, avg_days: 0 });

      const stats = await dashboardService['getRecruitmentStatistics']();

      expect(stats.openPositions).toBe(0);
      expect(stats.totalApplicants).toBe(0);
      expect(stats.averageTimeToHire).toBe(0);
    });
  });
});
