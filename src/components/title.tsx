import { TitleProps, Link } from "@refinedev/core";
import { Space, Typography } from "antd";

export default function Title({ collapsed }: TitleProps) {
  return (
    <Link to="/">
      <Space>
        <img src="/meditask.ico" alt="MediFlow" height={32} width={32} />
        {!collapsed && (
          <Typography.Title level={3} style={{ margin: 0 }}>
            MediFlow
          </Typography.Title>
        )}
      </Space>
    </Link>
  );
}
