import { PIPRepository } from '../repositories/pipRepository';
import { GoalRepository } from '../repositories/goalRepository';
import { PIP, CreatePIPDTO, CreatePIPCheckInDTO, PIPCheckIn } from '../types/performance';

export class PIPService {
  constructor(
    private pipRepository: PIPRepository,
    private goalRepository: GoalRepository
  ) {}

  async initiatePIP(
    data: CreatePIPDTO,
    userId: string
  ): Promise<PIP> {
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

    const repoPIP = await this.pipRepository.createPIP({
      employeeId: data.employeeId,
      goals: data.goals,
      startDate: data.startDate,
      endDate: data.endDate,
      initiatedBy: userId,
    });

    return this.mapRepoPIPToService(repoPIP);
  }

  async getPIP(pipId: string): Promise<PIP> {
    const repoPIP = await this.pipRepository.getPIPById(pipId);
    if (!repoPIP) {
      throw new Error(`PIP with ID ${pipId} not found`);
    }
    const checkpoints = await this.pipRepository.getCheckpoints(pipId);
    return this.mapRepoPIPToService(repoPIP, checkpoints);
  }

  async getEmployeePIPs(employeeId: string): Promise<PIP[]> {
    const repoPIPs = await this.pipRepository.getPIPByEmployee(employeeId);
    return Promise.all(repoPIPs.map(async (p) => {
      const checkpoints = await this.pipRepository.getCheckpoints(p.id);
      return this.mapRepoPIPToService(p, checkpoints);
    }));
  }

  async getActivePIPs(): Promise<PIP[]> {
    const repoPIPs = await this.pipRepository.getActivePIPs();
    return Promise.all(repoPIPs.map(async (p) => {
      const checkpoints = await this.pipRepository.getCheckpoints(p.id);
      return this.mapRepoPIPToService(p, checkpoints);
    }));
  }

  async recordCheckIn(
    pipId: string,
    data: CreatePIPCheckInDTO,
    userId: string
  ): Promise<any> {
    const pip = await this.getPIP(pipId);

    if (data.checkInDate < pip.startDate || data.checkInDate > pip.endDate) {
      throw new Error('Check-in date must be within PIP timeline');
    }

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

    // 'Extended' keeps the PIP active; all other outcomes close it
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
      latestCheckIn: latestCheckIn
        ? {
            date: latestCheckIn.checkInDate,
            status: latestCheckIn.status,
            progress: latestCheckIn.progress,
          }
        : null,
      summary: { onTrack: onTrackCount, atRisk: atRiskCount, behind: behindCount },
      startDate: pip.startDate,
      endDate: pip.endDate,
      daysRemaining: Math.ceil(
        (pip.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      ),
    };
  }

  async deletePIP(pipId: string): Promise<void> {
    await this.pipRepository.deletePIP(pipId);
  }

  // Maps the repository's snake_case PIP object to the types/performance PIP shape.
  private mapRepoPIPToService(repoPIP: any, checkpoints: any[] = []): PIP {
    const checkIns: PIPCheckIn[] = checkpoints.map((c) => ({
      id: c.id,
      pipId: c.pip_id,
      checkInDate: c.date instanceof Date ? c.date : new Date(c.date),
      progress: c.notes || '',
      notes: c.notes || '',
      status: c.status as 'On Track' | 'At Risk' | 'Behind',
      recordedBy: c.recorded_by || '',
      recordedAt: c.created_at instanceof Date ? c.created_at : new Date(c.created_at),
    }));

    const rawStatus: string = repoPIP.status || 'active';
    const status: 'Active' | 'Completed' =
      rawStatus.toLowerCase() === 'active' ? 'Active' : 'Completed';

    return {
      id: repoPIP.id,
      employeeId: repoPIP.employee_id,
      initiatedBy: repoPIP.initiated_by || repoPIP.employee_id,
      goals: repoPIP.goals || [],
      startDate: repoPIP.start_date instanceof Date ? repoPIP.start_date : new Date(repoPIP.start_date),
      endDate: repoPIP.end_date instanceof Date ? repoPIP.end_date : new Date(repoPIP.end_date),
      checkIns,
      outcome: (repoPIP.outcome_notes as 'Completed' | 'Extended' | 'Escalated') || undefined,
      status,
      createdAt: repoPIP.created_at instanceof Date ? repoPIP.created_at : new Date(repoPIP.created_at),
      updatedAt: repoPIP.updated_at instanceof Date ? repoPIP.updated_at : new Date(repoPIP.updated_at),
    };
  }
}
