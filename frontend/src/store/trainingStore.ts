import { create } from 'zustand';
import trainingService, {
  TrainingProgram,
  TrainingEnrollment,
  Certification,
  Skill,
  EmployeeSkill,
} from '../services/trainingService';

interface TrainingState {
  // Data
  programs: TrainingProgram[];
  certifications: Certification[];
  enrollments: TrainingEnrollment[];
  skills: Skill[];
  employeeSkills: EmployeeSkill[];

  // UI State
  loading: boolean;
  error: string | null;

  // Actions
  fetchPrograms: (status?: string) => Promise<void>;
  createProgram: (data: any) => Promise<void>;
  updateProgram: (id: string, data: any) => Promise<void>;
  deleteProgram: (id: string) => Promise<void>;
  enrollEmployee: (employeeId: string, programId: string) => Promise<void>;
  fetchEnrollments: (employeeId: string) => Promise<void>;
  markComplete: (enrollmentId: string) => Promise<void>;
  fetchCertifications: (employeeId: string) => Promise<void>;
  addCertification: (data: any) => Promise<void>;
  updateCertification: (id: string, data: any) => Promise<void>;
  fetchSkills: () => Promise<void>;
  addEmployeeSkill: (data: any) => Promise<void>;
  fetchEmployeeSkills: (employeeId: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  programs: [],
  certifications: [],
  enrollments: [],
  skills: [],
  employeeSkills: [],
  loading: false,
  error: null,
};

export const useTrainingStore = create<TrainingState>((set, get) => ({
  ...initialState,

  fetchPrograms: async (status) => {
    set({ loading: true, error: null });
    try {
      const programs = await trainingService.getAllTrainingPrograms(status);
      set({ programs, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  createProgram: async (data) => {
    set({ loading: true, error: null });
    try {
      const program = await trainingService.createTrainingProgram(data);
      set((state) => ({ programs: [program, ...state.programs], loading: false }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateProgram: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const program = await trainingService.updateTrainingProgram(id, data);
      set((state) => ({
        programs: state.programs.map((p) => (p.id === id ? program : p)),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  deleteProgram: async (id) => {
    set({ loading: true, error: null });
    try {
      await trainingService.deleteTrainingProgram(id);
      set((state) => ({
        programs: state.programs.filter((p) => p.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  enrollEmployee: async (employeeId, programId) => {
    set({ loading: true, error: null });
    try {
      const enrollment = await trainingService.enrollEmployee(employeeId, programId, new Date());
      set((state) => ({ enrollments: [enrollment, ...state.enrollments], loading: false }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  fetchEnrollments: async (employeeId) => {
    set({ loading: true, error: null });
    try {
      const enrollments = await trainingService.getEmployeeEnrollments(employeeId);
      set({ enrollments, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  markComplete: async (enrollmentId) => {
    set({ loading: true, error: null });
    try {
      const enrollment = await trainingService.markEnrollmentComplete(enrollmentId);
      set((state) => ({
        enrollments: state.enrollments.map((e) => (e.id === enrollmentId ? enrollment : e)),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  fetchCertifications: async (employeeId) => {
    set({ loading: true, error: null });
    try {
      const certifications = await trainingService.getEmployeeCertifications(employeeId);
      set({ certifications, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addCertification: async (data) => {
    set({ loading: true, error: null });
    try {
      const certification = await trainingService.addCertification(data);
      set((state) => ({ certifications: [certification, ...state.certifications], loading: false }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateCertification: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const certification = await trainingService.updateCertification(id, data);
      set((state) => ({
        certifications: state.certifications.map((c) => (c.id === id ? certification : c)),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  fetchSkills: async () => {
    set({ loading: true, error: null });
    try {
      const skills = await trainingService.getAllSkills();
      set({ skills, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addEmployeeSkill: async (data) => {
    set({ loading: true, error: null });
    try {
      const skill = await trainingService.addEmployeeSkill(data);
      set((state) => ({ employeeSkills: [skill, ...state.employeeSkills], loading: false }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  fetchEmployeeSkills: async (employeeId) => {
    set({ loading: true, error: null });
    try {
      const employeeSkills = await trainingService.getEmployeeSkills(employeeId);
      set({ employeeSkills, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set(initialState),
}));
