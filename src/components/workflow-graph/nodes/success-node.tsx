// SuccessNode: terminal node for workflow completion
import React from "react";
import { Handle, Position } from "reactflow";
import { CheckCircleTwoTone } from "@ant-design/icons";
import { Card } from "antd";

type SuccessNodeProps = {
  id: string;
  data: {
    name?: string;
    description?: string;
  };
  selected: boolean;
};

export const SuccessNode: React.FC<SuccessNodeProps> = ({ data, selected }) => (
  <Card
    size="small"
    style={{
      border: "2px solid #52c41a",
      background: "#f6ffed",
      minWidth: 160,
      textAlign: "center",
      boxShadow: selected ? "0 0 0 2px #52c41a" : undefined,
    }}
    bodyStyle={{ padding: 12, position: "relative" }}
  >
    <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 28 }} />
    <div style={{ fontWeight: 600, marginTop: 8 }}>
      {data.name || "Success"}
    </div>
    <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
      {data.description}
    </div>
    <Handle type="target" position={Position.Top} />
  </Card>
);
