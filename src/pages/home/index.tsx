import { Column, Pie, PieConfig } from "@ant-design/charts";
import { ArrowRightOutlined, RightOutlined } from "@ant-design/icons";
import { useTable } from "@refinedev/antd";
import { useList, Link } from "@refinedev/core";
import {
  Button,
  Col,
  Flex,
  Progress,
  Row,
  Spin,
  Table,
  Typography,
} from "antd";

type Props = {};

export default function Home({}: Props) {
  return (
    <div>
      <Flex>
        <div>
          <Typography.Title level={2}>Task progress</Typography.Title>
          <TaskProgress />
        </div>
        <div style={{ flexGrow: 1 }}>
          <Typography.Title level={2}>Labelers</Typography.Title>
          <Labelers />
        </div>
      </Flex>
    </div>
  );
}

const TaskProgress = () => {
  const { data: taskProgressData, isLoading } = useList({
    resource: "hd_task_progress",
  });
  const data = Object.entries(taskProgressData?.data?.[0] ?? {}).map(
    ([key, value]) => ({
      type: key,
      value: value,
    })
  );
  if (isLoading) return <Spin tip="Loading" fullscreen />;
  const config: PieConfig = {
    theme: "dark",
    data,
    angleField: "value",
    colorField: "type",
    radius: 0.8,
    label: {
      text: (d: any) => `${d.type}\n ${d.value}`,
      position: "outside",
    },
    legend: {
      color: {
        title: false,
        position: "right",
        rowPadding: 5,
      },
    },
  };
  return <Pie {...config} height={400} width={400} />;
};

function Labelers() {
  const { tableProps } = useTable({
    resource: "hd_home_labelers",
  });

  return (
    <>
      <Table {...tableProps} rowKey="id" style={{ marginTop: 40 }}>
        <Table.Column
          title="Labeler"
          width={200}
          render={(_, { first_name, last_name }) =>
            `${first_name} ${last_name}`
          }
        />
        <Table.Column
          title="Task progress"
          render={(_, { num_tasks, num_done_tasks }) => (
            <Progress percent={(num_done_tasks / num_tasks) * 100} />
          )}
        />
      </Table>
      <Link to="/projects">
        <Button type="primary" icon={<ArrowRightOutlined />} iconPosition="end">
          Start labeling
        </Button>
      </Link>
    </>
  );
}

// function Projects() {
//   return <div></div>;
// }
