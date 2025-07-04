import { EyeOutlined } from "@ant-design/icons";
import { Card } from "antd";
import React from "react";
import { Handle, Position } from "reactflow";

type ReviewNodeProps = {
  selected: boolean;
};

export const ReviewNode: React.FC<ReviewNodeProps> = ({ selected }) => {
  return (
    <Card
      size="small"
      style={{
        border: "2px solid #52c41a",
        background: "#f6ffed",
        minWidth: 180,
        textAlign: "center",
        boxShadow: selected ? "0 0 0 2px #52c41a" : undefined,
      }}
    >
      <EyeOutlined style={{ fontSize: 24, color: "#52c41a" }} />
      <div style={{ fontWeight: 600, marginTop: 8 }}>Review </div>
      <Handle
        type="target"
        position={Position.Left}
        style={{ width: 10, height: 10, background: "#52c41a" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="approve"
        style={{ top: "30%", background: "#52c41a", width: 10, height: 10 }}
      >
        <div style={{ fontSize: 10, color: "#52c41a", marginLeft: 12 }}>
          Approve
        </div>
      </Handle>
      <Handle
        type="source"
        position={Position.Right}
        id="reject"
        style={{ top: "70%", background: "#ff4d4f", width: 10, height: 10 }}
      >
        <div style={{ fontSize: 10, color: "#ff4d4f", marginLeft: 12 }}>
          Reject
        </div>
      </Handle>
    </Card>
  );
};
