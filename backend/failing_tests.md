# Failing Tests

### src\utils\__tests__\resilience.test.ts
- Retry isRetryableError should identify timeout errors as retryable
- ResilienceWrapper should execute successfully
- ResilienceWrapper should use fallback on failure
- ResilienceWrapper should track metrics
- ResilienceWrapper should report availability

### src\__tests__\integration\attendance.integration.test.ts
- Attendance API Integration Tests POST /api/v1/attendance/check-in should mark check-in successfully
- Attendance API Integration Tests POST /api/v1/attendance/check-out should mark check-out successfully

### src\__tests__\integration\fileStorage.integration.test.ts
- File Storage Integration Tests GET /api/v1/files/signed-url/:key should generate signed URL for authorized user
- File Storage Integration Tests GET /api/v1/files/signed-url/:key should deny access to unauthorized user
- File Storage Integration Tests GET /api/v1/files/signed-url/:key should validate expiresIn parameter
- File Storage Integration Tests GET /api/v1/files/signed-url/:key should validate operation parameter
- File Storage Integration Tests POST /api/v1/files/upload should allow employee to upload their own files
- File Storage Integration Tests POST /api/v1/files/upload should deny employee from uploading payslips
- File Storage Integration Tests POST /api/v1/files/upload should allow finance role to upload payslips
- File Storage Integration Tests POST /api/v1/files/upload should deny employee from uploading files for other employees
- File Storage Integration Tests GET /api/v1/files/download/:key should allow employee to download their own files
- File Storage Integration Tests GET /api/v1/files/download/:key should deny employee from downloading other employee files
- File Storage Integration Tests GET /api/v1/files/download/:key should allow all users to download system files
- File Storage Integration Tests DELETE /api/v1/files/:key should allow employee to delete their own files (except restricted)
- File Storage Integration Tests DELETE /api/v1/files/:key should deny employee from deleting payslips
- File Storage Integration Tests DELETE /api/v1/files/:key should allow super admin to delete any file
- File Storage Integration Tests GET /api/v1/files/list should allow employee to list their own files
- File Storage Integration Tests GET /api/v1/files/list should deny employee from listing other employee files
- File Storage Integration Tests GET /api/v1/files/list should allow HR manager to list all employee files

### src\repositories\__tests__\leaveBalanceRepository.test.ts
- Leave Balance Operations Create Leave Balance should create leave balance
- Leave Balance Operations Retrieve Leave Balance should retrieve balance by ID
- Leave Balance Operations Retrieve Leave Balance should retrieve balance by employee and year
- Leave Balance Operations Retrieve Leave Balance should retrieve all balances for employee
- Leave Balance Operations Retrieve Leave Balance should return empty array for employee with no balances
- Leave Balance Operations Update Leave Balance should update used leaves
- Leave Balance Operations Update Leave Balance should update carried forward leaves
- Leave Balance Operations Delete Leave Balance should delete leave balance
- Leave Balance Operations Query Leave Balance should retrieve balances by leave type
- Leave Balance Operations Leave Balance Calculations should calculate available balance
- Leave Balance Operations Leave Balance Calculations should track leave utilization

### src\services\__tests__\fileValidationService.unit.test.ts
- FileValidationService validateFile should detect WebP MIME type
- FileValidationService detectMimeType should return null for unknown type
- FileValidationService formatFileSize should format bytes

### src\services\__tests__\payrollProcessingService.test.ts
- PayrollProcessingService processMonthlyPayroll should process monthly payroll for all active employees
- PayrollProcessingService processMonthlyPayroll should create payroll records for each employee
- PayrollProcessingService lockPayroll should lock a processed payroll
- PayrollProcessingService markPayrollAsPaid should mark payroll as paid
- PayrollProcessingService exportBankFile should export payroll as NEFT

### src\services\__tests__\insuranceService.test.ts
- InsuranceService createInsurancePlan should create a new insurance plan with valid data
- InsuranceService getAllInsurancePlans should filter by active status
- InsuranceService updateInsurancePlan should update insurance plan
- InsuranceService updateEnrollment should update enrollment
- InsuranceService cancelEnrollment should cancel active enrollment
- InsuranceService cancelEnrollment should throw error for already cancelled enrollment

