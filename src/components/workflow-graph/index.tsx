import {
  addEdge,
  Background,
  Connection,
  Controls,
  Edge,
  EdgeChange,
  getConnectedEdges,
  getIncomers,
  getOutgoers,
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
  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      setEdges(
        deleted.reduce((acc, node) => {
          const incomers = getIncomers(node, nodes, edges);
          const outgoers = getOutgoers(node, nodes, edges);
          const connectedEdges = getConnectedEdges([node], edges);

          const remainingEdges = acc.filter(
            (edge: Edge) => !connectedEdges.includes(edge)
          );

          const createdEdges = incomers.flatMap(({ id: source }) =>
            outgoers.map(({ id: target }) => ({
              id: `${source}->${target}`,
              source,
              target,
            }))
          );

          return [...remainingEdges, ...createdEdges];
        }, edges)
      );
    },
    [nodes, edges]
  );

  React.useEffect(() => {
    // Group nodes by parentId
    const parentGroups: Record<string, Node[]> = {};
    nodes.forEach((node) => {
      if (node.parentId) {
        if (!parentGroups[node.parentId]) parentGroups[node.parentId] = [];
        parentGroups[node.parentId].push(node);
      }
    });

    let newEdges: Edge[] = edges.filter((e) => {
      // Remove all edges between CONSENSUS_ANNOTATE and CONSENSUS_REVIEW nodes
      const sourceNode = nodes.find((n) => n.id === e.source);
      const targetNode = nodes.find((n) => n.id === e.target);
      if (!sourceNode || !targetNode) return true;
      if (
        sourceNode.type === "CONSENSUS_ANNOTATE" &&
        targetNode.type === "CONSENSUS_REVIEW" &&
        sourceNode.parentId === targetNode.parentId
      ) {
        return false;
      }
      return true;
    });

    Object.values(parentGroups).forEach((group) => {
      const review = group.find((n) => n.type === "CONSENSUS_REVIEW");
      if (!review) return;
      group
        .filter((n) => n.type === "CONSENSUS_ANNOTATE")
        .forEach((annotate) => {
          newEdges.push({
            id: `${annotate.id}->${review.id}`,
            source: annotate.id,
            target: review.id,
            animated: true,
          });
        });
    });

    setEdges(newEdges);
  }, [nodes]);

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
          onNodesDelete={onNodesDelete}
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
