import React, { useState } from "react";
import { Position } from "@xyflow/react";
import { SettingOutlined, ApartmentOutlined } from "@ant-design/icons";
import { Modal, Form, Input } from "antd";
import { BaseNode } from "./base-node";

type MitlNodeProps = {
  id: string;
  data: {
    api_endpoint?: string;
    onChange?: (data: any) => void;
  };
  selected: boolean;
};

export const MitlNode: React.FC<MitlNodeProps> = ({ data, selected }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
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
    <>
      <BaseNode
        selected={selected}
        data={{
          label: "MITL",
          icon: <ApartmentOutlined />,
          handles: [
            { type: "target", position: Position.Left },
            { type: "source", position: Position.Right },
          ],
        }}
      >
        <SettingOutlined
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            cursor: "pointer",
            fontSize: 16,
          }}
          onClick={handleOpen}
        />
      </BaseNode>
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
    </>
  );
};
