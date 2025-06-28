import { ArrowRightOutlined } from "@ant-design/icons";
import { BooleanField, DateField, List, useTable } from "@refinedev/antd";
import { BaseRecord, useParsed } from "@refinedev/core";
import { Button, Space, Table, Tooltip, Tag } from "antd";
import dayjs from "dayjs";

type Props = {};

export function ProjectsShow({}: Props) {
  const { id: project_id } = useParsed();
  const { tableProps } = useTable({
    syncWithLocation: true,
    resource: "hd_tasks",
    filters: {
      permanent: [{ field: "project_id", operator: "eq", value: project_id }],
    },
  });

  return (
    <List title="Tasks">
      <Table
        {...tableProps}
        rowKey="id"
        expandable={{
          expandedRowRender: (record) => record.RequestedProcedureDescription,
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
          dataIndex={["is_done"]}
          title="Done"
          align="center"
          render={(value: any) => <BooleanField value={value} />}
        />
        <Table.Column
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <Tooltip title="Start label">
                <Button
                  type="primary"
                  size="small"
                  icon={<ArrowRightOutlined />}
                  onClick={() =>
                    location.assign(
                      `${
                        import.meta.env.VITE_OHIFVIEWER_ROUTE
                      }?StudyInstanceUIDs=${record.StudyInstanceUID}&taskId=${
                        record.id
                      }`
                    )
                  }
                />
              </Tooltip>
            </Space>
          )}
        />
      </Table>
    </List>
  );
}
