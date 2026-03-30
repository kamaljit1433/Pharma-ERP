# GitHub Actions Setup Guide

## Initial Configuration

### 1. Repository Secrets Setup

Add the following secrets to your GitHub repository for deployment workflows:

**Steps:**
1. Go to Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret below

**Required Secrets:**

```
DEPLOY_KEY
  Description: SSH private key for backend deployment
  Value: [Your SSH private key content]

DEPLOY_HOST
  Description: Backend deployment server hostname
  Value: api.example.com

DEPLOY_USER
  Description: SSH user for backend deployment
  Value: deploy

CDN_API_KEY
  Description: CDN API authentication key
  Value: [Your CDN API key]

CDN_ZONE_ID
  Description: CDN zone identifier
  Value: [Your CDN zone ID]

SNYK_TOKEN
  Description: Snyk security scanning token
  Value: [Your Snyk API token]
```

### 2. Environment Configuration

Create environment-specific configurations in GitHub:

**Steps:**
1. Go to Settings → Environments
2. Create "production" environment
3. Add deployment protection rules

**Production Environment:**
- Require approval before deployment
- Restrict to main branch
- Add required reviewers

### 3. Branch Protection Rules

**For main branch:**
1. Go to Settings → Branches
2. Click "Add rule"
3. Branch name pattern: `main`
4. Configure:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Require code reviews before merging (1 approval)
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require conversation resolution before merging

**Status checks required:**
- lint
- test-backend
- test-frontend
- build
- security

**For develop branch:**
1. Branch name pattern: `develop`
2. Configure:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require code reviews before merging (1 approval)

**Status checks required:**
- lint
- test-backend
- test-frontend
- build

---

## Workflow Customization

### 1. Adjust Node.js Versions

Edit `.github/workflows/ci.yml`:

```yaml
strategy:
  matrix:
    node-version: [18, 20, 22]  # Modify as needed
```

### 2. Configure Test Thresholds

Edit `.github/workflows/ci.yml` for coverage requirements:

```yaml
- name: Run backend unit tests
  run: cd backend && npm run test -- --coverage --testPathPattern="\.test\.ts$"
```

### 3. Customize E2E Test Browsers

Edit `.github/workflows/e2e.yml`:

```yaml
strategy:
  matrix:
    browser: [chromium, firefox, webkit]  # Add/remove browsers
```

### 4. Adjust Deployment Targets

Edit `.github/workflows/deploy.yml`:

```yaml
deploy-backend:
  environment:
    name: production
    url: https://api.example.com  # Update URL
```

---

## Local Development Setup

### Prerequisites

```bash
# Install GitHub CLI
brew install gh  # macOS
# or
choco install gh  # Windows
# or
sudo apt-get install gh  # Linux

# Authenticate with GitHub
gh auth login
```

### Running Workflows Locally

**Using act (GitHub Actions locally):**

```bash
# Install act
brew install act  # macOS

# Run specific workflow
act -j lint

# Run all workflows
act

# Run with specific event
act push
```

**Using Docker:**

```bash
# Build and test locally
docker-compose up -d postgres redis
npm ci
npm run test
```

---

## Monitoring & Maintenance

### 1. Monitor Workflow Performance

```bash
# View recent workflow runs
gh run list --workflow=ci.yml --limit 20

# View specific run details
gh run view <run-id>

# View run logs
gh run view <run-id> --log
```

### 2. Update Dependencies

**GitHub Dependabot:**
1. Go to Settings → Code security and analysis
2. Enable "Dependabot alerts"
3. Enable "Dependabot security updates"
4. Enable "Dependabot version updates"

**Manual updates:**
```bash
npm update
npm audit fix
```

### 3. Review Security Scans

```bash
# View npm audit results
npm audit

# View Snyk results
snyk test
```

---

## Troubleshooting

### Workflow Not Triggering

**Check:**
1. Verify branch name matches trigger conditions
2. Confirm file changes match path filters
3. Check branch protection rules aren't blocking

**Solution:**
```bash
# Force workflow run
gh workflow run ci.yml --ref main
```

### Tests Failing in CI but Passing Locally

**Common causes:**
1. Different Node.js version
2. Missing environment variables
3. Database/Redis not available
4. File path issues (Windows vs Linux)

**Debug:**
```bash
# Run with same Node version as CI
nvm use 22
npm test

# Check environment variables
echo $DATABASE_URL
echo $REDIS_URL

# Run with CI environment
NODE_ENV=test npm test
```

### Deployment Failures

**Check:**
1. Verify secrets are set correctly
2. Confirm deployment host is accessible
3. Review deployment logs
4. Check SSH key permissions

