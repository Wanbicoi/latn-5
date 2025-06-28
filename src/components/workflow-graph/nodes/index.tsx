import { AnnotateNode } from "./annotate-node";
import { ReviewNode } from "./review-node";
import { ConsensusNode } from "./consensus-node";
import { MitlNode } from "./mitl-node";
import { RouterNode } from "./router-node";
import { DatasourceNode } from "./datasource-node";
import { SuccessNode } from "./success-node";
import { ArchivedNode } from "./archived-node";
import {
  EditOutlined,
  EyeOutlined,
  TeamOutlined,
  ApiOutlined,
  BranchesOutlined,
  DatabaseOutlined,
  CheckCircleTwoTone,
  InboxOutlined,
} from "@ant-design/icons";

export const nodeTypes = {
  ANNOTATE: AnnotateNode,
  REVIEW: ReviewNode,
  CONSENSUS: ConsensusNode,
  MITL: MitlNode,
  ROUTER: RouterNode,
  DATASOURCE: DatasourceNode,
  SUCCESS: SuccessNode,
  ARCHIVED: ArchivedNode,
};

export const NODE_TYPE_META: Record<
  keyof typeof nodeTypes,
  { label: string; icon: React.ReactNode }
> = {
  ANNOTATE: {
    label: "Annotate",
    icon: <EditOutlined style={{ color: "#1890ff" }} />,
  },
  REVIEW: {
    label: "Review",
    icon: <EyeOutlined style={{ color: "#52c41a" }} />,
  },
  CONSENSUS: {
    label: "Consensus",
    icon: <TeamOutlined style={{ color: "#faad14" }} />,
  },
  MITL: {
    label: "MITL",
    icon: <ApiOutlined style={{ color: "#722ed1" }} />,
  },
  ROUTER: {
    label: "Router",
    icon: <BranchesOutlined style={{ color: "#d4380d" }} />,
  },
  DATASOURCE: {
    label: "Datasource",
    icon: <DatabaseOutlined style={{ color: "#13c2c2" }} />,
  },
  SUCCESS: {
    label: "Success",
    icon: <CheckCircleTwoTone twoToneColor="#52c41a" />,
  },
  ARCHIVED: {
    label: "Archived",
    icon: <InboxOutlined style={{ color: "#bfbfbf" }} />,
  },
};
