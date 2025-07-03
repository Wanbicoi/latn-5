import React from "react";
import {
  useInfiniteList,
  useInvalidate,
  useSubscription,
} from "@refinedev/core";
import {
  Button,
  Drawer,
  List,
  Modal,
  Typography,
  theme,
  Dropdown,
  Tag,
} from "antd";
import type { MenuProps } from "antd";
import { MenuInfo } from "rc-menu/lib/interface";
import { DateField } from "@refinedev/antd";
import {
  MoreOutlined,
  EyeOutlined,
  CloseOutlined,
  DeleteOutlined,
  DeleteFilled,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import { supabaseClient } from "@/utils";
import { useOhifViewer } from "../../../contexts/ohif-viewer";
import { UserAvatar } from "../../avatar";
import { IdDisplay } from "@/components/id-display";
const { useToken } = theme;

interface NotificationProps {
  open: boolean;
  onClose: () => void;
  notificationCount: number;
}

const handleDeleteSegmentationFromOrthanc = async (
  seriesInstanceUID: string
) => {
  try {
    const ORTHANC_SERVER_URL = import.meta.env.VITE_ORTHANC_SERVER_URL;
    const getOrthancSeriesUuidUrl = ORTHANC_SERVER_URL + "/tools/find";
    const findSeriesUUID = await fetch(getOrthancSeriesUuidUrl, {
      method: "POST",
      body: JSON.stringify({
        Level: "Series",
        Query: {
          SeriesInstanceUID: seriesInstanceUID,
        },
      }),
    });
    const seriesUUIDs = await findSeriesUUID.json();
    if (!seriesUUIDs || !seriesUUIDs[0]) return;

    const deleteUrl = `${ORTHANC_SERVER_URL}/series/${seriesUUIDs[0]}`;

    await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        Accept: "application/dicom+json",
      },
    });
  } catch (error) {}
};

