import { Knex } from 'knex';
import { SupplierBuyer, CreateSupplierBuyerDTO, UpdateSupplierBuyerDTO } from '../types/supplierBuyer';
import { v4 as uuidv4 } from 'uuid';

export class SupplierBuyerRepository {
  constructor(private db: Knex) {}

  async createSupplierBuyer(employeeId: string, data: CreateSupplierBuyerDTO): Promise<SupplierBuyer> {
    const id = uuidv4();

    const [supplierBuyer] = await this.db('suppliers_buyers')
      .insert({
        id,
        employee_id: employeeId,
        name: data.name,
        type: data.type,
        contact_person: data.contact_person,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        notes: data.notes,
      })
      .returning('*');

    return supplierBuyer;
  }

  async getSupplierBuyerById(id: string): Promise<SupplierBuyer | null> {
    return this.db('suppliers_buyers').where('id', id).first();
  }

  async getSupplierBuyersByEmployee(employeeId: string): Promise<SupplierBuyer[]> {
    return this.db('suppliers_buyers')
      .where('employee_id', employeeId)
      .orderBy('created_at', 'desc');
  }

  async getSupplierBuyersByType(employeeId: string, type: 'supplier' | 'buyer'): Promise<SupplierBuyer[]> {
    return this.db('suppliers_buyers')
      .where('employee_id', employeeId)
      .where('type', type)
      .orderBy('created_at', 'desc');
  }

  async updateSupplierBuyer(id: string, data: UpdateSupplierBuyerDTO): Promise<SupplierBuyer> {
    const [supplierBuyer] = await this.db('suppliers_buyers')
      .where('id', id)
      .update({
        ...data,
        updated_at: this.db.fn.now(),
      })
      .returning('*');

    return supplierBuyer;
  }

  async deleteSupplierBuyer(id: string): Promise<void> {
    await this.db('suppliers_buyers').where('id', id).delete();
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
