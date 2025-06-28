// ArchivedNode: terminal node for archived/completed workflows
import React from "react";
import { Handle, Position } from "reactflow";
import { InboxOutlined } from "@ant-design/icons";
import { Card } from "antd";

type ArchivedNodeProps = {
  id: string;
  data: {
    name?: string;
    description?: string;
  };
  selected: boolean;
};

export const ArchivedNode: React.FC<ArchivedNodeProps> = ({
  data,
  selected,
}) => (
  <Card
    size="small"
    style={{
      border: "2px solid #bfbfbf",
      background: "#fafafa",
      minWidth: 160,
      textAlign: "center",
      boxShadow: selected ? "0 0 0 2px #bfbfbf" : undefined,
    }}
    bodyStyle={{ padding: 12, position: "relative" }}
  >
    <InboxOutlined style={{ fontSize: 28, color: "#bfbfbf" }} />
    <div style={{ fontWeight: 600, marginTop: 8 }}>
      {data.name || "Archived"}
    </div>
    <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
      {data.description}
    </div>
    <Handle type="target" position={Position.Top} />
  </Card>
);
