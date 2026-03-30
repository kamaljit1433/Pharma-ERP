# Git Hooks

This directory contains Git hooks to enforce repository policies and best practices.

## Installed Hooks

### pre-push
Prevents direct pushes to the `main` branch. All changes to main must go through pull requests.

**What it does:**
- Checks if you're pushing to the main branch
- Blocks the push if attempting to push directly to main
- Provides instructions for creating a feature branch

**To bypass (not recommended):**
```bash
git push --no-verify
```

### commit-msg
Enforces Conventional Commits format for all commit messages.

**What it does:**
- Validates commit message format
- Ensures messages follow the pattern: `<type>(<scope>): <subject>`
- Blocks commits with invalid format

**Valid commit types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `build`: Build system changes
- `revert`: Revert previous commit

**Examples:**
```bash
git commit -m "feat(employee): add emergency contact management"
git commit -m "fix(payroll): correct overtime calculation formula"
git commit -m "docs(api): update authentication endpoint documentation"
```

**To bypass (not recommended):**
```bash
git commit --no-verify -m "your message"
```

## Setup

### Automatic Setup
The hooks are automatically configured when you clone the repository. If they're not working, run:

**Linux/Mac:**
```bash
chmod +x .githooks/setup.sh
./.githooks/setup.sh
```

**Windows (PowerShell):**
```powershell
.\.githooks\setup.ps1
```

### Manual Setup
```bash
git config core.hooksPath .githooks
```

On Linux/Mac, make hooks executable:
```bash
chmod +x .githooks/pre-push
chmod +x .githooks/commit-msg
```

## Verification

To verify hooks are installed:
```bash
git config core.hooksPath
```

Should output: `.githooks`

## Troubleshooting

### Hooks not running
1. Check hooks path configuration:
   ```bash
   git config core.hooksPath
   ```

2. Ensure hooks are executable (Linux/Mac):
   ```bash
   ls -la .githooks/
   ```

3. Re-run setup script

### Permission denied (Linux/Mac)
```bash
chmod +x .githooks/pre-push
chmod +x .githooks/commit-msg
```

### Hooks blocking legitimate actions
If you need to bypass hooks for a legitimate reason (rare):
- For commits: `git commit --no-verify`
- For pushes: `git push --no-verify`

**Note:** Bypassing hooks should be avoided as they enforce important repository policies.

## Adding New Hooks

To add a new hook:

1. Create the hook file in `.githooks/` directory
2. Make it executable (Linux/Mac): `chmod +x .githooks/your-hook`
3. Update this README with hook documentation
4. Test the hook locally
5. Commit and push changes

## Resources

- [Git Hooks Documentation](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Branch Protection Guide](../docs/GIT_BRANCH_PROTECTION.md)
