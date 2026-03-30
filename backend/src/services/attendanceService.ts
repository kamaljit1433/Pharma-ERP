/**
 * Attendance Service
 * Handles check-in/check-out, working hours calculation, and attendance tracking
 */

import { GeoLocation } from './geoTrackingService';

interface Attendance {
  id: string;
  employeeId: string;
  date: Date;
  checkInTime: Date;
  checkOutTime?: Date;
  totalHours?: number;
  overtimeHours?: number;
  mode: 'Biometric' | 'PWA' | 'Web' | 'Manual';
  status: 'Present' | 'Absent' | 'Half-Day' | 'On Leave' | 'Holiday';
  checkInLocation?: GeoLocation;
  checkOutLocation?: GeoLocation;
  faceDetected: boolean;
  shiftId?: string;
  regularizationRequested: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface RegularizationRequest {
  id: string;
  attendanceId: string;
  employeeId: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approverId?: string;
  approverComments?: string;
  createdAt: Date;
  processedAt?: Date;
}

interface Shift {
  id: string;
  name: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  breakDuration: number; // minutes
  type: 'Fixed' | 'Rotating' | 'Flexible';
}

class AttendanceService {
  private standardShiftHours = 8; // Default 8-hour shift
  private breakDurationMinutes = 60; // Default 1-hour break

  /**
   * Mark check-in with face detection and GPS validation
   */
  async checkIn(
    employeeId: string,
    location: GeoLocation,
    faceDetected: boolean,
    shiftId?: string
  ): Promise<Attendance> {
    // Validate face detection
    if (!faceDetected) {
      throw new Error('Face detection required for check-in');
    }

    // Validate GPS location
    if (!location || !this._isValidGeoLocation(location)) {
      throw new Error('Valid GPS location required for check-in');
    }

    const now = new Date();
    const attendance: Attendance = {
      id: this._generateId(),
      employeeId,
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      checkInTime: now,
      mode: 'PWA',
      status: 'Present',
      checkInLocation: location,
      faceDetected: true,
      regularizationRequested: false,
      createdAt: now,
      updatedAt: now,
    };

    if (shiftId) {
      attendance.shiftId = shiftId;
    }

    return attendance;
  }

  /**
   * Mark check-out with GPS capture
   */
  async checkOut(
    attendanceId: string,
    location: GeoLocation
  ): Promise<Attendance> {
    // Validate GPS location
    if (!location || !this._isValidGeoLocation(location)) {
      throw new Error('Valid GPS location required for check-out');
    }

    const now = new Date();

    // In a real implementation, this would fetch the attendance record from DB
    // For now, we'll create a mock response
    const attendance: Attendance = {
      id: attendanceId,
      employeeId: '',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      checkInTime: new Date(now.getTime() - 8 * 60 * 60 * 1000), // 8 hours ago
      checkOutTime: now,
      checkOutLocation: location,
      mode: 'PWA',
      status: 'Present',
      faceDetected: true,
      regularizationRequested: false,
      createdAt: new Date(),
      updatedAt: now,
    };

    // Calculate working hours
    attendance.totalHours = this.calculateWorkingHours(attendance);
    attendance.overtimeHours = this.calculateOvertimeHours(attendance);

    return attendance;
  }

  /**
   * Calculate working hours from check-in and check-out times
   */
  calculateWorkingHours(attendance: Attendance): number {
    if (!attendance.checkInTime || !attendance.checkOutTime) {
      return 0;
    }

    const diffMs =
      attendance.checkOutTime.getTime() - attendance.checkInTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const breakHours = this.breakDurationMinutes / 60;

    return Math.max(0, diffHours - breakHours);
  }

  /**
   * Calculate overtime hours
   */
  calculateOvertimeHours(attendance: Attendance): number {
    const workingHours = attendance.totalHours || this.calculateWorkingHours(attendance);
    const overtimeHours = Math.max(0, workingHours - this.standardShiftHours);

    return overtimeHours;
  }

  /**
   * Get monthly attendance summary
   */
  async getMonthlyAttendance(
    _employeeId: string,
    _month: number,
    _year: number
  ): Promise<Attendance[]> {
    // In a real implementation, this would query the database
    // For now, return empty array
    return [];
  }

  /**
   * Request attendance regularization
   */
  async requestRegularization(
    attendanceId: string,
    employeeId: string,
    reason: string
  ): Promise<RegularizationRequest> {
    const request: RegularizationRequest = {
      id: this._generateId(),
      attendanceId,
      employeeId,
      reason,
      status: 'Pending',
      createdAt: new Date(),
    };

    return request;
  }

  /**
   * Approve regularization request
   */
  async approveRegularization(
    requestId: string,
    approverId: string,
    comments?: string
  ): Promise<RegularizationRequest> {
    const request: RegularizationRequest = {
      id: requestId,
      attendanceId: '',
      employeeId: '',
      reason: '',
      status: 'Approved',
      approverId,
      createdAt: new Date(),
      processedAt: new Date(),
    };

    if (comments) {
      request.approverComments = comments;
    }

    return request;
  }

  /**
   * Validate GPS location
   */
  private _isValidGeoLocation(location: GeoLocation): boolean {
    return (
      location &&
      typeof location.latitude === 'number' &&
      typeof location.longitude === 'number' &&
      location.latitude >= -90 &&
      location.latitude <= 90 &&
      location.longitude >= -180 &&
      location.longitude <= 180 &&
      typeof location.accuracy === 'number' &&
      location.accuracy >= 0 &&
      location.timestamp instanceof Date
    );
  }

  /**
   * Generate unique ID
   */
  private _generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const attendanceService = new AttendanceService();
export type { Attendance, RegularizationRequest, Shift };
