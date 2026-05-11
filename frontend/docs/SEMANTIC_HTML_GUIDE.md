# Semantic HTML Implementation Guide

## Overview

This guide documents the semantic HTML implementation across the Employee Management System frontend application to ensure WCAG 2.1 AA compliance (Requirement 21.6).

## Core Principles

1. **Use the right element for the job**: Choose HTML elements based on their semantic meaning, not their appearance
2. **Provide structure**: Use landmarks and headings to create a logical document structure
3. **Enhance accessibility**: Semantic HTML improves screen reader navigation and SEO
4. **Maintain consistency**: Follow the same patterns across all components

## HTML5 Semantic Elements

### Document Structure

#### `<header>` - Page/Section Header
Use for introductory content or navigational aids.

```tsx
// Application header
<header role="banner" className="sticky top-0 z-30">
  <div className="flex items-center justify-between">
    <h1>Employee Management System</h1>
    <nav>...</nav>
  </div>
</header>

// Section header
<header>
  <h2>Employee Details</h2>
  <p>View and manage employee information</p>
</header>
```

#### `<nav>` - Navigation
Use for major navigation blocks.

```tsx
<nav role="navigation" aria-label="Main navigation">
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
    <li><a href="/employees">Employees</a></li>
    <li><a href="/attendance">Attendance</a></li>
  </ul>
</nav>
```

#### `<main>` - Main Content
Use for the primary content of the page. Only one per page.

```tsx
<main role="main" aria-label="Main content" id="main-content">
  <h1>Dashboard</h1>
  {/* Page content */}
</main>
```

#### `<aside>` - Sidebar/Complementary Content
Use for content tangentially related to the main content.

```tsx
<aside role="complementary" aria-label="Sidebar">
  <nav>
    {/* Navigation links */}
  </nav>
</aside>
```

#### `<footer>` - Page/Section Footer
Use for footer content.

```tsx
<footer role="contentinfo">
  <p>&copy; 2024 Employee Management System</p>
</footer>
```

### Content Sectioning

#### `<article>` - Self-Contained Content
Use for content that makes sense on its own (blog posts, employee cards, leave requests).

```tsx
<article className="employee-card">
  <header>
    <h3>{employee.name}</h3>
    <p>{employee.designation}</p>
  </header>
  <div className="employee-details">
    {/* Employee information */}
  </div>
</article>
```

#### `<section>` - Thematic Grouping
Use for grouping related content with a heading.

```tsx
<section aria-labelledby="attendance-heading">
  <header>
    <h2 id="attendance-heading">Attendance Summary</h2>
  </header>
  <div className="attendance-stats">
    {/* Attendance data */}
  </div>
</section>
```

### Text Content

#### Headings (`<h1>` - `<h6>`)
Use headings to create a logical document outline. Don't skip levels.

```tsx
<h1>Dashboard</h1>
  <h2>Employee Statistics</h2>
    <h3>Department Breakdown</h3>
  <h2>Attendance Overview</h2>
    <h3>Today's Attendance</h3>
```

#### Lists (`<ul>`, `<ol>`, `<li>`)
Use for lists of items.

```tsx
// Unordered list
<ul>
  <li>Employee Management</li>
  <li>Attendance Tracking</li>
  <li>Leave Management</li>
</ul>

// Ordered list
<ol>
  <li>Submit leave request</li>
  <li>Manager reviews request</li>
  <li>Request approved/rejected</li>
</ol>

// Description list
<dl>
  <dt>Employee ID</dt>
  <dd>EMP001</dd>
  <dt>Department</dt>
  <dd>Engineering</dd>
</dl>
```

### Forms

#### Form Elements
Use proper form elements with labels.

```tsx
<form onSubmit={handleSubmit}>
  <div>
    <label htmlFor="employee-name">
      Employee Name
      <span aria-label="required">*</span>
    </label>
    <input
      id="employee-name"
      type="text"
      name="name"
      required
      aria-required="true"
      aria-describedby="name-error"
    />
    <span id="name-error" role="alert">
      {errors.name}
    </span>
  </div>

  <fieldset>
    <legend>Employment Type</legend>
    <div>
      <input
        type="radio"
        id="permanent"
        name="employment-type"
        value="permanent"
      />
      <label htmlFor="permanent">Permanent</label>
    </div>
    <div>
      <input
        type="radio"
        id="contract"
        name="employment-type"
        value="contract"
      />
      <label htmlFor="contract">Contract</label>
    </div>
  </fieldset>

  <button type="submit">Submit</button>
</form>
```

### Tables

#### Table Structure
Use proper table elements for tabular data.

```tsx
<table>
  <caption>Employee Attendance Records</caption>
  <thead>
    <tr>
      <th scope="col">Date</th>
      <th scope="col">Check In</th>
      <th scope="col">Check Out</th>
      <th scope="col">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>2024-01-15</td>
      <td>09:00 AM</td>
      <td>06:00 PM</td>
      <td>
        <StatusBadge status="present" />
      </td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td colspan="4">Total Records: 30</td>
    </tr>
  </tfoot>
</table>
```

### Interactive Elements

