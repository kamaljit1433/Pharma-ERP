# Individual Backend Test Commands

> [!NOTE]
> All commands must be run from `c:\Users\kamal\Downloads\Pharma-ERP\backend`
> Use `npx jest <path>` to run a single test file.

---

## 1. Config Tests (2 files)

```powershell
npx jest src/config/__tests__/database.test.ts
npx jest src/config/__tests__/redis.test.ts
```

---

## 2. Repository Tests (55 files)

```powershell
npx jest src/repositories/__tests__/advanceSalaryRepository.test.ts
npx jest src/repositories/__tests__/applicantRepository.test.ts
npx jest src/repositories/__tests__/assetRecoveryRepository.test.ts
npx jest src/repositories/__tests__/attendanceRepository.test.ts
npx jest src/repositories/__tests__/auditLogRepository.test.ts
npx jest src/repositories/__tests__/authRepository.test.ts
npx jest src/repositories/__tests__/bankAccountRepository.test.ts
npx jest src/repositories/__tests__/certificationRepository.test.ts
npx jest src/repositories/__tests__/departmentRepository.test.ts
npx jest src/repositories/__tests__/designationRepository.test.ts
npx jest src/repositories/__tests__/documentRepository.test.ts
npx jest src/repositories/__tests__/emergencyContactRepository.test.ts
npx jest src/repositories/__tests__/employeeRepository.test.ts
npx jest src/repositories/__tests__/employeeSkillRepository.test.ts
npx jest src/repositories/__tests__/employmentHistoryRepository.test.ts
npx jest src/repositories/__tests__/exitInterviewRepository.test.ts
npx jest src/repositories/__tests__/feedbackRepository.test.ts
npx jest src/repositories/__tests__/fnfSettlementRepository.test.ts
npx jest src/repositories/__tests__/geoFenceRepository.test.ts
npx jest src/repositories/__tests__/geoLogRepository.test.ts
npx jest src/repositories/__tests__/goalRepository.test.ts
npx jest src/repositories/__tests__/gratuityRepository.test.ts
npx jest src/repositories/__tests__/hierarchyNodeRepository.test.ts
npx jest src/repositories/__tests__/holidayRepository.test.ts
npx jest src/repositories/__tests__/insuranceEnrollmentRepository.test.ts
npx jest src/repositories/__tests__/insurancePlanRepository.test.ts
npx jest src/repositories/__tests__/interviewRepository.test.ts
npx jest src/repositories/__tests__/jobPostingRepository.test.ts
npx jest src/repositories/__tests__/journeyRepository.test.ts
npx jest src/repositories/__tests__/leaveBalanceRepository.test.ts
npx jest src/repositories/__tests__/leaveRepository.test.ts
npx jest src/repositories/__tests__/leaveTypeRepository.test.ts
npx jest src/repositories/__tests__/notificationRepository.test.ts
npx jest src/repositories/__tests__/notificationTemplateRepository.test.ts
npx jest src/repositories/__tests__/offerLetterRepository.test.ts
npx jest src/repositories/__tests__/onboardingRepository.test.ts
npx jest src/repositories/__tests__/payrollRepository.test.ts
npx jest src/repositories/__tests__/payslipRepository.test.ts
npx jest src/repositories/__tests__/performanceReviewRepository.test.ts
npx jest src/repositories/__tests__/pfRepository.test.ts
npx jest src/repositories/__tests__/pipRepository.test.ts
npx jest src/repositories/__tests__/questionnaireTemplateRepository.test.ts
npx jest src/repositories/__tests__/reimbursementClaimRepository.test.ts
npx jest src/repositories/__tests__/resignationRepository.test.ts
npx jest src/repositories/__tests__/reviewCycleRepository.test.ts
npx jest src/repositories/__tests__/rewardRepository.test.ts
npx jest src/repositories/__tests__/salaryStructureRepository.test.ts
npx jest src/repositories/__tests__/shiftRepository.test.ts
npx jest src/repositories/__tests__/signatureEventRepository.test.ts
npx jest src/repositories/__tests__/signatureRequestRepository.test.ts
npx jest src/repositories/__tests__/skillRepository.test.ts
npx jest src/repositories/__tests__/supplierBuyerRepository.test.ts
npx jest src/repositories/__tests__/trainingEnrollmentRepository.test.ts
npx jest src/repositories/__tests__/trainingProgramRepository.test.ts
npx jest src/repositories/__tests__/visitRepository.test.ts
```

