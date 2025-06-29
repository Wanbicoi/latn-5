import { useOne, useParsed, useShow } from "@refinedev/core";
import {
  Button,
  Table,
  Tooltip,
  Modal,
  Form,
  Space,
  Flex,
  Popconfirm,
} from "antd";
import { useCustomMutation, useList } from "@refinedev/core";
import { useModalForm } from "@refinedev/antd";
import { type Node, type Edge, useEdgesState, useNodesState } from "reactflow";
import { useEffect } from "react";
import { EyeOutlined } from "@ant-design/icons";
import FormItemTable from "@/components/form-item/table";
import WorkflowGraph from "@/components/workflow-graph";

type Project = {
  id: string;
  name: string;
  workflow_id?: string;
};

type Workflow = {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_by?: string;
  created_at?: string;
  graph_data?: { nodes: Node[]; edges: Edge[] } | null;
};

export function WorkflowTab() {
  const { id: project_id } = useParsed();

  const { data: workflowData } = useOne<Workflow>({
    resource: "workflows",
    id: project_id,
  });
  const workflow = workflowData?.data;

  const {
    modalProps: dataModalProps,
    formProps: dataFormProps,
    show: showDatasetsModal,
  } = useModalForm({
    action: "edit",
    resource: "datasets",
  });

  // Restrict workflow creation/saving to once per project
  const hasWorkflow = false; //!!workflow?.id;

  // Editable workflow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { mutate } = useCustomMutation({});

  // Save handler
  const handleSave = async () => {
    if (!workflow?.id) return;
    mutate({
      url: "workflows_update",
      method: "post",
      values: {
        p_workflow_id: workflow.id,
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
    if (workflow?.graph_data) {
      setNodes(workflow.graph_data.nodes);
      setEdges(workflow.graph_data.edges);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [workflow?.graph_data, setNodes, setEdges]);

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      {!hasWorkflow && (
        <Flex justify="space-between">
          <Button
            style={{ marginLeft: 8 }}
            onClick={() => showDatasetsModal(project_id)}
          >
            Choose Data for Annotate
          </Button>
          <Popconfirm
            placement="left"
            title="Are you sure you want to delete this workflow?"
            onConfirm={handleSave}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary">Create Workflow</Button>
          </Popconfirm>
        </Flex>
      )}
      <WorkflowGraph
        editable={!hasWorkflow}
        nodes={nodes}
        edges={edges}
        setNodes={setNodes}
        setEdges={setEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        workflowId={workflow?.id}
      />
      <ChooseDataForAnnotate
        formProps={dataFormProps}
        dataModalProps={dataModalProps}
      />
    </Space>
  );
}

function ChooseDataForAnnotate({ formProps, dataModalProps }: any) {
  const { data: orthancResourceData } = useList({ resource: "resources" });

  return (
    <Modal
      {...dataModalProps}
      width={900}
      title="Select data for the workflow"
      okText="Done"
      cancelText="Cancel"
      destroyOnHidden
    >
      <Form {...formProps} layout="vertical">
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
