// src/utils/stage-color.ts

import { Tag } from "antd";

export type WorkflowStage =
  | "ANNOTATE"
  | "REVIEW"
  | "CONSENSUS"
  | "MITL"
  | "DATASOURCE"
  | "ROUTER"
  | "START"
  | "ARCHIVED"
  | "SUCCESS";

const STAGE_META: Record<WorkflowStage, { color: string; label: string }> = {
  ANNOTATE: { color: "#faad14", label: "Annotate" },
  REVIEW: { color: "#1890ff", label: "Review" },
  CONSENSUS: { color: "#722ed1", label: "Consensus" },
  MITL: { color: "#eb2f96", label: "MITL" },
  DATASOURCE: { color: "#13c2c2", label: "Datasource" },
  ROUTER: { color: "#bfbfbf", label: "Router" },
  START: { color: "#2f54eb", label: "Start" },
  ARCHIVED: { color: "#595959", label: "Archived" },
  SUCCESS: { color: "#52c41a", label: "Success" },
};

export function getStageMeta(stage: WorkflowStage) {
  return STAGE_META[stage];
}

export function getStageTag(stage: string) {
  const normalized = stage.toUpperCase() as WorkflowStage;
  const meta = getStageMeta(normalized);
  if (!meta) return null;
  return <Tag color={meta.color}>{meta.label}</Tag>;
}
