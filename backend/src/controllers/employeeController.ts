import { Request, Response, NextFunction } from 'express';
import { EmployeeService } from '../services/employeeService';
import { EmployeeFilters } from '../types/employee';
import { getKnexInstance } from '../config/knex';

const db = getKnexInstance();
const employeeService = new EmployeeService(db);

export const createEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employee = await employeeService.createEmployee(req.body);
    res.status(201).json({
      success: true,
      data: employee,
      message: 'Employee created successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export const getEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params['id'] as string;
    const employee = await employeeService.getEmployee(id as string);
    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params['id'] as string;
    const employee = await employeeService.updateEmployee(id as string, req.body);
    res.status(200).json({
      success: true,
      data: employee,
      message: 'Employee updated successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export const updateEmployeeStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params['id'] as string;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ success: false, message: 'Status is required' });
      return;
    }

    // Validate status value
    const validStatuses = ['active', 'on_leave', 'suspended', 'resigned', 'terminated'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`,
      });
      return;
    }

    const employee = await employeeService.updateEmployeeStatus(id as string, status);
    res.status(200).json({
      success: true,
      data: employee,
      message: 'Employee status updated successfully',
    });
  } catch (error) {
    return next(error);
  }
};

const ALLOWED_STATUSES = ['active', 'on_leave', 'suspended', 'resigned', 'terminated'] as const;
const ALLOWED_EMPLOYMENT_TYPES = ['permanent', 'contract', 'temporary', 'intern'] as const;
type AllowedStatus = typeof ALLOWED_STATUSES[number];
type AllowedEmploymentType = typeof ALLOWED_EMPLOYMENT_TYPES[number];

export const searchEmployees = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { department_id, designation_id, status, employment_type, search, limit, offset } = req.query;

    // Validate pagination parameters before any math operations
    const parsedLimit = limit ? parseInt(limit as string) : 50;
    const parsedOffset = offset ? parseInt(offset as string) : 0;

    if (isNaN(parsedLimit) || isNaN(parsedOffset)) {
      res.status(400).json({
        success: false,
        message: 'Invalid pagination parameters. limit and offset must be numbers.',
      });
      return;
    }

    const pageLimit = Math.min(parsedLimit, 100);
    const pageOffset = Math.max(parsedOffset, 0);

    // Validate enum filter values
    if (status && !ALLOWED_STATUSES.includes(status as AllowedStatus)) {
      res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(', ')}`,
      });
      return;
    }

    if (employment_type && !ALLOWED_EMPLOYMENT_TYPES.includes(employment_type as AllowedEmploymentType)) {
      res.status(400).json({
        success: false,
        message: `Invalid employment_type. Allowed values: ${ALLOWED_EMPLOYMENT_TYPES.join(', ')}`,
      });
      return;
    }

    // Build filters without explicitly including undefined values (exactOptionalPropertyTypes)
    const filters: EmployeeFilters = { limit: pageLimit, offset: pageOffset };
    if (department_id) filters.department_id = department_id as string;
    if (designation_id) filters.designation_id = designation_id as string;
    if (status) filters.status = status as AllowedStatus;
    if (employment_type) filters.employment_type = employment_type as AllowedEmploymentType;
    if (search) filters.search = search as string;

    const employees = await employeeService.searchEmployees(filters);
    const total = await employeeService.getEmployeeCount(filters);

    res.status(200).json({
      success: true,
      data: employees,
      pagination: {
        total,
        limit: pageLimit,
        offset: pageOffset,
        hasMore: pageOffset + employees.length < total,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllEmployees = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { limit = '50', offset = '0' } = req.query;

    const parsedLimit = parseInt(limit as string);
    const parsedOffset = parseInt(offset as string);

    if (isNaN(parsedLimit) || isNaN(parsedOffset)) {
      res.status(400).json({
        success: false,
        message: 'Invalid pagination parameters. limit and offset must be numbers.',
      });
      return;
    }

    const safeLimit = Math.min(Math.max(parsedLimit, 1), 100);
    const safeOffset = Math.max(parsedOffset, 0);

    const employees = await employeeService.getAllEmployees(safeLimit, safeOffset);
    const total = await employeeService.getEmployeeCount();

    res.status(200).json({
      success: true,
      data: employees,
      pagination: {
        total,
        limit: safeLimit,
        offset: safeOffset,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Emergency Contact endpoints
export const addEmergencyContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = req.params['employeeId'] as string;
    const contact = await employeeService.addEmergencyContact(employeeId as string, req.body);
    res.status(201).json({
      success: true,
      data: contact,
      message: 'Emergency contact added successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export const getEmergencyContacts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = req.params['employeeId'] as string;
    const contacts = await employeeService.getEmergencyContacts(employeeId as string);
    res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateEmergencyContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeId, contactId } = req.params;
    const contact = await employeeService.updateEmergencyContact(
      employeeId as string,
      contactId as string,
      req.body
    );
    res.status(200).json({
      success: true,
      data: contact,
      message: 'Emergency contact updated successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteEmergencyContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeId, contactId } = req.params;
    await employeeService.deleteEmergencyContact(employeeId as string, contactId as string);
    res.status(200).json({
      success: true,
      message: 'Emergency contact deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
};

// Employment History endpoints
export const addEmploymentHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = req.params['employeeId'] as string;
    const history = await employeeService.addEmploymentHistory(employeeId as string, req.body);
    res.status(201).json({
      success: true,
      data: history,
      message: 'Employment history added successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export const getEmploymentHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = req.params['employeeId'] as string;
    const history = await employeeService.getEmploymentHistory(employeeId as string);
    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    return next(error);
  }
};
