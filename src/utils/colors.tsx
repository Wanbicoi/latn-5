import React from "react";
import { Space, Tag } from "antd";

export const TAG_COLORS = [
  "#1890ff", // blue
  "#52c41a", // green
  "#faad14", // orange
  "#f5222d", // red
  "#722ed1", // purple
  "#13c2c2", // cyan
  "#eb2f96", // magenta
] as const;

export type TagColor = (typeof TAG_COLORS)[number];

const colorToName = (color: TagColor) => {
  switch (color) {
    case "#1890ff":
      return "Blue";
    case "#52c41a":
      return "Green";
    case "#faad14":
      return "Orange";
    case "#f5222d":
      return "Red";
    case "#722ed1":
      return "Purple";
    case "#13c2c2":
      return "Cyan";
    case "#eb2f96":
      return "Magenta";
    default:
      return "";
  }
};

export const getColorOptions = () => {
  return TAG_COLORS.map((color) => ({
    value: color,
    label: (
      <Space>
        <Tag color={color}>{colorToName(color)}</Tag>
      </Space>
    ),
  }));
};
