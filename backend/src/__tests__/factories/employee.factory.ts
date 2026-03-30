import { Knex } from 'knex';
import { BaseFactory } from './base.factory';

export interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  personal_email: string | null;
  date_of_birth: Date | null;
  gender: 'male' | 'female' | 'other' | null;
  blood_group: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  pan: string | null;
  aadhar: string | null;
  department_id: string | null;
  designation_id: string | null;
  reporting_manager_id: string | null;
  date_of_joining: Date;
  date_of_exit: Date | null;
  employment_type: 'permanent' | 'contract' | 'temporary' | 'intern';
  status: 'active' | 'on_leave' | 'suspended' | 'resigned' | 'terminated';
  profile_photo_url: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Factory for generating Employee test data
 */
export class EmployeeFactory extends BaseFactory<Employee> {
  private static counter = 0;
  private static firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'Robert', 'Lisa'];
  private static lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
  private static genders: Array<'male' | 'female' | 'other'> = ['male', 'female', 'other'];
  private static bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  constructor(knex: Knex) {
    super(knex, 'employees');
  }

  /**
   * Create a single employee
   */
  async create(overrides?: Partial<Employee>): Promise<Employee> {
    EmployeeFactory.counter++;
    const firstName = EmployeeFactory.firstNames[EmployeeFactory.counter % EmployeeFactory.firstNames.length];
    const lastName = EmployeeFactory.lastNames[EmployeeFactory.counter % EmployeeFactory.lastNames.length];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${EmployeeFactory.counter}@example.com`;
    const employeeId = `EMP${String(EmployeeFactory.counter).padStart(6, '0')}`;

    const data: any = {
      id: this.generateId(),
      employee_id: employeeId,
      first_name: firstName,
      last_name: lastName,
      email,
      phone: this.randomPhone(),
      personal_email: this.randomEmail(),
      date_of_birth: this.randomDate(new Date(1980, 0, 1), new Date(2000, 0, 1)),
      gender: EmployeeFactory.genders[Math.floor(Math.random() * EmployeeFactory.genders.length)],
      blood_group: EmployeeFactory.bloodGroups[Math.floor(Math.random() * EmployeeFactory.bloodGroups.length)],
      address: `${Math.floor(Math.random() * 1000)} Main Street`,
      city: 'Bangalore',
      state: 'Karnataka',
      postal_code: '560001',
      country: 'India',
      pan: `${this.randomString(10).toUpperCase()}`,
      aadhar: `${Math.floor(Math.random() * 1000000000000)}`,
      department_id: null,
      designation_id: null,
      reporting_manager_id: null,
      date_of_joining: this.randomDate(new Date(2020, 0, 1), new Date()),
      date_of_exit: null,
      employment_type: 'permanent',
      status: 'active',
      profile_photo_url: null,
      created_at: new Date(),
      updated_at: new Date(),
      ...overrides,
    };

    return this.insert(data);
  }

  /**
   * Create an employee with department and designation
   */
  async createWithRole(
    departmentId: string,
    designationId: string,
    overrides?: Partial<Employee>
  ): Promise<Employee> {
    return this.create({
      department_id: departmentId,
      designation_id: designationId,
      ...overrides,
    });
  }

  /**
   * Create an employee with a manager
   */
  async createWithManager(managerId: string, overrides?: Partial<Employee>): Promise<Employee> {
    return this.create({
      reporting_manager_id: managerId,
      ...overrides,
    });
  }

  /**
   * Create a manager with team members
   */
  async createManagerWithTeam(
    departmentId: string,
    designationId: string,
    teamSize: number = 3
  ): Promise<{ manager: Employee; team: Employee[] }> {
    const manager = await this.createWithRole(departmentId, designationId);
    const team: Employee[] = [];

    for (let i = 0; i < teamSize; i++) {
      const member = await this.createWithManager(manager.id, {
        department_id: departmentId,
      });
      team.push(member);
    }

    return { manager, team };
  }

  /**
   * Create an inactive employee
   */
  async createInactive(overrides?: Partial<Employee>): Promise<Employee> {
    return this.create({
      status: 'resigned',
      date_of_exit: new Date(),
      ...overrides,
    });
  }

  /**
   * Create multiple employees for a department
   */
  async createManyForDepartment(departmentId: string, count: number): Promise<Employee[]> {
    const employees: Employee[] = [];
    for (let i = 0; i < count; i++) {
      employees.push(
        await this.create({
          department_id: departmentId,
        })
      );
    }
    return employees;
  }
}
