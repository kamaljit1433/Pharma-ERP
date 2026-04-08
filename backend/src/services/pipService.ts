import { PIPRepository } from '../repositories/pipRepository';
import { GoalRepository } from '../repositories/goalRepository';
import { PIP, CreatePIPDTO, CreatePIPCheckInDTO } from '../types/performance';

export class PIPService {
  constructor(
    private pipRepository: PIPRepository,
    private goalRepository: GoalRepository
  ) {}

  async initiatePIP(
    data: CreatePIPDTO,
    userId: string
  ): Promise<PIP> {
    // Validate input
    if (!data.employeeId || !data.goals || data.goals.length === 0) {
      throw new Error('Employee ID and at least one goal are required');
    }

    if (data.startDate >= data.endDate) {
      throw new Error('Start date must be before end date');
    }

    // Validate that all goals exist
    for (const goalId of data.goals) {
      const goal = await this.goalRepository.getGoalById(goalId);
      if (!goal) {
        throw new Error(`Goal with ID ${goalId} not found`);
      }
    }

    return this.pipRepository.createPIP({
      employeeId: data.employeeId,
      goals: data.goals,
      startDate: data.startDate,
      endDate: data.endDate,
      initiatedBy: userId,
    });
  }

  async getPIP(pipId: string): Promise<PIP> {
    const pip = await this.pipRepository.getPIPById(pipId);
    if (!pip) {
      throw new Error(`PIP with ID ${pipId} not found`);
    }
    return pip;
  }

  async getEmployeePIPs(employeeId: string): Promise<PIP[]> {
    return this.pipRepository.getPIPByEmployee(employeeId);
  }

  async getActivePIPs(): Promise<PIP[]> {
    return this.pipRepository.getActivePIPs();
  }

  async recordCheckIn(
    pipId: string,
    data: CreatePIPCheckInDTO,
    userId: string
  ): Promise<any> {
    // Validate PIP exists
    const pip = await this.getPIP(pipId);

    // Validate check-in date is within PIP timeline
    if (data.checkInDate < pip.startDate || data.checkInDate > pip.endDate) {
      throw new Error('Check-in date must be within PIP timeline');
    }

    // Validate input
    if (!data.progress || !data.notes) {
      throw new Error('Progress and notes are required');
    }

    return this.pipRepository.createPIPCheckIn({
      pipId,
      checkInDate: data.checkInDate,
      progress: data.progress,
      notes: data.notes,
      status: data.status,
      recordedBy: userId,
    });
  }

  async recordOutcome(
    pipId: string,
    outcome: 'Completed' | 'Extended' | 'Escalated',
    userId: string
  ): Promise<PIP> {
    const pip = await this.getPIP(pipId);

    if (pip.status !== 'Active') {
      throw new Error('Can only record outcome for active PIPs');
    }

    const newStatus = outcome === 'Extended' ? 'Active' : 'Completed';
    await this.pipRepository.updatePIPStatus(pipId, newStatus, outcome);
    
    return this.getPIP(pipId);
  }

  async getPIPProgress(pipId: string): Promise<any> {
    const pip = await this.getPIP(pipId);

    if (pip.checkIns.length === 0) {
      return {
        pipId,
        employeeId: pip.employeeId,
        status: 'No check-ins recorded',
        checkInCount: 0,
        latestStatus: null,
      };
    }

    const latestCheckIn = pip.checkIns[pip.checkIns.length - 1];
    const onTrackCount = pip.checkIns.filter((c) => c.status === 'On Track').length;
    const atRiskCount = pip.checkIns.filter((c) => c.status === 'At Risk').length;
    const behindCount = pip.checkIns.filter((c) => c.status === 'Behind').length;

    return {
      pipId,
      employeeId: pip.employeeId,
      status: pip.status,
      outcome: pip.outcome,
      checkInCount: pip.checkIns.length,
      latestCheckIn: latestCheckIn ? {
        date: latestCheckIn.checkInDate,
        status: latestCheckIn.status,
        progress: latestCheckIn.progress,
      } : null,
      summary: {
        onTrack: onTrackCount,
        atRisk: atRiskCount,
        behind: behindCount,
      },
      startDate: pip.startDate,
      endDate: pip.endDate,
      daysRemaining: Math.ceil((pip.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
    };
  }

  async deletePIP(pipId: string): Promise<void> {
    await this.pipRepository.deletePIP(pipId);
  }
}
