// StartNode: entry node for selected data to be annotated
import { PlayCircleOutlined } from "@ant-design/icons";
import React from "react";
import { Card } from "antd";
import { Handle, Position } from "reactflow";

type StartNodeProps = {
  id: string;
  data: {
    name?: string;
    description?: string;
    onChange?: (data: any) => void;
    workflow_id?: string;
  };
  selected: boolean;
};

export const StartNode: React.FC<StartNodeProps> = ({ data, selected }) => {
  return (
    <Card
      size="small"
      style={{
        border: "2px solid #52a2ff",
        background: "#e6f0ff",
        minWidth: 180,
        textAlign: "center",
        boxShadow: selected ? "0 0 0 2px #52a2ff" : undefined,
      }}
      bodyStyle={{ padding: 12, position: "relative" }}
    >
      <PlayCircleOutlined style={{ fontSize: 24, color: "#52a2ff" }} />
      <div style={{ fontWeight: 600, marginTop: 8 }}>Start</div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ width: 10, height: 10, background: "#bfbfbf" }}
      />
    </Card>
  );
};
