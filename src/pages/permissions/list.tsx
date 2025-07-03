import { List } from "@refinedev/antd";
import { Button, Table, Tag } from "antd";
import { useTable } from "@refinedev/antd";

import { useMemo } from "react";
import { CheckCircleTwoTone, CloseCircleOutlined } from "@ant-design/icons";
import { useCustomMutation, useInvalidate } from "@refinedev/core";

export const PermissionsList = () => {
  const {
    tableProps,
    tableQuery: { isFetching },
  } = useTable({
    resource: "permissions",
    syncWithLocation: false,
    pagination: {
      mode: "off",
    },
  });

  const { dataSource = [] } = tableProps;

  const resources = useMemo(
    () => Array.from(new Set(dataSource.map((item: any) => item.resource))),
    [dataSource]
  );
  const actions = useMemo(
    () => Array.from(new Set(dataSource.map((item: any) => item.action))),
    [dataSource]
  );

  // Build matrix: resource + action -> role_id -> true/false
  const roleIds = useMemo<string[]>(() => {
    return Array.from(new Set(dataSource.map((item: any) => item.role_id)));
  }, [dataSource]);

  const roleIdNameMap = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    dataSource.forEach((item: any) => {
      map[item.role_id] = item.role_name;
    });
    return map;
  }, [dataSource]);

  const matrix = useMemo(() => {
    const map: Record<string, Record<string, boolean>> = {};
    resources.forEach((resource: string) => {
      actions.forEach((action: string) => {
        const key = `${resource}:${action}`;
        map[key] = {};
        roleIds.forEach((roleId: string) => {
          map[key][roleId] = dataSource.some(
            (item: any) =>
              item.resource === resource &&
              item.action === action &&
              item.role_id === roleId
          );
        });
      });
    });
    return map;
  }, [dataSource, resources, actions, roleIds]);

  // Calculate rowSpan for resource grouping
  const groupedData = dataSource
    .map((item: any) => ({
      resource: item.resource,
      action: item.action,
    }))
    .filter(
      (v: any, i: number, arr: any[]) =>
        arr.findIndex(
          (x) => x.resource === v.resource && x.action === v.action
        ) === i
    );

  // Add rowSpan info
  const resourceCounts: Record<string, number> = {};
  groupedData.forEach((row: any) => {
    resourceCounts[row.resource] = (resourceCounts[row.resource] || 0) + 1;
  });

  let resourceRowIndex: Record<string, number> = {};
  const data = groupedData.map((row: any, idx: number) => {
    const key = `${row.resource}:${row.action}`;
    roleIds.forEach((roleId: string) => {
      row[roleId] = matrix[key]?.[roleId] ?? false;
    });
    row.key = key;
    // Row span logic
    if (resourceRowIndex[row.resource] === undefined) {
      resourceRowIndex[row.resource] = idx;
      row.resourceRowSpan = resourceCounts[row.resource];
    } else {
      row.resourceRowSpan = 0;
    }
    return row;
  });

  const { mutate } = useCustomMutation({});
  const invalidate = useInvalidate();

  const columns = [
    {
      title: "Resource",
      dataIndex: "resource",
      width: 120,
      onCell: (record: any) => ({
        rowSpan: record.resourceRowSpan,
      }),
      render: (value: string) => value,
      fixed: "left" as const,
    },
    {
      title: "Action",
      dataIndex: "action",
      width: 150,
      fixed: "left" as const,
      render: (value: string) => <Tag color="geekblue">{value}</Tag>,
    },
    ...roleIds.map((roleId: string) => {
      const roleName = roleIdNameMap[roleId] || roleId;
      return {
        title: roleName,
        dataIndex: String(roleId),
        align: "center" as const,
        render: (value: boolean, record: any) => (
          <Button
            style={{ cursor: "pointer" }}
            onClick={async () =>
              mutate(
                {
                  url: "permissions_toggle",
                  method: "post",
                  values: {
                    role_id: roleId,
                    resource: record.resource,
                    action: record.action,
                  },
                },
                {
                  onSuccess: () =>
                    invalidate({
                      resource: "permissions",
                      invalidates: ["resourceAll"],
                    }),
                }
              )
            }
            type="text"
            shape="circle"
            icon={
              value ? (
                <CheckCircleTwoTone twoToneColor="#52c41a" />
              ) : (
                <CloseCircleOutlined />
              )
            }
          />
        ),
      };
    }),
  ];

  return (
    <List>
      <Table
        {...tableProps}
        scroll={{ y: 600 }}
        size="small"
        columns={columns}
        dataSource={data}
        rowKey="key"
        loading={isFetching}
      />
    </List>
  );
};

export default PermissionsList;
