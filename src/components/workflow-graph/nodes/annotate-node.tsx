// AnnotateNode with configuration UI and state update
import React, { useState } from "react";
import { Handle, Position } from "reactflow";
import { EditOutlined, SettingOutlined } from "@ant-design/icons";
import { Card, Modal, Form, Input, Button } from "antd";

type AnnotateNodeProps = {
  id: string;
  data: {
    name?: string;
    description?: string;
    onChange?: (data: any) => void;
  };
  selected: boolean;
};

export const AnnotateNode: React.FC<AnnotateNodeProps> = ({
  id,
  data,
  selected,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleOpen = () => {
    form.setFieldsValue({
      name: data.name || "",
      description: data.description || "",
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      data.onChange?.(values);
      setModalOpen(false);
    });
  };

  return (
    <Card
      size="small"
      style={{
        border: "2px solid #1890ff",
        background: "#e6f7ff",
        minWidth: 180,
        textAlign: "center",
        boxShadow: selected ? "0 0 0 2px #1890ff" : undefined,
      }}
      bodyStyle={{ padding: 12, position: "relative" }}
    >
      <EditOutlined style={{ fontSize: 24, color: "#1890ff" }} />
      <div style={{ fontWeight: 600, marginTop: 8 }}>
        {data.name || "Annotate"}
        <SettingOutlined
          style={{ marginLeft: 8, cursor: "pointer", fontSize: 16 }}
          onClick={handleOpen}
        />
      </div>
      <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
        {data.description}
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Modal
        open={modalOpen}
        title="Configure Annotate Stage"
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        okText="Save"
        cancelText="Cancel"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            name: data.name || "",
            description: data.description || "",
          }}
        >
          <Form.Item
            label="Stage Name"
            name="name"
            rules={[{ required: true, message: "Please enter a name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};
