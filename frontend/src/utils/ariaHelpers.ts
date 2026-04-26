/**
 * ARIA Helper Utilities
 * 
 * Provides utility functions for generating consistent ARIA labels and descriptions
 * across the application.
 * 
 * Requirements: 21.4, 21.11, 21.12
 */

/**
 * Generate ARIA label for notification count
 */
export const getNotificationAriaLabel = (count: number): string => {
  if (count === 0) {
    return 'Notifications';
  }
  return `Notifications, ${count} unread ${count === 1 ? 'notification' : 'notifications'}`;
};

/**
 * Generate ARIA label for loading state
 */
export const getLoadingAriaLabel = (context?: string): string => {
  return context ? `Loading ${context}` : 'Loading';
};

/**
 * Generate ARIA label for action buttons
 */
export const getActionAriaLabel = (
  action: string,
  target?: string,
  context?: string
): string => {
  if (target && context) {
    return `${action} ${target} for ${context}`;
  }
  if (target) {
    return `${action} ${target}`;
  }
  return action;
};

/**
 * Generate ARIA label for status badges
 */
export const getStatusAriaLabel = (status: string, context?: string): string => {
  const formattedStatus = status.replace(/_/g, ' ').toLowerCase();
  return context
    ? `${context} status: ${formattedStatus}`
    : `Status: ${formattedStatus}`;
};

/**
 * Generate ARIA label for pagination
 */
export const getPaginationAriaLabel = (
  currentPage: number,
  totalPages: number
): string => {
  return `Page ${currentPage} of ${totalPages}`;
};

/**
 * Generate ARIA label for sort buttons
 */
export const getSortAriaLabel = (
  column: string,
  direction?: 'asc' | 'desc' | null
): string => {
  if (!direction) {
    return `Sort by ${column}`;
  }
  const directionText = direction === 'asc' ? 'ascending' : 'descending';
  return `Sort by ${column}, currently sorted ${directionText}`;
};

/**
 * Generate ARIA label for filter controls
 */
export const getFilterAriaLabel = (
  filterName: string,
  activeCount?: number
): string => {
  if (activeCount && activeCount > 0) {
    return `${filterName} filter, ${activeCount} ${activeCount === 1 ? 'filter' : 'filters'} active`;
  }
  return `${filterName} filter`;
};

/**
 * Generate ARIA label for date range
 */
export const getDateRangeAriaLabel = (
  startDate?: string,
  endDate?: string
): string => {
  if (startDate && endDate) {
    return `Date range from ${startDate} to ${endDate}`;
  }
  if (startDate) {
    return `Date from ${startDate}`;
  }
  if (endDate) {
    return `Date until ${endDate}`;
  }
  return 'Select date range';
};

/**
 * Generate ARIA label for progress indicators
 */
export const getProgressAriaLabel = (
  value: number,
  max: number = 100,
  context?: string
): string => {
  const percentage = Math.round((value / max) * 100);
  return context
    ? `${context} progress: ${percentage}%`
    : `Progress: ${percentage}%`;
};

/**
 * Generate ARIA label for file upload
 */
export const getFileUploadAriaLabel = (
  acceptedTypes?: string[],
  maxSize?: number
): string => {
  let label = 'Upload file';
  
  if (acceptedTypes && acceptedTypes.length > 0) {
    label += `, accepted types: ${acceptedTypes.join(', ')}`;
  }
  
  if (maxSize) {
    const sizeMB = maxSize / (1024 * 1024);
    label += `, maximum size: ${sizeMB}MB`;
  }
  
  return label;
};

/**
 * Generate ARIA label for search input
 */
export const getSearchAriaLabel = (context?: string): string => {
  return context ? `Search ${context}` : 'Search';
};

/**
 * Generate ARIA label for export buttons
 */
export const getExportAriaLabel = (format: string, context?: string): string => {
  return context
    ? `Export ${context} as ${format.toUpperCase()}`
    : `Export as ${format.toUpperCase()}`;
};

/**
 * Generate ARIA label for modal/dialog
 */
export const getDialogAriaLabel = (title: string, type?: 'modal' | 'alert'): string => {
  const typeText = type === 'alert' ? 'Alert' : 'Dialog';
  return `${typeText}: ${title}`;
};

/**
 * Generate ARIA description for form fields
 */
export const getFieldAriaDescription = (
  fieldName: string,
  required?: boolean,
  format?: string
): string => {
  let description = fieldName;
  
  if (required) {
    description += ', required field';
  }
  
  if (format) {
    description += `, format: ${format}`;
  }
  
  return description;
};

/**
 * Generate ARIA label for navigation items
 */
export const getNavAriaLabel = (label: string, isActive?: boolean): string => {
  return isActive ? `${label}, current page` : label;
};

/**
 * Generate ARIA label for expandable sections
 */
export const getExpandableAriaLabel = (
  title: string,
  isExpanded: boolean
): string => {
  return `${title}, ${isExpanded ? 'expanded' : 'collapsed'}`;
};

/**
 * Generate ARIA label for tabs
 */
export const getTabAriaLabel = (
  tabName: string,
  isSelected: boolean,
  index: number,
  total: number
): string => {
  return `${tabName}, tab ${index + 1} of ${total}${isSelected ? ', selected' : ''}`;
};

/**
 * Generate ARIA live region announcement
 */
export const getAnnouncementText = (
  type: 'success' | 'error' | 'info' | 'warning',
  message: string
): string => {
  const prefix = type.charAt(0).toUpperCase() + type.slice(1);
  return `${prefix}: ${message}`;
};
