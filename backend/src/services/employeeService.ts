import { Knex } from 'knex';
import { EmployeeRepository } from '../repositories/employeeRepository';
import { Employee, CreateEmployeeDTO, UpdateEmployeeDTO, EmployeeFilters, CreateEmergencyContactDTO, UpdateEmergencyContactDTO } from '../types/employee';

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
  async addEmergencyContact(employeeId: string, data: CreateEmergencyContactDTO): Promise<any> {
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

    return this.employeeRepository.addEmergencyContact(employeeId, data);
  }

  async getEmergencyContacts(employeeId: string): Promise<any[]> {
    const employee = await this.employeeRepository.getEmployee(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    return this.employeeRepository.getEmergencyContacts(employeeId);
  }

  async updateEmergencyContact(contactId: string, data: UpdateEmergencyContactDTO): Promise<any> {
    return this.employeeRepository.updateEmergencyContact(contactId, data);
  }

  async deleteEmergencyContact(contactId: string): Promise<void> {
    return this.employeeRepository.deleteEmergencyContact(contactId);
  }

  // Employment History
  async addEmploymentHistory(employeeId: string, data: any): Promise<any> {
    const employee = await this.employeeRepository.getEmployee(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    if (!data.from_date) {
      throw new Error('Missing required field: from_date');
    }

    return this.employeeRepository.addEmploymentHistory(employeeId, data);
  }

  async getEmploymentHistory(employeeId: string): Promise<any[]> {
    const employee = await this.employeeRepository.getEmployee(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    return this.employeeRepository.getEmploymentHistory(employeeId);
  }
}
