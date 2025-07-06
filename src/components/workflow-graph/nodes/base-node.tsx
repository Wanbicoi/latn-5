import { Handle, HandleProps } from "@xyflow/react";
import { Card, Space } from "antd";
import React from "react";

export type BaseHandleProps = {
  style?: React.CSSProperties;
  children?: React.ReactNode;
} & HandleProps;

export type BaseNodeProps = {
  data: {
    label?: string;
    icon?: React.ReactNode;
    handles?: BaseHandleProps[];
  };
  selected: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
};

export const BaseNode: React.FC<BaseNodeProps> = ({
  data,
  selected,
  children,
  style,
}) => {
  return (
    <Card
      title={
        <Space>
          {data.icon}
          {data.label}
        </Space>
      }
      size="small"
      style={{
        border: selected ? "2px solid #1890ff" : "1px solid #d9d9d9",
        minWidth: 60,
        ...style,
      }}
    >
      {data.handles?.map((handle) => (
        <Handle
          key={handle.id}
          {...handle}
          style={{ width: 8, height: 8, ...handle.style }}
        />
      ))}
      {children}
    </Card>
  );
};
