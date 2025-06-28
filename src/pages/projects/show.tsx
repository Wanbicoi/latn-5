import { BooleanField, DateField, List } from "@refinedev/antd";
import { useOne, useShow } from "@refinedev/core";

import { WorkflowGraph } from "../../components/workflow-graph";

type Project = {
  id: string;
  name: string;
  workflow_id?: string;
  workflow_name?: string;
  workflow_description?: string;
  workflow_is_active?: boolean;
  workflow_created_by?: string;
  workflow_created_at?: string;
};

export function ProjectsShow() {
  const { query } = useShow<Project>({});
  const project = query?.data?.data;
  return (
    <List title="Tasks">
      {project?.workflow_id && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ marginBottom: 16 }}>
            <h3>Workflow Details</h3>
            <div>
              <strong>Name:</strong> {project.workflow_name || "-"}
            </div>
            <div>
              <strong>Description:</strong>{" "}
              {project.workflow_description || "-"}
            </div>
            <div>
              <strong>Active:</strong>{" "}
              <BooleanField value={project.workflow_is_active} />
            </div>
            <div>
              <strong>Created At:</strong>{" "}
              {project.workflow_created_at ? (
                <DateField
                  value={project.workflow_created_at}
                  format="YYYY-MM-DD HH:mm"
                />
              ) : (
                "-"
              )}
            </div>
          </div>
          <WorkflowGraph workflow_id={project.workflow_id} />
        </div>
      )}
    </List>
  );
}
