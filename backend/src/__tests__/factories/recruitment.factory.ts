import { Knex } from 'knex';
import { BaseFactory } from './base.factory';
import { v4 as uuidv4 } from 'uuid';

export interface JobPosting {
  id: string;
  title: string;
  department_id: string;
  location: string;
  description: string;
  required_skills: string[];
  experience_min: number;
  experience_max: number;
  application_deadline: Date;
  status: 'Open' | 'Closed' | 'On Hold';
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface Applicant {
  id: string;
  job_posting_id: string;
  name: string;
  email: string;
  contact_number: string;
  resume_url: string;
  current_stage: 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';
  applied_at: Date;
  updated_at: Date;
}

export class JobPostingFactory extends BaseFactory<JobPosting> {
  constructor(knex: Knex) {
    super(knex, 'job_postings');
  }

  async create(overrides?: Partial<JobPosting>): Promise<JobPosting> {
    const jobPosting: JobPosting = {
      id: this.generateId(),
      title: 'Senior Developer',
      department_id: uuidv4(),
      location: 'New York, NY',
      description: 'We are looking for a senior developer',
      required_skills: ['JavaScript', 'TypeScript', 'React'],
      experience_min: 5,
      experience_max: 10,
      application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'Open',
      created_by: uuidv4(),
      created_at: new Date(),
      updated_at: new Date(),
      ...overrides,
    };

    await this.knex(this.tableName).insert(jobPosting);
    return jobPosting;
  }
}

export class ApplicantFactory extends BaseFactory<Applicant> {
  constructor(knex: Knex) {
    super(knex, 'applicants');
  }

  async create(overrides?: Partial<Applicant>): Promise<Applicant> {
    const applicant: Applicant = {
      id: this.generateId(),
      job_posting_id: uuidv4(),
      name: 'John Doe',
      email: this.randomEmail(),
      contact_number: '1234567890',
      resume_url: 'https://example.com/resume.pdf',
      current_stage: 'Applied',
      applied_at: new Date(),
      updated_at: new Date(),
      ...overrides,
    };

    await this.knex(this.tableName).insert(applicant);
    return applicant;
  }

  async createForJobPosting(jobPostingId: string, overrides?: Partial<Applicant>): Promise<Applicant> {
    return this.create({
      job_posting_id: jobPostingId,
      ...overrides,
    });
  }
}
