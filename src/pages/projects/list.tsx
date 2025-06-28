import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { BaseRecord } from "@refinedev/core";
import { Space, Table, Tag } from "antd";

export const ProjectsList = () => {
  const { tableProps } = useTable();

  return (
    <List title="Projects">
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="Id" />
        <Table.Column dataIndex="name" title="Name" />
        <Table.Column
          title="Tags"
          dataIndex="tags"
          render={(tags: any[]) => (
            <Space wrap>
              {tags?.map((tag) => (
                <Tag key={tag.id} color={tag.color}>
                  {tag.title}
                </Tag>
              ))}
            </Space>
          )}
        />
        <Table.Column
          dataIndex={["created_at"]}
          title="Created At"
          render={(value: any) => <DateField value={value} />}
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
