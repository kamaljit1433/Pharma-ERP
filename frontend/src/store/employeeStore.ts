import { create } from 'zustand';
import employeeService, {
  Employee,
  CreateEmployeeDTO,
  UpdateEmployeeDTO,
  EmployeeFilters,
} from '../services/employeeService';

interface EmployeeState {
  // Data
  items: Employee[];
  currentItem: Employee | null;

  // UI State
  loading: boolean;
  error: string | null;

  // Pagination
  page: number;
  limit: number;
  total: number;
  totalPages: number;

  // Filters
  filters: EmployeeFilters;

  // Actions
  fetchItems: (filters?: EmployeeFilters) => Promise<void>;
  fetchItem: (id: string) => Promise<void>;
  createItem: (data: CreateEmployeeDTO) => Promise<Employee>;
  updateItem: (id: string, data: UpdateEmployeeDTO) => Promise<Employee>;
  deleteItem: (id: string) => Promise<void>;
  uploadPhoto: (id: string, file: File) => Promise<string>;
  importCSV: (file: File) => Promise<{ success: number; failed: number; errors?: any[] }>;
  exportCSV: (filters?: EmployeeFilters) => Promise<Blob>;
  exportEmployees: (format: 'csv' | 'excel' | 'pdf', filters?: EmployeeFilters) => Promise<Blob>;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setFilters: (filters: EmployeeFilters) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  items: [],
  currentItem: null,
  loading: false,
  error: null,
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  filters: {},
};

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
  ...initialState,

  // Fetch all employees
  fetchItems: async (filters) => {
    set({ loading: true, error: null });
    try {
      const currentFilters = filters || get().filters;
      const response = await employeeService.getAll({
        ...currentFilters,
        page: get().page,
        limit: get().limit,
      });
      set({
        items: response.data,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
        page: response.pagination.page,
        limit: response.pagination.limit,
        loading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch employees';
      set({
        error: errorMessage,
        loading: false,
      });
    }
  },

  // Fetch single employee
  fetchItem: async (id) => {
    set({ loading: true, error: null });
    try {
      const employee = await employeeService.getById(id);
      set({
        currentItem: employee,
        loading: false,
      });
    } catch (error) {
      set({
        error: (error as Error).message,
        loading: false,
      });
    }
  },

  // Create employee with optimistic update
  createItem: async (data) => {
    set({ loading: true, error: null });
    try {
      const newEmployee = await employeeService.create(data);
      set((state) => ({
        items: [newEmployee, ...state.items],
        total: state.total + 1,
        loading: false,
      }));
      return newEmployee;
    } catch (error) {
      set({
        error: (error as Error).message,
        loading: false,
      });
      throw error;
    }
  },

  // Update employee with optimistic update
  updateItem: async (id, data) => {
    const previousItems = get().items;
    const previousCurrent = get().currentItem;

    // Optimistic update
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...data } : item
      ),
      currentItem:
        state.currentItem?.id === id
          ? { ...state.currentItem, ...data }
          : state.currentItem,
      loading: true,
      error: null,
    }));

    try {
      const updatedEmployee = await employeeService.update(id, data);
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? updatedEmployee : item
        ),
        currentItem:
          state.currentItem?.id === id ? updatedEmployee : state.currentItem,
        loading: false,
      }));
      return updatedEmployee;
    } catch (error) {
      // Revert on error
      set({
        items: previousItems,
        currentItem: previousCurrent,
        error: (error as Error).message,
        loading: false,
      });
      throw error;
    }
  },

  // Delete employee with optimistic update
  deleteItem: async (id) => {
    const previousItems = get().items;
    const previousTotal = get().total;

    // Optimistic update
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
      total: state.total - 1,
      loading: true,
      error: null,
    }));

    try {
      await employeeService.delete(id);
      set({ loading: false });
    } catch (error) {
      // Revert on error
      set({
        items: previousItems,
        total: previousTotal,
        error: (error as Error).message,
        loading: false,
      });
      throw error;
    }
  },

  // Upload photo
  uploadPhoto: async (id, file) => {
    set({ loading: true, error: null });
    try {
      const response = await employeeService.uploadPhoto(id, file);
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, profile_photo_url: response.url } : item
        ),
        currentItem:
          state.currentItem?.id === id
            ? { ...state.currentItem, profile_photo_url: response.url }
            : state.currentItem,
        loading: false,
      }));
      return response.url;
    } catch (error) {
      set({
        error: (error as Error).message,
        loading: false,
      });
      throw error;
    }
  },

  // Import CSV
  importCSV: async (file) => {
    set({ loading: true, error: null });
    try {
      const result = await employeeService.importCSV(file);
      // Refresh the list after import
      await get().fetchItems();
      return result;
    } catch (error) {
      set({
        error: (error as Error).message,
        loading: false,
      });
      throw error;
    }
  },

  // Export CSV (legacy)
  exportCSV: async (filters) => {
    set({ loading: true, error: null });
    try {
      const blob = await employeeService.exportCSV(filters || get().filters);
      set({ loading: false });
      return blob;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  // Export in any format
  exportEmployees: async (format, filters) => {
    set({ loading: true, error: null });
    try {
      const blob = await employeeService.exportEmployees(format, filters || get().filters);
      set({ loading: false });
      return blob;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  // Set page
  setPage: (page) => {
    set({ page });
    get().fetchItems();
  },

  // Set limit
  setLimit: (limit) => {
    set({ limit, page: 1 });
    get().fetchItems();
  },

  // Set filters
  setFilters: (filters) => {
    set({ filters, page: 1 });
    get().fetchItems();
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set(initialState),
}));
