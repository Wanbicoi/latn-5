import { List, useTable, useModalForm, DateField } from "@refinedev/antd";
import { Table, Modal, Form, Input, Space, Tag, Select } from "antd";
import { EditButton, DeleteButton } from "@refinedev/antd";
import { useNotification } from "@refinedev/core";
import { getColorOptions } from "../../utils/colors";

const colorOptions = getColorOptions();

export const TagsList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  const {
    modalProps: createModalProps,
    formProps: createFormProps,
    show: createModalShow,
  } = useModalForm({
    action: "create",
    resource: "hd_tags",
    redirect: false,
    successNotification: {
      message: "Tag created successfully",
      type: "success",
      undoableTimeout: 1500,
    },
  });

  const {
    modalProps: editModalProps,
    formProps: editFormProps,
    show: editModalShow,
  } = useModalForm({
    action: "edit",
    resource: "hd_tags",
    redirect: false,
    successNotification: {
      message: "Tag updated successfully",
      type: "success",
      undoableTimeout: 1500,
    },
  });

  return (
    <>
      <List
        createButtonProps={{
          onClick: () => createModalShow(),
        }}
      >
        <Table {...tableProps} rowKey="id">
          <Table.Column
            dataIndex="title"
            title="Title"
            render={(_, record: any) => (
              <Tag color={record.color}>{record.title}</Tag>
            )}
          />
          <Table.Column
            dataIndex="created_at"
            title="Created At"
            render={(value) => <DateField value={value} />}
          />
          <Table.Column
            title="Actions"
            render={(_, record: any) => (
              <Space>
                <EditButton
                  hideText
                  size="small"
                  recordItemId={record.id}
                  onClick={() => editModalShow(record.id)}
                />
                <DeleteButton
                  hideText
                  size="small"
                  recordItemId={record.id}
                  resource="hd_tags"
                  successNotification={{
                    message: "Tag deleted successfully",
                    type: "success",
                    undoableTimeout: 1500,
                  }}
                />
              </Space>
            )}
          />
        </Table>
      </List>

      <Modal {...createModalProps} title="Create Tag">
        <Form {...createFormProps} layout="vertical">
          <Form.Item label="Title" name="title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            label="Color"
            name="color"
            initialValue="#1890ff"
            rules={[{ required: true }]}
          >
            <Select options={colorOptions} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal {...editModalProps} title="Edit Tag">
        <Form {...editFormProps} layout="vertical">
          <Form.Item label="Title" name="title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Color" name="color" rules={[{ required: true }]}>
            <Select options={colorOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
