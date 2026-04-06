import { SeparationService } from '../separationService';
import { FnFSettlementRepository } from '../../repositories/fnfSettlementRepository';
import { EmployeeRepository } from '../../repositories/employeeRepository';
import { FileStorageService } from '../fileStorageService';

// Mock dependencies
jest.mock('../../repositories/fnfSettlementRepository');
jest.mock('../../repositories/employeeRepository');
jest.mock('../fileStorageService');
jest.mock('../../utils/logger');

describe('SeparationService - generateFnFStatement', () => {
  let separationService: SeparationService;
  let mockDb: any;
  let mockFnfSettlementRepository: jest.Mocked<FnFSettlementRepository>;
  let mockEmployeeRepository: jest.Mocked<EmployeeRepository>;
  let mockFileStorageService: jest.Mocked<FileStorageService>;

  const createMockUploadResult = (employeeId: string) => ({
    id: 'file-123',
    key: `documents/${employeeId}/fnf-statement-EMP001-1234567890.html`,
    url: `https://storage.example.com/documents/${employeeId}/fnf-statement-EMP001-1234567890.html`,
    metadata: {
      id: 'file-123',
      originalName: 'fnf-statement-EMP001-1234567890.html',
      fileName: 'fnf-statement-EMP001-1234567890.html',
      mimeType: 'text/html',
      size: 5000,
      category: 'document' as any,
      employeeId: employeeId,
      isPublic: false,
      key: `documents/${employeeId}/fnf-statement-EMP001-1234567890.html`,
      uploadedAt: new Date(),
      uploadedBy: 'system',
    },
  });

  beforeEach(() => {
    // Create mock query builder
    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      first: jest.fn(),
      orderBy: jest.fn().mockReturnThis(),
      update: jest.fn().mockResolvedValue([1]),
    };

    // Create mock database
    mockDb = jest.fn(() => mockQueryBuilder);
    mockDb.raw = jest.fn();
    mockDb.fn = { now: jest.fn() } as any;
    mockDb.schema = {} as any;
    mockDb._queryBuilder = mockQueryBuilder; // Store reference for test access

    // Create service instance
    separationService = new SeparationService(mockDb);

    // Get mocked instances
    mockFnfSettlementRepository = (separationService as any).fnfSettlementRepository;
    mockEmployeeRepository = (separationService as any).employeeRepository;
    mockFileStorageService = (separationService as any).fileStorageService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateFnFStatement', () => {
    it('should generate F&F statement and store in file storage', async () => {
      // Arrange
      const settlementId = 'settlement-123';
      const employeeId = 'employee-456';

      const mockSettlement = {
        id: settlementId,
        employee_id: employeeId,
        pending_salary: 50000,
        leave_encashment: 10000,
        gratuity: 25000,
        bonus: 5000,
        other_benefits: 2000,
        total_earnings: 92000,
        advance_deduction: 5000,
        asset_damage_deduction: 1000,
        other_deductions: 2000,
        total_deductions: 8000,
        net_settlement: 84000,
        status: 'approved',
        approved_by: 'hr-manager-123',
        approved_at: new Date('2026-03-15'),
        created_at: new Date('2026-03-10'),
        updated_at: new Date('2026-03-15'),
      };

      const mockEmployee = {
        id: employeeId,
        employee_id: 'EMP001',
        first_name: 'John',
        last_name: 'Doe',
        department_id: 'dept-123',
        designation_id: 'desig-123',
        date_of_joining: new Date('2020-01-15'),
      };

      const mockDepartment = { id: 'dept-123', name: 'Engineering' };
      const mockDesignation = { id: 'desig-123', title: 'Software Engineer' };
      const mockResignation = {
        id: 'resignation-123',
        employee_id: employeeId,
        last_working_day: new Date('2026-03-31'),
      };

      const mockUploadResult = createMockUploadResult(employeeId);

      mockFnfSettlementRepository.getFnFSettlement.mockResolvedValue(mockSettlement as any);
      mockEmployeeRepository.getEmployee.mockResolvedValue(mockEmployee as any);

      // Setup query builder responses
      mockDb._queryBuilder.first
        .mockResolvedValueOnce(mockDepartment)
        .mockResolvedValueOnce(mockDesignation)
        .mockResolvedValueOnce(mockResignation);

      mockFileStorageService.uploadFile.mockResolvedValue(mockUploadResult);

      // Act
      const result = await separationService.generateFnFStatement(settlementId);

      // Assert
      expect(mockFnfSettlementRepository.getFnFSettlement).toHaveBeenCalledWith(settlementId);
      expect(mockEmployeeRepository.getEmployee).toHaveBeenCalledWith(employeeId);
      expect(mockFileStorageService.uploadFile).toHaveBeenCalled();

      expect(result).toEqual({
        fileUrl: mockUploadResult.url,
        fileKey: mockUploadResult.key,
      });
    });

    it('should throw error if settlement not found', async () => {
      // Arrange
      const settlementId = 'non-existent-settlement';
      mockFnfSettlementRepository.getFnFSettlement.mockResolvedValue(null);

      // Act & Assert
      await expect(separationService.generateFnFStatement(settlementId)).rejects.toThrow(
        'F&F Settlement not found'
      );
    });

    it('should throw error if employee not found', async () => {
      // Arrange
      const settlementId = 'settlement-123';
      const mockSettlement = {
        id: settlementId,
        employee_id: 'employee-456',
        pending_salary: 50000,
        leave_encashment: 10000,
        gratuity: 25000,
        bonus: 5000,
        other_benefits: 2000,
        total_earnings: 92000,
        advance_deduction: 5000,
        asset_damage_deduction: 1000,
        other_deductions: 2000,
        total_deductions: 8000,
        net_settlement: 84000,
        status: 'approved',
      };

      mockFnfSettlementRepository.getFnFSettlement.mockResolvedValue(mockSettlement as any);
      mockEmployeeRepository.getEmployee.mockResolvedValue(null);

      // Act & Assert
      await expect(separationService.generateFnFStatement(settlementId)).rejects.toThrow(
        'Employee not found'
      );
    });
  });
});