### src\services\__tests__\advanceSalaryService.test.ts
- AdvanceSalaryService rejectAdvanceRequest should reject a pending advance request

### src\repositories\__tests__\employmentHistoryRepository.test.ts
- Employment History Operations Create Employment History should create employment history record
- Employment History Operations Create Employment History should allow null to_date for current position
- Employment History Operations Retrieve Employment History should retrieve history by ID
- Employment History Operations Retrieve Employment History should retrieve all history for an employee
- Employment History Operations Retrieve Employment History should return empty array for employee with no history
- Employment History Operations Update Employment History should update history record
- Employment History Operations Delete Employment History should delete history record
- Employment History Operations Query Employment History should retrieve history by designation
- Employment History Operations Query Employment History should retrieve history by department
- Employment History Operations Chronological Order should maintain chronological order

### src\services\__tests__\payrollCalculationService.test.ts
- PayrollCalculationService calculateSalary should calculate salary for monthly mode
- PayrollCalculationService calculateSalary should include PF deduction in calculations
- PayrollCalculationService calculateSalary should include ESI deduction in calculations
- PayrollCalculationService calculateSalary should include professional tax in deductions
- PayrollCalculationService calculateSalary should calculate net pay as gross pay minus deductions
- PayrollCalculationService Salary calculation formulas should calculate earnings based on paid days
- PayrollCalculationService Salary calculation formulas should include all salary components in gross pay

### src\services\__tests__\hierarchyService.property.test.ts
- HierarchyService - Property-Based Tests Property 47: Should enforce single primary position per employee
- HierarchyService - Property-Based Tests Property 49: Should audit all hierarchy changes
- HierarchyService - Property-Based Tests Should support dotted-line reporting relationships

### src\services\__tests__\separationService.test.ts
- F&F Settlement Service generateFnFStatement should generate F&F statement for employee
- F&F Settlement Service generateFnFStatement should include all settlement components in statement

### src\repositories\__tests__\questionnaireTemplateRepository.test.ts
- QuestionnaireTemplateRepository createTemplate should create a template with valid data
- QuestionnaireTemplateRepository createTemplate should create template with multiple choice questions
- QuestionnaireTemplateRepository createTemplate should create template with yes/no questions
- QuestionnaireTemplateRepository createTemplate should generate unique IDs for questions
- QuestionnaireTemplateRepository getTemplate should retrieve template by ID
- QuestionnaireTemplateRepository getTemplate should return null for non-existent template
- QuestionnaireTemplateRepository getActiveTemplates should retrieve only active templates
- QuestionnaireTemplateRepository getAllTemplates should retrieve all templates including inactive ones
- QuestionnaireTemplateRepository updateTemplate should update template name and description
- QuestionnaireTemplateRepository updateTemplate should update template questions
- QuestionnaireTemplateRepository updateTemplate should update is_active status
- QuestionnaireTemplateRepository deactivateTemplate should deactivate a template
- QuestionnaireTemplateRepository addQuestion should add a question to template
- QuestionnaireTemplateRepository addQuestion should throw error when adding question to non-existent template
- QuestionnaireTemplateRepository updateQuestion should update a question in template
- QuestionnaireTemplateRepository updateQuestion should throw error when updating non-existent question
- QuestionnaireTemplateRepository removeQuestion should remove a question from template
- QuestionnaireTemplateRepository removeQuestion should throw error when removing last question
- QuestionnaireTemplateRepository deleteTemplate should delete a template

### src\services\__tests__\salaryStructureService.test.ts
- SalaryStructureService configureSalaryStructure should deactivate previous structure when creating new one

### src\services\__tests__\travelAllowanceService.test.ts
- TravelAllowanceService calculateMonthlyAllowance should calculate total monthly allowance
- TravelAllowanceService calculateMonthlyAllowance should only include completed journeys
- TravelAllowanceService getTravelAllowanceSummary should return summary for date range
- TravelAllowanceService getTravelAllowanceSummary should calculate average distance per journey
- TravelAllowanceService getTravelAllowanceSummary should only include journeys within date range

