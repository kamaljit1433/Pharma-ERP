import { Knex } from 'knex';
import { BaseFactory } from './base.factory';

export interface Designation {
  id: string;
  title: string;
  grade: string;
  department_id: string;
  level: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Factory for generating Designation test data
 */
export class DesignationFactory extends BaseFactory<Designation> {
  private static counter = 0;
  private static titles = [
    'Software Engineer',
    'Senior Engineer',
    'Engineering Manager',
    'Product Manager',
    'HR Manager',
    'Finance Manager',
    'Accountant',
    'Analyst',
    'Coordinator',
    'Executive',
  ];

  constructor(knex: Knex) {
    super(knex, 'designations');
  }

  /**
   * Create a single designation
   */
  async create(overrides?: Partial<Designation>): Promise<Designation> {
    DesignationFactory.counter++;
    const titleIndex = DesignationFactory.counter % DesignationFactory.titles.length;
    const title = DesignationFactory.titles[titleIndex];
    const level = Math.floor(DesignationFactory.counter / DesignationFactory.titles.length) + 1;

    const data: any = {
      id: this.generateId(),
      title,
      grade: `G${level}`,
      department_id: this.generateId(), // Will be overridden
      level,
      created_at: new Date(),
      updated_at: new Date(),
      ...overrides,
    };

    return this.insert(data);
  }

  /**
   * Create a designation for a specific department
   */
  async createForDepartment(departmentId: string, overrides?: Partial<Designation>): Promise<Designation> {
    return this.create({
      department_id: departmentId,
      ...overrides,
    });
  }

  /**
   * Create multiple designations for a department
   */
  async createManyForDepartment(departmentId: string, count: number): Promise<Designation[]> {
    const designations: Designation[] = [];
    for (let i = 0; i < count; i++) {
      designations.push(await this.createForDepartment(departmentId));
    }
    return designations;
  }
}
