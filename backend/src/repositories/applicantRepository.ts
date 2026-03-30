import { Knex } from 'knex';
import { Applicant, CreateApplicantDTO, UpdateApplicantDTO } from '../types/recruitment';
import { v4 as uuidv4 } from 'uuid';

export class ApplicantRepository {
  constructor(private knex: Knex) {}

  async createApplicant(jobPostingId: string, data: CreateApplicantDTO): Promise<Applicant> {
    // Parse name into first_name and last_name
    const nameParts = data.name.split(' ');
    const first_name = nameParts[0] || '';
    const last_name = nameParts.slice(1).join(' ') || '';

    const applicant: Applicant = {
      id: uuidv4(),
      job_posting_id: jobPostingId,
      first_name,
      last_name,
      email: data.email,
      phone: data.contact_number,
      resume_url: data.resume_url,
      stage: 'applied',
      created_at: new Date(),
      updated_at: new Date(),
    };

    await this.knex('applicants').insert(applicant);
    return applicant;
  }

  async getApplicantById(id: string): Promise<Applicant | null> {
    return this.knex('applicants').where({ id }).first();
  }

  async getApplicantsByJobPosting(jobPostingId: string): Promise<Applicant[]> {
    return this.knex('applicants').where({ job_posting_id: jobPostingId });
  }

  async updateApplicant(id: string, data: UpdateApplicantDTO): Promise<Applicant> {
    const updated = {
      ...data,
      updated_at: new Date(),
    };

    await this.knex('applicants').where({ id }).update(updated);
    const applicant = await this.getApplicantById(id);
    if (!applicant) throw new Error('Applicant not found');
    return applicant;
  }

  async getApplicantsByStage(stage: string): Promise<Applicant[]> {
    return this.knex('applicants').where({ stage });
  }

  async searchApplicants(filters: {
    jobPostingId?: string;
    stage?: string;
    search?: string;
  }): Promise<Applicant[]> {
    let query = this.knex('applicants');

    if (filters.jobPostingId) {
      query = query.where({ job_posting_id: filters.jobPostingId });
    }

    if (filters.stage) {
      query = query.where({ stage: filters.stage });
    }

    if (filters.search) {
      query = query.where((builder) => {
        builder
          .where('first_name', 'ilike', `%${filters.search}%`)
          .orWhere('last_name', 'ilike', `%${filters.search}%`)
          .orWhere('email', 'ilike', `%${filters.search}%`);
      });
    }

    return query;
  }
}
