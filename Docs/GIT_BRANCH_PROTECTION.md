# Git Branch Protection Configuration

## Overview

This document outlines the branch protection rules configured for the Employee Management System repository to ensure code quality, prevent accidental changes, and maintain a stable main branch.

## Local Git Configuration

The following local Git configurations have been applied to the repository:

### Configured Settings

```bash
# Prevent force pushes to the repository
git config --local receive.denyNonFastForwards true

# Prevent branch deletion
git config --local receive.denyDeletes true
```

These settings provide basic protection at the local repository level.

## GitHub Branch Protection Rules

Once this repository is pushed to GitHub, configure the following branch protection rules for the `main` branch:

### Required Configuration Steps

1. Navigate to your GitHub repository
2. Go to **Settings** → **Branches**
3. Click **Add rule** under "Branch protection rules"
4. Enter `main` as the branch name pattern
5. Enable the following settings:

### Recommended Protection Rules

#### 1. Require Pull Request Reviews Before Merging
- ✅ **Enable:** Require a pull request before merging
- ✅ **Required approvals:** 1 (minimum)
- ✅ **Dismiss stale pull request approvals when new commits are pushed**
- ✅ **Require review from Code Owners** (if CODEOWNERS file exists)

**Purpose:** Ensures all code changes are reviewed by at least one team member before merging.

#### 2. Require Status Checks to Pass Before Merging
- ✅ **Enable:** Require status checks to pass before merging
- ✅ **Require branches to be up to date before merging**
- Select required status checks:
  - CI/CD pipeline (GitHub Actions)
  - Unit tests
  - Integration tests
  - Linting checks
  - Type checking

**Purpose:** Ensures all automated tests and checks pass before code can be merged.

#### 3. Require Conversation Resolution Before Merging
- ✅ **Enable:** Require conversation resolution before merging

**Purpose:** Ensures all review comments are addressed before merging.

#### 4. Require Signed Commits
- ✅ **Enable:** Require signed commits

**Purpose:** Ensures commit authenticity and prevents unauthorized commits.

#### 5. Require Linear History
- ✅ **Enable:** Require linear history

**Purpose:** Prevents merge commits and maintains a clean, linear Git history.

#### 6. Include Administrators
- ✅ **Enable:** Include administrators

**Purpose:** Applies the same rules to repository administrators, ensuring consistency.

#### 7. Restrict Who Can Push to Matching Branches
- ✅ **Enable:** Restrict pushes that create matching branches
- Add specific users/teams who can push directly (typically none for main branch)

**Purpose:** Prevents direct pushes to the main branch.

#### 8. Allow Force Pushes
- ❌ **Disable:** Do not allow force pushes

**Purpose:** Prevents rewriting history on the main branch.

#### 9. Allow Deletions
- ❌ **Disable:** Do not allow deletions

**Purpose:** Prevents accidental deletion of the main branch.

## Branch Strategy

### Main Branch (`main`)
- Production-ready code only
- All changes must go through pull requests
- Requires passing CI/CD checks
- Requires code review approval
- Protected from force pushes and deletion

### Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes and Commit**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

3. **Push to Remote**
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create Pull Request**
   - Go to GitHub repository
   - Click "New Pull Request"
   - Select your feature branch
   - Fill in PR template with description
   - Request reviewers

5. **Address Review Comments**
   - Make requested changes
   - Push additional commits
   - Resolve conversations

6. **Merge After Approval**
   - Ensure all checks pass
   - Ensure all conversations resolved
   - Merge using "Squash and merge" or "Rebase and merge"

## Commit Message Convention

Follow the Conventional Commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```bash
feat(employee): add emergency contact management
fix(payroll): correct overtime calculation formula
docs(api): update authentication endpoint documentation
test(attendance): add property tests for working hours calculation
```

## Code Review Guidelines

### For Reviewers
- Review code within 24 hours
- Check for code quality, readability, and maintainability
- Verify tests are included and passing
- Ensure documentation is updated
- Look for security vulnerabilities
- Verify adherence to coding standards

### For Authors
- Keep PRs small and focused (< 400 lines changed)
- Write clear PR descriptions
- Include screenshots for UI changes
- Link related issues
- Respond to review comments promptly
- Update PR based on feedback

## CI/CD Integration

The following checks should be configured in GitHub Actions:

1. **Linting**
   - ESLint for TypeScript/JavaScript
   - Prettier for code formatting

2. **Type Checking**
   - TypeScript compiler checks

3. **Unit Tests**
   - Jest test suite
   - Minimum 80% code coverage

4. **Property-Based Tests**
   - fast-check test suite

5. **Integration Tests**
   - API endpoint tests

6. **Build Verification**
   - Frontend build (Vite)
   - Backend build (TypeScript)

7. **Security Scanning**
   - Dependency vulnerability checks
   - SAST (Static Application Security Testing)

## Emergency Procedures

### Hotfix Process
For critical production issues:

1. Create hotfix branch from `main`
   ```bash
   git checkout -b hotfix/critical-issue-description main
   ```

2. Make minimal changes to fix the issue

3. Create PR with "HOTFIX" label

4. Request expedited review

5. Merge after approval (may bypass some checks with admin override if critical)

### Rollback Process
If a merged change causes issues:

1. Create revert PR
   ```bash
   git revert <commit-hash>
   git push origin revert/description
   ```

2. Create PR for the revert

3. Merge after review

## Monitoring and Compliance

### Regular Audits
- Review branch protection settings quarterly
- Audit commit history for unauthorized changes
- Review and update CODEOWNERS file
- Verify CI/CD pipeline effectiveness

### Metrics to Track
- PR merge time
- Number of review iterations
- CI/CD success rate
- Code coverage trends
- Security vulnerability findings

## Additional Resources

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Best Practices](https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project)

## Contact

For questions about branch protection rules or Git workflow:
- Contact: Development Team Lead
- Documentation: This file
- Issues: Create a GitHub issue with the "process" label
