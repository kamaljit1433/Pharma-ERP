import { Knex } from 'knex';
import { InsurancePlanRepository } from '../repositories/insurancePlanRepository';
import { InsuranceEnrollmentRepository } from '../repositories/insuranceEnrollmentRepository';
import {
  InsurancePlan,
  InsuranceEnrollment,
  CreateInsurancePlanDTO,
  UpdateInsurancePlanDTO,
  CreateInsuranceEnrollmentDTO,
  UpdateInsuranceEnrollmentDTO,
  EnrollmentWindowValidation,
} from '../types/insurance';

export class InsuranceService {
  private insurancePlanRepository: InsurancePlanRepository;
  private insuranceEnrollmentRepository: InsuranceEnrollmentRepository;

  constructor(db: Knex) {
    this.insurancePlanRepository = new InsurancePlanRepository(db);
    this.insuranceEnrollmentRepository = new InsuranceEnrollmentRepository(db);
  }

  // Insurance Plan CRUD Operations
  async createInsurancePlan(data: CreateInsurancePlanDTO): Promise<InsurancePlan> {
    // Validate required fields
    if (!data.name || !data.provider || !data.coverage_type) {
      throw new Error('Missing required fields: name, provider, coverage_type');
    }

    // Validate premium amount
    if (data.premium_amount <= 0) {
      throw new Error('Premium amount must be greater than 0');
    }

    // Validate enrollment dates
    if (data.enrollment_start_date >= data.enrollment_end_date) {
      throw new Error('Enrollment start date must be before end date');
    }

    return this.insurancePlanRepository.createInsurancePlan(data);
  }

  async getInsurancePlan(id: string): Promise<InsurancePlan> {
    const plan = await this.insurancePlanRepository.getInsurancePlanById(id);
    if (!plan) {
      throw new Error('Insurance plan not found');
    }
    return plan;
  }

  async getAllInsurancePlans(isActive?: boolean): Promise<InsurancePlan[]> {
    return this.insurancePlanRepository.getAllInsurancePlans(isActive);
  }

  async getActiveInsurancePlans(): Promise<InsurancePlan[]> {
    return this.insurancePlanRepository.getActiveInsurancePlans();
  }

  async getInsurancePlansByType(coverageType: string): Promise<InsurancePlan[]> {
    return this.insurancePlanRepository.getInsurancePlansByType(coverageType);
  }

  async updateInsurancePlan(id: string, data: UpdateInsurancePlanDTO): Promise<InsurancePlan> {
    const plan = await this.insurancePlanRepository.getInsurancePlanById(id);
    if (!plan) {
      throw new Error('Insurance plan not found');
    }

    // Validate premium amount if provided
    if (data.premium_amount !== undefined && data.premium_amount <= 0) {
      throw new Error('Premium amount must be greater than 0');
    }

    // Validate enrollment dates if provided
    if (data.enrollment_start_date && data.enrollment_end_date) {
      if (data.enrollment_start_date >= data.enrollment_end_date) {
        throw new Error('Enrollment start date must be before end date');
      }
    }

    return this.insurancePlanRepository.updateInsurancePlan(id, data);
  }

  async deleteInsurancePlan(id: string): Promise<void> {
    const plan = await this.insurancePlanRepository.getInsurancePlanById(id);
    if (!plan) {
      throw new Error('Insurance plan not found');
    }

    return this.insurancePlanRepository.deleteInsurancePlan(id);
  }

  // Insurance Enrollment Operations
  async enrollEmployee(data: CreateInsuranceEnrollmentDTO): Promise<InsuranceEnrollment> {
    // Validate required fields
    if (!data.employee_id || !data.insurance_plan_id) {
      throw new Error('Missing required fields: employee_id, insurance_plan_id');
    }

    // Get insurance plan
    const plan = await this.insurancePlanRepository.getInsurancePlanById(data.insurance_plan_id);
    if (!plan) {
      throw new Error('Insurance plan not found');
    }

    // Validate enrollment window
    const windowValidation = this.validateEnrollmentWindow(
      data.enrollment_date,
      plan.enrollment_start_date,
      plan.enrollment_end_date
    );

    if (!windowValidation.isValid) {
      throw new Error(`Enrollment window validation failed: ${windowValidation.reason}`);
    }

    // Check if employee already enrolled in this plan
    const existingEnrollment = await this.insuranceEnrollmentRepository.getEnrollmentByEmployeeAndPlan(
      data.employee_id,
      data.insurance_plan_id
    );

    if (existingEnrollment && existingEnrollment.status === 'active') {
      throw new Error('Employee is already enrolled in this insurance plan');
    }

    return this.insuranceEnrollmentRepository.createInsuranceEnrollment(data);
  }

