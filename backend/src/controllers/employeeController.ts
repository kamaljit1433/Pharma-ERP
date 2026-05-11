import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import PDFDocument from 'pdfkit';
import { EmployeeService } from '../services/employeeService';
import { EmployeeFilters } from '../types/employee';
import { getKnexInstance } from '../config/knex';
import { getAuditLogs } from '../utils/auditLog';

export const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const db = getKnexInstance();
const employeeService = new EmployeeService(db);

const UUID_FIELDS = ['department_id', 'designation_id', 'reporting_manager_id'] as const;

function sanitizeUuids(body: Record<string, any>): Record<string, any> {
  const sanitized = { ...body };
  for (const field of UUID_FIELDS) {
    if (sanitized[field] === '' || sanitized[field] === null) {
      delete sanitized[field];
    }
  }
  return sanitized;
}

export const createEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employee = await employeeService.createEmployee(sanitizeUuids(req.body) as any);
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

export const deleteEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params['id'] as string;
    const reason: string = req.body?.reason ?? 'Archived by admin';
    await employeeService.archiveEmployee(id, reason);
    res.status(200).json({
      success: true,
      message: 'Employee archived successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export const updateEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params['id'] as string;
    const employee = await employeeService.updateEmployee(id as string, sanitizeUuids(req.body) as any);
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

    // Department managers only see their own direct reports
    const user = (req as any).user;
    if (user?.role === 'department_manager' || user?.role === 'hr_manager') {
      if (user?.employeeId) {
        const managerEmployee = await db('employees')
          .where({ employee_id: user.employeeId })
          .select('id')
          .first();
        if (managerEmployee) {
          filters.reporting_manager_id = managerEmployee.id;
        }
      }
    }

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
    const { limit = '10', page = '1', department_id, designation_id, status, employment_type, search } = req.query;

    const parsedLimit = parseInt(limit as string);
    const parsedPage = parseInt(page as string);

    if (isNaN(parsedLimit) || isNaN(parsedPage)) {
      res.status(400).json({
        success: false,
        message: 'Invalid pagination parameters. limit and page must be numbers.',
      });
      return;
    }

    const safeLimit = Math.min(Math.max(parsedLimit, 1), 100);
    const safePage = Math.max(parsedPage, 1);
    const safeOffset = (safePage - 1) * safeLimit;

    const filters: EmployeeFilters = { limit: safeLimit, offset: safeOffset };
    if (department_id) filters.department_id = department_id as string;
    if (designation_id) filters.designation_id = designation_id as string;
    if (status) filters.status = status as AllowedStatus;
    if (employment_type) filters.employment_type = employment_type as AllowedEmploymentType;
    if (search) filters.search = search as string;

    // Department managers only see their own direct reports
    const user = (req as any).user;
    if (user?.role === 'department_manager' || user?.role === 'hr_manager') {
      if (user?.employeeId) {
        const managerEmployee = await db('employees')
          .where({ employee_id: user.employeeId })
          .select('id')
          .first();
        if (managerEmployee) {
          filters.reporting_manager_id = managerEmployee.id;
        }
      }
    }

    const employees = await employeeService.searchEmployees(filters);
    const countFilters: EmployeeFilters = { ...filters };
    delete countFilters.limit;
    delete countFilters.offset;
    const total = await employeeService.getEmployeeCount(countFilters);
    const totalPages = Math.ceil(total / safeLimit);

    res.status(200).json({
      success: true,
      data: employees,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages,
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

// Photo upload endpoint
export const uploadEmployeePhoto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params['id'] as string;
    const file = (req as any).file as Express.Multer.File | undefined;

    if (!file) {
      res.status(400).json({ success: false, message: 'No photo uploaded. Send an image in the "photo" field.' });
      return;
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.mimetype)) {
      res.status(400).json({ success: false, message: 'Invalid file type. Allowed: JPEG, PNG, WEBP, GIF.' });
      return;
    }

    const fs = await import('fs');
    const path = await import('path');
    const { v4: uuidv4 } = await import('uuid');

    const ext = file.originalname.split('.').pop() ?? 'jpg';
    const filename = `${uuidv4()}.${ext}`;
    const photosDir = path.join(process.cwd(), 'uploads', 'photos');
    if (!fs.existsSync(photosDir)) fs.mkdirSync(photosDir, { recursive: true });
    fs.writeFileSync(path.join(photosDir, filename), file.buffer);

    const photoUrl = `/uploads/photos/${filename}`;
    const employee = await employeeService.updateEmployee(id, { profile_photo_url: photoUrl } as any);

    res.status(200).json({ success: true, data: employee, url: photoUrl });
  } catch (error) {
    return next(error);
  }
};

export const getEmployeeAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params['id'] as string;
    const parsedLimit = req.query['limit'] ? parseInt(req.query['limit'] as string) : 50;
    const parsedOffset = req.query['offset'] ? parseInt(req.query['offset'] as string) : 0;
    const safeLimit = Math.min(isNaN(parsedLimit) ? 50 : parsedLimit, 100);
    const safeOffset = Math.max(isNaN(parsedOffset) ? 0 : parsedOffset, 0);
    const logs = await getAuditLogs(db, 'employee', id, safeLimit, safeOffset);
    res.status(200).json({ success: true, data: logs });
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

function parseCSV(buffer: Buffer): Record<string, string>[] {
  const text = buffer.toString('utf-8');
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = (lines[0] ?? '').split(',').map((h) => h.trim().toLowerCase().replace(/^"|"$/g, ''));
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
  });
}

