import FormItemTable from "@/components/form-item/table";
import WorkflowGraph from "@/components/workflow-graph";
import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { useModalForm } from "@refinedev/antd";
import {
  useCustomMutation,
  useInvalidate,
  useList,
  useOne,
  useParsed,
} from "@refinedev/core";
import {
  Badge,
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
import {
  type Edge,
  type Node,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { IdDisplay } from "@/components";

type Workflow = {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_by?: string;
  created_at?: string;
  graph_data: { nodes: Node[]; edges: Edge[] };
  data_count: number;
  members_count: number;
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
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { mutate } = useCustomMutation({});

  const invalidate = useInvalidate();
  // Save handler
  const handleSave = async () => {
    mutate(
      {
        url: "workflows_create",
        method: "post",
        values: {
          project_id: project_id,
          nodes,
          edges,
        },
        successNotification: () => ({
          message: `Workflow saved successfully`,
          type: "success",
        }),
      },
      {
        onSuccess: () => {
          invalidate({
            resource: "workflows",
            invalidates: ["all"],
          });
        },
      }
    );
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
        {!hasWorkflow ? (
          <Flex justify="space-between">
            <Space>
              <Button onClick={() => showMemberModal(project_id)}>
                Choose project members
              </Button>
              <Button onClick={() => showDatasetsModal(project_id)}>
                Choose data for annotation
              </Button>
            </Space>
            <Popconfirm
              placement="left"
              title="Are you sure you want to create this workflow?"
              onConfirm={handleSave}
              okText="Yes"
              cancelText="No"
            >
              <Button type="primary">Create Workflow</Button>
            </Popconfirm>
          </Flex>
        ) : (
          <Flex justify="space-between">
            <Space>
              <Button
                onClick={() => showMemberModal(project_id)}
                iconPosition="end"
                icon={
                  <Badge
                    count={workflow?.members_count}
                    style={{ background: "#aaa" }}
                  />
                }
              >
                View project members
              </Button>
              <Button
                onClick={() => showDatasetsModal(project_id)}
                iconPosition="end"
                icon={
                  <Badge
                    count={workflow?.data_count}
                    style={{ background: "#aaa" }}
                  />
                }
              >
                View data for annotation
              </Button>
            </Space>
            <IdDisplay
              id={project_id as string}
              label="Project ID"
              length={6}
            />
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
          viewOnly={hasWorkflow}
        />
        <ChooseProjectMember
          formProps={memberFormProps}
          memberModalProps={memberModalProps}
          viewOnly={hasWorkflow}
        />
      </Space>
    </Spin>
  );
}

function ChooseDataForAnnotate({ formProps, dataModalProps, viewOnly }: any) {
  const { data: orthancResourceData } = useList({
    resource: "resources",
    pagination: {
      mode: "off",
    },
  });

  return (
    <Modal
      {...dataModalProps}
      width={900}
      title={
        viewOnly ? "Data for the workflow" : "Select data for the workflow"
      }
      okText="Done"
      cancelText="Cancel"
      destroyOnHidden
      okButtonProps={
        viewOnly ? { disabled: true } : dataModalProps.okButtonProps
      }
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
            disabled={viewOnly}
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
                  <Button type="link" icon={<EyeOutlined />} />
                </Tooltip>
              )}
            />
          </FormItemTable>
        </Form.Item>
      </Form>
    </Modal>
  );
}
function ChooseProjectMember({ formProps, memberModalProps, viewOnly }: any) {
  const { data: membersData } = useList({
    resource: "members",
    pagination: {
      mode: "off",
    },
  });
  const { data: rolesData } = useList({
    resource: "roles",
    pagination: {
      mode: "off",
    },
  });

  return (
    <Modal
      {...memberModalProps}
      width={500}
      title={
        viewOnly
          ? "Project members and roles"
          : "Select project members and roles"
      }
      okText="Done"
      cancelText="Cancel"
      destroyOnHidden
      okButtonProps={
        viewOnly ? { disabled: true } : memberModalProps.okButtonProps
      }
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
                      disabled={viewOnly}
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
                      disabled={viewOnly}
                      options={
                        rolesData?.data?.map((r: any) => ({
                          label: r.name,
                          value: r.id,
                        })) || []
                      }
                    />
                  </Form.Item>
                  {!viewOnly && (
                    <Button
                      size="small"
                      danger
                      shape="circle"
                      onClick={() => remove(name)}
                      icon={<DeleteOutlined />}
                    />
                  )}
                </Space>
              ))}
              {!viewOnly && (
                <Button type="dashed" onClick={() => add()} block>
                  Add Member
                </Button>
              )}
            </Space>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
}
