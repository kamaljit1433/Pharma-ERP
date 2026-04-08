import { Knex } from 'knex';
import { OfferLetter, CreateOfferLetterDTO } from '../types/recruitment';
import { v4 as uuidv4 } from 'uuid';

export class OfferLetterRepository {
  constructor(private knex: Knex) {}

  async createOfferLetter(data: CreateOfferLetterDTO): Promise<OfferLetter> {
    const now = new Date();
    const offerLetter = {
      id: uuidv4(),
      applicant_id: data.applicant_id,
      position: data.position,
      department: data.department,
      salary: data.salary,
      currency: data.currency,
      start_date: data.start_date,
      terms: data.terms,
      status: data.status ?? 'draft',
      created_at: now,
      updated_at: now,
    };

    await this.knex('offer_letters').insert(offerLetter);
    return offerLetter as OfferLetter;
  }

  async getOfferLetterById(id: string): Promise<OfferLetter | null> {
    const row = await this.knex('offer_letters').where({ id }).first();
    return row ? this.mapToOfferLetter(row) : null;
  }

  async getOfferLetterByApplicant(applicantId: string): Promise<OfferLetter | null> {
    const row = await this.knex('offer_letters').where({ applicant_id: applicantId }).first();
    return row ? this.mapToOfferLetter(row) : null;
  }

  async updateOfferLetter(id: string, data: Partial<OfferLetter>): Promise<OfferLetter> {
    await this.knex('offer_letters').where({ id }).update({
      ...data,
      updated_at: new Date(),
    });

    const offerLetter = await this.getOfferLetterById(id);
    if (!offerLetter) throw new Error('Offer letter not found');
    return offerLetter;
  }

  async updateOfferLetterStatus(
    id: string,
    status: 'draft' | 'sent' | 'signed' | 'accepted' | 'rejected'
  ): Promise<OfferLetter> {
    return this.updateOfferLetter(id, { status });
  }

  async deleteOfferLetter(id: string): Promise<void> {
    await this.knex('offer_letters').where({ id }).del();
  }

  async getOfferLettersByStatus(status: string): Promise<OfferLetter[]> {
    const rows = await this.knex('offer_letters').where({ status });
    return rows.map((r: any) => this.mapToOfferLetter(r));
  }

  private mapToOfferLetter(row: any): OfferLetter {
    return {
      id: row.id,
      applicant_id: row.applicant_id,
      position: row.position,
      department: row.department,
      salary: parseFloat(row.salary),
      currency: row.currency,
      start_date: new Date(row.start_date),
      terms: row.terms,
      status: row.status,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }
}
