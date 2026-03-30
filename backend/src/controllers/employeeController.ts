import { Request, Response, NextFunction } from 'express';
import { EmployeeService } from '../services/employeeService';
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
    next(error);
  }
};

export const getEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const employee = await employeeService.getEmployee(id);
    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const employee = await employeeService.updateEmployee(id, req.body);
    res.status(200).json({
      success: true,
      data: employee,
      message: 'Employee updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateEmployeeStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const employee = await employeeService.updateEmployeeStatus(id, status);
    res.status(200).json({
      success: true,
      data: employee,
      message: 'Employee status updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const searchEmployees = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { department_id, designation_id, status, employment_type, search, limit, offset } = req.query;

    // Validate pagination parameters
    const pageLimit = limit ? Math.min(parseInt(limit as string), 100) : 50;
    const pageOffset = offset ? Math.max(parseInt(offset as string), 0) : 0;

    if (isNaN(pageLimit) || isNaN(pageOffset)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pagination parameters. limit and offset must be numbers.',
      });
    }

    const filters = {
      department_id: department_id as string | undefined,
      designation_id: designation_id as string | undefined,
      status: status as any,
      employment_type: employment_type as any,
      search: search as string | undefined,
      limit: pageLimit,
      offset: pageOffset,
    };

    const employees = await employeeService.searchEmployees(filters);
    const total = await employeeService.getEmployeeCount(filters);

    res.status(200).json({
      success: true,
      data: employees,
      pagination: {
        total,
        limit: filters.limit,
        offset: filters.offset,
        hasMore: filters.offset + employees.length < total,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllEmployees = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const employees = await employeeService.getAllEmployees(
      parseInt(limit as string),
      parseInt(offset as string)
    );
    const total = await employeeService.getEmployeeCount();

    res.status(200).json({
      success: true,
      data: employees,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Emergency Contact endpoints
export const addEmergencyContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeId } = req.params;
    const contact = await employeeService.addEmergencyContact(employeeId, req.body);
    res.status(201).json({
      success: true,
      data: contact,
      message: 'Emergency contact added successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getEmergencyContacts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeId } = req.params;
    const contacts = await employeeService.getEmergencyContacts(employeeId);
    res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEmergencyContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contactId } = req.params;
    const contact = await employeeService.updateEmergencyContact(contactId, req.body);
    res.status(200).json({
      success: true,
      data: contact,
      message: 'Emergency contact updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEmergencyContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contactId } = req.params;
    await employeeService.deleteEmergencyContact(contactId);
    res.status(200).json({
      success: true,
      message: 'Emergency contact deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Employment History endpoints
export const addEmploymentHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeId } = req.params;
    const history = await employeeService.addEmploymentHistory(employeeId, req.body);
    res.status(201).json({
      success: true,
      data: history,
      message: 'Employment history added successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getEmploymentHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeId } = req.params;
    const history = await employeeService.getEmploymentHistory(employeeId);
    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};
