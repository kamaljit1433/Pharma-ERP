/**
 * Example Test File
 * Demonstrates how to use the test database and data factories
 */

import { createTestHelpers } from './utils/test-helpers';

describe('Test Database and Factories Example', () => {
  const helpers = createTestHelpers();

  beforeAll(async () => {
    // Initialize test environment
    await helpers.setup();
  });

  afterAll(async () => {
    // Clean up test environment
    await helpers.teardown();
  });

  afterEach(async () => {
    // Reset database between tests
    await helpers.reset();
  });

  describe('Department Factory', () => {
    it('should create a department', async () => {
      const factories = helpers.getFactories();
      const department = await factories.departments().create();

      expect(department).toBeDefined();
      expect(department.id).toBeDefined();
      expect(department.name).toMatch(/Department \d+/);
    });

    it('should create a department hierarchy', async () => {
      const factories = helpers.getFactories();
      const { parent, children } = await factories.departments().createHierarchy(3);

      expect(parent).toBeDefined();
      expect(children).toHaveLength(3);
      expect(children[0]!.parent_department_id).toBe(parent.id);
    });
  });

  describe('Designation Factory', () => {
    it('should create a designation for a department', async () => {
      const factories = helpers.getFactories();
      const department = await factories.departments().create();
      const designation = await factories.designations().createForDepartment(department.id);

      expect(designation).toBeDefined();
      expect(designation.department_id).toBe(department.id);
      expect(designation.title).toBeDefined();
      expect(designation.level).toBeGreaterThan(0);
    });

    it('should create multiple designations for a department', async () => {
      const factories = helpers.getFactories();
      const department = await factories.departments().create();
      const designations = await factories.designations().createManyForDepartment(department.id, 3);

      expect(designations).toHaveLength(3);
      designations.forEach((d) => {
        expect(d.department_id).toBe(department.id);
      });
    });
  });

  describe('Employee Factory', () => {
    it('should create an employee', async () => {
      const factories = helpers.getFactories();
      const employee = await factories.employees().create();

      expect(employee).toBeDefined();
      expect(employee.id).toBeDefined();
      expect(employee.employee_id).toMatch(/EMP\d+/);
      expect(employee.email).toContain('@example.com');
      expect(employee.status).toBe('active');
    });

    it('should create an employee with role', async () => {
      const factories = helpers.getFactories();
      const department = await factories.departments().create();
      const designation = await factories.designations().createForDepartment(department.id);
      const employee = await factories.employees().createWithRole(department.id, designation.id);

      expect(employee.department_id).toBe(department.id);
      expect(employee.designation_id).toBe(designation.id);
    });

    it('should create a manager with team', async () => {
      const factories = helpers.getFactories();
      const department = await factories.departments().create();
      const designation = await factories.designations().createForDepartment(department.id);
      const { manager, team } = await factories.employees().createManagerWithTeam(department.id, designation.id, 3);

      expect(manager).toBeDefined();
      expect(team).toHaveLength(3);
      team.forEach((member) => {
        expect(member.reporting_manager_id).toBe(manager.id);
      });
    });

    it('should create an inactive employee', async () => {
      const factories = helpers.getFactories();
      const employee = await factories.employees().createInactive();

      expect(employee.status).toBe('resigned');
      expect(employee.date_of_exit).toBeDefined();
    });
  });

  describe('Leave Type Factory', () => {
    it('should create a leave type', async () => {
      const factories = helpers.getFactories();
      const leaveType = await factories.leaveTypes().create();

      expect(leaveType).toBeDefined();
      expect(leaveType.name).toBeDefined();
      expect(leaveType.code).toBeDefined();
      expect(leaveType.annual_limit).toBeGreaterThan(0);
    });

    it('should create standard leave types', async () => {
      const factories = helpers.getFactories();
      const leaveTypes = await factories.leaveTypes().createStandardLeaveTypes();

      expect(leaveTypes.length).toBeGreaterThan(0);
      expect(leaveTypes.some((lt) => lt.code === 'CL')).toBe(true);
      expect(leaveTypes.some((lt) => lt.code === 'SL')).toBe(true);
    });
  });

  describe('Shift Factory', () => {
    it('should create a shift', async () => {
      const factories = helpers.getFactories();
      const shift = await factories.shifts().create();

      expect(shift).toBeDefined();
      expect(shift.name).toBeDefined();
      expect(shift.start_time).toBeDefined();
      expect(shift.end_time).toBeDefined();
      expect(shift.is_active).toBe(true);
    });

    it('should create standard shifts', async () => {
      const factories = helpers.getFactories();
      const shifts = await factories.shifts().createStandardShifts();

      expect(shifts.length).toBeGreaterThan(0);
      expect(shifts.some((s) => s.code === 'MS')).toBe(true);
    });
  });

  describe('Salary Structure Factory', () => {
    it('should create a salary structure for an employee', async () => {
      const factories = helpers.getFactories();
      const employee = await factories.employees().create();
      const salary = await factories.salaryStructures().createForEmployee(employee.id);

      expect(salary).toBeDefined();
      expect(salary.employee_id).toBe(employee.id);
      expect(salary.base_salary).toBeGreaterThan(0);
      expect(salary.is_active).toBe(true);
    });

    it('should create salary structure with custom mode', async () => {
      const factories = helpers.getFactories();
      const employee = await factories.employees().create();
      const salary = await factories.salaryStructures().createWithMode(employee.id, 'daily');

      expect(salary.salary_mode).toBe('daily');
    });
  });

  describe('Attendance Factory', () => {
    it('should create an attendance record', async () => {
      const factories = helpers.getFactories();
      const employee = await factories.employees().create();
      const attendance = await factories.attendance().createForEmployee(employee.id);

      expect(attendance).toBeDefined();
      expect(attendance.employee_id).toBe(employee.id);
      expect(attendance.status).toBe('present');
      expect(attendance.working_hours).toBe(8);
    });

    it('should create attendance with custom status', async () => {
      const factories = helpers.getFactories();
      const employee = await factories.employees().create();
      const attendance = await factories.attendance().createWithStatus(employee.id, 'absent');

      expect(attendance.status).toBe('absent');
      expect(attendance.working_hours).toBe(0);
    });

    it('should create monthly attendance records', async () => {
      const factories = helpers.getFactories();
      const employee = await factories.employees().create();
      const records = await factories.attendance().createMonthlyAttendance(employee.id, 2024, 0, 20);

      expect(records.length).toBeGreaterThan(0);
      records.forEach((record) => {
        expect(record.employee_id).toBe(employee.id);
      });
    });
  });

  describe('Leave Factory', () => {
    it('should create a leave request', async () => {
      const factories = helpers.getFactories();
      const employee = await factories.employees().create();
      const leaveType = await factories.leaveTypes().create();
      const leave = await factories.leaves().createForEmployee(employee.id, leaveType.id);

      expect(leave).toBeDefined();
      expect(leave.employee_id).toBe(employee.id);
      expect(leave.leave_type_id).toBe(leaveType.id);
      expect(leave.status).toBe('pending');
    });

    it('should create an approved leave request', async () => {
      const factories = helpers.getFactories();
      const employee = await factories.employees().create();
      const approver = await factories.employees().create();
      const leaveType = await factories.leaveTypes().create();
      const leave = await factories.leaves().createApproved(employee.id, leaveType.id, approver.id);

      expect(leave.status).toBe('approved');
      expect(leave.approved_by).toBe(approver.id);
      expect(leave.approval_date).toBeDefined();
    });

    it('should create multiple leave requests', async () => {
      const factories = helpers.getFactories();
      const employee = await factories.employees().create();
      const leaveType = await factories.leaveTypes().create();
      const leaves = await factories.leaves().createManyForEmployee(employee.id, leaveType.id, 3);

      expect(leaves).toHaveLength(3);
      leaves.forEach((leave) => {
        expect(leave.employee_id).toBe(employee.id);
      });
    });
  });

  describe('Factory Builder - Organization Setup', () => {
    it('should create a complete organization', async () => {
      const factories = helpers.getFactories();
      const org = await factories.createOrganization({
        departmentCount: 2,
        employeesPerDepartment: 3,
        withSalaryStructures: true,
        withAttendance: true,
      });

      expect(org.departments).toHaveLength(2);
      expect(org.designations.length).toBeGreaterThan(0);
      expect(org.employees.length).toBeGreaterThan(0);
      expect(org.salaryStructures.length).toBeGreaterThan(0);
      expect(org.attendanceRecords.length).toBeGreaterThan(0);
    });
  });

  describe('Factory Builder - Leave Setup', () => {
    it('should create a complete leave setup', async () => {
      const factories = helpers.getFactories();
      const employees = await factories.employees().createMany(2);
      const employeeIds = employees.map((e) => e.id);

      const { leaveTypes, leaves } = await factories.createLeaveSetup(employeeIds);

      expect(leaveTypes.length).toBeGreaterThan(0);
      expect(leaves.length).toBeGreaterThan(0);
    });
  });

  describe('Factory Builder - Monthly Attendance Setup', () => {
    it('should create monthly attendance for employees', async () => {
      const factories = helpers.getFactories();
      const employees = await factories.employees().createMany(2);
      const employeeIds = employees.map((e) => e.id);

      const { attendanceRecords } = await factories.createMonthlyAttendanceSetup(employeeIds, 2024, 0);

      expect(attendanceRecords.length).toBeGreaterThan(0);
    });
  });

  describe('Test Helpers - Database Operations', () => {
    it('should insert and retrieve data', async () => {
      const department = await helpers.insert('departments', {
        id: helpers.getKnex().raw('gen_random_uuid()'),
        name: 'Test Department',
        created_at: new Date(),
        updated_at: new Date(),
      });

      expect(department).toBeDefined();
      expect(department.name).toBe('Test Department');
    });

    it('should count records', async () => {
      const factories = helpers.getFactories();
      await factories.employees().createMany(3);

      const count = await helpers.count('employees');
      expect(count).toBe(3);
    });

    it('should update records', async () => {
      const factories = helpers.getFactories();
      const employee = await factories.employees().create();

      await helpers.update('employees', { status: 'suspended' }, { id: employee.id });

      const updated = await helpers.getOne('employees', { id: employee.id });
      expect(updated.status).toBe('suspended');
    });

    it('should delete records', async () => {
      const factories = helpers.getFactories();
      const employee = await factories.employees().create();

      await helpers.delete('employees', { id: employee.id });

      const deleted = await helpers.getOne('employees', { id: employee.id });
      expect(deleted).toBeUndefined();
    });
  });
});
