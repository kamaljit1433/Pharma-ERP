import { Knex } from 'knex';
import { BaseFactory } from './base.factory';

export interface Department {
  id: string;
  name: string;
  parent_department_id: string | null;
  head_employee_id: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Factory for generating Department test data
 */
export class DepartmentFactory extends BaseFactory<Department> {
  private static counter = 0;

  constructor(knex: Knex) {
    super(knex, 'departments');
  }

  /**
   * Create a single department
   */
  async create(overrides?: Partial<Department>): Promise<Department> {
    DepartmentFactory.counter++;
    const data: any = {
      id: this.generateId(),
      name: `Department ${DepartmentFactory.counter}`,
      parent_department_id: null,
      head_employee_id: null,
      created_at: new Date(),
      updated_at: new Date(),
      ...overrides,
    };

    return this.insert(data);
  }

  /**
   * Create a department with a parent
   */
  async createWithParent(parentId: string, overrides?: Partial<Department>): Promise<Department> {
    return this.create({
      parent_department_id: parentId,
      ...overrides,
    });
  }

  /**
   * Create a department hierarchy (parent + children)
   */
  async createHierarchy(childCount: number = 2): Promise<{ parent: Department; children: Department[] }> {
    const parent = await this.create();
    const children: Department[] = [];

    for (let i = 0; i < childCount; i++) {
      const child = await this.createWithParent(parent.id);
      children.push(child);
    }

    return { parent, children };
  }
}
