// ConsensusNode with configuration UI for strategy and threshold
import React, { useState } from "react";
import { Handle, Position } from "reactflow";
import { SettingOutlined } from "@ant-design/icons";
import { Card, Modal, Form, InputNumber, Select } from "antd";
import { WORKFLOW_STAGE_META } from "@/utils/stage-color";

type ConsensusNodeProps = {
  id: string;
  data: {
    strategy?: string;
    threshold?: number;
    name?: string;
    description?: string;
    onChange?: (data: any) => void;
    workflow_id?: string;
  };
  selected: boolean;
};

const STRATEGY_OPTIONS = [
  { value: "majority", label: "Majority Vote" },
  { value: "iou", label: "Intersection over Union" },
];

const META = WORKFLOW_STAGE_META.CONSENSUS;
const BACKGROUND_COLOR = "#f9f0ff";

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
        {META.label}
        <SettingOutlined
          style={{ marginLeft: 8, cursor: "pointer", fontSize: 16 }}
          onClick={handleOpen}
        />
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
        title="Configure Consensus Stage"
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        okText="Save"
        cancelText="Cancel"
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