### src\services\__tests__\approvalRoutingService.test.ts
- ApprovalRoutingService getApprovalRequest should retrieve approval request by ID
- ApprovalRoutingService getApprovalRequest should return null if approval request not found
- ApprovalRoutingService getApprovalHistory should retrieve approval history for a request
- ApprovalRoutingService getApprovalHistory should return empty array if no history found
- ApprovalRoutingService getPendingApprovalsForManager should retrieve pending approvals for a manager
- ApprovalRoutingService getPendingApprovalsForManager should return empty array if no pending approvals

### src\services\__tests__\leaveTypeService.test.ts
- LeaveTypeService createLeaveType should create a new leave type
- LeaveTypeService deactivateLeaveType should deactivate leave type

### src\services\__tests__\dashboardService.test.ts
- DashboardService getDashboardStats should return complete dashboard statistics
- DashboardService getEmployeeStatistics should calculate employee statistics correctly
- DashboardService getEmployeeStatistics should handle zero employees
- DashboardService getAttendanceStatistics should calculate attendance statistics correctly
- DashboardService getAttendanceStatistics should calculate attendance rate correctly
- DashboardService getLeaveStatistics should calculate leave statistics correctly
- DashboardService getPayrollStatistics should calculate payroll statistics correctly
- DashboardService getPayrollStatistics should handle zero payroll data
- DashboardService getRecruitmentStatistics should calculate recruitment statistics correctly
- DashboardService getRecruitmentStatistics should handle zero recruitment data

### src\services\__tests__\hierarchyService.test.ts
- HierarchyService Employee Position Assignment should assign employee position

### src\services\__tests__\reportService.test.ts
- ReportService generateEmployeeReport should generate employee report with all fields
- ReportService generateEmployeeReport should apply department filter
- ReportService generateEmployeeReport should apply status filter
- ReportService generateEmployeeReport should apply date range filter
- ReportService generateEmployeeReport should apply pagination
- ReportService generateAttendanceReport should generate attendance report
- ReportService generateAttendanceReport should filter by employee
- ReportService generateLeaveReport should generate leave report
- ReportService generateLeaveReport should filter by status
- ReportService generatePayrollReport should generate payroll report
- ReportService generatePerformanceReport should generate performance report
- ReportService generateTrainingReport should generate training report

### src\repositories\__tests__\fnfSettlementRepository.test.ts
- FnF Settlement Operations Create FnF Settlement should create FnF settlement record
- FnF Settlement Operations Retrieve FnF Settlement should retrieve settlement by ID
- FnF Settlement Operations Retrieve FnF Settlement should retrieve settlement by employee
- FnF Settlement Operations Retrieve FnF Settlement should return null for non-existent settlement
- FnF Settlement Operations Update FnF Settlement should update settlement details
- FnF Settlement Operations Update FnF Settlement should update settlement status
- FnF Settlement Operations Update FnF Settlement should update payment details
- FnF Settlement Operations Delete FnF Settlement should delete settlement
- FnF Settlement Operations FnF Settlement Calculations should calculate total earnings
- FnF Settlement Operations FnF Settlement Calculations should calculate total deductions
- FnF Settlement Operations FnF Settlement Calculations should validate net payable calculation
- FnF Settlement Operations Settlement Statement Fields should support statement fields

### src\services\factories\__tests__\StorageProviderFactory.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\__tests__\integration\dashboard.integration.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\__tests__\integration\performance.integration.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\__tests__\integration\recruitment.integration.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\services\__tests__\phase7-recruitment-complete.unit.test.ts
- Phase 7: Recruitment Complete - Unit Tests Interview Management Service should submit interview feedback with valid rating

### src\__tests__\services\emailService.integration.test.ts
- Email Service Integration Tests Configuration Validation should validate that EMAIL_TEMPLATE_DIR is set
- Email Service Integration Tests Configuration Validation should validate SendGrid configuration when SendGrid provider is selected
- Email Service Integration Tests Production Readiness should have all required environment variables for production