function toCSVRow(values: (string | undefined)[]): string {
  return values.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',');
}

export const importEmployees = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) {
      res.status(400).json({ success: false, message: 'No file uploaded. Send a CSV file in the "file" field.' });
      return;
    }

    const rows = parseCSV(file.buffer);
    if (rows.length === 0) {
      res.status(400).json({ success: false, message: 'CSV file is empty or has no data rows.' });
      return;
    }

    let successCount = 0;
    let failedCount = 0;
    const errors: { row: number; message: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row) continue;
      try {
        await employeeService.createEmployee({
          first_name: row['first_name'] ?? '',
          last_name: row['last_name'] ?? '',
          email: row['email'] ?? '',
          phone: row['phone'] || undefined,
          date_of_birth: row['date_of_birth'] || undefined,
          gender: (row['gender'] as 'male' | 'female' | 'other' | undefined) || undefined,
          date_of_joining: row['date_of_joining'] ?? '',
          employment_type: (row['employment_type'] as 'permanent' | 'contract' | 'temporary' | 'intern') || 'permanent',
        });
        successCount++;
      } catch (err) {
        failedCount++;
        errors.push({ row: i + 2, message: err instanceof Error ? err.message : 'Unknown error' });
      }
    }

    res.status(200).json({ success: true, data: { success: successCount, failed: failedCount, errors } });
  } catch (error) {
    return next(error);
  }
};

const EXPORT_COLUMNS = [
  { key: 'employee_id',     label: 'Employee ID' },
  { key: 'first_name',      label: 'First Name' },
  { key: 'last_name',       label: 'Last Name' },
  { key: 'email',           label: 'Email' },
  { key: 'phone',           label: 'Phone' },
  { key: 'gender',          label: 'Gender' },
  { key: 'date_of_birth',   label: 'Date of Birth' },
  { key: 'date_of_joining', label: 'Date of Joining' },
  { key: 'employment_type', label: 'Employment Type' },
  { key: 'status',          label: 'Status' },
  { key: 'department_id',   label: 'Department ID' },
  { key: 'designation_id',  label: 'Designation ID' },
] as const;

