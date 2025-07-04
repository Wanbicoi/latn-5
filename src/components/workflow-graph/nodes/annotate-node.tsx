import { EditOutlined } from "@ant-design/icons";
import { Card } from "antd";
import React from "react";
import { Handle, Position } from "reactflow";

type AnnotateNodeProps = {
  selected: boolean;
};

export const AnnotateNode: React.FC<AnnotateNodeProps> = ({ selected }) => {
  return (
    <Card
      size="small"
      style={{
        border: "2px solid #1890ff",
        background: "#e6f7ff",
        minWidth: 180,
        textAlign: "center",
        boxShadow: selected ? "0 0 0 2px #1890ff" : undefined,
      }}
    >
      <EditOutlined style={{ fontSize: 24, color: "#1890ff" }} />
      <div style={{ fontWeight: 600, marginTop: 8 }}>Annotate</div>
      <Handle
        type="target"
        position={Position.Left}
        style={{ width: 10, height: 10, background: "#1890ff" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ width: 10, height: 10, background: "#1890ff" }}
      />
    </Card>
  );
};
