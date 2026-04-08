# Bugfix Requirements Document

## Introduction

The onboarding service tests in `backend/src/services/__tests__/onboardingService.test.ts` are failing due to a schema mismatch between the test database setup and the actual production migration schema. The test setup creates an `onboarding_checklists` table that is missing three columns (`title`, `description`, `updated_at`) that exist in the production migration `20260317000000_create_recruitment_tables.ts`. This causes SQLITE_ERROR failures when the service attempts to insert or query these columns during test execution.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the onboarding service tests run THEN the system throws "SQLITE_ERROR: table onboarding_checklists has no column named title"

1.2 WHEN the onboarding service tests run THEN the system throws "SQLITE_ERROR: no such column: updated_at"

1.3 WHEN the test setup creates the onboarding_checklists table THEN the system creates a table with only columns: id, employee_id, items, status, completed_at, created_at (missing title, description, updated_at)

1.4 WHEN the onboardingRepository.createChecklist() is called during tests THEN the system attempts to insert a 'title' column that doesn't exist in the test schema

### Expected Behavior (Correct)

2.1 WHEN the onboarding service tests run THEN the system SHALL execute all tests successfully without schema-related errors

2.2 WHEN the test setup creates the onboarding_checklists table THEN the system SHALL create a table matching the production migration schema with columns: id, employee_id, title, description, items, status, target_completion_date, completed_date, created_at, updated_at

2.3 WHEN the onboardingRepository.createChecklist() is called during tests THEN the system SHALL successfully insert records with title, description, and updated_at columns

2.4 WHEN any test queries the onboarding_checklists table THEN the system SHALL have access to all columns defined in the production migration

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the onboarding service tests run with valid test data THEN the system SHALL CONTINUE TO test all service methods (createOnboardingChecklist, completeChecklistItem, getOnboardingChecklist, etc.)

3.2 WHEN the test setup creates other tables (employees) THEN the system SHALL CONTINUE TO create them with their existing schemas

3.3 WHEN the onboarding service business logic executes THEN the system SHALL CONTINUE TO function identically in both test and production environments

3.4 WHEN tests verify email sending behavior THEN the system SHALL CONTINUE TO validate email functionality without throwing errors

3.5 WHEN tests check checklist completion logic THEN the system SHALL CONTINUE TO verify that all items must be completed before marking the checklist as complete