### src\__tests__\integration\fileStorageDeletion.integration.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\__tests__\integration\geo-tracking.integration.test.ts
- Geo Tracking API Endpoints POST /api/v1/geo/track - Log GPS waypoint should log a GPS waypoint successfully
- Geo Tracking API Endpoints POST /api/v1/geo/track - Log GPS waypoint should reject invalid latitude
- Geo Tracking API Endpoints POST /api/v1/geo/track - Log GPS waypoint should reject invalid longitude
- Geo Tracking API Endpoints POST /api/v1/geo/track - Log GPS waypoint should require authentication
- Geo Tracking API Endpoints GET /api/v1/geo/journey/:employeeId/:date - Get daily journey should retrieve daily journey for employee
- Geo Tracking API Endpoints GET /api/v1/geo/journey/:employeeId/:date - Get daily journey should reject invalid date format
- Geo Tracking API Endpoints GET /api/v1/geo/journey/:employeeId/:date - Get daily journey should require authentication
- Geo Tracking API Endpoints PUT /api/v1/geo/journey/:id/approve - Approve travel log should approve a journey
- Geo Tracking API Endpoints PUT /api/v1/geo/journey/:id/approve - Approve travel log should return 404 for non-existent journey
- Geo Tracking API Endpoints PUT /api/v1/geo/journey/:id/approve - Approve travel log should require manager role
- Geo Tracking API Endpoints GET /api/v1/geo/allowance/:employeeId/:month - Get monthly allowance should calculate monthly travel allowance
- Geo Tracking API Endpoints GET /api/v1/geo/allowance/:employeeId/:month - Get monthly allowance should reject invalid month
- Geo Tracking API Endpoints GET /api/v1/geo/allowance/:employeeId/:month - Get monthly allowance should require finance role
- Geo Tracking API Endpoints POST /api/v1/geo/geo-fences - Create geo-fence should create a geo-fence successfully
- Geo Tracking API Endpoints POST /api/v1/geo/geo-fences - Create geo-fence should reject missing required fields
- Geo Tracking API Endpoints POST /api/v1/geo/geo-fences - Create geo-fence should reject invalid coordinates
- Geo Tracking API Endpoints POST /api/v1/geo/geo-fences - Create geo-fence should reject invalid radius
- Geo Tracking API Endpoints POST /api/v1/geo/geo-fences - Create geo-fence should require admin role
- Geo Tracking API Endpoints GET /api/v1/geo/geo-fences - Get all geo-fences should retrieve all geo-fences
- Geo Tracking API Endpoints GET /api/v1/geo/geo-fences - Get all geo-fences should filter by enabled status
- Geo Tracking API Endpoints GET /api/v1/geo/geo-fences - Get all geo-fences should filter by type
- Geo Tracking API Endpoints GET /api/v1/geo/geo-fences - Get all geo-fences should require authentication

### src\__tests__\integration\notifications.integration.test.ts
- Notification API Integration Tests GET /api/v1/notifications should return 401 without authentication
- Notification API Integration Tests GET /api/v1/notifications should return empty notifications list for new employee
- Notification API Integration Tests GET /api/v1/notifications should return notifications with pagination
- Notification API Integration Tests PUT /api/v1/notifications/:id/read should return 401 without authentication
- Notification API Integration Tests PUT /api/v1/notifications/:id/read should return 404 for non-existent notification
- Notification API Integration Tests PUT /api/v1/notifications/:id/read should return 403 when marking another employee's notification
- Notification API Integration Tests PUT /api/v1/notifications/:id/read should mark notification as read
- Notification API Integration Tests PUT /api/v1/notifications/:id/read should update unread count after marking as read
- Notification API Integration Tests POST /api/v1/notifications/templates should return 401 without authentication
- Notification API Integration Tests POST /api/v1/notifications/templates should return 403 for non-admin users
- Notification API Integration Tests POST /api/v1/notifications/templates should return 400 for missing required fields
- Notification API Integration Tests POST /api/v1/notifications/templates should create a notification template
- Notification API Integration Tests POST /api/v1/notifications/templates should return 409 for duplicate template name
- Notification API Integration Tests GET /api/v1/notifications/templates should return 401 without authentication
- Notification API Integration Tests GET /api/v1/notifications/templates should return 403 for non-admin users
- Notification API Integration Tests GET /api/v1/notifications/templates should list all active templates
- Notification API Integration Tests GET /api/v1/notifications/templates should list all templates including inactive
- Notification API Integration Tests GET /api/v1/notifications/templates/:id should return 401 without authentication
- Notification API Integration Tests GET /api/v1/notifications/templates/:id should return 403 for non-admin users
- Notification API Integration Tests GET /api/v1/notifications/templates/:id should return 404 for non-existent template
- Notification API Integration Tests GET /api/v1/notifications/templates/:id should get a specific template
- Notification API Integration Tests PUT /api/v1/notifications/templates/:id should return 401 without authentication
- Notification API Integration Tests PUT /api/v1/notifications/templates/:id should return 403 for non-admin users
- Notification API Integration Tests PUT /api/v1/notifications/templates/:id should return 404 for non-existent template
- Notification API Integration Tests PUT /api/v1/notifications/templates/:id should update a template
- Notification API Integration Tests PUT /api/v1/notifications/templates/:id should return 409 when updating to duplicate name
- Notification API Integration Tests DELETE /api/v1/notifications/templates/:id should return 401 without authentication
- Notification API Integration Tests DELETE /api/v1/notifications/templates/:id should return 403 for non-admin users
- Notification API Integration Tests DELETE /api/v1/notifications/templates/:id should return 404 for non-existent template
- Notification API Integration Tests DELETE /api/v1/notifications/templates/:id should delete a template

