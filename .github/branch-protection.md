# Branch Protection Rules

This document outlines the branch protection rules configured for the Employee Management System repository.

## Protected Branches

### Main Branch (`main`)

The `main` branch is the production-ready branch and is protected with the following rules:

#### 1. Require Pull Request Reviews Before Merging
- **Minimum number of approvals:** 2
- **Dismiss stale pull request approvals when new commits are pushed:** ✅ Enabled
- **Require review from code owners:** ✅ Enabled
- **Allow specified actors to bypass required pull requests:** ❌ Disabled

**Rationale:** Ensures code quality and prevents accidental merges. Multiple reviewers catch potential issues, and stale approvals are dismissed to ensure reviews are current.

#### 2. Require Status Checks to Pass Before Merging
- **Require branches to be up to date before merging:** ✅ Enabled
- **Required status checks:**
  - `lint` - ESLint code quality checks
  - `type-check` - TypeScript type checking
  - `test` - Unit and integration tests
  - `build` - Build verification

**Rationale:** Ensures all automated checks pass before code reaches production. Branches must be up to date to prevent merge conflicts and ensure compatibility with the latest main branch code.

#### 3. Require Code Owner Review
- **Code owners file:** `.github/CODEOWNERS`
- **Require code owner review:** ✅ Enabled

**Rationale:** Ensures domain experts review changes in their areas of responsibility.

#### 4. Restrict Who Can Push to Matching Branches
- **Allow force pushes:** ❌ Disabled
- **Allow deletions:** ❌ Disabled

**Rationale:** Prevents accidental force pushes and branch deletions that could lose history.

## Implementation

### GitHub Settings

To configure these rules in GitHub:

1. Go to **Settings** → **Branches**
2. Click **Add rule** under "Branch protection rules"
3. Enter `main` as the branch name pattern
4. Configure the following options:

```
✅ Require a pull request before merging
   ✅ Require approvals (2)
   ✅ Dismiss stale pull request approvals when new commits are pushed
   ✅ Require review from Code Owners
   ❌ Allow specified actors to bypass required pull requests

✅ Require status checks to pass before merging
   ✅ Require branches to be up to date before merging
   Required status checks:
   - lint
   - type-check
   - test
   - build

✅ Require code owner review

❌ Allow force pushes
❌ Allow deletions
```

### Local Git Hooks (Optional)

To prevent accidental commits to main locally, add a pre-commit hook:

**File:** `.git/hooks/pre-commit`

```bash
#!/bin/bash

BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ "$BRANCH" = "main" ]; then
  echo "❌ You cannot commit directly to the main branch."
  echo "Please create a feature branch and submit a pull request."
  exit 1
fi

exit 0
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

## Workflow

### Creating a Feature

1. Create a feature branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit:
   ```bash
   git add .
   git commit -m "feat(module): description"
   ```

3. Push your branch:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a Pull Request (PR) on GitHub:
   - Target: `develop` branch
   - Title: Follow conventional commits format
   - Description: Explain what and why

5. Ensure all checks pass:
   - ✅ Lint checks
   - ✅ Type checks
   - ✅ Tests pass
   - ✅ Build succeeds

6. Request reviews from at least 2 team members

7. Address review comments

8. Merge when approved

### Releasing to Production

1. Create a release PR from `develop` to `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b release/v1.x.x
   ```

2. Update version numbers and changelog

3. Create PR to `main`

4. Ensure all checks pass

5. Get required approvals (2)

6. Merge to `main`

7. Tag the release:
   ```bash
   git tag -a v1.x.x -m "Release version 1.x.x"
   git push origin v1.x.x
   ```

## Troubleshooting

### PR Cannot Be Merged - Status Checks Failed

**Solution:** Fix the failing checks locally:
- Run `npm run lint` to fix linting issues
- Run `npm run type-check` to fix type errors
- Run `npm run test` to fix test failures
- Run `npm run build` to verify build succeeds

### PR Cannot Be Merged - Branch Out of Date

**Solution:** Update your branch with the latest main:
```bash
git fetch origin
git rebase origin/main
git push origin feature/your-feature-name --force-with-lease
```

### PR Cannot Be Merged - Insufficient Approvals

**Solution:** Request reviews from team members and address their feedback.

### PR Cannot Be Merged - Code Owner Review Required

**Solution:** Request review from the code owner listed in `.github/CODEOWNERS`.

## Code Owners

The `.github/CODEOWNERS` file specifies who should review changes in specific areas:

```
# Global owners
* @team-lead

# Module-specific owners
/backend/src/modules/employee/ @employee-team
/backend/src/modules/attendance/ @attendance-team
/backend/src/modules/payroll/ @payroll-team
/frontend/src/components/employee/ @frontend-team
```

## Related Documentation

- [Contributing Guidelines](../CONTRIBUTING.md)
- [Git Workflow](../docs/GIT_WORKFLOW.md)
- [CI/CD Pipeline](../docs/CI_CD.md)
