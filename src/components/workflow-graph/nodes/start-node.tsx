// StartNode: entry node for selected data to be annotated
import React, { useState } from "react";
import { Handle, Position } from "reactflow";
import { PlayCircleOutlined, SettingOutlined } from "@ant-design/icons";
import { Card, Modal, Form, Input } from "antd";

type StartNodeProps = {
  id: string;
  data: {
    name?: string;
    description?: string;
    onChange?: (data: any) => void;
  };
  selected: boolean;
};

export const StartNode: React.FC<StartNodeProps> = ({ id, data, selected }) => {
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
        border: "2px solid #52a2ff",
        background: "#e6f0ff",
        minWidth: 180,
        textAlign: "center",
        boxShadow: selected ? "0 0 0 2px #52a2ff" : undefined,
      }}
      bodyStyle={{ padding: 12, position: "relative" }}
    >
      <PlayCircleOutlined style={{ fontSize: 24, color: "#52a2ff" }} />
      <div style={{ fontWeight: 600, marginTop: 8 }}>
        {data.name || "Start"}
        <SettingOutlined
          style={{ marginLeft: 8, cursor: "pointer", fontSize: 16 }}
          onClick={handleOpen}
        />
      </div>
      <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
        {data.description}
      </div>
      <Handle type="source" position={Position.Right} />
      <Modal
        open={modalOpen}
        title="Configure Start Stage"
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
