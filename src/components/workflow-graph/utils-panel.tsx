import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Space, Dropdown, Button } from "antd";
import { Edge, Panel, useOnSelectionChange, useReactFlow } from "@xyflow/react";
import { nodeTypes, NODE_TYPE_META } from "./nodes";
import { v4 as uuidv4 } from "uuid";
import { Node } from "@xyflow/react";
import { useState, useCallback } from "react";

function getDefaultNodeData(type: string) {
  switch (type) {
    case "ROUTER":
      return { route1: 30 };
    case "CONSENSUS":
      return { annotatorsCountRequired: 2 };
    default:
      return {};
  }
}
const UtilsPanel = () => {
  const { deleteElements, addNodes } = useReactFlow();
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<Edge[]>([]);

  const onChange = useCallback(
    ({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) => {
      setSelectedNodes(nodes);
      setSelectedEdges(edges);
    },
    []
  );

  useOnSelectionChange({
    onChange,
  });

  return (
    <Panel position="top-left">
      <Space>
        <Dropdown
          menu={{
            onClick: ({ key }) => {
              const newNode: Node = {
                id: uuidv4(),
                data: getDefaultNodeData(key),
                position: { x: 600, y: 0 },
                dragHandle: ".ant-card-head",
                type: key,
              };
              addNodes([newNode]);
            },
            items: Object.keys(nodeTypes)
              .filter(
                (key) =>
                  [
                    "CONSENSUS_ANNOTATE",
                    "CONSENSUS_REVIEW",
                    "CONSENSUS_HOLDING",
                  ].indexOf(key) === -1
              )
              .map((key) => ({
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
          disabled={!selectedNodes.length}
          onClick={() => deleteElements({ nodes: selectedNodes })}
        >
          Remove Node
        </Button>
        <Button
          icon={<DeleteOutlined />}
          danger
          disabled={!selectedEdges.length}
          onClick={() => deleteElements({ edges: selectedEdges })}
        >
          Remove Edge
        </Button>
      </Space>
    </Panel>
  );
};

export default UtilsPanel;
