import { Knex } from 'knex';
import { OfferLetterRepository } from '../repositories/offerLetterRepository';
import { ApplicantRepository } from '../repositories/applicantRepository';
import { OfferLetter, CreateOfferLetterDTO } from '../types/recruitment';
import { EmailService } from './emailService';
import { EmailTemplateType } from '../types/email';

export class OfferLetterService {
  private offerLetterRepository: OfferLetterRepository;
  private applicantRepository: ApplicantRepository;
  private emailService: EmailService;

  constructor(knex: Knex) {
    this.offerLetterRepository = new OfferLetterRepository(knex);
    this.applicantRepository = new ApplicantRepository(knex);
    this.emailService = new EmailService();
  }

  async generateOfferLetter(data: CreateOfferLetterDTO): Promise<OfferLetter> {
    // Verify applicant exists
    const applicant = await this.applicantRepository.getApplicantById(data.applicant_id);
    if (!applicant) {
      throw new Error('Applicant not found');
    }

    // Create offer letter
    const offerLetter = await this.offerLetterRepository.createOfferLetter(data);

    return offerLetter;
  }

  async sendOfferLetter(offerLetterId: string): Promise<OfferLetter> {
    const offerLetter = await this.offerLetterRepository.getOfferLetterById(offerLetterId);
    if (!offerLetter) {
      throw new Error('Offer letter not found');
    }

    // Get applicant details
    const applicant = await this.applicantRepository.getApplicantById(offerLetter.applicant_id);
    if (!applicant) {
      throw new Error('Applicant not found');
    }

    // Send offer letter email
    await this.emailService.sendWithTemplate(
      EmailTemplateType.OFFER_LETTER,
      applicant.email,
      'Offer Letter',
      {
        candidateName: `${applicant.first_name} ${applicant.last_name}`,
        jobTitle: offerLetter.position,
        department: offerLetter.department,
        salary: offerLetter.salary.toString(),
        startDate: new Date(offerLetter.start_date).toLocaleDateString(),
        reportingManager: 'HR Team',
        offerValidTill: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        acceptanceUrl: 'https://example.com/accept',
      }
    );

    // Update status to Sent
    return this.offerLetterRepository.updateOfferLetterStatus(offerLetterId, 'Sent');
  }

  async acceptOfferLetter(offerLetterId: string): Promise<OfferLetter> {
    const offerLetter = await this.offerLetterRepository.getOfferLetterById(offerLetterId);
    if (!offerLetter) {
      throw new Error('Offer letter not found');
    }

    // Update status to Accepted
    const updated = await this.offerLetterRepository.updateOfferLetterStatus(offerLetterId, 'Accepted');

    // Move applicant to Hired stage
    await this.applicantRepository.updateApplicant(offerLetter.applicant_id, {
      stage: 'hired',
    });

    // Send acceptance confirmation
    const applicant = await this.applicantRepository.getApplicantById(offerLetter.applicant_id);
    if (applicant) {
      await this.emailService.sendWithTemplate(
        EmailTemplateType.SYSTEM_NOTIFICATION,
        applicant.email,
        'Offer Accepted',
        {
          employeeName: `${applicant.first_name} ${applicant.last_name}`,
          title: 'Offer Accepted',
          message: `Congratulations! Your offer for ${offerLetter.position} has been accepted. Your start date is ${new Date(offerLetter.start_date).toLocaleDateString()}.`,
        }
      );
    }

    return updated;
  }

  async rejectOfferLetter(offerLetterId: string): Promise<OfferLetter> {
    const offerLetter = await this.offerLetterRepository.getOfferLetterById(offerLetterId);
    if (!offerLetter) {
      throw new Error('Offer letter not found');
    }

    // Update status to Rejected
    const updated = await this.offerLetterRepository.updateOfferLetterStatus(offerLetterId, 'Rejected');

    // Move applicant to Rejected stage
    await this.applicantRepository.updateApplicant(offerLetter.applicant_id, {
      stage: 'rejected',
    });

    return updated;
  }

  async getOfferLetter(id: string): Promise<OfferLetter> {
    const offerLetter = await this.offerLetterRepository.getOfferLetterById(id);
    if (!offerLetter) {
      throw new Error('Offer letter not found');
    }
    return offerLetter;
  }

  async getOfferLetterByApplicant(applicantId: string): Promise<OfferLetter | null> {
    return this.offerLetterRepository.getOfferLetterByApplicant(applicantId);
  }
}
