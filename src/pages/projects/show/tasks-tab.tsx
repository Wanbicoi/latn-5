import { ArrowRightOutlined, EyeOutlined } from "@ant-design/icons";
import { DateField, useTable } from "@refinedev/antd";
import { useCustomMutation } from "@refinedev/core";
import { Button, Popconfirm, Space, Table, Tooltip } from "antd";

export function TasksTab() {
  const { tableProps } = useTable({
    resource: "tasks",
    syncWithLocation: false,
  });
  const { mutate } = useCustomMutation();

  return (
    <Table
      {...tableProps}
      rowKey="id"
      columns={[
        {
          title: "Stage",
          dataIndex: "stage",
          key: "stage",
          sorter: true,
        },
        {
          title: "File",
          dataIndex: "file",
          key: "file",
          sorter: true,
          render: (file: any) =>
            file ? (
              <div>
                <div>
                  <b>Patient ID:</b> {file.PatientID || "-"}
                </div>
                <div>
                  <b>Patient Name:</b> {file.PatientName || "-"}
                </div>
                <div>
                  <b>Patient Sex:</b> {file.PatientSex || "-"}
                </div>
                <div>
                  <b>Study Instance UID:</b> {file.StudyInstanceUID || "-"}
                </div>
                <div>
                  <b>Accession Number:</b> {file.AccessionNumber || "-"}
                </div>
                <div>
                  <b>Referring Physician:</b>{" "}
                  {file.ReferringPhysicianName || "-"}
                </div>
                <div>
                  <b>Orthanc UUID:</b> {file.orthanc_uuid || "-"}
                </div>
              </div>
            ) : (
              "-"
            ),
        },
        {
          title: "Status",
          dataIndex: "status",
          key: "status",
          sorter: true,
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
          render: (value: any) => <DateField value={value} />,
        },
        {
          dataIndex: "actions",
          key: "actions",
          render: (record: any) => (
            <Space>
              <Tooltip title="View only">
                <Button
                  type="primary"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() =>
                    location.assign(
                      `${
                        import.meta.env.VITE_OHIFVIEWER_ROUTE
                      }?StudyInstanceUIDs=${
                        record.file.StudyInstanceUID
                      }&taskId=${record.id}`
                    )
                  }
                />
              </Tooltip>
              <Popconfirm
                title="Mark this task as in progress?"
                onConfirm={() =>
                  mutate({
                    url: "tasks_start",
                    method: "post",
                    values: { task_assignment_id: record.id },
                  })
                }
              >
                <Button type="primary" icon={<ArrowRightOutlined />}>
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
