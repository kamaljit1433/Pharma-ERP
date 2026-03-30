import { Knex } from 'knex';
import { JobPosting, CreateJobPostingDTO, UpdateJobPostingDTO, JobPostingFilters } from '../types/recruitment';
import { v4 as uuidv4 } from 'uuid';

export class JobPostingRepository {
  constructor(private knex: Knex) {}

  async createJobPosting(data: CreateJobPostingDTO): Promise<JobPosting> {
    const id = uuidv4();

    const jobPosting = await this.knex('job_postings')
      .insert({
        id,
        title: data.title,
        department_id: data.department_id,
        designation_id: data.designation_id,
        description: data.description,
        positions_count: data.positions_count,
        status: 'draft',
        posted_date: data.posted_date,
        closing_date: data.closing_date,
        created_at: this.knex.fn.now(),
        updated_at: this.knex.fn.now(),
      })
      .returning('*');

    return jobPosting[0] || jobPosting;
  }

  async getJobPostingById(id: string): Promise<JobPosting | null> {
    const jobPosting = await this.knex('job_postings').where('id', id).first();
    return jobPosting || null;
  }

  async updateJobPosting(id: string, data: UpdateJobPostingDTO): Promise<JobPosting> {
    const updateData: any = {
      updated_at: this.knex.fn.now(),
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.positions_count !== undefined) updateData.positions_count = data.positions_count;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.posted_date !== undefined) updateData.posted_date = data.posted_date;
    if (data.closing_date !== undefined) updateData.closing_date = data.closing_date;

    const jobPosting = await this.knex('job_postings')
      .where('id', id)
      .update(updateData)
      .returning('*');

    return jobPosting[0] || jobPosting;
  }

  async updateJobPostingStatus(id: string, status: 'draft' | 'open' | 'closed' | 'on_hold'): Promise<JobPosting> {
    const jobPosting = await this.knex('job_postings')
      .where('id', id)
      .update({
        status,
        updated_at: this.knex.fn.now(),
      })
      .returning('*');

    return jobPosting[0] || jobPosting;
  }

  async searchJobPostings(filters: JobPostingFilters): Promise<JobPosting[]> {
    let query = this.knex('job_postings');

    if (filters.department_id) {
      query = query.where('department_id', filters.department_id);
    }

    if (filters.status) {
      query = query.where('status', filters.status);
    }

    if (filters.search) {
      query = query.where((q) => {
        q.whereRaw('LOWER(title) LIKE ?', [`%${filters.search!.toLowerCase()}%`])
          .orWhereRaw('LOWER(description) LIKE ?', [`%${filters.search!.toLowerCase()}%`]);
      });
    }

    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    const jobPostings = await query
      .limit(limit)
      .offset(offset)
      .orderBy('created_at', 'desc');

    return jobPostings;
  }

  async getAllJobPostings(limit: number = 50, offset: number = 0): Promise<JobPosting[]> {
    const jobPostings = await this.knex('job_postings')
      .limit(limit)
      .offset(offset)
      .orderBy('created_at', 'desc');

    return jobPostings;
  }

  async getJobPostingCount(filters?: JobPostingFilters): Promise<number> {
    let query = this.knex('job_postings');

    if (filters) {
      if (filters.department_id) {
        query = query.where('department_id', filters.department_id);
      }

      if (filters.status) {
        query = query.where('status', filters.status);
      }

      if (filters.search) {
        query = query.where((q) => {
          q.whereRaw('LOWER(title) LIKE ?', [`%${filters.search!.toLowerCase()}%`])
            .orWhereRaw('LOWER(description) LIKE ?', [`%${filters.search!.toLowerCase()}%`]);
        });
      }
    }

    const result = await query.count('id as count').first();
    return Number(result?.['count'] || 0);
  }

  async deleteJobPosting(id: string): Promise<void> {
    await this.knex('job_postings').where('id', id).delete();
  }
}
