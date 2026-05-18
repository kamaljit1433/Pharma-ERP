import { Knex } from 'knex';
import { EmployeeRepository } from '../repositories/employeeRepository';
import { AuthRepository } from '../repositories/authRepository';
import {
  Employee,
  CreateEmployeeDTO,
  UpdateEmployeeDTO,
  EmployeeFilters,
  EmergencyContact,
  EmploymentHistory,
  CreateEmergencyContactDTO,
  UpdateEmergencyContactDTO,
  CreateEmploymentHistoryDTO,
} from '../types/employee';
import { isValidEmail, isValidPhone } from '../utils/validation';
import { logAuditEvent } from '../utils/auditLog';
import { AppError } from '../middleware/errorHandler';
import { hashPassword, generatePassword } from '../utils/password';
import { emailService } from './emailService';
import logger from '../utils/logger';

const LOGIN_URL = `${process.env['FRONTEND_URL'] || 'http://localhost:5173'}/login`;

export class EmployeeService {
  private employeeRepository: EmployeeRepository;
  private authRepository: AuthRepository;

  constructor(private db: Knex) {
    this.employeeRepository = new EmployeeRepository(db);
    this.authRepository = new AuthRepository(db);
  }

  async createEmployee(data: CreateEmployeeDTO): Promise<Employee> {
    // Validate required fields
    if (!data.first_name || !data.last_name || !data.email || !data.date_of_joining) {
      throw new AppError('Missing required fields: first_name, last_name, email, date_of_joining', 400);
    }

    // Validate email format
    if (!isValidEmail(data.email)) {
      throw new AppError('Invalid email format', 400);
    }

    // Check if email already exists among active (non-archived) employees
    const existingEmployee = await this.employeeRepository.getEmployeeByEmail(data.email);
    if (existingEmployee) {
      throw new AppError('Employee with this email already exists', 409);
    }

    let employee: Employee;
    try {
      employee = await this.employeeRepository.createEmployee(data);
    } catch (err: any) {
      // PostgreSQL unique constraint violation — covers archived employees too
      if (err?.code === '23505' && err?.constraint === 'employees_email_unique') {
        throw new AppError('Employee with this email already exists', 409);
      }
      throw err;
    }

    // Create login credentials and send welcome email
    await this.provisionUserAccount(employee);

    return employee;
  }

