import { List, useTable, useModalForm } from "@refinedev/antd";
import {
  Table,
  Modal,
  Form,
  Space,
  Tag,
  Select,
  Input,
  Flex,
  Button,
} from "antd";
import { EditButton } from "@refinedev/antd";
import { BaseRecord, HttpError, useInvalidate } from "@refinedev/core";
import { supabaseClient } from "@/utils";
import { CreateMemberForm } from "./create";
import { useState } from "react";

interface Member extends BaseRecord {
  id: string;
  full_name: string;
  role: string;
}

export const MembersList = () => {
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const { tableProps } = useTable<Member>({
    resource: "members",
    syncWithLocation: true,
    meta: {
      select: "id, full_name, role",
    },
  });
  const invalidate = useInvalidate();
  const {
    modalProps: editModalProps,
    formProps: editFormProps,
    show: editModalShow,
    close,
    form,
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
            title="Role"
            dataIndex="role"
            render={(role: string) => (
              <Tag color={getRoleColor(role || "user")}>{role || "user"}</Tag>
            )}
          />
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
          <Form.Item label="Role" name="role" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="reviewer">Reviewer</Select.Option>
              <Select.Option value="labeler">Labeler</Select.Option>
            </Select>
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

const getRoleColor = (role: string) => {
  switch (role) {
    case "admin":
      return "red";
    case "labeler":
      return "green";
    default:
      return "blue";
  }
};
