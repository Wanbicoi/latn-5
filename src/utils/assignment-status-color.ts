// src/utils/assignment-status-color.ts

export type AssignmentStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

const ASSIGNMENT_STATUS_META: Record<
  AssignmentStatus,
  { color: string; label: string }
> = {
  PENDING: { color: "#faad14", label: "Pending" },
  IN_PROGRESS: { color: "#1890ff", label: "In Progress" },
  COMPLETED: { color: "#52c41a", label: "Completed" },
};

export function getAssignmentStatusMeta(status: AssignmentStatus) {
  return ASSIGNMENT_STATUS_META[status];
}
