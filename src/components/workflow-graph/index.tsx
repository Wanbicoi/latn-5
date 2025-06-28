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

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleAddNode = (type: keyof typeof nodeTypes) => {
    const newNode: Node = {
      id: uuidv4(),
      data: { label: type },
      position: { x: 100, y: 100 + nodes.length * 80 },
      type,
    };
    setNodes((nds) => [...nds, newNode]);
  };

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

  if (nodes.length === 0 && !editable)
    return <div>No stages found for this workflow.</div>;

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
            overlay={
              <Menu
                onClick={({ key }) =>
                  handleAddNode(key as keyof typeof nodeTypes)
                }
                items={Object.keys(nodeTypes).map((key) => ({
                  key,
                  label:
                    NODE_TYPE_META[key as keyof typeof nodeTypes]?.label || key,
                  icon:
                    NODE_TYPE_META[key as keyof typeof nodeTypes]?.icon ||
                    undefined,
                }))}
              />
            }
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
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
        onConnect={onConnect}
        onNodeClick={editable ? handleNodeClick : undefined}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default WorkflowGraph;
