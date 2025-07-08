import { WORKFLOW_STAGE_META } from "@/utils/stage-color";
import { Handle, NodeProps, Position } from "@xyflow/react";
import { Button, Tooltip } from "antd";
import React from "react";
import { BaseNode } from "../base-node";
const META = WORKFLOW_STAGE_META.CONSENSUS_HOLDING;

export const ConsensusHoldingNode: React.FC<NodeProps> = (props) => {
  return (
    <>
      <div
        style={{
          width: 60,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Button shape="circle" size="small" disabled />
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </>
  );
};
