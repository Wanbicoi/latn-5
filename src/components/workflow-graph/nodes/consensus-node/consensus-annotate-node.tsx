import { WORKFLOW_STAGE_META } from "@/utils/stage-color";
import { NodeProps, Position } from "@xyflow/react";
import { Tooltip } from "antd";
import React from "react";
import { BaseNode } from "../base-node";

const META = WORKFLOW_STAGE_META.ANNOTATE;

export const ConsensusAnnotateNode: React.FC<NodeProps> = ({
  selected,
  ...props
}) => {
  return (
    <BaseNode
      {...props}
      selected={selected}
      data={{
        // label: "Consensus Annotate",
        icon: (
          <Tooltip title="Consensus Annotate Node">
            {React.cloneElement(META.icon, {
              style: { color: META.color },
            })}
          </Tooltip>
        ),
        handles: [
          {
            type: "target",
            position: Position.Top,
          },
          {
            type: "source",
            position: Position.Bottom,
          },
        ],
      }}
    />
  );
};
