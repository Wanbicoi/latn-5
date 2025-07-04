// MitlNode with configuration UI for api_endpoint
import React, { useState } from "react";
import { Handle, Position } from "reactflow";
import { SettingOutlined } from "@ant-design/icons";
import { Card, Modal, Form, Input } from "antd";
import { WORKFLOW_STAGE_META } from "@/utils/stage-color";

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

const META = WORKFLOW_STAGE_META.MITL;
const BACKGROUND_COLOR = "#fff0f6";

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
        border: `2px solid ${META.color}`,
        background: BACKGROUND_COLOR,
        minWidth: 180,
        textAlign: "center",
        boxShadow: selected ? `0 0 0 2px ${META.color}` : undefined,
      }}
      bodyStyle={{ padding: 12, position: "relative" }}
    >
      {React.cloneElement(META.icon, {
        style: { fontSize: 24, color: META.color },
      })}
      <div style={{ fontWeight: 600, marginTop: 8 }}>
        {data.name || META.label}
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
        style={{ width: 10, height: 10, background: META.color }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ width: 10, height: 10, background: META.color }}
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
