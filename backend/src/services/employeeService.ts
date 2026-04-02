import { Knex } from 'knex';
import { EmployeeRepository } from '../repositories/employeeRepository';
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

export class EmployeeService {
  private employeeRepository: EmployeeRepository;

  constructor(db: Knex) {
    this.employeeRepository = new EmployeeRepository(db);
  }

  async createEmployee(data: CreateEmployeeDTO): Promise<Employee> {
    // Validate required fields
    if (!data.first_name || !data.last_name || !data.email || !data.date_of_joining) {
      throw new Error('Missing required fields: first_name, last_name, email, date_of_joining');
    }

    // Validate email format
    if (!isValidEmail(data.email)) {
      throw new Error('Invalid email format');
    }

    // Check if email already exists
    const existingEmployee = await this.employeeRepository.getEmployeeByEmail(data.email);
    if (existingEmployee) {
      throw new Error('Employee with this email already exists');
    }

    return this.employeeRepository.createEmployee(data);
  }

  async getEmployee(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.getEmployee(id);
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

    return this.employeeRepository.updateEmployeeStatus(id, status);
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
