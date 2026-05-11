import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
  Panel,
  type Node,
  type Edge,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Building2, Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Skeleton } from '../ui/skeleton';
import hierarchyService, { HierarchyNode, OrgChartData } from '../../services/hierarchyService';
import EmployeeDetailModal from './EmployeeDetailModal';
import { useHierarchyStore } from '../../store/hierarchyStore';

// ─── Client-side department filter ───────────────────────────────────────────
// Match by ID when available (backend now sends it); fall back to name match
function filterByDept(
  node: HierarchyNode,
  deptId: string,
  deptName: string,
): HierarchyNode | null {
  const filteredChildren = (node.children ?? [])
    .map((c) => filterByDept(c, deptId, deptName))
    .filter((c): c is HierarchyNode => c !== null);

  const matches =
    (node.departmentId && node.departmentId === deptId) ||
    (node.departmentName && node.departmentName === deptName);

  if (matches || filteredChildren.length > 0) {
    return { ...node, children: filteredChildren };
  }
  return null;
}

function countNodes(node: HierarchyNode): number {
  return 1 + (node.children ?? []).reduce((s, c) => s + countNodes(c), 0);
}

// ─── Layout constants ────────────────────────────────────────────────────────
const NODE_W = 220;
const NODE_H = 110;
const X_GAP  = 28;
const Y_GAP  = 80;

// ─── Tree layout ─────────────────────────────────────────────────────────────
function subtreeWidth(node: HierarchyNode): number {
  if (!node.children?.length) return NODE_W;
  const childrenTotal = node.children.reduce(
    (sum, c) => sum + subtreeWidth(c) + X_GAP,
    -X_GAP,
  );
  return Math.max(NODE_W, childrenTotal);
}

function buildGraph(root: HierarchyNode): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  function place(node: HierarchyNode, cx: number, y: number, isRoot: boolean) {
    nodes.push({
      id: node.id,
      type: isRoot ? 'rootNode' : 'empNode',
      position: { x: cx - NODE_W / 2, y },
      data: node as unknown as Record<string, unknown>,
      draggable: true,
    });

    if (!node.children?.length) return;

    const totalW = node.children.reduce(
      (s, c) => s + subtreeWidth(c) + X_GAP,
      -X_GAP,
    );
    let childCX = cx - totalW / 2;

    for (const child of node.children) {
      const cw = subtreeWidth(child);
      const center = childCX + cw / 2;

      edges.push({
        id: `e-${node.id}-${child.id}`,
        source: node.id,
        target: child.id,
        type: 'smoothstep',
        style: { stroke: '#0d9488', strokeWidth: 2 },
      });

      place(child, center, y + NODE_H + Y_GAP, false);
      childCX += cw + X_GAP;
    }
  }

  place(root, 0, 0, true);
  return { nodes, edges };
}

// ─── Handle style ─────────────────────────────────────────────────────────────
const handleStyle = { background: '#0d9488', border: '2px solid #fff', width: 10, height: 10 };

