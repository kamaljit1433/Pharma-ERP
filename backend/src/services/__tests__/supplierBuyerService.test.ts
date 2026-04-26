import { SupplierBuyerService } from '../supplierBuyerService';
import { SupplierBuyerRepository } from '../../repositories/supplierBuyerRepository';
import { VisitRepository } from '../../repositories/visitRepository';
import { SupplierBuyer, Visit, CreateSupplierBuyerDTO, CreateVisitDTO } from '../../types/supplierBuyer';
import { v4 as uuidv4 } from 'uuid';

describe('SupplierBuyerService', () => {
  let service: SupplierBuyerService;
  let supplierBuyerRepository: jest.Mocked<SupplierBuyerRepository>;
  let visitRepository: jest.Mocked<VisitRepository>;

  const mockEmployeeId = uuidv4();
  const mockSupplierBuyerId = uuidv4();
  const mockVisitId = uuidv4();

  const mockSupplierBuyer: SupplierBuyer = {
    id: mockSupplierBuyerId,
    employee_id: mockEmployeeId,
    name: 'ABC Supplies',
    type: 'supplier',
    contact_person: 'John Doe',
    email: 'john@abc.com',
    phone: '9876543210',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    notes: 'Reliable supplier',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockVisit: Visit = {
    id: mockVisitId,
    record_id: mockSupplierBuyerId,
    supplier_buyer_id: mockSupplierBuyerId,
    employee_id: mockEmployeeId,
    visit_date: new Date().toISOString(),
    latitude: 40.7128,
    longitude: -74.006,
    purpose: 'Quarterly review',
    notes: 'Discussed new products',
    document_url: 'https://example.com/doc.pdf',
    created_at: new Date().toISOString(),
  };

  beforeEach(() => {
    supplierBuyerRepository = {
      createSupplierBuyer: jest.fn(),
      getSupplierBuyerById: jest.fn(),
      getSupplierBuyersByEmployee: jest.fn(),
      getSupplierBuyersByType: jest.fn(),
      updateSupplierBuyer: jest.fn(),
      deleteSupplierBuyer: jest.fn(),
      searchSupplierBuyers: jest.fn(),
      getSupplierBuyerCount: jest.fn(),
    } as any;

    visitRepository = {
      createVisit: jest.fn(),
      getVisitById: jest.fn(),
      getVisitsBySupplierBuyer: jest.fn(),
      getVisitsByEmployee: jest.fn(),
      getVisitsByDateRange: jest.fn(),
      updateVisit: jest.fn(),
      deleteVisit: jest.fn(),
      getVisitHistory: jest.fn(),
      getVisitCount: jest.fn(),
      getRecentVisits: jest.fn(),
    } as any;

    service = new SupplierBuyerService(supplierBuyerRepository, visitRepository);
  });

  describe('createSupplierBuyer', () => {
    it('should create a supplier/buyer record', async () => {
      const data: CreateSupplierBuyerDTO = {
        name: 'ABC Supplies',
        type: 'supplier',
        contact_person: 'John Doe',
        email: 'john@abc.com',
        phone: '9876543210',
      };

      supplierBuyerRepository.createSupplierBuyer.mockResolvedValue(mockSupplierBuyer);

      const result = await service.createSupplierBuyer(mockEmployeeId, data);

      expect(result).toEqual(mockSupplierBuyer);
      expect(supplierBuyerRepository.createSupplierBuyer).toHaveBeenCalledWith(mockEmployeeId, data);
    });

    it('should throw error if name is empty', async () => {
      const data: CreateSupplierBuyerDTO = {
        name: '',
        type: 'supplier',
      };

      await expect(service.createSupplierBuyer(mockEmployeeId, data)).rejects.toThrow(
        'Supplier/Buyer name is required'
      );
    });

    it('should throw error if type is invalid', async () => {
      const data = {
        name: 'ABC Supplies',
        type: 'invalid',
      } as any;

      await expect(service.createSupplierBuyer(mockEmployeeId, data)).rejects.toThrow(
        'Type must be either "supplier" or "buyer"'
      );
    });
  });

  describe('getSupplierBuyer', () => {
    it('should retrieve a supplier/buyer by ID', async () => {
      supplierBuyerRepository.getSupplierBuyerById.mockResolvedValue(mockSupplierBuyer);

      const result = await service.getSupplierBuyer(mockSupplierBuyerId);

      expect(result).toEqual(mockSupplierBuyer);
      expect(supplierBuyerRepository.getSupplierBuyerById).toHaveBeenCalledWith(mockSupplierBuyerId);
    });

    it('should throw error if supplier/buyer not found', async () => {
      supplierBuyerRepository.getSupplierBuyerById.mockResolvedValue(null);

      await expect(service.getSupplierBuyer(mockSupplierBuyerId)).rejects.toThrow(
        `Supplier/Buyer with ID ${mockSupplierBuyerId} not found`
      );
    });
  });

  describe('updateSupplierBuyer', () => {
    it('should update a supplier/buyer record', async () => {
      const updateData = { name: 'Updated Name' };
      const updatedSupplierBuyer = { ...mockSupplierBuyer, name: 'Updated Name' };

      supplierBuyerRepository.getSupplierBuyerById.mockResolvedValue(mockSupplierBuyer);
      supplierBuyerRepository.updateSupplierBuyer.mockResolvedValue(updatedSupplierBuyer);

      const result = await service.updateSupplierBuyer(mockSupplierBuyerId, updateData);

      expect(result).toEqual(updatedSupplierBuyer);
      expect(supplierBuyerRepository.updateSupplierBuyer).toHaveBeenCalledWith(mockSupplierBuyerId, updateData);
    });

    it('should throw error if supplier/buyer not found', async () => {
      supplierBuyerRepository.getSupplierBuyerById.mockResolvedValue(null);

      await expect(service.updateSupplierBuyer(mockSupplierBuyerId, {})).rejects.toThrow(
        `Supplier/Buyer with ID ${mockSupplierBuyerId} not found`
      );
    });

    it('should throw error if type is invalid', async () => {
      supplierBuyerRepository.getSupplierBuyerById.mockResolvedValue(mockSupplierBuyer);

      await expect(service.updateSupplierBuyer(mockSupplierBuyerId, { type: 'invalid' as any })).rejects.toThrow(
        'Type must be either "supplier" or "buyer"'
      );
    });
  });

  describe('deleteSupplierBuyer', () => {
    it('should delete a supplier/buyer record', async () => {
      supplierBuyerRepository.getSupplierBuyerById.mockResolvedValue(mockSupplierBuyer);
      supplierBuyerRepository.deleteSupplierBuyer.mockResolvedValue(undefined);

      await service.deleteSupplierBuyer(mockSupplierBuyerId);

      expect(supplierBuyerRepository.deleteSupplierBuyer).toHaveBeenCalledWith(mockSupplierBuyerId);
    });

    it('should throw error if supplier/buyer not found', async () => {
      supplierBuyerRepository.getSupplierBuyerById.mockResolvedValue(null);

      await expect(service.deleteSupplierBuyer(mockSupplierBuyerId)).rejects.toThrow(
        `Supplier/Buyer with ID ${mockSupplierBuyerId} not found`
      );
    });
  });

  describe('getSupplierBuyersByEmployee', () => {
    it('should retrieve all supplier/buyer records for an employee', async () => {
      const records = [mockSupplierBuyer];
      supplierBuyerRepository.getSupplierBuyersByEmployee.mockResolvedValue(records);

      const result = await service.getSupplierBuyersByEmployee(mockEmployeeId);

      expect(result).toEqual(records);
      expect(supplierBuyerRepository.getSupplierBuyersByEmployee).toHaveBeenCalledWith(mockEmployeeId);
    });
  });

  describe('getSupplierBuyersByType', () => {
    it('should retrieve supplier/buyer records by type', async () => {
      const records = [mockSupplierBuyer];
      supplierBuyerRepository.getSupplierBuyersByType.mockResolvedValue(records);

      const result = await service.getSupplierBuyersByType(mockEmployeeId, 'supplier');

      expect(result).toEqual(records);
      expect(supplierBuyerRepository.getSupplierBuyersByType).toHaveBeenCalledWith(mockEmployeeId, 'supplier');
    });

    it('should throw error if type is invalid', async () => {
      await expect(service.getSupplierBuyersByType(mockEmployeeId, 'invalid' as any)).rejects.toThrow(
        'Type must be either "supplier" or "buyer"'
      );
    });
  });

  describe('searchSupplierBuyers', () => {
    it('should search supplier/buyer records', async () => {
      const records = [mockSupplierBuyer];
      supplierBuyerRepository.searchSupplierBuyers.mockResolvedValue(records);

      const result = await service.searchSupplierBuyers(mockEmployeeId, 'ABC');

      expect(result).toEqual(records);
      expect(supplierBuyerRepository.searchSupplierBuyers).toHaveBeenCalledWith(mockEmployeeId, 'ABC');
    });

    it('should return all records if search term is empty', async () => {
      const records = [mockSupplierBuyer];
      supplierBuyerRepository.getSupplierBuyersByEmployee.mockResolvedValue(records);

      const result = await service.searchSupplierBuyers(mockEmployeeId, '');

      expect(result).toEqual(records);
      expect(supplierBuyerRepository.getSupplierBuyersByEmployee).toHaveBeenCalledWith(mockEmployeeId);
    });
  });

  describe('logVisit', () => {
    it('should log a visit with GPS coordinates', async () => {
      const visitData: CreateVisitDTO = {
        record_id: mockSupplierBuyerId,
        visit_date: new Date().toISOString(),
        latitude: 40.7128,
        longitude: -74.006,
        purpose: 'Quarterly review',
        notes: 'Discussed new products',
      };

      supplierBuyerRepository.getSupplierBuyerById.mockResolvedValue(mockSupplierBuyer);
      visitRepository.createVisit.mockResolvedValue(mockVisit);

      const result = await service.logVisit(mockSupplierBuyerId, mockEmployeeId, visitData);

      expect(result).toEqual(mockVisit);
      expect(visitRepository.createVisit).toHaveBeenCalledWith(mockSupplierBuyerId, mockEmployeeId, visitData);
    });

    it('should throw error if supplier/buyer not found', async () => {
      supplierBuyerRepository.getSupplierBuyerById.mockResolvedValue(null);

      await expect(
        service.logVisit(mockSupplierBuyerId, mockEmployeeId, { record_id: mockSupplierBuyerId, visit_date: new Date().toISOString() })
      ).rejects.toThrow(`Supplier/Buyer with ID ${mockSupplierBuyerId} not found`);
    });

    it('should throw error if employee is not the owner', async () => {
      const differentEmployeeId = uuidv4();
      supplierBuyerRepository.getSupplierBuyerById.mockResolvedValue(mockSupplierBuyer);

      await expect(
        service.logVisit(mockSupplierBuyerId, differentEmployeeId, { record_id: mockSupplierBuyerId, visit_date: new Date().toISOString() })
      ).rejects.toThrow('Unauthorized: Employee can only log visits for their own supplier/buyer records');
    });

    it('should throw error if visit date is missing', async () => {
      supplierBuyerRepository.getSupplierBuyerById.mockResolvedValue(mockSupplierBuyer);

      await expect(service.logVisit(mockSupplierBuyerId, mockEmployeeId, { record_id: mockSupplierBuyerId, visit_date: '' })).rejects.toThrow(
        'Visit date is required'
      );
    });
  });

  describe('getVisit', () => {
    it('should retrieve a visit by ID', async () => {
      visitRepository.getVisitById.mockResolvedValue(mockVisit);

      const result = await service.getVisit(mockVisitId);

      expect(result).toEqual(mockVisit);
      expect(visitRepository.getVisitById).toHaveBeenCalledWith(mockVisitId);
    });

    it('should throw error if visit not found', async () => {
      visitRepository.getVisitById.mockResolvedValue(null);

      await expect(service.getVisit(mockVisitId)).rejects.toThrow(`Visit with ID ${mockVisitId} not found`);
    });
  });

  describe('getVisitHistory', () => {
    it('should retrieve visit history for a supplier/buyer', async () => {
      const history = [
        {
          id: mockVisitId,
          visit_date: new Date().toISOString(),
          purpose: 'Quarterly review',
          notes: 'Discussed new products',
          latitude: 40.7128,
          longitude: -74.006,
          document_url: 'https://example.com/doc.pdf',
          created_at: new Date().toISOString(),
        },
      ];

      supplierBuyerRepository.getSupplierBuyerById.mockResolvedValue(mockSupplierBuyer);
      visitRepository.getVisitHistory.mockResolvedValue(history);

      const result = await service.getVisitHistory(mockSupplierBuyerId);

      expect(result).toEqual(history);
      expect(visitRepository.getVisitHistory).toHaveBeenCalledWith(mockSupplierBuyerId);
    });

    it('should throw error if supplier/buyer not found', async () => {
      supplierBuyerRepository.getSupplierBuyerById.mockResolvedValue(null);

      await expect(service.getVisitHistory(mockSupplierBuyerId)).rejects.toThrow(
        `Supplier/Buyer with ID ${mockSupplierBuyerId} not found`
      );
    });
  });

  describe('getRecentVisits', () => {
    it('should retrieve recent visits with default limit', async () => {
      const visits = [mockVisit];
      supplierBuyerRepository.getSupplierBuyerById.mockResolvedValue(mockSupplierBuyer);
      visitRepository.getRecentVisits.mockResolvedValue(visits);

      const result = await service.getRecentVisits(mockSupplierBuyerId);

      expect(result).toEqual(visits);
      expect(visitRepository.getRecentVisits).toHaveBeenCalledWith(mockSupplierBuyerId, 10);
    });

    it('should retrieve recent visits with custom limit', async () => {
      const visits = [mockVisit];
      supplierBuyerRepository.getSupplierBuyerById.mockResolvedValue(mockSupplierBuyer);
      visitRepository.getRecentVisits.mockResolvedValue(visits);

      const result = await service.getRecentVisits(mockSupplierBuyerId, 5);

      expect(result).toEqual(visits);
      expect(visitRepository.getRecentVisits).toHaveBeenCalledWith(mockSupplierBuyerId, 5);
    });

    it('should throw error if limit is invalid', async () => {
      supplierBuyerRepository.getSupplierBuyerById.mockResolvedValue(mockSupplierBuyer);

      await expect(service.getRecentVisits(mockSupplierBuyerId, 0)).rejects.toThrow(
        'Limit must be between 1 and 100'
      );

      await expect(service.getRecentVisits(mockSupplierBuyerId, 101)).rejects.toThrow(
        'Limit must be between 1 and 100'
      );
    });
  });

  describe('getVisitsByDateRange', () => {
    it('should retrieve visits within a date range', async () => {
      const visits = [mockVisit];
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';

      supplierBuyerRepository.getSupplierBuyerById.mockResolvedValue(mockSupplierBuyer);
      visitRepository.getVisitsByDateRange.mockResolvedValue(visits);

      const result = await service.getVisitsByDateRange(mockSupplierBuyerId, startDate, endDate);

      expect(result).toEqual(visits);
      expect(visitRepository.getVisitsByDateRange).toHaveBeenCalledWith(mockSupplierBuyerId, startDate, endDate);
    });

    it('should throw error if supplier/buyer not found', async () => {
      supplierBuyerRepository.getSupplierBuyerById.mockResolvedValue(null);

      await expect(service.getVisitsByDateRange(mockSupplierBuyerId, '2024-01-01', '2024-12-31')).rejects.toThrow(
        `Supplier/Buyer with ID ${mockSupplierBuyerId} not found`
      );
    });
  });

  describe('updateVisit', () => {
    it('should update a visit', async () => {
      const updateData = { notes: 'Updated notes' };
      const updatedVisit = { ...mockVisit, notes: 'Updated notes' };

      visitRepository.getVisitById.mockResolvedValue(mockVisit);
      visitRepository.updateVisit.mockResolvedValue(updatedVisit);

      const result = await service.updateVisit(mockVisitId, updateData);

      expect(result).toEqual(updatedVisit);
      expect(visitRepository.updateVisit).toHaveBeenCalledWith(mockVisitId, updateData);
    });

    it('should throw error if visit not found', async () => {
      visitRepository.getVisitById.mockResolvedValue(null);

      await expect(service.updateVisit(mockVisitId, {})).rejects.toThrow(`Visit with ID ${mockVisitId} not found`);
    });
  });

  describe('deleteVisit', () => {
    it('should delete a visit', async () => {
      visitRepository.getVisitById.mockResolvedValue(mockVisit);
      visitRepository.deleteVisit.mockResolvedValue(undefined);

      await service.deleteVisit(mockVisitId);

      expect(visitRepository.deleteVisit).toHaveBeenCalledWith(mockVisitId);
    });

    it('should throw error if visit not found', async () => {
      visitRepository.getVisitById.mockResolvedValue(null);

      await expect(service.deleteVisit(mockVisitId)).rejects.toThrow(`Visit with ID ${mockVisitId} not found`);
    });
  });

  describe('getVisitCount', () => {
    it('should return visit count for a supplier/buyer', async () => {
      supplierBuyerRepository.getSupplierBuyerById.mockResolvedValue(mockSupplierBuyer);
      visitRepository.getVisitCount.mockResolvedValue(5);

      const result = await service.getVisitCount(mockSupplierBuyerId);

      expect(result).toBe(5);
      expect(visitRepository.getVisitCount).toHaveBeenCalledWith(mockSupplierBuyerId);
    });

    it('should throw error if supplier/buyer not found', async () => {
      supplierBuyerRepository.getSupplierBuyerById.mockResolvedValue(null);

      await expect(service.getVisitCount(mockSupplierBuyerId)).rejects.toThrow(
        `Supplier/Buyer with ID ${mockSupplierBuyerId} not found`
      );
    });
  });

  describe('getSupplierBuyerCount', () => {
    it('should return supplier/buyer count for an employee', async () => {
      supplierBuyerRepository.getSupplierBuyerCount.mockResolvedValue(3);

      const result = await service.getSupplierBuyerCount(mockEmployeeId);

      expect(result).toBe(3);
      expect(supplierBuyerRepository.getSupplierBuyerCount).toHaveBeenCalledWith(mockEmployeeId);
    });
  });
});
