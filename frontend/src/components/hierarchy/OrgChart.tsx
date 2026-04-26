import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ChevronDown, ChevronRight, Users, Search, X, Download, Image as ImageIcon } from 'lucide-react';
import hierarchyService, { HierarchyNode, OrgChartData } from '../../services/hierarchyService';
import { useHierarchyStore } from '../../store/hierarchyStore';
import EmployeeDetailModal from './EmployeeDetailModal';
import { cn } from '../../lib/utils';
import { useToast } from '../../hooks/useToast';

interface OrgChartProps {
  rootEmployeeId?: string;
  departmentId?: string;
  onNodeClick?: (node: HierarchyNode) => void;
  expandedNodes?: Set<string>;
  onExpandChange?: (nodeId: string, expanded: boolean) => void;
  showDepartmentFilter?: boolean;
  className?: string;
}

interface TreeNodeProps {
  node: HierarchyNode;
  isExpanded: boolean;
  onToggle: (nodeId: string) => void;
  onNodeClick?: (node: HierarchyNode) => void;
  level: number;
  searchTerm?: string;
  isHighlighted?: boolean;
  showTeamSize?: boolean;
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  isExpanded,
  onToggle,
  onNodeClick,
  level,
  searchTerm,
  isHighlighted,
  showTeamSize = true,
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const childCount = node.children?.length || 0;
  const matchesSearch = !searchTerm || 
    node.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.designationName.toLowerCase().includes(searchTerm.toLowerCase());

  // If searching and this node doesn't match and isn't highlighted (ancestor of match), hide it
  if (searchTerm && !matchesSearch && !isHighlighted) {
    return null;
  }