### src\__tests__\integration\separation.integration.test.ts
- Separation API Integration Tests POST /api/v1/separation/resignation should submit resignation successfully
- Separation API Integration Tests POST /api/v1/separation/resignation should return 400 if required fields are missing
- Separation API Integration Tests POST /api/v1/separation/termination should initiate termination successfully
- Separation API Integration Tests POST /api/v1/separation/termination should return 400 if required fields are missing
- Separation API Integration Tests GET /api/v1/separation/resignation/:resignationId should get resignation by ID
- Separation API Integration Tests GET /api/v1/separation/resignation/:resignationId should return 404 if resignation not found
- Separation API Integration Tests PUT /api/v1/separation/resignation/:resignationId/accept should accept resignation successfully
- Separation API Integration Tests PUT /api/v1/separation/resignation/:resignationId/accept should return 400 if acceptedBy is missing
- Separation API Integration Tests POST /api/v1/separation/exit-interview should schedule exit interview successfully
- Separation API Integration Tests POST /api/v1/separation/exit-interview should return 400 if scheduled_at is missing
- Separation API Integration Tests PUT /api/v1/separation/exit-interview/:exitInterviewId/complete should complete exit interview successfully
- Separation API Integration Tests PUT /api/v1/separation/exit-interview/:exitInterviewId/complete should return 400 if required fields are missing
- Separation API Integration Tests GET /api/v1/separation/fnf/:employeeId should calculate F&F settlement successfully
- Separation API Integration Tests PUT /api/v1/separation/fnf/:id/approve should approve F&F settlement successfully
- Separation API Integration Tests PUT /api/v1/separation/fnf/:id/approve should return 400 if approvedBy is missing
- Separation API Integration Tests GET /api/v1/separation/asset-recovery/:employeeId should get asset recovery checklist successfully
- Separation API Integration Tests PUT /api/v1/separation/asset-recovery/:assetRecoveryId should update asset recovery status successfully
- Separation API Integration Tests PUT /api/v1/separation/asset-recovery/:assetRecoveryId should return 400 if status is missing
- Separation API Integration Tests GET /api/v1/separation/:employeeId/offboarding-check should check offboarding preconditions successfully
- Separation API Integration Tests PUT /api/v1/separation/deactivate/:employeeId should return error if preconditions not met

