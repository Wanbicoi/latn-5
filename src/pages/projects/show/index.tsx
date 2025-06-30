import { useEffect, useMemo } from "react";
import { Card, Tabs } from "antd";
import { WorkflowTab } from "./workflow-tab";
import { TasksTab } from "./tasks-tab";
import { OverviewTab } from "./overview-tab";
import { SettingsTab } from "./settings-tab";
import { useNavigate, useParams } from "react-router";

const TAB_KEYS = ["workflow", "tasks", "overview", "settings"];

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
            key: "overview",
            label: "Overview",
            children: <OverviewTab />,
          },
          {
            key: "settings",
            label: "Settings",
            children: <SettingsTab />,
          },
        ]}
      />
    </Card>
  );
}
