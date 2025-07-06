import React from "react";
import { Position } from "@xyflow/react";
import { WORKFLOW_STAGE_META } from "@/utils/stage-color";
import { BaseNode } from "./base-node";

type ArchivedNodeProps = {
  selected: boolean;
};

const META = WORKFLOW_STAGE_META.ARCHIVED;

export const ArchivedNode: React.FC<ArchivedNodeProps> = ({ selected }) => (
  <BaseNode
    data={{
      label: "Archived",
      icon: React.cloneElement(META.icon, {
        style: { color: META.color },
      }),
      handles: [
        {
          type: "target",
          position: Position.Left,
        },
      ],
    }}
    selected={selected}
  />
);
