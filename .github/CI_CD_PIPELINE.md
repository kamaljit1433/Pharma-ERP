# CI/CD Pipeline Documentation

## Overview

The Employee Management System uses GitHub Actions for continuous integration and continuous deployment. The pipeline is designed to ensure code quality, test coverage, and reliable deployments across multiple Node.js versions and browser environments.

## Workflow Files

### 1. **ci.yml** - Main CI Pipeline
Runs on every push to `main` and `develop` branches, and on all pull requests.

**Jobs:**
- **lint** - Code quality checks (ESLint, Prettier) across Node.js 18, 20, 22
- **test-backend** - Backend unit and property-based tests across Node.js 18, 20, 22
  - Runs with PostgreSQL 16 and Redis 7.2 services
  - Generates coverage reports
- **test-frontend** - Frontend unit tests with Vitest
  - Generates coverage reports
- **build** - Verification builds for backend and frontend across Node.js 18, 20, 22
  - Uploads build artifacts for 5 days
- **security** - Security scanning with npm audit and Snyk

**Triggers:**
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

**Concurrency:** Cancels previous runs on new push to same branch

---

### 2. **e2e.yml** - End-to-End Testing
Runs on every push to `main` and `develop`, on pull requests, and daily at 2 AM UTC.

**Jobs:**
- **e2e** - Browser-based E2E tests
  - Tests across Chromium, Firefox, and WebKit
  - Runs with PostgreSQL 16 and Redis 7.2 services
  - Uploads Playwright reports and test videos on failure
  - Reports retained for 30 days

- **e2e-mobile** - Mobile viewport testing
  - Tests on Pixel 5 and iPhone 12 viewports
  - Validates responsive design and mobile functionality
  - Uploads reports and videos on failure

**Test Coverage:**
- Authentication flows
- Employee management workflows
- Attendance marking (check-in/check-out)
- Leave request and approval
- Payroll processing
- Critical user journeys

**Artifacts:**
- Playwright HTML reports
- Test videos (on failure)
- Screenshots (on failure)

---

### 3. **property-tests.yml** - Property-Based Testing
Runs on every push to `main` and `develop`, on pull requests, and daily at 3 AM UTC.

**Jobs:**
- **property-tests** - fast-check property-based tests across Node.js 18, 20, 22
  - Runs with PostgreSQL 16 and Redis 7.2 services
  - Configured for 1000 iterations per property
  - Generates JSON test results
  - Uploads coverage reports

**Properties Tested:**
- Employee data round-trip
- Employee ID uniqueness
- Emergency contact validation
- Audit trail completeness
- Search result accuracy
- Working hours calculation
- Overtime calculation
- Leave balance deduction
- Payroll calculations
- And 50+ more properties

**Artifacts:**
- Property test results (JSON)
- Coverage reports

---

### 4. **integration-tests.yml** - Integration Testing
Runs on every push to `main` and `develop`, and on pull requests.

**Jobs:**
- **integration-tests** - API and cross-service integration tests across Node.js 18, 20, 22
  - Runs with PostgreSQL 16 and Redis 7.2 services
  - Executes database migrations before tests
  - Tests API endpoints with real database
  - Tests cross-service workflows
  - Generates JSON test results

**Test Coverage:**
- API endpoint integration
- Database transaction handling
- Service-to-service communication
- Error handling scenarios
- Workflow orchestration

**Artifacts:**
- Integration test results (JSON)
- Coverage reports

---

### 5. **deploy.yml** - Deployment Pipeline
Runs on push to `main` branch or manual trigger via `workflow_dispatch`.

**Jobs:**
- **build-and-test** - Pre-deployment validation
  - Runs linting, unit tests, and builds
  - Uploads build artifacts (1 day retention)

- **deploy-backend** - Backend deployment
  - Requires `build-and-test` to pass
  - Requires production environment approval
  - Deploys to production server
  - Uses deployment secrets

- **deploy-frontend** - Frontend deployment
  - Requires `build-and-test` to pass
  - Requires production environment approval
  - Deploys to CDN
  - Uses CDN API credentials

- **smoke-tests** - Post-deployment validation
  - Requires both deployments to complete
  - Runs critical E2E tests against production
  - Validates deployment success

**Environment Secrets Required:**
- `DEPLOY_KEY` - SSH key for backend deployment
- `DEPLOY_HOST` - Backend deployment host
- `DEPLOY_USER` - Backend deployment user
- `CDN_API_KEY` - CDN API credentials
- `CDN_ZONE_ID` - CDN zone identifier

---

### 6. **performance.yml** - Performance Testing
Runs on every push to `main` and `develop`, on pull requests, and daily at 4 AM UTC.

**Jobs:**
- **performance-tests** - Load and performance testing
  - Payroll processing for 1000+ employees
  - Concurrent attendance marking
  - API response time validation
  - Generates performance reports

- **bundle-size** - Frontend bundle analysis
  - Analyzes total bundle size
  - Tracks individual file sizes
  - Comments bundle size on PRs
  - Identifies size regressions

**Artifacts:**
- Performance reports
- Bundle analysis
- File size tracking

---

### 7. **docs.yml** - Documentation
Runs on push to `main` or `develop` when documentation files change.

**Jobs:**
- **validate-docs** - Markdown validation
  - Checks for empty files
  - Validates markdown syntax
  - Uses markdownlint

- **generate-api-docs** - API documentation generation
  - Generates OpenAPI/Swagger documentation
  - Creates API reference

- **build-docs-site** - Documentation site building
  - Builds static documentation site
  - Deploys to documentation hosting (on main)

