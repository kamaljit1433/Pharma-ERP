# Job Offer Management Implementation

## Overview
This document describes the implementation of job offer management functionality for the Recruitment Management Module (Task 13.5). The implementation allows HR managers to create, send, and track job offers to candidates.

## Components Created

### 1. JobOfferForm Component
**File:** `frontend/src/components/recruitment/JobOfferForm.tsx`

**Purpose:** Provides a form for creating and sending job offers to candidates.

**Features:**
- Form fields for position, department, salary, start date, and terms & conditions
- Client-side validation for all required fields
- Salary validation (must be positive number)
- Two-step process: Generate offer → Send offer
- Success and error message display
- Disabled state during API calls
- Candidate information display (name and email)

**Props:**
- `applicantId` (string): ID of the candidate
- `applicantName` (string): Name of the candidate
- `applicantEmail` (string): Email of the candidate
- `onSuccess?` (function): Callback when offer is sent successfully
- `onCancel?` (function): Callback when form is cancelled

**Integration:**
- Uses `useRecruitmentStore` for state management
- Calls `generateOffer()` to create the offer
- Calls `sendOffer()` to send the offer via email

### 2. JobOfferTracker Component
**File:** `frontend/src/components/recruitment/JobOfferTracker.tsx`

**Purpose:** Displays a table of all job offers with their status and summary statistics.

**Features:**
- Table view of all job offers with columns:
  - Candidate name and email
  - Position and department
  - Salary (formatted with locale)
  - Start date
  - Offer status (Draft, Sent, Signed, Accepted, Rejected)
  - Creation date
  - View action button
- Status badges with color coding:
  - Draft: Gray
  - Sent: Blue
  - Signed: Purple
  - Accepted: Green
  - Rejected: Red
- Summary statistics showing:
  - Total offers
  - Sent count
  - Accepted count
  - Rejected count
  - Pending count (Draft + Sent)
- Filtering by job posting ID or applicant ID
- Loading and empty states

**Props:**
- `jobPostingId?` (string): Filter offers by job posting
- `applicantId?` (string): Filter offers by applicant

**Integration:**
- Uses `useRecruitmentStore` to access offers and candidates
- Automatically filters offers based on provided IDs

## Updated Components

### Recruitment Page
**File:** `frontend/src/pages/Recruitment.tsx`

**Changes:**
- Added imports for `JobOfferForm` and `JobOfferTracker`
- Added `Award` icon import from lucide-react
- Added state for job offer form dialog: `showJobOfferForm`, `selectedCandidateForOffer`
- Updated tabs from 4 to 5 columns to include "Job Offers" tab
- Added new "Job Offers" tab content with:
  - "Create Job Offer" button
  - JobOfferTracker component
- Added job offer form dialog that:
  - Shows candidate selection when first opened
  - Filters candidates in Interview or Offer stage
  - Displays JobOfferForm when candidate is selected
  - Handles success callback to close dialog and refresh

### Recruitment Components Index
**File:** `frontend/src/components/recruitment/index.ts`

**Changes:**
- Added exports for `JobOfferForm`
- Added exports for `JobOfferTracker`

## Data Flow

### Creating and Sending an Offer
1. User clicks "Create Job Offer" button in Job Offers tab
2. Dialog opens showing list of candidates in Interview/Offer stage
3. User selects a candidate
4. JobOfferForm displays with candidate information
5. User fills in offer details (position, department, salary, start date, terms)
6. User clicks "Generate Offer Letter"
7. Form validates all fields
8. API call to `generateOffer()` creates the offer
9. Success message displays and "Send Offer Letter" button appears
10. User clicks "Send Offer Letter"
11. API call to `sendOffer()` sends the offer via email
12. Success message confirms email sent to candidate
13. Dialog closes and JobOfferTracker refreshes

### Tracking Offers
1. User navigates to Recruitment → Job Offers tab
2. JobOfferTracker displays all offers in a table
3. Offers show status (Draft, Sent, Accepted, Rejected)
4. Summary statistics show offer distribution
5. User can filter by job posting or view specific candidate offers

