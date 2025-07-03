import { IdDisplay } from "@/components/id-display";
import { getAssignmentStatusTag } from "@/utils";
import { getStageTag } from "@/utils/stage-color";
import { ArrowRightOutlined, EyeOutlined } from "@ant-design/icons";
import { DateField, useTable } from "@refinedev/antd";
import { useCustomMutation, useInvalidate, useParsed } from "@refinedev/core";
import { Button, Descriptions, Popconfirm, Space, Table, Tooltip } from "antd";

export function TasksTab() {
  const { id: project_id } = useParsed();

  const { tableProps } = useTable({
    resource: "tasks",
    filters: {
      initial: [
        {
          field: "project_id",
          value: project_id,
          operator: "eq",
        },
      ],
    },
    syncWithLocation: false,
  });
  const { mutate } = useCustomMutation();
  const invalidate = useInvalidate();

  return (
    <Table
      {...tableProps}
      rowKey="id"
      columns={[
        {
          title: "Id",
          dataIndex: "id",
          key: "id",
          render: (value) => <IdDisplay id={value} />,
        },
        {
          title: "File",
          dataIndex: "file",
          key: "file",
          sorter: true,
          width: 500,
          render: (file: any) =>
            file ? (
              <Descriptions size="small" column={2}>
                <Descriptions.Item label="Patient ID">
                  {file.PatientID || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Name">
                  {file.PatientName || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Sex">
                  {file.PatientSex || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Physician">
                  {file.ReferringPhysicianName || "-"}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              "-"
            ),
        },
        {
          title: "Status",
          dataIndex: "status",
          key: "status",
          sorter: true,
          render: (status: any) => getAssignmentStatusTag(status),
        },
        {
          title: "Stage",
          dataIndex: "stage",
          key: "stage",
          sorter: true,
          render: (value) => getStageTag(value),
        },
        {
          title: "Assigned To",
          dataIndex: "assigned_to",
          key: "assigned_to",
          sorter: true,
        },
        {
          title: "Created At",
          dataIndex: "created_at",
          key: "created_at",
          sorter: true,
          render: (value: any) => <DateField value={value} format="LLL" />,
        },
        {
          dataIndex: "actions",
          key: "actions",
          render: (_, record: any) => (
            <Space>
              <Tooltip title="View only">
                <Button
                  type="primary"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => openViewerForTask(record)}
                />
              </Tooltip>
              <Popconfirm
                title="Mark this task as in progress?"
                onConfirm={() =>
                  mutate(
                    {
                      url: "tasks_start",
                      method: "post",
                      values: { task_assignment_id: record.id },
                    },
                    {
                      onSuccess: () => {
                        invalidate({
                          resource: "tasks",
                          invalidates: ["list"],
                        });
                        openViewerForTask(record);
                      },
                    }
                  )
                }
              >
                <Button
                  type="primary"
                  iconPosition="end"
                  icon={<ArrowRightOutlined />}
                  size="small"
                >
                  Start
                </Button>
              </Popconfirm>
            </Space>
          ),
        },
      ]}
    />
  );
}

function openViewerForTask(record: any) {
  window.open(
    `${import.meta.env.VITE_OHIFVIEWER_ROUTE}?StudyInstanceUIDs=${
      record.file.StudyInstanceUID
    }&taskId=${record.id}`,
    "_blank"
  );
}