export const exportEmployees = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { department_id, designation_id, status, employment_type, search, format = 'csv' } = req.query;

    const ALLOWED_FORMATS = ['csv', 'excel', 'pdf'] as const;
    type ExportFormat = typeof ALLOWED_FORMATS[number];
    if (!ALLOWED_FORMATS.includes(format as ExportFormat)) {
      res.status(400).json({ success: false, message: 'Invalid format. Allowed: csv, excel, pdf' });
      return;
    }

    const filters: EmployeeFilters = {};
    if (department_id) filters.department_id = department_id as string;
    if (designation_id) filters.designation_id = designation_id as string;
    if (status) filters.status = status as any;
    if (employment_type) filters.employment_type = employment_type as any;
    if (search) filters.search = search as string;

    const employees = await employeeService.searchEmployees({ ...filters, limit: 10000, offset: 0 });
    const dateStr = new Date().toISOString().split('T')[0];

    if (format === 'excel') {
      const rows = employees.map((e) =>
        Object.fromEntries(EXPORT_COLUMNS.map(({ key, label }) => [label, (e as any)[key] ?? '']))
      );
      const ws = XLSX.utils.json_to_sheet(rows);

      // Auto-fit column widths based on header + data content
      ws['!cols'] = EXPORT_COLUMNS.map(({ key, label }) => {
        const maxLen = employees.reduce((max, e) => {
          const val = String((e as any)[key] ?? '');
          return Math.max(max, val.length);
        }, label.length);
        return { wch: Math.min(maxLen + 2, 40) };
      });

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Employees');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="employees-${dateStr}.xlsx"`);
      res.setHeader('Content-Length', buffer.length);
      res.status(200).send(buffer);
      return;
    }

    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape', autoFirstPage: true });
      const chunks: Buffer[] = [];

      // Collect into memory — do NOT pipe directly to res before generation is complete
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));

      await new Promise<void>((resolve, reject) => {
        doc.on('end', resolve);
        doc.on('error', reject);

        const margin = 30;
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const rowHeight = 18;
        const visibleCols = EXPORT_COLUMNS.slice(0, 8);
        const colWidth = (pageWidth - margin * 2) / visibleCols.length;

        // Title
        doc.fontSize(14).font('Helvetica-Bold').text('Employee Report', margin, margin, { align: 'center', width: pageWidth - margin * 2 });
        doc.fontSize(9).font('Helvetica').text(`Generated: ${new Date().toLocaleDateString()}`, margin, doc.y, { align: 'center', width: pageWidth - margin * 2 });

        let currentY = doc.y + 8;

        const drawRow = (cells: string[], bold: boolean, bg?: string) => {
          if (bg) {
            doc.save().rect(margin, currentY, pageWidth - margin * 2, rowHeight).fill(bg).restore();
          }
          cells.forEach((cell, i) => {
            doc
              .font(bold ? 'Helvetica-Bold' : 'Helvetica')
              .fontSize(8)
              .fillColor('#000000')
              .text(String(cell).substring(0, 22), margin + i * colWidth, currentY + 4, { width: colWidth - 4, lineBreak: false });
          });
          currentY += rowHeight;
        };

        const addHeaderRow = () => {
          drawRow(visibleCols.map((c) => c.label), true, '#cbd5e1');
        };

        addHeaderRow();

        employees.forEach((e, idx) => {
          if (currentY + rowHeight > pageHeight - margin) {
            doc.addPage();
            currentY = margin;
            addHeaderRow();
          }
          drawRow(
            visibleCols.map(({ key }) => String((e as any)[key] ?? '')),
            false,
            idx % 2 === 0 ? '#f8fafc' : undefined
          );
        });

        doc.end();
      });

      const pdfBuffer = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="employees-${dateStr}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.status(200).send(pdfBuffer);
      return;
    }

    // Default: CSV
    const csvLines = [
      toCSVRow(EXPORT_COLUMNS.map((c) => c.label)),
      ...employees.map((e) => toCSVRow(EXPORT_COLUMNS.map(({ key }) => (e as any)[key] ?? ''))),
    ];
    const csv = csvLines.join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="employees-${dateStr}.csv"`);
    res.status(200).send(csv);
  } catch (error) {
    return next(error);
  }
};
