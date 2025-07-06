import { BaseNode } from "@/components/workflow-graph/nodes/base-node";
import { WORKFLOW_STAGE_META } from "@/utils/stage-color";
import { Form, InputNumber } from "antd";
import React from "react";
import { NodeProps, Position, useReactFlow, Node } from "@xyflow/react";

const META = WORKFLOW_STAGE_META.ROUTER;
type RouterNode = Node<{ route1: number; route2: number }>;

export const RouterNode: React.FC<NodeProps<RouterNode>> = ({
  id,
  selected,
  data,
}) => {
  const { updateNodeData } = useReactFlow();

  return (
    <BaseNode
      selected={selected}
      data={{
        label: `Router`,
        icon: React.cloneElement(META.icon, {
          style: { color: META.color },
        }),
        handles: [
          { type: "target" as const, position: Position.Left, id: "input" },
          {
            type: "source" as const,
            position: Position.Right,
            id: "route1",
            style: { top: "30%" },
            children: (
              <div style={{ fontSize: 10, marginLeft: 12, width: 50 }}>
                Route 1
              </div>
            ),
          },
          {
            type: "source" as const,
            position: Position.Right,
            id: "route2",
            style: { top: "70%" },
            children: (
              <div style={{ fontSize: 10, marginLeft: 12, width: 50 }}>
                Route 2
              </div>
            ),
          },
        ],
      }}
    >
      <Form.Item label="Route 1" style={{ marginBottom: 4 }}>
        <InputNumber
          size="small"
          min={0}
          max={100}
          step={5}
          suffix="%"
          value={data.route1}
          onChange={(value) => updateNodeData(id, { route1: value })}
        />
      </Form.Item>
      <Form.Item label="Route 2" style={{ marginBottom: 0 }}>
        <InputNumber
          size="small"
          readOnly
          suffix="%"
          value={100 - data.route1}
        />
      </Form.Item>
    </BaseNode>
  );
};