---

## 3. Service Factory Tests (3 files)

```powershell
npx jest src/services/factories/__tests__/EmailProviderFactory.test.ts
npx jest src/services/factories/__tests__/NotificationProviderFactory.test.ts
npx jest src/services/factories/__tests__/StorageProviderFactory.test.ts
```

---

## 4. Service Tests (76 files)

```powershell
npx jest src/services/__tests__/advanceSalaryService.test.ts
npx jest src/services/__tests__/applicantTrackingService.test.ts
npx jest src/services/__tests__/approvalRoutingService.property.test.ts
npx jest src/services/__tests__/approvalRoutingService.test.ts
npx jest src/services/__tests__/attendanceService.property.test.ts
npx jest src/services/__tests__/attendanceService.test.ts
npx jest src/services/__tests__/auditLogService.unit.test.ts
npx jest src/services/__tests__/authService.unit.test.ts
npx jest src/services/__tests__/bankDetailsService.test.ts
npx jest src/services/__tests__/bankDetailsService.unit.test.ts
npx jest src/services/__tests__/benefits.property.test.ts
npx jest src/services/__tests__/dashboardService.test.ts
npx jest src/services/__tests__/documentService.test.ts
npx jest src/services/__tests__/emailService.property.test.ts
npx jest src/services/__tests__/emailService.test.ts
npx jest src/services/__tests__/employee.property.test.ts
npx jest src/services/__tests__/employeeService.unit.test.ts
npx jest src/services/__tests__/employmentHistoryService.test.ts
npx jest src/services/__tests__/esignatureService.test.ts
npx jest src/services/__tests__/esignatureService.unit.test.ts
npx jest src/services/__tests__/example.property.test.ts
npx jest src/services/__tests__/expenseService.test.ts
npx jest src/services/__tests__/feedbackService.test.ts
npx jest src/services/__tests__/fileStorageService.property.test.ts
npx jest src/services/__tests__/fileStorageService.test.ts
npx jest src/services/__tests__/fileValidationService.unit.test.ts
npx jest src/services/__tests__/fnfApprovalWorkflow.test.ts
npx jest src/services/__tests__/generateFnFStatement.test.ts
npx jest src/services/__tests__/geoTrackingService.property.test.ts
npx jest src/services/__tests__/geoTrackingService.test.ts
npx jest src/services/__tests__/goalService.test.ts
npx jest src/services/__tests__/gratuityService.property.test.ts
npx jest src/services/__tests__/gratuityService.test.ts
npx jest src/services/__tests__/hierarchyService.property.test.ts
npx jest src/services/__tests__/hierarchyService.test.ts
npx jest src/services/__tests__/hierarchySupplierProperties.property.test.ts
npx jest src/services/__tests__/holidayService.test.ts
npx jest src/services/__tests__/insuranceService.test.ts
npx jest src/services/__tests__/interviewManagementService.test.ts
npx jest src/services/__tests__/leave.property.test.ts
npx jest src/services/__tests__/leaveService.test.ts
npx jest src/services/__tests__/leaveTypeService.test.ts
npx jest src/services/__tests__/notificationService.test.ts
npx jest src/services/__tests__/offerLetterService.test.ts
npx jest src/services/__tests__/onboardingService.bugCondition.test.ts
npx jest src/services/__tests__/onboardingService.preservation.test.ts
npx jest src/services/__tests__/onboardingService.test.ts
npx jest src/services/__tests__/payroll.property.test.ts
npx jest src/services/__tests__/payrollCalculationService.test.ts
npx jest src/services/__tests__/payrollProcessingService.test.ts
npx jest src/services/__tests__/payslipService.test.ts
npx jest src/services/__tests__/performance.property.test.ts
npx jest src/services/__tests__/performanceReviewService.test.ts
npx jest src/services/__tests__/pfService.property.test.ts
npx jest src/services/__tests__/pfService.test.ts
npx jest src/services/__tests__/phase7-recruitment-complete.unit.test.ts
npx jest src/services/__tests__/phase7-recruitment-services.unit.test.ts
npx jest src/services/__tests__/pipService.test.ts
npx jest src/services/__tests__/questionnaireTemplate.test.ts
npx jest src/services/__tests__/recruitmentModule.property.test.ts
npx jest src/services/__tests__/recruitmentModule.test.ts
npx jest src/services/__tests__/reimbursementService.property.test.ts
npx jest src/services/__tests__/reimbursementService.test.ts
npx jest src/services/__tests__/reportService.test.ts
npx jest src/services/__tests__/rewardService.property.test.ts
npx jest src/services/__tests__/rewardService.test.ts
npx jest src/services/__tests__/salaryStructureService.test.ts
npx jest src/services/__tests__/separation.property.test.ts
npx jest src/services/__tests__/separationService.test.ts
npx jest src/services/__tests__/shiftService.test.ts
npx jest src/services/__tests__/supplierBuyerService.property.test.ts
npx jest src/services/__tests__/supplierBuyerService.test.ts
npx jest src/services/__tests__/training.property.test.ts
npx jest src/services/__tests__/trainingService.comprehensive.test.ts
npx jest src/services/__tests__/trainingService.unit.test.ts
npx jest src/services/__tests__/travelAllowanceService.test.ts
```

