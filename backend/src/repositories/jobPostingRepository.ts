import { Knex } from 'knex';
import { JobPosting, CreateJobPostingDTO, UpdateJobPostingDTO, JobPostingFilters } from '../types/recruitment';
import { v4 as uuidv4 } from 'uuid';

export class JobPostingRepository {
  constructor(private knex: Knex) {}

  async createJobPosting(data: CreateJobPostingDTO): Promise<JobPosting> {
    const id = uuidv4();

    const [jobPosting] = await this.knex('job_postings')
      .insert({
        id,
        title: data.title,
        department_id: data.department_id ?? null,
        designation_id: data.designation_id ?? null,
        description: data.description ?? '',
        positions_count: data.positions_count,
        status: data.status ?? 'draft',
        posted_date: data.posted_date ?? null,
        closing_date: data.closing_date ?? null,
        created_at: this.knex.fn.now(),
        updated_at: this.knex.fn.now(),
      })
      .returning('*');

    return jobPosting;
  }

  async getJobPostingById(id: string): Promise<JobPosting | null> {
    return (await this.knex('job_postings').where('id', id).first()) ?? null;
  }

  async getJobPosting(id: string): Promise<JobPosting | null> {
    return this.getJobPostingById(id);
  }

  async updateJobPosting(id: string, data: UpdateJobPostingDTO): Promise<JobPosting> {
    const updateData: any = { updated_at: this.knex.fn.now() };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.positions_count !== undefined) updateData.positions_count = data.positions_count;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.posted_date !== undefined) updateData.posted_date = data.posted_date;
    if (data.closing_date !== undefined) updateData.closing_date = data.closing_date;

    const [jobPosting] = await this.knex('job_postings')
      .where('id', id)
      .update(updateData)
      .returning('*');

    if (!jobPosting) throw new Error(`JobPosting with id ${id} not found`);

    return jobPosting;
  }

  async updateJobPostingStatus(id: string, status: 'draft' | 'open' | 'closed' | 'on_hold'): Promise<JobPosting> {
    const [jobPosting] = await this.knex('job_postings')
      .where('id', id)
      .update({ status, updated_at: this.knex.fn.now() })
      .returning('*');

    return jobPosting;
  }

  async getAllJobPostings(limit: number = 50, offset: number = 0): Promise<JobPosting[]> {
    return this.knex('job_postings').limit(limit).offset(offset).orderBy('created_at', 'desc');
  }

  async getOpenJobPostings(): Promise<JobPosting[]> {
    return this.knex('job_postings').where({ status: 'open' }).orderBy('created_at', 'desc');
  }

  async getJobPostingsByDepartment(departmentId: string): Promise<JobPosting[]> {
    return this.knex('job_postings').where({ department_id: departmentId }).orderBy('created_at', 'desc');
  }

  async getJobPostingsByDesignation(designationId: string): Promise<JobPosting[]> {
    return this.knex('job_postings').where({ designation_id: designationId }).orderBy('created_at', 'desc');
  }

  async getJobPostingCount(statusOrFilters?: string | JobPostingFilters): Promise<number> {
    let query = this.knex('job_postings');

    if (typeof statusOrFilters === 'string') {
      query = query.where('status', statusOrFilters);
    } else if (statusOrFilters) {
      const filters = statusOrFilters;
      if (filters.department_id) query = query.where('department_id', filters.department_id);
      if (filters.status) query = query.where('status', filters.status);
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

  async searchJobPostings(searchOrFilters: string | JobPostingFilters): Promise<JobPosting[]> {
    let query = this.knex('job_postings');

    if (typeof searchOrFilters === 'string') {
      const term = searchOrFilters.toLowerCase();
      query = query.where((q) => {
        q.whereRaw('LOWER(title) LIKE ?', [`%${term}%`])
          .orWhereRaw('LOWER(description) LIKE ?', [`%${term}%`]);
      });
    } else {
      const filters = searchOrFilters;
      if (filters.department_id) query = query.where('department_id', filters.department_id);
      if (filters.status) query = query.where('status', filters.status);
      if (filters.search) {
        const term = filters.search.toLowerCase();
        query = query.where((q) => {
          q.whereRaw('LOWER(title) LIKE ?', [`%${term}%`])
            .orWhereRaw('LOWER(description) LIKE ?', [`%${term}%`]);
        });
      }
      query = query.limit(filters.limit || 50).offset(filters.offset || 0);
    }

    return query.orderBy('created_at', 'desc');
  }

  async deleteJobPosting(id: string): Promise<void> {
    await this.knex('job_postings').where('id', id).delete();
  }
}
