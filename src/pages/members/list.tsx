import { List, useTable, useModalForm } from "@refinedev/antd";
import { Table, Modal, Form, Space, Input, Flex, Button } from "antd";
import { EditButton } from "@refinedev/antd";
import { BaseRecord, HttpError } from "@refinedev/core";
import { CreateMemberForm } from "./create";
import { useState } from "react";

interface Member extends BaseRecord {
  id: string;
  full_name: string;
}

export const MembersList = () => {
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const { tableProps } = useTable<Member>({
    resource: "members",
    syncWithLocation: true,
    meta: {
      select: "id, full_name",
    },
  });
  const {
    modalProps: editModalProps,
    formProps: editFormProps,
    show: editModalShow,
    close,
    formLoading,
  } = useModalForm<Member, HttpError, Member>({
    action: "edit",
    resource: "members",
    redirect: false,
    successNotification: {
      message: "Member updated successfully",
      type: "success",
    },
  });

  // onMemberUpdate removed: updates are now handled directly by useModalForm on the "members" view.

  const handleCreateSuccess = () => {
    setCreateModalVisible(false);
  };

  return (
    <>
      <List
        createButtonProps={{
          onClick: () => setCreateModalVisible(true),
        }}
      >
        <Table {...tableProps} rowKey="id">
          <Table.Column dataIndex="full_name" title="Full Name" />
          <Table.Column
            render={(_, record: Member) => (
              <Space>
                <EditButton
                  hideText
                  size="small"
                  recordItemId={record.id}
                  onClick={() => editModalShow(record.id)}
                />
              </Space>
            )}
          />
        </Table>
      </List>

      <Modal
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        title="Create Member"
        footer={null}
        width={600}
      >
        <CreateMemberForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setCreateModalVisible(false)}
        />
      </Modal>

      <Modal
        {...editModalProps}
        title="Edit Member"
        footer={null}
        onCancel={close}
        width={600}
      >
        <Form
          {...editFormProps}
          layout="vertical"
          onFinish={editFormProps.onFinish}
        >
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            label="Full Name"
            name="full_name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Flex justify="end" gap={8}>
            <Button type="primary" htmlType="submit" loading={formLoading}>
              Update Member
            </Button>
            <Button onClick={close}>Cancel</Button>
          </Flex>
        </Form>
      </Modal>
    </>
  );
};
