import { Request, Response, NextFunction } from 'express';
import { LeaveService } from '../services/leaveService';
import { LeaveTypeService } from '../services/leaveTypeService';
import { HolidayService } from '../services/holidayService';
import { Knex } from 'knex';

export class LeaveController {
  private leaveService: LeaveService;
  private leaveTypeService: LeaveTypeService;
  private holidayService: HolidayService;

  constructor(private knex: Knex) {
    this.leaveService = new LeaveService(knex);
    this.leaveTypeService = new LeaveTypeService(knex);
    this.holidayService = new HolidayService(knex);
  }

  // Leave Type endpoints
  async createLeaveType(req: Request, res: Response, next: NextFunction) {
    try {
      const leaveType = await this.leaveTypeService.createLeaveType(req.body);
      res.status(201).json(leaveType);
    } catch (error) {
      return next(error);
    }
  }

  async getLeaveTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const activeOnly = (req.query['activeOnly'] as string) !== 'false';
      const leaveTypes = await this.leaveTypeService.getAllLeaveTypes(activeOnly);
      res.json(leaveTypes);
    } catch (error) {
      return next(error);
    }
  }

  async getLeaveType(req: Request, res: Response, next: NextFunction) {
    try {
      const leaveType = await this.leaveTypeService.getLeaveType(req.params['id'] as string);
      res.json(leaveType);
    } catch (error) {
      return next(error);
    }
  }

  async updateLeaveType(req: Request, res: Response, next: NextFunction) {
    try {
      const leaveType = await this.leaveTypeService.updateLeaveType(
        req.params['id'] as string,
        req.body
      );
      res.json(leaveType);
    } catch (error) {
      return next(error);
    }
  }

  async deleteLeaveType(req: Request, res: Response, next: NextFunction) {
    try {
      await this.leaveTypeService.deleteLeaveType(req.params['id'] as string);
      res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }

  // Holiday endpoints
  async createHoliday(req: Request, res: Response, next: NextFunction) {
    try {
      const holiday = await this.holidayService.createHoliday(req.body);
      res.status(201).json(holiday);
    } catch (error) {
      return next(error);
    }
  }

  async getHolidays(req: Request, res: Response, next: NextFunction) {
    try {
      const { year, type } = req.query;

      let holidays;
      if (year) {
        holidays = await this.holidayService.getHolidaysByYear(Number(year));
      } else if (type) {
        holidays = await this.holidayService.getHolidaysByType(
          type as 'national' | 'regional' | 'company'
        );
      } else {
        holidays = await this.holidayService.getHolidaysByYear(new Date().getFullYear());
      }

      res.json(holidays);
    } catch (error) {
      return next(error);
    }
  }

  async getHoliday(req: Request, res: Response, next: NextFunction) {
    try {
      const holiday = await this.holidayService.getHoliday(req.params['id'] as string);
      res.json(holiday);
    } catch (error) {
      return next(error);
    }
  }

  async updateHoliday(req: Request, res: Response, next: NextFunction) {
    try {
      const holiday = await this.holidayService.updateHoliday(
        req.params['id'] as string,
        req.body
      );
      res.json(holiday);
    } catch (error) {
      return next(error);
    }
  }

  async deleteHoliday(req: Request, res: Response, next: NextFunction) {
    try {
      await this.holidayService.deleteHoliday(req.params['id'] as string);
      res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }

  async getLeaves(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, employeeId, fromDate, toDate } = req.query;
      const leaves = await this.leaveService.getLeaves({
        status: status as string | undefined,
        employeeId: employeeId as string | undefined,
        fromDate: fromDate as string | undefined,
        toDate: toDate as string | undefined,
      });
      res.json(leaves);
    } catch (error) {
      return next(error);
    }
  }

  async getPendingLeaves(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      let managerId: string | undefined;

      // reporting_manager_id references the employee UUID, not the user UUID.
      // Look it up via the employeeId string from the JWT.
      if (user?.role !== 'super_admin' && user?.employeeId) {
        const employee = await this.knex('employees')
          .where({ employee_id: user.employeeId })
          .select('id')
          .first();
        managerId = employee?.id;
      }

      const leaves = await this.leaveService.getPendingLeaves(managerId);
      res.json(leaves);
    } catch (error) {
      return next(error);
    }
  }

  async cancelLeave(req: Request, res: Response, next: NextFunction) {
    try {
      await this.leaveService.cancelLeave(req.params['id'] as string);
      res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }

  // Leave request endpoints
  async applyLeave(req: Request, res: Response, next: NextFunction) {
    try {
      const leave = await this.leaveService.applyLeave(req.body);
      res.status(201).json(leave);
    } catch (error) {
      return next(error);
    }
  }

  async approveLeave(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const approverEmployee = await this.knex('employees')
        .where({ employee_id: user?.employeeId })
        .select('id')
        .first();
      const approverId = approverEmployee?.id;
      await this.leaveService.approveLeave(req.params['id'] as string, approverId);
      res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }

  async rejectLeave(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const approverEmployee = await this.knex('employees')
        .where({ employee_id: user?.employeeId })
        .select('id')
        .first();
      const approverId = approverEmployee?.id;
      const { reason } = req.body;
      await this.leaveService.rejectLeave(req.params['id'] as string, approverId, reason);
      res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }

  async getLeaveBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeId = req.params['employeeId'] as string;
      const year = req.query['year'] ? Number(req.query['year']) : new Date().getFullYear();
      const balances = await this.leaveService.getLeaveBalance(employeeId as string, year);
      res.json(balances);
    } catch (error) {
      return next(error);
    }
  }

  async getTeamLeaveCalendar(req: Request, res: Response, next: NextFunction) {
    try {
      const managerId = (req as any).user?.id;
      const calendar = await this.leaveService.getTeamLeaveCalendar(managerId);
      res.json(calendar);
    } catch (error) {
      return next(error);
    }
  }
}
