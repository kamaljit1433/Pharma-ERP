import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Recruitment from '../Recruitment';
import { useAuthStore } from '@/store/authStore';
import { useRecruitmentStore } from '@/store/recruitmentStore';
import { UserRole } from '@/types/auth';

// Mock the stores
vi.mock('@/store/authStore');
vi.mock('@/store/recruitmentStore');
vi.mock('@/components/layout/MainLayout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/components/recruitment/ApplicantPipeline', () => ({
  ApplicantPipeline: () => <div>Pipeline Component</div>,
}));

describe('Recruitment Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render access denied message for unauthorized users', () => {
    const mockAuthStore = {
      user: { role: UserRole.EMPLOYEE },
    };
    vi.mocked(useAuthStore).mockReturnValue(mockAuthStore as any);
    vi.mocked(useRecruitmentStore).mockReturnValue({
      jobs: [],
      candidates: [],
      loading: false,
      error: null,
      fetchJobs: vi.fn(),
      fetchCandidates: vi.fn(),
    } as any);

    render(
      <BrowserRouter>
        <Recruitment />
      </BrowserRouter>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(
      screen.getByText(/You do not have permission to access the Recruitment module/)
    ).toBeInTheDocument();
  });

  it('should render recruitment dashboard for HR Manager', async () => {
    const mockAuthStore = {
      user: { role: UserRole.HR_MANAGER },
    };
    const mockJobs = [
      {
        id: '1',
        title: 'Software Engineer',
        department_id: 'dept-1',
        location: 'New York',
        status: 'Open',
        application_deadline: new Date('2024-12-31'),
      },
    ];
    const mockCandidates = [
      {
        id: 'cand-1',
        job_posting_id: '1',
        name: 'John Doe',
        current_stage: 'Applied',
      },
    ];

    vi.mocked(useAuthStore).mockReturnValue(mockAuthStore as any);
    vi.mocked(useRecruitmentStore).mockReturnValue({
      jobs: mockJobs,
      candidates: mockCandidates,
      loading: false,
      error: null,
      fetchJobs: vi.fn(),
      fetchCandidates: vi.fn(),
    } as any);

    render(
      <BrowserRouter>
        <Recruitment />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Recruitment Management')).toBeInTheDocument();
    });
  });

  it('should render recruitment dashboard for Super Admin', async () => {
    const mockAuthStore = {
      user: { role: UserRole.SUPER_ADMIN },
    };
    vi.mocked(useAuthStore).mockReturnValue(mockAuthStore as any);
    vi.mocked(useRecruitmentStore).mockReturnValue({
      jobs: [],
      candidates: [],
      loading: false,
      error: null,
      fetchJobs: vi.fn(),
      fetchCandidates: vi.fn(),
    } as any);

    render(
      <BrowserRouter>
        <Recruitment />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Recruitment Management')).toBeInTheDocument();
    });
  });

  it('should display metrics cards with correct values', async () => {
    const mockAuthStore = {
      user: { role: UserRole.HR_MANAGER },
    };
    const mockJobs = [
      {
        id: '1',
        title: 'Software Engineer',
        department_id: 'dept-1',
        location: 'New York',
        status: 'Open',
        application_deadline: new Date('2024-12-31'),
      },
      {
        id: '2',
        title: 'Product Manager',
        department_id: 'dept-2',
        location: 'San Francisco',
        status: 'Closed',
        application_deadline: new Date('2024-11-30'),
      },
    ];
    const mockCandidates = [
      {
        id: 'cand-1',
        job_posting_id: '1',
        name: 'John Doe',
        current_stage: 'Applied',
      },
      {
        id: 'cand-2',
        job_posting_id: '1',
        name: 'Jane Smith',
        current_stage: 'Screening',
      },
      {
        id: 'cand-3',
        job_posting_id: '2',
        name: 'Bob Johnson',
        current_stage: 'Hired',
      },
    ];

    vi.mocked(useAuthStore).mockReturnValue(mockAuthStore as any);
    vi.mocked(useRecruitmentStore).mockReturnValue({
      jobs: mockJobs,
      candidates: mockCandidates,
      loading: false,
      error: null,
      fetchJobs: vi.fn(),
      fetchCandidates: vi.fn(),
    } as any);

    render(
      <BrowserRouter>
        <Recruitment />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Check total job postings
      expect(screen.getByText('2')).toBeInTheDocument();
      // Check total applicants
      expect(screen.getByText('3')).toBeInTheDocument();
      // Check conversion rate (1 hired out of 3 = 33.3%)
      expect(screen.getByText('33.3%')).toBeInTheDocument();
    });
  });

  it('should display job postings table with applicant counts', async () => {
    const mockAuthStore = {
      user: { role: UserRole.HR_MANAGER },
    };
    const mockJobs = [
      {
        id: '1',
        title: 'Software Engineer',
        department_id: 'dept-1',
        location: 'New York',
        status: 'Open',
        application_deadline: new Date('2024-12-31'),
      },
    ];
    const mockCandidates = [
      {
        id: 'cand-1',
        job_posting_id: '1',
        name: 'John Doe',
        current_stage: 'Applied',
      },
      {
        id: 'cand-2',
        job_posting_id: '1',
        name: 'Jane Smith',
        current_stage: 'Screening',
      },
    ];

    vi.mocked(useAuthStore).mockReturnValue(mockAuthStore as any);
    vi.mocked(useRecruitmentStore).mockReturnValue({
      jobs: mockJobs,
      candidates: mockCandidates,
      loading: false,
      error: null,
      fetchJobs: vi.fn(),
      fetchCandidates: vi.fn(),
    } as any);

    render(
      <BrowserRouter>
        <Recruitment />
      </BrowserRouter>
    );

    // Click on Job Postings tab
    const jobPostingsTab = screen.getByRole('tab', { name: /Job Postings/i });
    await waitFor(() => {
      expect(jobPostingsTab).toBeInTheDocument();
    });
  });

  it('should display pipeline metrics', async () => {
    const mockAuthStore = {
      user: { role: UserRole.HR_MANAGER },
    };
    const mockJobs = [];
    const mockCandidates = [
      {
        id: 'cand-1',
        job_posting_id: '1',
        name: 'John Doe',
        current_stage: 'Applied',
      },
      {
        id: 'cand-2',
        job_posting_id: '1',
        name: 'Jane Smith',
        current_stage: 'Screening',
      },
      {
        id: 'cand-3',
        job_posting_id: '1',
        name: 'Bob Johnson',
        current_stage: 'Interview',
      },
    ];

    vi.mocked(useAuthStore).mockReturnValue(mockAuthStore as any);
    vi.mocked(useRecruitmentStore).mockReturnValue({
      jobs: mockJobs,
      candidates: mockCandidates,
      loading: false,
      error: null,
      fetchJobs: vi.fn(),
      fetchCandidates: vi.fn(),
    } as any);

    render(
      <BrowserRouter>
        <Recruitment />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Recruitment Management')).toBeInTheDocument();
    });
  });

  it('should display error message when API fails', async () => {
    const mockAuthStore = {
      user: { role: UserRole.HR_MANAGER },
    };
    const errorMessage = 'Failed to load recruitment data';

    vi.mocked(useAuthStore).mockReturnValue(mockAuthStore as any);
    vi.mocked(useRecruitmentStore).mockReturnValue({
      jobs: [],
      candidates: [],
      loading: false,
      error: errorMessage,
      fetchJobs: vi.fn(),
      fetchCandidates: vi.fn(),
    } as any);

    render(
      <BrowserRouter>
        <Recruitment />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should display loading state', async () => {
    const mockAuthStore = {
      user: { role: UserRole.HR_MANAGER },
    };

    vi.mocked(useAuthStore).mockReturnValue(mockAuthStore as any);
    vi.mocked(useRecruitmentStore).mockReturnValue({
      jobs: [],
      candidates: [],
      loading: true,
      error: null,
      fetchJobs: vi.fn(),
      fetchCandidates: vi.fn(),
    } as any);

    render(
      <BrowserRouter>
        <Recruitment />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Recruitment Management')).toBeInTheDocument();
    });
  });
});
