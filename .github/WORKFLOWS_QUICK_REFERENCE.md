# GitHub Actions Workflows - Quick Reference

## Workflow Overview

| Workflow | Trigger | Purpose | Duration |
|----------|---------|---------|----------|
| **ci.yml** | Push/PR | Linting, unit tests, builds | ~10-15 min |
| **e2e.yml** | Push/PR/Daily | Browser E2E tests | ~20-30 min |
| **property-tests.yml** | Push/PR/Daily | Property-based tests | ~15-20 min |
| **integration-tests.yml** | Push/PR | API integration tests | ~10-15 min |
| **deploy.yml** | Push to main | Build, test, deploy | ~30-45 min |
| **performance.yml** | Push/PR/Daily | Load & bundle tests | ~15-20 min |
| **docs.yml** | Push (docs change) | Documentation validation | ~5-10 min |

---

## Running Workflows

### Manually Trigger Deployment
```bash
# Via GitHub CLI
gh workflow run deploy.yml --ref main

# Via GitHub Web UI
1. Go to Actions tab
2. Select "Deploy" workflow
3. Click "Run workflow"
4. Select branch (main)
5. Click "Run workflow"
```

### View Workflow Status
```bash
# Via GitHub CLI
gh run list --workflow=ci.yml

# Via GitHub Web UI
1. Go to Actions tab
2. Select workflow
3. View run history
```

### View Workflow Logs
```bash
# Via GitHub CLI
gh run view <run-id> --log

# Via GitHub Web UI
1. Go to Actions tab
2. Click on workflow run
3. Click on job
4. View logs
```

---

## Test Artifacts

### Download Artifacts
```bash
# Via GitHub CLI
gh run download <run-id> -n <artifact-name>

# Via GitHub Web UI
1. Go to workflow run
2. Scroll to "Artifacts" section
3. Click download button
```

### Common Artifacts
- `backend-build-node*` - Compiled backend code
- `frontend-build-node*` - Built frontend app
- `playwright-report-*` - E2E test reports
- `test-videos-*` - Failed test videos
- `property-test-results-*` - Property test results
- `integration-test-results-*` - Integration test results
- `performance-report` - Performance analysis
- `bundle-analysis` - Bundle size report

---

## Debugging Failed Workflows

### 1. Check Workflow Logs
```bash
# View full logs
gh run view <run-id> --log

# View specific job logs
gh run view <run-id> --log --job <job-id>
```

### 2. Review Test Artifacts
- Download Playwright reports for E2E failures
- Download test videos to see what failed
- Check coverage reports for test gaps

### 3. Common Failures

**Database Connection Error**
- Check PostgreSQL service is healthy
- Verify DATABASE_URL is correct
- Check port 5432 availability

**Redis Connection Error**
- Check Redis service is healthy
- Verify REDIS_URL is correct
- Check port 6379 availability

**Build Failure**
- Check TypeScript errors
- Review ESLint warnings
- Verify all dependencies installed

**Test Failure**
- Review test logs
- Check test videos (E2E)
- Verify test database state

---

## Performance Tips

### Reduce Workflow Time
1. **Use caching** - npm dependencies cached automatically
2. **Parallel jobs** - Tests run in parallel across versions
3. **Skip unnecessary jobs** - Use `if` conditions
4. **Optimize Docker images** - Use smaller base images

### Monitor Workflow Duration
```bash
# View workflow run times
gh run list --workflow=ci.yml --limit 10

# Identify slow jobs
gh run view <run-id> --log | grep "Elapsed time"
```

---

## Environment Variables

### Available in All Workflows
```
NODE_ENV=test
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ems_test
REDIS_URL=redis://localhost:6379
```

### Frontend E2E Tests
```
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### Property-Based Tests
```
FAST_CHECK_ITERATIONS=1000
```

---

## Secrets Management

### Required Secrets for Deployment
```
DEPLOY_KEY          # SSH private key
DEPLOY_HOST         # Deployment server hostname
DEPLOY_USER         # Deployment user
CDN_API_KEY         # CDN API credentials
CDN_ZONE_ID         # CDN zone identifier
SNYK_TOKEN          # Snyk security scanning token
```

### Adding Secrets
```bash
# Via GitHub CLI
gh secret set SECRET_NAME --body "secret_value"

# Via GitHub Web UI
1. Go to Settings > Secrets and variables > Actions
2. Click "New repository secret"
3. Enter name and value
4. Click "Add secret"
```

---

## Branch Protection Rules

### Main Branch
- ✅ Require status checks to pass (all workflows)
- ✅ Require code review (1 approval)
- ✅ Require branches to be up to date
- ✅ Dismiss stale reviews on push
- ✅ Require conversation resolution

### Develop Branch
- ✅ Require status checks to pass (ci.yml, e2e.yml)
- ✅ Require code review (1 approval)
- ✅ Allow force pushes (for rebasing)

---

## Workflow Status Badges

Add to README.md:

```markdown
[![CI](https://github.com/org/repo/actions/workflows/ci.yml/badge.svg)](https://github.com/org/repo/actions/workflows/ci.yml)
[![E2E Tests](https://github.com/org/repo/actions/workflows/e2e.yml/badge.svg)](https://github.com/org/repo/actions/workflows/e2e.yml)
[![Deploy](https://github.com/org/repo/actions/workflows/deploy.yml/badge.svg)](https://github.com/org/repo/actions/workflows/deploy.yml)
```

---

## Troubleshooting Commands

```bash
# List all workflows
gh workflow list

# View workflow file
gh workflow view <workflow-name>

# List recent runs
gh run list --workflow=<workflow-name> --limit 10

# View run details
gh run view <run-id>

# View job logs
gh run view <run-id> --log --job <job-id>

# Download artifacts
gh run download <run-id> -n <artifact-name>

# Cancel running workflow
gh run cancel <run-id>

# Rerun failed jobs
gh run rerun <run-id> --failed
```

---

## Best Practices

### For Developers
1. ✅ Run tests locally before pushing
2. ✅ Check workflow status before merging
3. ✅ Review test coverage reports
4. ✅ Keep dependencies updated
5. ✅ Follow code style guidelines

### For DevOps
1. ✅ Monitor workflow performance
2. ✅ Update Node.js versions regularly
3. ✅ Review security scan results
4. ✅ Maintain deployment secrets
5. ✅ Document deployment procedures

### For Code Review
1. ✅ Verify all checks pass
2. ✅ Review coverage changes
3. ✅ Check for performance regressions
4. ✅ Validate security scans
5. ✅ Ensure tests are comprehensive

---

## Quick Links

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax Reference](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [GitHub CLI Documentation](https://cli.github.com/manual)
- [CI/CD Pipeline Documentation](./.github/CI_CD_PIPELINE.md)

---

## Support

For issues or questions:
1. Check workflow logs in GitHub Actions
2. Review this quick reference
3. Check CI_CD_PIPELINE.md for detailed info
4. Contact DevOps team

---

**Last Updated:** 2026-03-05
