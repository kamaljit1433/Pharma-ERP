# Quick Start: Git Setup

## Overview

This repository has been configured with branch protection rules and Git hooks to ensure code quality and prevent accidental changes to the main branch.

## What's Already Configured

### ✅ Local Git Settings
The following settings are already configured in the repository:

```bash
# Prevent force pushes
receive.denyNonFastForwards = true

# Prevent branch deletion
receive.denyDeletes = true

# Use custom Git hooks
core.hooksPath = .githooks
```

### ✅ Git Hooks
Two Git hooks are installed and active:

1. **pre-push**: Prevents direct pushes to main branch
2. **commit-msg**: Enforces conventional commit message format

### ✅ GitHub Templates
- Pull Request template (`.github/PULL_REQUEST_TEMPLATE.md`)
- CODEOWNERS file (`.github/CODEOWNERS`)

## Getting Started

### 1. Verify Git Configuration

Check that hooks are configured:
```bash
git config core.hooksPath
```
Expected output: `.githooks`

### 2. Test Commit Message Format

Try making a commit with proper format:
```bash
git commit -m "feat(test): verify commit message hook"
```

This should succeed. Try an invalid format:
```bash
git commit -m "invalid commit message"
```

This should be blocked by the commit-msg hook.

### 3. Understand the Workflow

#### Creating a Feature Branch
```bash
# Create and switch to a new feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ...

# Commit with conventional format
git commit -m "feat(module): add new feature"

# Push to remote
git push origin feature/your-feature-name
```

#### Committing Changes
Always use conventional commit format:
```
<type>(<scope>): <subject>
```

**Valid types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Maintenance

**Examples:**
```bash
git commit -m "feat(employee): add emergency contact form"
git commit -m "fix(payroll): correct overtime calculation"
git commit -m "docs(api): update authentication guide"
git commit -m "test(attendance): add property tests"
```

#### Pushing Changes
```bash
# Push feature branch (allowed)
git push origin feature/your-feature-name

# Push to main (blocked by pre-push hook)
git checkout main
git push origin main  # ❌ This will be blocked
```

### 4. Creating Pull Requests

When you push a feature branch to GitHub:

1. Go to the repository on GitHub
2. Click "Compare & pull request"
3. Fill in the PR template:
   - Description of changes
   - Type of change
   - Related issues
   - Testing performed
   - Checklist items
4. Request reviewers (auto-assigned based on CODEOWNERS)
5. Wait for CI/CD checks to pass
6. Address review comments
7. Merge after approval

## Next Steps: GitHub Configuration

Once you push this repository to GitHub, configure branch protection rules:

### Quick Setup
1. Go to **Settings** → **Branches**
2. Click **Add rule**
3. Branch name pattern: `main`
4. Enable these settings:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (1 minimum)
   - ✅ Dismiss stale pull request approvals
   - ✅ Require status checks to pass
   - ✅ Require conversation resolution
   - ✅ Require linear history
   - ✅ Include administrators
   - ❌ Allow force pushes (disabled)
   - ❌ Allow deletions (disabled)

For detailed instructions, see [GIT_BRANCH_PROTECTION.md](./GIT_BRANCH_PROTECTION.md)

## Troubleshooting

### Hooks Not Working

If Git hooks aren't running:

**Windows (PowerShell):**
```powershell
.\.githooks\setup.ps1
```

**Linux/Mac:**
```bash
chmod +x .githooks/setup.sh
./.githooks/setup.sh
```

### Need to Bypass Hooks

In rare cases where you need to bypass hooks:
```bash
# Bypass commit-msg hook
git commit --no-verify -m "your message"

# Bypass pre-push hook
git push --no-verify
```

⚠️ **Warning:** Only bypass hooks when absolutely necessary.

### Update CODEOWNERS

Edit `.github/CODEOWNERS` and replace placeholder teams with your actual GitHub teams:
```
# Replace @your-org/dev-team with @your-actual-org/your-actual-team
* @your-actual-org/your-actual-team
```

## Resources

- [Full Branch Protection Guide](./GIT_BRANCH_PROTECTION.md)
- [Git Hooks Documentation](./.githooks/README.md)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)

## Support

If you encounter issues with Git configuration:
1. Check this guide first
2. Review [GIT_BRANCH_PROTECTION.md](./GIT_BRANCH_PROTECTION.md)
3. Contact the DevOps team
4. Create an issue with the "process" label
