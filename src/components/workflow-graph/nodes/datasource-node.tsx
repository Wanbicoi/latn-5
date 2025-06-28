// DatasourceNode with configuration UI
import React, { useState } from "react";
import { Handle, Position } from "reactflow";
import { DatabaseOutlined, SettingOutlined } from "@ant-design/icons";
import { Card, Modal, Form, Input } from "antd";

type DatasourceNodeProps = {
  id: string;
  data: {
    name?: string;
    description?: string;
    onChange?: (data: any) => void;
  };
  selected: boolean;
};

export const DatasourceNode: React.FC<DatasourceNodeProps> = ({
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
        border: "2px solid #13c2c2",
        background: "#e6fffb",
        minWidth: 180,
        textAlign: "center",
        boxShadow: selected ? "0 0 0 2px #13c2c2" : undefined,
      }}
      bodyStyle={{ padding: 12, position: "relative" }}
    >
      <DatabaseOutlined style={{ fontSize: 24, color: "#13c2c2" }} />
      <div style={{ fontWeight: 600, marginTop: 8 }}>
        {data.name || "Datasource"}
        <SettingOutlined
          style={{ marginLeft: 8, cursor: "pointer", fontSize: 16 }}
          onClick={handleOpen}
        />
      </div>
      <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
        {data.description}
      </div>
      <Handle type="source" position={Position.Bottom} />
      <Modal
        open={modalOpen}
        title="Configure Datasource Stage"
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
