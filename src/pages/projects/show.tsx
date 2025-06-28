import { BooleanField, DateField, Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";

import { WorkflowGraph } from "../../components/workflow-graph";
import { Button, message } from "antd";
import { useCustomMutation } from "@refinedev/core";
import { type Node, type Edge, useEdgesState, useNodesState } from "reactflow";
import { useEffect } from "react";

type Project = {
  id: string;
  name: string;
  workflow_id?: string;
  workflow_name?: string;
  workflow_description?: string;
  workflow_is_active?: boolean;
  workflow_created_by?: string;
  workflow_created_at?: string;
  graph_data?: { nodes: Node[]; edges: Edge[] } | null;
};

export function ProjectsShow() {
  const { query } = useShow<Project>({});
  const project = query?.data?.data;

  // Editable workflow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { mutate, isLoading } = useCustomMutation({});

  // Save handler
  const handleSave = async () => {
    if (!project?.workflow_id) return;
    mutate({
      url: "workflows_update",
      method: "post",
      values: {
        p_workflow_id: project.workflow_id,
        nodes,
        edges,
      },
      successNotification: (data, values) => ({
        message: `Workflow saved successfully`,
        type: "success",
      }),
    });
  };

  useEffect(() => {
    if (project?.graph_data) {
      setNodes(project.graph_data.nodes);
      setEdges(project.graph_data.edges);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [project, setNodes, setEdges]);

  return (
    <Show>
      <div style={{ marginBottom: 16 }}>
        <h3>Workflow Details</h3>
        <div>
          <strong>Name:</strong> {project?.workflow_name || "-"}
        </div>
        <div>
          <strong>Description:</strong> {project?.workflow_description || "-"}
        </div>
        <div>
          <strong>Active:</strong>{" "}
          <BooleanField value={project?.workflow_is_active} />
        </div>
        <div>
          <strong>Created At:</strong>{" "}
          {project?.workflow_created_at ? (
            <DateField
              value={project?.workflow_created_at}
              format="YYYY-MM-DD HH:mm"
            />
          ) : (
            "-"
          )}
        </div>
      </div>
      <Button type="primary" onClick={handleSave} loading={isLoading}>
        Save Workflow
      </Button>
      <WorkflowGraph
        editable
        nodes={nodes}
        edges={edges}
        setNodes={setNodes}
        setEdges={setEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      />
    </Show>
  );
}
