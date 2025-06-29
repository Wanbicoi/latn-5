// RouterNode with dynamic rules configuration and output handles
import React, { useState } from "react";
import { Handle, Position } from "reactflow";
import {
  BranchesOutlined,
  SettingOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { Card, Modal, Form, Input, Button, Space } from "antd";

type Rule = {
  condition: string;
  label?: string;
};

type RouterNodeProps = {
  id: string;
  data: {
    rules?: Rule[];
    name?: string;
    description?: string;
    onChange?: (data: any) => void;
    workflow_id?: string;
  };
  selected: boolean;
};

export const RouterNode: React.FC<RouterNodeProps> = ({
  id,
  data,
  selected,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleOpen = () => {
    form.setFieldsValue({
      rules:
        data.rules && data.rules.length > 0 ? data.rules : [{ condition: "" }],
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      data.onChange?.(values);
      setModalOpen(false);
    });
  };

  // Render dynamic output handles for each rule
  const rules: Rule[] =
    data.rules && data.rules.length > 0 ? data.rules : [{ condition: "" }];

  return (
    <Card
      size="small"
      style={{
        border: "2px solid #d4380d",
        background: "#fff2e8",
        minWidth: 200,
        textAlign: "center",
        boxShadow: selected ? "0 0 0 2px #d4380d" : undefined,
      }}
      bodyStyle={{ padding: 12, position: "relative" }}
    >
      <BranchesOutlined style={{ fontSize: 24, color: "#d4380d" }} />
      <div style={{ fontWeight: 600, marginTop: 8 }}>
        {data.name || "Router"}
        <SettingOutlined
          style={{ marginLeft: 8, cursor: "pointer", fontSize: 16 }}
          onClick={handleOpen}
        />
      </div>
      <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
        {data.description}
      </div>
      <Handle type="target" position={Position.Left} />
      {rules.map((rule, idx) => (
        <Handle
          key={idx}
          type="source"
          position={Position.Right}
          id={`rule-${idx}`}
          style={{
            top: `${(100 / (rules.length + 1)) * (idx + 1)}%`,
            background: "#d4380d",
          }}
        >
          <div style={{ fontSize: 10, color: "#d4380d", marginLeft: 18 }}>
            {rule.condition ? rule.condition : `Rule ${idx + 1}`}
          </div>
        </Handle>
      ))}
      <Modal
        open={modalOpen}
        title="Configure Router Stage"
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        okText="Save"
        cancelText="Cancel"
        destroyOnClose
        width={480}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            rules:
              data.rules && data.rules.length > 0
                ? data.rules
                : [{ condition: "" }],
          }}
        >
          <Form.List name="rules">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, idx) => (
                  <Space
                    key={field.key}
                    align="baseline"
                    style={{ display: "flex", marginBottom: 8 }}
                  >
                    <Form.Item
                      {...field}
                      label={idx === 0 ? "Condition" : ""}
                      name={[field.name, "condition"]}
                      rules={[
                        { required: true, message: "Please enter a condition" },
                      ]}
                    >
                      <Input placeholder="Condition" />
                    </Form.Item>
                    {fields.length > 1 && (
                      <Button
                        icon={<DeleteOutlined />}
                        onClick={() => remove(field.name)}
                        type="text"
                        danger
                      />
                    )}
                  </Space>
                ))}
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => add({ condition: "" })}
                  type="dashed"
                  block
                >
                  Add Rule
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </Card>
  );
};
