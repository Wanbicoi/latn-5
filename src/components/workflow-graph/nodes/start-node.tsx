// StartNode: entry node for selected data to be annotated
import React from "react";
import { Card } from "antd";
import { Handle, Position } from "reactflow";
import { WORKFLOW_STAGE_META } from "@/utils/stage-color";

type StartNodeProps = {
  selected: boolean;
};

const META = WORKFLOW_STAGE_META.START;
const BACKGROUND_COLOR = "#f0f5ff";

export const StartNode: React.FC<StartNodeProps> = ({ selected }) => {
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
        type="source"
        position={Position.Right}
        style={{ width: 10, height: 10, background: META.color }}
      />
    </Card>
  );
};
