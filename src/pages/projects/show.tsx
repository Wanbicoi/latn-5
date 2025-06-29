import { BooleanField, DateField, Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";

import { WorkflowGraph } from "../../components/workflow-graph";
import { Button, Table, Tooltip, Modal, TableProps, Form } from "antd";
import { useCustomMutation, useList } from "@refinedev/core";
import { useModalForm } from "@refinedev/antd";
import { type Node, type Edge, useEdgesState, useNodesState } from "reactflow";
import { useEffect } from "react";
import { EyeOutlined } from "@ant-design/icons";
import FormItemTable from "@/components/form-item/table";

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

  const {
    modalProps: dataModalProps,
    formProps: dataFormProps,
    show: showDatasetsModal,
  } = useModalForm({
    action: "create",
    resource: "datasets",
  });

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
  }, [query.dataUpdatedAt, setNodes, setEdges]);

  return (
    <Show isLoading={query?.isLoading}>
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
      <Button style={{ marginLeft: 8 }} onClick={() => showDatasetsModal()}>
        Choose Data for Annotate
      </Button>
      <WorkflowGraph
        editable
        nodes={nodes}
        edges={edges}
        setNodes={setNodes}
        setEdges={setEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        workflowId={project?.workflow_id}
      />

      <ChooseDataForAnnotate
        formProps={dataFormProps}
        dataModalProps={dataModalProps}
        project={project}
      />
    </Show>
  );
}

function ChooseDataForAnnotate({ formProps, dataModalProps, project }: any) {
  const { data: orthancResourceData } = useList({ resource: "resources" });

  // Custom onFinish to transform values before submit
  const handleOnFinish = (values: {
    resources: string[];
    project_id: string;
  }) => {
    formProps.onFinish?.({
      p_project_id: project?.id,
      p_resource_ids: values.resources,
    });
  };

  return (
    <Modal
      {...dataModalProps}
      width={900}
      title="Select data for the workflow"
      okText="Done"
      cancelText="Cancel"
      destroyOnHidden
    >
      <Form {...formProps} layout="vertical" onFinish={handleOnFinish}>
        <Form.Item
          name="resources"
          rules={[
            { required: true, message: "Please select at least one resource" },
          ]}
        >
          <FormItemTable
            size="small"
            dataSource={orthancResourceData?.data}
            rowKey={"StudyInstanceUID"}
            rowSelection={{
              type: "checkbox",
              selectedRowKeys: formProps?.values?.resources || [],
              onChange: (selectedRowKeys) =>
                formProps?.setFieldValue("resources", selectedRowKeys),
            }}
            // expandable={{
            //   expandedRowRender: (record) => record.RequestedProcedureDescription,
            // }}
          >
            <Table.Column dataIndex="PatientID" title="Patient ID" />
            <Table.Column dataIndex="PatientName" title="Patient Name" />
            <Table.Column dataIndex="PatientSex" title="Sex" width={60} />
            <Table.Column dataIndex="AccessionNumber" title="Accession #" />
            <Table.Column
              dataIndex="ReferringPhysicianName"
              title="Referring Physician"
            />
            <Table.Column
              width={30}
              dataIndex="StudyInstanceUID"
              render={(StudyInstanceUID) => (
                <Tooltip title="Preview" placement="right">
                  <Button
                    type="link"
                    icon={<EyeOutlined />}
                    // Add preview logic here if needed
                  />
                </Tooltip>
              )}
            />
          </FormItemTable>
        </Form.Item>
      </Form>
    </Modal>
  );
}
