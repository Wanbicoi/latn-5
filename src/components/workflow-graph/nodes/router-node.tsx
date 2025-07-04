import { BranchesOutlined, SettingOutlined } from "@ant-design/icons";
import { Button, Card, Form, InputNumber, Modal, Space } from "antd";
import React from "react";
import { Handle, Position } from "reactflow";

type RouterNodeProps = {
  selected: boolean;
  data: {
    route1: number;
    route2: number;
    onChange?: (data: any) => void;
  };
};

export const RouterNode: React.FC<RouterNodeProps> = ({ selected, data }) => {
  const [form] = Form.useForm();
  const [modal, setModal] = React.useState(false);

  const route1 = Form.useWatch("route1", form);
  React.useEffect(() => {
    if (route1 !== undefined) {
      const route2 = 100 - route1;
      form.setFieldsValue({ route2 });
    }
  }, [route1, form]);

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
    >
      <BranchesOutlined style={{ fontSize: 24, color: "#d4380d" }} />
      <div style={{ fontWeight: 600, marginTop: 8 }}>
        Router ({`${data.route1}`}/{100 - data.route1!})
        <Button
          shape="circle"
          type="text"
          onClick={() => setModal(true)}
          icon={<SettingOutlined />}
        />
      </div>
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: "#d4380d",
          width: 10,
          height: 10,
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: "#d4380d",
          width: 10,
          height: 10,
          top: "70%",
        }}
        id="approve"
      >
        <div
          style={{ fontSize: 10, color: "#d4380d", marginLeft: 12, width: 40 }}
        >
          Route 2
        </div>
      </Handle>
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: "#d4380d",
          width: 10,
          height: 10,
          top: "30%",
        }}
        id="reject"
      >
        <div
          style={{ fontSize: 10, color: "#d4380d", marginLeft: 12, width: 40 }}
        >
          Route 1
        </div>
      </Handle>
      <Modal
        title="Configure Router Stage"
        width={400}
        open={modal}
        onCancel={() => setModal(false)}
        onOk={() => {
          form.validateFields().then((values) => {
            data.onChange?.(values);
            setModal(false);
          });
        }}
      >
        <Form form={form} initialValues={data}>
          <Space>
            <Form.Item label="Route 1" name="route1">
              <InputNumber step={5} suffix="%" />
            </Form.Item>
            <Form.Item label="Route 2" name="route2">
              <InputNumber disabled step={5} suffix="%" />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </Card>
  );
};