  return (
    <div className="ml-2 sm:ml-4">
      <div className={cn(
        "flex items-center gap-2 sm:gap-3 py-2 sm:py-3 px-2 sm:px-3 rounded-lg transition-all",
        "hover:bg-muted/50 border border-transparent hover:border-muted-foreground/20",
        "cursor-pointer",
        isHighlighted && "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
      )}>
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
            }}
            className="p-1 hover:bg-muted-foreground/10 rounded transition-colors flex-shrink-0"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
            ) : (
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-4 sm:w-6 flex-shrink-0" />}

        <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
          <AvatarImage src={node.profilePhotoUrl} alt={node.employeeName} />
          <AvatarFallback className="text-xs font-semibold">
            {getInitials(node.employeeName)}
          </AvatarFallback>
        </Avatar>

        <div
          className="flex-1 cursor-pointer min-w-0"
          onClick={() => onNodeClick?.(node)}
        >
          <div className="font-medium text-xs sm:text-sm truncate">{node.employeeName}</div>
          <div className="text-xs text-muted-foreground truncate">{node.designationName}</div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {hasChildren && showTeamSize && (
            <Badge variant="outline" className="text-xs whitespace-nowrap hidden sm:flex">
              <Users className="w-3 h-3 mr-1" />
              {childCount}
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs whitespace-nowrap hidden sm:block">
            {node.departmentName}
          </Badge>
          {/* Mobile: Show only team count for managers */}
          {hasChildren && showTeamSize && (
            <Badge variant="outline" className="text-xs whitespace-nowrap sm:hidden">
              {childCount}
            </Badge>
          )}
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="border-l-2 border-muted ml-4 sm:ml-6 mt-1">
          {node.children!.map((child) => {
            // Check if child or any of its descendants match the search
            const childMatches = !searchTerm || matchesSearch || isHighlighted;
            return (
              <TreeNode
                key={child.id}
                node={child}
                isExpanded={false}
                onToggle={onToggle}
                onNodeClick={onNodeClick}
                level={level + 1}
                searchTerm={searchTerm}
                isHighlighted={isHighlighted}
                showTeamSize={showTeamSize}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export const OrgChart: React.FC<OrgChartProps> = ({
  rootEmployeeId,
  departmentId: initialDepartmentId,
  onNodeClick,
  expandedNodes: initialExpandedNodes,
  onExpandChange,
  showDepartmentFilter = true,
  className,
}) => {
  const [data, setData] = useState<OrgChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    initialExpandedNodes || new Set()
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | undefined>(initialDepartmentId);
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [isExporting, setIsExporting] = useState(false);
  const orgChartRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Use hierarchy store for modal management
  const { selectedNode, showDetailModal, selectNode, deselectNode } = useHierarchyStore();

  useEffect(() => {
    const fetchOrgChart = async () => {
      try {
        setLoading(true);
        const chartData = await hierarchyService.getOrgChart(rootEmployeeId, selectedDepartmentId);
        setData(chartData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load org chart');
      } finally {
        setLoading(false);
      }
    };

    fetchOrgChart();
  }, [rootEmployeeId, selectedDepartmentId]);

  // Fetch departments for filter dropdown
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!showDepartmentFilter) return;
      
      try {
        const depts = await hierarchyService.getDepartments();
        setDepartments(depts);
      } catch (err) {
        console.error('Failed to fetch departments:', err);
      }
    };

    fetchDepartments();
  }, [showDepartmentFilter]);

  const handleToggle = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
    onExpandChange?.(nodeId, newExpanded.has(nodeId));
  };

  const handleNodeClick = (node: HierarchyNode) => {
    selectNode(node);
    onNodeClick?.(node);
  };

  const findNodeById = (node: HierarchyNode, id: string): HierarchyNode | null => {
    if (node.id === id) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findNodeById(child, id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleExpandAll = () => {
    if (!data?.root) return;
    const allNodeIds = new Set<string>();
    const traverse = (node: HierarchyNode) => {
      allNodeIds.add(node.id);
      node.children?.forEach(traverse);
    };
    traverse(data.root);
    setExpandedNodes(allNodeIds);
  };

  const handleCollapseAll = () => {
    setExpandedNodes(new Set());
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleDepartmentChange = (value: string) => {
    const deptId = value === 'all' ? undefined : value;
    setSelectedDepartmentId(deptId);
  };

  const handleExportAsImage = async () => {
    if (!orgChartRef.current) {
      toast({
        type: 'error',
        message: 'Unable to export: Chart not found',
      });
      return;
    }

    setIsExporting(true);
    
    try {
      // Dynamic import to avoid bundling html2canvas if not used
      const html2canvas = await import('html2canvas');
      
      // Temporarily expand all nodes for complete export
      const originalExpanded = new Set(expandedNodes);
      if (!data?.root) return;
      
      const allNodeIds = new Set<string>();
      const traverse = (node: HierarchyNode) => {
        allNodeIds.add(node.id);
        node.children?.forEach(traverse);
      };
      traverse(data.root);
      setExpandedNodes(allNodeIds);

      // Wait for DOM to update
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas.default(orgChartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
      });

      // Restore original expanded state
      setExpandedNodes(originalExpanded);

      // Create download link
      const link = document.createElement('a');
      link.download = `org-chart-${selectedDepartmentId ? `department-${selectedDepartmentId}` : 'full'}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast({
        type: 'success',
        message: 'Organization chart exported successfully',
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        type: 'error',
        message: 'Failed to export chart. Please try again.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const searchMatches = useMemo(() => {
    if (!searchTerm || !data?.root) return new Set<string>();
    const matches = new Set<string>();
    const traverse = (node: HierarchyNode) => {
      if (
        node.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.designationName.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        matches.add(node.id);
        // Add all ancestors to matches so they're visible
        let current = node;
        while (current.managerId) {
          const parent = findNodeById(data.root, current.managerId);
          if (parent) {
            matches.add(parent.id);
            current = parent;
          } else {
            break;
          }
        }
      }
      node.children?.forEach(traverse);
    };
    traverse(data.root);
    return matches;
  }, [searchTerm, data]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Organization Chart</CardTitle>
          <CardDescription>Loading organizational structure...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full ml-4" />
          <Skeleton className="h-12 w-full ml-8" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle>Organization Chart</CardTitle>
          <CardDescription className="text-destructive">{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!data?.root) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Organization Chart</CardTitle>
          <CardDescription>No organizational data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg sm:text-xl">Organization Chart</CardTitle>
                <CardDescription className="text-sm">
                  {data?.totalEmployees} employees across {data?.totalDepartments} departments
                  {selectedDepartmentId && (
                    <span className="ml-2 text-blue-600 dark:text-blue-400">
                      (Filtered by department)
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                {data?.totalEmployees}
              </div>
            </div>

            {/* Department Filter */}
            {showDepartmentFilter && departments && departments.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 max-w-xs">
                  <Select
                    value={selectedDepartmentId || 'all'}
                    onValueChange={handleDepartmentChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filter by department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10"
                  aria-label="Search org chart"
                />
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExpandAll}
                  aria-label="Expand all nodes"
                  className="text-xs sm:text-sm"
                >
                  Expand All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCollapseAll}
                  aria-label="Collapse all nodes"
                  className="text-xs sm:text-sm"
                >
                  Collapse All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportAsImage}
                  disabled={isExporting || !data?.root}
                  aria-label="Export as image"
                  className="text-xs sm:text-sm gap-1 sm:gap-2"
                >
                  {isExporting ? (
                    <>
                      <Download className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
                      <span className="hidden sm:inline">Exporting...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Export</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto" ref={orgChartRef}>
            <TreeNode
              node={data.root}
              isExpanded={expandedNodes.has(data.root.id) || searchTerm.length > 0}
              onToggle={handleToggle}
              onNodeClick={handleNodeClick}
              level={0}
              searchTerm={searchTerm}
              isHighlighted={searchMatches.has(data.root.id)}
              showTeamSize={true}
            />
          </div>
        </CardContent>
      </Card>

      {/* Employee Detail Modal */}
      <EmployeeDetailModal
        node={selectedNode}
        isOpen={showDetailModal}
        onClose={deselectNode}
      />
    </>
  );
};

export default OrgChart;
