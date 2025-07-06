import {
  ApiOutlined,
  BranchesOutlined,
  CheckCircleOutlined,
  EditOutlined,
  EyeOutlined,
  InboxOutlined,
  PlayCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Tag } from "antd";

export const WORKFLOW_STAGE_META = {
  START: {
    label: "Start",
    color: "#2f54eb",
    icon: <PlayCircleOutlined />,
  },
  ANNOTATE: {
    label: "Annotate",
    color: "#faad14",
    icon: <EditOutlined />,
  },
  REVIEW: {
    label: "Review",
    color: "#1890ff",
    icon: <EyeOutlined />,
  },
  CONSENSUS: {
    label: "Consensus",
    color: "#722ed1",
    icon: <TeamOutlined />,
  },
  MITL: {
    label: "MITL",
    color: "#eb2f96",
    icon: <ApiOutlined />,
  },
  ROUTER: {
    label: "Router",
    color: "#595959",
    icon: <BranchesOutlined />,
  },
  SUCCESS: {
    label: "Success",
    color: "#52c41a",
    icon: <CheckCircleOutlined />,
  },
  ARCHIVED: {
    color: "#bfbfbf",
    label: "Archived",
    icon: <InboxOutlined />,
  },
} as const;

export type WorkflowStage = keyof typeof WORKFLOW_STAGE_META;

export function getStageMeta(stage: WorkflowStage) {
  return WORKFLOW_STAGE_META[stage];
}

export function getStageTag(stage: string) {
  const meta = getStageMeta(stage.toUpperCase() as WorkflowStage);
  if (!meta) return null;
  return (
    <Tag color={meta.color} icon={meta.icon}>
      {meta.label}
    </Tag>
  );
}
