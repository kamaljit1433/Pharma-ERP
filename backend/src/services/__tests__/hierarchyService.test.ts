import { Knex } from 'knex';
import { HierarchyService } from '../hierarchyService';
import { DepartmentRepository } from '../../repositories/departmentRepository';
import { DesignationRepository } from '../../repositories/designationRepository';
import { HierarchyNodeRepository } from '../../repositories/hierarchyNodeRepository';
import { EmployeeRepository } from '../../repositories/employeeRepository';

describe('HierarchyService', () => {
  let hierarchyService: HierarchyService;
  let mockDb: Partial<Knex>;
  let mockDepartmentRepo: Partial<DepartmentRepository>;
  let mockDesignationRepo: Partial<DesignationRepository>;
  let mockHierarchyNodeRepo: Partial<HierarchyNodeRepository>;
  let mockEmployeeRepo: Partial<EmployeeRepository>;

  beforeEach(() => {
    const mockDbInstance = {
      insert: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockResolvedValue([]),
    };

    mockDb = jest.fn().mockReturnValue(mockDbInstance) as any;

    mockDepartmentRepo = {
      createDepartment: jest.fn(),
      getDepartmentById: jest.fn(),
      getDepartmentByName: jest.fn(),
      getAllDepartments: jest.fn(),
      updateDepartment: jest.fn(),
      deleteDepartment: jest.fn(),
    };

    mockDesignationRepo = {
      createDesignation: jest.fn(),
      getDesignationById: jest.fn(),
      getDesignationByName: jest.fn(),
      getAllDesignations: jest.fn(),
      updateDesignation: jest.fn(),
      deleteDesignation: jest.fn(),
    };

    mockHierarchyNodeRepo = {
      createHierarchyNode: jest.fn(),
      getHierarchyNodeByEmployeeId: jest.fn(),
      getHierarchyNodeById: jest.fn(),
      updateHierarchyNode: jest.fn(),
      deleteHierarchyNode: jest.fn(),
      getDirectReports: jest.fn(),
      getDottedLineReports: jest.fn(),
      getEmployeesByDepartment: jest.fn(),
      getEmployeesByDesignation: jest.fn(),
      getReportingChain: jest.fn(),
      getAllHierarchyNodes: jest.fn(),
    };

    mockEmployeeRepo = {
      getEmployee: jest.fn(),
      createEmployee: jest.fn(),
      updateEmployee: jest.fn(),
    };

    hierarchyService = new HierarchyService(mockDb as any);
    (hierarchyService as any).departmentRepository = mockDepartmentRepo;
    (hierarchyService as any).designationRepository = mockDesignationRepo;
    (hierarchyService as any).hierarchyNodeRepository = mockHierarchyNodeRepo;
    (hierarchyService as any).employeeRepository = mockEmployeeRepo;
  });

  describe('Department Operations', () => {
    it('should create a department', async () => {
      const deptData = { name: 'Engineering', description: 'Engineering Department' };
      const createdDept = { id: '1', ...deptData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };

      (mockDepartmentRepo.getDepartmentByName as jest.Mock).mockResolvedValue(null);
      (mockDepartmentRepo.createDepartment as jest.Mock).mockResolvedValue(createdDept);

      const result = await hierarchyService.createDepartment(deptData);

      expect(result).toEqual(createdDept);
      expect(mockDepartmentRepo.createDepartment).toHaveBeenCalledWith(deptData);
    });

    it('should throw error if department name is empty', async () => {
      await expect(hierarchyService.createDepartment({ name: '' })).rejects.toThrow('Department name is required');
    });

    it('should throw error if department name already exists', async () => {
      const deptData = { name: 'Engineering' };
      (mockDepartmentRepo.getDepartmentByName as jest.Mock).mockResolvedValue({ id: '1', name: 'Engineering' });

      await expect(hierarchyService.createDepartment(deptData)).rejects.toThrow('Department with this name already exists');
    });

    it('should get a department by id', async () => {
      const dept = { id: '1', name: 'Engineering', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      (mockDepartmentRepo.getDepartmentById as jest.Mock).mockResolvedValue(dept);

      const result = await hierarchyService.getDepartment('1');

      expect(result).toEqual(dept);
    });

    it('should throw error if department not found', async () => {
      (mockDepartmentRepo.getDepartmentById as jest.Mock).mockResolvedValue(null);

      await expect(hierarchyService.getDepartment('1')).rejects.toThrow('Department not found');
    });

    it('should update a department', async () => {
      const dept = { id: '1', name: 'Engineering', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      const updatedDept = { ...dept, name: 'Engineering & Operations' };

      (mockDepartmentRepo.getDepartmentById as jest.Mock).mockResolvedValue(dept);
      (mockDepartmentRepo.getDepartmentByName as jest.Mock).mockResolvedValue(null);
      (mockDepartmentRepo.updateDepartment as jest.Mock).mockResolvedValue(updatedDept);

      const result = await hierarchyService.updateDepartment('1', { name: 'Engineering & Operations' });

      expect(result).toEqual(updatedDept);
    });

    it('should delete a department', async () => {
      const dept = { id: '1', name: 'Engineering', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };

      (mockDepartmentRepo.getDepartmentById as jest.Mock).mockResolvedValue(dept);
      (mockHierarchyNodeRepo.getEmployeesByDepartment as jest.Mock).mockResolvedValue([]);

      await hierarchyService.deleteDepartment('1');

      expect(mockDepartmentRepo.deleteDepartment).toHaveBeenCalledWith('1');
    });

    it('should throw error when deleting department with employees', async () => {
      const dept = { id: '1', name: 'Engineering', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      const employee = { id: 'emp1', employee_id: 'EMP001', department_id: '1' };

      (mockDepartmentRepo.getDepartmentById as jest.Mock).mockResolvedValue(dept);
      (mockHierarchyNodeRepo.getEmployeesByDepartment as jest.Mock).mockResolvedValue([employee]);

      await expect(hierarchyService.deleteDepartment('1')).rejects.toThrow('Cannot delete department with assigned employees');
    });

    it('should get all departments', async () => {
      const depts = [
        { id: '1', name: 'Engineering', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: '2', name: 'HR', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ];

      (mockDepartmentRepo.getAllDepartments as jest.Mock).mockResolvedValue(depts);

      const result = await hierarchyService.getAllDepartments();

      expect(result).toEqual(depts);
    });
  });

  describe('Designation Operations', () => {
    it('should create a designation', async () => {
      const desigData = { name: 'Senior Engineer', level: '3' };
      const createdDesig = { id: '1', ...desigData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };

      (mockDesignationRepo.getDesignationByName as jest.Mock).mockResolvedValue(null);
      (mockDesignationRepo.createDesignation as jest.Mock).mockResolvedValue(createdDesig);

      const result = await hierarchyService.createDesignation(desigData);

      expect(result).toEqual(createdDesig);
    });

    it('should throw error if designation name is empty', async () => {
      await expect(hierarchyService.createDesignation({ name: '' })).rejects.toThrow('Designation name is required');
    });

    it('should throw error if designation name already exists', async () => {
      const desigData = { name: 'Senior Engineer' };
      (mockDesignationRepo.getDesignationByName as jest.Mock).mockResolvedValue({ id: '1', name: 'Senior Engineer' });

      await expect(hierarchyService.createDesignation(desigData)).rejects.toThrow('Designation with this name already exists');
    });

    it('should get all designations', async () => {
      const desigs = [
        { id: '1', name: 'Engineer', level: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: '2', name: 'Senior Engineer', level: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ];

      (mockDesignationRepo.getAllDesignations as jest.Mock).mockResolvedValue(desigs);

      const result = await hierarchyService.getAllDesignations();

      expect(result).toEqual(desigs);
    });
  });

  describe('Employee Position Assignment', () => {
    it('should assign employee position', async () => {
      const employee = { id: 'emp1', employee_id: 'EMP001', first_name: 'John', last_name: 'Doe' };
      const dept = { id: 'dept1', name: 'Engineering' };
      const desig = { id: 'desig1', name: 'Engineer' };
      const assignData = { employee_id: 'emp1', department_id: 'dept1', designation_id: 'desig1' };
      const createdNode = { id: 'node1', ...assignData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };

      (mockEmployeeRepo.getEmployee as jest.Mock).mockResolvedValue(employee);
      (mockDepartmentRepo.getDepartmentById as jest.Mock).mockResolvedValue(dept);
      (mockDesignationRepo.getDesignationById as jest.Mock).mockResolvedValue(desig);
      (mockHierarchyNodeRepo.getHierarchyNodeByEmployeeId as jest.Mock).mockResolvedValue(null);
      (mockHierarchyNodeRepo.createHierarchyNode as jest.Mock).mockResolvedValue(createdNode);

      const result = await hierarchyService.assignEmployeePosition(assignData, 'admin1');

      expect(result).toEqual(createdNode);
      expect(mockHierarchyNodeRepo.createHierarchyNode).toHaveBeenCalledWith(assignData);
    });

    it('should throw error if employee not found', async () => {
      const assignData = { employee_id: 'emp1', department_id: 'dept1', designation_id: 'desig1' };

      (mockEmployeeRepo.getEmployee as jest.Mock).mockResolvedValue(null);

      await expect(hierarchyService.assignEmployeePosition(assignData, 'admin1')).rejects.toThrow('Employee not found');
    });

    it('should throw error if department not found', async () => {
      const employee = { id: 'emp1', employee_id: 'EMP001' };
      const assignData = { employee_id: 'emp1', department_id: 'dept1', designation_id: 'desig1' };

      (mockEmployeeRepo.getEmployee as jest.Mock).mockResolvedValue(employee);
      (mockDepartmentRepo.getDepartmentById as jest.Mock).mockResolvedValue(null);

      await expect(hierarchyService.assignEmployeePosition(assignData, 'admin1')).rejects.toThrow('Department not found');
    });

    it('should throw error if designation not found', async () => {
      const employee = { id: 'emp1', employee_id: 'EMP001' };
      const dept = { id: 'dept1', name: 'Engineering' };
      const assignData = { employee_id: 'emp1', department_id: 'dept1', designation_id: 'desig1' };

      (mockEmployeeRepo.getEmployee as jest.Mock).mockResolvedValue(employee);
      (mockDepartmentRepo.getDepartmentById as jest.Mock).mockResolvedValue(dept);
      (mockDesignationRepo.getDesignationById as jest.Mock).mockResolvedValue(null);

      await expect(hierarchyService.assignEmployeePosition(assignData, 'admin1')).rejects.toThrow('Designation not found');
    });
  });

  describe('Reporting Chain', () => {
    it('should get reporting chain', async () => {
      const employee = { id: 'emp1', employee_id: 'EMP001', first_name: 'John', last_name: 'Doe' };
      const manager = { id: 'emp2', employee_id: 'EMP002', first_name: 'Jane', last_name: 'Smith' };
      const director = { id: 'emp3', employee_id: 'EMP003', first_name: 'Bob', last_name: 'Johnson' };
      const desig2 = { id: 'desig2', name: 'Manager' };
      const desig3 = { id: 'desig3', name: 'Director' };

      (mockEmployeeRepo.getEmployee as jest.Mock)
        .mockResolvedValueOnce(employee)
        .mockResolvedValueOnce(manager)
        .mockResolvedValueOnce(director);

      (mockHierarchyNodeRepo.getReportingChain as jest.Mock).mockResolvedValue(['emp2', 'emp3']);
      (mockHierarchyNodeRepo.getHierarchyNodeByEmployeeId as jest.Mock)
        .mockResolvedValueOnce({ designation_id: 'desig2' })
        .mockResolvedValueOnce({ designation_id: 'desig3' });

      (mockDesignationRepo.getDesignationById as jest.Mock)
        .mockResolvedValueOnce(desig2)
        .mockResolvedValueOnce(desig3);

      const result = await hierarchyService.getReportingChain('emp1');

      expect(result).toHaveLength(2);
      expect(result[0]?.first_name).toBe('Jane');
      expect(result[1]?.first_name).toBe('Bob');
    });

    it('should throw error if employee not found', async () => {
      (mockEmployeeRepo.getEmployee as jest.Mock).mockResolvedValue(null);

      await expect(hierarchyService.getReportingChain('emp1')).rejects.toThrow('Employee not found');
    });
  });

  describe('Direct Reports', () => {
    it('should get direct reports', async () => {
      const manager = { id: 'emp1', employee_id: 'EMP001', first_name: 'Jane', last_name: 'Smith' };
      const report1 = { id: 'emp2', employee_id: 'EMP002', first_name: 'John', last_name: 'Doe' };
      const report2 = { id: 'emp3', employee_id: 'EMP003', first_name: 'Alice', last_name: 'Brown' };
      const dept = { id: 'dept1', name: 'Engineering' };
      const desig = { id: 'desig1', name: 'Engineer' };

      const directReportNodes = [
        { employee_id: 'emp2', department_id: 'dept1', designation_id: 'desig1' },
        { employee_id: 'emp3', department_id: 'dept1', designation_id: 'desig1' },
      ];

      (mockEmployeeRepo.getEmployee as jest.Mock)
        .mockResolvedValueOnce(manager)
        .mockResolvedValueOnce(report1)
        .mockResolvedValueOnce(report2);

      (mockHierarchyNodeRepo.getDirectReports as jest.Mock).mockResolvedValue(directReportNodes);
      (mockHierarchyNodeRepo.getDottedLineReports as jest.Mock).mockResolvedValue([]);
      (mockDesignationRepo.getDesignationById as jest.Mock).mockResolvedValue(desig);
      (mockDepartmentRepo.getDepartmentById as jest.Mock).mockResolvedValue(dept);

      const result = await hierarchyService.getDirectReports('emp1');

      expect(result).toHaveLength(2);
      expect(result[0]?.first_name).toBe('John');
      expect(result[1]?.first_name).toBe('Alice');
    });

    it('should throw error if manager not found', async () => {
      (mockEmployeeRepo.getEmployee as jest.Mock).mockResolvedValue(null);

      await expect(hierarchyService.getDirectReports('emp1')).rejects.toThrow('Manager not found');
    });
  });

  describe('Org Chart Generation', () => {
    it('should generate org chart', async () => {
      const ceo = { id: 'emp1', employee_id: 'EMP001', first_name: 'CEO', last_name: 'Person' };
      const manager = { id: 'emp2', employee_id: 'EMP002', first_name: 'Manager', last_name: 'Person' };
      const desig1 = { id: 'desig1', name: 'CEO' };
      const desig2 = { id: 'desig2', name: 'Manager' };
      const dept = { id: 'dept1', name: 'Engineering' };

      (mockEmployeeRepo.getEmployee as jest.Mock)
        .mockResolvedValueOnce(ceo)
        .mockResolvedValueOnce(manager);

      (mockHierarchyNodeRepo.getAllHierarchyNodes as jest.Mock).mockResolvedValue([
        { employee_id: 'emp1', manager_id: null },
        { employee_id: 'emp2', manager_id: 'emp1' },
      ]);

      (mockHierarchyNodeRepo.getHierarchyNodeByEmployeeId as jest.Mock)
        .mockResolvedValueOnce({ designation_id: 'desig1', department_id: 'dept1' })
        .mockResolvedValueOnce({ designation_id: 'desig2', department_id: 'dept1' });

      (mockDesignationRepo.getDesignationById as jest.Mock)
        .mockResolvedValueOnce(desig1)
        .mockResolvedValueOnce(desig2);

      (mockDepartmentRepo.getDepartmentById as jest.Mock).mockResolvedValue(dept);
      (mockHierarchyNodeRepo.getDirectReports as jest.Mock)
        .mockResolvedValueOnce([{ employee_id: 'emp2' }])
        .mockResolvedValueOnce([]);

      const result = await hierarchyService.generateOrgChart();

      expect(result.first_name).toBe('CEO');
      expect(result.children).toHaveLength(1);
      expect(result.children[0]?.first_name).toBe('Manager');
    });
  });

  describe('Hierarchy Audit Logging', () => {
    it('should get hierarchy audit logs', async () => {
      const logs = [
        {
          id: '1',
          employee_id: 'emp1',
          action: 'assign',
          old_value: null,
          new_value: JSON.stringify({ department_id: 'dept1' }),
          changed_by: 'admin1',
          created_at: new Date().toISOString(),
        },
      ];

      const mockDbInstance = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue(logs),
      };

      (mockDb as any).mockReturnValue(mockDbInstance);

      const result = await hierarchyService.getHierarchyAuditLogs('emp1');

      expect(result).toHaveLength(1);
      expect(result[0]?.action).toBe('assign');
    });
  });
});
