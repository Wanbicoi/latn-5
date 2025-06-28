import React from "react";
import { Table, TableProps } from "antd";

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

export default FormItemTable;
