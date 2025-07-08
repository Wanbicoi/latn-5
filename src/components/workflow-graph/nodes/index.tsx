import { AnnotateNode } from "./annotate-node";
import { ReviewNode } from "./review-node";
import { ConsensusNode } from "./consensus-node";
import { ConsensusAnnotateNode } from "./consensus-node/consensus-annotate-node";
import { ConsensusHoldingNode } from "./consensus-node/consensus-hoding-node";
import { ConsensusReviewNode } from "./consensus-node/consensus-review-node";
import { MitlNode } from "./mitl-node";
import { RouterNode } from "./router-node";
import { SuccessNode } from "./success-node";
import { ArchivedNode } from "./archived-node";
import { StartNode } from "./start-node";
import { WORKFLOW_STAGE_META, WorkflowStage } from "@/utils/stage-color";
import React from "react";

export const nodeTypes = {
  START: StartNode,
  ANNOTATE: AnnotateNode,
  REVIEW: ReviewNode,
  CONSENSUS: ConsensusNode,
  CONSENSUS_HOLDING: ConsensusHoldingNode,
  CONSENSUS_ANNOTATE: ConsensusAnnotateNode,
  CONSENSUS_REVIEW: ConsensusReviewNode,
  MITL: MitlNode,
  ROUTER: RouterNode,
  SUCCESS: SuccessNode,
  ARCHIVED: ArchivedNode,
};

export const NODE_TYPE_META: Partial<
  Record<keyof typeof nodeTypes, { label: string; icon: React.ReactNode }>
> = {
  ...Object.entries(WORKFLOW_STAGE_META).reduce(
    (acc, [key, { label, icon, color }]) => {
      acc[key as WorkflowStage] = {
        label,
        icon: React.cloneElement(icon, { style: { color } }),
      };
      return acc;
    },
    {} as Record<WorkflowStage, { label: string; icon: React.ReactNode }>
  ),
};
