import { Tag } from "antd";

export type AssignmentStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

const ASSIGNMENT_STATUS_META: Record<
  AssignmentStatus,
  { color: string; label: string }
> = {
  PENDING: { color: "default", label: "Pending" },
  IN_PROGRESS: { color: "processing", label: "In Progress" },
  COMPLETED: { color: "success", label: "Completed" },
};

export function getAssignmentStatusTag(status: AssignmentStatus) {
  const meta = ASSIGNMENT_STATUS_META[status];
  if (!meta) return null;
  return <Tag color={meta.color}>{meta.label}</Tag>;
}
