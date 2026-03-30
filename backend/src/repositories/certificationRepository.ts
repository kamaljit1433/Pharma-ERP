import { Knex } from 'knex';
import { Certification, CreateCertificationDTO, UpdateCertificationDTO } from '../types/training';
import { v4 as uuidv4 } from 'uuid';

export class CertificationRepository {
  constructor(private db: Knex) {}

  async createCertification(data: CreateCertificationDTO): Promise<Certification> {
    const id = uuidv4();

    const [certification] = await this.db('certifications')
      .insert({
        id,
        employee_id: data.employee_id,
        name: data.name,
        issuing_organization: data.issuing_organization,
        certificate_number: data.certificate_number,
        issue_date: data.issue_date,
        expiry_date: data.expiry_date,
        certificate_url: data.certificate_url,
        is_active: true,
      })
      .returning('*');

    return this.mapToCertification(certification);
  }

  async getCertificationById(id: string): Promise<Certification | null> {
    const certification = await this.db('certifications').where('id', id).first();
    return certification ? this.mapToCertification(certification) : null;
  }

  async getEmployeeCertifications(employeeId: string): Promise<Certification[]> {
    const certifications = await this.db('certifications')
      .where('employee_id', employeeId)
      .where('is_active', true)
      .orderBy('issue_date', 'desc');

    return certifications.map((c) => this.mapToCertification(c));
  }

  async getExpiringCertifications(daysBeforeExpiry: number = 30): Promise<Certification[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysBeforeExpiry);

    const certifications = await this.db('certifications')
      .where('is_active', true)
      .whereNotNull('expiry_date')
      .whereBetween('expiry_date', [new Date(), futureDate])
      .orderBy('expiry_date', 'asc');

    return certifications.map((c) => this.mapToCertification(c));
  }

  async getExpiredCertifications(): Promise<Certification[]> {
    const certifications = await this.db('certifications')
      .where('is_active', true)
      .whereNotNull('expiry_date')
      .where('expiry_date', '<', new Date())
      .orderBy('expiry_date', 'desc');

    return certifications.map((c) => this.mapToCertification(c));
  }

  async updateCertification(id: string, data: UpdateCertificationDTO): Promise<Certification> {
    const [certification] = await this.db('certifications')
      .where('id', id)
      .update({
        ...data,
        updated_at: this.db.fn.now(),
      })
      .returning('*');

    return this.mapToCertification(certification);
  }

  async deleteCertification(id: string): Promise<void> {
    await this.db('certifications').where('id', id).delete();
  }

  private mapToCertification(row: any): Certification {
    return {
      id: row.id,
      employee_id: row.employee_id,
      name: row.name,
      issuing_organization: row.issuing_organization,
      certificate_number: row.certificate_number,
      issue_date: new Date(row.issue_date),
      expiry_date: row.expiry_date ? new Date(row.expiry_date) : undefined,
      certificate_url: row.certificate_url,
      is_active: row.is_active,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    } as Certification;
  }
}
