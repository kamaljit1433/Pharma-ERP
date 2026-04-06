import { Router } from 'express';
import { RecruitmentController } from '../controllers/recruitmentController';
import { authenticateToken } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();
const controller = new RecruitmentController();

// Job Posting routes
router.post('/jobs', authenticateToken, authorize(['Super Admin', 'HR Manager']) as any, (req, res) => controller.createJobPosting(req, res));
router.get('/jobs', authenticateToken, (req, res) => controller.getJobPostings(req, res));
router.get('/jobs/:id', authenticateToken, (req, res) => controller.getJobPosting(req, res));

// Applicant routes — authentication required on creation to prevent anonymous spam injection
router.post('/jobs/:job_posting_id/applicants', authenticateToken, (req, res) => controller.addApplicant(req, res));
router.get('/applicants', authenticateToken, authorize(['Super Admin', 'HR Manager']) as any, (req, res) => controller.getApplicants(req, res));
router.put('/applicants/:applicant_id/stage', authenticateToken, authorize(['Super Admin', 'HR Manager']) as any, (req, res) =>
  controller.moveApplicantStage(req, res)
);

// Interview routes
router.post('/interviews', authenticateToken, authorize(['Super Admin', 'HR Manager']) as any, (req, res) => controller.scheduleInterview(req, res));
router.post('/interviews/:interview_id/feedback', authenticateToken, (req, res) => controller.submitInterviewFeedback(req, res));
router.get('/interviews/:interview_id/feedback', authenticateToken, authorize(['Super Admin', 'HR Manager']) as any, (req, res) =>
  controller.getInterviewFeedback(req, res)
);

// Offer Letter routes
router.post('/offer-letters', authenticateToken, authorize(['Super Admin', 'HR Manager']) as any, (req, res) => controller.generateOfferLetter(req, res));
router.post('/offer-letters/:offer_letter_id/send', authenticateToken, authorize(['Super Admin', 'HR Manager']) as any, (req, res) =>
  controller.sendOfferLetter(req, res)
);
router.post('/offer-letters/:offer_letter_id/accept', authenticateToken, (req, res) => controller.acceptOfferLetter(req, res));

// Onboarding routes
router.post('/onboarding', authenticateToken, authorize(['Super Admin', 'HR Manager']) as any, (req, res) => controller.createOnboardingChecklist(req, res));
router.put('/onboarding/items/:item_id/complete', authenticateToken, (req, res) => controller.completeChecklistItem(req, res));
router.get('/onboarding/:employee_id', authenticateToken, (req, res) => controller.getOnboardingChecklist(req, res));

export default router;
