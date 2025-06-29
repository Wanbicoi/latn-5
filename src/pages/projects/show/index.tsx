import { useEffect, useMemo } from "react";
import { Card, Tabs } from "antd";
import { WorkflowTab } from "./workflow-tab";
import { QueueTab } from "./queue-tab";
import { OverviewTab } from "./overview-tab";
import { SettingsTab } from "./settings-tab";
import { useNavigate, useParams } from "react-router";
import { Show } from "@refinedev/antd";

const TAB_KEYS = ["workflow", "queue", "overview", "settings"];

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
            key: "queue",
            label: "Queue",
            children: <QueueTab />,
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
