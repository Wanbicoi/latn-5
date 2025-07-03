import { ArrowRightOutlined, UserOutlined } from "@ant-design/icons";
import { DateField, useTable } from "@refinedev/antd";
import { useParsed } from "@refinedev/core";
import { Button, Descriptions, Table, List, Typography, Avatar } from "antd";
import { getColorFromChar } from "@/utils/get-color-from-char";
import { getAssignmentStatusMeta } from "@/utils/assignment-status-color";
import { Tag } from "antd";
import { UserAvatar } from "@/components/avatar";

export function ResultsTab() {
  const { id: project_id } = useParsed();
  const { tableProps } = useTable({
    resource: "results",
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

  return (
    <Table
      {...tableProps}
      rowKey="id"
      columns={[
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
          dataIndex: "latest_status",
          key: "latest_status",
          width: 200,
          sorter: true,
          render: (status: any) => {
            if (!status) return "-";
            const meta = getAssignmentStatusMeta(status);
            if (!meta) return status;
            return <Tag color={meta.color}>{meta.label}</Tag>;
          },
        },

        {
          title: "Current Stage",
          dataIndex: "latest_stage_type",
          key: "latest_stage_type",
          width: 200,
          sorter: true,
        },
        {
          title: "Completed At",
          dataIndex: "completed_at",
          key: "completed_at",
          width: 200,
          sorter: true,
          render: (value: any) => <DateField value={value} format="LLL" />,
        },
        {
          dataIndex: "actions",
          key: "actions",
          render: (_: any, record: any) => (
            <Button
              type="primary"
              size="small"
              icon={<ArrowRightOutlined />}
              iconPosition="end"
              onClick={() => openViewerForTask(record)}
            >
              View results
            </Button>
          ),
        },
      ]}
      expandable={{
        expandedRowRender: (record: any) =>
          Array.isArray(record.details) && record.details.length > 0 ? (
            <List
              style={{ marginTop: -8 }}
              header={<Typography.Title level={5}>Activities</Typography.Title>}
              size="small"
              dataSource={record.details}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<UserAvatar userName={item.assigned_to} />}
                    title={item.assigned_to || "System"}
                    description={
                      <Descriptions
                        size="small"
                        column={3}
                        style={{ width: 800 }}
                      >
                        <Descriptions.Item label="Stage">
                          {item.stage ?? "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Status">
                          {item.status ?? "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Created At">
                          {item.created_at ? (
                            <DateField value={item.created_at} format="LLL" />
                          ) : (
                            "-"
                          )}
                        </Descriptions.Item>
                      </Descriptions>
                    }
                  />
                </List.Item>
              )}
            />
          ) : null,
        rowExpandable: (record: any) =>
          Array.isArray(record.details) && record.details.length > 0,
      }}
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
