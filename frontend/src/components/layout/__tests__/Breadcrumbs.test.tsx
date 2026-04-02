import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { Breadcrumbs } from '../Breadcrumbs';

// Mock useLocation hook
const mockUseLocation = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => mockUseLocation(),
  };
});

describe('Breadcrumbs Component', () => {
  it('should not render breadcrumbs on dashboard page', () => {
    mockUseLocation.mockReturnValue({ pathname: '/dashboard' });

    const { container } = render(
      <BrowserRouter>
        <Breadcrumbs />
      </BrowserRouter>
    );

    expect(container.firstChild).toBeNull();
  });

  it('should not render breadcrumbs on root page', () => {
    mockUseLocation.mockReturnValue({ pathname: '/' });

    const { container } = render(
      <BrowserRouter>
        <Breadcrumbs />
      </BrowserRouter>
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render breadcrumbs for single-level nested page', () => {
    mockUseLocation.mockReturnValue({ pathname: '/employees' });

    render(
      <BrowserRouter>
        <Breadcrumbs />
      </BrowserRouter>
    );

    // Should show Dashboard link
    expect(screen.getByText('Dashboard')).toBeInTheDocument();

    // Should show current page as non-clickable
    const employeesText = screen.getByText('Employees');
    expect(employeesText).toBeInTheDocument();
    expect(employeesText.tagName).toBe('SPAN');
    expect(employeesText).toHaveAttribute('aria-current', 'page');
  });

  it('should render breadcrumbs for multi-level nested page', () => {
    mockUseLocation.mockReturnValue({ pathname: '/employees/123/edit' });

    render(
      <BrowserRouter>
        <Breadcrumbs />
      </BrowserRouter>
    );

    // Should show Dashboard link
    expect(screen.getByText('Dashboard')).toBeInTheDocument();

    // Should show intermediate pages as clickable links
    expect(screen.getByText('Employees')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();

    // Should show current page as non-clickable
    const editText = screen.getByText('Edit');
    expect(editText).toBeInTheDocument();
    expect(editText.tagName).toBe('SPAN');
    expect(editText).toHaveAttribute('aria-current', 'page');
  });

  it('should format kebab-case route names correctly', () => {
    mockUseLocation.mockReturnValue({ pathname: '/bank-details' });

    render(
      <BrowserRouter>
        <Breadcrumbs />
      </BrowserRouter>
    );

    expect(screen.getByText('Bank Details')).toBeInTheDocument();
  });

  it('should use custom labels for known routes', () => {
    mockUseLocation.mockReturnValue({ pathname: '/geo-tracking' });

    render(
      <BrowserRouter>
        <Breadcrumbs />
      </BrowserRouter>
    );

    expect(screen.getByText('Geo Tracking')).toBeInTheDocument();
  });

  it('should render home icon for dashboard link', () => {
    mockUseLocation.mockReturnValue({ pathname: '/employees' });

    render(
      <BrowserRouter>
        <Breadcrumbs />
      </BrowserRouter>
    );

    // Check for home icon (lucide-react renders as svg)
    const homeLink = screen.getByText('Dashboard').closest('a');
    expect(homeLink).toBeInTheDocument();
    expect(homeLink?.querySelector('svg')).toBeInTheDocument();
  });

  it('should make intermediate breadcrumbs clickable', () => {
    mockUseLocation.mockReturnValue({ pathname: '/employees/123/edit' });

    render(
      <BrowserRouter>
        <Breadcrumbs />
      </BrowserRouter>
    );

    // Dashboard should be a link
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');

    // Employees should be a link
    const employeesLink = screen.getByText('Employees').closest('a');
    expect(employeesLink).toHaveAttribute('href', '/employees');

    // 123 should be a link
    const idLink = screen.getByText('123').closest('a');
    expect(idLink).toHaveAttribute('href', '/employees/123');

    // Edit should NOT be a link (current page)
    const editSpan = screen.getByText('Edit');
    expect(editSpan.tagName).toBe('SPAN');
    expect(editSpan.closest('a')).toBeNull();
  });

  it('should render separators between breadcrumb items', () => {
    mockUseLocation.mockReturnValue({ pathname: '/employees/123' });

    const { container } = render(
      <BrowserRouter>
        <Breadcrumbs />
      </BrowserRouter>
    );

    // Should have separators (ChevronRight icons)
    const separators = container.querySelectorAll('[role="presentation"]');
    expect(separators.length).toBeGreaterThan(0);
  });

  it('should handle complex nested routes', () => {
    mockUseLocation.mockReturnValue({
      pathname: '/recruitment/jobs/456/candidates/789/interviews',
    });

    render(
      <BrowserRouter>
        <Breadcrumbs />
      </BrowserRouter>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Recruitment')).toBeInTheDocument();
    expect(screen.getByText('Jobs')).toBeInTheDocument();
    expect(screen.getByText('456')).toBeInTheDocument();
    expect(screen.getByText('Candidates')).toBeInTheDocument();
    expect(screen.getByText('789')).toBeInTheDocument();

    // Last item should be current page
    const interviewsText = screen.getByText('Interviews');
    expect(interviewsText).toHaveAttribute('aria-current', 'page');
  });

  it('should have proper accessibility attributes', () => {
    mockUseLocation.mockReturnValue({ pathname: '/employees' });

    const { container } = render(
      <BrowserRouter>
        <Breadcrumbs />
      </BrowserRouter>
    );

    // Should have nav with aria-label
    const nav = container.querySelector('nav');
    expect(nav).toHaveAttribute('aria-label', 'breadcrumb');

    // Current page should have aria-current
    const currentPage = screen.getByText('Employees');
    expect(currentPage).toHaveAttribute('aria-current', 'page');
    expect(currentPage).toHaveAttribute('aria-disabled', 'true');
  });

  it('should handle trailing slashes in pathname', () => {
    mockUseLocation.mockReturnValue({ pathname: '/employees/' });

    render(
      <BrowserRouter>
        <Breadcrumbs />
      </BrowserRouter>
    );

    expect(screen.getByText('Employees')).toBeInTheDocument();
  });

  it('should handle leading slashes in pathname', () => {
    mockUseLocation.mockReturnValue({ pathname: 'employees' });

    render(
      <BrowserRouter>
        <Breadcrumbs />
      </BrowserRouter>
    );

    expect(screen.getByText('Employees')).toBeInTheDocument();
  });
});
