import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { ChevronDown, ChevronRight, Users, Loader2 } from 'lucide-react';
import hierarchyService, { HierarchyNode, OrgChartData } from '../../services/hierarchyService';

interface OrgChartProps {
  rootEmployeeId?: string;
  onNodeClick?: (node: HierarchyNode) => void;
  expandedNodes?: Set<string>;
  onExpandChange?: (nodeId: string, expanded: boolean) => void;
}

interface TreeNodeProps {
  node: HierarchyNode;
  isExpanded: boolean;
  onToggle: (nodeId: string) => void;
  onNodeClick?: (node: HierarchyNode) => void;
  level: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  isExpanded,
  onToggle,
  onNodeClick,
  level,
}) => {
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="ml-4">
      <div className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-muted transition-colors">
        {hasChildren && (
          <button
            onClick={() => onToggle(node.id)}
            className="p-0 hover:bg-muted-foreground/10 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-4" />}

        <div
          className="flex-1 cursor-pointer"
          onClick={() => onNodeClick?.(node)}
        >
          <div className="font-medium text-sm">{node.employeeName}</div>
          <div className="text-xs text-muted-foreground">{node.designationName}</div>
        </div>

        <Badge variant="secondary" className="text-xs">
          {node.departmentName}
        </Badge>
      </div>

      {isExpanded && hasChildren && (
        <div className="border-l border-muted ml-2">
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              isExpanded={false}
              onToggle={onToggle}
              onNodeClick={onNodeClick}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const OrgChart: React.FC<OrgChartProps> = ({
  rootEmployeeId,
  onNodeClick,
  expandedNodes: initialExpandedNodes,
  onExpandChange,
}) => {
  const [data, setData] = useState<OrgChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    initialExpandedNodes || new Set()
  );

  useEffect(() => {
    const fetchOrgChart = async () => {
      try {
        setLoading(true);
        const chartData = await hierarchyService.getOrgChart(rootEmployeeId);
        setData(chartData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load org chart');
      } finally {
        setLoading(false);
      }
    };

    fetchOrgChart();
  }, [rootEmployeeId]);

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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Organization Chart</CardTitle>
            <CardDescription>
              {data.totalEmployees} employees across {data.totalDepartments} departments
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            {data.totalEmployees}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <TreeNode
            node={data.root}
            isExpanded={expandedNodes.has(data.root.id)}
            onToggle={handleToggle}
            onNodeClick={onNodeClick}
            level={0}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default OrgChart;
