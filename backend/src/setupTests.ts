// Global test setup
import 'jest';
import * as fc from 'fast-check';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore specific log levels
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock environment variables for tests
process.env['NODE_ENV'] = 'test';
process.env['JWT_SECRET'] = 'test-jwt-secret';
process.env['ENCRYPTION_KEY'] = '0123456789abcdef0123456789abcdef';
process.env['TEST_DB_HOST'] = process.env['TEST_DB_HOST'] || 'localhost';
process.env['TEST_DB_PORT'] = process.env['TEST_DB_PORT'] || '5432';
process.env['TEST_DB_NAME'] = process.env['TEST_DB_NAME'] || 'employee_management_system_test';
process.env['TEST_DB_USER'] = process.env['TEST_DB_USER'] || 'postgres';
process.env['TEST_DB_PASSWORD'] = process.env['TEST_DB_PASSWORD'] || 'postgres';
process.env['REDIS_HOST'] = 'localhost';
process.env['REDIS_PORT'] = '6379';
process.env['AWS_REGION'] = 'us-east-1';
process.env['AWS_ACCESS_KEY_ID'] = 'test-access-key';
process.env['AWS_SECRET_ACCESS_KEY'] = 'test-secret-key';
process.env['S3_BUCKET_NAME'] = 'test-bucket';

// Global test timeout
jest.setTimeout(10000);

// Configure fast-check for consistent behavior across tests
// Use a fixed seed for reproducible tests in CI/CD
if (process.env['CI'] === 'true') {
  // In CI environment, use a fixed seed for reproducibility
  fc.configureGlobal({ seed: 42 });
}