import FormItemTable from "@/components/form-item/table";
import WorkflowGraph from "@/components/workflow-graph";
import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { useModalForm } from "@refinedev/antd";
import { useCustomMutation, useList, useOne, useParsed } from "@refinedev/core";
import {
  Button,
  Flex,
  Form,
  Modal,
  Popconfirm,
  Select,
  Space,
  Spin,
  Table,
  Tooltip,
} from "antd";
import { useEffect } from "react";
import { type Edge, type Node, useEdgesState, useNodesState } from "reactflow";

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

  const { data: workflowData, isLoading } = useOne<Workflow>({
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

  const {
    modalProps: memberModalProps,
    formProps: memberFormProps,
    show: showMemberModal,
  } = useModalForm({
    action: "edit",
    resource: "project_members",
  });

  // Restrict workflow creation/saving to once per project
  // const hasWorkflow = false;
  const hasWorkflow = !!workflow?.id;

  // Editable workflow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { mutate } = useCustomMutation({});

  // Save handler
  const handleSave = async () => {
    mutate({
      url: "workflows_create",
      method: "post",
      values: {
        project_id: project_id,
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
    <Spin spinning={isLoading}>
      <Space direction="vertical" style={{ width: "100%" }}>
        {!hasWorkflow && (
          <Flex justify="space-between">
            <Space>
              <Button onClick={() => showMemberModal(project_id)}>
                Choose Project Members
              </Button>
              <Button onClick={() => showDatasetsModal(project_id)}>
                Choose Data for Annotate
              </Button>
            </Space>
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
        <ChooseProjectMember
          formProps={memberFormProps}
          memberModalProps={memberModalProps}
        />
      </Space>
    </Spin>
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
function ChooseProjectMember({ formProps, memberModalProps }: any) {
  const { data: membersData } = useList({ resource: "members" });
  const { data: rolesData } = useList({ resource: "roles" });

  return (
    <Modal
      {...memberModalProps}
      width={500}
      title="Select project members and roles"
      okText="Done"
      cancelText="Cancel"
      destroyOnHidden
    >
      <Form {...formProps} layout="vertical">
        <Form.List name="members">
          {(fields, { add, remove }) => (
            <Space direction="vertical" style={{ width: "100%" }}>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key}>
                  <Form.Item
                    noStyle
                    {...restField}
                    name={[name, "id"]}
                    rules={[{ required: true, message: "Select member" }]}
                  >
                    <Select
                      placeholder="Member"
                      style={{ width: 180 }}
                      options={
                        membersData?.data
                          ?.filter((m: any) => {
                            // Exclude already selected except for this row
                            const selectedIds =
                              formProps.form
                                ?.getFieldValue("members")
                                ?.map((mem: any, idx: number) =>
                                  idx === name ? null : mem?.id
                                ) || [];
                            return !selectedIds.includes(m.id);
                          })
                          .map((m: any) => ({
                            label: m.full_name,
                            value: m.id,
                          })) || []
                      }
                    />
                  </Form.Item>
                  <Form.Item
                    noStyle
                    {...restField}
                    name={[name, "role_id"]}
                    rules={[{ required: true, message: "Select role" }]}
                  >
                    <Select
                      placeholder="Role"
                      style={{ width: 140 }}
                      options={
                        rolesData?.data?.map((r: any) => ({
                          label: r.name,
                          value: r.id,
                        })) || []
                      }
                    />
                  </Form.Item>
                  <Button
                    size="small"
                    danger
                    shape="circle"
                    onClick={() => remove(name)}
                    icon={<DeleteOutlined />}
                  />
                </Space>
              ))}
              <Button type="dashed" onClick={() => add()} block>
                Add Member
              </Button>
            </Space>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
}
