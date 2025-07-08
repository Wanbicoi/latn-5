import React from "react";
import { Table, TableProps } from "antd";

type FormItemTableProps = TableProps & {
  value?: string[]; // selected keys
  onChange?: (selectedKeys: string[]) => void;
  disabled?: boolean; // disable selection
};

const FormItemTable: React.FC<FormItemTableProps> = ({
  value = [],
  onChange,
  disabled = false,
  ...props
}) => {
  return (
    <Table
      {...props}
      rowKey="id"
      rowSelection={
        disabled
          ? undefined
          : {
              type: "checkbox",
              selectedRowKeys: value,
              onChange: (selectedRowKeys: React.Key[]) => {
                onChange?.(selectedRowKeys as string[]);
              },
            }
      }
      // pagination={false}
    />
  );
};

export default FormItemTable;
