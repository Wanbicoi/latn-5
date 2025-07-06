import { WORKFLOW_STAGE_META } from "@/utils/stage-color";
import { NodeProps, Position } from "@xyflow/react";
import { Tooltip } from "antd";
import React from "react";
import { BaseNode } from "../base-node";
const META = WORKFLOW_STAGE_META.REVIEW;

export const ConsensusReviewNode: React.FC<NodeProps> = (props) => {
  return (
    <BaseNode
      {...props}
      data={{
        ...props.data,
        // label: "Consensus Review",
        icon: (
          <Tooltip title="Consensus Review Node">
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
