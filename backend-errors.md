PS C:\Users\kamal\Downloads\Pharma-ERP\backend> npm run build

> @ems/backend@1.0.0 build
> tsc

src/controllers/geoTrackingController.ts:104:53 - error TS2339: Property 'getByEmployeeAndDate' does not exist on type 'JourneyRepository'.

104       const journeys = await this.journeyRepository.getByEmployeeAndDate(
                                                        ~~~~~~~~~~~~~~~~~~~~

src/controllers/geoTrackingController.ts:122:33 - error TS7006: Parameter 'j' implicitly has an 'any' type.

122         journeys: journeys.map((j) => ({
                                    ~

src/controllers/geoTrackingController.ts:156:52 - error TS2339: Property 'getById' does not exist on type 'JourneyRepository'.

156       const journey = await this.journeyRepository.getById(id as string);
                                                       ~~~~~~~

src/controllers/geoTrackingController.ts:163:60 - error TS2339: Property 'approve' does not exist on type 'JourneyRepository'.

163       const approvedJourney = await this.journeyRepository.approve(
                                                               ~~~~~~~

src/controllers/supplierBuyerController.ts:179:47 - error TS2339: Property 'trim' does not exist on type 'string | Date'.
  Property 'trim' does not exist on type 'Date'.

179       if (!data.visit_date || data.visit_date.trim().length === 0) {
                                                  ~~~~

src/middleware/rbac.ts:46:47 - error TS2345: Argument of type '{ userId: string; userRole: Role; action: string; resourceType: string; resourceId: string; ipAddress: string; userAgent: string; reason: string; }' is not assignable to parameter of type 'Omit<CreateAuditLogDTO, "status">'.
  Type '{ userId: string; userRole: Role; action: string; resourceType: string; resourceId: string; ipAddress: string; userAgent: string; reason: string; }' is missing the following properties from type 'Omit<CreateAuditLogDTO, "status">': entity_type, entity_id

 46         await auditLogService.logAccessDenied({
                                                  ~
 47           userId: req.user.id,
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
...
 54           reason: 'Insufficient permissions'
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 55         });
    ~~~~~~~~~

src/middleware/rbac.ts:99:47 - error TS2345: Argument of type '{ userId: string; userRole: Role; action: string; resourceType: string; resourceId: string; ipAddress: string; userAgent: string; reason: string; }' is not assignable to parameter of type 'Omit<CreateAuditLogDTO, "status">'.
  Type '{ userId: string; userRole: Role; action: string; resourceType: string; resourceId: string; ipAddress: string; userAgent: string; reason: string; }' is missing the following properties from type 'Omit<CreateAuditLogDTO, "status">': entity_type, entity_id

 99         await auditLogService.logAccessDenied({
                                                  ~
100           userId: req.user.id,
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
...
107           reason: 'Insufficient role'
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
108         });
    ~~~~~~~~~

src/middleware/rbac.ts:168:47 - error TS2345: Argument of type '{ userId: string; userRole: Role; action: string; resourceType: "document" | "employee" | "leave" | "payroll" | "attendance"; resourceId: string; ipAddress: string; userAgent: string; reason: string; }' is not assignable to parameter of type 'Omit<CreateAuditLogDTO, "status">'.
  Type '{ userId: string; userRole: Role; action: string; resourceType: "document" | "employee" | "leave" | "payroll" | "attendance"; resourceId: string; ipAddress: string; userAgent: string; reason: string; }' is missing the following properties from type 'Omit<CreateAuditLogDTO, "status">': entity_type, entity_id

168         await auditLogService.logAccessDenied({
                                                  ~
169           userId: req.user.id,
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
...
176           reason: result.reason || 'Access denied'
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
177         });
    ~~~~~~~~~

src/middleware/rbac.ts:238:47 - error TS2345: Argument of type '{ userId: string; userRole: Role; action: string; resourceType: "document" | "employee" | "leave" | "payroll" | "attendance"; resourceId: string; ipAddress: string; userAgent: string; reason: string; }' is not assignable to parameter of type 'Omit<CreateAuditLogDTO, "status">'.
  Type '{ userId: string; userRole: Role; action: string; resourceType: "document" | "employee" | "leave" | "payroll" | "attendance"; resourceId: string; ipAddress: string; userAgent: string; reason: string; }' is missing the following properties from type 'Omit<CreateAuditLogDTO, "status">': entity_type, entity_id

238         await auditLogService.logAccessDenied({
                                                  ~
239           userId: req.user.id,
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
...
246           reason: result.reason || 'Access denied'
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
247         });
    ~~~~~~~~~

src/middleware/rbac.ts:280:35 - error TS2345: Argument of type '{ userId: string; userRole: Role; action: string; resourceType: string; resourceId: string; ipAddress: string; userAgent: string; }' is not assignable to parameter of type 'Omit<CreateAuditLogDTO, "status">'.
  Type '{ userId: string; userRole: Role; action: string; resourceType: string; resourceId: string; ipAddress: string; userAgent: string; }' is missing the following properties from type 'Omit<CreateAuditLogDTO, "status">': entity_type, entity_id

280         auditLogService.logAccess({
                                      ~
281           userId: req.user.id,
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
...
287           userAgent: req.get('user-agent') || 'unknown'
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
288         }).catch(err => console.error('Failed to log API access:', err));
    ~~~~~~~~~

src/services/auditLogService.ts:14:38 - error TS2345: Argument of type '{ status: "success"; user_id?: string | undefined; userId?: string | undefined; reason?: string | undefined; action: string; entity_type: string; entity_id: string; ip_address?: string | undefined; user_agent?: string | undefined; changes?: Record<string, any> | undefined; ... 4 more ...; userAgent?: string | undefi...' is not assignable to parameter of type '{ userId: string; userRole?: string | undefined; action: string; resourceType: string; resourceId: string; changes?: Record<string, any> | undefined; ipAddress: string; userAgent: string; status?: "success" | ... 1 more ... | undefined; reason?: string | undefined; }'.
  Types of property 'userId' are incompatible.
    Type 'string | undefined' is not assignable to type 'string'.
      Type 'undefined' is not assignable to type 'string'.

14     return auditLogRepository.create({
                                        ~
15       ...data,
   ~~~~~~~~~~~~~~
16       status: 'success'
   ~~~~~~~~~~~~~~~~~~~~~~~
17     });
   ~~~~~

src/services/auditLogService.ts:24:38 - error TS2345: Argument of type '{ status: "failure"; user_id?: string | undefined; userId?: string | undefined; reason?: string | undefined; action: string; entity_type: string; entity_id: string; ip_address?: string | undefined; user_agent?: string | undefined; changes?: Record<string, any> | undefined; ... 4 more ...; userAgent?: string | undefi...' is not assignable to parameter of type '{ userId: string; userRole?: string | undefined; action: string; resourceType: string; resourceId: string; changes?: Record<string, any> | undefined; ipAddress: string; userAgent: string; status?: "success" | ... 1 more ... | undefined; reason?: string | undefined; }'.
  Types of property 'userId' are incompatible.
    Type 'string | undefined' is not assignable to type 'string'.
      Type 'undefined' is not assignable to type 'string'.

24     return auditLogRepository.create({
                                        ~
25       ...data,
   ~~~~~~~~~~~~~~
26       status: 'failure'
   ~~~~~~~~~~~~~~~~~~~~~~~
27     });
   ~~~~~

src/services/auditLogService.ts:311:71 - error TS2554: Expected 2 arguments, but got 4.        

311     return auditLogRepository.getByResource(resourceType, resourceId, limit, offset);      
                                                                          ~~~~~~~~~~~~~        

src/services/documentService.ts:49:79 - error TS2554: Expected 1 arguments, but got 2.

 49     const document = await this.documentRepository.createDocument(employeeId, {
                                                                                  ~
 50       ...data,
    ~~~~~~~~~~~~~~
...
 52       uploaded_by: uploadedBy,
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 53     });
    ~~~~~

src/services/insuranceService.ts:207:66 - error TS2551: Property 'getActiveEmployeeEnrollments' does not exist on type 'InsuranceEnrollmentRepository'. Did you mean 'getActiveEnrollments'?  

207     const enrollments = await this.insuranceEnrollmentRepository.getActiveEmployeeEnrollments(employeeId);
                                                                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  src/repositories/insuranceEnrollmentRepository.ts:67:9
    67   async getActiveEnrollments(): Promise<InsuranceEnrollmentRecord[]> {
               ~~~~~~~~~~~~~~~~~~~~
    'getActiveEnrollments' is declared here.

src/services/leaveService.ts:183:72 - error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.

183     const leaves = await this.leaveRepository.getTeamLeaves(managerId, year);
                                                                           ~~~~

src/services/offerLetterService.ts:53:9 - error TS2322: Type 'string | undefined' is not assignable to type 'string'.
  Type 'undefined' is not assignable to type 'string'.

53         department: offerLetter.department,
           ~~~~~~~~~~

  src/types/email.ts:177:5
    177     department: string;
            ~~~~~~~~~~
    The expected type comes from property 'department' which is declared here on type '{ candidateName: string; jobTitle: string; department: string; salary: string; startDate: string; reportingManager: string; offerValidTill: string; acceptanceUrl: string; }'

src/services/offerLetterService.ts:63:78 - error TS2345: Argument of type '"Sent"' is not assignable to parameter of type '"rejected" | "draft" | "sent" | "signed" | "accepted"'.

63     return this.offerLetterRepository.updateOfferLetterStatus(offerLetterId, 'Sent');       
                                                                                ~~~~~~

src/services/offerLetterService.ts:73:93 - error TS2345: Argument of type '"Accepted"' is not assignable to parameter of type '"rejected" | "draft" | "sent" | "signed" | "accepted"'.        

73     const updated = await this.offerLetterRepository.updateOfferLetterStatus(offerLetterId, 'Accepted');
                                                                                               
~~~~~~~~~~

src/services/offerLetterService.ts:105:93 - error TS2345: Argument of type '"Rejected"' is not assignable to parameter of type '"rejected" | "draft" | "sent" | "signed" | "accepted"'.       

105     const updated = await this.offerLetterRepository.updateOfferLetterStatus(offerLetterId, 'Rejected');
                                                                                               
 ~~~~~~~~~~

src/services/onboardingService.ts:39:53 - error TS2339: Property 'title' does not exist on type '{ task: string; completed?: boolean | undefined; }'.

39         checklistItems: data.items.map(item => item.title),
                                                       ~~~~~

src/services/onboardingService.ts:141:7 - error TS2322: Type '{ title: string; description: string; }[]' is not assignable to type '{ task: string; completed?: boolean | undefined; }[]'.    
  Property 'task' is missing in type '{ title: string; description: string; }' but required in type '{ task: string; completed?: boolean | undefined; }'.

141       items: defaultItems,
          ~~~~~

  src/types/recruitment.ts:169:5
    169     task: string;
            ~~~~
    'task' is declared here.
  src/types/recruitment.ts:168:3
    168   items: Array<{
          ~~~~~
    The expected type comes from property 'items' which is declared here on type 'CreateOnboardingChecklistDTO'

src/services/payslipService.ts:71:42 - error TS2345: Argument of type 'Payroll' is not assignable to parameter of type '{ total_deductions: number; }'.
  Types of property 'total_deductions' are incompatible.
    Type 'number | undefined' is not assignable to type 'number'.
      Type 'undefined' is not assignable to type 'number'.

71       deductions: this.extractDeductions(payroll, deductionsComponents),
                                            ~~~~~~~

src/services/performanceReviewService.ts:43:5 - error TS2740: Type 'PerformanceReview' is missing the following properties from type 'PerformanceReview': employeeId, cycleId, peerRatings, finalRating, and 2 more.

43     return review;
       ~~~~~~

src/services/performanceReviewService.ts:47:5 - error TS2322: Type 'import("C:/Users/kamal/Downloads/Pharma-ERP/backend/src/repositories/performanceReviewRepository").PerformanceReview[]' is not assignable to type 'import("C:/Users/kamal/Downloads/Pharma-ERP/backend/src/types/performance").PerformanceReview[]'.
  Type 'PerformanceReview' is missing the following properties from type 'PerformanceReview': employeeId, cycleId, peerRatings, finalRating, and 2 more.

47     return this.performanceReviewRepository.getPerformanceReviewsByEmployee(employeeId);    
       ~~~~~~

src/services/performanceReviewService.ts:58:61 - error TS2551: Property 'getPerformanceReviewByEmployeeAndCycle' does not exist on type 'PerformanceReviewRepository'. Did you mean 'getPerformanceReviewsByEmployee'?

58       const review = await this.performanceReviewRepository.getPerformanceReviewByEmployeeAndCycle(
                                                               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  src/repositories/performanceReviewRepository.ts:110:9
    110   async getPerformanceReviewsByEmployee(employeeId: string): Promise<PerformanceReview[]> {
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    'getPerformanceReviewsByEmployee' is declared here.

src/services/performanceReviewService.ts:64:7 - error TS2322: Type 'import("C:/Users/kamal/Downloads/Pharma-ERP/backend/src/repositories/performanceReviewRepository").PerformanceReview[]' is not assignable to type 'import("C:/Users/kamal/Downloads/Pharma-ERP/backend/src/types/performance").PerformanceReview[]'.
  Type 'PerformanceReview' is missing the following properties from type 'PerformanceReview': employeeId, cycleId, peerRatings, finalRating, and 2 more.

64       reviews = await this.performanceReviewRepository.getPerformanceReviewsByEmployee(filters.employeeId);
         ~~~~~~~

src/services/performanceReviewService.ts:66:7 - error TS2322: Type 'import("C:/Users/kamal/Downloads/Pharma-ERP/backend/src/repositories/performanceReviewRepository").PerformanceReview[]' is not assignable to type 'import("C:/Users/kamal/Downloads/Pharma-ERP/backend/src/types/performance").PerformanceReview[]'.
  Type 'PerformanceReview' is missing the following properties from type 'PerformanceReview': employeeId, cycleId, peerRatings, finalRating, and 2 more.

66       reviews = await this.performanceReviewRepository.getPerformanceReviewsByCycle(filters.cycleId);
         ~~~~~~~

src/services/performanceReviewService.ts:159:44 - error TS2339: Property 'updateFinalRating' does not exist on type 'PerformanceReviewRepository'.

159     await this.performanceReviewRepository.updateFinalRating(reviewId, finalRating);       
                                               ~~~~~~~~~~~~~~~~~

src/services/performanceReviewService.ts:165:5 - error TS2322: Type 'import("C:/Users/kamal/Downloads/Pharma-ERP/backend/src/repositories/performanceReviewRepository").PerformanceReview[]' is not assignable to type 'import("C:/Users/kamal/Downloads/Pharma-ERP/backend/src/types/performance").PerformanceReview[]'.
  Type 'PerformanceReview' is missing the following properties from type 'PerformanceReview': employeeId, cycleId, peerRatings, finalRating, and 2 more.

165     return this.performanceReviewRepository.getReviewHistory(employeeId);
        ~~~~~~

src/services/pfService.ts:22:7 - error TS2739: Type 'PFAccount' is missing the following properties from type 'PFAccount': pf_account_number, opening_balance, total_contributions, is_active 

22       return existingAccount;
         ~~~~~~

src/services/pfService.ts:28:5 - error TS2739: Type 'PFAccount' is missing the following properties from type 'PFAccount': pf_account_number, opening_balance, total_contributions, is_active 

28     return this.pfRepository.createPFAccount(employeeId, pfAccountNumber);
       ~~~~~~

src/services/pfService.ts:28:58 - error TS2554: Expected 1 arguments, but got 2.

28     return this.pfRepository.createPFAccount(employeeId, pfAccountNumber);
                                                            ~~~~~~~~~~~~~~~

src/services/pfService.ts:49:58 - error TS2551: Property 'getPFContribution' does not exist on type 'PFRepository'. Did you mean 'getContributions'?

49     const existingContribution = await this.pfRepository.getPFContribution(employeeId, month, year);
                                                            ~~~~~~~~~~~~~~~~~

  src/repositories/pfRepository.ts:127:9
    127   async getContributions(pfAccountId: string): Promise<PFContribution[]> {
                ~~~~~~~~~~~~~~~~
    'getContributions' is declared here.

src/services/pfService.ts:67:5 - error TS2739: Type 'PFContribution' is missing the following properties from type 'PFContribution': employee_id, basic_salary, employee_contribution_rate, employer_contribution_rate, updated_at

67     return this.pfRepository.recordPFContribution(contributionData);
       ~~~~~~

src/services/pfService.ts:74:5 - error TS2322: Type 'import("C:/Users/kamal/Downloads/Pharma-ERP/backend/src/repositories/pfRepository").PFAccount | null' is not assignable to type 'import("C:/Users/kamal/Downloads/Pharma-ERP/backend/src/types/benefits").PFAccount | null'.
  Type 'PFAccount' is missing the following properties from type 'PFAccount': pf_account_number, opening_balance, total_contributions, is_active

74     return this.pfRepository.getPFAccount(employeeId);
       ~~~~~~

src/services/pfService.ts:81:30 - error TS2551: Property 'getPFContribution' does not exist on type 'PFRepository'. Did you mean 'getContributions'?

81     return this.pfRepository.getPFContribution(employeeId, month, year);
                                ~~~~~~~~~~~~~~~~~

  src/repositories/pfRepository.ts:127:9
    127   async getContributions(pfAccountId: string): Promise<PFContribution[]> {
                ~~~~~~~~~~~~~~~~
    'getContributions' is declared here.

src/services/pfService.ts:88:5 - error TS2322: Type 'import("C:/Users/kamal/Downloads/Pharma-ERP/backend/src/repositories/pfRepository").PFContribution[]' is not assignable to type 'import("C:/Users/kamal/Downloads/Pharma-ERP/backend/src/types/benefits").PFContribution[]'.
  Type 'PFContribution' is missing the following properties from type 'PFContribution': employee_id, basic_salary, employee_contribution_rate, employer_contribution_rate, updated_at

88     return this.pfRepository.getPFContributionsByEmployee(employeeId);
       ~~~~~~

src/services/pfService.ts:111:51 - error TS2551: Property 'getPFContributionsByPeriod' does not exist on type 'PFRepository'. Did you mean 'getPFContributionsByEmployee'?

111     const contributions = await this.pfRepository.getPFContributionsByPeriod(
                                                      ~~~~~~~~~~~~~~~~~~~~~~~~~~

  src/repositories/pfRepository.ts:160:9
    160   async getPFContributionsByEmployee(employeeId: string): Promise<PFContribution[]> {  
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    'getPFContributionsByEmployee' is declared here.

src/services/pfService.ts:119:61 - error TS7006: Parameter 'sum' implicitly has an 'any' type. 

119     const totalEmployeeContribution = contributions.reduce((sum, c) => sum + c.employee_contribution, 0);
                                                                ~~~

src/services/pfService.ts:119:66 - error TS7006: Parameter 'c' implicitly has an 'any' type.   

119     const totalEmployeeContribution = contributions.reduce((sum, c) => sum + c.employee_contribution, 0);
                                                                     ~

src/services/pfService.ts:120:61 - error TS7006: Parameter 'sum' implicitly has an 'any' type. 

120     const totalEmployerContribution = contributions.reduce((sum, c) => sum + c.employer_contribution, 0);
                                                                ~~~

src/services/pfService.ts:120:66 - error TS7006: Parameter 'c' implicitly has an 'any' type.   

120     const totalEmployerContribution = contributions.reduce((sum, c) => sum + c.employer_contribution, 0);
                                                                     ~

src/services/pfService.ts:128:36 - error TS2339: Property 'pf_account_number' does not exist on type 'PFAccount'.

128       pf_account_number: pfAccount.pf_account_number,
                                       ~~~~~~~~~~~~~~~~~

src/services/pfService.ts:129:34 - error TS2339: Property 'opening_balance' does not exist on type 'PFAccount'.

129       opening_balance: pfAccount.opening_balance,
                                     ~~~~~~~~~~~~~~~

src/services/pipService.ts:32:5 - error TS2740: Type 'PIP' is missing the following properties from type 'PIP': employeeId, initiatedBy, startDate, endDate, and 3 more.

32     return this.pipRepository.createPIP({
       ~~~~~~

src/services/pipService.ts:46:5 - error TS2740: Type 'PIP' is missing the following properties from type 'PIP': employeeId, initiatedBy, startDate, endDate, and 3 more.

46     return pip;
       ~~~~~~

src/services/pipService.ts:50:5 - error TS2322: Type 'import("C:/Users/kamal/Downloads/Pharma-ERP/backend/src/repositories/pipRepository").PIP[]' is not assignable to type 'import("C:/Users/kamal/Downloads/Pharma-ERP/backend/src/types/performance").PIP[]'.
  Type 'PIP' is missing the following properties from type 'PIP': employeeId, initiatedBy, startDate, endDate, and 3 more.

50     return this.pipRepository.getPIPByEmployee(employeeId);
       ~~~~~~

src/services/pipService.ts:54:5 - error TS2322: Type 'import("C:/Users/kamal/Downloads/Pharma-ERP/backend/src/repositories/pipRepository").PIP[]' is not assignable to type 'import("C:/Users/kamal/Downloads/Pharma-ERP/backend/src/types/performance").PIP[]'.
  Type 'PIP' is missing the following properties from type 'PIP': employeeId, initiatedBy, startDate, endDate, and 3 more.

54     return this.pipRepository.getActivePIPs();
       ~~~~~~

src/services/rewardService.ts:40:46 - error TS2345: Argument of type 'string' is not assignable to parameter of type 'RewardCategory'.

40     if (!this.getRewardCategories().includes(data.category)) {
                                                ~~~~~~~~~~~~~

src/services/rewardService.ts:115:63 - error TS2345: Argument of type 'string' is not assignable to parameter of type 'RewardCategory'.

115     if (data.category && !this.getRewardCategories().includes(data.category)) {
                                                                  ~~~~~~~~~~~~~

src/services/salaryStructureService.ts:35:9 - error TS18048: 'data.base_salary' is possibly 'undefined'.

35     if (data.base_salary <= 0) {
           ~~~~~~~~~~~~~~~~

src/services/salaryStructureService.ts:39:9 - error TS18048: 'data.pf_contribution_rate' is possibly 'undefined'.

39     if (data.pf_contribution_rate < 0 || data.pf_contribution_rate > 100) {
           ~~~~~~~~~~~~~~~~~~~~~~~~~

src/services/salaryStructureService.ts:39:42 - error TS18048: 'data.pf_contribution_rate' is possibly 'undefined'.

39     if (data.pf_contribution_rate < 0 || data.pf_contribution_rate > 100) {
                                            ~~~~~~~~~~~~~~~~~~~~~~~~~

src/services/salaryStructureService.ts:43:9 - error TS18048: 'data.esi_contribution_rate' is possibly 'undefined'.

43     if (data.esi_contribution_rate < 0 || data.esi_contribution_rate > 100) {
           ~~~~~~~~~~~~~~~~~~~~~~~~~~

src/services/salaryStructureService.ts:43:43 - error TS18048: 'data.esi_contribution_rate' is possibly 'undefined'.

43     if (data.esi_contribution_rate < 0 || data.esi_contribution_rate > 100) {
                                             ~~~~~~~~~~~~~~~~~~~~~~~~~~

src/services/salaryStructureService.ts:60:9 - error TS18048: 'data.base_salary' is possibly 'undefined'.

60         data.base_salary +
           ~~~~~~~~~~~~~~~~

src/services/salaryStructureService.ts:61:9 - error TS18048: 'data.hra' is possibly 'undefined'.

61         data.hra +
           ~~~~~~~~

src/services/salaryStructureService.ts:62:9 - error TS18048: 'data.dearness_allowance' is possibly 'undefined'.

62         data.dearness_allowance +
           ~~~~~~~~~~~~~~~~~~~~~~~

src/services/salaryStructureService.ts:63:9 - error TS18048: 'data.other_allowances' is possibly 'undefined'.

63         data.other_allowances;
           ~~~~~~~~~~~~~~~~~~~~~

src/services/salaryStructureService.ts:66:9 - error TS18048: 'previousStructure.base_salary' is possibly 'undefined'.

66         previousStructure.base_salary +
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/services/salaryStructureService.ts:67:9 - error TS18048: 'previousStructure.hra' is possibly 'undefined'.

67         previousStructure.hra +
           ~~~~~~~~~~~~~~~~~~~~~

src/services/salaryStructureService.ts:68:9 - error TS18048: 'previousStructure.dearness_allowance' is possibly 'undefined'.

68         previousStructure.dearness_allowance +
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/services/salaryStructureService.ts:69:9 - error TS18048: 'previousStructure.other_allowances' is possibly 'undefined'.

69         previousStructure.other_allowances;
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/services/salaryStructureService.ts:139:7 - error TS18048: 'structure.base_salary' is possibly 'undefined'.

139       structure.base_salary +
          ~~~~~~~~~~~~~~~~~~~~~

src/services/salaryStructureService.ts:140:7 - error TS18048: 'structure.hra' is possibly 'undefined'.

140       structure.hra +
          ~~~~~~~~~~~~~

src/services/salaryStructureService.ts:141:7 - error TS18048: 'structure.dearness_allowance' is possibly 'undefined'.

141       structure.dearness_allowance +
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/services/salaryStructureService.ts:142:7 - error TS18048: 'structure.other_allowances' is possibly 'undefined'.

142       structure.other_allowances
          ~~~~~~~~~~~~~~~~~~~~~~~~~~

src/services/separationService.ts:187:5 - error TS2322: Type 'import("C:/Users/kamal/Downloads/Pharma-ERP/backend/src/repositories/resignationRepository").Resignation' is not assignable to type 'import("C:/Users/kamal/Downloads/Pharma-ERP/backend/src/types/separation").Resignation'.  
  Types of property 'status' are incompatible.
    Type 'string' is not assignable to type '"pending" | "rejected" | "accepted" | "withdrawn"'.

187     return resignation;
        ~~~~~~

src/services/separationService.ts:1295:5 - error TS2322: Type 'import("C:/Users/kamal/Downloads/Pharma-ERP/backend/src/repositories/resignationRepository").Resignation | null' is not assignable to type 'import("C:/Users/kamal/Downloads/Pharma-ERP/backend/src/types/separation").Resignation | null'.
  Type 'import("C:/Users/kamal/Downloads/Pharma-ERP/backend/src/repositories/resignationRepository").Resignation' is not assignable to type 'import("C:/Users/kamal/Downloads/Pharma-ERP/backend/src/types/separation").Resignation'.
    Types of property 'status' are incompatible.
      Type 'string' is not assignable to type '"pending" | "rejected" | "accepted" | "withdrawn"'.

1295     return this.resignationRepository.getResignationById(id);
         ~~~~~~

src/services/separationService.ts:1302:5 - error TS2322: Type 'import("C:/Users/kamal/Downloads/Pharma-ERP/backend/src/repositories/resignationRepository").Resignation | null' is not assignable to type 'import("C:/Users/kamal/Downloads/Pharma-ERP/backend/src/types/separation").Resignation | null'.
  Type 'import("C:/Users/kamal/Downloads/Pharma-ERP/backend/src/repositories/resignationRepository").Resignation' is not assignable to type 'import("C:/Users/kamal/Downloads/Pharma-ERP/backend/src/types/separation").Resignation'.
    Types of property 'status' are incompatible.
      Type 'string' is not assignable to type '"pending" | "rejected" | "accepted" | "withdrawn"'.

1302     return this.resignationRepository.getResignationByEmployeeId(employeeId);
         ~~~~~~

src/services/separationService.ts:1309:5 - error TS2322: Type 'import("C:/Users/kamal/Downloads/Pharma-ERP/backend/src/repositories/resignationRepository").Resignation' is not assignable to type 'import("C:/Users/kamal/Downloads/Pharma-ERP/backend/src/types/separation").Resignation'. 
  Types of property 'status' are incompatible.
    Type 'string' is not assignable to type '"pending" | "rejected" | "accepted" | "withdrawn"'.

1309     return this.resignationRepository.acceptResignation(resignationId, acceptedBy);       
         ~~~~~~

src/services/separationService.ts:1316:5 - error TS2322: Type 'import("C:/Users/kamal/Downloads/Pharma-ERP/backend/src/repositories/resignationRepository").Resignation' is not assignable to type 'import("C:/Users/kamal/Downloads/Pharma-ERP/backend/src/types/separation").Resignation'. 
  Types of property 'status' are incompatible.
    Type 'string' is not assignable to type '"pending" | "rejected" | "accepted" | "withdrawn"'.

1316     return this.resignationRepository.rejectResignation(resignationId);
         ~~~~~~

src/services/separationService.ts:1323:5 - error TS2322: Type 'import("C:/Users/kamal/Downloads/Pharma-ERP/backend/src/repositories/resignationRepository").Resignation' is not assignable to type 'import("C:/Users/kamal/Downloads/Pharma-ERP/backend/src/types/separation").Resignation'. 
  Types of property 'status' are incompatible.
    Type 'string' is not assignable to type '"pending" | "rejected" | "accepted" | "withdrawn"'.

1323     return this.resignationRepository.withdrawResignation(resignationId);
         ~~~~~~

src/services/supplierBuyerService.ts:94:45 - error TS2339: Property 'trim' does not exist on type 'string | Date'.
  Property 'trim' does not exist on type 'Date'.

94     if (!data.visit_date || data.visit_date.trim().length === 0) {
                                               ~~~~

src/services/supplierBuyerService.ts:98:62 - error TS2554: Expected 1 arguments, but got 3.    

98     return this.visitRepository.createVisit(supplierBuyerId, employeeId, data);
                                                                ~~~~~~~~~~~~~~~~

src/services/supplierBuyerService.ts:141:82 - error TS2554: Expected 2 arguments, but got 3.   

141     return this.visitRepository.getVisitsByDateRange(supplierBuyerId, startDate, endDate); 
                                                                                     ~~~~~~~   

src/services/trainingService.ts:90:81 - error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.

90     const program = await this.trainingProgramRepository.getTrainingProgramById(data.training_program_id);
                                                                                   ~~~~~~~~~~~~~~~~~~~~~~~~

src/services/trainingService.ts:96:92 - error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.

96       const allEnrollments = await this.trainingEnrollmentRepository.getProgramEnrollments(data.training_program_id);
                                                                                              ~~~~~~~~~~~~~~~~~~~~~~~~

src/services/trainingService.ts:131:69 - error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.

131     await this.autoUpdateSkillsOnCompletion(enrollment.employee_id, enrollment.training_program_id);
                                                                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/services/travelAllowanceService.ts:119:51 - error TS2339: Property 'getByEmployeeAndMonth' does not exist on type 'JourneyRepository'.

119     const journeys = await this.journeyRepository.getByEmployeeAndMonth(
                                                      ~~~~~~~~~~~~~~~~~~~~~


Found 81 errors in 19 files.

Errors  Files
     4  src/controllers/geoTrackingController.ts:104
     1  src/controllers/supplierBuyerController.ts:179
     5  src/middleware/rbac.ts:46
     3  src/services/auditLogService.ts:14
     1  src/services/documentService.ts:49
     1  src/services/insuranceService.ts:207
     1  src/services/leaveService.ts:183
     4  src/services/offerLetterService.ts:53
     2  src/services/onboardingService.ts:39
     1  src/services/payslipService.ts:71
     7  src/services/performanceReviewService.ts:43
    15  src/services/pfService.ts:22
     4  src/services/pipService.ts:32
     2  src/services/rewardService.ts:40
    17  src/services/salaryStructureService.ts:35
     6  src/services/separationService.ts:187
     3  src/services/supplierBuyerService.ts:94
     3  src/services/trainingService.ts:90
     1  src/services/travelAllowanceService.ts:119
npm error Lifecycle script `build` failed with error:
npm error code 2
npm error path C:\Users\kamal\Downloads\Pharma-ERP\backend
npm error workspace @ems/backend@1.0.0
npm error location C:\Users\kamal\Downloads\Pharma-ERP\backend
npm error command failed
npm error command C:\WINDOWS\system32\cmd.exe /d /s /c tsc<!--  -->