export const NotificationComponent: React.FC<NotificationProps> = ({
  open,
  onClose,
}) => {
  const { token } = useToken();
  const [selectedItemForDeletion, setSelectedItemForDeletion] = React.useState<{
    refId: string;
    notificationId: string;
  } | null>(null);
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const invalidate = useInvalidate();

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isFetching } =
    useInfiniteList({
      resource: "notifications",
      pagination: {
        pageSize: 10,
      },
    });

  useSubscription({
    channel: "resources/_notifications",
    onLiveEvent: () => {
      invalidate({
        resource: "notifications",
        invalidates: ["resourceAll"],
      });
      invalidate({
        resource: "notifications_count",
        invalidates: ["resourceAll"],
      });
    },
    types: ["*"],
  });

  const handleViewedCheck = async (id: string, currentState: boolean) => {
    await supabaseClient
      .from("_notifications")
      .update({ viewed: !currentState })
      .eq("id", id);

    invalidate({
      resource: "notifications",
      invalidates: ["resourceAll"],
    });

    invalidate({
      resource: "notifications_count",
      invalidates: ["resourceAll"],
    });
  };

  const handleDeleteNotification = async (id: string) => {
    await supabaseClient.from("_notifications").delete().eq("id", id);

    invalidate({
      resource: "notifications",
      invalidates: ["resourceAll"],
    });
  };

  const handleUpdateSegmentationRequest = async (
    refId: string,
    notificationId: string,
    action: "approve" | "reject"
  ) => {
    if (action === "approve") {
      await supabaseClient
        .from("_notifications")
        .update({
          viewed: true,
        })
        .eq("id", notificationId);
      setSelectedItemForDeletion({ refId, notificationId });
    } else {
      await supabaseClient
        .from("_notifications")
        .update({
          viewed: true,
          type: "SEGMENT_REQUEST_REMOVE_REJECTED",
        })
        .eq("id", notificationId);
    }

    invalidate({
      resource: "notifications",
      invalidates: ["resourceAll"],
    });
  };

  const { setSelectedTask } = useOhifViewer();

  const getNotificationStatusTag = (type: string) => {
    switch (type) {
      case "SEGMENT_REQUEST_REMOVE_APPROVED":
        return <Tag color="success">Approved</Tag>;
      case "SEGMENT_REQUEST_REMOVE_REJECTED":
        return <Tag color="error">Rejected</Tag>;
      default:
        return null;
    }
  };

  const contentStyle: React.CSSProperties = {
    backgroundColor: token.colorBgElevated,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowSecondary,
  };

  const menuStyle: React.CSSProperties = {
    boxShadow: "none",
  };

  const getMenuItems = (item: any): MenuProps["items"] => {
    const baseItems: MenuProps["items"] = [];

    if (item.type === "SEGMENT_REQUEST_REMOVE") {
      baseItems.push(
        // {
        //   key: "preview",
        //   label: "Preview",
        //   icon: <EyeOutlined />,
        //   onClick: (e: MenuInfo) => {
        //     e.domEvent.stopPropagation();
        //     setSelectedTask({
        //       StudyInstanceUID: item.ref_id,
        //     });
        //     onClose();
        //   },
        // },
        {
          key: "approve",
          label: "Approve deletion",
          icon: <DeleteOutlined />,
          danger: true,
          onClick: (e: MenuInfo) => {
            e.domEvent.stopPropagation();
            handleUpdateSegmentationRequest(item.ref_id, item.id, "approve");
          },
        },
        {
          key: "reject",
          label: "Reject deletion",
          icon: <CloseOutlined />,
          onClick: (e: MenuInfo) => {
            e.domEvent.stopPropagation();
            handleUpdateSegmentationRequest(item.ref_id, item.id, "reject");
          },
        },
        {
          type: "divider",
          key: "divider",
        }
      );
    }

    baseItems.push({
      key: "delete-notification",
      label: "Delete notification",
      icon: <DeleteFilled />,
      danger: true,
      onClick: (e: MenuInfo) => {
        e.domEvent.stopPropagation();
        handleDeleteNotification(item.id);
      },
    });

    return baseItems;
  };

  return (
    <>
      <Drawer title="Notifications" open={open} onClose={onClose} width={600}>
        <List
          dataSource={data?.pages.flatMap((page) => page.data) || []}
          renderItem={(item: any) => (
            <List.Item
              style={{
                backgroundColor: !item.viewed
                  ? token.colorFillQuaternary
                  : token.colorBgContainer,
              }}
              actions={[
                getNotificationStatusTag(item.type),
                <DateField value={item.created_at} format="LLL" />,
                <Button
                  size="small"
                  type="text"
                  icon={
                    item.viewed ? <EyeInvisibleOutlined /> : <EyeOutlined />
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewedCheck(item.id, item.viewed);
                  }}
                />,
                <Dropdown
                  menu={{
                    items: getMenuItems(item),
                  }}
                  trigger={["click"]}
                  placement="bottomRight"
                  popupRender={(menu) => (
                    <div style={contentStyle}>
                      {React.cloneElement(menu as React.ReactElement, {
                        style: menuStyle,
                      })}
                    </div>
                  )}
                >
                  <Button
                    size="small"
                    type="text"
                    icon={<MoreOutlined />}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Dropdown>,
              ]}
            >
              <List.Item.Meta
                avatar={<UserAvatar userName={item.user_name} />}
                title={item.user_name || "System"}
                description={<DisplayContent content={item.content} />}
              />
            </List.Item>
          )}
          loading={isFetchingNextPage || isFetching}
          loadMore={
            hasNextPage ? (
              <div
                style={{
                  textAlign: "center",
                  marginTop: 16,
                  height: 32,
                  lineHeight: "32px",
                }}
              >
                <Button onClick={() => fetchNextPage()}>Load More</Button>
              </div>
            ) : null
          }
        />
      </Drawer>
      <Modal
        title="Confirm Deletion"
        open={!!selectedItemForDeletion}
        confirmLoading={confirmLoading}
        onOk={async () => {
          if (selectedItemForDeletion) {
            setConfirmLoading(true);
            try {
              await handleDeleteSegmentationFromOrthanc(
                selectedItemForDeletion.refId
              );
              await supabaseClient
                .from("_notifications")
                .update({
                  type: "SEGMENT_REQUEST_REMOVE_APPROVED",
                })
                .eq("id", selectedItemForDeletion.notificationId);
              invalidate({
                resource: "notifications",
                invalidates: ["resourceAll"],
              });
            } finally {
              setConfirmLoading(false);
              setSelectedItemForDeletion(null);
            }
          }
        }}
        onCancel={() => setSelectedItemForDeletion(null)}
      >
        <Typography.Text>
          Are you sure you want to delete this segmentation?
        </Typography.Text>
      </Modal>
    </>
  );
};

function DisplayContent({ content }: { content: string }) {
  // Replace #UUID in content with #<IdDisplay id=uuid length=3 />
  const uuidRegex =
    /#([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
  const match = content.match(uuidRegex);
  if (match) {
    const [before, after] = content.split(match[0]);
    return (
      <>
        {before}#<IdDisplay id={match[1]} length={3} />
        {after}
      </>
    );
  }
  return content;
}

export default NotificationComponent;