// ─── Root node ────────────────────────────────────────────────────────────────
const RootNode = ({ data }: NodeProps) => {
  const n = data as unknown as HierarchyNode;
  return (
    <>
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
      <div
        style={{
          width: NODE_W,
          background: 'linear-gradient(135deg, #065f46 0%, #0f766e 100%)',
          borderRadius: 18,
          padding: '18px 16px',
          color: '#fff',
          boxShadow: '0 8px 32px rgba(6,95,70,.35), 0 2px 8px rgba(0,0,0,.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            background: 'rgba(255,255,255,.18)',
            borderRadius: 12,
            padding: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Building2 size={24} strokeWidth={1.5} />
        </div>
        <div style={{ fontWeight: 700, fontSize: 14, textAlign: 'center', lineHeight: 1.3 }}>
          {n.employeeName}
        </div>
        <div style={{ fontSize: 11, opacity: 0.85, textAlign: 'center' }}>
          {n.designationName || 'Parent Organization'}
        </div>
        {n.departmentName && (
          <div
            style={{
              fontSize: 10,
              background: 'rgba(255,255,255,.2)',
              borderRadius: 99,
              padding: '2px 12px',
              letterSpacing: 0.3,
            }}
          >
            {n.departmentName}
          </div>
        )}
      </div>
    </>
  );
};

// ─── Employee node ────────────────────────────────────────────────────────────
const EmpNode = ({ data }: NodeProps) => {
  const n = data as unknown as HierarchyNode;
  const hasChildren = !!(n.children?.length);

  return (
    <>
      <Handle type="target" position={Position.Top} style={handleStyle} />
      {hasChildren && (
        <Handle type="source" position={Position.Bottom} style={handleStyle} />
      )}
      <div
        style={{
          width: NODE_W,
          background: '#fff',
          border: '1.5px solid #0d9488',
          borderRadius: 14,
          padding: '12px 14px',
          boxShadow: '0 4px 16px rgba(13,148,136,.12)',
          cursor: 'pointer',
          userSelect: 'none',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'linear-gradient(90deg, #0d9488, #14b8a6)',
            borderRadius: '14px 14px 0 0',
          }}
        />

        <div
          style={{
            fontWeight: 600,
            fontSize: 13,
            color: '#111827',
            marginBottom: 7,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            paddingTop: 4,
          }}
        >
          {n.employeeName}
        </div>

        <div style={{ display: 'flex', gap: 5, marginBottom: 7, flexWrap: 'wrap' }}>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 10,
              background: '#f3f4f6',
              color: '#374151',
              padding: '1px 7px',
              borderRadius: 4,
              letterSpacing: 0.5,
            }}
          >
            {(n.employeeId || n.id).slice(0, 8).toUpperCase()}
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: '1px 9px',
              borderRadius: 99,
              background: n.isActive ? '#dcfce7' : '#fee2e2',
              color: n.isActive ? '#16a34a' : '#dc2626',
            }}
          >
            {n.isActive ? 'active' : 'inactive'}
          </span>
        </div>

        <div
          style={{
            fontSize: 11,
            color: '#6b7280',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {n.departmentName}
        </div>
        {n.designationName && (
          <div
            style={{
              fontSize: 10,
              color: '#9ca3af',
              marginTop: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {n.designationName}
          </div>
        )}
      </div>
    </>
  );
};

// ─── Node type registry (outside component to avoid re-render) ────────────────
const nodeTypes = { rootNode: RootNode, empNode: EmpNode };

// ─── Inner canvas (requires ReactFlowProvider) ────────────────────────────────
const FlowCanvas: React.FC<{
  data: OrgChartData;
  onNodeClick: (n: HierarchyNode) => void;
}> = ({ data, onNodeClick }) => {
  const { nodes: initNodes, edges: initEdges } = useMemo(
    () => buildGraph(data.root),
    [data.root],
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);
  const { fitView } = useReactFlow();

  // Sync when data changes (department filter etc.)
  useEffect(() => {
    const { nodes: nn, edges: ee } = buildGraph(data.root);
    setNodes(nn);
    setEdges(ee);
    setTimeout(() => fitView({ padding: 0.12, duration: 600 }), 80);
  }, [data, setNodes, setEdges, fitView]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onNodeClick(node.data as unknown as HierarchyNode);
    },
    [onNodeClick],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      onNodeClick={handleNodeClick}
      fitView
      fitViewOptions={{ padding: 0.12 }}
      minZoom={0.05}
      maxZoom={2.5}
      attributionPosition="bottom-right"
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={22}
        size={1}
        color="#d1d5db"
      />
      <Controls />
      <MiniMap
        nodeColor={(n) => (n.type === 'rootNode' ? '#065f46' : '#0d9488')}
        maskColor="rgba(255,255,255,0.85)"
        style={{ border: '1px solid #e5e7eb', borderRadius: 8 }}
      />
      <Panel position="top-left">
        <div
          style={{
            background: '#fff',
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: 12,
            color: '#6b7280',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 4px rgba(0,0,0,.06)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Users size={13} style={{ color: '#0d9488' }} />
          {data.totalEmployees} employees · {data.totalDepartments} departments
        </div>
      </Panel>
    </ReactFlow>
  );
};

// ─── Public component ─────────────────────────────────────────────────────────
interface OrgChartFlowProps {
  rootEmployeeId?: string;
  departmentId?: string;
  showDepartmentFilter?: boolean;
  className?: string;
}

export const OrgChartFlow: React.FC<OrgChartFlowProps> = ({
  rootEmployeeId,
  departmentId: initialDeptId,
  showDepartmentFilter = true,
  className = '',
}) => {
  const [data, setData]           = useState<OrgChartData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [selectedDeptId, setSelectedDeptId] = useState(initialDeptId);
  const [departments, setDepts]   = useState<Array<{ id: string; name: string }>>([]);

  const { selectedNode, showDetailModal, selectNode, deselectNode } = useHierarchyStore();

  // Fetch the full tree once — backend ignores departmentId so we filter client-side
  useEffect(() => {
    setLoading(true);
    hierarchyService
      .getOrgChart(rootEmployeeId)
      .then((d) => { setData(d); setError(null); })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [rootEmployeeId]);

  // Apply department filter on the already-fetched tree
  const displayData = useMemo(() => {
    if (!data) return null;
    if (!selectedDeptId) return data;
    const deptName = departments.find((d) => d.id === selectedDeptId)?.name ?? '';
    const filtered = filterByDept(data.root, selectedDeptId, deptName);
    if (!filtered) return null;
    return { root: filtered, totalEmployees: countNodes(filtered), totalDepartments: 1 };
  }, [data, selectedDeptId, departments]);

  useEffect(() => {
    if (!showDepartmentFilter) return;
    hierarchyService
      .getDepartments()
      .then((d) => setDepts(d.map((dept) => ({ id: dept.id, name: dept.name }))))
      .catch(() => {});
  }, [showDepartmentFilter]);

  const handleNodeClick = useCallback(
    (node: HierarchyNode) => selectNode(node),
    [selectNode],
  );

  // ── Loading ──
  if (loading) {
    return (
      <div className={`h-[72vh] flex items-center justify-center ${className}`}>
        <div className="flex flex-col items-center gap-6 w-full max-w-xl">
          <Skeleton className="h-20 w-52 rounded-2xl" />
          <div className="flex gap-6 justify-center">
            <Skeleton className="h-28 w-52 rounded-xl" />
            <Skeleton className="h-28 w-52 rounded-xl" />
          </div>
          <div className="flex gap-6 justify-center">
            <Skeleton className="h-28 w-52 rounded-xl" />
            <Skeleton className="h-28 w-52 rounded-xl" />
            <Skeleton className="h-28 w-52 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // ── Error / empty ──
  if (error || !data?.root) {
    return (
      <div className={`h-[72vh] flex items-center justify-center ${className}`}>
        <div className="text-center text-muted-foreground">
          <Building2 className="w-14 h-14 mx-auto mb-3 opacity-25" />
          <p className="text-sm">{error || 'No organizational data available'}</p>
        </div>
      </div>
    );
  }

  // Department filter controls (rendered above the canvas in all states)
  const filterBar = showDepartmentFilter && departments.length > 0 && (
    <div className="flex items-center gap-3">
      <Select
        value={selectedDeptId || 'all'}
        onValueChange={(v: string) => setSelectedDeptId(v === 'all' ? undefined : v)}
      >
        <SelectTrigger className="w-56">
          <SelectValue placeholder="All Departments" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          {departments.map((d) => (
            <SelectItem key={d.id} value={d.id}>
              {d.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-xs text-muted-foreground">
        Click any node to see details
      </span>
    </div>
  );

  // No employees in selected department
  if (!displayData) {
    return (
      <div className={`flex flex-col gap-3 ${className}`}>
        {filterBar}
        <div
          className="h-[72vh] flex items-center justify-center"
          style={{ border: '1px solid #e5e7eb', borderRadius: 14, background: '#fafafa' }}
        >
          <div className="text-center text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-25" />
            <p className="text-sm">No employees found in this department</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`flex flex-col gap-3 ${className}`}>
        {filterBar}

        <div
          style={{
            height: '72vh',
            borderRadius: 14,
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 24px rgba(0,0,0,.06)',
            background: '#fafafa',
          }}
        >
          <ReactFlowProvider>
            <FlowCanvas data={displayData} onNodeClick={handleNodeClick} />
          </ReactFlowProvider>
        </div>
      </div>

      <EmployeeDetailModal
        node={selectedNode}
        isOpen={showDetailModal}
        onClose={deselectNode}
      />
    </>
  );
};

export default OrgChartFlow;