### src\__tests__\integration\suppliers.integration.test.ts
- Suppliers API Integration Tests Supplier/Buyer CRUD should create a supplier
- Suppliers API Integration Tests Supplier/Buyer CRUD should create a buyer
- Suppliers API Integration Tests Supplier/Buyer CRUD should get supplier by ID
- Suppliers API Integration Tests Supplier/Buyer CRUD should get all suppliers for employee
- Suppliers API Integration Tests Supplier/Buyer CRUD should update a supplier
- Suppliers API Integration Tests Supplier/Buyer CRUD should delete a supplier
- Suppliers API Integration Tests Supplier/Buyer CRUD should search suppliers
- Suppliers API Integration Tests Supplier/Buyer CRUD should get supplier count
- Suppliers API Integration Tests Visit Management should log a visit
- Suppliers API Integration Tests Visit Management should get visit history
- Suppliers API Integration Tests Visit Management should get recent visits
- Suppliers API Integration Tests Visit Management should get visits by date range
- Suppliers API Integration Tests Visit Management should get visit count
- Suppliers API Integration Tests Authorization should prevent unauthorized supplier deletion
- Suppliers API Integration Tests Authorization should prevent unauthorized visit logging

### src\__tests__\integration\esignature.integration.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\__tests__\integration\hierarchy.integration.test.ts
- Hierarchy API Integration Tests Department Management should create a department
- Hierarchy API Integration Tests Department Management should get all departments
- Hierarchy API Integration Tests Department Management should get a specific department
- Hierarchy API Integration Tests Department Management should update a department
- Hierarchy API Integration Tests Department Management should delete a department
- Hierarchy API Integration Tests Designation Management should create a designation
- Hierarchy API Integration Tests Designation Management should get all designations
- Hierarchy API Integration Tests Designation Management should get a specific designation
- Hierarchy API Integration Tests Designation Management should update a designation
- Hierarchy API Integration Tests Designation Management should delete a designation
- Hierarchy API Integration Tests Employee Position Assignment should assign employee position
- Hierarchy API Integration Tests Hierarchy Queries should get reporting chain for employee
- Hierarchy API Integration Tests Hierarchy Queries should get direct reports for manager
- Hierarchy API Integration Tests Hierarchy Queries should get org chart
- Hierarchy API Integration Tests Hierarchy Queries should get org chart with root employee
- Hierarchy API Integration Tests Hierarchy Audit Logs should get hierarchy audit logs

### src\__tests__\factories\factory-builder.ts

- Failed to run suite:   ● Test suite failed to run

### src\__tests__\utils\test-helpers.ts

- Failed to run suite:   ● Test suite failed to run

### src\__tests__\utils\test-db.ts

- Failed to run suite:   ● Test suite failed to run

### src\__tests__\utils\index.ts

- Failed to run suite:   ● Test suite failed to run

### src\__tests__\services\fileStorageService.property.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\__tests__\services\s3StorageProvider.deletion.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\__tests__\factories\shift.factory.ts

- Failed to run suite:   ● Test suite failed to run

### src\__tests__\services\fileStorageService.deletion.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\__tests__\factories\salary-structure.factory.ts

- Failed to run suite:   ● Test suite failed to run

### src\__tests__\integration\bankDetails.integration.test.ts
- Bank Details API Integration Tests POST /api/v1/bank-details - Add Bank Account should add a new bank account with valid data
- Bank Details API Integration Tests POST /api/v1/bank-details - Add Bank Account should reject invalid IFSC code format
- Bank Details API Integration Tests POST /api/v1/bank-details - Add Bank Account should reject invalid account number length
- Bank Details API Integration Tests POST /api/v1/bank-details - Add Bank Account should reject missing required fields
- Bank Details API Integration Tests POST /api/v1/bank-details - Add Bank Account should enforce maximum 2 accounts per employee
- Bank Details API Integration Tests PUT /api/v1/bank-details/:id - Update Bank Account should update bank account with valid data
- Bank Details API Integration Tests PUT /api/v1/bank-details/:id - Update Bank Account should reject update with invalid IFSC code
- Bank Details API Integration Tests PUT /api/v1/bank-details/:id - Update Bank Account should return 404 for non-existent account
- Bank Details API Integration Tests PUT /api/v1/bank-details/:id/set-primary - Set Primary Account should reject setting unverified account as primary
- Bank Details API Integration Tests PUT /api/v1/bank-details/:id/set-primary - Set Primary Account should set verified account as primary
- Bank Details API Integration Tests PUT /api/v1/bank-details/:id/verify - Verify Bank Account should verify bank account (Finance only)
- Bank Details API Integration Tests PUT /api/v1/bank-details/:id/verify - Verify Bank Account should return 404 for non-existent account
- Bank Details API Integration Tests GET /api/v1/bank-details/:employeeId - Get Bank Accounts should get employee bank accounts
- Bank Details API Integration Tests GET /api/v1/bank-details/:employeeId - Get Bank Accounts should mask account numbers in response
- Bank Details API Integration Tests GET /api/v1/bank-details/:employeeId - Get Bank Accounts should prevent employee from viewing other employee accounts
- Bank Details API Integration Tests GET /api/v1/bank-details/:employeeId - Get Bank Accounts should allow Finance to view any employee accounts
- Bank Details API Integration Tests Authorization Tests should require authentication for all endpoints

