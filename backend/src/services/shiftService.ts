/**
 * Shift Management Service
 * Handles shift CRUD operations and employee shift assignments
 */

interface Shift {
  id: string;
  name: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  breakDuration: number; // minutes
  type: 'Fixed' | 'Rotating' | 'Flexible';
  createdAt: Date;
  updatedAt: Date;
}

interface EmployeeShiftAssignment {
  id: string;
  employeeId: string;
  shiftId: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  createdAt: Date;
  updatedAt: Date;
}

class ShiftService {
  private shifts: Map<string, Shift> = new Map();
  private assignments: Map<string, EmployeeShiftAssignment> = new Map();

  /**
   * Create a new shift
   */
  async createShift(shiftData: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>): Promise<Shift> {
    // Validate shift data
    this._validateShiftData(shiftData);

    const shift: Shift = {
      id: this._generateId(),
      ...shiftData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.shifts.set(shift.id, shift);
    return shift;
  }

  /**
   * Get shift by ID
   */
  async getShift(shiftId: string): Promise<Shift | null> {
    return this.shifts.get(shiftId) || null;
  }

  /**
   * Get all shifts
   */
  async getAllShifts(): Promise<Shift[]> {
    return Array.from(this.shifts.values());
  }

  /**
   * Update shift
   */
  async updateShift(
    shiftId: string,
    updates: Partial<Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Shift> {
    const shift = this.shifts.get(shiftId);
    if (!shift) {
      throw new Error(`Shift with ID ${shiftId} not found`);
    }

    // Validate updated data
    const updatedData = { ...shift, ...updates };
    this._validateShiftData(updatedData);

    const updated: Shift = {
      ...shift,
      ...updates,
      updatedAt: new Date(),
    };

    this.shifts.set(shiftId, updated);
    return updated;
  }

  /**
   * Delete shift
   */
  async deleteShift(shiftId: string): Promise<void> {
    const shift = this.shifts.get(shiftId);
    if (!shift) {
      throw new Error(`Shift with ID ${shiftId} not found`);
    }

    // Check if shift is assigned to any employees
    const assignments = Array.from(this.assignments.values()).filter(
      (a) => a.shiftId === shiftId && !a.effectiveTo
    );

    if (assignments.length > 0) {
      throw new Error(
        `Cannot delete shift. It is assigned to ${assignments.length} employee(s)`
      );
    }

    this.shifts.delete(shiftId);
  }

  /**
   * Assign shift to employee
   */
  async assignShiftToEmployee(
    employeeId: string,
    shiftId: string,
    effectiveFrom: Date
  ): Promise<EmployeeShiftAssignment> {
    // Validate shift exists
    const shift = await this.getShift(shiftId);
    if (!shift) {
      throw new Error(`Shift with ID ${shiftId} not found`);
    }

    // End previous assignment if exists
    const previousAssignments = Array.from(this.assignments.values()).filter(
      (a) => a.employeeId === employeeId && !a.effectiveTo
    );

    for (const prev of previousAssignments) {
      prev.effectiveTo = new Date(effectiveFrom.getTime() - 1);
      this.assignments.set(prev.id, prev);
    }

    // Create new assignment
    const assignment: EmployeeShiftAssignment = {
      id: this._generateId(),
      employeeId,
      shiftId,
      effectiveFrom,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.assignments.set(assignment.id, assignment);
    return assignment;
  }

  /**
   * Get current shift for employee
   */
  async getCurrentShiftForEmployee(employeeId: string): Promise<Shift | null> {
    const now = new Date();
    const assignment = Array.from(this.assignments.values()).find(
      (a) =>
        a.employeeId === employeeId &&
        a.effectiveFrom <= now &&
        (!a.effectiveTo || a.effectiveTo >= now)
    );

    if (!assignment) {
      return null;
    }

    return this.getShift(assignment.shiftId);
  }

  /**
   * Get shift history for employee
   */
  async getShiftHistoryForEmployee(employeeId: string): Promise<EmployeeShiftAssignment[]> {
    return Array.from(this.assignments.values())
      .filter((a) => a.employeeId === employeeId)
      .sort((a, b) => b.effectiveFrom.getTime() - a.effectiveFrom.getTime());
  }

  /**
   * Validate shift data
   */
  private _validateShiftData(
    shiftData: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>
  ): void {
    if (!shiftData.name || shiftData.name.trim().length === 0) {
      throw new Error('Shift name is required');
    }

    if (!this._isValidTimeFormat(shiftData.startTime)) {
      throw new Error('Invalid start time format. Use HH:mm');
    }

    if (!this._isValidTimeFormat(shiftData.endTime)) {
      throw new Error('Invalid end time format. Use HH:mm');
    }

    if (shiftData.breakDuration < 0) {
      throw new Error('Break duration cannot be negative');
    }

    if (!['Fixed', 'Rotating', 'Flexible'].includes(shiftData.type)) {
      throw new Error('Invalid shift type');
    }
  }

  /**
   * Validate time format (HH:mm)
   */
  private _isValidTimeFormat(time: string): boolean {
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(time);
  }

  /**
   * Generate unique ID
   */
  private _generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}

export const shiftService = new ShiftService();
export type { Shift, EmployeeShiftAssignment };
