import cron from 'node-cron';
import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { googleFormsService } from './googleFormsService';

export class FormResponseSyncService {
  private knex: Knex;
  private running = false;

  constructor(knex: Knex) {
    this.knex = knex;
  }

  /** Start polling every 5 minutes. No-ops if Google Forms is not configured. */
  start(): void {
    if (!googleFormsService.isEnabled()) {
      console.log('[FormSync] Google Forms not configured — sync disabled');
      return;
    }

    // Run immediately on startup, then every 5 minutes
    this.sync().catch((err) => console.error('[FormSync] Initial sync error:', err));

    cron.schedule('*/5 * * * *', () => {
      this.sync().catch((err) => console.error('[FormSync] Cron sync error:', err));
    });

    console.log('[FormSync] Started — polling every 5 minutes');
  }

  /** Manually trigger a sync (used by the API route). */
  async syncNow(): Promise<{ synced: number; errors: string[] }> {
    return this.sync();
  }

  private async sync(): Promise<{ synced: number; errors: string[] }> {
    // Prevent overlapping runs
    if (this.running) return { synced: 0, errors: [] };
    this.running = true;

    let synced = 0;
    const errors: string[] = [];

    try {
      // Find all job postings that have a generated form
      const postings = await this.knex('job_postings')
        .whereNotNull('form_id')
        .where('form_status', 'generated')
        .select('id', 'form_id', 'form_last_synced_at');

      for (const posting of postings) {
        try {
          const newResponses = await googleFormsService.getNewResponses(
            posting.form_id,
            posting.id,
            posting.form_last_synced_at?.toISOString()
          );

          console.log(`[FormSync] Job ${posting.id}: found ${newResponses.length} new response(s)`);

          for (const resp of newResponses) {
            await this.upsertApplicant(resp);
            synced++;
          }

          // Update last synced timestamp even if no new responses (marks that we checked)
          await this.knex('job_postings').where('id', posting.id).update({
            form_last_synced_at: this.knex.fn.now(),
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          errors.push(`Job ${posting.id}: ${msg}`);
          console.error(`[FormSync] Error syncing job ${posting.id}:`, msg);
        }
      }
    } finally {
      this.running = false;
    }

    if (synced > 0) {
      console.log(`[FormSync] Imported ${synced} new applicant(s)`);
    }

    return { synced, errors };
  }

  private async upsertApplicant(resp: {
    job_posting_id: string;
    response_id: string;
    name: string;
    email: string;
    phone: string;
    resume_url: string;
    cover_letter?: string;
    submitted_at: string;
  }): Promise<void> {
    // Skip if this response_id was already imported
    const existing = await this.knex('applicants')
      .where('form_response_id', resp.response_id)
      .first();

    if (existing) {
      console.log(`[FormSync] Skipping duplicate response_id: ${resp.response_id}`);
      return;
    }

    // Also skip if same email already applied to this job
    const duplicateEmail = await this.knex('applicants')
      .where({ job_posting_id: resp.job_posting_id, email: resp.email })
      .first();

    if (duplicateEmail) {
      console.log(`[FormSync] Skipping duplicate email: ${resp.email} for job ${resp.job_posting_id}`);
      return;
    }

    // Split full name into first + last
    const nameParts = resp.name.trim().split(/\s+/);
    const first_name = nameParts[0] || resp.name;
    const last_name = nameParts.slice(1).join(' ') || '';

    console.log(`[FormSync] Inserting applicant: ${resp.name} (${resp.email})`);

    await this.knex('applicants').insert({
      id: uuidv4(),
      job_posting_id: resp.job_posting_id,
      first_name,
      last_name,
      email: resp.email,
      phone: resp.phone || '',
      resume_url: resp.resume_url || null,
      cover_letter: resp.cover_letter || null,
      source: 'google_form',
      form_response_id: resp.response_id,
      stage: 'applied',
      created_at: this.knex.fn.now(),
      updated_at: this.knex.fn.now(),
    });
  }
}
