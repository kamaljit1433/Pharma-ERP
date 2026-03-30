/**
 * Fast-Check Generators for Property-Based Testing
 * 
 * This module provides reusable fast-check generators for common data types
 * used throughout the Employee Management System.
 */

import * as fc from 'fast-check';
import { v4 as uuidv4 } from 'uuid';

/**
 * Employee ID Generator
 * Generates valid employee IDs in format: EMP + 6 digits
 */
export const employeeIdArbitrary = (): fc.Arbitrary<string> => {
  return fc.integer({ min: 100000, max: 999999 }).map(num => `EMP${num}`);
};

/**
 * Email Generator
 * Generates valid email addresses
 */
export const emailArbitrary = (): fc.Arbitrary<string> => {
  return fc.emailAddress();
};

/**
 * Phone Number Generator
 * Generates valid phone numbers (10 digits)
 */
export const phoneNumberArbitrary = (): fc.Arbitrary<string> => {
  return fc.integer({ min: 1000000000, max: 9999999999 }).map(num => num.toString());
};

/**
 * Employee Name Generator
 * Generates realistic employee names
 */
export const employeeNameArbitrary = (): fc.Arbitrary<string> => {
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'Robert', 'Lisa'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
  
  return fc.tuple(
    fc.constantFrom(...firstNames),
    fc.constantFrom(...lastNames)
  ).map(([first, last]) => `${first} ${last}`);
};

/**
 * Department Generator
 * Generates valid department names
 */
export const departmentArbitrary = (): fc.Arbitrary<string> => {
  const departments = [
    'Engineering',
    'Sales',
    'Marketing',
    'HR',
    'Finance',
    'Operations',
    'Product',
    'Design'
  ];
  return fc.constantFrom(...departments);
};

/**
 * Salary Generator
 * Generates realistic salary amounts (in cents to avoid floating point issues)
 */
export const salaryArbitrary = (): fc.Arbitrary<number> => {
  return fc.integer({ min: 300000, max: 10000000 }); // 3,000 to 100,000 in base units
};

/**
 * Percentage Generator
 * Generates valid percentages (0-100)
 */
export const percentageArbitrary = (): fc.Arbitrary<number> => {
  return fc.integer({ min: 0, max: 100 });
};

/**
 * Leave Balance Generator
 * Generates valid leave balance (0-30 days)
 */
export const leaveBalanceArbitrary = (): fc.Arbitrary<number> => {
  return fc.integer({ min: 0, max: 30 });
};

/**
 * Working Hours Generator
 * Generates valid working hours (0-24 hours)
 */
export const workingHoursArbitrary = (): fc.Arbitrary<number> => {
  return fc.float({ min: 0, max: 24, noNaN: true });
};

/**
 * Overtime Hours Generator
 * Generates valid overtime hours (0-12 hours)
 */
export const overtimeHoursArbitrary = (): fc.Arbitrary<number> => {
  return fc.float({ min: 0, max: 12, noNaN: true });
};

/**
 * Distance Generator (in kilometers)
 * Generates valid distances (0-1000 km)
 */
export const distanceArbitrary = (): fc.Arbitrary<number> => {
  return fc.float({ min: 0, max: 1000, noNaN: true });
};

/**
 * Latitude Generator
 * Generates valid latitude coordinates (-90 to 90)
 */
export const latitudeArbitrary = (): fc.Arbitrary<number> => {
  return fc.float({ min: -90, max: 90, noNaN: true });
};

/**
 * Longitude Generator
 * Generates valid longitude coordinates (-180 to 180)
 */
export const longitudeArbitrary = (): fc.Arbitrary<number> => {
  return fc.float({ min: -180, max: 180, noNaN: true });
};

/**
 * Geo Location Generator
 * Generates valid geographic coordinates
 */
export const geoLocationArbitrary = (): fc.Arbitrary<{ latitude: number; longitude: number }> => {
  return fc.tuple(latitudeArbitrary(), longitudeArbitrary()).map(([latitude, longitude]) => ({
    latitude,
    longitude,
  }));
};

/**
 * Employee Status Generator
 * Generates valid employee statuses
 */