### src\__tests__\factories\leave.factory.ts

- Failed to run suite:   ● Test suite failed to run

### src\__tests__\factories\leave-type.factory.ts

- Failed to run suite:   ● Test suite failed to run

### src\__tests__\factories\employee.factory.ts

- Failed to run suite:   ● Test suite failed to run

### src\__tests__\factories\designation.factory.ts

- Failed to run suite:   ● Test suite failed to run

### src\__tests__\integration\documents.integration.test.ts
- Documents API Integration Tests POST /api/v1/documents - Upload Document should upload a document with valid data
- Documents API Integration Tests POST /api/v1/documents - Upload Document should reject upload without file
- Documents API Integration Tests POST /api/v1/documents - Upload Document should reject upload without document_type
- Documents API Integration Tests POST /api/v1/documents - Upload Document should reject file exceeding size limit
- Documents API Integration Tests POST /api/v1/documents - Upload Document should reject unsupported file type
- Documents API Integration Tests POST /api/v1/documents - Upload Document should allow HR Manager to upload for any employee
- Documents API Integration Tests POST /api/v1/documents - Upload Document should prevent employee from uploading for other employees
- Documents API Integration Tests GET /api/v1/documents/:id - Get Document should get document by ID
- Documents API Integration Tests GET /api/v1/documents/:id - Get Document should return 404 for non-existent document
- Documents API Integration Tests GET /api/v1/documents/:id - Get Document should prevent employee from viewing other employee documents
- Documents API Integration Tests GET /api/v1/documents/:id - Get Document should allow HR Manager to view any document
- Documents API Integration Tests GET /api/v1/documents/:id - Get Document should allow Finance to view any document
- Documents API Integration Tests GET /api/v1/documents/expiring - Get Expiring Documents should get expiring documents (HR only)
- Documents API Integration Tests GET /api/v1/documents/expiring - Get Expiring Documents should get expiring documents with custom days threshold
- Documents API Integration Tests GET /api/v1/documents/expiring - Get Expiring Documents should reject invalid days parameter
- Documents API Integration Tests GET /api/v1/documents/expiring - Get Expiring Documents should reject non-numeric days parameter
- Documents API Integration Tests GET /api/v1/documents/expiring - Get Expiring Documents should allow Finance to get expiring documents
- Documents API Integration Tests GET /api/v1/documents/expiring - Get Expiring Documents should allow Super Admin to get expiring documents
- Documents API Integration Tests Authorization Tests should require authentication for all endpoints
- Documents API Integration Tests Authorization Tests should require authentication for GET document
- Documents API Integration Tests Authorization Tests should require authentication for GET expiring documents
- Documents API Integration Tests Error Handling should handle file upload errors gracefully
- Documents API Integration Tests Error Handling should handle database errors gracefully
- Documents API Integration Tests Document Metadata should store document metadata correctly
- Documents API Integration Tests Document Metadata should support all document types

### src\__tests__\factories\recruitment.factory.ts

- Failed to run suite:   ● Test suite failed to run

### src\__tests__\factories\department.factory.ts

- Failed to run suite:   ● Test suite failed to run

### src\__tests__\factories\attendance.factory.ts

- Failed to run suite:   ● Test suite failed to run

### src\__tests__\services\fileStorageService.deletion.property.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\__tests__\factories\base.factory.ts

- Failed to run suite:   ● Test suite failed to run

### src\__tests__\factories\index.ts

