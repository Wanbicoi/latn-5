import { AnnotateNode } from "./annotate-node";
import { ReviewNode } from "./review-node";
import { ConsensusNode } from "./consensus-node";
import { MitlNode } from "./mitl-node";
import { RouterNode } from "./router-node";
import { SuccessNode } from "./success-node";
import { ArchivedNode } from "./archived-node";
import { StartNode } from "./start-node";
import { WORKFLOW_STAGE_META, WorkflowStage } from "@/utils/stage-color";

export const nodeTypes = {
  START: StartNode,
  ANNOTATE: AnnotateNode,
  REVIEW: ReviewNode,
  CONSENSUS: ConsensusNode,
  MITL: MitlNode,
  ROUTER: RouterNode,
  SUCCESS: SuccessNode,
  ARCHIVED: ArchivedNode,
};

export const NODE_TYPE_META: Record<
  WorkflowStage,
  { label: string; icon: React.ReactNode }
> = Object.entries(WORKFLOW_STAGE_META).reduce(
  (acc, [key, { label, iconWithColor }]) => {
    acc[key as WorkflowStage] = { label, icon: iconWithColor };
    return acc;
  },
  {} as Record<WorkflowStage, { label: string; icon: React.ReactNode }>
);
