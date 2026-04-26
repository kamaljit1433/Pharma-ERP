import { PIPService } from '../pipService';
import { PIPRepository } from '../../repositories/pipRepository';
import { GoalRepository } from '../../repositories/goalRepository';
import { PIP, Goal } from '../../types/performance';

describe('PIPService', () => {
  let service: PIPService;
  let pipRepository: PIPRepository;
  let goalRepository: GoalRepository;

  beforeEach(() => {
    pipRepository = {
      createPIP: jest.fn(),
      getPIPById: jest.fn(),
      getPIPByEmployee: jest.fn(),
      getActivePIPs: jest.fn(),
      createPIPCheckIn: jest.fn(),
      getPIPCheckInById: jest.fn(),
      getPIPCheckIns: jest.fn(),
      updatePIPStatus: jest.fn(),
      deletePIP: jest.fn(),
    } as any;

    goalRepository = {
      createGoal: jest.fn(),
      getGoalById: jest.fn(),
      getGoalsByEmployee: jest.fn(),
      getGoalsByCycle: jest.fn(),
      getGoalsByEmployeeAndCycle: jest.fn(),
      updateGoalProgress: jest.fn(),
      updateGoalStatus: jest.fn(),
      getGoalProgressHistory: jest.fn(),
      deleteGoal: jest.fn(),
    } as any;

    service = new PIPService(pipRepository, goalRepository);
  });

  describe('initiatePIP', () => {
    it('should initiate a PIP with valid data', async () => {
      const mockGoal: Goal = {
        id: 'goal-001',
        employeeId: 'emp-001',
        cycleId: 'cycle-001',
        type: 'KPI',
        title: 'Performance Goal',
        description: 'Improve performance',
        targetValue: 100,
        currentValue: 50,
        unit: 'units',
        weight: 100,
        dueDate: new Date('2026-12-31'),
        status: 'Behind',
        completionPercentage: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user-001',
      };

      const mockPIP: PIP = {
        id: 'pip-001',
        employeeId: 'emp-001',
        initiatedBy: 'user-001',
        goals: ['goal-001'],
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-03-31'),
        checkIns: [],
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (goalRepository.getGoalById as jest.Mock).mockResolvedValue(mockGoal);
      (pipRepository.createPIP as jest.Mock).mockResolvedValue(mockPIP);

      const result = await service.initiatePIP(
        { employeeId: 'emp-001', goals: ['goal-001'], startDate: new Date('2026-01-01'), endDate: new Date('2026-03-31') },
        'user-001'
      );

      expect(result).toEqual(mockPIP);
      expect(pipRepository.createPIP).toHaveBeenCalled();
    });

    it('should throw error if no goals provided', async () => {
      await expect(
        service.initiatePIP({ employeeId: 'emp-001', goals: [], startDate: new Date('2026-01-01'), endDate: new Date('2026-03-31') }, 'user-001')
      ).rejects.toThrow('Employee ID and at least one goal are required');
    });

    it('should throw error if start date is after end date', async () => {
      const mockGoal: Goal = {
        id: 'goal-001',
        employeeId: 'emp-001',
        cycleId: 'cycle-001',
        type: 'KPI',
        title: 'Performance Goal',
        description: 'Improve performance',
        targetValue: 100,
        currentValue: 50,
        unit: 'units',
        weight: 100,
        dueDate: new Date('2026-12-31'),
        status: 'Behind',
        completionPercentage: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user-001',
      };

      (goalRepository.getGoalById as jest.Mock).mockResolvedValue(mockGoal);

      await expect(
        service.initiatePIP({ employeeId: 'emp-001', goals: ['goal-001'], startDate: new Date('2026-03-31'), endDate: new Date('2026-01-01') }, 'user-001')
      ).rejects.toThrow('Start date must be before end date');
    });

    it('should throw error if goal not found', async () => {
      (goalRepository.getGoalById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.initiatePIP({ employeeId: 'emp-001', goals: ['goal-999'], startDate: new Date('2026-01-01'), endDate: new Date('2026-03-31') }, 'user-001')
      ).rejects.toThrow('Goal with ID goal-999 not found');
    });
  });

  describe('recordCheckIn', () => {
    it('should record a check-in', async () => {
      const mockPIP: PIP = {
        id: 'pip-001',
        employeeId: 'emp-001',
        initiatedBy: 'user-001',
        goals: ['goal-001'],
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-03-31'),
        checkIns: [],
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockCheckIn = {
        id: 'checkin-001',
        pipId: 'pip-001',
        checkInDate: new Date('2026-02-01'),
        progress: 'Making good progress',
        notes: 'On track with goals',
        status: 'On Track',
        recordedBy: 'user-001',
        recordedAt: new Date(),
      };

      (pipRepository.getPIPById as jest.Mock).mockResolvedValue(mockPIP);
      (pipRepository.createPIPCheckIn as jest.Mock).mockResolvedValue(mockCheckIn);

      const result = await service.recordCheckIn(
        'pip-001',
        { pipId: 'pip-001', checkInDate: new Date('2026-02-01'), progress: 'Making good progress', notes: 'On track with goals', status: 'On Track' },
        'user-001'
      );

      expect(result).toEqual(mockCheckIn);
    });

    it('should throw error if check-in date is outside PIP timeline', async () => {
      const mockPIP: PIP = {
        id: 'pip-001',
        employeeId: 'emp-001',
        initiatedBy: 'user-001',
        goals: ['goal-001'],
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-03-31'),
        checkIns: [],
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (pipRepository.getPIPById as jest.Mock).mockResolvedValue(mockPIP);

      await expect(
        service.recordCheckIn(
          'pip-001',
          { pipId: 'pip-001', checkInDate: new Date('2026-05-01'), progress: 'Making good progress', notes: 'On track with goals', status: 'On Track' },
          'user-001'
        )
      ).rejects.toThrow('Check-in date must be within PIP timeline');
    });
  });

  describe('recordPIPOutcome', () => {
    it('should record PIP outcome', async () => {
      const mockPIP: PIP = {
        id: 'pip-001',
        employeeId: 'emp-001',
        initiatedBy: 'user-001',
        goals: ['goal-001'],
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-03-31'),
        checkIns: [],
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (pipRepository.getPIPById as jest.Mock).mockResolvedValue(mockPIP);
      (pipRepository.updatePIPStatus as jest.Mock).mockResolvedValue(undefined);

      await service.recordOutcome('pip-001', 'Completed');

      expect(pipRepository.updatePIPStatus).toHaveBeenCalledWith('pip-001', 'Completed', 'Completed');
    });

    it('should throw error if PIP is not active', async () => {
      const mockPIP: PIP = {
        id: 'pip-001',
        employeeId: 'emp-001',
        initiatedBy: 'user-001',
        goals: ['goal-001'],
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-03-31'),
        checkIns: [],
        status: 'Completed',
        outcome: 'Completed',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (pipRepository.getPIPById as jest.Mock).mockResolvedValue(mockPIP);

      await expect(service.recordOutcome('pip-001', 'Extended')).rejects.toThrow(
        'Can only record outcome for active PIPs'
      );
    });
  });

  describe('getPIPProgress', () => {
    it('should return PIP progress', async () => {
      const mockPIP: PIP = {
        id: 'pip-001',
        employeeId: 'emp-001',
        initiatedBy: 'user-001',
        goals: ['goal-001'],
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-03-31'),
        checkIns: [
          {
            id: 'checkin-001',
            pipId: 'pip-001',
            checkInDate: new Date('2026-02-01'),
            progress: 'Making good progress',
            notes: 'On track',
            status: 'On Track',
            recordedBy: 'user-001',
            recordedAt: new Date(),
          },
          {
            id: 'checkin-002',
            pipId: 'pip-001',
            checkInDate: new Date('2026-03-01'),
            progress: 'Still on track',
            notes: 'Progressing well',
            status: 'On Track',
            recordedBy: 'user-001',
            recordedAt: new Date(),
          },
        ],
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (pipRepository.getPIPById as jest.Mock).mockResolvedValue(mockPIP);

      const result = await service.getPIPProgress('pip-001');

      expect(result.checkInCount).toBe(2);
      expect(result.summary.onTrack).toBe(2);
      expect(result.latestCheckIn.status).toBe('On Track');
    });

    it('should return no check-ins message if none exist', async () => {
      const mockPIP: PIP = {
        id: 'pip-001',
        employeeId: 'emp-001',
        initiatedBy: 'user-001',
        goals: ['goal-001'],
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-03-31'),
        checkIns: [],
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (pipRepository.getPIPById as jest.Mock).mockResolvedValue(mockPIP);

      const result = await service.getPIPProgress('pip-001');

      expect(result.status).toBe('No check-ins recorded');
      expect(result.checkInCount).toBe(0);
    });
  });

  describe('getEmployeePIPs', () => {
    it('should return all PIPs for an employee', async () => {
      const mockPIPs: PIP[] = [
        {
          id: 'pip-001',
          employeeId: 'emp-001',
          initiatedBy: 'user-001',
          goals: ['goal-001'],
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-03-31'),
          checkIns: [],
          status: 'Active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (pipRepository.getPIPByEmployee as jest.Mock).mockResolvedValue(mockPIPs);

      const result = await service.getEmployeePIPs('emp-001');

      expect(result).toEqual(mockPIPs);
    });
  });

  describe('deletePIP', () => {
    it('should delete a PIP', async () => {
      (pipRepository.deletePIP as jest.Mock).mockResolvedValue(undefined);

      await service.deletePIP('pip-001');

      expect(pipRepository.deletePIP).toHaveBeenCalledWith('pip-001');
    });
  });
});
