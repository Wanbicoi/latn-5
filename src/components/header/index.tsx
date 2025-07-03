import {
  LinkOutlined,
  NotificationOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import type { RefineThemedLayoutV2HeaderProps } from "@refinedev/antd";
import { useGetIdentity, useList } from "@refinedev/core";
import {
  Layout as AntdLayout,
  Badge,
  Button,
  Space,
  Typography,
  theme,
} from "antd";
import React from "react";
import { NotificationComponent } from "./notifications";
import { useOhifViewer } from "../../contexts/ohif-viewer";
import { UserAvatar } from "../avatar";

const { Text } = Typography;
const { useToken } = theme;

export const Header: React.FC<RefineThemedLayoutV2HeaderProps> = ({
  sticky = true,
}) => {
  const { token } = useToken();
  const { data: user } = useGetIdentity<{ name: string }>();
  const { selectedTask, setSelectedTask } = useOhifViewer();

  const headerStyles: React.CSSProperties = {
    backgroundColor: token.colorBgElevated,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: "0px 24px",
    height: "64px",
  };

  if (sticky) {
    headerStyles.position = "sticky";
    headerStyles.top = 0;
    headerStyles.zIndex = 1;
  }

  const { data } = useList({
    resource: "notifications_count",
  });
  const notificationCount = data?.data?.[0]?.count || 0;

  const [openNotification, setOpenNotification] = React.useState(false);

  return (
    <>
      <AntdLayout.Header style={headerStyles}>
        <Space>
          <a href={import.meta.env.VITE_ORTHANC_ROUTE} target="_blank">
            <LinkOutlined /> Data source
          </a>
          <Badge count={notificationCount} size="small">
            <Button
              size="small"
              shape="circle"
              onClick={() => setOpenNotification(true)}
              icon={<NotificationOutlined />}
            />
          </Badge>
          <Space style={{ marginLeft: "8px" }} size="middle">
            <UserAvatar userName={user?.name} />
            <Text strong>{user?.name}</Text>
          </Space>
          {selectedTask && (
            <Button
              size="middle"
              type="dashed"
              icon={<CloseOutlined />}
              onClick={() => setSelectedTask(null)}
            >
              Close Viewer
            </Button>
          )}
        </Space>
      </AntdLayout.Header>
      <NotificationComponent
        open={openNotification}
        onClose={() => setOpenNotification(false)}
        notificationCount={notificationCount}
      />
    </>
  );
};

export default Header;
