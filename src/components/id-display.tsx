// Shared component to display an ID with truncation and a copy button

import React from "react";
import { Button, Space, Tooltip, message } from "antd";
import { CopyOutlined } from "@ant-design/icons";

type IdDisplayProps = {
  id: string;
  length?: number; // Optional: how many chars to show at start/end
};

export const IdDisplay: React.FC<IdDisplayProps> = ({ id, length = 4 }) => {
  if (!id) return null;

  const truncated =
    id.length <= length * 2 + 2 ? id : `${id.slice(0, length)}...`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(id);
      message.success("Copied!");
    } catch {
      message.error("Copy failed");
    }
  };

  return (
    <Space>
      <Tooltip title={id}>
        <span style={{ fontFamily: "monospace" }}>{truncated}</span>
      </Tooltip>
      <Tooltip title="Copy">
        <Button
          icon={<CopyOutlined />}
          size="small"
          onClick={handleCopy}
          type="text"
        />
      </Tooltip>
    </Space>
  );
};
