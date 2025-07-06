// StartNode: entry node for selected data to be annotated
import React from "react";
import { NodeProps, Position } from "@xyflow/react";
import { WORKFLOW_STAGE_META } from "@/utils/stage-color";
import { BaseNode } from "./base-node";

const META = WORKFLOW_STAGE_META.START;

export const StartNode: React.FC<NodeProps> = ({ data, selected }) => {
  return (
    <BaseNode
      selected={selected}
      data={{
        ...data,
        label: META.label,
        icon: React.cloneElement(META.icon, {
          style: { color: META.color },
        }),
        handles: [
          {
            type: "source",
            position: Position.Right,
          },
        ],
      }}
    />
  );
};
