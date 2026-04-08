import { Knex } from 'knex';
import {
  Employee,
  CreateEmployeeDTO,
  UpdateEmployeeDTO,
  EmployeeFilters,
  EmergencyContact,
  CreateEmergencyContactDTO,
  UpdateEmergencyContactDTO,
  EmploymentHistory,
  CreateEmploymentHistoryDTO,
} from '../types/employee';
import { v4 as uuidv4 } from 'uuid';

/** Escape PostgreSQL LIKE special characters to prevent unintended wildcard matches. */
function escapeLike(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

export class EmployeeRepository {
  constructor(private db: Knex) {}

  async createEmployee(data: CreateEmployeeDTO): Promise<Employee> {
    // Use a UUID prefix for employee_id to avoid timestamp collisions under concurrency.
    const employeeId = `EMP-${uuidv4().slice(0, 8).toUpperCase()}`;
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

    if (!employee) {
      throw new Error('Failed to create employee record');
    }

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
    const result = await this.db('employees')
      .where('id', id)
      .update({ ...data, updated_at: this.db.fn.now() })
      .returning('*');

    if (!result.length) {
      throw new Error('Employee not found or update failed');
    }

    return result[0];
  }

  async updateEmployeeStatus(id: string, status: Employee['status']): Promise<Employee> {
    const result = await this.db('employees')
      .where('id', id)
      .update({ status, updated_at: this.db.fn.now() })
      .returning('*');

    if (!result.length) {
      throw new Error('Employee not found or status update failed');
    }

    return result[0];
  }

  async searchEmployees(filters: EmployeeFilters): Promise<Employee[]> {
    let query = this.db('employees').whereNull('archived_at');

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
      const safe = escapeLike(filters.search.toLowerCase());
      query = query.where((q) => {
        q.whereRaw('LOWER(first_name) LIKE ? ESCAPE \'\\\'', [`%${safe}%`])
          .orWhereRaw('LOWER(last_name) LIKE ? ESCAPE \'\\\'', [`%${safe}%`])
          .orWhereRaw('LOWER(email) LIKE ? ESCAPE \'\\\'', [`%${safe}%`])
          .orWhere('employee_id', filters.search!);
      });
    }

    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    return query.limit(limit).offset(offset).orderBy('created_at', 'desc');
  }

  async getAllEmployees(limit: number = 50, offset: number = 0): Promise<Employee[]> {
    return this.db('employees')
      .whereNull('archived_at')
      .limit(limit)
      .offset(offset)
      .orderBy('created_at', 'desc');
  }

  async getEmployeeCount(filters?: EmployeeFilters): Promise<number> {
    let query = this.db('employees').whereNull('archived_at');

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
        const safe = escapeLike(filters.search.toLowerCase());
        query = query.where((q) => {
          q.whereRaw('LOWER(first_name) LIKE ? ESCAPE \'\\\'', [`%${safe}%`])
            .orWhereRaw('LOWER(last_name) LIKE ? ESCAPE \'\\\'', [`%${safe}%`])
            .orWhereRaw('LOWER(email) LIKE ? ESCAPE \'\\\'', [`%${safe}%`])
            .orWhere('employee_id', filters.search!);
        });
      }
    }

    const result = await query.count('id as count').first();
    return Number(result?.['count'] || 0);
  }

  // Emergency Contacts
  async addEmergencyContact(
    employeeId: string,
    data: CreateEmergencyContactDTO
  ): Promise<EmergencyContact> {
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

  async getEmergencyContactById(id: string): Promise<EmergencyContact | null> {
    return this.db('emergency_contacts').where('id', id).first() ?? null;
  }

  async updateEmergencyContact(
    id: string,
    data: UpdateEmergencyContactDTO
  ): Promise<EmergencyContact> {
    const result = await this.db('emergency_contacts')
      .where('id', id)
      .update({ ...data, updated_at: this.db.fn.now() })
      .returning('*');

    if (!result.length) {
      throw new Error('Emergency contact not found or update failed');
    }

    return result[0];
  }

  async deleteEmergencyContact(id: string): Promise<void> {
    const deleted = await this.db('emergency_contacts').where('id', id).delete();
    if (!deleted) {
      throw new Error('Emergency contact not found');
    }
  }

  async getEmergencyContactCount(employeeId: string): Promise<number> {
    const result = await this.db('emergency_contacts')
      .where('employee_id', employeeId)
      .count('id as count')
      .first();
    return Number(result?.['count'] || 0);
  }

  // Employment History
  async addEmploymentHistory(
    employeeId: string,
    data: CreateEmploymentHistoryDTO
  ): Promise<EmploymentHistory> {
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

  // Archiving
  async archiveEmployee(id: string, reason: string): Promise<Employee> {
    const result = await this.db('employees')
      .where('id', id)
      .update({
        archived_at: this.db.fn.now(),
        archive_reason: reason,
        updated_at: this.db.fn.now(),
      })
      .returning('*');

    if (!result.length) {
      throw new Error('Employee not found or archive failed');
    }

    return result[0];
  }

  async getArchivedEmployees(limit: number = 50, offset: number = 0): Promise<Employee[]> {
    return this.db('employees')
      .whereNotNull('archived_at')
      .limit(limit)
      .offset(offset)
      .orderBy('archived_at', 'desc');
  }

  async getArchivedEmployeeCount(): Promise<number> {
    const result = await this.db('employees')
      .whereNotNull('archived_at')
      .count('id as count')
      .first();
    return Number(result?.['count'] || 0);
  }

  async isEmployeeArchived(id: string): Promise<boolean> {
    const employee = await this.db('employees')
      .where('id', id)
      .whereNotNull('archived_at')
      .first();
    return !!employee;
  }
}
