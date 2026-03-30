import { Knex } from 'knex';
import { DepartmentFactory } from './department.factory';
import { DesignationFactory } from './designation.factory';
import { EmployeeFactory } from './employee.factory';
import { LeaveTypeFactory } from './leave-type.factory';
import { ShiftFactory } from './shift.factory';
import { SalaryStructureFactory } from './salary-structure.factory';
import { AttendanceFactory } from './attendance.factory';
import { LeaveFactory } from './leave.factory';

/**
 * Factory Builder for convenient test data creation
 * Provides a fluent API for building complex test scenarios
 */
export class FactoryBuilder {
  private knex: Knex;

  private departmentFactory: DepartmentFactory;
  private designationFactory: DesignationFactory;
  private employeeFactory: EmployeeFactory;
  private leaveTypeFactory: LeaveTypeFactory;
  private shiftFactory: ShiftFactory;
  private salaryStructureFactory: SalaryStructureFactory;
  private attendanceFactory: AttendanceFactory;
  private leaveFactory: LeaveFactory;

  constructor(knex: Knex) {
    this.knex = knex;

    this.departmentFactory = new DepartmentFactory(knex);
    this.designationFactory = new DesignationFactory(knex);
    this.employeeFactory = new EmployeeFactory(knex);
    this.leaveTypeFactory = new LeaveTypeFactory(knex);
    this.shiftFactory = new ShiftFactory(knex);
    this.salaryStructureFactory = new SalaryStructureFactory(knex);
    this.attendanceFactory = new AttendanceFactory(knex);
    this.leaveFactory = new LeaveFactory(knex);
  }

  /**
   * Get department factory
   */
  departments() {
    return this.departmentFactory;
  }

  /**
   * Get designation factory
   */
  designations() {
    return this.designationFactory;
  }

  /**
   * Get employee factory
   */
  employees() {
    return this.employeeFactory;
  }

  /**
   * Get leave type factory
   */
  leaveTypes() {
    return this.leaveTypeFactory;
  }

  /**
   * Get shift factory
   */
  shifts() {
    return this.shiftFactory;
  }

  /**
   * Get salary structure factory
   */
  salaryStructures() {
    return this.salaryStructureFactory;
  }

  /**
   * Get attendance factory
   */
  attendance() {
    return this.attendanceFactory;
  }

  /**
   * Get leave factory
   */
  leaves() {
    return this.leaveFactory;
  }

  /**
   * Create a complete organizational structure with employees
   */
  async createOrganization(config?: {
    departmentCount?: number;
    employeesPerDepartment?: number;
    withSalaryStructures?: boolean;
    withAttendance?: boolean;
  }) {
    const {
      departmentCount = 2,
      employeesPerDepartment = 5,
      withSalaryStructures = true,
      withAttendance = false,
    } = config || {};

    const departments = [];
    const designations = [];
    const employees = [];
    const salaryStructures = [];
    const attendanceRecords = [];

    // Create departments
    for (let i = 0; i < departmentCount; i++) {
      const dept = await this.departmentFactory.create();
      departments.push(dept);

      // Create designations for department
      const deptDesignations = await this.designationFactory.createManyForDepartment(dept.id, 3);
      designations.push(...deptDesignations);

      // Create employees for department
      for (let j = 0; j < employeesPerDepartment; j++) {
        const designation = deptDesignations[j % deptDesignations.length];
        const employee = await this.employeeFactory.createWithRole(dept.id, designation.id);
        employees.push(employee);

        // Create salary structure if requested
        if (withSalaryStructures) {
          const salary = await this.salaryStructureFactory.createForEmployee(employee.id);
          salaryStructures.push(salary);
        }

        // Create attendance if requested
        if (withAttendance) {
          const attendance = await this.attendanceFactory.createForEmployee(employee.id);
          attendanceRecords.push(attendance);
        }
      }
    }

    return {
      departments,
      designations,
      employees,
      salaryStructures,
      attendanceRecords,
    };
  }

  /**
   * Create a complete leave management setup
   */
  async createLeaveSetup(employeeIds: string[]) {
    const leaveTypes = await this.leaveTypeFactory.createStandardLeaveTypes();
    const leaves = [];

    for (const employeeId of employeeIds) {
      for (const leaveType of leaveTypes) {
        const leave = await this.leaveFactory.createForEmployee(employeeId, leaveType.id);
        leaves.push(leave);
      }
    }

    return { leaveTypes, leaves };
  }

  /**
   * Create a complete attendance setup for a month
   */
  async createMonthlyAttendanceSetup(employeeIds: string[], year: number, month: number) {
    const attendanceRecords = [];

    for (const employeeId of employeeIds) {
      const records = await this.attendanceFactory.createMonthlyAttendance(employeeId, year, month);
      attendanceRecords.push(...records);
    }

    return { attendanceRecords };
  }

  /**
   * Clean up all test data
   */
  async cleanup() {
    // Delete in reverse order of creation to respect foreign keys
    await this.leaveFactory.deleteAll();
    await this.attendanceFactory.deleteAll();
    await this.salaryStructureFactory.deleteAll();
    await this.shiftFactory.deleteAll();
    await this.leaveTypeFactory.deleteAll();
    await this.employeeFactory.deleteAll();
    await this.designationFactory.deleteAll();
    await this.departmentFactory.deleteAll();
  }
}
