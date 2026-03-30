# Contributing Guidelines

Thank you for your interest in contributing to the Employee Management System! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Git Workflow](#git-workflow)
- [Commit Guidelines](#commit-guidelines)
- [Code Style](#code-style)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Documentation](#documentation)
- [Performance Considerations](#performance-considerations)
- [Security Best Practices](#security-best-practices)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please:

- Be respectful and professional in all interactions
- Welcome diverse perspectives and experiences
- Focus on constructive feedback
- Report inappropriate behavior to the team lead

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm or yarn
- PostgreSQL v12 or higher
- Redis v6 or higher
- Git
- GitHub account

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/employee-management-system.git
   cd employee-management-system
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/original-repo/employee-management-system.git
   ```

## Development Setup

### Install Dependencies

```bash
npm install
```

### Set Up Environment Variables

1. Copy `.env.example` to `.env` in the backend directory:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Update the environment variables with your local configuration:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/ems_dev
   REDIS_URL=redis://localhost:6379
   NODE_ENV=development
   ```

### Set Up Database

```bash
cd backend
npm run migrate
cd ..
```

### Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Git Workflow

### Branch Strategy

We follow Git Flow branching strategy:

- **main:** Production-ready code (protected)
- **develop:** Integration branch for features
- **feature/\*:** Feature branches
- **bugfix/\*:** Bug fix branches
- **hotfix/\*:** Production hotfixes

### Creating a Feature Branch

```bash
# Update develop branch
git checkout develop
git pull upstream develop

# Create feature branch
git checkout -b feature/your-feature-name
```

### Branch Naming Conventions

- **Features:** `feature/module-name-description`
  - Example: `feature/employee-emergency-contacts`
- **Bug fixes:** `bugfix/module-name-description`
  - Example: `bugfix/attendance-calculation-error`
- **Hotfixes:** `hotfix/module-name-description`
  - Example: `hotfix/payroll-critical-bug`

## Commit Guidelines

### Conventional Commits

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat:** A new feature
- **fix:** A bug fix
- **docs:** Documentation only changes
- **style:** Changes that don't affect code meaning (formatting, missing semicolons, etc.)
- **refactor:** Code change that neither fixes a bug nor adds a feature
- **perf:** Code change that improves performance
- **test:** Adding missing tests or correcting existing tests
- **chore:** Changes to build process, dependencies, or tooling

### Scope

The scope should specify which module or component is affected:

- `employee` - Employee module
- `attendance` - Attendance module
- `leave` - Leave module
- `payroll` - Payroll module
- `recruitment` - Recruitment module
- `benefits` - Benefits module
- `performance` - Performance module
- `training` - Training module
- `separation` - Separation module
- `common` - Common/shared code
- `config` - Configuration changes

### Subject

- Use imperative mood ("add" not "added" or "adds")
- Don't capitalize first letter
- No period (.) at the end
- Limit to 50 characters

### Body

- Explain what and why, not how
- Wrap at 72 characters
- Separate from subject with a blank line
- Use bullet points for multiple changes

### Footer

- Reference issues: `Closes #123`, `Fixes #456`
- Breaking changes: `BREAKING CHANGE: description`

### Examples

```
feat(employee): add emergency contact management

- Add ability to manage up to 3 emergency contacts per employee
- Implement validation for contact details
- Add UI components for contact management

Closes #123
```

```
fix(attendance): correct working hours calculation

The working hours calculation was not accounting for lunch breaks.
This fix ensures lunch breaks are properly deducted from total hours.

Fixes #456
```

```
docs(readme): update setup instructions

Updated the setup instructions to include Redis configuration.

Closes #789
```

## Code Style

### TypeScript

- Use strict mode
- Avoid `any` type - use proper typing
- Use interfaces for object shapes
- Add JSDoc comments for public functions

```typescript
/**
 * Calculates the total working hours for an employee
 * @param attendanceId - The attendance record ID
 * @returns The total working hours
 * @throws {NotFoundException} If attendance record not found
 */
export async function calculateWorkingHours(attendanceId: string): Promise<number> {
  // Implementation
}
```

### React Components

- Use functional components with hooks
- Use PascalCase for component names
- Co-locate styles with components
- Add prop types with TypeScript

```typescript
interface EmployeeListProps {
  employees: Employee[]
  onSelect: (employee: Employee) => void
  isLoading?: boolean
}

export function EmployeeList({ employees, onSelect, isLoading }: EmployeeListProps) {
  // Implementation
}
```

### Naming Conventions

- **Variables/Functions:** camelCase
- **Classes/Components:** PascalCase
- **Constants:** UPPER_SNAKE_CASE
- **Private members:** _leadingUnderscore

### File Organization

```
src/
├── components/
│   ├── EmployeeList.tsx
│   ├── EmployeeList.test.tsx
│   └── EmployeeList.module.css
├── services/
│   ├── employeeService.ts
│   └── employeeService.test.ts
├── types/
│   └── employee.ts
└── utils/
    └── validation.ts
```

### Formatting

- Use Prettier for automatic formatting
- Run `npm run format` before committing
- ESLint configuration is enforced in CI/CD

## Testing

### Test Coverage Requirements

- Minimum 80% code coverage
- All public functions must have tests
- All business logic must be tested
- Edge cases and error conditions must be tested

### Unit Tests

```typescript
describe('calculateWorkingHours', () => {
  it('should calculate working hours correctly', () => {
    const result = calculateWorkingHours(480, 60) // 8 hours - 1 hour lunch
    expect(result).toBe(7)
  })

  it('should handle edge case of zero minutes', () => {
    const result = calculateWorkingHours(0, 0)
    expect(result).toBe(0)
  })

  it('should throw error for negative values', () => {
    expect(() => calculateWorkingHours(-100, 60)).toThrow()
  })
})
```

### Property-Based Tests

```typescript
import fc from 'fast-check'

describe('calculateWorkingHours - Property Tests', () => {
  it('should always return non-negative hours', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1440 }), (minutes) => {
        const result = calculateWorkingHours(minutes, 0)
        return result >= 0
      })
    )
  })
})
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- employee.test.ts
```

## Pull Request Process

### Before Creating a PR

1. Update your branch with the latest develop:
   ```bash
   git fetch upstream
   git rebase upstream/develop
   ```

2. Run all checks locally:
   ```bash
   npm run lint
   npm run type-check
   npm run test
   npm run build
   ```

3. Fix any issues before pushing

### Creating a PR

1. Push your branch:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Create a Pull Request on GitHub:
   - **Base:** develop (or main for hotfixes)
   - **Compare:** your feature branch
   - **Title:** Follow conventional commits format
   - **Description:** Use the PR template

### PR Description Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
Describe how you tested these changes.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] No new warnings generated
```

### PR Review Process

1. At least 2 approvals required
2. All status checks must pass
3. Branch must be up to date with develop
4. Code owners must approve changes in their areas

### Addressing Review Comments

1. Make requested changes
2. Commit with descriptive message
3. Push changes (don't force push)
4. Re-request review

### Merging

- Use "Squash and merge" for feature branches
- Use "Create a merge commit" for release branches
- Delete branch after merging

## Documentation

### README Updates

Update README.md if your changes affect:
- Setup instructions
- Project structure
- Technology stack
- Development workflow

### Code Comments

- Add JSDoc comments to public functions
- Explain complex business logic
- Document edge cases and assumptions
- Keep comments up to date with code

### API Documentation

If adding new endpoints:
- Document request/response formats
- Include example requests
- Document error responses
- Update API documentation file

## Performance Considerations

### Backend

- Use database indexes for frequently queried fields
- Implement pagination for large datasets
- Use caching for frequently accessed data
- Avoid N+1 queries
- Profile code for bottlenecks

### Frontend

- Optimize bundle size
- Use code splitting for large components
- Implement lazy loading for images
- Minimize re-renders
- Use React DevTools Profiler

## Security Best Practices

### Never Commit

- API keys or secrets
- Database credentials
- Personal information
- Sensitive configuration

### Use Environment Variables

```typescript
const apiKey = process.env.EXTERNAL_API_KEY
const dbUrl = process.env.DATABASE_URL
```

### Input Validation

```typescript
// Always validate and sanitize user input
const email = sanitizeEmail(userInput)
if (!isValidEmail(email)) {
  throw new ValidationError('Invalid email')
}
```

### Authentication & Authorization

- Implement proper authentication checks
- Verify user permissions before operations
- Use role-based access control
- Log security-relevant events

### Data Protection

- Encrypt sensitive data at rest
- Use HTTPS for all communication
- Implement proper CORS policies
- Sanitize error messages

## Questions or Need Help?

- Check existing issues and discussions
- Review documentation in the Docs/ directory
- Ask in team meetings or Slack
- Create a discussion on GitHub

---

Thank you for contributing to the Employee Management System! 🎉
