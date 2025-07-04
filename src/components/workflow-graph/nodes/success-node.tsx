import React from "react";
import { Handle, Position } from "reactflow";
import { Card } from "antd";
import { WORKFLOW_STAGE_META } from "@/utils/stage-color";

type SuccessNodeProps = {
  selected: boolean;
};

const META = WORKFLOW_STAGE_META.SUCCESS;
const BACKGROUND_COLOR = "#f6ffed";

export const SuccessNode: React.FC<SuccessNodeProps> = ({ selected }) => (
  <Card
    size="small"
    style={{
      border: `2px solid ${META.color}`,
      background: BACKGROUND_COLOR,
      minWidth: 160,
      textAlign: "center",
      boxShadow: selected ? `0 0 0 2px ${META.color}` : undefined,
    }}
  >
    {React.cloneElement(META.icon, {
      style: { fontSize: 28, color: META.color },
    })}
    <div style={{ fontWeight: 600, marginTop: 8 }}>{META.label}</div>
    <Handle
      type="target"
      position={Position.Left}
      style={{ width: 10, height: 10, background: META.color }}
    />
  </Card>
);
