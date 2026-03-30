import { Response, NextFunction } from 'express';
import { 
  canAccessFile, 
  canUploadFile, 
  canDeleteFile, 
  validateSignedUrlRequest 
} from '../../middleware/fileAccessControl';
import { AuthenticatedRequest } from '../../middleware/auth';
import { FileCategory } from '../../types/fileStorage';

// Mock response object
const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Mock next function
const mockNext = jest.fn() as NextFunction;

// Helper to create mock authenticated request
const createMockRequest = (user?: any, params?: any, body?: any, query?: any): AuthenticatedRequest => {
  return {
    user,
    params: params || {},
    body: body || {},
    query: query || {},
    headers: {}
  } as unknown as AuthenticatedRequest;
};

describe('File Access Control Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('canAccessFile', () => {
    it('should allow super admin to access any file', () => {
      const req = createMockRequest(
        { id: '1', role: 'super_admin', employeeId: 'emp1' },
        { key: 'employees/emp2/document/2024-01-01/test.pdf' }
      );
      const res = mockResponse();

      canAccessFile(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow employee to access their own files', () => {
      const req = createMockRequest(
        { id: '1', role: 'employee', employeeId: 'emp1' },
        { key: 'employees/emp1/document/2024-01-01/test.pdf' }
      );
      const res = mockResponse();

      canAccessFile(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should deny employee access to other employee files', () => {
      const req = createMockRequest(
        { id: '1', role: 'employee', employeeId: 'emp1' },
        { key: 'employees/emp2/document/2024-01-01/test.pdf' }
      );
      const res = mockResponse();

      canAccessFile(req, res, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should deny access when user is not authenticated', () => {
      const req = createMockRequest(
        undefined,
        { key: 'employees/emp1/document/2024-01-01/test.pdf' }
      );
      const res = mockResponse();

      canAccessFile(req, res, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('canUploadFile', () => {
    it('should allow employee to upload their own files', () => {
      const req = createMockRequest(
        { id: '1', role: 'employee', employeeId: 'emp1' },
        {},
        { employeeId: 'emp1', category: FileCategory.DOCUMENT }
      );
      const res = mockResponse();

      canUploadFile(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should deny employee from uploading payslips', () => {
      const req = createMockRequest(
        { id: '1', role: 'employee', employeeId: 'emp1' },
        {},
        { employeeId: 'emp1', category: FileCategory.PAYSLIP }
      );
      const res = mockResponse();

      canUploadFile(req, res, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('validateSignedUrlRequest', () => {
    it('should allow valid parameters', () => {
      const req = createMockRequest(
        undefined,
        {},
        {},
        { operation: 'getObject', expiresIn: '3600' }
      );
      const res = mockResponse();

      validateSignedUrlRequest(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject invalid operation', () => {
      const req = createMockRequest(
        undefined,
        {},
        {},
        { operation: 'invalidOperation' }
      );
      const res = mockResponse();

      validateSignedUrlRequest(req, res, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});