// Permissions List Page (read-only)
import { List } from "@refinedev/antd";
import { Table, Tag } from "antd";
import { useTable } from "@refinedev/antd";

import { useMemo } from "react";
import {
  CheckCircleFilled,
  CheckCircleOutlined,
  CheckCircleTwoTone,
} from "@ant-design/icons";
import { al } from "react-router/dist/development/route-data-5OzAzQtT";

export const PermissionsList = () => {
  const { tableProps } = useTable({
    resource: "permissions",
    syncWithLocation: false,
    pagination: {
      pageSize: 1000,
    },
  });

  const { dataSource = [] } = tableProps;

  const roles = useMemo(
    () => Array.from(new Set(dataSource.map((item: any) => item.role_name))),
    [dataSource]
  );
  const resources = useMemo(
    () => Array.from(new Set(dataSource.map((item: any) => item.resource))),
    [dataSource]
  );
  const actions = useMemo(
    () => Array.from(new Set(dataSource.map((item: any) => item.action))),
    [dataSource]
  );

  // Build matrix: resource + action -> role -> true/false
  const matrix = useMemo(() => {
    const map: Record<string, Record<string, boolean>> = {};
    resources.forEach((resource: string) => {
      actions.forEach((action: string) => {
        const key = `${resource}:${action}`;
        map[key] = {};
        roles.forEach((role: string) => {
          map[key][role] = dataSource.some(
            (item: any) =>
              item.resource === resource &&
              item.action === action &&
              item.role_name === role
          );
        });
      });
    });
    return map;
  }, [dataSource, resources, actions, roles]);

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
    roles.forEach((role) => {
      row[role] = matrix[key]?.[role] ?? false;
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
      fixed: "left" as const,
      render: (value: string) => <Tag color="geekblue">{value}</Tag>,
    },
    ...roles.map((role: string) => ({
      title: String(role),
      dataIndex: String(role),
      align: "center" as const,
      render: (value: boolean) =>
        value && <CheckCircleTwoTone twoToneColor="#52c41a" />,
    })),
  ];

  return (
    <List>
      <Table
        size="small"
        columns={columns}
        dataSource={data}
        rowKey="key"
        scroll={{ x: true }}
        pagination={false}
      />
    </List>
  );
};

export default PermissionsList;
