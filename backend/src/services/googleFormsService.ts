import { google } from 'googleapis';

export interface ParsedFormResponse {
  job_posting_id: string;
  name: string;
  email: string;
  phone: string;
  linkedin_url?: string;
  resume_url: string;
  years_experience: string;
  cover_letter?: string;
  submitted_at: string;
  response_id: string;
}

// Question titles in the form — used to map response answers back to fields
const QUESTION_TITLES = {
  name: 'Full Name',
  email: 'Email Address',
  phone: 'Phone Number',
  linkedin: 'LinkedIn Profile URL',
  resume: 'Resume / CV Link',
  experience: 'Years of Experience',
  cover_letter: 'Cover Letter',
} as const;

export class GoogleFormsService {
  private oauth2Client: any;
  private enabled: boolean;

  constructor() {
    const clientId = process.env['GOOGLE_CLIENT_ID'];
    const clientSecret = process.env['GOOGLE_CLIENT_SECRET'];
    const refreshToken = process.env['GOOGLE_FORMS_REFRESH_TOKEN'];

    this.enabled = !!(clientId && clientSecret && refreshToken);

    console.log('[GoogleForms] Init check —', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      hasRefreshToken: !!refreshToken,
      enabled: this.enabled,
    });

    if (this.enabled) {
      this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret, 'urn:ietf:wg:oauth:2.0:oob');
      this.oauth2Client.setCredentials({ refresh_token: refreshToken });
      console.log('[GoogleForms] OAuth2 client initialized with refresh token');
    } else {
      console.log('[GoogleForms] Integration disabled — set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_FORMS_REFRESH_TOKEN in .env to enable');
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async createApplicationForm(
    jobPostingId: string,
    jobTitle: string
  ): Promise<{ formId: string; formUrl: string }> {
    if (!this.enabled || !this.oauth2Client) {
      throw new Error('Google Forms integration is not configured');
    }

    console.log(`[GoogleForms] Creating form for job "${jobTitle}" (${jobPostingId})`);

    const forms = google.forms({ version: 'v1', auth: this.oauth2Client });
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });

    // Step 1: Create the form shell
    console.log('[GoogleForms] Step 1: Creating form shell via API...');
    const createRes = await forms.forms.create({
      requestBody: {
        info: {
          title: `Application for ${jobTitle}`,
          documentTitle: `Application for ${jobTitle}`,
        },
      },
    });

    const formId = createRes.data.formId!;
    const formUrl = `https://docs.google.com/forms/d/${formId}/viewform`;
    console.log(`[GoogleForms] Step 1 done — formId: ${formId}`);

    // Step 2: Add description + all questions in a single batchUpdate
    console.log('[GoogleForms] Step 2: Adding questions via batchUpdate...');
    await forms.forms.batchUpdate({
      formId,
      requestBody: {
        requests: [
          {
            updateFormInfo: {
              info: {
                description: `Apply for: ${jobTitle} | Job Reference: ${jobPostingId}\n\nPlease fill in all required fields accurately.`,
              },
              updateMask: 'description',
            },
          },
          {
            createItem: {
              item: {
                title: QUESTION_TITLES.name,
                questionItem: { question: { required: true, textQuestion: { paragraph: false } } },
              },
              location: { index: 0 },
            },
          },
          {
            createItem: {
              item: {
                title: QUESTION_TITLES.email,
                questionItem: { question: { required: true, textQuestion: { paragraph: false } } },
              },
              location: { index: 1 },
            },
          },
          {
            createItem: {
              item: {
                title: QUESTION_TITLES.phone,
                questionItem: { question: { required: true, textQuestion: { paragraph: false } } },
              },
              location: { index: 2 },
            },
          },
          {
            createItem: {
              item: {
                title: QUESTION_TITLES.linkedin,
                description: 'Optional — your LinkedIn profile URL',
                questionItem: { question: { required: false, textQuestion: { paragraph: false } } },
              },
              location: { index: 3 },
            },
          },
          {
            createItem: {
              item: {
                title: QUESTION_TITLES.resume,
                description: 'Paste a shareable link to your resume (Google Drive, Dropbox, etc.)',
                questionItem: { question: { required: true, textQuestion: { paragraph: false } } },
              },
              location: { index: 4 },
            },
          },
          {
            createItem: {
              item: {
                title: QUESTION_TITLES.experience,
                description: 'Total years of relevant work experience',
                questionItem: { question: { required: true, textQuestion: { paragraph: false } } },
              },
              location: { index: 5 },
            },
          },
          {
            createItem: {
              item: {
                title: QUESTION_TITLES.cover_letter,
                description: 'Optional — why do you want this role?',
                questionItem: { question: { required: false, textQuestion: { paragraph: true } } },
              },
              location: { index: 6 },
            },
          },
        ],
      },
    });

    console.log('[GoogleForms] Step 2 done — questions added');

    // Step 3: Move form into the shared Drive folder (if configured)
    const folderId = process.env['GOOGLE_FORMS_DRIVE_FOLDER_ID'];
    if (folderId) {
      const fileData = await drive.files.get({ fileId: formId, fields: 'parents' });
      const prevParents = fileData.data.parents?.join(',') ?? '';
      await drive.files.update({
        fileId: formId,
        addParents: folderId,
        removeParents: prevParents,
        fields: 'id, parents',
      });
    }

    console.log(`[GoogleForms] Form creation complete — URL: ${formUrl}`);
    return { formId, formUrl };
  }

  /**
   * Fetch responses submitted after `afterTimestamp` (ISO string).
   * Returns parsed applicant data ready to insert into the DB.
   */
  async getNewResponses(
    formId: string,
    jobPostingId: string,
    afterTimestamp?: string
  ): Promise<ParsedFormResponse[]> {
    if (!this.enabled || !this.oauth2Client) return [];

    const forms = google.forms({ version: 'v1', auth: this.oauth2Client });

    // Get form structure to build a questionId → field name map
    const formData = await forms.forms.get({ formId });
    const questionMap = this.buildQuestionMap(formData.data.items ?? []);

    // Fetch responses, filtering by timestamp if provided
    const params: any = { formId };
    if (afterTimestamp) {
      params.filter = `timestamp > ${afterTimestamp}`;
    }

    const responsesData = await forms.forms.responses.list(params);
    const responses = responsesData.data.responses ?? [];

    return responses.map((r) => this.parseResponse(r, questionMap, jobPostingId));
  }

  // Build a map of questionId → field name from the form structure
  private buildQuestionMap(items: any[]): Record<string, keyof typeof QUESTION_TITLES> {
    const map: Record<string, keyof typeof QUESTION_TITLES> = {};
    for (const item of items) {
      if (!item.questionItem?.question?.questionId) continue;
      const qId = item.questionItem.question.questionId;
      const title: string = item.title ?? '';
      for (const [field, label] of Object.entries(QUESTION_TITLES)) {
        if (title === label) {
          map[qId] = field as keyof typeof QUESTION_TITLES;
          break;
        }
      }
    }
    return map;
  }

  private parseResponse(
    response: any,
    questionMap: Record<string, keyof typeof QUESTION_TITLES>,
    jobPostingId: string
  ): ParsedFormResponse {
    const answers = response.answers ?? {};
    const get = (field: keyof typeof QUESTION_TITLES): string => {
      for (const [qId, mappedField] of Object.entries(questionMap)) {
        if (mappedField === field) {
          return answers[qId]?.textAnswers?.answers?.[0]?.value ?? '';
        }
      }
      return '';
    };

    return {
      job_posting_id: jobPostingId,
      response_id: response.responseId,
      submitted_at: response.createTime,
      name: get('name'),
      email: get('email'),
      phone: get('phone'),
      linkedin_url: get('linkedin') || undefined,
      resume_url: get('resume'),
      years_experience: get('experience'),
      cover_letter: get('cover_letter') || undefined,
    };
  }
}

export const googleFormsService = new GoogleFormsService();
