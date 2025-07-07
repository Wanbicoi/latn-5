import { IdDisplay } from "@/components/id-display";
import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { BaseRecord, useList } from "@refinedev/core";
import { Space, Table, Tag } from "antd";

export const ProjectsList = () => {
  const { tableProps } = useTable();

  const { data } = useList({ resource: "project_tags" });
  const project_tags = data?.data || [];

  return (
    <List title="Projects">
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="id"
          title="Id"
          width={120}
          render={(value) => <IdDisplay id={value} />}
        />
        <Table.Column dataIndex="name" title="Name" />
        <Table.Column
          title="Tags"
          dataIndex="tags"
          render={(tags: any[]) => (
            <Space>
              {tags?.map((id) => {
                const tag = project_tags.find((t) => t.id === id);
                return tag ? (
                  <Tag key={tag.id} color={tag.color}>
                    {tag.name}
                  </Tag>
                ) : null;
              })}
            </Space>
          )}
        />
        <Table.Column
          dataIndex={["created_at"]}
          title="Created At"
          render={(value: any) => <DateField value={value} format="LLL" />}
        />
        <Table.Column
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <ShowButton size="small" recordItemId={record.id} />
              <EditButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
