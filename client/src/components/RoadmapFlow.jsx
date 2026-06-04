import { useCallback } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap,
  addEdge, useNodesState, useEdgesState, Handle, Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CheckCircle, Circle, Clock } from 'lucide-react';

// ── Custom Step Node ──────────────────────────────────────────────────────────
const StepNode = ({ data }) => {
  const statusIcon = {
    completed: <CheckCircle size={14} color="var(--success)" />,
    'in-progress': <Clock size={14} color="var(--indigo)" />,
    'not-started': <Circle size={14} color="var(--text-muted)" />,
  }[data.status] || <Circle size={14} color="var(--text-muted)" />;

  const statusLabel = {
    completed: 'Completed',
    'in-progress': 'In Progress',
    'not-started': 'Not Started',
  }[data.status] || 'Not Started';

  return (
    <div className={`step-node ${data.status}`} onClick={data.onClick}>
      <Handle type="target" position={Position.Top} style={{ background: 'var(--indigo)', border: 'none', width: 8, height: 8 }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ marginTop: 2, flexShrink: 0 }}>{statusIcon}</div>
        <div>
          <div className="step-node-title">{data.label}</div>
          <div className="step-node-status">{statusLabel}</div>
          {data.estimatedDays && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>~{data.estimatedDays}d</div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: 'var(--indigo)', border: 'none', width: 8, height: 8 }} />
    </div>
  );
};

// ── Phase Header Node ─────────────────────────────────────────────────────────
const PhaseNode = ({ data }) => (
  <div className="phase-header" style={{ pointerEvents: 'none' }}>
    <span style={{ fontSize: 16 }}>●</span>
    {data.label}
    <span style={{ marginLeft: 'auto', fontWeight: 400, opacity: 0.7 }}>{data.completed}/{data.total} done</span>
  </div>
);

const nodeTypes = { stepNode: StepNode, phaseNode: PhaseNode };

// ── Build nodes + edges from roadmap phases ───────────────────────────────────
const buildFlowData = (phases = [], onStepClick) => {
  const nodes = [];
  const edges = [];

  let y = 0;
  const PHASE_GAP = 60;
  const STEP_GAP_Y = 120;
  const STEP_GAP_X = 220;
  const PHASE_HEADER_HEIGHT = 50;

  phases.forEach((phase, pi) => {
    const phaseX = 100;

    // Phase header
    nodes.push({
      id: `phase-${pi}`,
      type: 'phaseNode',
      position: { x: phaseX, y },
      data: {
        label: phase.title,
        completed: phase.steps.filter((s) => s.status === 'completed').length,
        total: phase.steps.length,
      },
      draggable: false,
      style: { width: (phase.steps.length * STEP_GAP_X) || STEP_GAP_X },
    });

    y += PHASE_HEADER_HEIGHT + 30;

    // Steps in this phase
    phase.steps.forEach((step, si) => {
      const nodeId = `step-${pi}-${si}`;
      const x = phaseX + si * STEP_GAP_X;

      nodes.push({
        id: nodeId,
        type: 'stepNode',
        position: { x, y },
        data: {
          label: step.title,
          status: step.status,
          estimatedDays: step.estimatedDays,
          onClick: () => onStepClick && onStepClick(step, phase),
        },
      });

      // Chain steps within a phase
      if (si > 0) {
        edges.push({
          id: `e-${pi}-${si - 1}-${si}`,
          source: `step-${pi}-${si - 1}`,
          target: nodeId,
          animated: phase.steps[si - 1]?.status === 'in-progress',
          style: { stroke: 'rgba(99,102,241,0.4)', strokeWidth: 2 },
        });
      }

      // Connect last step of previous phase to first step of current phase
      if (si === 0 && pi > 0 && phases[pi - 1]?.steps?.length > 0) {
        const prevLast = `step-${pi - 1}-${phases[pi - 1].steps.length - 1}`;
        edges.push({
          id: `e-phase-${pi - 1}-${pi}`,
          source: prevLast,
          target: nodeId,
          animated: false,
          style: { stroke: 'rgba(99,102,241,0.2)', strokeWidth: 1, strokeDasharray: '6,4' },
        });
      }
    });

    y += STEP_GAP_Y + PHASE_GAP;
  });

  return { nodes, edges };
};

// ── Main RoadmapFlow Component ────────────────────────────────────────────────
export default function RoadmapFlow({ phases = [], onStepClick }) {
  const { nodes: initNodes, edges: initEdges } = buildFlowData(phases, onStepClick);
  const [nodes, , onNodesChange] = useNodesState(initNodes);
  const [edges, , onEdgesChange] = useEdgesState(initEdges);

  return (
    <div style={{ width: '100%', height: '520px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="rgba(99,102,241,0.05)" gap={32} size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(n) => {
            const s = n.data?.status;
            if (s === 'completed') return 'var(--success)';
            if (s === 'in-progress') return 'var(--indigo)';
            return 'rgba(255,255,255,0.1)';
          }}
          maskColor="rgba(8,9,29,0.8)"
        />
      </ReactFlow>
    </div>
  );
}
