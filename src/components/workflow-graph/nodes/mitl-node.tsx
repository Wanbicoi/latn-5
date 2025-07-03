// MitlNode with configuration UI for api_endpoint
import React, { useState } from "react";
import { Handle, Position } from "reactflow";
import { ApiOutlined, SettingOutlined } from "@ant-design/icons";
import { Card, Modal, Form, Input } from "antd";

type MitlNodeProps = {
  id: string;
  data: {
    api_endpoint?: string;
    name?: string;
    description?: string;
    onChange?: (data: any) => void;
    workflow_id?: string;
  };
  selected: boolean;
};

export const MitlNode: React.FC<MitlNodeProps> = ({ id, data, selected }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleOpen = () => {
    form.setFieldsValue({
      api_endpoint: data.api_endpoint || "",
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
        border: "2px solid #722ed1",
        background: "#f9f0ff",
        minWidth: 180,
        textAlign: "center",
        boxShadow: selected ? "0 0 0 2px #722ed1" : undefined,
      }}
      bodyStyle={{ padding: 12, position: "relative" }}
    >
      <ApiOutlined style={{ fontSize: 24, color: "#722ed1" }} />
      <div style={{ fontWeight: 600, marginTop: 8 }}>
        {data.name || "MITL"}
        <SettingOutlined
          style={{ marginLeft: 8, cursor: "pointer", fontSize: 16 }}
          onClick={handleOpen}
        />
      </div>
      <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
        {data.description}
      </div>
      <Handle
        type="target"
        position={Position.Left}
        style={{ width: 10, height: 10, background: "#bfbfbf" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ width: 10, height: 10, background: "#bfbfbf" }}
      />
      <Modal
        open={modalOpen}
        title="Configure MITL Stage"
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
            api_endpoint: data.api_endpoint || "",
          }}
        >
          <Form.Item
            label="API Endpoint"
            name="api_endpoint"
            rules={[
              { required: true, message: "Please enter the API endpoint URL" },
              { type: "url", message: "Please enter a valid URL" },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};
