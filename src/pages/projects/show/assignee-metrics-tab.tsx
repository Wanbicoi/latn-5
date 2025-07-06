import { UserAvatar } from "@/components/avatar";
import { Bar } from "@ant-design/plots";
import { useList, useParsed } from "@refinedev/core";
import { Card, Col, Row, Space, Statistic, Table } from "antd";

export function AssigneeMetricsTab() {
  const { id: projectId } = useParsed();

  const { data, isLoading } = useList({
    resource: "project_assignee_metrics",
    filters: [{ field: "project_id", operator: "eq", value: projectId }],
  });

  const performanceData: {
    assignee_avatar_url: string;
    assignee_name: string;
    total_tasks_completed: number;
    total_duration_seconds: number;
    avg_duration_seconds: number;
  }[] = (data?.data as any) || [];

  // Calculate overall project stats
  const totalTasks = performanceData.reduce(
    (sum, item) => sum + item.total_tasks_completed,
    0
  );
  const totalAssignees = performanceData.length;
  const totalDuration = performanceData.reduce(
    (sum, item) => sum + item.total_duration_seconds,
    0
  );
  const avgTaskTime = totalTasks > 0 ? totalDuration / totalTasks : 0;

  const barChartConfig = {
    data: performanceData,
    xField: "total_duration_seconds",
    yField: "assignee_name",
    seriesField: "assignee_name",
    legend: { position: "top-left" },
  };

  const columns = [
    {
      title: "Assignee",
      dataIndex: "assignee_name",
      render: (userName: string) => (
        <Space>
          <UserAvatar userName={userName} />
          {userName}
        </Space>
      ),
    },
    { title: "Tasks Completed", dataIndex: "total_tasks_completed" },
    {
      title: "Total Time (minutes)",
      dataIndex: "total_duration_seconds",
      render: (seconds: number) => (seconds / 60).toFixed(2),
    },
    {
      title: "Avg. Time per Task (seconds)",
      dataIndex: "avg_duration_seconds",
      render: (seconds: number) => seconds.toFixed(2),
    },
  ];

  return (
    <>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="Total Assignees" value={totalAssignees} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Tasks Completed" value={totalTasks} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Time (hours)"
              value={(totalDuration / 3600).toFixed(2)}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Avg. Task Time (minutes)"
              value={(avgTaskTime / 60).toFixed(2)}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: "24px" }}>
        <Col span={24}>
          <Card title="Time Spent per Assignee (seconds)">
            <Bar {...barChartConfig} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: "24px" }}>
        <Col span={24}>
          <Card title="Performance Details">
            <Table
              size="middle"
              dataSource={performanceData}
              columns={columns}
              rowKey="assignee_id"
              loading={isLoading}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
}