export const employeeStatusArbitrary = (): fc.Arbitrary<string> => {
  const statuses = ['Active', 'On Leave', 'Suspended', 'Resigned', 'Terminated'];
  return fc.constantFrom(...statuses);
};

/**
 * Leave Status Generator
 * Generates valid leave request statuses
 */
export const leaveStatusArbitrary = (): fc.Arbitrary<string> => {
  const statuses = ['Pending', 'Approved', 'Rejected', 'Cancelled'];
  return fc.constantFrom(...statuses);
};

/**
 * Attendance Status Generator
 * Generates valid attendance statuses
 */
export const attendanceStatusArbitrary = (): fc.Arbitrary<string> => {
  const statuses = ['Present', 'Absent', 'Half-Day', 'On Leave', 'Holiday'];
  return fc.constantFrom(...statuses);
};

/**
 * Payroll Status Generator
 * Generates valid payroll statuses
 */
export const payrollStatusArbitrary = (): fc.Arbitrary<string> => {
  const statuses = ['Draft', 'Processed', 'Paid', 'Locked'];
  return fc.constantFrom(...statuses);
};

/**
 * Month Generator
 * Generates valid month numbers (1-12)
 */
export const monthArbitrary = (): fc.Arbitrary<number> => {
  return fc.integer({ min: 1, max: 12 });
};

/**
 * Year Generator
 * Generates valid years (2020-2030)
 */
export const yearArbitrary = (): fc.Arbitrary<number> => {
  return fc.integer({ min: 2020, max: 2030 });
};

/**
 * Date Generator
 * Generates valid dates
 */
export const dateArbitrary = (): fc.Arbitrary<Date> => {
  return fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') });
};

/**
 * UUID Generator
 * Generates valid UUIDs
 */
export const uuidArbitrary = (): fc.Arbitrary<string> => {
  return fc.uuid();
};

/**
 * Employee Object Generator
 * Generates complete employee objects for testing
 */
export const employeeArbitrary = (): fc.Arbitrary<any> => {
  return fc.record({
    id: employeeIdArbitrary(),
    firstName: fc.string({ minLength: 1, maxLength: 50 }),
    lastName: fc.string({ minLength: 1, maxLength: 50 }),
    email: emailArbitrary(),
    phone: phoneNumberArbitrary(),
    department: departmentArbitrary(),
    status: employeeStatusArbitrary(),
    joinDate: dateArbitrary(),
    salary: salaryArbitrary(),
  });
};

/**
 * Leave Request Object Generator
 * Generates complete leave request objects for testing
 */
export const leaveRequestArbitrary = (): fc.Arbitrary<any> => {
  return fc.record({
    id: uuidArbitrary(),
    employeeId: employeeIdArbitrary(),
    startDate: dateArbitrary(),
    endDate: dateArbitrary(),
    reason: fc.string({ minLength: 10, maxLength: 500 }),
    status: leaveStatusArbitrary(),
    approvedBy: fc.option(employeeIdArbitrary()),
  });
};

/**
 * Attendance Record Generator
 * Generates complete attendance records for testing
 */
export const attendanceRecordArbitrary = (): fc.Arbitrary<any> => {
  return fc.record({
    id: uuidArbitrary(),
    employeeId: employeeIdArbitrary(),
    date: dateArbitrary(),
    checkInTime: fc.option(fc.date()),
    checkOutTime: fc.option(fc.date()),
    status: attendanceStatusArbitrary(),
    workingHours: workingHoursArbitrary(),
    location: geoLocationArbitrary(),
  });
};

/**
 * Payroll Record Generator
 * Generates complete payroll records for testing
 */
export const payrollRecordArbitrary = (): fc.Arbitrary<any> => {
  return fc.record({
    id: uuidArbitrary(),
    employeeId: employeeIdArbitrary(),
    month: monthArbitrary(),
    year: yearArbitrary(),
    baseSalary: salaryArbitrary(),
    deductions: salaryArbitrary(),
    netSalary: salaryArbitrary(),
    status: payrollStatusArbitrary(),
  });
};
