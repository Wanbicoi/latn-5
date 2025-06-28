// ReviewNode with configuration UI and dual output handles
import React, { useState } from "react";
import { Handle, Position } from "reactflow";
import { EyeOutlined, SettingOutlined } from "@ant-design/icons";
import { Card, Modal, Form, Input, Button } from "antd";

type ReviewNodeProps = {
  id: string;
  data: {
    name?: string;
    description?: string;
    on_success_stage_id?: string;
    on_failure_stage_id?: string;
    onChange?: (data: any) => void;
  };
  selected: boolean;
};

export const ReviewNode: React.FC<ReviewNodeProps> = ({
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
        border: "2px solid #52c41a",
        background: "#f6ffed",
        minWidth: 180,
        textAlign: "center",
        boxShadow: selected ? "0 0 0 2px #52c41a" : undefined,
      }}
      bodyStyle={{ padding: 12, position: "relative" }}
    >
      <EyeOutlined style={{ fontSize: 24, color: "#52c41a" }} />
      <div style={{ fontWeight: 600, marginTop: 8 }}>
        {data.name || "Review"}
        <SettingOutlined
          style={{ marginLeft: 8, cursor: "pointer", fontSize: 16 }}
          onClick={handleOpen}
        />
      </div>
      <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
        {data.description}
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle
        type="source"
        position={Position.Right}
        id="approve"
        style={{ top: "30%", background: "#52c41a" }}
      >
        <div style={{ fontSize: 10, color: "#52c41a", marginLeft: 18 }}>
          On Approve
        </div>
      </Handle>
      <Handle
        type="source"
        position={Position.Right}
        id="reject"
        style={{ top: "70%", background: "#ff4d4f" }}
      >
        <div style={{ fontSize: 10, color: "#ff4d4f", marginLeft: 18 }}>
          On Reject
        </div>
      </Handle>
      <Modal
        open={modalOpen}
        title="Configure Review Stage"
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
