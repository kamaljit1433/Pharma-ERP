import { GoalService } from '../goalService';
import { GoalRepository } from '../../repositories/goalRepository';
import { Goal, CreateGoalDTO } from '../../types/performance';

describe('GoalService', () => {
  let goalService: GoalService;
  let goalRepository: GoalRepository;

  beforeEach(() => {
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

    goalService = new GoalService(goalRepository);
  });

  describe('createGoal', () => {
    it('should create a goal with valid data', async () => {
      const createGoalDTO: CreateGoalDTO = {
        employeeId: 'emp-001',
        cycleId: 'cycle-001',
        type: 'OKR',
        title: 'Increase Sales',
        description: 'Increase sales by 20%',
        targetValue: 100,
        unit: 'units',
        weight: 50,
        dueDate: new Date('2026-12-31'),
      };

      const mockGoal: Goal = {
        id: 'goal-001',
        ...createGoalDTO,
        currentValue: 0,
        status: 'On Track',
        completionPercentage: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user-001',
      };

      (goalRepository.createGoal as jest.Mock).mockResolvedValue(mockGoal);

      const result = await goalService.createGoal(createGoalDTO, 'user-001');

      expect(result).toEqual(mockGoal);
      expect(goalRepository.createGoal).toHaveBeenCalledWith({
        ...createGoalDTO,
        createdBy: 'user-001',
      });
    });

    it('should throw error if employee ID is missing', async () => {
      const createGoalDTO: any = {
        cycleId: 'cycle-001',
        type: 'OKR',
        title: 'Test Goal',
        description: 'Test',
        targetValue: 100,
        unit: 'units',
        weight: 50,
        dueDate: new Date(),
      };

      await expect(goalService.createGoal(createGoalDTO, 'user-001')).rejects.toThrow(
        'Employee ID and Cycle ID are required'
      );
    });

    it('should throw error if weight is invalid', async () => {
      const createGoalDTO: CreateGoalDTO = {
        employeeId: 'emp-001',
        cycleId: 'cycle-001',
        type: 'OKR',
        title: 'Test Goal',
        description: 'Test',
        targetValue: 100,
        unit: 'units',
        weight: 150, // Invalid
        dueDate: new Date(),
      };

      await expect(goalService.createGoal(createGoalDTO, 'user-001')).rejects.toThrow(
        'Goal weight must be between 0 and 100'
      );
    });

    it('should throw error if target value is invalid', async () => {
      const createGoalDTO: CreateGoalDTO = {
        employeeId: 'emp-001',
        cycleId: 'cycle-001',
        type: 'OKR',
        title: 'Test Goal',
        description: 'Test',
        targetValue: -10, // Invalid
        unit: 'units',
        weight: 50,
        dueDate: new Date(),
      };

      await expect(goalService.createGoal(createGoalDTO, 'user-001')).rejects.toThrow(
        'Target value must be greater than 0'
      );
    });
  });

  describe('getGoal', () => {
    it('should return goal by ID', async () => {
      const mockGoal: Goal = {
        id: 'goal-001',
        employeeId: 'emp-001',
        cycleId: 'cycle-001',
        type: 'OKR',
        title: 'Test Goal',
        description: 'Test',
        targetValue: 100,
        currentValue: 50,
        unit: 'units',
        weight: 50,
        dueDate: new Date(),
        status: 'On Track',
        completionPercentage: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user-001',
      };

      (goalRepository.getGoalById as jest.Mock).mockResolvedValue(mockGoal);

      const result = await goalService.getGoal('goal-001');

      expect(result).toEqual(mockGoal);
      expect(goalRepository.getGoalById).toHaveBeenCalledWith('goal-001');
    });

    it('should throw error if goal not found', async () => {
      (goalRepository.getGoalById as jest.Mock).mockResolvedValue(null);

      await expect(goalService.getGoal('goal-999')).rejects.toThrow(
        'Goal with ID goal-999 not found'
      );
    });
  });

  describe('updateGoalProgress', () => {
    it('should update goal progress', async () => {
      const mockGoal: Goal = {
        id: 'goal-001',
        employeeId: 'emp-001',
        cycleId: 'cycle-001',
        type: 'OKR',
        title: 'Test Goal',
        description: 'Test',
        targetValue: 100,
        currentValue: 0,
        unit: 'units',
        weight: 50,
        dueDate: new Date(),
        status: 'On Track',
        completionPercentage: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user-001',
      };

      const updatedGoal: Goal = {
        ...mockGoal,
        currentValue: 75,
        completionPercentage: 75,
        status: 'On Track',
      };

      (goalRepository.getGoalById as jest.Mock)
        .mockResolvedValueOnce(mockGoal)
        .mockResolvedValueOnce(updatedGoal);
      (goalRepository.updateGoalProgress as jest.Mock).mockResolvedValue(updatedGoal);

      const result = await goalService.updateGoalProgress(
        'goal-001',
        { currentValue: 75 },
        'user-001'
      );

      expect(result).toEqual(updatedGoal);
    });

    it('should throw error if current value is negative', async () => {
      const mockGoal: Goal = {
        id: 'goal-001',
        employeeId: 'emp-001',
        cycleId: 'cycle-001',
        type: 'OKR',
        title: 'Test Goal',
        description: 'Test',
        targetValue: 100,
        currentValue: 0,
        unit: 'units',
        weight: 50,
        dueDate: new Date(),
        status: 'On Track',
        completionPercentage: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user-001',
      };

      (goalRepository.getGoalById as jest.Mock).mockResolvedValue(mockGoal);

      await expect(
        goalService.updateGoalProgress('goal-001', { currentValue: -10 }, 'user-001')
      ).rejects.toThrow('Current value cannot be negative');
    });

    it('should throw error if current value exceeds 150% of target', async () => {
      const mockGoal: Goal = {
        id: 'goal-001',
        employeeId: 'emp-001',
        cycleId: 'cycle-001',
        type: 'OKR',
        title: 'Test Goal',
        description: 'Test',
        targetValue: 100,
        currentValue: 0,
        unit: 'units',
        weight: 50,
        dueDate: new Date(),
        status: 'On Track',
        completionPercentage: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user-001',
      };

      (goalRepository.getGoalById as jest.Mock).mockResolvedValue(mockGoal);

      await expect(
        goalService.updateGoalProgress('goal-001', { currentValue: 200 }, 'user-001')
      ).rejects.toThrow('Current value exceeds reasonable limit (150% of target)');
    });
  });

  describe('calculateGoalCompletionPercentage', () => {
    it('should calculate weighted completion percentage', async () => {
      const goals: Goal[] = [
        {
          id: 'goal-001',
          employeeId: 'emp-001',
          cycleId: 'cycle-001',
          type: 'OKR',
          title: 'Goal 1',
          description: 'Test',
          targetValue: 100,
          currentValue: 100,
          unit: 'units',
          weight: 50,
          dueDate: new Date(),
          status: 'Completed',
          completionPercentage: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user-001',
        },
        {
          id: 'goal-002',
          employeeId: 'emp-001',
          cycleId: 'cycle-001',
          type: 'OKR',
          title: 'Goal 2',
          description: 'Test',
          targetValue: 100,
          currentValue: 50,
          unit: 'units',
          weight: 50,
          dueDate: new Date(),
          status: 'On Track',
          completionPercentage: 50,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user-001',
        },
      ];

      (goalRepository.getGoalsByEmployeeAndCycle as jest.Mock).mockResolvedValue(goals);

      const result = await goalService.calculateGoalCompletionPercentage('emp-001', 'cycle-001');

      // (100 * 50 / 100) + (50 * 50 / 100) = 50 + 25 = 75
      expect(result).toBe(75);
    });

    it('should return 0 if no goals exist', async () => {
      (goalRepository.getGoalsByEmployeeAndCycle as jest.Mock).mockResolvedValue([]);

      const result = await goalService.calculateGoalCompletionPercentage('emp-001', 'cycle-001');

      expect(result).toBe(0);
    });

    it('should handle unequal weights', async () => {
      const goals: Goal[] = [
        {
          id: 'goal-001',
          employeeId: 'emp-001',
          cycleId: 'cycle-001',
          type: 'OKR',
          title: 'Goal 1',
          description: 'Test',
          targetValue: 100,
          currentValue: 100,
          unit: 'units',
          weight: 60,
          dueDate: new Date(),
          status: 'Completed',
          completionPercentage: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user-001',
        },
        {
          id: 'goal-002',
          employeeId: 'emp-001',
          cycleId: 'cycle-001',
          type: 'OKR',
          title: 'Goal 2',
          description: 'Test',
          targetValue: 100,
          currentValue: 50,
          unit: 'units',
          weight: 40,
          dueDate: new Date(),
          status: 'On Track',
          completionPercentage: 50,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user-001',
        },
      ];

      (goalRepository.getGoalsByEmployeeAndCycle as jest.Mock).mockResolvedValue(goals);

      const result = await goalService.calculateGoalCompletionPercentage('emp-001', 'cycle-001');

      // (100 * 60 / 100) + (50 * 40 / 100) = 60 + 20 = 80
      // Normalized: (80 * 100) / 100 = 80
      expect(result).toBe(80);
    });
  });

  describe('cascadeGoals', () => {
    it('should cascade company goal to employees', async () => {
      const companyGoal: Goal = {
        id: 'goal-001',
        employeeId: 'company',
        cycleId: 'cycle-001',
        type: 'OKR',
        title: 'Company Revenue Target',
        description: 'Increase revenue by 20%',
        targetValue: 1000000,
        currentValue: 0,
        unit: 'dollars',
        weight: 100,
        dueDate: new Date('2026-12-31'),
        status: 'On Track',
        completionPercentage: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user-001',
      };

      const cascadedGoal1: Goal = {
        id: 'goal-002',
        employeeId: 'emp-001',
        cycleId: 'cycle-001',
        type: 'OKR',
        title: 'Company Revenue Target (Cascaded)',
        description: 'Cascaded from company goal: Increase revenue by 20%',
        targetValue: 1000000,
        currentValue: 0,
        unit: 'dollars',
        weight: 100,
        dueDate: new Date('2026-12-31'),
        status: 'On Track',
        completionPercentage: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user-001',
      };

      const cascadedGoal2: Goal = {
        id: 'goal-003',
        employeeId: 'emp-002',
        cycleId: 'cycle-001',
        type: 'OKR',
        title: 'Company Revenue Target (Cascaded)',
        description: 'Cascaded from company goal: Increase revenue by 20%',
        targetValue: 1000000,
        currentValue: 0,
        unit: 'dollars',
        weight: 100,
        dueDate: new Date('2026-12-31'),
        status: 'On Track',
        completionPercentage: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user-001',
      };

      (goalRepository.getGoalById as jest.Mock).mockResolvedValue(companyGoal);
      (goalRepository.createGoal as jest.Mock)
        .mockResolvedValueOnce(cascadedGoal1)
        .mockResolvedValueOnce(cascadedGoal2);

      const result = await goalService.cascadeGoals(
        'goal-001',
        ['emp-001', 'emp-002'],
        'cycle-001',
        'user-001'
      );

      expect(result).toHaveLength(2);
      expect(result[0]?.employeeId).toBe('emp-001');
      expect(result[1]?.employeeId).toBe('emp-002');
      expect(result[0]?.title).toContain('Cascaded');
    });
  });

  describe('getEmployeeGoals', () => {
    it('should return all goals for an employee', async () => {
      const goals: Goal[] = [
        {
          id: 'goal-001',
          employeeId: 'emp-001',
          cycleId: 'cycle-001',
          type: 'OKR',
          title: 'Goal 1',
          description: 'Test',
          targetValue: 100,
          currentValue: 50,
          unit: 'units',
          weight: 50,
          dueDate: new Date(),
          status: 'On Track',
          completionPercentage: 50,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user-001',
        },
      ];

      (goalRepository.getGoalsByEmployee as jest.Mock).mockResolvedValue(goals);

      const result = await goalService.getEmployeeGoals('emp-001');

      expect(result).toEqual(goals);
      expect(goalRepository.getGoalsByEmployee).toHaveBeenCalledWith('emp-001');
    });
  });

  describe('getCycleGoals', () => {
    it('should return all goals for a cycle', async () => {
      const goals: Goal[] = [
        {
          id: 'goal-001',
          employeeId: 'emp-001',
          cycleId: 'cycle-001',
          type: 'OKR',
          title: 'Goal 1',
          description: 'Test',
          targetValue: 100,
          currentValue: 50,
          unit: 'units',
          weight: 50,
          dueDate: new Date(),
          status: 'On Track',
          completionPercentage: 50,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user-001',
        },
      ];

      (goalRepository.getGoalsByCycle as jest.Mock).mockResolvedValue(goals);

      const result = await goalService.getCycleGoals('cycle-001');

      expect(result).toEqual(goals);
      expect(goalRepository.getGoalsByCycle).toHaveBeenCalledWith('cycle-001');
    });
  });

  describe('deleteGoal', () => {
    it('should delete a goal', async () => {
      (goalRepository.deleteGoal as jest.Mock).mockResolvedValue(undefined);

      await goalService.deleteGoal('goal-001');

      expect(goalRepository.deleteGoal).toHaveBeenCalledWith('goal-001');
    });
  });
});
