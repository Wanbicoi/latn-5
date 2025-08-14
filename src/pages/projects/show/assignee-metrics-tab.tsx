import { UserAvatar } from "@/components/avatar";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useList, useParsed } from "@refinedev/core";
import { Card, Col, Row, Space, Statistic, Table } from "antd";

export function AssigneeMetricsTab() {
  const { id: projectId } = useParsed();

  const { data, isLoading } = useList({
    resource: "project_assignee_metrics",
    filters: [{ field: "project_id", operator: "eq", value: projectId }],
  });

  interface AssigneeMetrics {
    assignee_avatar_url: string;
    assignee_name: string;
    total_tasks_completed: number;
    total_duration_seconds: number;
    avg_task_duration_seconds: number;
    dataset_count: number;
    avg_dataset_duration_seconds: number;
    project_total_tasks_completed: number;
    project_total_duration_seconds: number;
    project_total_dataset_count: number;
    project_avg_task_duration_seconds: number;
    project_avg_dataset_duration_seconds: number;
  }

  const performanceData: AssigneeMetrics[] = (data?.data as any) || [];

  // Get project stats from first row (all rows have same project totals)
  const projectStats = performanceData[0];
  const totalAssignees = performanceData.length;

  const formatSecondsToHMS = (totalSeconds: number) => {
    const secondsInt = Math.round(totalSeconds || 0);
    const hours = Math.floor(secondsInt / 3600);
    const minutes = Math.floor((secondsInt % 3600) / 60);
    const seconds = secondsInt % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  // Recharts-based vertical bar chart config is expressed via JSX below

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
      title: "Total Time",
      dataIndex: "total_duration_seconds",
      render: (seconds: number) => formatSecondsToHMS(seconds),
    },
    {
      title: "Avg. Time per Task",
      dataIndex: "avg_task_duration_seconds",
      render: (seconds: number) => formatSecondsToHMS(seconds),
    },
    {
      title: "Total Image Sets",
      dataIndex: "dataset_count",
      render: (val: number) => val ?? 0,
    },
    {
      title: "Avg. Time per Image Set",
      dataIndex: "avg_dataset_duration_seconds",
      render: (seconds: number) => formatSecondsToHMS(seconds),
    },
  ];

  return (
    <>
      <Row gutter={16}>
        <Col span={4}>
          <Card>
            <Statistic title="Total Assignees" value={totalAssignees} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Tasks Completed"
              value={projectStats?.project_total_tasks_completed || 0}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Total Time (h)"
              value={(
                (projectStats?.project_total_duration_seconds || 0) / 3600
              ).toFixed(2)}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Avg. Task Time (m)"
              value={(
                (projectStats?.project_avg_task_duration_seconds || 0) / 60
              ).toFixed(2)}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Total Image Sets"
              value={projectStats?.project_total_dataset_count || 0}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Avg. Image Set Time (m)"
              value={(
                (projectStats?.project_avg_dataset_duration_seconds || 0) / 60
              ).toFixed(2)}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: "24px" }}>
        <Col span={24}>
          <Card title="Time Spent per Assignee">
            <div style={{ width: "100%", height: 360 }}>
              <ResponsiveContainer>
                <BarChart
                  data={performanceData}
                  layout="vertical"
                  margin={{ top: 16, right: 24, bottom: 16, left: 24 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    tickFormatter={(sec: number) =>
                      `${(sec / 3600).toFixed(1)}h`
                    }
                  />
                  <YAxis type="category" dataKey="assignee_name" width={150} />
                  <Tooltip
                    formatter={(value: number) => [
                      formatSecondsToHMS(Number(value)),
                      "Total Time",
                    ]}
                  />
                  <Legend />
                  <Bar
                    dataKey="total_duration_seconds"
                    name="Total Time"
                    fill="#8884d8"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
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