---

## 5. Utils Tests (1 file)

```powershell
npx jest src/utils/__tests__/resilience.test.ts
```

---

## 6. Integration Tests (18 files)

```powershell
npx jest src/__tests__/integration/attendance.integration.test.ts
npx jest src/__tests__/integration/bankDetails.integration.test.ts
npx jest src/__tests__/integration/benefits.integration.test.ts
npx jest src/__tests__/integration/dashboard.integration.test.ts
npx jest src/__tests__/integration/documents.integration.test.ts
npx jest src/__tests__/integration/employee.integration.test.ts
npx jest src/__tests__/integration/employees.integration.test.ts
npx jest src/__tests__/integration/esignature.integration.test.ts
npx jest src/__tests__/integration/fileStorage.integration.test.ts
npx jest src/__tests__/integration/fileStorageDeletion.integration.test.ts
npx jest src/__tests__/integration/geo-tracking.integration.test.ts
npx jest src/__tests__/integration/hierarchy.integration.test.ts
npx jest src/__tests__/integration/notifications.integration.test.ts
npx jest src/__tests__/integration/performance.integration.test.ts
npx jest src/__tests__/integration/recruitment.integration.test.ts
npx jest src/__tests__/integration/separation.integration.test.ts
npx jest src/__tests__/integration/suppliers.integration.test.ts
npx jest src/__tests__/integration/training.integration.test.ts
```

---

## 7. Root-Level / Misc Tests (18 files)

```powershell
npx jest src/__tests__/middleware/fileAccessControl.test.ts
npx jest src/__tests__/services/emailService.integration.test.ts
npx jest src/__tests__/services/employeeService.property.test.ts
npx jest src/__tests__/services/employeeService.test.ts
npx jest src/__tests__/services/fileStorageService.deletion.property.test.ts
npx jest src/__tests__/services/fileStorageService.deletion.test.ts
npx jest src/__tests__/services/fileStorageService.property.test.ts
npx jest src/__tests__/services/fileValidationService.property.test.ts
npx jest src/__tests__/services/fileValidationService.test.ts
npx jest src/__tests__/services/insuranceService.property.test.ts
npx jest src/__tests__/services/insuranceService.test.ts
npx jest src/__tests__/services/s3StorageProvider.deletion.test.ts
npx jest src/__tests__/auditLog.test.ts
npx jest src/__tests__/encryption.test.ts
npx jest src/__tests__/example.test.ts
npx jest src/__tests__/fileStorage.integration.test.ts
npx jest src/__tests__/rbac.test.ts
npx jest src/__tests__/security.test.ts
```

---

## Useful Shortcuts

Run **all tests**:
```powershell
npx jest
```

Run tests by **category** (pattern matching):
```powershell
# All repository tests
npx jest src/repositories/

# All service tests
npx jest src/services/__tests__/

# All integration tests
npx jest --testPathPattern="integration"

# All property-based tests
npx jest --testPathPattern="property"

# All unit tests
npx jest --testPathPattern="unit"
```

Run a **specific test by name** (matches `describe` or `it` block names):
```powershell
npx jest -t "should create employee"
```

Run with **verbose output**:
```powershell
npx jest src/services/__tests__/authService.unit.test.ts --verbose
```

Run with **coverage** for a single file:
```powershell
npx jest src/services/__tests__/authService.unit.test.ts --coverage
```
