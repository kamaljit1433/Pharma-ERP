import { Knex } from 'knex';
import { Employee, CreateEmployeeDTO, UpdateEmployeeDTO, EmployeeFilters, EmergencyContact, CreateEmergencyContactDTO, UpdateEmergencyContactDTO, EmploymentHistory } from '../types/employee';
import { v4 as uuidv4 } from 'uuid';

export class EmployeeRepository {
  constructor(private db: Knex) {}

  async createEmployee(data: CreateEmployeeDTO): Promise<Employee> {
    const employeeId = `EMP${Date.now()}`;
    const id = uuidv4();

    const [employee] = await this.db('employees')
      .insert({
        id,
        employee_id: employeeId,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        personal_email: data.personal_email,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        blood_group: data.blood_group,
        address: data.address,
        city: data.city,
        state: data.state,
        postal_code: data.postal_code,
        country: data.country,
        pan: data.pan,
        aadhar: data.aadhar,
        department_id: data.department_id,
        designation_id: data.designation_id,
        reporting_manager_id: data.reporting_manager_id,
        date_of_joining: data.date_of_joining,
        employment_type: data.employment_type,
        status: 'active',
      })
      .returning('*');

    return employee;
  }

  async getEmployee(id: string): Promise<Employee | null> {
    return this.db('employees').where('id', id).first();
  }

  async getEmployeeByEmployeeId(employeeId: string): Promise<Employee | null> {
    return this.db('employees').where('employee_id', employeeId).first();
  }

  async getEmployeeByEmail(email: string): Promise<Employee | null> {
    return this.db('employees').where('email', email).first();
  }

  async updateEmployee(id: string, data: UpdateEmployeeDTO): Promise<Employee> {
    const [employee] = await this.db('employees')
      .where('id', id)
      .update({
        ...data,
        updated_at: this.db.fn.now(),
      })
      .returning('*');

    return employee;
  }

  async updateEmployeeStatus(id: string, status: Employee['status']): Promise<Employee> {
    const [employee] = await this.db('employees')
      .where('id', id)
      .update({
        status,
        updated_at: this.db.fn.now(),
      })
      .returning('*');

    return employee;
  }

  async searchEmployees(filters: EmployeeFilters): Promise<Employee[]> {
    let query = this.db('employees');

    if (filters.department_id) {
      query = query.where('department_id', filters.department_id);
    }

    if (filters.designation_id) {
      query = query.where('designation_id', filters.designation_id);
    }

    if (filters.status) {
      query = query.where('status', filters.status);
    }

    if (filters.employment_type) {
      query = query.where('employment_type', filters.employment_type);
    }

    if (filters.search) {
      query = query.where((q) => {
        q.whereRaw('LOWER(first_name) LIKE ?', [`%${filters.search!.toLowerCase()}%`])
          .orWhereRaw('LOWER(last_name) LIKE ?', [`%${filters.search!.toLowerCase()}%`])
          .orWhereRaw('LOWER(email) LIKE ?', [`%${filters.search!.toLowerCase()}%`])
          .orWhere('employee_id', filters.search!);
      });
    }

    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    return query.limit(limit).offset(offset).orderBy('created_at', 'desc');
  }

  async getAllEmployees(limit: number = 50, offset: number = 0): Promise<Employee[]> {
    return this.db('employees')
      .limit(limit)
      .offset(offset)
      .orderBy('created_at', 'desc');
  }

  async getEmployeeCount(filters?: EmployeeFilters): Promise<number> {
    let query = this.db('employees');

    if (filters) {
      if (filters.department_id) {
        query = query.where('department_id', filters.department_id);
      }

      if (filters.designation_id) {
        query = query.where('designation_id', filters.designation_id);
      }

      if (filters.status) {
        query = query.where('status', filters.status);
      }

      if (filters.employment_type) {
        query = query.where('employment_type', filters.employment_type);
      }

      if (filters.search) {
        query = query.where((q) => {
          q.whereRaw('LOWER(first_name) LIKE ?', [`%${filters.search!.toLowerCase()}%`])
            .orWhereRaw('LOWER(last_name) LIKE ?', [`%${filters.search!.toLowerCase()}%`])
            .orWhereRaw('LOWER(email) LIKE ?', [`%${filters.search!.toLowerCase()}%`])
            .orWhere('employee_id', filters.search!);
        });
      }
    }

    const result = await query.count('id as count').first();
    return Number(result?.['count'] || 0);
  }

  // Emergency Contacts
  async addEmergencyContact(employeeId: string, data: CreateEmergencyContactDTO): Promise<EmergencyContact> {
    const id = uuidv4();

    const [contact] = await this.db('emergency_contacts')
      .insert({
        id,
        employee_id: employeeId,
        name: data.name,
        relationship: data.relationship,
        phone: data.phone,
        email: data.email,
        address: data.address,
        priority: data.priority || 1,
      })
      .returning('*');

    return contact;
  }

  async getEmergencyContacts(employeeId: string): Promise<EmergencyContact[]> {
    return this.db('emergency_contacts')
      .where('employee_id', employeeId)
      .orderBy('priority', 'asc');
  }

  async updateEmergencyContact(id: string, data: UpdateEmergencyContactDTO): Promise<EmergencyContact> {
    const [contact] = await this.db('emergency_contacts')
      .where('id', id)
      .update({
        ...data,
        updated_at: this.db.fn.now(),
      })
      .returning('*');

    return contact;
  }

  async deleteEmergencyContact(id: string): Promise<void> {
    await this.db('emergency_contacts').where('id', id).delete();
  }

  async getEmergencyContactCount(employeeId: string): Promise<number> {
    const result = await this.db('emergency_contacts')
      .where('employee_id', employeeId)
      .count('id as count')
      .first();
    return Number(result?.['count'] || 0);
  }

  // Employment History
  async addEmploymentHistory(employeeId: string, data: Omit<EmploymentHistory, 'id' | 'created_at' | 'employee_id'>): Promise<EmploymentHistory> {
    const id = uuidv4();

    const [history] = await this.db('employment_history')
      .insert({
        id,
        employee_id: employeeId,
        designation_id: data.designation_id,
        department_id: data.department_id,
        from_date: data.from_date,
        to_date: data.to_date,
        reason: data.reason,
      })
      .returning('*');

    return history;
  }

  async getEmploymentHistory(employeeId: string): Promise<EmploymentHistory[]> {
    return this.db('employment_history')
      .where('employee_id', employeeId)
      .orderBy('from_date', 'desc');
  }
}
