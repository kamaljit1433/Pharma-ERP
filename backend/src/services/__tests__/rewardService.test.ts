import { RewardService } from '../rewardService';
import { RewardRepository } from '../../repositories/rewardRepository';
import { Knex } from 'knex';
import { Reward, RewardNomination, RewardCategory } from '../../types/benefits';

describe('RewardService', () => {
  let rewardService: RewardService;
  let mockKnex: any;

  beforeEach(() => {
    mockKnex = jest.fn((_table: string) => {
      return {
        where: jest.fn().mockReturnThis(),
        first: jest.fn(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnThis(),
      };
    });

    mockKnex.fn = {
      now: jest.fn(() => new Date()),
    };

    rewardService = new RewardService(mockKnex as Knex);
  });

  describe('Reward Category Management', () => {
    it('should return all valid reward categories', () => {
      const categories = rewardService.getRewardCategories();
      expect(categories).toEqual(['performance', 'attendance', 'innovation', 'teamwork']);
    });

    it('should return correct description for each category', () => {
      expect(rewardService.getCategoryDescription('performance')).toBe(
        'Exceptional performance and results'
      );
      expect(rewardService.getCategoryDescription('attendance')).toBe(
        'Perfect or excellent attendance record'
      );
      expect(rewardService.getCategoryDescription('innovation')).toBe(
        'Creative ideas and innovative solutions'
      );
      expect(rewardService.getCategoryDescription('teamwork')).toBe(
        'Outstanding collaboration and teamwork'
      );
    });
  });

  describe('Award Reward', () => {
    it('should award a reward with valid data', async () => {
      const mockEmployee = { id: 'emp-1', first_name: 'John', last_name: 'Doe' };
      const mockAwarder = { id: 'emp-2', first_name: 'Jane', last_name: 'Smith' };

      const mockEmployeesQuery = {
        where: jest.fn().mockReturnThis(),
        first: jest
          .fn()
          .mockResolvedValueOnce(mockEmployee)
          .mockResolvedValueOnce(mockAwarder),
      };

      mockKnex.mockImplementation((table: string) => {
        if (table === 'employees') {
          return mockEmployeesQuery;
        }
        return {
          where: jest.fn().mockReturnThis(),
          first: jest.fn(),
        };
      });

      const rewardData = {
        employee_id: 'emp-1',
        category: 'performance' as RewardCategory,
        title: 'Top Performer',
        description: 'Excellent work',
        awarded_by: 'emp-2',
        awarded_date: new Date('2026-03-01'),
        is_public: true,
      };

      const mockReward: Reward = {
        id: 'reward-1',
        ...rewardData,
        created_at: new Date(),
      };

      jest.spyOn(RewardRepository.prototype, 'createReward').mockResolvedValue(mockReward);

      const result = await rewardService.awardReward(rewardData);

      expect(result).toEqual(mockReward);
    });

    it('should throw error for invalid category', async () => {
      const rewardData = {
        employee_id: 'emp-1',
        category: 'invalid' as any,
        title: 'Test Reward',
        awarded_date: new Date(),
      };

      await expect(rewardService.awardReward(rewardData)).rejects.toThrow(
        'Invalid reward category: invalid'
      );
    });

    it('should throw error if employee does not exist', async () => {
      const mockEmployeesQuery = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
      };

      mockKnex.mockImplementation((table: string) => {
        if (table === 'employees') {
          return mockEmployeesQuery;
        }
        return {
          where: jest.fn().mockReturnThis(),
          first: jest.fn(),
        };
      });

      const rewardData = {
        employee_id: 'emp-nonexistent',
        category: 'performance' as RewardCategory,
        title: 'Test Reward',
        awarded_date: new Date(),
      };

      await expect(rewardService.awardReward(rewardData)).rejects.toThrow(
        'Employee not found: emp-nonexistent'
      );
    });

    it('should throw error if awarder does not exist', async () => {
      const mockEmployee = { id: 'emp-1' };

      const mockEmployeesQuery = {
        where: jest.fn().mockReturnThis(),
        first: jest
          .fn()
          .mockResolvedValueOnce(mockEmployee)
          .mockResolvedValueOnce(null),
      };

      mockKnex.mockImplementation((table: string) => {
        if (table === 'employees') {
          return mockEmployeesQuery;
        }
        return {
          where: jest.fn().mockReturnThis(),
          first: jest.fn(),
        };
      });

      const rewardData = {
        employee_id: 'emp-1',
        category: 'performance' as RewardCategory,
        title: 'Test Reward',
        awarded_by: 'emp-nonexistent',
        awarded_date: new Date(),
      };

      await expect(rewardService.awardReward(rewardData)).rejects.toThrow(
        'Awarder not found: emp-nonexistent'
      );
    });

    it('should set is_public to true by default', async () => {
      const mockEmployee = { id: 'emp-1' };

      const mockEmployeesQuery = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockEmployee),
      };

      mockKnex.mockImplementation((table: string) => {
        if (table === 'employees') {
          return mockEmployeesQuery;
        }
        return {
          where: jest.fn().mockReturnThis(),
          first: jest.fn(),
        };
      });

      const rewardData = {
        employee_id: 'emp-1',
        category: 'performance' as RewardCategory,
        title: 'Test Reward',
        awarded_date: new Date(),
      };

      const mockReward: Reward = {
        id: 'reward-1',
        employee_id: 'emp-1',
        category: 'performance',
        title: 'Test Reward',
        awarded_date: new Date(),
        is_public: true,
        created_at: new Date(),
      };

      jest.spyOn(RewardRepository.prototype, 'createReward').mockResolvedValue(mockReward);

      const result = await rewardService.awardReward(rewardData);

      expect(result.is_public).toBe(true);
    });
  });

  describe('Get Reward', () => {
    it('should retrieve a reward by id', async () => {
      const mockReward: Reward = {
        id: 'reward-1',
        employee_id: 'emp-1',
        category: 'performance',
        title: 'Top Performer',
        awarded_date: new Date(),
        is_public: true,
        created_at: new Date(),
      };

      jest.spyOn(RewardRepository.prototype, 'getRewardById').mockResolvedValue(mockReward);

      const result = await rewardService.getReward('reward-1');

      expect(result).toEqual(mockReward);
    });

    it('should return null if reward does not exist', async () => {
      jest.spyOn(RewardRepository.prototype, 'getRewardById').mockResolvedValue(null);

      const result = await rewardService.getReward('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('Get Employee Rewards', () => {
    it('should retrieve all rewards for an employee', async () => {
      const mockRewards: Reward[] = [
        {
          id: 'reward-1',
          employee_id: 'emp-1',
          category: 'performance',
          title: 'Top Performer',
          awarded_date: new Date('2026-01-01'),
          is_public: true,
          created_at: new Date(),
        },
        {
          id: 'reward-2',
          employee_id: 'emp-1',
          category: 'attendance',
          title: 'Perfect Attendance',
          awarded_date: new Date('2026-02-01'),
          is_public: true,
          created_at: new Date(),
        },
      ];

      jest.spyOn(RewardRepository.prototype, 'getRewardsByEmployee').mockResolvedValue(mockRewards);

      const result = await rewardService.getEmployeeRewards('emp-1');

      expect(result).toEqual(mockRewards);
      expect(result).toHaveLength(2);
    });
  });

  describe('Get Public Rewards', () => {
    it('should retrieve only public rewards', async () => {
      const mockRewards: Reward[] = [
        {
          id: 'reward-1',
          employee_id: 'emp-1',
          category: 'performance',
          title: 'Top Performer',
          awarded_date: new Date(),
          is_public: true,
          created_at: new Date(),
        },
      ];

      jest.spyOn(RewardRepository.prototype, 'getPublicRewards').mockResolvedValue(mockRewards);

      const result = await rewardService.getPublicRewards();

      expect(result).toEqual(mockRewards);
      expect(result.every((r) => r.is_public)).toBe(true);
    });
  });

  describe('Get Rewards by Category', () => {
    it('should retrieve rewards by category', async () => {
      const mockRewards: Reward[] = [
        {
          id: 'reward-1',
          employee_id: 'emp-1',
          category: 'performance',
          title: 'Top Performer',
          awarded_date: new Date(),
          is_public: true,
          created_at: new Date(),
        },
      ];

      jest.spyOn(RewardRepository.prototype, 'getRewardsByCategory').mockResolvedValue(mockRewards);

      const result = await rewardService.getRewardsByCategory('performance');

      expect(result).toEqual(mockRewards);
      expect(result.every((r) => r.category === 'performance')).toBe(true);
    });

    it('should throw error for invalid category', async () => {
      await expect(rewardService.getRewardsByCategory('invalid' as any)).rejects.toThrow(
        'Invalid reward category: invalid'
      );
    });
  });

  describe('Reward Nomination Workflow', () => {
    it('should create a reward nomination', async () => {
      const mockEmployee = { id: 'emp-1' };
      const mockNominator = { id: 'emp-2' };

      const mockEmployeesQuery = {
        where: jest.fn().mockReturnThis(),
        first: jest
          .fn()
          .mockResolvedValueOnce(mockEmployee)
          .mockResolvedValueOnce(mockNominator),
      };

      mockKnex.mockImplementation((table: string) => {
        if (table === 'employees') {
          return mockEmployeesQuery;
        }
        return {
          where: jest.fn().mockReturnThis(),
          first: jest.fn(),
        };
      });

      const nominationData = {
        employee_id: 'emp-1',
        nominated_by: 'emp-2',
        category: 'performance' as RewardCategory,
        title: 'Great Work',
        description: 'Excellent performance',
      };

      const mockNomination: RewardNomination = {
        id: 'nom-1',
        ...nominationData,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(RewardRepository.prototype, 'createNomination').mockResolvedValue(mockNomination);

      const result = await rewardService.nominateReward(nominationData);

      expect(result).toEqual(mockNomination);
    });

    it('should prevent self-nomination', async () => {
      const mockEmployee = { id: 'emp-1' };

      const mockEmployeesQuery = {
        where: jest.fn().mockReturnThis(),
        first: jest
          .fn()
          .mockResolvedValueOnce(mockEmployee)
          .mockResolvedValueOnce(mockEmployee),
      };

      mockKnex.mockImplementation((table: string) => {
        if (table === 'employees') {
          return mockEmployeesQuery;
        }
        return {
          where: jest.fn().mockReturnThis(),
          first: jest.fn(),
        };
      });

      const nominationData = {
        employee_id: 'emp-1',
        nominated_by: 'emp-1',
        category: 'performance' as RewardCategory,
        title: 'Great Work',
        description: 'Excellent performance',
      };

      await expect(rewardService.nominateReward(nominationData)).rejects.toThrow(
        'Employees cannot nominate themselves'
      );
    });

    it('should throw error if employee does not exist', async () => {
      const mockEmployeesQuery = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
      };

      mockKnex.mockImplementation((table: string) => {
        if (table === 'employees') {
          return mockEmployeesQuery;
        }
        return {
          where: jest.fn().mockReturnThis(),
          first: jest.fn(),
        };
      });

      const nominationData = {
        employee_id: 'emp-nonexistent',
        nominated_by: 'emp-2',
        category: 'performance' as RewardCategory,
        title: 'Great Work',
        description: 'Excellent performance',
      };

      await expect(rewardService.nominateReward(nominationData)).rejects.toThrow(
        'Employee not found: emp-nonexistent'
      );
    });
  });

  describe('Approve Nomination', () => {
    it('should approve a pending nomination and create a reward', async () => {
      const mockNomination: RewardNomination = {
        id: 'nom-1',
        employee_id: 'emp-1',
        nominated_by: 'emp-2',
        category: 'performance',
        title: 'Great Work',
        description: 'Excellent performance',
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockApprover = { id: 'emp-3' };

      const mockApprovedNomination: RewardNomination = {
        ...mockNomination,
        status: 'approved',
        approved_by: 'emp-3',
        approved_at: new Date(),
      };

      const mockReward: Reward = {
        id: 'reward-1',
        employee_id: 'emp-1',
        category: 'performance',
        title: 'Great Work',
        description: 'Excellent performance',
        awarded_by: 'emp-3',
        awarded_date: new Date(),
        is_public: true,
        created_at: new Date(),
      };

      const mockEmployeesQuery = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockApprover),
      };

      mockKnex.mockImplementation((table: string) => {
        if (table === 'employees') {
          return mockEmployeesQuery;
        }
        return {
          where: jest.fn().mockReturnThis(),
          first: jest.fn(),
        };
      });

      jest.spyOn(RewardRepository.prototype, 'getNominationById').mockResolvedValue(mockNomination);
      jest
        .spyOn(RewardRepository.prototype, 'approveNomination')
        .mockResolvedValue(mockApprovedNomination);
      jest.spyOn(RewardRepository.prototype, 'createReward').mockResolvedValue(mockReward);

      const result = await rewardService.approveNomination('nom-1', {
        approved_by: 'emp-3',
        approval_notes: 'Approved',
      });

      expect(result.nomination).toEqual(mockApprovedNomination);
      expect(result.reward).toEqual(mockReward);
    });

    it('should throw error if nomination does not exist', async () => {
      jest.spyOn(RewardRepository.prototype, 'getNominationById').mockResolvedValue(null);

      await expect(
        rewardService.approveNomination('nonexistent', { approved_by: 'emp-3' })
      ).rejects.toThrow('Nomination not found: nonexistent');
    });

    it('should throw error if nomination is not pending', async () => {
      const mockNomination: RewardNomination = {
        id: 'nom-1',
        employee_id: 'emp-1',
        nominated_by: 'emp-2',
        category: 'performance',
        title: 'Great Work',
        description: 'Excellent performance',
        status: 'approved',
        approved_by: 'emp-3',
        approved_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(RewardRepository.prototype, 'getNominationById').mockResolvedValue(mockNomination);

      await expect(
        rewardService.approveNomination('nom-1', { approved_by: 'emp-3' })
      ).rejects.toThrow('Cannot approve nomination with status: approved');
    });
  });

  describe('Reject Nomination', () => {
    it('should reject a pending nomination', async () => {
      const mockNomination: RewardNomination = {
        id: 'nom-1',
        employee_id: 'emp-1',
        nominated_by: 'emp-2',
        category: 'performance',
        title: 'Great Work',
        description: 'Excellent performance',
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockApprover = { id: 'emp-3' };

      const mockRejectedNomination: RewardNomination = {
        ...mockNomination,
        status: 'rejected',
        approved_by: 'emp-3',
        approval_notes: 'Does not meet criteria',
        approved_at: new Date(),
      };

      const mockEmployeesQuery = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockApprover),
      };

      mockKnex.mockImplementation((table: string) => {
        if (table === 'employees') {
          return mockEmployeesQuery;
        }
        return {
          where: jest.fn().mockReturnThis(),
          first: jest.fn(),
        };
      });

      jest.spyOn(RewardRepository.prototype, 'getNominationById').mockResolvedValue(mockNomination);
      jest
        .spyOn(RewardRepository.prototype, 'rejectNomination')
        .mockResolvedValue(mockRejectedNomination);

      const result = await rewardService.rejectNomination('nom-1', {
        approved_by: 'emp-3',
        approval_notes: 'Does not meet criteria',
      });

      expect(result.status).toBe('rejected');
      expect(result.approval_notes).toBe('Does not meet criteria');
    });
  });

  describe('Search Rewards', () => {
    it('should search rewards with filters', async () => {
      const mockRewards: Reward[] = [
        {
          id: 'reward-1',
          employee_id: 'emp-1',
          category: 'performance',
          title: 'Top Performer',
          awarded_date: new Date('2026-01-15'),
          is_public: true,
          created_at: new Date(),
        },
      ];

      jest.spyOn(RewardRepository.prototype, 'searchRewards').mockResolvedValue(mockRewards);

      const result = await rewardService.searchRewards({
        employee_id: 'emp-1',
        category: 'performance',
        is_public: true,
      });

      expect(result).toEqual(mockRewards);
    });

    it('should throw error for invalid date range', async () => {
      const fromDate = new Date('2026-03-01');
      const toDate = new Date('2026-01-01');

      await expect(
        rewardService.searchRewards({
          from_date: fromDate,
          to_date: toDate,
        })
      ).rejects.toThrow('From date must be before to date');
    });
  });

  describe('Update Reward', () => {
    it('should update a reward', async () => {
      const mockReward: Reward = {
        id: 'reward-1',
        employee_id: 'emp-1',
        category: 'performance',
        title: 'Top Performer',
        awarded_date: new Date(),
        is_public: true,
        created_at: new Date(),
      };

      const updatedReward: Reward = {
        ...mockReward,
        title: 'Updated Title',
        is_public: false,
      };

      jest.spyOn(RewardRepository.prototype, 'getRewardById').mockResolvedValue(mockReward);
      jest.spyOn(RewardRepository.prototype, 'updateReward').mockResolvedValue(updatedReward);

      const result = await rewardService.updateReward('reward-1', {
        title: 'Updated Title',
        is_public: false,
      });

      expect(result.title).toBe('Updated Title');
      expect(result.is_public).toBe(false);
    });

    it('should throw error if reward does not exist', async () => {
      jest.spyOn(RewardRepository.prototype, 'getRewardById').mockResolvedValue(null);

      await expect(
        rewardService.updateReward('nonexistent', { title: 'Updated' })
      ).rejects.toThrow('Reward not found: nonexistent');
    });
  });

  describe('Delete Reward', () => {
    it('should delete a reward', async () => {
      const mockReward: Reward = {
        id: 'reward-1',
        employee_id: 'emp-1',
        category: 'performance',
        title: 'Top Performer',
        awarded_date: new Date(),
        is_public: true,
        created_at: new Date(),
      };

      jest.spyOn(RewardRepository.prototype, 'getRewardById').mockResolvedValue(mockReward);
      jest.spyOn(RewardRepository.prototype, 'deleteReward').mockResolvedValue(undefined);

      await expect(rewardService.deleteReward('reward-1')).resolves.not.toThrow();
    });

    it('should throw error if reward does not exist', async () => {
      jest.spyOn(RewardRepository.prototype, 'getRewardById').mockResolvedValue(null);

      await expect(rewardService.deleteReward('nonexistent')).rejects.toThrow(
        'Reward not found: nonexistent'
      );
    });
  });

  describe('Get Pending Nominations', () => {
    it('should retrieve all pending nominations', async () => {
      const mockNominations: RewardNomination[] = [
        {
          id: 'nom-1',
          employee_id: 'emp-1',
          nominated_by: 'emp-2',
          category: 'performance',
          title: 'Great Work',
          description: 'Excellent performance',
          status: 'pending',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      jest
        .spyOn(RewardRepository.prototype, 'getPendingNominations')
        .mockResolvedValue(mockNominations);

      const result = await rewardService.getPendingNominations();

      expect(result).toEqual(mockNominations);
      expect(result.every((n) => n.status === 'pending')).toBe(true);
    });
  });
});