  private async provisionUserAccount(employee: Employee): Promise<void> {
    const employeeName = `${employee.first_name} ${employee.last_name}`;

    // Generate and hash a temporary password
    const temporaryPassword = generatePassword();
    const passwordHash = await hashPassword(temporaryPassword);

    // Create the user account (best-effort — don't fail employee creation if this errors)
    try {
      const existingUser = await this.authRepository.findByEmployeeId(employee.employee_id);
      if (!existingUser) {
        await this.authRepository.createUser({
          employeeId: employee.employee_id,
          email: employee.email,
          passwordHash,
        });
      }
    } catch (err) {
      logger.error('Failed to create user account for employee', {
        employeeId: employee.employee_id,
        error: err instanceof Error ? err.message : String(err),
      });
      return; // skip email if account creation failed
    }

    // Send credentials to work email
    const recipients: string[] = [employee.email];

    // Also send to personal email if provided
    if (employee.personal_email) {
      recipients.push(employee.personal_email);
    }

    for (const recipient of recipients) {
      try {
        await emailService.sendAccountCredentialsEmail(
          recipient,
          employeeName,
          employee.employee_id,
          employee.email,
          temporaryPassword,
          LOGIN_URL
        );
      } catch (err) {
        logger.error('Failed to send credentials email', {
          recipient,
          employeeId: employee.employee_id,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }

  async getEmployee(id: string): Promise<Employee> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const employee = isUuid
      ? await this.employeeRepository.getEmployee(id)
      : await this.employeeRepository.getEmployeeByEmployeeId(id);
    if (!employee) {
      throw new Error('Employee not found');
    }
    return employee;
  }

  async updateEmployee(id: string, data: UpdateEmployeeDTO): Promise<Employee> {
    const employee = await this.employeeRepository.getEmployee(id);
    if (!employee) {
      throw new Error('Employee not found');
    }

    return this.employeeRepository.updateEmployee(id, data);
  }

  async updateEmployeeStatus(id: string, status: Employee['status']): Promise<Employee> {
    const employee = await this.employeeRepository.getEmployee(id);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Validate status transition
    const validStatuses = ['active', 'on_leave', 'suspended', 'resigned', 'terminated'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Allowed values: ${validStatuses.join(', ')}`);
    }

    const updatedEmployee = await this.employeeRepository.updateEmployeeStatus(id, status);

    // Log the status change in audit logs
    await logAuditEvent(
      this.db,
      'employee',
      id,
      'employee_status_updated',
      {
        old_status: employee.status,
        new_status: status,
        timestamp: new Date().toISOString(),
      }
    );

    return updatedEmployee;
  }

  async searchEmployees(filters: EmployeeFilters): Promise<Employee[]> {
    return this.employeeRepository.searchEmployees(filters);
  }

  async getAllEmployees(limit: number = 50, offset: number = 0): Promise<Employee[]> {
    return this.employeeRepository.getAllEmployees(limit, offset);
  }

  async getEmployeeCount(filters?: EmployeeFilters): Promise<number> {
    return this.employeeRepository.getEmployeeCount(filters);
  }

  // Emergency Contact Management
  async addEmergencyContact(
    employeeId: string,
    data: CreateEmergencyContactDTO
  ): Promise<EmergencyContact> {
    const employee = await this.employeeRepository.getEmployee(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Validate: minimum 1, maximum 3 emergency contacts
    const contactCount = await this.employeeRepository.getEmergencyContactCount(employeeId);
    if (contactCount >= 3) {
      throw new Error('Maximum 3 emergency contacts allowed');
    }

    if (!data.name || !data.relationship || !data.phone) {
      throw new Error('Missing required fields: name, relationship, phone');
    }

    // Validate phone format
    if (!isValidPhone(data.phone)) {
      throw new Error('Invalid phone number format');
    }

    return this.employeeRepository.addEmergencyContact(employeeId, data);
  }

  async getEmergencyContacts(employeeId: string): Promise<EmergencyContact[]> {
    const employee = await this.employeeRepository.getEmployee(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    return this.employeeRepository.getEmergencyContacts(employeeId);
  }

  async updateEmergencyContact(
    employeeId: string,
    contactId: string,
    data: UpdateEmergencyContactDTO
  ): Promise<EmergencyContact> {
    // Verify contact exists and belongs to the specified employee
    const contact = await this.employeeRepository.getEmergencyContactById(contactId);
    if (!contact) {
      throw new Error('Emergency contact not found');
    }
    if (contact.employee_id !== employeeId) {
      throw new Error('Emergency contact does not belong to the specified employee');
    }

    return this.employeeRepository.updateEmergencyContact(contactId, data);
  }

  async deleteEmergencyContact(employeeId: string, contactId: string): Promise<void> {
    // Verify contact exists and belongs to the specified employee
    const contact = await this.employeeRepository.getEmergencyContactById(contactId);
    if (!contact) {
      throw new Error('Emergency contact not found');
    }
    if (contact.employee_id !== employeeId) {
      throw new Error('Emergency contact does not belong to the specified employee');
    }

    return this.employeeRepository.deleteEmergencyContact(contactId);
  }

  async archiveEmployee(id: string, reason: string = 'Archived by admin'): Promise<void> {
    const employee = await this.employeeRepository.getEmployee(id);
    if (!employee) {
      throw new Error('Employee not found');
    }

    const isArchived = await this.employeeRepository.isEmployeeArchived(id);
    if (isArchived) {
      throw new Error('Employee is already archived');
    }

    await this.employeeRepository.archiveEmployee(id, reason);

    await logAuditEvent(
      this.db,
      'employee',
      id,
      'employee_archived',
      { reason, timestamp: new Date().toISOString() }
    );
  }

  // Employment History
  async addEmploymentHistory(
    employeeId: string,
    data: CreateEmploymentHistoryDTO
  ): Promise<EmploymentHistory> {
    const employee = await this.employeeRepository.getEmployee(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    if (!data.from_date) {
      throw new Error('Missing required field: from_date');
    }

    return this.employeeRepository.addEmploymentHistory(employeeId, data);
  }

  async getEmploymentHistory(employeeId: string): Promise<EmploymentHistory[]> {
    const employee = await this.employeeRepository.getEmployee(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    return this.employeeRepository.getEmploymentHistory(employeeId);
  }
}
