import { WORKFLOW_STAGE_META } from "@/utils/stage-color";
import { BaseNode, BaseNodeProps } from "./base-node";
import { Position } from "@xyflow/react";
import React from "react";

const META = WORKFLOW_STAGE_META.ANNOTATE;

export const AnnotateNode: React.FC<Omit<BaseNodeProps, "data">> = (props) => {
  return (
    <BaseNode
      {...props}
      data={{
        icon: React.cloneElement(META.icon, {
          style: { color: META.color },
        }),
        label: META.label,
        handles: [
          {
            type: "target",
            position: Position.Left,
          },
          {
            type: "source",
            position: Position.Right,
          },
        ],
      }}
    />
  );
};
