// StartNode: entry node for selected data to be annotated
import { useOhifViewer } from "@/contexts/ohif-viewer";
import {
  EyeOutlined,
  PlayCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useList } from "@refinedev/core";
import { Button, Card, Form, Modal, Table, TableProps, Tooltip } from "antd";
import React, { useState } from "react";
import { Handle, Position } from "reactflow";

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

  const { data: orthancResourceData } = useList({
    resource: "resources",
  });
  const { setSelectedTask } = useOhifViewer();

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
        width={900}
        height={600}
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
          <Form.Item name={["resources"]} label="Select data for the workflow">
            <FormItemTable
              size="small"
              dataSource={orthancResourceData?.data}
              rowKey={"StudyInstanceUID"}
              expandable={{
                expandedRowRender: (record) =>
                  record.RequestedProcedureDescription,
              }}
            >
              <Table.Column dataIndex="PatientID" title="Patient ID" />
              <Table.Column dataIndex="PatientName" title="Patient Name" />
              <Table.Column dataIndex="PatientSex" title="Sex" width={60} />
              <Table.Column dataIndex="AccessionNumber" title="Accession #" />
              <Table.Column
                dataIndex="ReferringPhysicianName"
                title="Referring Physician"
              />
              <Table.Column
                width={30}
                dataIndex="StudyInstanceUID"
                render={(StudyInstanceUID) => (
                  <Tooltip title="Preview" placement="right">
                    <Button
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={() => setSelectedTask({ StudyInstanceUID })}
                    />
                  </Tooltip>
                )}
              />
            </FormItemTable>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

type FormItemTableProps = TableProps & {
  value?: string[]; // selected keys
  onChange?: (selectedKeys: string[]) => void;
};

const FormItemTable: React.FC<FormItemTableProps> = ({
  value = [],
  onChange,
  ...props
}) => {
  return (
    <Table
      {...props}
      rowKey="id"
      rowSelection={{
        type: "checkbox",
        selectedRowKeys: value,
        onChange: (selectedRowKeys: React.Key[]) => {
          onChange?.(selectedRowKeys as string[]);
        },
      }}
      // pagination={false}
    />
  );
};
