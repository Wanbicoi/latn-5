// ConsensusNode with configuration UI for strategy and threshold
import React, { useState } from "react";
import { Handle, Position } from "reactflow";
import { TeamOutlined, SettingOutlined } from "@ant-design/icons";
import { Card, Modal, Form, InputNumber, Select } from "antd";

type ConsensusNodeProps = {
  id: string;
  data: {
    strategy?: string;
    threshold?: number;
    name?: string;
    description?: string;
    onChange?: (data: any) => void;
  };
  selected: boolean;
};

const STRATEGY_OPTIONS = [
  { value: "majority", label: "Majority Vote" },
  { value: "iou", label: "Intersection over Union" },
];

export const ConsensusNode: React.FC<ConsensusNodeProps> = ({
  id,
  data,
  selected,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleOpen = () => {
    form.setFieldsValue({
      strategy: data.strategy || "majority",
      threshold: data.threshold ?? 1,
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
        border: "2px solid #faad14",
        background: "#fffbe6",
        minWidth: 180,
        textAlign: "center",
        boxShadow: selected ? "0 0 0 2px #faad14" : undefined,
      }}
      bodyStyle={{ padding: 12, position: "relative" }}
    >
      <TeamOutlined style={{ fontSize: 24, color: "#faad14" }} />
      <div style={{ fontWeight: 600, marginTop: 8 }}>
        {data.name || "Consensus"}
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
        title="Configure Consensus Stage"
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
            strategy: data.strategy || "majority",
            threshold: data.threshold ?? 1,
          }}
        >
          <Form.Item
            label="Strategy"
            name="strategy"
            rules={[{ required: true }]}
          >
            <Select options={STRATEGY_OPTIONS} />
          </Form.Item>
          <Form.Item
            label="Threshold"
            name="threshold"
            rules={[{ required: true, type: "number", min: 1 }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};
