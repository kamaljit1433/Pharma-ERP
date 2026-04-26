import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHierarchyStore } from '../hierarchyStore';
import hierarchyService from '../../services/hierarchyService';

vi.mock('../../services/hierarchyService');

const mockOrgChartData = {
  root: {
    id: '1',
    employeeId: 'emp1',
    employeeName: 'John Doe',
    designationId: 'des1',
    designationName: 'CEO',
    departmentId: 'dept1',
    departmentName: 'Executive',
    profilePhotoUrl: 'https://example.com/photo1.jpg',
    isActive: true,
    children: [
      {
        id: '2',
        employeeId: 'emp2',
        employeeName: 'Jane Smith',
        designationId: 'des2',
        designationName: 'CTO',
        departmentId: 'dept2',
        departmentName: 'Engineering',
        managerId: 'emp1',
        managerName: 'John Doe',
        profilePhotoUrl: 'https://example.com/photo2.jpg',
        isActive: true,
        children: [],
      },
    ],
  },
  totalEmployees: 2,
  totalDepartments: 2,
};

describe('Hierarchy Store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useHierarchyStore());

      expect(result.current.orgChartData).toBeNull();
      expect(result.current.selectedNode).toBeNull();
      expect(result.current.expandedNodes.size).toBe(0);
      expect(result.current.searchTerm).toBe('');
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.showDetailModal).toBe(false);
    });
  });

  describe('fetchOrgChart', () => {
    it('should fetch org chart data successfully', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

      const { result } = renderHook(() => useHierarchyStore());

      await act(async () => {
        await result.current.fetchOrgChart();
      });

      expect(result.current.orgChartData).toEqual(mockOrgChartData);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should set loading state during fetch', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockImplementation(
        () => new Promise(() => {})
      );

      const { result } = renderHook(() => useHierarchyStore());

      act(() => {
        result.current.fetchOrgChart();
      });

      expect(result.current.loading).toBe(true);
    });

    it('should handle fetch errors', async () => {
      const errorMessage = 'Failed to fetch org chart';
      vi.mocked(hierarchyService.getOrgChart).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useHierarchyStore());

      await act(async () => {
        await result.current.fetchOrgChart();
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.loading).toBe(false);
      expect(result.current.orgChartData).toBeNull();
    });

    it('should pass parameters to service', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

      const { result } = renderHook(() => useHierarchyStore());

      await act(async () => {
        await result.current.fetchOrgChart('emp1', 'dept1');
      });

      expect(hierarchyService.getOrgChart).toHaveBeenCalledWith('emp1', 'dept1');
    });
  });

  describe('selectNode', () => {
    it('should select a node and show detail modal', () => {
      const { result } = renderHook(() => useHierarchyStore());

      const node = mockOrgChartData.root;

      act(() => {
        result.current.selectNode(node);
      });

      expect(result.current.selectedNode).toEqual(node);
      expect(result.current.showDetailModal).toBe(true);
    });
  });

  describe('deselectNode', () => {
    it('should deselect node and hide detail modal', () => {
      const { result } = renderHook(() => useHierarchyStore());

      const node = mockOrgChartData.root;

      act(() => {
        result.current.selectNode(node);
      });

      expect(result.current.selectedNode).toEqual(node);
      expect(result.current.showDetailModal).toBe(true);

      act(() => {
        result.current.deselectNode();
      });

      expect(result.current.selectedNode).toBeNull();
      expect(result.current.showDetailModal).toBe(false);
    });
  });

  describe('toggleNodeExpanded', () => {
    it('should add node to expanded set', () => {
      const { result } = renderHook(() => useHierarchyStore());

      act(() => {
        result.current.toggleNodeExpanded('node1');
      });

      expect(result.current.expandedNodes.has('node1')).toBe(true);
    });

    it('should remove node from expanded set if already expanded', () => {
      const { result } = renderHook(() => useHierarchyStore());

      act(() => {
        result.current.toggleNodeExpanded('node1');
      });

      expect(result.current.expandedNodes.has('node1')).toBe(true);

      act(() => {
        result.current.toggleNodeExpanded('node1');
      });

      expect(result.current.expandedNodes.has('node1')).toBe(false);
    });

    it('should handle multiple nodes', () => {
      const { result } = renderHook(() => useHierarchyStore());

      act(() => {
        result.current.toggleNodeExpanded('node1');
        result.current.toggleNodeExpanded('node2');
        result.current.toggleNodeExpanded('node3');
      });

      expect(result.current.expandedNodes.size).toBe(3);
      expect(result.current.expandedNodes.has('node1')).toBe(true);
      expect(result.current.expandedNodes.has('node2')).toBe(true);
      expect(result.current.expandedNodes.has('node3')).toBe(true);
    });
  });

  describe('expandAll', () => {
    it('should expand all nodes in org chart', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

      const { result } = renderHook(() => useHierarchyStore());

      await act(async () => {
        await result.current.fetchOrgChart();
      });

      act(() => {
        result.current.expandAll();
      });

      expect(result.current.expandedNodes.size).toBeGreaterThan(0);
      expect(result.current.expandedNodes.has('1')).toBe(true);
      expect(result.current.expandedNodes.has('2')).toBe(true);
    });

    it('should not expand if no org chart data', () => {
      const { result } = renderHook(() => useHierarchyStore());

      act(() => {
        result.current.expandAll();
      });

      expect(result.current.expandedNodes.size).toBe(0);
    });
  });

  describe('collapseAll', () => {
    it('should collapse all nodes', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

      const { result } = renderHook(() => useHierarchyStore());

      await act(async () => {
        await result.current.fetchOrgChart();
      });

      act(() => {
        result.current.expandAll();
      });

      expect(result.current.expandedNodes.size).toBeGreaterThan(0);

      act(() => {
        result.current.collapseAll();
      });

      expect(result.current.expandedNodes.size).toBe(0);
    });
  });

  describe('setSearchTerm', () => {
    it('should set search term', () => {
      const { result } = renderHook(() => useHierarchyStore());

      act(() => {
        result.current.setSearchTerm('John');
      });

      expect(result.current.searchTerm).toBe('John');
    });

    it('should clear search term', () => {
      const { result } = renderHook(() => useHierarchyStore());

      act(() => {
        result.current.setSearchTerm('John');
      });

      expect(result.current.searchTerm).toBe('John');

      act(() => {
        result.current.setSearchTerm('');
      });

      expect(result.current.searchTerm).toBe('');
    });
  });

  describe('setShowDetailModal', () => {
    it('should show detail modal', () => {
      const { result } = renderHook(() => useHierarchyStore());

      act(() => {
        result.current.setShowDetailModal(true);
      });

      expect(result.current.showDetailModal).toBe(true);
    });

    it('should hide detail modal', () => {
      const { result } = renderHook(() => useHierarchyStore());

      act(() => {
        result.current.setShowDetailModal(true);
      });

      expect(result.current.showDetailModal).toBe(true);

      act(() => {
        result.current.setShowDetailModal(false);
      });

      expect(result.current.showDetailModal).toBe(false);
    });
  });

  describe('clearError', () => {
    it('should clear error message', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => useHierarchyStore());

      await act(async () => {
        await result.current.fetchOrgChart();
      });

      expect(result.current.error).toBe('Test error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset store to initial state', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

      const { result } = renderHook(() => useHierarchyStore());

      await act(async () => {
        await result.current.fetchOrgChart();
      });

      act(() => {
        result.current.selectNode(mockOrgChartData.root);
        result.current.setSearchTerm('test');
        result.current.expandAll();
      });

      expect(result.current.orgChartData).not.toBeNull();
      expect(result.current.selectedNode).not.toBeNull();
      expect(result.current.searchTerm).toBe('test');
      expect(result.current.expandedNodes.size).toBeGreaterThan(0);

      act(() => {
        result.current.reset();
      });

      expect(result.current.orgChartData).toBeNull();
      expect(result.current.selectedNode).toBeNull();
      expect(result.current.searchTerm).toBe('');
      expect(result.current.expandedNodes.size).toBe(0);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.showDetailModal).toBe(false);
    });
  });
});