**Debug:**
```bash
# Test SSH connection
ssh -i ~/.ssh/deploy_key deploy@api.example.com

# View deployment logs
gh run view <run-id> --log --job deploy-backend
```

---

## Performance Optimization

### 1. Reduce Workflow Duration

**Enable caching:**
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '22'
    cache: 'npm'  # Enables npm cache
```

**Parallel jobs:**
```yaml
strategy:
  matrix:
    node-version: [18, 20, 22]  # Runs in parallel
```

### 2. Optimize Docker Images

Use smaller base images:
```yaml
services:
  postgres:
    image: postgres:16-alpine  # Smaller than postgres:16
```

### 3. Skip Unnecessary Jobs

```yaml
if: github.event_name == 'pull_request'  # Only on PRs
```

---

## Scaling Considerations

### For Large Teams

1. **Increase concurrency limits:**
   - GitHub Actions has default concurrency limits
   - Contact GitHub support for higher limits

2. **Use self-hosted runners:**
   - For long-running tests
   - For resource-intensive builds
   - For private network access

3. **Implement job queuing:**
   - Use workflow concurrency groups
   - Prevent duplicate runs

### For Multiple Repositories

1. **Reusable workflows:**
   - Create shared workflow templates
   - Reference from multiple repos

2. **Centralized secrets:**
   - Use organization secrets
   - Share across repositories

---

## Security Best Practices

### 1. Secrets Management

✅ **Do:**
- Use GitHub Secrets for sensitive data
- Rotate secrets regularly
- Use environment-specific secrets
- Audit secret access

❌ **Don't:**
- Commit secrets to repository
- Log secrets in workflow output
- Share secrets via email
- Use generic secret names

### 2. Workflow Security

✅ **Do:**
- Use specific action versions (not `@latest`)
- Review action source code
- Use branch protection rules
- Require code reviews

❌ **Don't:**
- Use untrusted third-party actions
- Allow direct pushes to main
- Skip security scans
- Disable branch protection

### 3. Deployment Security

✅ **Do:**
- Require approval for production deployments
- Use environment protection rules
- Implement deployment reviews
- Maintain audit logs

❌ **Don't:**
- Auto-deploy to production
- Use shared deployment credentials
- Skip smoke tests
- Deploy without reviews

---

## Disaster Recovery

### Rollback Procedure

```bash
# Identify failed deployment
gh run view <run-id>

# Revert to previous commit
git revert <commit-hash>
git push origin main

# Trigger new deployment
gh workflow run deploy.yml --ref main
```

### Backup Procedures

1. **Database backups:**
   - Automated daily backups
   - Stored in S3 or similar
   - Tested monthly

2. **Code backups:**
   - Git repository is primary backup
   - Mirror to secondary Git service
   - Tag releases for easy recovery

---

## Compliance & Auditing

### 1. Audit Logging

All workflow runs are logged:
- View in GitHub Actions tab
- Export via GitHub API
- Integrate with SIEM tools

### 2. Compliance Checks

Workflows validate:
- Code quality (ESLint)
- Security (npm audit, Snyk)
- Test coverage
- Type safety (TypeScript)

### 3. Compliance Reports

Generate reports:
```bash
# Export workflow runs
gh run list --workflow=ci.yml --json status,conclusion,createdAt

# Export test results
gh run download <run-id> -n test-results
```

---

## Advanced Configuration

### 1. Matrix Strategies

Test across multiple configurations:

```yaml
strategy:
  matrix:
    node-version: [18, 20, 22]
    os: [ubuntu-latest, windows-latest, macos-latest]
    include:
      - node-version: 22
        experimental: true
```

### 2. Conditional Steps

Run steps conditionally:

```yaml
- name: Deploy to production
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  run: npm run deploy
```

### 3. Custom Actions

Create reusable actions:

```yaml
- uses: ./.github/actions/deploy-backend
  with:
    environment: production
```

---

## Support & Resources

### Documentation
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [GitHub CLI Docs](https://cli.github.com/manual)

### Tools
- [act - Run GitHub Actions locally](https://github.com/nektos/act)
- [GitHub CLI](https://cli.github.com/)
- [Dependabot](https://dependabot.com/)

### Community
- [GitHub Actions Community](https://github.community/c/github-actions)
- [Stack Overflow - github-actions tag](https://stackoverflow.com/questions/tagged/github-actions)

---

## Checklist

Before going live:

- [ ] All secrets configured
- [ ] Branch protection rules enabled
- [ ] Environments created and configured
- [ ] Deployment approvers assigned
- [ ] Monitoring and alerts set up
- [ ] Rollback procedure documented
- [ ] Team trained on workflows
- [ ] Backup procedures tested
- [ ] Security scans passing
- [ ] Performance baselines established

---

**Last Updated:** 2026-03-05
**Maintained By:** DevOps Team
