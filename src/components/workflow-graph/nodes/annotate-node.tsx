import { Card } from "antd";
import React from "react";
import { Handle, Position } from "reactflow";
import { WORKFLOW_STAGE_META } from "@/utils/stage-color";

type AnnotateNodeProps = {
  selected: boolean;
};

const META = WORKFLOW_STAGE_META.ANNOTATE;
const BACKGROUND_COLOR = "#fffbe6";

export const AnnotateNode: React.FC<AnnotateNodeProps> = ({ selected }) => {
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
        style={{ width: 10, height: 10, background: META.color }}
      />
    </Card>
  );
};
