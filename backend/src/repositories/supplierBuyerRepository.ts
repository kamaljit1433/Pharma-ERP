import { Knex } from 'knex';
import { SupplierBuyer, CreateSupplierBuyerDTO, UpdateSupplierBuyerDTO } from '../types/supplierBuyer';
import { v4 as uuidv4 } from 'uuid';

export class SupplierBuyerRepository {
  constructor(private db: Knex) {}

  async createRecord(data: CreateSupplierBuyerDTO & { employee_id: string }): Promise<SupplierBuyer> {
    const id = uuidv4();

    const [row] = await this.db('suppliers_buyers')
      .insert({
        id,
        employee_id: data.employee_id,
        name: data.name,
        type: data.type,
        contact_person: data.contact_person,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        postal_code: data.postal_code,
        notes: data.notes,
      })
      .returning('*');

    return row;
  }

  async createSupplierBuyer(employeeId: string, data: CreateSupplierBuyerDTO): Promise<SupplierBuyer> {
    return this.createRecord({ ...data, employee_id: employeeId });
  }

  async getRecordById(id: string): Promise<SupplierBuyer | null> {
    const row = await this.db('suppliers_buyers').where('id', id).first();
    return row ?? null;
  }

  async getSupplierBuyerById(id: string): Promise<SupplierBuyer | null> {
    return this.getRecordById(id);
  }

  async getRecordsByEmployee(employeeId: string): Promise<SupplierBuyer[]> {
    return this.db('suppliers_buyers')
      .where('employee_id', employeeId)
      .orderBy('created_at', 'desc');
  }

  async getSupplierBuyersByEmployee(employeeId: string): Promise<SupplierBuyer[]> {
    return this.getRecordsByEmployee(employeeId);
  }

  async getRecordsByType(type: 'supplier' | 'buyer'): Promise<SupplierBuyer[]> {
    return this.db('suppliers_buyers')
      .where('type', type)
      .orderBy('created_at', 'desc');
  }

  async getSupplierBuyersByType(employeeId: string, type: 'supplier' | 'buyer'): Promise<SupplierBuyer[]> {
    return this.db('suppliers_buyers')
      .where('employee_id', employeeId)
      .where('type', type)
      .orderBy('created_at', 'desc');
  }

  async updateRecord(id: string, data: UpdateSupplierBuyerDTO): Promise<SupplierBuyer> {
    const [row] = await this.db('suppliers_buyers')
      .where('id', id)
      .update({ ...data, updated_at: this.db.fn.now() })
      .returning('*');

    return row;
  }

  async updateSupplierBuyer(id: string, data: UpdateSupplierBuyerDTO): Promise<SupplierBuyer> {
    return this.updateRecord(id, data);
  }

  async deleteRecord(id: string): Promise<void> {
    await this.db('suppliers_buyers').where('id', id).delete();
  }

  async deleteSupplierBuyer(id: string): Promise<void> {
    return this.deleteRecord(id);
  }

  async searchSupplierBuyers(employeeId: string, searchTerm: string): Promise<SupplierBuyer[]> {
    return this.db('suppliers_buyers')
      .where('employee_id', employeeId)
      .where((q) => {
        q.whereRaw('LOWER(name) LIKE ?', [`%${searchTerm.toLowerCase()}%`])
          .orWhereRaw('LOWER(contact_person) LIKE ?', [`%${searchTerm.toLowerCase()}%`])
          .orWhereRaw('LOWER(email) LIKE ?', [`%${searchTerm.toLowerCase()}%`])
          .orWhereRaw('LOWER(phone) LIKE ?', [`%${searchTerm.toLowerCase()}%`]);
      })
      .orderBy('created_at', 'desc');
  }

  async getSupplierBuyerCount(employeeId: string): Promise<number> {
    const result = await this.db('suppliers_buyers')
      .where('employee_id', employeeId)
      .count('id as count')
      .first();
    return Number(result?.['count'] || 0);
  }
}
