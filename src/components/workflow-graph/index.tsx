import React, { useCallback, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
  addEdge,
  MiniMap,
  Connection,
  NodeChange,
  EdgeChange,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { Button, Dropdown, Menu } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";
import { nodeTypes, NODE_TYPE_META } from "./nodes";

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

export const WorkflowGraph: React.FC<WorkflowGraphProps> = ({
  editable = false,
  nodes,
  edges,
  setNodes,
  setEdges,
  onEdgesChange,
  onNodesChange,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleAddNode = (type: keyof typeof nodeTypes) => {
    var data = {};
    if (type == "ROUTER") data = { route1: 30, route2: 70 };
    const newNode: Node = {
      id: uuidv4(),
      data,
      position: { x: 100, y: 100 + nodes.length * 80 },
      type,
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleNodeDataChange = useCallback(
    (nodeId: string, newData: any) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...newData } }
            : node
        )
      );
    },
    [setNodes]
  );

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const handleRemoveNode = () => {
    if (!selectedNodeId) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));
    setEdges((eds) =>
      eds.filter(
        (e) => e.source !== selectedNodeId && e.target !== selectedNodeId
      )
    );
    setSelectedNodeId(null);
  };

  const handleEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedEdgeId(edge.id);
  }, []);

  const handleRemoveEdge = () => {
    if (!selectedEdgeId) return;
    setEdges((eds) => eds.filter((e) => e.id !== selectedEdgeId));
    setSelectedEdgeId(null);
  };

  if (nodes.length === 0 && !editable)
    return <>No stages found for this workflow.</>;

  const nodesWithWorkflowId = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      onChange: (newData: any) => handleNodeDataChange(node.id, newData),
    },
  }));

  return (
    <div style={{ width: "100%", height: 600, position: "relative" }}>
      {editable && (
        <div
          style={{
            position: "absolute",
            zIndex: 10,
            left: 8,
            top: 8,
            display: "flex",
            gap: 8,
          }}
        >
          <Dropdown
            menu={{
              onClick: ({ key }) =>
                handleAddNode(key as keyof typeof nodeTypes),
              items: Object.keys(nodeTypes).map((key) => ({
                key,
                label:
                  NODE_TYPE_META[key as keyof typeof nodeTypes]?.label || key,
                icon:
                  NODE_TYPE_META[key as keyof typeof nodeTypes]?.icon ||
                  undefined,
              })),
            }}
            trigger={["click"]}
          >
            <Button icon={<PlusOutlined />}>Add Stage</Button>
          </Dropdown>
          <Button
            icon={<DeleteOutlined />}
            danger
            disabled={!selectedNodeId}
            onClick={handleRemoveNode}
          >
            Remove Node
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            disabled={!selectedEdgeId}
            onClick={handleRemoveEdge}
          >
            Remove Edge
          </Button>
        </div>
      )}
      <ReactFlow
        nodes={nodesWithWorkflowId}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
        onConnect={onConnect}
        onNodeClick={editable ? handleNodeClick : undefined}
        onEdgeClick={editable ? handleEdgeClick : undefined}
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
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default WorkflowGraph;