  async getEmployeeEnrollments(employeeId: string): Promise<InsuranceEnrollment[]> {
    return this.insuranceEnrollmentRepository.getEmployeeEnrollments(employeeId);
  }

  async getActiveEmployeeEnrollments(employeeId: string): Promise<InsuranceEnrollment[]> {
    return this.insuranceEnrollmentRepository.getActiveEmployeeEnrollments(employeeId);
  }

  async getEnrollmentDetails(enrollmentId: string): Promise<InsuranceEnrollment> {
    const enrollment = await this.insuranceEnrollmentRepository.getInsuranceEnrollmentById(enrollmentId);
    if (!enrollment) {
      throw new Error('Insurance enrollment not found');
    }
    return enrollment;
  }

  async updateEnrollment(
    enrollmentId: string,
    data: UpdateInsuranceEnrollmentDTO
  ): Promise<InsuranceEnrollment> {
    const enrollment = await this.insuranceEnrollmentRepository.getInsuranceEnrollmentById(enrollmentId);
    if (!enrollment) {
      throw new Error('Insurance enrollment not found');
    }

    return this.insuranceEnrollmentRepository.updateInsuranceEnrollment(enrollmentId, data);
  }

  async cancelEnrollment(enrollmentId: string, effectiveTo: Date): Promise<InsuranceEnrollment> {
    const enrollment = await this.insuranceEnrollmentRepository.getInsuranceEnrollmentById(enrollmentId);
    if (!enrollment) {
      throw new Error('Insurance enrollment not found');
    }

    if (enrollment.status === 'cancelled') {
      throw new Error('Enrollment is already cancelled');
    }

    return this.insuranceEnrollmentRepository.cancelInsuranceEnrollment(enrollmentId, effectiveTo);
  }

  // Enrollment Window Validation
  validateEnrollmentWindow(
    enrollmentDate: Date,
    startDate: Date,
    endDate: Date
  ): EnrollmentWindowValidation {
    const enrollment = new Date(enrollmentDate);
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (enrollment < start) {
      return {
        isValid: false,
        reason: 'Enrollment date is before the enrollment window start date',
      };
    }

    if (enrollment > end) {
      return {
        isValid: false,
        reason: 'Enrollment date is after the enrollment window end date',
      };
    }

    return { isValid: true };
  }

  // Premium Deduction Integration with Payroll
  async calculatePremiumDeduction(employeeId: string, month: number, year: number): Promise<number> {
    // Get active enrollments for the employee
    const enrollments = await this.insuranceEnrollmentRepository.getActiveEmployeeEnrollments(employeeId);

    if (enrollments.length === 0) {
      return 0;
    }

    let totalPremium = 0;

    // Calculate total premium for active enrollments
    for (const enrollment of enrollments) {
      // Check if enrollment is effective for the given month/year
      const enrollmentEffectiveFrom = new Date(enrollment.effective_from);
      const enrollmentEffectiveTo = enrollment.effective_to ? new Date(enrollment.effective_to) : null;

      const targetDate = new Date(year, month - 1, 1);

      // Check if enrollment is active for this month
      if (enrollmentEffectiveFrom <= targetDate) {
        if (!enrollmentEffectiveTo || enrollmentEffectiveTo >= targetDate) {
          const plan = await this.insurancePlanRepository.getInsurancePlanById(enrollment.insurance_plan_id);
          if (plan) {
            totalPremium += plan.premium_amount;
          }
        }
      }
    }

    return totalPremium;
  }

  async getPlanEnrollmentCount(insurancePlanId: string): Promise<number> {
    const enrollments = await this.insuranceEnrollmentRepository.getActivePlanEnrollments(insurancePlanId);
    return enrollments.length;
  }

  async getPlanEnrollments(insurancePlanId: string): Promise<InsuranceEnrollment[]> {
    return this.insuranceEnrollmentRepository.getPlanEnrollments(insurancePlanId);
  }
}
