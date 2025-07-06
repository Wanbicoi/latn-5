import { WORKFLOW_STAGE_META } from "@/utils/stage-color";
import React from "react";
import { Position } from "@xyflow/react";
import { BaseNode, BaseNodeProps } from "./base-node";

const META = WORKFLOW_STAGE_META.REVIEW;

export const ReviewNode: React.FC<Omit<BaseNodeProps, "data">> = (props) => {
  return (
    <BaseNode
      {...props}
      data={{
        icon: React.cloneElement(META.icon, {
          style: {
            color: META.color,
          },
        }),
        label: META.label,
        handles: [
          {
            type: "target",
            position: Position.Left,
          },
          {
            id: "approve",
            type: "source",
            position: Position.Right,
            style: { top: "30%", backgroundColor: "#52c41a" },
            children: (
              <div style={{ fontSize: 10, color: "#52c41a", marginLeft: 12 }}>
                Approve
              </div>
            ),
          },
          {
            id: "reject",
            type: "source",
            position: Position.Right,
            style: { top: "70%", backgroundColor: "#ff4d4f" },
            children: (
              <div style={{ fontSize: 10, color: "#ff4d4f", marginLeft: 12 }}>
                Reject
              </div>
            ),
          },
        ],
      }}
    />
  );
};
