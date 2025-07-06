import { useEffect, useMemo } from "react";
import { Card, Tabs } from "antd";
import { WorkflowTab } from "./workflow-tab";
import { TasksTab } from "./tasks-tab";
import { ResultsTab } from "./results-tab";
import { AssigneeMetricsTab } from "./assignee-metrics-tab";
import { SettingsTab } from "./settings-tab";
import { useNavigate, useParams } from "react-router";
import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

const TAB_KEYS = [
  "workflow",
  "tasks",
  "results",
  "assignee-metrics",
  // "settings",
];

export function ProjectsShow() {
  const navigate = useNavigate();
  const params = useParams();
  const { id, tab } = params as { id?: string; tab?: string };

  useEffect(() => {
    if (id && (!tab || !TAB_KEYS.includes(tab))) {
      navigate(`/projects/show/${id}/workflow`, { replace: true });
    }
  }, [id, tab, navigate]);

  const activeKey = useMemo(() => {
    if (tab && TAB_KEYS.includes(tab)) return tab;
    return "workflow";
  }, [tab]);

  const handleTabChange = (key: string) => {
    if (id) {
      navigate(`/projects/show/${id}/${key}`);
    }
  };

  return (
    <Card>
      <Tabs
        tabBarExtraContent={
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/projects")}
          >
            Back to Projects
          </Button>
        }
        activeKey={activeKey}
        onChange={handleTabChange}
        items={[
          {
            key: "workflow",
            label: "Workflow",
            children: <WorkflowTab />,
          },
          {
            key: "tasks",
            label: "Tasks",
            children: <TasksTab />,
          },
          {
            key: "results",
            label: "Results",
            children: <ResultsTab />,
          },
          {
            key: "assignee-metrics",
            label: "Assignee Metrics",
            children: <AssigneeMetricsTab />,
          },
          // {
          //   key: "settings",
          //   label: "Settings",
          //   children: <SettingsTab />,
          // },
        ]}
      />
    </Card>
  );
}
