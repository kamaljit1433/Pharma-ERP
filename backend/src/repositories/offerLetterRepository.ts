import { Knex } from 'knex';
import { OfferLetter, CreateOfferLetterDTO } from '../types/recruitment';
import { v4 as uuidv4 } from 'uuid';

export class OfferLetterRepository {
  constructor(private knex: Knex) {}

  async createOfferLetter(data: CreateOfferLetterDTO): Promise<OfferLetter> {
    const offerLetter: OfferLetter = {
      id: uuidv4(),
      applicant_id: data.applicant_id,
      position: data.position,
      department: data.department,
      salary: data.salary,
      start_date: data.start_date,
      terms: data.terms,
      status: 'Draft',
      created_at: new Date(),
      updated_at: new Date(),
    };

    await this.knex('offer_letters').insert(offerLetter);
    return offerLetter;
  }

  async getOfferLetterById(id: string): Promise<OfferLetter | null> {
    return this.knex('offer_letters').where({ id }).first();
  }

  async getOfferLetterByApplicant(applicantId: string): Promise<OfferLetter | null> {
    return this.knex('offer_letters').where({ applicant_id: applicantId }).first();
  }

  async updateOfferLetterStatus(id: string, status: 'Draft' | 'Sent' | 'Signed' | 'Accepted' | 'Rejected'): Promise<OfferLetter> {
    await this.knex('offer_letters').where({ id }).update({
      status,
      updated_at: new Date(),
    });

    const offerLetter = await this.getOfferLetterById(id);
    if (!offerLetter) throw new Error('Offer letter not found');
    return offerLetter;
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

  async getOfferLettersByStatus(status: string): Promise<OfferLetter[]> {
    return this.knex('offer_letters').where({ status });
  }
}
