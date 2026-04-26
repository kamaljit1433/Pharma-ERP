import { create } from 'zustand';
import hierarchyService, { HierarchyNode, OrgChartData } from '../services/hierarchyService';

interface HierarchyState {
  // Data
  orgChartData: OrgChartData | null;
  selectedNode: HierarchyNode | null;
  expandedNodes: Set<string>;
  searchTerm: string;

  // UI State
  loading: boolean;
  error: string | null;
  showDetailModal: boolean;

  // Actions
  fetchOrgChart: (rootEmployeeId?: string, departmentId?: string) => Promise<void>;
  selectNode: (node: HierarchyNode) => void;
  deselectNode: () => void;
  toggleNodeExpanded: (nodeId: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  setSearchTerm: (term: string) => void;
  setShowDetailModal: (show: boolean) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  orgChartData: null,
  selectedNode: null,
  expandedNodes: new Set<string>(),
  searchTerm: '',
  loading: false,
  error: null,
  showDetailModal: false,
};

export const useHierarchyStore = create<HierarchyState>((set, get) => ({
  ...initialState,

  // Fetch org chart data
  fetchOrgChart: async (rootEmployeeId, departmentId) => {
    set({ loading: true, error: null });
    try {
      const data = await hierarchyService.getOrgChart(rootEmployeeId, departmentId);
      set({
        orgChartData: data,
        loading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch org chart';
      set({
        error: errorMessage,
        loading: false,
      });
    }
  },

  // Select a node and show detail modal
  selectNode: (node) => {
    set({
      selectedNode: node,
      showDetailModal: true,
    });
  },

  // Deselect node and hide modal
  deselectNode: () => {
    set({
      selectedNode: null,
      showDetailModal: false,
    });
  },

  // Toggle node expanded state
  toggleNodeExpanded: (nodeId) => {
    set((state) => {
      const newExpanded = new Set(state.expandedNodes);
      if (newExpanded.has(nodeId)) {
        newExpanded.delete(nodeId);
      } else {
        newExpanded.add(nodeId);
      }
      return { expandedNodes: newExpanded };
    });
  },

  // Expand all nodes
  expandAll: () => {
    const { orgChartData } = get();
    if (!orgChartData?.root) return;

    const allNodeIds = new Set<string>();
    const traverse = (node: HierarchyNode) => {
      allNodeIds.add(node.id);
      node.children?.forEach(traverse);
    };
    traverse(orgChartData.root);

    set({ expandedNodes: allNodeIds });
  },

  // Collapse all nodes
  collapseAll: () => {
    set({ expandedNodes: new Set() });
  },

  // Set search term
  setSearchTerm: (term) => {
    set({ searchTerm: term });
  },

  // Set detail modal visibility
  setShowDetailModal: (show) => {
    set({ showDetailModal: show });
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set(initialState),
}));
