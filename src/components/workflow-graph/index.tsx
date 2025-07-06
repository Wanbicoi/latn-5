import {
  addEdge,
  Background,
  Connection,
  Controls,
  Edge,
  EdgeChange,
  MarkerType,
  Node,
  NodeChange,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import React, { useCallback } from "react";
import { nodeTypes } from "./nodes";
import UtilsPanel from "./utils-panel";

type WorkflowGraphProps = {
  editable?: boolean;
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  workflowId?: string;
};

const WorkflowGraph: React.FC<WorkflowGraphProps> = ({
  editable = false,
  nodes,
  edges,
  setEdges,
  onEdgesChange,
  onNodesChange,
}) => {
  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    []
  );

  if (nodes.length === 0 && !editable)
    return <>No stages found for this workflow.</>;

  return (
    <div style={{ width: "100%", height: 600 }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onEdgesChange={onEdgesChange}
          onNodesChange={onNodesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          defaultEdgeOptions={{
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
            style: {
              strokeWidth: 2,
            },
          }}
        >
          {editable && <UtilsPanel />}
          <Background />
          <Controls />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default WorkflowGraph;
