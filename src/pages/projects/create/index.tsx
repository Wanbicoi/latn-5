import FormItemTable from "@/components/form-item/table";
import { getColorOptions } from "@/utils/colors";
import { useOhifViewer } from "@/contexts/ohif-viewer";
import { CloseOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import { Create, Edit, useForm, useSelect } from "@refinedev/antd";
import { useCustomMutation, useList, useParsed } from "@refinedev/core";
import {
  Button,
  Card,
  Form,
  Input,
  Select,
  Table,
  Tooltip,
  Space,
  Tag,
} from "antd";
import { useNavigate } from "react-router";

export const ProjectsCreate = ({ isEdit }: { isEdit?: boolean }) => {
  const { mutate } = useCustomMutation({});

  const navigate = useNavigate(); // Initialize useNavigate
  const { id } = useParsed();
  const { formProps, saveButtonProps } = useForm({
    resource: "hd_project_show",
    id,
    action: isEdit ? "edit" : "create",
  });

  const handleFinish = (values: any) => {
    mutate(
      {
        url: "hd_create_project",
        method: "post",
        values: {
          name: values.name,
          batches: values.batches ?? [],
          project_id: id,
          tags: values.tags ?? [],
        },
        successNotification: {
          message: isEdit ? "Updated!" : "Created!",
          type: "success",
        },
      },
      {
        onSuccess: () => navigate("/projects"),
      }
    );
  };

  const ProjectForm = () => (
    <Form
      {...formProps}
      onFinish={handleFinish}
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 18 }}
    >
      <Form.Item
        label="Project title"
        name={["name"]}
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Tags"
        name="tags"
        normalize={(value) => {
          console.log("Tags value:", value);
          return value || [];
        }}
      >
        <TagsSelect />
      </Form.Item>
      <Batches />
    </Form>
  );

  return isEdit ? (
    <Edit saveButtonProps={saveButtonProps}>
      <ProjectForm />
    </Edit>
  ) : (
    <Create saveButtonProps={saveButtonProps}>
      <ProjectForm />
    </Create>
  );
};

function Batches() {
  const { selectProps: selectAssigneesProps } = useSelect({
    resource: "hd_profile_list",
    optionValue: "id",
    optionLabel: (item: {
      id: string;
      last_name: string;
      first_name: string;
      role: string;
    }) =>
      `${item.first_name} ${item.last_name} - ${capitalizeFirstCharRegex(
        item.role
      )}`,
  });
  const { data: orthancResourceData } = useList({
    resource: "hd_orthanc_resources_list",
  });
  const { setSelectedTask } = useOhifViewer();

  return (
    <Form.List name="batches">
      {(fields, { add, remove }, { errors }) => (
        <>
          {fields.map((field) => (
            <Card
              size="small"
              title={`Batch ${field.name + 1}`}
              key={field.key}
              extra={<CloseOutlined onClick={() => remove(field.name)} />}
              style={{ marginBottom: 16 }}
            >
              <Form.Item
                {...field}
                label="Title"
                name={[field.name, "title"]}
                rules={[
                  {
                    required: true,
                    message:
                      "Please input passenger's name or delete this field.",
                  },
                ]}
              >
                <Input placeholder="Title" style={{ width: "60%" }} />
              </Form.Item>
              <Form.Item
                {...field}
                name={[field.name, "resources"]}
                label="CTs"
              >
                <FormItemTable
                  size="small"
                  dataSource={orthancResourceData?.data}
                  rowKey={"StudyInstanceUID"}
                  expandable={{
                    expandedRowRender: (record) =>
                      record.RequestedProcedureDescription,
                  }}
                >
                  <Table.Column dataIndex="PatientID" title="Patient ID" />
                  <Table.Column dataIndex="PatientName" title="Patient Name" />
                  <Table.Column dataIndex="PatientSex" title="Sex" width={60} />
                  <Table.Column
                    dataIndex="AccessionNumber"
                    title="Accession #"
                  />
                  <Table.Column
                    dataIndex="ReferringPhysicianName"
                    title="Referring Physician"
                  />
                  <Table.Column
                    width={30}
                    dataIndex="StudyInstanceUID"
                    render={(StudyInstanceUID) => (
                      <Tooltip title="Preview" placement="right">
                        <Button
                          type="link"
                          icon={<EyeOutlined />}
                          onClick={() => setSelectedTask({ StudyInstanceUID })}
                        />
                      </Tooltip>
                    )}
                  />
                </FormItemTable>
              </Form.Item>
              <Form.Item
                {...field}
                name={[field.name, "assignees"]}
                label="Assignees"
              >
                <Select
                  {...selectAssigneesProps}
                  onSearch={undefined}
                  optionFilterProp="label"
                  filterOption={true}
                  mode="multiple"
                  placeholder="Assignees"
                  style={{ width: "60%" }}
                />
              </Form.Item>
            </Card>
          ))}
          <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
            <Button
              type="dashed"
              onClick={() => add()}
              style={{ width: "60%" }}
              icon={<PlusOutlined />}
            >
              Add batch
            </Button>
            <Form.ErrorList errors={errors} />
          </Form.Item>
        </>
      )}
    </Form.List>
  );
}

function capitalizeFirstCharRegex(str: string) {
  if (typeof str !== "string" || str.length === 0) {
    return str;
  }
  return str.replace(/^./, str[0].toUpperCase());
}

function TagsSelect(props: any) {
  const { selectProps: selectTagsProps, query } = useSelect({
    resource: "hd_tags",
  });
  const options = query.data?.data.map((item) => ({
    label: item.title,
    value: item.id,
  }));

  const tagRender = (props: any) => {
    const { label, value, closable, onClose } = props;
    const tag = query.data?.data.find((item: any) => item.id === value);

    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };

    return (
      <Tag
        color={tag?.color}
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
        style={{ marginInlineEnd: 4 }}
      >
        {label}
      </Tag>
    );
  };

  return (
    <Select
      {...selectTagsProps}
      options={options}
      {...props}
      mode="multiple"
      style={{ width: "60%" }}
      placeholder="Select tags"
      tagRender={tagRender}
    />
  );
}