## API Integration

The implementation uses the following API endpoints (already defined in recruitmentService):

- `POST /recruitment/offer-letters` - Generate offer letter
- `POST /recruitment/offer-letters/{id}/send` - Send offer letter
- `POST /recruitment/offer-letters/{id}/accept` - Accept offer (for future use)

## State Management

Uses Zustand store (`useRecruitmentStore`) with the following actions:
- `generateOffer(data)` - Creates a new offer
- `sendOffer(offerLetterId)` - Sends the offer via email
- `loading` - Loading state during API calls
- `error` - Error message from API

## Validation

### JobOfferForm Validation
- Position: Required, non-empty string
- Department: Required, non-empty string
- Salary: Required, must be positive number
- Start Date: Required, valid date
- Terms & Conditions: Required, non-empty string

## Error Handling

- Form validation errors displayed inline
- API errors displayed in error alert
- Loading states prevent duplicate submissions
- Graceful error recovery with retry capability

## Testing

Unit tests created for both components:

### JobOfferForm Tests (`JobOfferForm.test.tsx`)
- Renders form with all required fields
- Validates required fields before submission
- Validates salary is positive number
- Submits form with valid data
- Shows send button after successful generation
- Sends offer letter when send button clicked
- Displays error message on API failure
- Calls onCancel when cancel button clicked
- Disables form inputs while loading

### JobOfferTracker Tests (`JobOfferTracker.test.tsx`)
- Renders tracker with all offers
- Displays offer status badges
- Displays salary information
- Displays summary statistics
- Filters offers by job posting ID
- Filters offers by applicant ID
- Displays loading state
- Displays empty state when no offers
- Displays candidate email in table
- Displays start dates in correct format
- Calculates correct statistics
- Displays view button for each offer

## Accessibility Features

- Form labels properly associated with inputs
- Error messages announced to screen readers
- Status badges use color + text for clarity
- Table headers properly marked
- Buttons have descriptive labels
- Loading states communicated to users

## Responsive Design

- Form adapts to mobile screens
- Table uses horizontal scroll on small screens
- Dialog content responsive
- Summary statistics grid responsive (2 columns on mobile, 5 on desktop)

## Future Enhancements

1. Offer letter template customization
2. Bulk offer creation
3. Offer expiration dates and reminders
4. Offer acceptance/rejection tracking
5. Offer letter PDF generation and download
6. Email template customization
7. Offer history and audit trail
8. Candidate response tracking

## Requirements Mapping

**Requirement 10.8:** "THE Frontend_Application SHALL allow making job offers to candidates"

This implementation satisfies the requirement by:
1. ✅ Providing a job offer creation form (JobOfferForm)
2. ✅ Allowing HR managers to send offers to candidates
3. ✅ Tracking offer status (Draft, Sent, Accepted, Rejected)
4. ✅ Displaying offer information in a trackable format
5. ✅ Integrating with the recruitment workflow

## Files Modified/Created

### Created Files
- `frontend/src/components/recruitment/JobOfferForm.tsx`
- `frontend/src/components/recruitment/JobOfferTracker.tsx`
- `frontend/src/components/recruitment/__tests__/JobOfferForm.test.tsx`
- `frontend/src/components/recruitment/__tests__/JobOfferTracker.test.tsx`
- `frontend/src/components/recruitment/JOB_OFFER_IMPLEMENTATION.md` (this file)

### Modified Files
- `frontend/src/pages/Recruitment.tsx`
- `frontend/src/components/recruitment/index.ts`

## Code Quality

- ✅ TypeScript strict mode compliance
- ✅ No ESLint errors or warnings
- ✅ Follows project naming conventions
- ✅ Consistent with existing component patterns
- ✅ Proper error handling
- ✅ Comprehensive unit tests
- ✅ Accessibility compliant
- ✅ Responsive design
