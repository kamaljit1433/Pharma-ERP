/**
 * Unit Tests for Shift Service
 */

import { shiftService, Shift } from '../shiftService';

describe('ShiftService', () => {
  const mockShiftData = {
    name: 'Morning Shift',
    startTime: '09:00',
    endTime: '17:00',
    breakDuration: 60,
    type: 'Fixed' as const,
  };

  describe('createShift', () => {
    it('should create a new shift', async () => {
      const shift = await shiftService.createShift(mockShiftData);

      expect(shift).toBeDefined();
      expect(shift.id).toBeDefined();
      expect(shift.name).toBe(mockShiftData.name);
      expect(shift.startTime).toBe(mockShiftData.startTime);
      expect(shift.endTime).toBe(mockShiftData.endTime);
      expect(shift.breakDuration).toBe(mockShiftData.breakDuration);
      expect(shift.type).toBe(mockShiftData.type);
      expect(shift.createdAt).toBeInstanceOf(Date);
    });

    it('should reject shift with invalid name', async () => {
      const invalidData = { ...mockShiftData, name: '' };

      await expect(shiftService.createShift(invalidData)).rejects.toThrow(
        'Shift name is required'
      );
    });

    it('should reject shift with invalid start time', async () => {
      const invalidData = { ...mockShiftData, startTime: '25:00' };

      await expect(shiftService.createShift(invalidData)).rejects.toThrow(
        'Invalid start time format'
      );
    });

    it('should reject shift with invalid end time', async () => {
      const invalidData = { ...mockShiftData, endTime: '99:99' };

      await expect(shiftService.createShift(invalidData)).rejects.toThrow(
        'Invalid end time format'
      );
    });

    it('should reject shift with negative break duration', async () => {
      const invalidData = { ...mockShiftData, breakDuration: -30 };

      await expect(shiftService.createShift(invalidData)).rejects.toThrow(
        'Break duration cannot be negative'
      );
    });

    it('should reject shift with invalid type', async () => {
      const invalidData = { ...mockShiftData, type: 'Invalid' as any };

      await expect(shiftService.createShift(invalidData)).rejects.toThrow(
        'Invalid shift type'
      );
    });
  });

  describe('getShift', () => {
    it('should retrieve shift by ID', async () => {
      const created = await shiftService.createShift(mockShiftData);
      const retrieved = await shiftService.getShift(created.id);

      expect(retrieved).toEqual(created);
    });

    it('should return null for non-existent shift', async () => {
      const shift = await shiftService.getShift('non-existent-id');

      expect(shift).toBeNull();
    });
  });

  describe('getAllShifts', () => {
    it('should return all shifts', async () => {
      const shift1 = await shiftService.createShift(mockShiftData);
      const shift2 = await shiftService.createShift({
        ...mockShiftData,
        name: 'Evening Shift',
      });

      const allShifts = await shiftService.getAllShifts();

      expect(allShifts.length).toBeGreaterThanOrEqual(2);
      expect(allShifts).toContainEqual(shift1);
      expect(allShifts).toContainEqual(shift2);
    });
  });

  describe('updateShift', () => {
    it('should update shift details', async () => {
      const created = await shiftService.createShift(mockShiftData);
      const updated = await shiftService.updateShift(created.id, {
        name: 'Updated Shift',
        breakDuration: 90,
      });

      expect(updated.name).toBe('Updated Shift');
      expect(updated.breakDuration).toBe(90);
      expect(updated.startTime).toBe(mockShiftData.startTime);
    });

    it('should throw error for non-existent shift', async () => {
      await expect(
        shiftService.updateShift('non-existent-id', { name: 'New Name' })
      ).rejects.toThrow('not found');
    });

    it('should validate updated data', async () => {
      const created = await shiftService.createShift(mockShiftData);

      await expect(
        shiftService.updateShift(created.id, { startTime: 'invalid' })
      ).rejects.toThrow('Invalid start time format');
    });
  });

  describe('deleteShift', () => {
    it('should delete shift', async () => {
      const created = await shiftService.createShift(mockShiftData);
      await shiftService.deleteShift(created.id);

      const retrieved = await shiftService.getShift(created.id);
      expect(retrieved).toBeNull();
    });

    it('should throw error for non-existent shift', async () => {
      await expect(shiftService.deleteShift('non-existent-id')).rejects.toThrow(
        'not found'
      );
    });

    it('should prevent deletion of assigned shift', async () => {
      const shift = await shiftService.createShift(mockShiftData);
      await shiftService.assignShiftToEmployee('emp-123', shift.id, new Date());

      await expect(shiftService.deleteShift(shift.id)).rejects.toThrow(
        'Cannot delete shift'
      );
    });
  });

  describe('assignShiftToEmployee', () => {
    it('should assign shift to employee', async () => {
      const shift = await shiftService.createShift(mockShiftData);
      const employeeId = 'emp-123';
      const effectiveFrom = new Date('2024-01-15');

      const assignment = await shiftService.assignShiftToEmployee(
        employeeId,
        shift.id,
        effectiveFrom
      );

      expect(assignment).toBeDefined();
      expect(assignment.employeeId).toBe(employeeId);
      expect(assignment.shiftId).toBe(shift.id);
      expect(assignment.effectiveFrom).toEqual(effectiveFrom);
      expect(assignment.effectiveTo).toBeUndefined();
    });

    it('should throw error for non-existent shift', async () => {
      await expect(
        shiftService.assignShiftToEmployee('emp-123', 'non-existent-shift', new Date())
      ).rejects.toThrow('not found');
    });

    it('should end previous assignment when assigning new shift', async () => {
      const shift1 = await shiftService.createShift(mockShiftData);
      const shift2 = await shiftService.createShift({
        ...mockShiftData,
        name: 'Evening Shift',
      });
      const employeeId = 'emp-123';

      const assignment1 = await shiftService.assignShiftToEmployee(
        employeeId,
        shift1.id,
        new Date('2024-01-01')
      );

      const assignment2 = await shiftService.assignShiftToEmployee(
        employeeId,
        shift2.id,
        new Date('2024-02-01')
      );

      expect(assignment1.effectiveTo).toBeDefined();
      expect(assignment2.effectiveTo).toBeUndefined();
    });
  });

  describe('getCurrentShiftForEmployee', () => {
    it('should return current shift for employee', async () => {
      const shift = await shiftService.createShift(mockShiftData);
      const employeeId = 'emp-123';
      const now = new Date();

      await shiftService.assignShiftToEmployee(employeeId, shift.id, now);

      const currentShift = await shiftService.getCurrentShiftForEmployee(employeeId);

      expect(currentShift).toEqual(shift);
    });

    it('should return null if no current shift', async () => {
      const currentShift = await shiftService.getCurrentShiftForEmployee('emp-no-shift');

      expect(currentShift).toBeNull();
    });

    it('should not return expired shift', async () => {
      const shift = await shiftService.createShift(mockShiftData);
      const employeeId = 'emp-123';
      const pastDate = new Date('2020-01-01');

      const assignment = await shiftService.assignShiftToEmployee(
        employeeId,
        shift.id,
        pastDate
      );

      // End the assignment
      assignment.effectiveTo = new Date('2020-12-31');

      const currentShift = await shiftService.getCurrentShiftForEmployee(employeeId);

      expect(currentShift).toBeNull();
    });
  });

  describe('getShiftHistoryForEmployee', () => {
    it('should return shift history for employee', async () => {
      const shift1 = await shiftService.createShift(mockShiftData);
      const shift2 = await shiftService.createShift({
        ...mockShiftData,
        name: 'Evening Shift',
      });
      const employeeId = 'emp-123';

      await shiftService.assignShiftToEmployee(employeeId, shift1.id, new Date('2024-01-01'));
      await shiftService.assignShiftToEmployee(employeeId, shift2.id, new Date('2024-02-01'));

      const history = await shiftService.getShiftHistoryForEmployee(employeeId);

      expect(history.length).toBeGreaterThanOrEqual(2);
    });

    it('should return empty array for employee with no history', async () => {
      const history = await shiftService.getShiftHistoryForEmployee('emp-no-history');

      expect(history).toEqual([]);
    });

    it('should return history sorted by effective date descending', async () => {
      const shift1 = await shiftService.createShift(mockShiftData);
      const shift2 = await shiftService.createShift({
        ...mockShiftData,
        name: 'Evening Shift',
      });
      const employeeId = 'emp-123';

      const assignment1 = await shiftService.assignShiftToEmployee(
        employeeId,
        shift1.id,
        new Date('2024-01-01')
      );
      const assignment2 = await shiftService.assignShiftToEmployee(
        employeeId,
        shift2.id,
        new Date('2024-02-01')
      );

      const history = await shiftService.getShiftHistoryForEmployee(employeeId);

      expect(history[0].effectiveFrom.getTime()).toBeGreaterThanOrEqual(
        history[1].effectiveFrom.getTime()
      );
    });
  });
});
