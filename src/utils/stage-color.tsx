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
    iconWithColor: <PlayCircleOutlined style={{ color: "#2f54eb" }} />,
  },
  ANNOTATE: {
    label: "Annotate",
    color: "#faad14",
    icon: <EditOutlined />,
    iconWithColor: <EditOutlined style={{ color: "#faad14" }} />,
  },
  REVIEW: {
    label: "Review",
    color: "#1890ff",
    icon: <EyeOutlined />,
    iconWithColor: <EyeOutlined style={{ color: "#1890ff" }} />,
  },
  CONSENSUS: {
    label: "Consensus",
    color: "#722ed1",
    icon: <TeamOutlined />,
    iconWithColor: <TeamOutlined style={{ color: "#722ed1" }} />,
  },
  MITL: {
    label: "MITL",
    color: "#eb2f96",
    icon: <ApiOutlined />,
    iconWithColor: <ApiOutlined style={{ color: "#eb2f96" }} />,
  },
  ROUTER: {
    label: "Router",
    color: "#595959",
    icon: <BranchesOutlined />,
    iconWithColor: <BranchesOutlined style={{ color: "#595959" }} />,
  },
  SUCCESS: {
    label: "Success",
    color: "#52c41a",
    icon: <CheckCircleOutlined />,
    iconWithColor: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
  },
  ARCHIVED: {
    color: "#bfbfbf",
    label: "Archived",
    icon: <InboxOutlined />,
    iconWithColor: <InboxOutlined style={{ color: "#bfbfbf" }} />,
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
