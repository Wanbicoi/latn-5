import { CheckCircleOutlined } from "@ant-design/icons";
import React from "react";
import { Position } from "@xyflow/react";
import { BaseNode, BaseNodeProps } from "./base-node";

export const SuccessNode: React.FC<Omit<BaseNodeProps, "data">> = (props) => {
  return (
    <BaseNode
      {...props}
      data={{
        label: "Success",
        icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
        handles: [
          {
            type: "target",
            position: Position.Left,
          },
        ],
      }}
    />
  );
};
