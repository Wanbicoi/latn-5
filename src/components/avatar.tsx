import React from "react";
import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { getColorFromChar } from "@/utils/get-color-from-char";

interface UserAvatarProps {
  userName?: string | null;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ userName }) => (
  <Avatar
    icon={!userName && <UserOutlined />}
    style={{
      backgroundColor: userName ? getColorFromChar(userName) : undefined,
    }}
  >
    {userName?.charAt(0)?.toUpperCase()}
  </Avatar>
);
