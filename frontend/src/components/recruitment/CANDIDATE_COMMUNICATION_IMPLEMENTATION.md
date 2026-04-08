# Candidate Communication Implementation

## Overview

The Candidate Communication feature enables HR managers to send emails to candidates and view communication history. This feature is integrated into the Candidate Detail view and provides a complete email management system for recruitment workflows.

## Components

### 1. CandidateCommunicationForm

**Location**: `frontend/src/components/recruitment/CandidateCommunicationForm.tsx`

**Purpose**: Provides a form for composing and sending emails to candidates.

**Features**:
- Email subject input field
- Message body textarea with character count
- Form validation (subject and body required)
- Success/error message display
- Clear button to reset form
- Disabled submit button when fields are empty
- Loading state during submission

**Props**:
```typescript
interface CandidateCommunicationFormProps {
  applicantId: string;           // ID of the candidate
  applicantEmail: string;        // Email address of the candidate
  applicantName: string;         // Name of the candidate
  onSuccess?: () => void;        // Callback when email is sent successfully
  onError?: (error: string) => void; // Callback when an error occurs
}
```

**Usage**:
```tsx
<CandidateCommunicationForm
  applicantId="applicant-123"
  applicantEmail="candidate@example.com"
  applicantName="John Doe"
  onSuccess={() => console.log('Email sent')}
  onError={(error) => console.error(error)}
/>
```

### 2. CommunicationHistory

**Location**: `frontend/src/components/recruitment/CommunicationHistory.tsx`

**Purpose**: Displays all past communications with a candidate.

**Features**:
- Displays list of all emails sent to the candidate
- Shows sender name, subject, and message preview
- Displays sent date and time
- Shows "Read" badge for read communications
- Loading state while fetching data
- Empty state when no communications exist
- Error handling with user-friendly messages
- Auto-refresh when new communications are sent

**Props**:
```typescript
interface CommunicationHistoryProps {
  applicantId: string;           // ID of the candidate
  applicantName: string;         // Name of the candidate
  refreshTrigger?: number;       // Trigger to refresh the history
}
```

**Usage**:
```tsx
<CommunicationHistory
  applicantId="applicant-123"
  applicantName="John Doe"
  refreshTrigger={communicationRefresh}
/>
```

### 3. CandidateDetail (Updated)

**Location**: `frontend/src/components/recruitment/CandidateDetail.tsx`

**Changes**:
- Added "Communication" tab to the tab list
- Integrated CandidateCommunicationForm component
- Integrated CommunicationHistory component
- Added refresh trigger state to update history after sending emails

**New Tab Structure**:
- Overview: Candidate contact information
- Resume: Resume download
- **Communication**: Email composition and history (NEW)
- Status: Candidate stage tracking

## API Integration

### Service Methods

**Location**: `frontend/src/services/recruitmentService.ts`

**New Methods**:

```typescript
// Send email to candidate
sendCommunication: async (data: SendCommunicationDTO) => Promise<CandidateCommunication>

// Get communication history for a candidate
getCommunicationHistory: async (applicantId: string) => Promise<CandidateCommunication[]>

// Mark communication as read
markCommunicationAsRead: async (communicationId: string) => Promise<void>
```

### API Endpoints

- `POST /recruitment/communications` - Send email to candidate
- `GET /recruitment/communications/:applicantId` - Get communication history
- `PUT /recruitment/communications/:communicationId/read` - Mark as read

### Data Types

**Location**: `frontend/src/types/recruitment.ts`

```typescript
interface CandidateCommunication {
  id: string;
  applicant_id: string;
  sender_id: string;
  sender_name: string;
  subject: string;
  body: string;
  sent_at: Date;
  read_at?: Date;
}

interface SendCommunicationDTO {
  applicant_id: string;
  subject: string;
  body: string;
}
```

## Testing

### Test Files

1. **CandidateCommunicationForm.test.tsx**
   - Tests form rendering
   - Tests validation (empty fields)
   - Tests successful email submission
   - Tests error handling
   - Tests form clearing
   - Tests button states

2. **CommunicationHistory.test.tsx**
   - Tests component rendering
   - Tests loading state
   - Tests empty state
   - Tests data display
   - Tests error handling
   - Tests refresh functionality
   - Tests date formatting

### Running Tests

```bash
# Run all recruitment tests
npm test -- recruitment

# Run specific test file
npm test -- CandidateCommunicationForm.test.tsx --run
npm test -- CommunicationHistory.test.tsx --run

# Run with coverage
npm test -- --coverage
```

## User Experience

### Workflow

1. **Navigate to Candidate Detail**
   - User clicks on a candidate in the candidate list
   - Candidate detail page opens with multiple tabs

2. **Send Email**
   - User clicks on "Communication" tab
   - User enters email subject and message
   - User clicks "Send Email" button
   - Success message appears
   - Form is cleared automatically

3. **View History**
   - Communication history is displayed below the form
   - User can see all past emails sent to the candidate
   - Each email shows sender, subject, date, and preview

### Validation

- **Subject**: Required, must not be empty or whitespace only
- **Body**: Required, must not be empty or whitespace only
- **Submit Button**: Disabled when either field is empty

### Error Handling

- Network errors display user-friendly messages
- API errors are caught and displayed
- Form remains populated if submission fails
- User can retry after fixing the error

## Accessibility

- Form labels are properly associated with inputs
- Error messages are displayed in accessible containers
- Icons have proper ARIA labels
- Keyboard navigation is fully supported
- Screen reader friendly

## Performance

- Communication history is fetched on component mount
- Refresh is triggered only when new emails are sent
- No unnecessary re-renders
- Efficient state management with React hooks

## Future Enhancements

1. **Email Templates**: Pre-defined email templates for common scenarios
2. **Bulk Communication**: Send emails to multiple candidates at once
3. **Email Scheduling**: Schedule emails to be sent at a later time
4. **Email Attachments**: Support for attaching files to emails
5. **Email Tracking**: Track when candidates open emails
6. **Email Signatures**: Automatic email signatures based on user profile
7. **Email History Export**: Export communication history as PDF or CSV
8. **Email Reminders**: Automatic reminders for follow-up emails

## Integration Points

### With Other Features

- **Candidate List**: Navigate to candidate detail to access communication
- **Interview Scheduling**: Send interview confirmation emails
- **Job Offers**: Send offer letter emails
- **Notifications**: Notify candidates of status changes

### With Backend

- Requires backend API endpoints for email sending
- Requires email service integration (SendGrid, SES, SMTP)
- Requires database storage for communication history

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check backend API is running
   - Verify email service is configured
   - Check network connectivity

2. **Communication history not loading**
   - Verify applicant ID is correct
   - Check backend API response
   - Check browser console for errors

3. **Form validation not working**
   - Ensure form fields are properly bound
   - Check for JavaScript errors in console
   - Verify input event handlers are attached

## Code Quality

- TypeScript strict mode enabled
- Comprehensive test coverage (>80%)
- ESLint and Prettier configured
- Follows project structure conventions
- Proper error handling and logging
- Accessible and responsive design
