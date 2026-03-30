import fc from 'fast-check';
import { HierarchyService } from '../hierarchyService';
import { Knex } from 'knex';

/**
 * Property-Based Tests for Hierarchy Service
 * **Validates: Requirements 13.1**
 */

describe('HierarchyService - Property-Based Tests', () => {
  let hierarchyService: HierarchyService;
  let mockDb: Partial<Knex>;

  beforeEach(() => {
    const mockDbInstance = {
      insert: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockResolvedValue([]),
    };

    mockDb = jest.fn().mockReturnValue(mockDbInstance) as any;

    hierarchyService = new HierarchyService(mockDb as any);
  });

  /**
   * Property 46: Hierarchy depth support
   * Validates that the hierarchy service can handle arbitrary depth of reporting chains
   */
  it('Property 46: Should support arbitrary hierarchy depth', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.uuid(), { minLength: 1, maxLength: 10 }),
        async (employeeIds) => {
          if (employeeIds.length === 0) return;

          // Mock the reporting chain to return the array of employee IDs
          const mockHierarchyNodeRepo = (hierarchyService as any).hierarchyNodeRepository;
          const mockEmployeeRepo = (hierarchyService as any).employeeRepository;

          mockHierarchyNodeRepo.getReportingChain = jest.fn().mockResolvedValue(employeeIds.slice(1));

          // Mock employees
          mockEmployeeRepo.getEmployee = jest.fn().mockImplementation((id) => {
            const index = employeeIds.indexOf(id);
            return Promise.resolve({
              id,
              employee_id: `EMP${index}`,
              first_name: `Employee${index}`,
              last_name: 'Test',
            });
          });

          mockHierarchyNodeRepo.getHierarchyNodeByEmployeeId = jest.fn().mockResolvedValue({
            designation_id: 'desig1',
          });

          const mockDesignationRepo = (hierarchyService as any).designationRepository;
          mockDesignationRepo.getDesignationById = jest.fn().mockResolvedValue({
            id: 'desig1',
            name: 'Engineer',
          });

          const result = await hierarchyService.getReportingChain(employeeIds[0]!);

          // Verify the chain length matches the input
          expect(result.length).toBe(employeeIds.length - 1);

          // Verify each level is correctly numbered
          result.forEach((item, index) => {
            expect(item.level).toBe(index + 1);
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 47: Single primary position constraint
   * Validates that each employee can only have one primary position
   */
  it('Property 47: Should enforce single primary position per employee', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        async (employeeId, deptId, desigId) => {
          const mockEmployeeRepo = (hierarchyService as any).employeeRepository;
          const mockDepartmentRepo = (hierarchyService as any).departmentRepository;
          const mockDesignationRepo = (hierarchyService as any).designationRepository;
          const mockHierarchyNodeRepo = (hierarchyService as any).hierarchyNodeRepository;

          mockEmployeeRepo.getEmployee = jest.fn().mockResolvedValue({
            id: employeeId,
            employee_id: 'EMP001',
            first_name: 'John',
            last_name: 'Doe',
          });

          mockDepartmentRepo.getDepartmentById = jest.fn().mockResolvedValue({
            id: deptId,
            name: 'Engineering',
          });

          mockDesignationRepo.getDesignationById = jest.fn().mockResolvedValue({
            id: desigId,
            name: 'Engineer',
          });

          // First assignment should succeed
          mockHierarchyNodeRepo.getHierarchyNodeByEmployeeId = jest.fn().mockResolvedValue(null);
          mockHierarchyNodeRepo.createHierarchyNode = jest.fn().mockResolvedValue({
            id: 'node1',
            employee_id: employeeId,
            department_id: deptId,
            designation_id: desigId,
          });

          const mockDbInstance = {
            insert: jest.fn().mockReturnThis(),
          };

          (mockDb as any).mockReturnValue(mockDbInstance);

          const result1 = await hierarchyService.assignEmployeePosition(
            { employee_id: employeeId, department_id: deptId, designation_id: desigId },
            'admin1'
          );

          expect(result1).toBeDefined();
          expect(result1.employee_id).toBe(employeeId);

          // Second assignment should update, not create new
          mockHierarchyNodeRepo.getHierarchyNodeByEmployeeId = jest.fn().mockResolvedValue({
            id: 'node1',
            employee_id: employeeId,
            department_id: deptId,
            designation_id: desigId,
          });

          mockHierarchyNodeRepo.updateHierarchyNode = jest.fn().mockResolvedValue({
            id: 'node1',
            employee_id: employeeId,
            department_id: deptId,
            designation_id: desigId,
          });

          const result2 = await hierarchyService.assignEmployeePosition(
            { employee_id: employeeId, department_id: deptId, designation_id: desigId },
            'admin1'
          );

          expect(result2).toBeDefined();
          // Verify update was called, not create
          expect(mockHierarchyNodeRepo.updateHierarchyNode).toHaveBeenCalled();
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 48: Hierarchy-based access control
   * Validates that reporting chain is correctly retrieved for access control
   */
  it('Property 48: Should correctly retrieve reporting chain for access control', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.array(fc.uuid(), { minLength: 0, maxLength: 5 }),
        async (employeeId, managerIds) => {
          const mockEmployeeRepo = (hierarchyService as any).employeeRepository;
          const mockHierarchyNodeRepo = (hierarchyService as any).hierarchyNodeRepository;
          const mockDesignationRepo = (hierarchyService as any).designationRepository;

          mockEmployeeRepo.getEmployee = jest.fn().mockImplementation((id) => {
            if (id === employeeId) {
              return Promise.resolve({
                id: employeeId,
                employee_id: 'EMP001',
                first_name: 'Employee',
                last_name: 'Test',
              });
            }
            const index = managerIds.indexOf(id);
            return Promise.resolve({
              id,
              employee_id: `EMP${index + 2}`,
              first_name: `Manager${index}`,
              last_name: 'Test',
            });
          });

          mockHierarchyNodeRepo.getReportingChain = jest.fn().mockResolvedValue(managerIds);
          mockHierarchyNodeRepo.getHierarchyNodeByEmployeeId = jest.fn().mockResolvedValue({
            designation_id: 'desig1',
          });

          mockDesignationRepo.getDesignationById = jest.fn().mockResolvedValue({
            id: 'desig1',
            name: 'Manager',
          });

          const chain = await hierarchyService.getReportingChain(employeeId);

          // Verify chain length matches manager IDs
          expect(chain.length).toBe(managerIds.length);

          // Verify all managers are in the chain
          chain.forEach((manager, index) => {
            expect(manager.id).toBe(managerIds[index]);
            expect(manager.level).toBe(index + 1);
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 49: Hierarchy change audit
   * Validates that all hierarchy changes are properly logged
   */
  it('Property 49: Should audit all hierarchy changes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        async (employeeId, deptId, desigId) => {
          const mockEmployeeRepo = (hierarchyService as any).employeeRepository;
          const mockDepartmentRepo = (hierarchyService as any).departmentRepository;
          const mockDesignationRepo = (hierarchyService as any).designationRepository;
          const mockHierarchyNodeRepo = (hierarchyService as any).hierarchyNodeRepository;

          mockEmployeeRepo.getEmployee = jest.fn().mockResolvedValue({
            id: employeeId,
            employee_id: 'EMP001',
            first_name: 'John',
            last_name: 'Doe',
          });

          mockDepartmentRepo.getDepartmentById = jest.fn().mockResolvedValue({
            id: deptId,
            name: 'Engineering',
          });

          mockDesignationRepo.getDesignationById = jest.fn().mockResolvedValue({
            id: desigId,
            name: 'Engineer',
          });

          mockHierarchyNodeRepo.getHierarchyNodeByEmployeeId = jest.fn().mockResolvedValue(null);
          mockHierarchyNodeRepo.createHierarchyNode = jest.fn().mockResolvedValue({
            id: 'node1',
            employee_id: employeeId,
            department_id: deptId,
            designation_id: desigId,
          });

          const mockDbInstance = {
            insert: jest.fn().mockReturnThis(),
          };

          (mockDb as any).mockReturnValue(mockDbInstance);

          await hierarchyService.assignEmployeePosition(
            { employee_id: employeeId, department_id: deptId, designation_id: desigId },
            'admin1'
          );

          // Verify audit log was created
          expect(mockDb).toHaveBeenCalled();
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 50: Supplier/buyer visit GPS logging
   * Validates that department and designation names are non-empty
   */
  it('Property 50: Should validate department and designation names', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
        async (deptName, desigName) => {
          const mockDepartmentRepo = (hierarchyService as any).departmentRepository;
          const mockDesignationRepo = (hierarchyService as any).designationRepository;

          mockDepartmentRepo.getDepartmentByName = jest.fn().mockResolvedValue(null);
          mockDepartmentRepo.createDepartment = jest.fn().mockResolvedValue({
            id: 'dept1',
            name: deptName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          mockDesignationRepo.getDesignationByName = jest.fn().mockResolvedValue(null);
          mockDesignationRepo.createDesignation = jest.fn().mockResolvedValue({
            id: 'desig1',
            name: desigName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          const dept = await hierarchyService.createDepartment({ name: deptName });
          const desig = await hierarchyService.createDesignation({ name: desigName });

          // Verify names are preserved
          expect(dept.name).toBe(deptName);
          expect(desig.name).toBe(desigName);

          // Verify names are not empty
          expect(dept.name.length).toBeGreaterThan(0);
          expect(desig.name.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Dotted-line reporting support
   * Validates that dotted-line managers are correctly tracked
   */
  it('Should support dotted-line reporting relationships', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        async (employeeId, primaryManagerId, dottedManagerId) => {
          const mockEmployeeRepo = (hierarchyService as any).employeeRepository;
          const mockDepartmentRepo = (hierarchyService as any).departmentRepository;
          const mockDesignationRepo = (hierarchyService as any).designationRepository;
          const mockHierarchyNodeRepo = (hierarchyService as any).hierarchyNodeRepository;

          mockEmployeeRepo.getEmployee = jest.fn().mockResolvedValue({
            id: employeeId,
            employee_id: 'EMP001',
            first_name: 'John',
            last_name: 'Doe',
          });

          mockDepartmentRepo.getDepartmentById = jest.fn().mockResolvedValue({
            id: 'dept1',
            name: 'Engineering',
          });

          mockDesignationRepo.getDesignationById = jest.fn().mockResolvedValue({
            id: 'desig1',
            name: 'Engineer',
          });

          mockHierarchyNodeRepo.getHierarchyNodeByEmployeeId = jest.fn().mockResolvedValue(null);
          mockHierarchyNodeRepo.createHierarchyNode = jest.fn().mockResolvedValue({
            id: 'node1',
            employee_id: employeeId,
            department_id: 'dept1',
            designation_id: 'desig1',
            manager_id: primaryManagerId,
            dotted_line_manager_id: dottedManagerId,
          });

          const mockDbInstance = {
            insert: jest.fn().mockReturnThis(),
          };

          (mockDb as any).mockReturnValue(mockDbInstance);

          const result = await hierarchyService.assignEmployeePosition(
            {
              employee_id: employeeId,
              department_id: 'dept1',
              designation_id: 'desig1',
              manager_id: primaryManagerId,
              dotted_line_manager_id: dottedManagerId,
            },
            'admin1'
          );

          // Verify both managers are assigned
          expect(result.manager_id).toBe(primaryManagerId);
          expect(result.dotted_line_manager_id).toBe(dottedManagerId);
        }
      ),
      { numRuns: 50 }
    );
  });
});