- Failed to run suite:   ● Test suite failed to run

### src\services\__tests__\shiftService.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\services\__tests__\recruitmentModule.property.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\services\__tests__\pipService.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\services\__tests__\performance.property.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\services\__tests__\recruitmentModule.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\services\__tests__\phase7-recruitment-services.unit.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\services\__tests__\performanceReviewService.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\services\__tests__\payslipService.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\services\__tests__\leave.property.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\services\__tests__\geoTrackingService.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\services\__tests__\goalService.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\services\__tests__\geoTrackingService.property.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\services\__tests__\holidayService.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\services\__tests__\fileStorageService.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\services\__tests__\feedbackService.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\services\__tests__\fileStorageService.property.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\services\__tests__\example.property.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\services\__tests__\expenseService.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\services\__tests__\emailService.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\services\__tests__\emailService.property.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\services\__tests__\esignatureService.unit.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\services\__tests__\employeeService.unit.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\services\__tests__\auditLogService.unit.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\services\__tests__\bankDetailsService.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\services\__tests__\authService.unit.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\services\__tests__\approvalRoutingService.property.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\services\__tests__\bankDetailsService.unit.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\trainingEnrollmentRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\visitRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\trainingProgramRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\supplierBuyerRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\skillRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\signatureRequestRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\shiftRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\salaryStructureRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\rewardRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\reviewCycleRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\signatureEventRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\resignationRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\pfRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\pipRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\reimbursementClaimRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\performanceReviewRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\offerLetterRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\onboardingRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\payslipRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\journeyRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\notificationRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\__tests__\integration\benefits.integration.test.ts
- Benefits API Integration Tests Insurance Plans should create an insurance plan
- Benefits API Integration Tests Insurance Plans should get all insurance plans
- Benefits API Integration Tests Insurance Plans should update an insurance plan
- Benefits API Integration Tests Insurance Plans should delete an insurance plan
- Benefits API Integration Tests Insurance Enrollment should enroll employee in insurance plan
- Benefits API Integration Tests Insurance Enrollment should get employee enrollments
- Benefits API Integration Tests PF Details should get PF details for employee
- Benefits API Integration Tests PF Details should get PF statement
- Benefits API Integration Tests Gratuity should calculate gratuity for employee
- Benefits API Integration Tests Gratuity should generate gratuity report
- Benefits API Integration Tests Reimbursement Claims should submit reimbursement claim
- Benefits API Integration Tests Reimbursement Claims should get employee claims
- Benefits API Integration Tests Reimbursement Claims should approve reimbursement claim
- Benefits API Integration Tests Reimbursement Claims should reject reimbursement claim
- Benefits API Integration Tests Rewards should award reward to employee
- Benefits API Integration Tests Rewards should get employee rewards
- Benefits API Integration Tests Rewards should get public rewards
- Benefits API Integration Tests Rewards should update reward
- Benefits API Integration Tests Rewards should delete reward

### src\repositories\__tests__\payrollRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\leaveRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\notificationTemplateRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\jobPostingRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\leaveTypeRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\insuranceEnrollmentRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\hierarchyNodeRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\insurancePlanRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\goalRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\gratuityRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\geoLogRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\holidayRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\feedbackRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\documentRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\geoFenceRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\exitInterviewRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\employeeRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\designationRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\employeeSkillRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\emergencyContactRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\interviewRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\certificationRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\departmentRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\authRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\assetRecoveryRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\attendanceRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\auditLogRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\applicantRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\advanceSalaryRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\repositories\__tests__\bankAccountRepository.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\__tests__\auditLog.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\__tests__\example.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\__tests__\rbac.test.ts
- RBAC Utilities Role Permission Matrix should have Employee with least permissions
- RBAC Utilities Role Permission Matrix should not have duplicate permissions in a role

### src\__tests__\encryption.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\__tests__\security.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\__tests__\fileStorage.integration.test.ts

- Failed to run suite:   ● Test suite failed to run

### src\services\__tests__\offerLetterService.test.ts
- OfferLetterService offer letter workflow should complete full workflow from generation to acceptance

### src\__tests__\integration\employees.integration.test.ts

- Failed to run suite:   ● Test suite failed to run