#### Buttons
Use `<button>` for actions, `<a>` for navigation.

```tsx
// Button for action
<button
  type="button"
  onClick={handleClick}
  aria-label="Mark attendance"
>
  Check In
</button>

// Link for navigation
<a href="/employees" aria-label="View all employees">
  Employees
</a>
```

## ARIA Landmarks

Enhance semantic HTML with ARIA roles when needed:

```tsx
<header role="banner">...</header>
<nav role="navigation" aria-label="Main navigation">...</nav>
<main role="main">...</main>
<aside role="complementary">...</aside>
<footer role="contentinfo">...</footer>
<form role="search">...</form>
```

## Component Examples

### Dashboard Component

```tsx
export const Dashboard: React.FC = () => {
  return (
    <main role="main" aria-label="Dashboard">
      <header>
        <h1>Dashboard</h1>
        <p>Welcome back, {user.name}</p>
      </header>

      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">
          Statistics Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <article className="stat-card">
            <h3>Total Employees</h3>
            <p>{stats.totalEmployees}</p>
          </article>
          {/* More stat cards */}
        </div>
      </section>

      <section aria-labelledby="charts-heading">
        <header>
          <h2 id="charts-heading">Attendance Trends</h2>
        </header>
        <div className="charts">
          {/* Charts */}
        </div>
      </section>
    </main>
  );
};
```

### Employee List Component

```tsx
export const EmployeeList: React.FC = () => {
  return (
    <main role="main" aria-label="Employee List">
      <header>
        <h1>Employees</h1>
        <p>Manage employee records</p>
      </header>

      <section aria-labelledby="filters-heading">
        <h2 id="filters-heading" className="sr-only">
          Filter Employees
        </h2>
        <form role="search">
          <label htmlFor="search">Search employees</label>
          <input
            id="search"
            type="search"
            placeholder="Search by name or ID"
          />
        </form>
      </section>

      <section aria-labelledby="results-heading">
        <h2 id="results-heading" className="sr-only">
          Employee Results
        </h2>
        <table>
          <caption>List of all employees</caption>
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Name</th>
              <th scope="col">Department</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.employee_id}</td>
                <td>{employee.name}</td>
                <td>{employee.department}</td>
                <td>
                  <EmployeeStatusBadge status={employee.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
};
```

### Form Component

```tsx
export const EmployeeForm: React.FC = () => {
  return (
    <main role="main" aria-label="Employee Form">
      <header>
        <h1>Add New Employee</h1>
      </header>

      <form onSubmit={handleSubmit} noValidate>
        <fieldset>
          <legend>Personal Information</legend>
          
          <div>
            <label htmlFor="first-name">
              First Name
              <span aria-label="required">*</span>
            </label>
            <input
              id="first-name"
              type="text"
              name="firstName"
              required
              aria-required="true"
              aria-invalid={!!errors.firstName}
              aria-describedby={errors.firstName ? 'first-name-error' : undefined}
            />
            {errors.firstName && (
              <span id="first-name-error" role="alert">
                {errors.firstName}
              </span>
            )}
          </div>

          {/* More fields */}
        </fieldset>

        <fieldset>
          <legend>Employment Details</legend>
          {/* Employment fields */}
        </fieldset>

        <div>
          <button type="submit">Save Employee</button>
          <button type="button" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
};
```

## Screen Reader Only Content

Use the `sr-only` class for content that should only be available to screen readers:

```tsx
<h2 className="sr-only">Navigation Menu</h2>

// CSS for sr-only
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

## Common Mistakes to Avoid

### ❌ Don't Do This

```tsx
// Using div for everything
<div className="header">
  <div className="title">Dashboard</div>
</div>

// Skipping heading levels
<h1>Dashboard</h1>
<h3>Statistics</h3> {/* Skipped h2 */}

// Using div as button
<div onClick={handleClick}>Click me</div>

// Missing labels
<input type="text" placeholder="Name" />
```

### ✅ Do This

```tsx
// Using semantic elements
<header>
  <h1>Dashboard</h1>
</header>

// Proper heading hierarchy
<h1>Dashboard</h1>
<h2>Statistics</h2>

// Using button element
<button onClick={handleClick}>Click me</button>

// Proper labels
<label htmlFor="name">Name</label>
<input id="name" type="text" />
```

## Testing Semantic HTML

### Tools

1. **HTML5 Outliner**: Check document outline
2. **axe DevTools**: Automated accessibility testing
3. **WAVE**: Web accessibility evaluation tool
4. **Screen Readers**: NVDA, JAWS, VoiceOver

### Manual Testing

1. Navigate with keyboard only (Tab, Shift+Tab, Enter, Space)
2. Use screen reader to navigate by landmarks
3. Check heading hierarchy
4. Verify form labels and error messages
5. Test with browser extensions (axe, WAVE)

## Resources

- [MDN: HTML Elements Reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Element)
- [HTML5 Doctor: Element Index](http://html5doctor.com/element-index/)
- [W3C: Using ARIA Landmarks](https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/)
- [WebAIM: Semantic Structure](https://webaim.org/techniques/semanticstructure/)
