import { Card } from "antd";
import React from "react";
import { Handle, Position } from "reactflow";
import { WORKFLOW_STAGE_META } from "@/utils/stage-color";

type ReviewNodeProps = {
  selected: boolean;
};

const META = WORKFLOW_STAGE_META.REVIEW;
const BACKGROUND_COLOR = "#e6f7ff";

export const ReviewNode: React.FC<ReviewNodeProps> = ({ selected }) => {
  return (
    <Card
      size="small"
      style={{
        border: `2px solid ${META.color}`,
        background: BACKGROUND_COLOR,
        minWidth: 180,
        textAlign: "center",
        boxShadow: selected ? `0 0 0 2px ${META.color}` : undefined,
      }}
    >
      {React.cloneElement(META.icon, {
        style: { fontSize: 24, color: META.color },
      })}
      <div style={{ fontWeight: 600, marginTop: 8 }}>{META.label}</div>
      <Handle
        type="target"
        position={Position.Left}
        style={{ width: 10, height: 10, background: META.color }}
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