**Artifacts:**
- API documentation
- Documentation site

---

## Test Database Setup

All workflows that require database access use Docker services:

**PostgreSQL 16:**
```yaml
services:
  postgres:
    image: postgres:16
    env:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ems_test
    ports:
      - 5432:5432
```

**Redis 7.2:**
```yaml
services:
  redis:
    image: redis:7.2
    ports:
      - 6379:6379
```

**Environment Variables:**
```
NODE_ENV=test
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ems_test
REDIS_URL=redis://localhost:6379
```

---

## Test Coverage Requirements

### Backend
- **Unit Tests:** Minimum 80% code coverage
- **Property-Based Tests:** 1000 iterations per property
- **Integration Tests:** All API endpoints
- **Test Files:** `*.test.ts` and `*.property.test.ts`

### Frontend
- **Unit Tests:** Minimum 70% code coverage
- **E2E Tests:** Critical user workflows
- **Test Files:** `*.test.tsx` and `*.spec.tsx`

---

## Artifact Retention

| Artifact | Retention | Purpose |
|----------|-----------|---------|
| Build artifacts | 5 days | Deployment staging |
| Playwright reports | 30 days | E2E test history |
| Test videos | 7 days | Failure debugging |
| Coverage reports | 30 days | Coverage tracking |
| Performance reports | 30 days | Performance history |
| Bundle analysis | 30 days | Size tracking |

---

## Node.js Version Matrix

Tests run on multiple Node.js versions to ensure compatibility:

- **Node.js 18 LTS** - Long-term support baseline
- **Node.js 20 LTS** - Current LTS
- **Node.js 22 LTS** - Latest LTS

This ensures the application works across different deployment environments.

---

## Browser Testing Matrix

E2E tests run on multiple browsers:

- **Chromium** - Blink engine (Chrome, Edge)
- **Firefox** - Gecko engine
- **WebKit** - Safari engine

Mobile testing includes:
- **Pixel 5** - Android device
- **iPhone 12** - iOS device

---

## Deployment Process

### Prerequisites
1. All CI checks must pass
2. Code review approval required
3. Production environment approval required

### Deployment Steps
1. **Build & Test** - Verify code quality and tests
2. **Deploy Backend** - Deploy API server
3. **Deploy Frontend** - Deploy PWA to CDN
4. **Smoke Tests** - Validate production deployment

### Rollback
If smoke tests fail, manual rollback is required via:
```bash
git revert <commit-hash>
git push origin main
```

---

## Local Development

### Running Tests Locally

**Backend Tests:**
```bash
cd backend
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test -- --coverage # With coverage
```

**Frontend Tests:**
```bash
cd frontend
npm test                    # Run all tests
npm run test:e2e           # E2E tests
npm run test:e2e:ui        # E2E with UI
npm run test:e2e:debug     # E2E with debugging
```

### Running Linting

```bash
npm run lint               # Check for errors
npm run lint:fix           # Fix automatically
npm run format             # Format with Prettier
```

---

## Troubleshooting

### Common Issues

**1. Database Connection Timeout**
- Ensure PostgreSQL service is healthy
- Check `DATABASE_URL` environment variable
- Verify port 5432 is available

**2. Redis Connection Timeout**
- Ensure Redis service is healthy
- Check `REDIS_URL` environment variable
- Verify port 6379 is available

**3. E2E Test Failures**
- Check Playwright reports in artifacts
- Review test videos for visual issues
- Verify backend server is running
- Check `VITE_API_BASE_URL` configuration

**4. Build Failures**
- Clear npm cache: `npm cache clean --force`
- Reinstall dependencies: `npm ci`
- Check TypeScript errors: `npm run type-check`

**5. Coverage Below Threshold**
- Add tests for uncovered code
- Use `npm run test -- --coverage` to identify gaps
- Review coverage reports in artifacts

---

## Monitoring & Alerts

### GitHub Actions Notifications
- Email notifications on workflow failure
- PR status checks prevent merge if tests fail
- Branch protection rules enforce passing checks

### Recommended Monitoring
- Set up Slack notifications for failed deployments
- Monitor build times for performance regressions
- Track test coverage trends over time

---

## Security Considerations

### Secrets Management
- Store sensitive data in GitHub Secrets
- Never commit `.env` files
- Rotate deployment keys regularly
- Use environment-specific secrets

### Code Security
- npm audit checks for vulnerabilities
- Snyk scans for security issues
- ESLint enforces code quality
- Type checking prevents runtime errors

---

## Performance Optimization

### Caching Strategy
- npm dependencies cached per workflow
- Build artifacts cached for 5 days
- Docker images cached for faster service startup

### Parallel Execution
- Tests run in parallel across Node.js versions
- E2E tests run in parallel across browsers
- Reduces overall pipeline execution time

### Concurrency Control
- Only one deployment per branch at a time
- Previous runs cancelled on new push
- Prevents race conditions

---

## Future Enhancements

- [ ] Automated performance regression detection
- [ ] Automated security vulnerability patching
- [ ] Canary deployments with traffic splitting
- [ ] Automated rollback on error rate threshold
- [ ] Integration with monitoring/observability tools
- [ ] Automated database backup before deployment
- [ ] Load testing with k6 or similar tools
- [ ] Visual regression testing with Percy or similar

---

## Support & Questions

For issues or questions about the CI/CD pipeline:
1. Check GitHub Actions logs for detailed error messages
2. Review this documentation
3. Check workflow files in `.github/workflows/`
4. Contact the DevOps team

---

**Last Updated:** 2026-03-05
**Maintained By:** DevOps Team
